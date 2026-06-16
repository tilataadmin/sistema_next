# Módulo "Decisiones y acuerdos" (memoria institucional de decisiones) — Especificación de construcción

**Sistema:** SchoolNet — Colegio Tilatá
**Repos:** `tilataadmin/sistema_next` (frontend) · `tilata-ia` (Rigoberto, fase posterior)
**Estado:** Diseño cerrado. Borrador listo para construir.
**Modo de desarrollo previsto:** Claude (Sonnet), paso a paso.
**Última actualización:** 10 de junio de 2026

---

## 0. Cómo usar este documento (para el asistente de desarrollo)

Fuente de verdad para implementar el módulo. Antes de generar código, ten presente la sección 1. Trabaja así:

- **Un paso a la vez.** Un cambio (o grupo pequeño), espera confirmación, sigue. No entregues varios pasos juntos.
- **SQL primero, luego frontend. DEV primero, luego PROD.**
- **Ediciones buscables.** Find-and-replace exacto, localizable con Ctrl+F (se edita por el editor web de GitHub; sin Node local).
- **Verifica contra la BD** los nombres de tablas/campos existentes antes de usarlos.
- **Español neutral**, directo, sin halagos. Preguntas en prosa (sin widgets).

---

## 1. Contexto y reglas del proyecto (guardrails)

**Stack:** Vanilla JS + Bootstrap 5.3 + Bootstrap Icons + Supabase/PostgREST + Vercel.

**Entornos Supabase:** DEV `spjzvpcsgbewxupjvmfm` / `sistema-next.vercel.app` · PROD `mrtuerkncqodhakuwjob` / `schoolnet.colegiotilata.edu.co`.

**Reglas que NO se rompen:**
- `supabaseRequest(endpoint, { method, body })`: siempre objeto de opciones; nunca pasar `headers` explícitos.
- **RLS deshabilitada en la plataforma:** toda tabla nueva debe incluir `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` explícito.
- SQL multi-sentencia no corre confiable en el editor de Supabase: ejecutar **cada sentencia por separado**.
- PostgREST no ignora parámetros desconocidos: sin cache-busters.
- UI sin gradientes: colores sólidos.

---

## 2. Objetivo

Una **memoria institucional de decisiones y acuerdos** sobre tres grupos de interés —estudiantes, familias y trabajadores—, que captura **el razonamiento** detrás de cada decisión y **sobrevive a la rotación de personal**. Caso motivador: una familia pide beca; al año siguiente vuelve a pedirla y se necesita ver los criterios del año anterior, aunque quien decidió ya no esté.

No reemplaza a Seguimientos (operativo / día a día). Aquí se registra **qué se decidió, con qué criterios y con qué vigencia**.

---

## 3. Concepto y flujo

- Cada **entrada** es una decisión anclada a **un sujeto** (estudiante, familia o trabajador) y a un **tipo de decisión** (Beca, Acuerdo laboral, etc.).
- Campos de la entrada: contexto, **razonamiento/criterios** (campo central), decisión tomada, participantes, fecha y vigencia (año académico).
- Las decisiones recurrentes se ven como un **hilo**, derivado por consulta de (sujeto + tipo): Beca 2024 → 2025 → 2026. No hay tabla de hilos.
- **Rollup familia↔estudiante:** al consultar una familia se ven también las decisiones de sus estudiantes (vínculo por `students.family_id`).

Flujo de uso: el usuario abre "Decisiones y acuerdos" (en Mi Espacio), busca un sujeto, ve el historial al que tiene acceso, y —si su función lo permite— registra una nueva decisión.

---

## 4. Modelo de acceso (núcleo del diseño)

Reglas cerradas:

1. **El acceso lo gobierna únicamente el tipo de decisión.** Cada tipo tiene una lista de **funciones autorizadas, identificadas por correo funcional** (`dec_type_access`). Ej.: Beca → `contabilidad@` (escribe y lee), `dafi@` (lee).
2. **Se evalúa por correo funcional vigente, no por `user_id`.** Un usuario ve/escribe una entrada si su correo (`users.user_mail`) está en la lista del tipo. Como el correo funcional se mantiene al cambiar de titular (Diana → Pedro, ambos `contabilidad@`), el acceso se transfiere solo, sin migrar datos.
3. **Sin acceso "del lado del sujeto".** El jefe directo del trabajador NO ve por ser su jefe; solo importan las funciones del tipo. Modelo limpio.
4. **Autoría congelada (frozen data).** Como el correo funcional se reutiliza entre personas, no sirve para registrar quién escribió de verdad. Cada entrada guarda `author_user_id`, un *snapshot* del nombre y el `author_function_email` con el que se escribió. Así "Diana decidió esto en 2024" se preserva aunque hoy `contabilidad@` sea Pedro. **Acceso por función (correo); autoría por persona congelada.**
5. **Confidencialidad por mapeo, no por entrada.** No hay niveles por entrada: lo reservado se logra mapeando los tipos sensibles a menos funciones. Mantiene el modelo limpio.
6. **Todo el control va por capa de aplicación** (RLS está deshabilitada). Nunca confiar en RLS.

