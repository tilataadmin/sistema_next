#!/usr/bin/env node
/*
 * ESCÁNER DE DEPENDENCIAS — SchoolNet
 * Recorre el repositorio y detecta qué archivo toca qué tabla y con qué operación.
 * No modifica nada. No se conecta a la base de datos. Solo lee y reporta.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = process.cwd();
const SALIDA = path.join(RAIZ, 'mapa');
const IGNORAR = new Set(['.git', 'node_modules', '.vercel', '.github', 'mapa']);
const EXTENSIONES = new Set(['.html', '.js']);
const ESCRITURAS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
const NO_SON_TABLAS = new Set(['rpc', 'count', 'sum', 'avg', 'max', 'min', 'auth', 'storage', 'and', 'or', 'not']);

const RE_LLAMADA   = /supabaseRequest\s*\(/g;
const RE_LITERAL   = /['"`](\/[^'"`\n]*)['"`]/;
const RE_METODO    = /method\s*:\s*['"`]([A-Za-z]+)['"`]/;
const RE_ENDPOINT  = /['"`]\/([a-z][a-z0-9_]{2,})(\?[^'"`\n]*)?['"`]/g;
const RE_RPC       = /['"`]\/rpc\/([a-z][a-z0-9_]{2,})/g;
const RE_EMBED     = /([a-z][a-z0-9_]{2,})(?:![a-z0-9_]+)?\s*\(/g;

const registros = [];

function recorrer(dir) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name.startsWith('.') && entrada.name !== '.github') continue;
    if (IGNORAR.has(entrada.name)) continue;
    const completa = path.join(dir, entrada.name);
    if (entrada.isDirectory()) recorrer(completa);
    else if (EXTENSIONES.has(path.extname(entrada.name))) analizar(completa);
  }
}

function linea(texto, indice) {
  return texto.slice(0, indice).split('\n').length;
}

function moduloDe(rel) {
  const partes = rel.split('/');
  if (partes[0] === 'modules' && partes.length > 1) return partes[1];
  if (partes.length === 1) return '(raíz)';
  return partes[0];
}

function anotar(rel, tabla, metodo, tipo, nroLinea) {
  if (!tabla || NO_SON_TABLAS.has(tabla)) return;
  registros.push({ archivo: rel, modulo: moduloDe(rel), tabla, metodo, tipo, linea: nroLinea });
}

function embedsDe(rel, endpoint, nroLinea) {
  const sel = endpoint.match(/select=([^&]*)/);
  if (!sel) return;
  let e;
  RE_EMBED.lastIndex = 0;
  while ((e = RE_EMBED.exec(sel[1])) !== null) anotar(rel, e[1], 'GET', 'embed', nroLinea);
}

function analizar(ruta) {
  const rel = path.relative(RAIZ, ruta).split(path.sep).join('/');
  const texto = fs.readFileSync(ruta, 'utf8');
  const conMetodo = new Set();

  // Pase A: llamadas explícitas a supabaseRequest, con su método
  const puntos = [];
  RE_LLAMADA.lastIndex = 0;
  let m;
  while ((m = RE_LLAMADA.exec(texto)) !== null) puntos.push(m.index + m[0].length);

  for (let i = 0; i < puntos.length; i++) {
    const ini = puntos[i];
    const tope = i + 1 < puntos.length ? puntos[i + 1] : texto.length;
    const ventana = texto.slice(ini, Math.min(tope, ini + 800));
    const lit = ventana.match(RE_LITERAL);
    if (!lit) continue;
    const endpoint = lit[1];
    const met = ventana.match(RE_METODO);
    const metodo = met ? met[1].toUpperCase() : 'GET';
    const nroLinea = linea(texto, ini);
    const tabla = (endpoint.match(/^\/([a-z][a-z0-9_]{2,})/) || [])[1];
    if (tabla === 'rpc') {
      const fn = (endpoint.match(/^\/rpc\/([a-z][a-z0-9_]*)/) || [])[1];
      anotar(rel, fn, metodo, 'rpc', nroLinea);
    } else if (tabla) {
      anotar(rel, tabla, metodo, 'directa', nroLinea);
      conMetodo.add(tabla);
    }
    embedsDe(rel, endpoint, nroLinea);
  }

  // Pase B: endpoints armados en variables, fuera de la llamada
  let e;
  RE_ENDPOINT.lastIndex = 0;
  while ((e = RE_ENDPOINT.exec(texto)) !== null) {
    if (conMetodo.has(e[1])) continue;
    const nroLinea = linea(texto, e.index);
    anotar(rel, e[1], 'ND', 'directa', nroLinea);
    if (e[2]) embedsDe(rel, e[2], nroLinea);
  }
  RE_RPC.lastIndex = 0;
  while ((e = RE_RPC.exec(texto)) !== null) anotar(rel, e[1], 'ND', 'rpc', linea(texto, e.index));
}

// ---------- Reportes ----------

function agrupar(lista, clave) {
  const mapa = new Map();
  for (const r of lista) {
    if (!mapa.has(r[clave])) mapa.set(r[clave], []);
    mapa.get(r[clave]).push(r);
  }
  return mapa;
}

function generar() {
  if (!fs.existsSync(SALIDA)) fs.mkdirSync(SALIDA, { recursive: true });
  const sello = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const cab = (t) => `# ${t}\n\n> Generado automáticamente el ${sello} UTC. **No editar a mano.**\n\n`;

  // 1. Índice inverso: tabla -> archivos
  const porTabla = agrupar(registros.filter(r => r.tipo !== 'rpc'), 'tabla');
  const orden = [...porTabla.entries()].sort((a, b) => {
    const da = new Set(a[1].map(x => x.archivo)).size;
    const db = new Set(b[1].map(x => x.archivo)).size;
    return db - da || a[0].localeCompare(b[0]);
  });

  let md = cab('Índice inverso — qué páginas dependen de cada tabla');
  md += `**${orden.length} tablas referenciadas** en ${new Set(registros.map(r => r.archivo)).size} archivos.\n\n`;
  md += `| Tabla | Archivos | Escriben |\n|---|---:|---:|\n`;
  for (const [tabla, regs] of orden) {
    const arch = new Set(regs.map(r => r.archivo)).size;
    const esc = new Set(regs.filter(r => ESCRITURAS.has(r.metodo)).map(r => r.archivo)).size;
    md += `| [${tabla}](#${tabla}) | ${arch} | ${esc} |\n`;
  }
  md += `\n---\n\n## Detalle\n\n`;
  for (const [tabla, regs] of orden) {
    md += `### ${tabla}\n\n| Archivo | Módulo | Operaciones | Líneas |\n|---|---|---|---|\n`;
    for (const [archivo, rs] of agrupar(regs, 'archivo')) {
      const ops = [...new Set(rs.map(r => r.tipo === 'embed' ? 'embed' : r.metodo))].sort().join(', ');
      const lns = [...new Set(rs.map(r => r.linea))].sort((a, b) => a - b).slice(0, 8).join(', ');
      md += `| \`${archivo}\` | ${rs[0].modulo} | ${ops} | ${lns} |\n`;
    }
    md += `\n`;
  }
  fs.writeFileSync(path.join(SALIDA, 'INDICE_INVERSO.md'), md);

  // 2. Por página
  md = cab('Mapa por página — qué tablas toca cada archivo');
  for (const [archivo, regs] of [...agrupar(registros, 'archivo')].sort()) {
    const lee = [...new Set(regs.filter(r => !ESCRITURAS.has(r.metodo)).map(r => r.tabla))].sort();
    const esc = [...new Set(regs.filter(r => ESCRITURAS.has(r.metodo)).map(r => r.tabla))].sort();
    md += `### \`${archivo}\`\n\n`;
    md += `- **Módulo:** ${regs[0].modulo}\n`;
    md += `- **Lee (${lee.length}):** ${lee.length ? lee.join(', ') : '—'}\n`;
    md += `- **Escribe (${esc.length}):** ${esc.length ? '**' + esc.join('**, **') + '**' : '—'}\n\n`;
  }
  fs.writeFileSync(path.join(SALIDA, 'POR_PAGINA.md'), md);

  // 3. Acoplamiento entre módulos
  md = cab('Acoplamiento — tablas escritas desde más de un módulo');
  md += `Cada fila es un punto donde un cambio de estructura puede romper código de otro equipo o módulo.\n\n`;
  const escrituras = registros.filter(r => ESCRITURAS.has(r.metodo));
  const filas = [];
  for (const [tabla, regs] of agrupar(escrituras, 'tabla')) {
    const mods = [...new Set(regs.map(r => r.modulo))].sort();
    if (mods.length > 1) filas.push({ tabla, mods, n: new Set(regs.map(r => r.archivo)).size });
  }
  filas.sort((a, b) => b.mods.length - a.mods.length || b.n - a.n);
  md += `**${filas.length} tablas** con escritura compartida.\n\n`;
  md += `| Tabla | Módulos que escriben | Archivos |\n|---|---|---:|\n`;
  for (const f of filas) md += `| ${f.tabla} | ${f.mods.join(', ')} | ${f.n} |\n`;
  fs.writeFileSync(path.join(SALIDA, 'ACOPLAMIENTO.md'), md);

  fs.writeFileSync(path.join(SALIDA, 'datos.json'), JSON.stringify({ generado: sello, registros }, null, 2));

  console.log(`Archivos analizados: ${new Set(registros.map(r => r.archivo)).size}`);
  console.log(`Tablas referenciadas: ${porTabla.size}`);
  console.log(`Referencias totales: ${registros.length}`);
  console.log(`Tablas con escritura compartida: ${filas.length}`);
}

recorrer(RAIZ);
generar();
