# Bitácora — Portal de Familias (SchoolNet)

**Fecha de corte:** 7 de julio de 2026
**Estado general:** Base funcional en DEV (autenticación por OTP + dashboard de hijos). Pendiente: vista de planeadores y replicación a PROD.

---

## 1. Propósito

Portal **público** para que las familias del Colegio Tilatá consulten información (por ahora, en construcción, la vista de **planeadores por grado**). Sin usuarios ni login tradicional: acceso por **correo + código de un solo uso (OTP)**.

- URL del portal: `schoolnet.colegiotilata.edu.co/families.html` (archivo en la **raíz** del repo `sistema_next`).
- No confundir con `modules/config/families.html` (página **interna** de administración de familias, otra cosa).

---

## 2. Arquitectura y decisión de seguridad clave

El portal es público y **no puede** hablar con Supabase directamente: el `config.js` interno lleva la `anon key` y RLS está desactivado en toda la plataforma, así que exponerla en un portal público permitiría leer datos de todas las familias.

**Solución adoptada:** un **intermediario en Google Apps Script (GAS)** que guarda la `service_role key` del lado servidor (nunca en el navegador) y expone endpoints estrechos. El portal solo habla con GAS; **jamás carga `config.js` ni ninguna llave de Supabase**.

Flujo: `portal (families.html) → GAS Web App → Supabase (service_role)`.

Se descartó activar RLS por familia (choca con el modelo sin-login) y se descartó un backend en Vercel (el equipo ya domina GAS y el correo ya vive ahí).

---

## 3. Base de datos

Tres entornos Supabase: **DEV** `spjzvpcsgbewxupjvmfm` · **PROD** `mrtuerkncqodhakuwjob` · PresuCorti (no aplica).

### 3.1 Tabla `family_members` (familiares por familia)
Extensión del módulo de familias. Modelo 1:N: una familia puede tener varios familiares (se evitó el patrón padre/madre por familias con dos madres/dos padres).

Columnas: `family_member_id` (uuid PK), `family_id` (uuid, FK → `families.family_id`, ON DELETE CASCADE), `relationship` (varchar 50), `full_name` (varchar 150), `phone` (varchar 30), `email` (varchar 100), `is_primary` (bool, default false), `display_order` (smallint, default 1), `member_status` (varchar, default 'active', CHECK active/inactive), `created_at`, `updated_at`. RLS deshabilitado explícitamente.

**Estado: creada en DEV ✅ y PROD ✅.**

Carga inicial desde `BD_Estudiantes.csv`: **289 familias / 574 familiares** cargados en **DEV ✅ y PROD ✅** (script `carga_familiares_1a.sql`, idempotente y ambiente-agnóstico vía `INSERT ... SELECT ... WHERE family_code = X`). `relationship` = "Padre"/"Madre" literal del CSV; `is_primary` = false en todos.

### 3.2 Tabla `portal_access_codes` (códigos OTP)
Columnas: `code_id` (uuid PK), `email` (varchar 150), `code_hash` (varchar 64, SHA-256), `expires_at` (timestamptz), `used` (bool), `used_at` (timestamptz), `attempts` (smallint), `created_at`. RLS deshabilitado. Índices por `email` y `(email, created_at)`.

**Estado: creada en DEV ✅. PENDIENTE en PROD.**

### 3.3 Tabla `portal_sessions` (sesiones del portal)
Columnas: `session_id` (uuid PK), `token_hash` (varchar 64, SHA-256, UNIQUE), `email` (varchar 150), `expires_at` (timestamptz), `revoked` (bool, default false), `created_at`. RLS deshabilitado. Índice por `email`.

**Estado: creada en DEV ✅. PENDIENTE en PROD.**

---

## 4. Intermediario Apps Script (GAS)

Proyecto GAS **independiente** (no el de `sendNotification`), dueño = cuenta corporativa Google Workspace. Web App desplegado con "Ejecutar como: la cuenta dueña" y "Quién tiene acceso: cualquiera".