---

## 5. Modelo de datos

**Ejecutar cada sentencia por separado. DEV primero, luego PROD.** Prefijo `dec_`.

> Nota de tipos: `students.student_id` es **integer**; `families.family_id`, `workers.worker_id` y `academic_years.year_id` son **uuid**. Por eso el sujeto se modela con tres columnas tipadas anulables + `CHECK`, no con una sola columna.

### 5.1 `dec_decision_types` — catálogo de tipos
```sql
CREATE TABLE public.dec_decision_types (
  type_id      uuid NOT NULL DEFAULT gen_random_uuid(),
  type_name    text NOT NULL,
  description  text,
  type_status  text NOT NULL DEFAULT 'active' CHECK (type_status IN ('active','inactive')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dec_decision_types_pkey PRIMARY KEY (type_id),
  CONSTRAINT dec_decision_types_name_unique UNIQUE (type_name)
);
```
```sql
ALTER TABLE public.dec_decision_types DISABLE ROW LEVEL SECURITY;
```

### 5.2 `dec_type_access` — funciones autorizadas por tipo (correo funcional)
```sql
CREATE TABLE public.dec_type_access (
  access_id      uuid NOT NULL DEFAULT gen_random_uuid(),
  type_id        uuid NOT NULL,
  function_email text NOT NULL,
  can_write      boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dec_type_access_pkey PRIMARY KEY (access_id),
  CONSTRAINT dec_type_access_type_fkey FOREIGN KEY (type_id) REFERENCES public.dec_decision_types(type_id) ON DELETE CASCADE,
  CONSTRAINT dec_type_access_unique UNIQUE (type_id, function_email)
);
```
```sql
ALTER TABLE public.dec_type_access DISABLE ROW LEVEL SECURITY;
```
Estar en la lista = puede **leer**. `can_write = true` = además puede **escribir**.

### 5.3 `dec_entries` — la decisión
```sql
CREATE TABLE public.dec_entries (
  entry_id              uuid NOT NULL DEFAULT gen_random_uuid(),
  type_id               uuid NOT NULL,
  subject_type          text NOT NULL CHECK (subject_type IN ('student','family','worker')),
  student_id            integer,
  family_id             uuid,
  worker_id             uuid,
  decision_date         date NOT NULL,
  academic_year_id      uuid,
  context               text,
  rationale             text NOT NULL,
  decision              text NOT NULL,
  participants          text,
  author_user_id        uuid NOT NULL,
  author_name_snapshot  text NOT NULL,
  author_function_email text NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dec_entries_pkey PRIMARY KEY (entry_id),
  CONSTRAINT dec_entries_type_fkey FOREIGN KEY (type_id) REFERENCES public.dec_decision_types(type_id),
  CONSTRAINT dec_entries_student_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT dec_entries_family_fkey FOREIGN KEY (family_id) REFERENCES public.families(family_id),
  CONSTRAINT dec_entries_worker_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(worker_id),
  CONSTRAINT dec_entries_year_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(year_id),
  CONSTRAINT dec_entries_author_fkey FOREIGN KEY (author_user_id) REFERENCES public.users(user_id),
  CONSTRAINT dec_entries_subject_chk CHECK (
    (subject_type = 'student' AND student_id IS NOT NULL AND family_id IS NULL AND worker_id IS NULL) OR
    (subject_type = 'family'  AND family_id  IS NOT NULL AND student_id IS NULL AND worker_id IS NULL) OR
    (subject_type = 'worker'  AND worker_id  IS NOT NULL AND student_id IS NULL AND family_id IS NULL)
  )
);
```
```sql
ALTER TABLE public.dec_entries DISABLE ROW LEVEL SECURITY;
```

---

