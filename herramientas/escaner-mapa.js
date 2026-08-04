#!/usr/bin/env node
/*
 * ESCÁNER DE DEPENDENCIAS — SchoolNet   (v2)
 * Recorre el repositorio y detecta qué archivo toca qué tabla y con qué operación.
 * No modifica nada. No se conecta a la base de datos. Solo lee y reporta.
 *
 * v2: método atado a su propia llamada (balanceo de paréntesis), funciones RPC
 *     separadas de las escrituras, y filtro de nombres que no son tablas.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = process.cwd();
const SALIDA = path.join(RAIZ, 'mapa');
const IGNORAR = new Set(['.git', 'node_modules', '.vercel', '.github', 'mapa', 'dist', 'build']);
const EXTENSIONES = new Set(['.html', '.js']);
const ESCRITURAS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

// Palabras que aparecen en posición de tabla pero no lo son
const PALABRAS_VETADAS = new Set([
  'rpc', 'count', 'sum', 'avg', 'max', 'min', 'auth', 'storage', 'graphql',
  'and', 'or', 'not', 'select', 'order', 'limit', 'offset', 'eq', 'neq',
  'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is', 'cs', 'cd',
  'true', 'false', 'null', 'function', 'return', 'const', 'let', 'var',
  'if', 'else', 'for', 'while', 'async', 'await', 'new', 'this', 'window',
  'document', 'console', 'json', 'http', 'https', 'www', 'com', 'html'
]);

// Un nombre que termina así es casi seguro una columna o un constraint
const SUFIJOS_DE_COLUMNA = /(_id|_ids|_fkey|_key|_at|_by|_url|_name|_code|_type|_status|_hex|_count|_date|_email)$/;

// Tablas reales cuyo nombre coincide con el patrón de columna. Se salvan del filtro.
const EXCEPCIONES = new Set(['student_status']);

const registros = [];
const descartados = new Map();

// ---------- Recorrido ----------

function recorrer(dir) {
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entrada of entradas) {
    if (IGNORAR.has(entrada.name)) continue;
    if (entrada.name.startsWith('.')) continue;
    const completa = path.join(dir, entrada.name);
    if (entrada.isDirectory()) recorrer(completa);
    else if (EXTENSIONES.has(path.extname(entrada.name).toLowerCase())) analizar(completa);
  }
}

function linea(texto, indice) {
  let n = 1;
  for (let i = 0; i < indice && i < texto.length; i++) if (texto[i] === '\n') n++;
  return n;
}

function moduloDe(rel) {
  const p = rel.split('/');
  if (p[0] === 'assets') return '(núcleo)';
  if (p[0] === 'modules') {
    if (p.length > 2) return p[1];
    return '(modules sin carpeta)';
  }
  if (p.length === 1) return '(raíz)';
  return p[0];
}

// ---------- Validación de nombres ----------

function esNombreDeTabla(nombre) {
  if (!nombre) return false;
  if (nombre.length < 3) return false;
  if (PALABRAS_VETADAS.has(nombre)) return false;
  if (EXCEPCIONES.has(nombre)) return true;
  if (SUFIJOS_DE_COLUMNA.test(nombre)) return false;
  if (!/^[a-z][a-z0-9_]*$/.test(nombre)) return false;
  return true;
}

function anotar(rel, nombre, metodo, tipo, nroLinea) {
  if (tipo !== 'rpc' && !esNombreDeTabla(nombre)) {
    if (nombre) descartados.set(nombre, (descartados.get(nombre) || 0) + 1);
    return;
  }
  registros.push({ archivo: rel, modulo: moduloDe(rel), tabla: nombre, metodo, tipo, linea: nroLinea });
}

// ---------- Extracción del argumento real de la llamada ----------

// Devuelve el texto entre el paréntesis que abre en `desde` y su cierre real,
// respetando comillas, plantillas y paréntesis anidados.
function argumentoDe(texto, desde) {
  let nivel = 0, i = desde, comilla = null;
  const tope = Math.min(texto.length, desde + 4000);
  for (; i < tope; i++) {
    const c = texto[i], prev = texto[i - 1];
    if (comilla) {
      if (c === comilla && prev !== '\\') comilla = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '(') nivel++;
    else if (c === ')') { nivel--; if (nivel === 0) return texto.slice(desde + 1, i); }
  }
  return texto.slice(desde + 1, tope);
}

function primerLiteralDeRuta(fragmento) {
  const m = fragmento.match(/(['"`])(\/[^'"`\n]*)\1/);
  return m ? m[2] : null;
}

// Separa los argumentos de la llamada por las comas de primer nivel
function partirArgumentos(arg) {
  const partes = [];
  let nivel = 0, comilla = null, ini = 0;
  for (let i = 0; i < arg.length; i++) {
    const c = arg[i], prev = arg[i - 1];
    if (comilla) { if (c === comilla && prev !== '\\') comilla = null; continue; }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '(' || c === '{' || c === '[') nivel++;
    else if (c === ')' || c === '}' || c === ']') nivel--;
    else if (c === ',' && nivel === 0) { partes.push(arg.slice(ini, i)); ini = i + 1; }
  }
  partes.push(arg.slice(ini));
  return partes;
}

function metodoDe(arg) {
  const partes = partirArgumentos(arg);
  if (partes.length < 2) return 'GET';              // sin opciones: PostgREST asume GET
  const opciones = partes.slice(1).join(',');
  const m = opciones.match(/method\s*:\s*['"`]([A-Za-z]+)['"`]/);
  if (m) return m[1].toUpperCase();
  if (opciones.includes('{')) return 'GET';         // objeto literal sin method: es GET
  return 'ND';                                      // opciones en variable: no se puede saber
}

function tablaDeEndpoint(endpoint) {
  const m = endpoint.match(/^\/([a-z][a-z0-9_]*)/);
  return m ? m[1] : null;
}

// Relaciones embebidas dentro de select=
function embedsDe(rel, endpoint, nroLinea) {
  const sel = endpoint.match(/select=([^&]*)/);
  if (!sel) return;
  const cuerpo = sel[1];
  const re = /([a-z][a-z0-9_]*)\s*(?::\s*([a-z][a-z0-9_]*))?(?:![a-z0-9_]+)?\s*\(/g;
  let e;
  while ((e = re.exec(cuerpo)) !== null) {
    // Sintaxis de alias: alias:tabla(...)  -> la tabla es el segundo grupo
    const nombre = e[2] || e[1];
    anotar(rel, nombre, 'GET', 'embed', nroLinea);
  }
}

// ---------- Análisis por archivo ----------

function analizar(ruta) {
  const rel = path.relative(RAIZ, ruta).split(path.sep).join('/');
  let texto;
  try { texto = fs.readFileSync(ruta, 'utf8'); } catch { return; }
  if (!texto.includes('supabaseRequest') && !texto.includes('/rest/v1')) {
    if (!/['"`]\/[a-z][a-z0-9_]{2,}\?/.test(texto)) return;
  }

  const resueltos = new Set();

  // --- Pase A: llamadas a supabaseRequest con literal dentro del argumento ---
  const reLlamada = /supabaseRequest\s*\(/g;
  let m;
  while ((m = reLlamada.exec(texto)) !== null) {
    const abre = texto.indexOf('(', m.index);
    if (abre === -1) continue;
    const arg = argumentoDe(texto, abre);
    const nroLinea = linea(texto, m.index);
    const endpoint = primerLiteralDeRuta(arg);
    if (!endpoint) continue;                 // endpoint en variable -> lo ve el pase B
    const metodo = metodoDe(arg);
    const primero = tablaDeEndpoint(endpoint);
    if (primero === 'rpc') {
      const fn = (endpoint.match(/^\/rpc\/([a-z][a-z0-9_]*)/) || [])[1];
      anotar(rel, fn, metodo, 'rpc', nroLinea);
    } else if (primero) {
      anotar(rel, primero, metodo, 'directa', nroLinea);
      resueltos.add(primero + '@' + nroLinea);
    }
    embedsDe(rel, endpoint, nroLinea);
  }

  // --- Pase B: endpoints escritos en variables u otros literales ---
  const reSuelto = /(['"`])(\/(?:rpc\/)?[a-z][a-z0-9_]{2,}(?:\?[^'"`\n]*)?)\1/g;
  while ((m = reSuelto.exec(texto)) !== null) {
    const endpoint = m[2];
    const nroLinea = linea(texto, m.index);
    const primero = tablaDeEndpoint(endpoint);
    if (primero === 'rpc') {
      const fn = (endpoint.match(/^\/rpc\/([a-z][a-z0-9_]*)/) || [])[1];
      if (!resueltos.has(fn + '@' + nroLinea)) anotar(rel, fn, 'ND', 'rpc', nroLinea);
      continue;
    }
    if (!primero) continue;
    if (resueltos.has(primero + '@' + nroLinea)) continue;  // ya contado por el pase A
    anotar(rel, primero, 'ND', 'directa', nroLinea);
    embedsDe(rel, endpoint, nroLinea);
  }
}

// ---------- Utilidades de reporte ----------

function agrupar(lista, clave) {
  const mapa = new Map();
  for (const r of lista) {
    if (!mapa.has(r[clave])) mapa.set(r[clave], []);
    mapa.get(r[clave]).push(r);
  }
  return mapa;
}

const esTabla = r => r.tipo !== 'rpc';
const esEscrituraCierta = r => r.tipo === 'directa' && ESCRITURAS.has(r.metodo);
const esIndeterminado = r => r.metodo === 'ND';

// ---------- Reportes ----------

function generar() {
  if (!fs.existsSync(SALIDA)) fs.mkdirSync(SALIDA, { recursive: true });
  const sello = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const cab = t => `# ${t}\n\n> Generado automáticamente el ${sello} UTC. **No editar a mano.**\n\n`;

  const deTablas = registros.filter(esTabla);
  const deRpc = registros.filter(r => r.tipo === 'rpc');
  const archivos = new Set(registros.map(r => r.archivo));
  const porTabla = agrupar(deTablas, 'tabla');
  const nd = deTablas.filter(esIndeterminado).length;

  const orden = [...porTabla.entries()].sort((a, b) => {
    const da = new Set(a[1].map(x => x.archivo)).size;
    const db = new Set(b[1].map(x => x.archivo)).size;
    return db - da || a[0].localeCompare(b[0]);
  });

  // ---- 1. Índice inverso ----
  let md = cab('Índice inverso — qué páginas dependen de cada tabla');
  md += `**${orden.length} tablas** referenciadas en **${archivos.size} archivos**.\n\n`;
  md += `Columnas: *Archivos* = cuántos la tocan. *Escriben* = cuántos la modifican con certeza. `;
  md += `*Dudosas* = consultas armadas en variables, donde no se pudo determinar la operación.\n\n`;
  md += `| Tabla | Archivos | Escriben | Dudosas |\n|---|---:|---:|---:|\n`;
  for (const [tabla, regs] of orden) {
    const arch = new Set(regs.map(r => r.archivo)).size;
    const esc = new Set(regs.filter(esEscrituraCierta).map(r => r.archivo)).size;
    const dud = new Set(regs.filter(esIndeterminado).map(r => r.archivo)).size;
    md += `| [${tabla}](#${tabla.replace(/_/g, '')}) | ${arch} | ${esc} | ${dud} |\n`;
  }
  md += `\n---\n\n## Detalle por tabla\n\n`;
  for (const [tabla, regs] of orden) {
    md += `### ${tabla}\n\n| Archivo | Módulo | Operaciones | Líneas |\n|---|---|---|---|\n`;
    for (const [archivo, rs] of [...agrupar(regs, 'archivo')].sort()) {
      const ops = [...new Set(rs.map(r => r.tipo === 'embed' ? 'embed' : r.metodo))].sort().join(', ');
      const lns = [...new Set(rs.map(r => r.linea))].sort((a, b) => a - b).slice(0, 10).join(', ');
      md += `| \`${archivo}\` | ${rs[0].modulo} | ${ops} | ${lns} |\n`;
    }
    md += `\n`;
  }
  fs.writeFileSync(path.join(SALIDA, 'INDICE_INVERSO.md'), md);

  // ---- 2. Por página ----
  md = cab('Mapa por página — qué tablas toca cada archivo');
  md += `**${archivos.size} archivos** con acceso a datos.\n\n`;
  for (const [archivo, regs] of [...agrupar(registros, 'archivo')].sort()) {
    const t = regs.filter(esTabla);
    const lee = [...new Set(t.filter(r => !esEscrituraCierta(r) && !esIndeterminado(r)).map(r => r.tabla))].sort();
    const esc = [...new Set(t.filter(esEscrituraCierta).map(r => r.tabla))].sort();
    const dud = [...new Set(t.filter(esIndeterminado).map(r => r.tabla))].sort();
    const fn = [...new Set(regs.filter(r => r.tipo === 'rpc').map(r => r.tabla))].sort();
    md += `### \`${archivo}\`\n\n`;
    md += `- **Módulo:** ${regs[0].modulo}\n`;
    md += `- **Lee (${lee.length}):** ${lee.length ? lee.join(', ') : '—'}\n`;
    md += `- **Escribe (${esc.length}):** ${esc.length ? '**' + esc.join('**, **') + '**' : '—'}\n`;
    if (dud.length) md += `- **Sin determinar (${dud.length}):** ${dud.join(', ')}\n`;
    if (fn.length) md += `- **Funciones (${fn.length}):** ${fn.join(', ')}\n`;
    md += `\n`;
  }
  fs.writeFileSync(path.join(SALIDA, 'POR_PAGINA.md'), md);

  // ---- 3. Acoplamiento ----
  const escrituras = deTablas.filter(esEscrituraCierta);
  const filas = [];
  for (const [tabla, regs] of agrupar(escrituras, 'tabla')) {
    const mods = [...new Set(regs.map(r => r.modulo))].sort();
    if (mods.length > 1) filas.push({ tabla, mods, n: new Set(regs.map(r => r.archivo)).size });
  }
  filas.sort((a, b) => b.mods.length - a.mods.length || b.n - a.n);

  md = cab('Acoplamiento — tablas escritas desde más de un módulo');
  md += `Cada fila es un punto donde un cambio de estructura puede romper código de otro módulo.\n`;
  md += `Solo se cuentan escrituras confirmadas. Las funciones de base de datos quedan excluidas.\n\n`;
  md += `**${filas.length} tablas** con escritura compartida.\n\n`;
  md += `| Tabla | Módulos que escriben | Archivos |\n|---|---|---:|\n`;
  for (const f of filas) md += `| ${f.tabla} | ${f.mods.join(', ')} | ${f.n} |\n`;

  // Escritura concentrada: muchas escrituras aunque sea un solo módulo
  const concentradas = [...agrupar(escrituras, 'tabla')]
    .map(([tabla, regs]) => ({ tabla, n: new Set(regs.map(r => r.archivo)).size,
                               mods: [...new Set(regs.map(r => r.modulo))] }))
    .filter(x => x.n >= 4)
    .sort((a, b) => b.n - a.n);
  md += `\n---\n\n## Tablas con muchos puntos de escritura\n\n`;
  md += `Cuatro o más archivos que las modifican, sin importar el módulo. `;
  md += `Cada archivo es una regla de negocio que puede contradecir a las otras.\n\n`;
  md += `| Tabla | Archivos que escriben | Módulos |\n|---|---:|---|\n`;
  for (const c of concentradas) md += `| ${c.tabla} | ${c.n} | ${c.mods.join(', ')} |\n`;
  fs.writeFileSync(path.join(SALIDA, 'ACOPLAMIENTO.md'), md);

  // ---- 4. Calidad del análisis ----
  md = cab('Calidad del análisis — límites y ruido de esta corrida');
  md += `## Referencias sin operación determinada\n\n`;
  md += `**${nd} referencias** provienen de consultas armadas en variables. `;
  md += `El escáner sabe qué tabla se toca, pero no si se lee o se escribe. `;
  md += `Por eso las cifras de escritura son un piso, no un total.\n\n`;
  const porArchivoND = [...agrupar(deTablas.filter(esIndeterminado), 'archivo')]
    .map(([a, rs]) => ({ a, n: rs.length })).sort((x, y) => y.n - x.n).slice(0, 30);
  md += `| Archivo | Referencias dudosas |\n|---|---:|\n`;
  for (const x of porArchivoND) md += `| \`${x.a}\` | ${x.n} |\n`;

  md += `\n## Funciones de base de datos invocadas\n\n`;
  const porFn = [...agrupar(deRpc, 'tabla')].map(([f, rs]) => ({ f, n: new Set(rs.map(r => r.archivo)).size }))
    .sort((a, b) => b.n - a.n);
  md += `**${porFn.length} funciones**. Se listan aparte porque se invocan igual que una escritura ${''}`;
  md += `pero muchas solo leen.\n\n| Función | Archivos |\n|---|---:|\n`;
  for (const x of porFn) md += `| ${x.f} | ${x.n} |\n`;

  md += `\n## Nombres descartados por no parecer tablas\n\n`;
  md += `Columnas, restricciones y palabras sueltas que el escáner filtró. `;
  md += `Si alguno de estos es una tabla real, hay que ajustar el filtro.\n\n`;
  const desc = [...descartados.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60);
  md += `| Nombre | Veces |\n|---|---:|\n`;
  for (const [n, c] of desc) md += `| ${n} | ${c} |\n`;
  fs.writeFileSync(path.join(SALIDA, 'CALIDAD.md'), md);

  fs.writeFileSync(path.join(SALIDA, 'datos.json'),
    JSON.stringify({ generado: sello, registros }, null, 2));

  console.log(`Archivos con acceso a datos : ${archivos.size}`);
  console.log(`Tablas referenciadas        : ${porTabla.size}`);
  console.log(`Referencias totales         : ${deTablas.length}`);
  console.log(`  de ellas sin determinar   : ${nd}`);
  console.log(`Funciones invocadas         : ${new Set(deRpc.map(r => r.tabla)).size}`);
  console.log(`Tablas con escritura compartida : ${filas.length}`);
  console.log(`Nombres descartados         : ${descartados.size}`);
}

recorrer(RAIZ);
generar();