- **URL `/exec` actual:** `https://script.google.com/macros/s/AKfycbykOwF7EWwbpaVqZTk-hWwqj7crzEZZNMTOFVpq5XDXw-Wwm25wACoF3pyq5ZVw6bQ/exec`
- **Script Properties** (Configuración del proyecto): `SUPABASE_URL` y `SERVICE_ROLE_KEY`. **Actualmente apuntan a DEV.** El `service_role` es la llave maestra (se salta RLS); solo debe vivir aquí, nunca en el portal.

### Endpoints implementados (enrutados por `action` en `doPost`)
- `request_code` — recibe correo, valida contra `family_members` (activo), genera código 6 dígitos, lo guarda hasheado, invalida anteriores, y lo envía por correo (`MailApp`). Respuesta **siempre neutra** (no revela si el correo existe).
- `verify_code` — valida el código contra el hash; controla expiración, `used` e intentos; si es correcto marca el código como usado y crea una sesión en `portal_sessions`, devolviendo `{ ok:true, token, expires_at }`.
- `get_children` — valida el token (helper `validarSesion`), resuelve correo → `family_members` → `families` → `students` (solo activos, `status_code = 1`), incluyendo hijos de **todas** las familias asociadas al correo. Devuelve `{ ok:true, children:[{student_code, name}] }`.

### Parámetros (constantes al inicio del script)
`CODE_LENGTH = 6` · `CODE_TTL_MINUTES = 10` · `MAX_ATTEMPTS = 5` · `RESEND_COOLDOWN_SECONDS = 60` · `DAILY_CAP = 10` · `SESSION_TTL_MINUTES = 60`.

### ⚠️ Nota crítica de despliegue
Los cambios en el código GAS **no son visibles desde el navegador hasta re-desplegar**: Implementar → Gestionar implementaciones → editar (lápiz) → Versión "Nueva versión" → Implementar. La URL `/exec` **no cambia**. Las pruebas *dentro del editor* sí usan el código guardado sin re-desplegar; las que llegan *desde el portal/consola* usan la versión desplegada.

### Funciones de prueba a limpiar
En el script quedaron `test_diagnostico` y `test_verify` (temporales). Se pueden borrar.

---

## 5. Portal (`families.html` en la raíz)

Página autónoma (Bootstrap 5 + bootstrap-icons por CDN), **sin `config.js`**. Logo y colores corporativos **hardcodeados** desde `system_config`:
- Logo: `https://mrtuerkncqodhakuwjob.supabase.co/storage/v1/object/public/certificates/branding/Logo-Tilata.png` (URL pública de Storage; el logo ya trae el nombre "Colegio Tilatá").
- Colores: primario `#1b365d`, secundario `#efefef`, terciario `#3d6199` (variables CSS `--brand-*`; botón `.btn-brand`).

Constante `GAS_ENDPOINT` = la URL `/exec` de arriba.

### Pantallas (una sola página, tres estados)
1. **Correo** — input + "Enviar código". Envía a GAS en `mode: 'no-cors'` (no lee respuesta; mensaje neutro siempre). Al enviar, pasa a la pantalla de código.
2. **Código** — input de 6 dígitos + "Validar" + "Usar otro correo". `verify_code` va con `fetch` normal (CORS de lectura confirmado funcionando). Al validar, guarda `sessionToken` **solo en memoria** (no localStorage) y carga el dashboard.
3. **Dashboard** — llama `get_children` con el token y pinta **un badge por hijo** con su nombre. Por ahora el badge es informativo (al hacer clic muestra "Aquí verás los planeadores de …"). Botón "Salir".

### Transporte / CORS
- `request_code`: `no-cors` (fire-and-forget).
- `verify_code` y `get_children`: `fetch` normal con `Content-Type: text/plain;charset=utf-8` (evita preflight). Lectura de respuesta confirmada OK.

---

## 6. Estado actual (qué funciona)

Probado de punta a punta en **DEV**:
- Solicitud de código → correo llega ✅
- Verificación de código → token + sesión creada (1 h) ✅
- Código de un solo uso (se marca `used`) ✅
- Dashboard: badge con el nombre del hijo ✅ (ej.: "Lorenzo Niño De Toro")

### Dato de prueba en DEV (limpiar al terminar)
El correo `hgmoncadal@gmail.com` fue vinculado manualmente a un familiar de la familia **Niño De Toro** (`family_code` 105695) en `family_members` de DEV, para probar con un correo controlado. **Revertir/limpiar** este correo antes de pasar a PROD, y borrar cualquier fila `TEST_DIAGNOSTICO` en `portal_access_codes`.