## 6. Patrones de consulta (PostgREST)

El correo del usuario en sesión (`users.user_mail`) **es** su correo funcional y es la llave de acceso.

**Mis tipos accesibles** (y si puedo escribir en ellos):
```
GET /dec_type_access?function_email=eq.<miCorreo>&select=type_id,can_write
```

**Historial de un sujeto, filtrado a lo que puedo ver** (con `type_id` ∈ mis tipos):
```
GET /dec_entries?family_id=eq.<famId>&type_id=in.(<ids>)&order=decision_date.desc
     &select=entry_id,type_id,decision_date,context,rationale,decision,participants,author_name_snapshot,academic_year_id
```
- Estudiante: `student_id=eq.<id>` · Trabajador: `worker_id=eq.<id>`.
- **Rollup familia:** las decisiones de una familia incluyen las de sus estudiantes. Obtener los `student_id` de la familia (`GET /students?family_id=eq.<famId>&select=student_id`) y consultar `dec_entries` con `family_id=eq.<famId>` y, por separado, `student_id=in.(...)`; fusionar en JS.

**Hilo de un sujeto + tipo:**
```
GET /dec_entries?family_id=eq.<famId>&type_id=eq.<tipoBeca>&order=decision_date.desc
```

**Crear decisión** (solo si mi correo tiene `can_write=true` para ese `type_id`; validar en la app antes del POST):
```
POST /dec_entries
body: {
  type_id, subject_type, student_id|family_id|worker_id, decision_date, academic_year_id,
  context, rationale, decision, participants,
  author_user_id: <session.user.user_id>,
  author_name_snapshot: <session display name>,
  author_function_email: <miCorreo>
}
```

**Administrar tipos y listas de acceso** (pantalla admin):
```
POST   /dec_decision_types     body: { type_name, description }
POST   /dec_type_access        body: { type_id, function_email, can_write }
DELETE /dec_type_access?access_id=eq.<id>
```

**Control de acceso (app):** leer una entrada → su `type_id` está entre mis tipos accesibles. Escribir un tipo → mi correo tiene `can_write=true` en ese tipo. Validar siempre en la consulta.

---

## 7. Integración con Mi Espacio (página única, permiso NO universal)

Vive como **una sola página** en Mi Espacio: `/modules/general-tools/decisions.html`. Es una **vista filtrada por correo funcional sobre datos institucionales**, no un cuaderno personal.

Mi Espacio se renderiza por subsecciones que hacen match por **nombre de permiso** (`MY_SPACE_SUBSECTIONS` en `sidebar.js`). Para que aparezca se requieren tres cosas:

1. **Permiso en `permissions` — NO universal** (diferencia clave con Notas de voz). Si fuera universal, un usuario sin funciones de decisión vería la página vacía.
```sql
INSERT INTO public.permissions
  (permission_id, permission_name, permission_description, permission_module,
   permission_type, permission_status, url_path, is_universal)
VALUES
  (gen_random_uuid(), 'Decisiones y acuerdos',
   'Registro institucional de decisiones y acuerdos por sujeto',
   'my-space', 'write', 'active', '/modules/general-tools/decisions.html', false);
```
   Asignar este permiso (vía roles) **solo a las funciones que participan** (las mismas que aparecen en `dec_type_access`).

2. **Agregar el nombre exacto `'Decisiones y acuerdos'` a una subsección de `MY_SPACE_SUBSECTIONS`** en `sidebar.js`. Si no, no se renderiza aunque exista el permiso.

3. **`validatePageAccess('Decisiones y acuerdos')`** al inicio de la página.

**Tras asignar el permiso, limpiar la cache del sidebar** (`sessionStorage` clave `schoolnet_sidebar_permissions`).

> Dos capas que deben mantenerse alineadas: el **permiso** abre la página; `dec_type_access` decide **qué datos** se ven. Quien tenga su correo en alguna lista de acceso debería tener el permiso.

---

## 8. Acciones de la interfaz

- **Buscar sujeto** (estudiante / familia / trabajador) y ver su historial accesible, con rollup familia↔estudiante.
- **Ver hilo** por tipo (recurrencia de la decisión).
- **Registrar decisión** (si `can_write`): formulario con sujeto, tipo, fecha, vigencia (año), contexto, razonamiento, decisión, participantes. Al guardar, congelar autor (`user_id` + nombre + correo funcional).
- **Editar** (titulares con `can_write` del tipo).
- **Admin de tipos y listas de acceso** (pantalla aparte).
- Mostrar en cada entrada "Decidido por <nombre congelado> (<correo funcional>) el <fecha>".