---

## 7. Pendientes

### Portal / funcionalidad
- **3c — Vista de planeadores** (siguiente paso natural): el badge del hijo debe llevar a los planeadores de su grado. Cadena verificada: `students.course_id → courses.grade_id → grades → pln_planners` (filtrar por año vigente `system_config.current_academic_year_id`). Falta decidir **qué campos del planeador** se muestran (muchos son internos del docente y no deben exponerse) y el **criterio de visibilidad**.
- **Marca "visible para familias" en el planeador** (decisión de coordinación, ya aceptada en principio, diferida): hoy `pln_planners.planner_status` solo tiene `active/archived/deleted`, **no** existe estado de aprobación/publicación. Sin esa marca, mostrar todos los `active` incluiría borradores. Habrá que agregar el campo (p. ej. `visible_para_familias` booleano) y su control en el módulo de Planeación.
- Casos de **empate de correo**: 0 familias → acceso denegado (ya cubierto por respuesta neutra); varias familias → se listan hijos de todas (ya implementado). Revisar con datos reales cuando haya correos compartidos.
- `favicon.ico` 404 (cosmético): agregar un favicon al portal.

### Replicación a PROD
1. Crear `portal_access_codes` en PROD (mismo DDL, con `DISABLE ROW LEVEL SECURITY`).
2. Crear `portal_sessions` en PROD (mismo DDL, con `DISABLE ROW LEVEL SECURITY`).
3. Cambiar las **Script Properties** del GAS a PROD (`SUPABASE_URL` = `https://mrtuerkncqodhakuwjob.supabase.co` y el `service_role` de PROD) **o** decidir un despliegue GAS separado para PROD (recomendado, para no confundir a qué ambiente apunta).
4. Re-desplegar el GAS tras cambiar propiedades si aplica.
5. Publicar `families.html` (raíz) en el dominio de PROD.

### Módulo de familias / carga de familiares (2ª tanda, en espera de IT)
Documento entregado a IT (`Inconsistencias_BD_Estudiantes_para_IT.md`):
- **Bloque A:** 26 códigos de familia del CSV que no existen en `families` (crear o corregir).
- **Bloque B:** familia 106000 con padres distintos entre "hermanos" (separar/corregir).
- **Bloque C:** 8 registros con datos de contacto faltantes (ya cargados con lo disponible).
Cuando IT responda, hacer la segunda carga de `family_members` para A y B.

### Limpieza
- Borrar funciones de prueba `test_diagnostico` y `test_verify` del GAS.
- Revertir el correo de prueba `hgmoncadal@gmail.com` en `family_members` de DEV.
- Borrar filas `TEST_DIAGNOSTICO` de `portal_access_codes`.

---

## 8. Cómo retomar

1. Abrir el proyecto GAS (cuenta corporativa) — ahí están `request_code`, `verify_code`, `get_children`.
2. Confirmar a qué ambiente apuntan las Script Properties (DEV/PROD).
3. El portal es `families.html` en la raíz de `sistema_next`; el `GAS_ENDPOINT` ya apunta al Web App.
4. Para probar en DEV, usar un correo controlado vinculado en `family_members` (ver §6).
5. Siguiente construcción sugerida: **3c — planeadores** (definir primero campos visibles y la marca de visibilidad con coordinación).

---

## 9. Principios y aprendizajes de esta fase

- El portal público **nunca** toca Supabase directo; todo pasa por GAS con `service_role` del lado servidor.
- Códigos y tokens se guardan **hasheados** (SHA-256), nunca en claro.
- Respuesta **neutra** en `request_code` para no revelar qué correos están registrados.
- CORS con GAS: `no-cors` cuando no se lee la respuesta; `text/plain` para evitar preflight cuando sí se lee.
- **Todo cambio en GAS requiere re-desplegar** para verse desde afuera.
- En el editor de GAS, Ctrl+F busca por línea: anclar ediciones en **una sola línea**, no en bloques multilínea.
- `students.family_id` es entero y referencia `families.family_code` (no el uuid `family_id`); por eso la cadena correo→hijos traduce uuid→código vía `families`.