---

## 9. Gobernanza

- Datos sensibles (menores y acuerdos laborales): el acceso estricto por lista de funciones del tipo es la salvaguarda.
- Las **escrituras** quedan en el `audit_log` global (recordar el patrón `x-app-user-id` para registrar el usuario real, no `'DB: postgres'`).
- **Auditoría de lectura** (quién consultó): deseable para lo más sensible, pero **fuera de v1** (los GET de PostgREST no disparan triggers; requeriría registro explícito). Dejar como evolución.

---

## 10. Roadmap por fases (con criterios de aceptación)

**Fase 1 — Base de datos.** Crear `dec_decision_types`, `dec_type_access`, `dec_entries` (cada sentencia aparte, con `DISABLE RLS`). Sembrar un tipo de prueba (Beca) con su lista (`contabilidad@` escribe, `dafi@` lee). DEV primero.
*Aceptación:* tablas con RLS deshabilitada; FKs válidas (incluida `student_id` integer); seed presente.

**Fase 2 — Página y lectura.** Vista que lista el historial accesible filtrado por correo funcional; búsqueda de sujeto; rollup familia↔estudiante; vista de hilo por tipo.
*Aceptación:* un usuario `contabilidad@` ve entradas de Beca; un usuario sin funciones ve vacío; el coordinador académico no ve Beca.

**Fase 3 — Registrar decisión.** Formulario; escritura solo con `can_write`; autoría congelada.
*Aceptación:* `contabilidad@` crea una Beca; la entrada guarda `author_user_id` + nombre + correo funcional; un no-escritor no puede crear ese tipo.

**Fase 4 — Edición y admin de tipos/accesos.** Editar entradas (con `can_write`); pantalla para gestionar `dec_decision_types` y `dec_type_access`.
*Aceptación:* cambios en la lista de acceso se reflejan de inmediato; solo escritores editan.

**Fase 5 — Permiso y menú (Mi Espacio, no universal).** Insertar permiso, agregar a `MY_SPACE_SUBSECTIONS`, `validatePageAccess`, limpiar cache.
*Aceptación:* el ítem aparece solo para usuarios con el permiso; abre la página.

**Fase 6 — PROD.** Replicar tablas y permiso; merge del frontend; verificación.

**Fases posteriores (no v1):** surfacing contextual desde Admisiones/Presupuesto/TH (leen las mismas tablas); consulta en lenguaje natural con Rigoberto vía `ai_table_access`, respetando permisos; auditoría de lectura.

---

## 11. Decisiones

**Tomadas:**
- Sujeto polimórfico con `subject_type` + tres FK tipadas anulables + `CHECK` (por `student_id` integer).
- Acceso por tipo → lista de funciones por **correo funcional**; lectura por estar en la lista, escritura por `can_write`.
- Sin acceso del lado del sujeto. Confidencialidad por mapeo tipo→funciones (sin niveles por entrada).
- Autoría congelada (`author_user_id` + nombre + correo funcional).
- Hilos derivados por (sujeto + tipo); rollup familia↔estudiante.
- Vive en **Mi Espacio**, página única, **permiso NO universal**, nombre sugerido "Decisiones y acuerdos".
- Control por capa de aplicación (RLS deshabilitada).

**A confirmar (producto / datos):**
- Nombre definitivo ("Decisiones y acuerdos" sugerido).
- Catálogo inicial de tipos y sus listas de funciones (entrada de datos institucional).
- Vigencia: se modeló `academic_year_id` (nullable). Confirmar si algún tipo necesita además un período libre.
- ¿Se permite eliminar entradas y quién? (sugerencia: no eliminar; marcar inactivas o anexar corrección, por ser memoria institucional).

---

## 12. Convenciones

- Prefijo `dec_` (coherente con `pln_`, `sup_`, `teval_`, `ie_`).
- El correo (`users.user_mail` = `workers.email`) es funcional y es la llave de acceso.
- **`students.student_id` es integer** (no uuid): cuidarlo en filtros y FKs.
- `supabaseRequest(endpoint, { method, body })`: objeto de opciones; sin `headers`.
- Cada tabla nueva: `DISABLE ROW LEVEL SECURITY` explícito; ejecutar sentencias SQL una por una.
- Sin gradientes en la UI.
