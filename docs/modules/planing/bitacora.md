# Bitácora — Módulo de Planeación de Clases

**Sistema:** SchoolNet (Colegio Tilatá)
**Módulo:** `planning`
**Inicio del desarrollo:** Mayo 2026
**Documento de referencia:** `MODULO_PLANEACION_v1.0_Especificacion.md`

---

## Propósito de esta bitácora

Registrar el avance del desarrollo del módulo, las decisiones tomadas durante la implementación, los puntos donde nos detuvimos y los pendientes. Permite retomar el trabajo en cualquier momento sin perder contexto.

Se actualiza al cerrar cada sub-paso (no en cada mensaje).

---

## Convenciones

- **Estado de cada sub-paso:** `Pendiente` / `En curso` / `Aplicado en DEV` / `Aplicado en PROD` / `Cerrado`
- **Hitos** marcados con `🔵` (en curso), `✅` (cerrado), `⏸️` (pausado/bloqueado)
- Las decisiones tomadas durante el desarrollo (no documentadas en el SPEC v1.0) se registran en la sección "Decisiones de implementación".

---

## Plan de desarrollo (revisado el 25 de mayo de 2026)

**Cambio:** se eliminó el paso original "3 - `index.html` del módulo" porque la arquitectura actual de SchoolNet usa sidebar lateral en lugar de índices por módulo (decisión arquitectónica del proyecto de Reestructuración de Módulos). Los pasos posteriores se renumeran.

| # | Sub-paso | Estado |
|---|---|---|
| 1.1 | SQL — Catálogos (9 tablas + seeds) | ✅ Cerrado |
| 1.2 | SQL — Tablas principales | ✅ Cerrado |
| 1.3 | SQL — Tablas de relación M:N | ✅ Cerrado |
| 1.4 | SQL — Índices recomendados | ✅ Cerrado |
| 1.5 | SQL — Permisos | ✅ Cerrado |
| 2 | `config.js` + `sidebar.js` — registro del módulo | ✅ Cerrado |
| 2.1 | SQL correctivo — eliminar permiso huérfano 'Planeación' (índice) | ✅ Cerrado |
| 3 | `catalogs.html` — gestión de catálogos | ✅ Cerrado en DEV y PROD |
| 3.1 | SQL correctivo — DISABLE RLS en las 29 tablas del módulo | ✅ Cerrado (DEV y PROD) |
| 4 | `unit-form.html` — formulario de Unidad de Indagación | ⏸️ Reformulado tras hallazgos de coordinación |
| 4.0 | SQL — ampliación de esquema (grades.program_id, academic_areas.coordinator_worker_id) | ✅ Cerrado — aplicado en DEV y PROD |
| 4.0a | Ampliar interfaz de gestión de grados para asignar programa | ✅ Cerrado en DEV y PROD |
| 4.0b | Ampliar interfaz de áreas (`academic-areas.html`) para asignar coordinador | ✅ Cerrado en DEV y PROD |
| 4.0c | Poblar datos vía las interfaces ampliadas | 🔵 Pendiente operativo en PROD |
| 4.1 | Refactor `unit-form.html` con modelo definitivo (control de acceso + selector de grado + pre-carga colaboradores) | ✅ Cerrado en DEV y PROD |
| 4.2 | Gestión de ciclos | ✅ Cerrado en DEV y PROD |
| 4.3a | Cierre de la unidad (3 reflexiones finales) | ✅ Cerrado en DEV y PROD |
| 4.3b | Comentarios polimórficos (`pln_comments`) | ✅ Cerrado en DEV y PROD |
| 4.3c | Notificaciones por email de comentarios | Pendiente |
| 5 | `units.html` — listado de UIs | Pendiente |
| 6.1 | `my-planners.html` — listado y creación de planeadores (modelo planeador-por-grado) | ✅ Cerrado en DEV y PROD |
| 6.2 | `planner-form.html` — formulario de Planeador de Área | ✅ Cerrado en DEV y PROD |
| 6.2.A | Esqueleto + control de acceso (4 caminos) + polling de concurrencia + header informativo | ✅ Cerrado en DEV y PROD |
| 6.2.B | Bloque 1 — Vinculación con UI + tipos de conexión IB | ✅ Cerrado en DEV y PROD |
| 6.2.C | Bloque 2 — Marco curricular (Quill, ATL, campos simples) | ✅ Cerrado en DEV y PROD |
| 6.2.D | Bloque 3 — Criterios de evaluación (tabla dinámica con atomicidad) | ✅ Cerrado en DEV y PROD |
| 6.2.E | Bloque 4 — Reflexión del trimestre (4 Quill) | ✅ Cerrado en DEV y PROD |
| 6.2.F | Bloque 5 — Ciclos del planeador (CRUD + cuerpo editable + atomicidad) | ✅ Cerrado en DEV y PROD |
| 6.2.G | Bloque 6 — Comentarios polimórficos (planner + cada ciclo) | ✅ Cerrado en DEV y PROD |
| 7 | `planners.html` — listado general de planeadores (para coordinadores) | Pendiente |
| 8 | Comentarios en ambos forms | Pendiente |
| 9 | `coordinator-area.html` y `coordinator-program.html` | Pendiente |

---

## Avance

### Paso 1.1 — Catálogos ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado

**Tablas creadas (9):**
1. `pln_ib_themes` — 6 filas
2. `pln_ib_key_concepts` — 8 filas
3. `pln_ib_atl_skills` — 10 filas
4. `pln_ib_learner_profile` — 10 filas
5. `pln_tilata_attributes` — 0 filas (vacía intencionalmente)
6. `pln_action_types` — 5 filas
7. `pln_action_scope` — 2 filas
8. `pln_connection_types` — 6 filas
9. `pln_inquiry_stages` — 4 filas

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — conteo: 6, 8, 10, 10, 0, 5, 2, 6, 4
**Aplicado en PROD:** ✅ 25 de mayo de 2026 — conteo: 6, 8, 10, 10, 0, 5, 2, 6, 4

---

### Paso 1.2 — Tablas principales ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado

**Tablas creadas (7):**
1. `pln_units` — Unidad de Indagación
2. `pln_unit_cycles` — Ciclos de la UI
3. `pln_unit_cycle_areas` — Áreas que participan en un ciclo de UI
4. `pln_planners` — Planeador de Área
5. `pln_planner_cycles` — Ciclos del planeador de área
6. `pln_planner_assessment_criteria` — Criterios de evaluación con niveles
7. `pln_comments` — Comentarios polimórficos

**Foreign Keys creadas: 18** (cifra real, mayor a la estimación inicial de ~12 en el comentario del SQL)

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — verificación: 7 tablas + 18 FKs correctas
**Aplicado en PROD:** ✅ 25 de mayo de 2026

---

### Paso 1.3 — Tablas de relación M:N ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado

**Tablas creadas (13):**

Vinculadas a UI (10):
1. `pln_unit_collaborators` — UI ↔ workers (con flag `is_lead`)
2. `pln_unit_key_concepts` — UI ↔ conceptos clave
3. `pln_unit_atl_skills` — UI ↔ ATL
4. `pln_unit_learner_profile` — UI ↔ atributos perfil IB
5. `pln_unit_tilata_attributes` — UI ↔ atributos Tilatá
6. `pln_unit_subjects` — UI ↔ asignaturas (con `description`)
7. `pln_unit_grades` — UI ↔ grados
8. `pln_unit_action_types` — UI ↔ tipos de acción
9. `pln_unit_action_scope` — UI ↔ ámbito local/global
10. `pln_unit_cycle_connections` — cycle_area ↔ tipos de conexión

Vinculadas a planeador de área (3):
11. `pln_planner_courses` — planeador ↔ courses
12. `pln_planner_atl_skills` — planeador ↔ ATL
13. `pln_planner_connections` — planeador ↔ tipos de conexión

**Total de tablas del módulo tras este paso: 29** (9 catálogos + 7 principales + 13 M:N)

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — 13 M:N + total 29
**Aplicado en PROD:** ✅ 25 de mayo de 2026 — 13 M:N + total 29

---

### Paso 1.4 — Índices recomendados ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado

**Índices creados: 24** (corrección: la estimación inicial en el comentario del SQL decía 21; el SQL realmente creaba 24, todos con prefijo `idx_pln_*`)

Distribución por tabla:
- `pln_units`: 4 índices
- `pln_unit_cycles`: 1
- `pln_unit_cycle_areas`: 2
- `pln_unit_collaborators`: 1
- `pln_unit_grades`: 1
- `pln_unit_subjects`: 1
- `pln_planners`: 7 índices
- `pln_planner_cycles`: 1
- `pln_planner_assessment_criteria`: 1
- `pln_planner_courses`: 1
- `pln_planner_atl_skills`: 1
- `pln_comments`: 3 índices

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — 24 índices
**Aplicado en PROD:** ✅ 25 de mayo de 2026 — 24 índices

---

### Paso 1.5 — Permisos ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado

**Decisión tomada:** la asignación de permisos a roles se hará manualmente vía la interfaz existente de SchoolNet, no por SQL desde este flujo de desarrollo. El paso 1.5 solo crea los permisos en la tabla `permissions`.

**Permisos creados (8) con `permission_module = 'Planeación'`:**
1. `Planeación` → `/modules/planning/index.html`
2. `Crear unidad de indagación` → `/modules/planning/unit-form.html`
3. `Gestionar unidades de indagación` → `/modules/planning/units.html`
4. `Crear planeador de área` → `/modules/planning/planner-form.html`
5. `Gestionar planeadores de área` → `/modules/planning/planners.html`
6. `Coordinar planeación de área` → `/modules/planning/coordinator-area.html`
7. `Coordinar planeación de programa` → `/modules/planning/coordinator-program.html`
8. `Administrar catálogos de planeación` → `/modules/planning/catalogs.html`

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — 8 permisos
**Aplicado en PROD:** ✅ 25 de mayo de 2026 — 8 permisos

**Pendiente operativo (no bloqueante para desarrollo):** asignar los 8 permisos a los roles correspondientes desde la UI de administración de permisos del sistema. Recomendación de asignación inicial:
- Permisos de docente (1-5) → rol(es) de docente
- `Coordinar planeación de área` → rol de coordinador de área
- `Coordinar planeación de programa` → rol de coordinador de programa
- `Administrar catálogos de planeación` → super admin
---

### Paso 2 — `config.js` + `sidebar.js` ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado

**Ediciones aplicadas:**

1. **`sidebar.js` — `SIDEBAR_MODULE_ORDER`**: agregada entrada de Planeación en un bloque nuevo "Académico" entre `teacher-eval` y la sección "Sistema de gestión":
```javascript
   { id: 'planning', name: 'Planeación', icon: 'bi-journal-bookmark', color: '#2C5F9B' }
```

2. **`sidebar.js` — `MODULE_ITEM_ORDER`**: agregada entrada `'planning'` al final del objeto con el orden de los 7 items operativos (excluyendo el permiso `'Planeación'` que representa el acceso al índice, no un ítem del sidebar).

3. **`config.js` — `APP_CONFIG.modules`**: agregada entrada del módulo al final del array para que `getModuleFolder('Planeación')` funcione correctamente en `generateBreadcrumbs()`.

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — Vercel construye OK
**Aplicado en PROD:** ✅ 25 de mayo de 2026

**🔧 Decisión correctiva sobre `permission_module`:**

Durante este paso descubrimos que el patrón establecido en SchoolNet es usar **slug en inglés minúscula** para `permission_module` (ej: `hr`, `new-students`, `teacher-eval`, `institutional-eval`), no el nombre legible en español. El SPEC v1.0 sección 3.2 indicaba erróneamente `permission_module = 'Planeación'`. Como el sidebar busca permisos por `mod.id` (que es `'planning'` en `SIDEBAR_MODULE_ORDER`), los permisos creados originalmente con `permission_module = 'Planeación'` no quedaban vinculados al render del sidebar.

**Corrección aplicada:**
```sql
UPDATE public.permissions
SET permission_module = 'planning'
WHERE permission_module = 'Planeación';
```

Aplicado en DEV ✅ y PROD ✅. Verificación final: 8 permisos con `permission_module = 'planning'`.

**Validación visual:** módulo "Planeación" aparece correctamente en el sidebar entre "Evaluación de Desempeño" e "Indicadores", con el ícono `bi-journal-bookmark` y color `#2C5F9B`.

**Nota para el documento v1.0:** la sección 3.2 del SPEC `MODULO_PLANEACION_v1.0_Especificacion.md` debe actualizarse: `permission_module = 'planning'` (no `'Planeación'`). Pendiente de actualización del documento principal.

---

### Paso 2.1 — SQL correctivo: eliminar permiso huérfano ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado

**SQL ejecutado:** `DELETE` del permiso `'Planeación'` con `url_path = '/modules/planning/index.html'`.

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — verificación: 7 permisos del módulo
**Aplicado en PROD:** ✅ 25 de mayo de 2026 — verificación: 7 permisos del módulo

**Resultado:** el módulo Planeación tiene 7 permisos en ambos ambientes, todos con `permission_module = 'planning'`, todos con URLs hacia páginas funcionales reales.

---

### Paso 3 — `catalogs.html` ✅

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de cierre en DEV:** 25 de mayo de 2026
**Fecha de cierre en PROD:** 27 de mayo de 2026
**Estado:** Cerrado — CRUD funcional en DEV y PROD (creación, edición, activar/desactivar)

**Alcance entregado:**
- Una página con 9 tabs Bootstrap, uno por catálogo
- 9 modales independientes con su CRUD básico
- Validación de acceso con `validatePageAccess('Administrar catálogos de planeación')`
- Empty state personalizado para `pln_tilata_attributes` (catálogo vacío al inicio)
- Advertencia visual amarilla en modales de catálogos IB estándar
- Campo `code` editable solo en creación, disabled en edición (catálogos con código)
- Función genérica `renderCatalogoConCodigo` para reducir duplicación
- Manejo de error de unicidad con mensaje específico
- Sanitización con `escapeHtml` para defensa básica contra XSS

**Estructura final del archivo:**
- 1703 líneas, ~70 KB
- Patrón visual replicado de `services-config.html` con color primario `#2C5F9B`

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — CRUD funcional verificado por el usuario
**Aplicado en PROD:** ✅ 27 de mayo de 2026 (PR de `developmen` → `main`)

---

### Paso 3.1 — SQL correctivo: DISABLE RLS en las 29 tablas ✅

**Fecha de inicio:** 25 de mayo de 2026
**Estado:** Cerrado en DEV y PROD.

**Diagnóstico:** Durante la prueba de CRUD en `catalogs.html`, el primer intento de INSERT falló con `42501: new row violates row-level security policy for table "pln_ib_themes"`. La verificación con `pg_tables.rowsecurity` reveló que **las 29 tablas del módulo tenían RLS activado**, a pesar de que los SQL de los pasos 1.1, 1.2 y 1.3 incluían `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` para cada una.

**Causa:** No identificada con certeza. Hipótesis: trigger automático en el ambiente DEV de Supabase que reactiva RLS post-creación de tablas, o que los ALTER no se commiteron en la transacción original. La memoria del proyecto ya advertía: "Supabase enables RLS by default on table creation" — la línea de defensa `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` por sí sola en el mismo bloque no resultó suficiente.

**SQL aplicado:**
```sql
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename LIKE 'pln_%'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t.tablename);
    END LOOP;
END $$;
```

**Aplicado en DEV:** ✅ 25 de mayo de 2026 — verificación: 29 tablas con `rowsecurity = false`. CRUD de catálogos confirmado funcional.
**Aplicado en PROD:** ✅ Verificado el 27/05/2026: las 29 tablas `pln_*` en PROD ya tienen RLS deshabilitado.

---

### Paso 4 — `unit-form.html` ⏸️ Reformulado

**Fecha de inicio original:** 25 de mayo de 2026
**Fecha de pausa:** 25 de mayo de 2026
**Fecha de reformulación:** 25 de mayo de 2026

**Estado:** El sub-paso 4.1 que se construyó originalmente (archivo `unit-form.html` de 1423 líneas) queda **descartado** como base. Se reescribe sobre el modelo definitivo definido tras la conversación con coordinación de programa.

---

#### Modelo definitivo de control de acceso a UIs

**Confirmaciones de coordinación de programa (25 de mayo de 2026):**

1. **Granularidad:** una UI pertenece al **grado**, no al curso individual. Cuarto A y Cuarto B comparten **una sola UI** del grado Cuarto.
2. **Quién crea:** workers que tienen asignación de la asignatura "Unit of Inquiry" en algún curso del grado (vía `academic_assignments` con `subject_id` = `1912f6fb-479a-42b3-a6ce-7e8328f33b09`).
3. **Quién edita una UI existente** (cualquiera de las siguientes condiciones):
   - El autor (`pln_units.created_by`)
   - Cualquier worker en `pln_unit_collaborators` de la UI
   - Cualquier worker con asignaciones académicas activas en alguno de los cursos del grado de la UI (en el año académico vigente)
   - El coordinador de área académica de al menos una de las materias vinculadas a la UI
   - El director del programa al que pertenece el grado de la UI (vía `programs.program_director_email`)
   - El **director de la sección** del grado de la UI (vía `sections.director_email`) — incorporado el 26/05/2026 para cubrir la dirección de preescolar y otras direcciones de sección
4. **Pre-carga automática de colaboradores al crear:** todos los workers con asignaciones académicas en el grado se agregan automáticamente como `pln_unit_collaborators`. El creador es `is_lead = true`, los demás `is_lead = false`. El creador puede quitar manualmente a quienes no apliquen.

---

#### Hallazgos técnicos durante la verificación

Consultas a la BD revelaron dos huecos en el modelo de datos que **deben resolverse antes** de codificar el formulario:

1. **No hay relación nativa entre `grades` y `programs`.** `grades` no tiene `program_id`. Sin esa columna, no podemos saber qué director de programa puede editar una UI.

2. **No hay relación nativa entre `academic_areas` y un coordinador.** `academic_areas` no tiene `coordinator_worker_id`. Sin esa columna, no podemos saber qué coordinador de área puede editar una UI.

---

### Paso 4.0 — SQL: ampliación de esquema ✅

**Fecha:** 25 de mayo de 2026 (entrega del SQL) / 26 de mayo de 2026 (aplicación)
**Estado:** Cerrado — aplicado en DEV y PROD.

**Decisiones de diseño:**

- `grades.program_id` es **1:1** (un grado pertenece a un solo programa: PEP, PAI o PD). Campo directo en la tabla.
- `academic_areas.coordinator_worker_id` es **1:N** (un área tiene UN solo coordinador, pero un worker puede coordinar varias áreas). Confirmado por el usuario explícitamente. Campo directo en la tabla, sin restricción UNIQUE sobre `coordinator_worker_id`.

**SQL a ejecutar (DEV primero, luego PROD):**

```sql
-- 1. Agregar program_id a grades
ALTER TABLE public.grades
ADD COLUMN program_id uuid REFERENCES public.programs(program_id);

-- 2. Agregar coordinator_worker_id a academic_areas
ALTER TABLE public.academic_areas
ADD COLUMN coordinator_worker_id uuid REFERENCES public.workers(worker_id);

-- 3. Índices para queries de control de acceso
CREATE INDEX idx_grades_program ON public.grades(program_id);
CREATE INDEX idx_academic_areas_coordinator ON public.academic_areas(coordinator_worker_id);
```

**Verificación esperada:** 2 columnas nuevas (ambas nullable inicialmente), 2 índices nuevos.

**Aplicado en DEV:** ✅ 26 de mayo de 2026
**Aplicado en PROD:** ✅ 26 de mayo de 2026
**Verificación:** ambas tablas con `data_type = 'uuid'` y `is_nullable = 'YES'` en los dos ambientes.

---

### Paso 4.0a — Ampliar UI de gestión de grados ✅

**Fecha de inicio:** 26 de mayo de 2026
**Fecha de cierre:** 26 de mayo de 2026
**Estado:** Cerrado — aplicado y validado en DEV y PROD.

**Archivo modificado:** `/modules/config/grades.html` (rama `developmen`)

**Cambios aplicados:**

1. Nueva variable global `allPrograms` para almacenar la lista de programas activos.
2. Nueva función `loadPrograms()` que consulta `/programs?program_status=eq.active`.
3. Nueva función `populateProgramSelects()` que pobla los dos selectores de programa (modal de edición + filtro).
4. Nuevo campo "Programa" en el modal de crear/editar grado (opcional, sin asterisco rojo de obligatorio).
5. Inclusión de `program_id` en los payloads de `createGrade()` y `updateGrade()` (null si está vacío).
6. Llenado de `gradeProgram` en `editGrade()` al abrir el modal de edición.
7. Visualización del programa en cada tarjeta del grid (con fallback "Sin programa" en cursiva gris si no está asignado).
8. Filtro por programa en la barra de filtros, con su lógica integrada en `filterGrades()` y limpieza en `clearFilters()`.

**Decisión de diseño:** el campo Programa quedó **opcional**, no obligatorio. Permite la convivencia con grados que no pertenezcan a un programa formal IB (preescolar antes del PEP, grados especiales, etc.). Si más adelante coordinación pide volverlo obligatorio, es un ajuste mínimo (agregar `required` al select y un asterisco al label).

**Aplicado en DEV:** ✅ 26 de mayo de 2026 — validado: edición funcional, filtro funcional, visualización en tarjetas funcional.
**Aplicado en PROD:** ✅ 26 de mayo de 2026.

**Pendiente operativo (paso 4.0c parcial):** el usuario debe asignar el programa correspondiente a cada grado (PEP, PAI, PD) desde la interfaz ampliada. Esta acción se realiza una sola vez en DEV; tras hacer PR a PROD se repite en PROD.

---

### Paso 4.0b — Ampliar `academic-areas.html` con selector de coordinador ✅

**Fecha de inicio:** 26 de mayo de 2026
**Fecha de cierre:** 26 de mayo de 2026
**Estado:** Cerrado — aplicado y validado en DEV y PROD.

**Archivo modificado:** `/modules/config/academic-areas.html` (rama `developmen`)

**Cambios aplicados:**

1. Nueva variable global `workers` para almacenar la lista de workers activos.
2. Nueva función `cargarWorkers()` que consulta `/workers?worker_status=eq.active` ordenado por apellido.
3. Carga en paralelo con `cargarGrados()` al inicializar.
4. Modificada la query de `cargarAreas()` para traer el coordinador anidado vía PostgREST (`coordinator:coordinator_worker_id(worker_id, worker_first_name, worker_last_name_1, worker_last_name_2)`).
5. Nuevo campo "Coordinador de área" en el modal de crear/editar área (opcional).
6. Nueva función `poblarSelectorCoordinador(selectedWorkerId)` que pobla el `<select>` y preselecciona si aplica.
7. Llamada al poblador desde `abrirModalArea()` tanto en modo crear como en modo editar.
8. Inclusión de `coordinator_worker_id` en el payload de `guardarArea()` (null si está vacío).
9. Visualización del coordinador en la lista de áreas (debajo del nombre del área, con ícono `bi-person-badge`).
10. Fix de contraste CSS: forzado `color: #1B365D` con `!important` para `.area-item.active .area-name` y `.area-item.active small` (el ítem activo no mostraba bien el texto en el azul claro de fondo).

**Decisión de diseño:** el campo Coordinador quedó **opcional**, no obligatorio. Permite áreas sin coordinador asignado (caso "Sin asignar" durante transiciones) y queda gris en cursiva.

**Aplicado en DEV:** ✅ 26 de mayo de 2026 — validado: edición funcional, visualización en lista funcional, contraste corregido.
**Aplicado en PROD:** ✅ 26 de mayo de 2026.

---

### Paso 4.0c — Poblar datos vía las interfaces 🔵

**Depende de:** 4.0a y 4.0b cerrados ✅

**Acciones del usuario (en DEV primero, luego en PROD tras hacer PR):**

1. Ir a `grades.html` y asignar el programa correspondiente a cada grado (PEP, PAI, PD).
2. Ir a `academic-areas.html` y asignar coordinador a cada área académica que tenga uno designado.

**Pendiente de ejecución por el usuario en PROD.**

---

### Paso 4.1 — Refactor de `unit-form.html` (sobre el modelo nuevo) ✅

**Fecha de cierre en DEV:** 26 de mayo de 2026.
**Fecha de cierre en PROD:** 26 de mayo de 2026.

#### Bloques implementados

**Bloque 1 — Esqueleto + control de acceso ✅**

Documentado en detalle arriba: validaciones de creación, `canEdit()` con 6 caminos, pre-carga de colaboradores, modo solo lectura, pantalla de error amigable.

**Bloque 2 — Bloque informativo de coordinaciones ✅**

- Función `renderCoordinationsInfoBlock()` que calcula y muestra debajo de los colaboradores:
  - Coordinadores de las áreas académicas de las materias vinculadas a la UI.
  - Director del programa del grado.
  - Director de la sección del grado.
- Las personas con múltiples roles aparecen una sola vez con todos sus roles concatenados con " · ".
- El bloque se **recalcula automáticamente** cuando el creador agrega o quita materias.
- Si no hay coordinaciones disponibles, muestra mensaje guía sugiriendo vincular materias.

#### Archivos modificados

- `/modules/planning/unit-form.html`: refactor completo con Bloques 1 + 2.
- `/modules/planning/my-units.html`: nuevo archivo (711 líneas), listado de UIs del grado del docente con selector de año.
- Permiso "Crear unidad de indagación": `url_path` actualizado a `/modules/planning/my-units.html`.
- 10 triggers de auditoría agregados (`pln_*_audit_trigger`).
- Función `audit_trigger_function()` actualizada para mapear correctamente el `row_id` de las nuevas tablas.

**Cambios aplicados en `unit-form.html`:**

1. **Variables globales nuevas:** `currentWorkerEmail`, `myUIAssignedGrades`, `unitGradeId`, `unitProgramId`, `unitSectionId`, `allSections`, `allAreas`, `allPrograms`. Constante `SUBJECT_UI_ID`.

2. **`loadCurrentWorker()` refactorizado:** la unión `users ↔ workers` es por **email** (`users.user_mail` = `workers.email`), no por `user_id`. La tabla `workers` no tiene columna `user_id`.

3. **`loadContext()` ampliado:** carga `sections`, `academic_areas` (con `coordinator_worker_id`), `programs` (con `program_director_email`) y las asignaciones de "Unit of Inquiry" del worker actual en el año vigente.

4. **`crearNuevaUI()` reescrito:**
   - Valida que el worker tenga asignación UI en exactamente 1 grado (0 → error, 2+ → error).
   - Deriva `program_id` del grado.
   - Valida que el grado tenga `program_id` configurado.
   - Vincula la UI con el grado vía `pln_unit_grades`.
   - Llama a `precargarColaboradores()`.

5. **`precargarColaboradores()` nueva:** busca todos los workers con asignaciones activas en cualquier curso del grado y los inserta como colaboradores en batch. El creador queda con `is_lead = true`, los demás con `is_lead = false`.

6. **`canEdit()` nueva:** evalúa los 6 caminos en orden con early return. El camino 3 (docente del grado) consulta BD en cada evaluación; los demás se evalúan contra datos en memoria.

7. **`aplicarModoSoloLectura()` nueva:** banner amarillo + disabled global de inputs/selects/textareas, incluidos los Quill.

8. **`mostrarPantallaError()` nueva:** pantalla amigable con icono, mensaje y botón "Volver al inicio". Reemplaza los `throw new Error()` no capturados que dejaban la pantalla en blanco.

9. **`cargarUI()` ampliado:** carga el grado vía `pln_unit_grades`, cachea `unitProgramId` y `unitSectionId`, invoca `canEdit()` y aplica modo solo lectura si corresponde.

**Cambio adicional en BD:** se actualizó el `url_path` del permiso "Crear unidad de indagación" para que apunte a `/modules/planning/unit-form.html?new=true` (no `unit-form.html` a secas). Esto permite que el archivo distinga entre flujo de creación y flujo de edición.

**Bug menor encontrado en `sections.html`:** typo `alidatePageAccess` (línea 308) — falta la "v". El usuario fue informado, pendiente corregir cuando se aborde.

**Tests realizados en DEV:**

- ✅ Test 2 (intento de creación sin asignación UI): Hernán como superadmin → pantalla amigable con mensaje "No tiene asignación de Unit of Inquiry en el año académico vigente...". El superadmin no puede saltarse el sistema de roles pedagógicos.
- ✅ Validación 3 (grado sin programa): Margaret Belzner intentó crear UI en Tercero → pantalla amigable con mensaje "El grado 'Tercero' no tiene programa asignado. Pida al administrador que configure el programa en 'Gestión de Grados'." Validación correcta.

**Pendiente para validar completamente:**

- Asignar programa (PEP, PAI, PD) a cada grado en DEV vía la UI ampliada en el paso 4.0a.
- Reintento de creación de UI por un docente UI con grado correctamente configurado.
- Validar pre-carga de colaboradores en BD.
- Validar el modo solo lectura para un worker que no cumpla ninguno de los 6 caminos.

---

### Paso 4.2 — Gestión de ciclos ✅

**Estado:** Sub-bloque A cerrado en DEV (26/05/2026). Sub-bloque B cerrado en DEV (27/05/2026) y PROD (28/05/2026).

#### Concepto de "ciclo" en el modelo

Aclaración importante: **los ciclos del módulo Planeación NO son los 6 ciclos del año académico**. El campo `academic_years.cycles = 6` se refiere a la rotación semanal de "días tipo" D1-D6 que el colegio usa para horarios (algunos años el ciclo semanal es de 6 o 7 días en lugar de 5), no a ciclos pedagógicos.

Los ciclos de `pln_unit_cycles` son **iteraciones pedagógicas internas de la UI**. Cada ciclo es una vuelta de trabajo con su propia etapa de indagación (Sintonización, Indagación, Acción, Reflexión), tema, fechas, preguntas guía, resultados y experiencias de aprendizaje, evaluaciones, recursos, diferenciación, reflexión docente y preguntas emergentes del estudiante.

#### Decisiones de diseño

- **Ciclos en orden secuencial obligatorio:** `cycle_number` empieza en 1 y debe ser estrictamente consecutivo. Al eliminar un ciclo, los siguientes se renumeran automáticamente para mantener la secuencia.
- **Acordeones individuales:** cada ciclo es una tarjeta colapsable. Solo un ciclo expandido a la vez (auto-colapso de los demás).
- **Header del ciclo cerrado** muestra: número (#1, #2...), etapa de indagación, tema, rango de fechas.
- **Sin drag&drop para reordenar:** se descartó por baja utilidad. El orden lo determina el `cycle_number`.
- **Eliminación con confirmación + cascada** (CASCADE en BD para áreas y conexiones).
- **Autosave coherente con el resto del formulario** (pendiente implementar en Sub-bloque B).
- **Modo solo lectura heredado** (pendiente aplicar en Sub-bloque B).

#### Sub-bloque A — CRUD básico de ciclos ✅

Implementado en `unit-form.html`:

- **CSS:** estilos para `cycle-card`, `cycle-header`, `cycle-body`, badges de número y etapa, fechas, botón de eliminar.
- **HTML:** estructura del bloque "Ciclos de la unidad" con botón "Agregar ciclo" y contenedor para tarjetas.
- **JS — Variables globales:** `unitCycles`, `expandedCycleId`, `catalogInquiryStages`.
- **JS — Carga:** `cargarCiclos()` invocada al final de `cargarRelaciones()`. Catálogo `pln_inquiry_stages` cargado en `loadContext()`.
- **JS — Render:** `renderCycles()`, `renderCycleCard()`, `renderCycleBody()` (provisional, solo botón eliminar), `toggleCycleExpansion()`, `formatShortDate()`.
- **JS — Acciones:** `agregarCiclo()`, `eliminarCiclo()`, `renumerarCiclos()`.
- **Listener:** botón "Agregar ciclo" conectado en la inicialización.

Tests realizados en DEV:
- ✅ Crear ciclo #1, #2, #3.
- ✅ Auto-colapso de otros ciclos al expandir uno.
- ✅ Eliminar ciclo con renumeración automática.
- ✅ Verificación BD: `pln_unit_cycles` registra los ciclos con `cycle_number` consecutivo.

#### Sub-bloque B — Cuerpo editable + áreas + conexiones ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026. **Fecha de cierre en PROD:** 28 de mayo de 2026.

Implementado en `unit-form.html`:

- **CSS:** estilos para `cycle-field-label`, `cycle-field-hint`, `summative-toggle`, `summative-editor-wrapper`, `cycle-areas-table` y variantes (filas inactivas, fila participante, celdas de conexión), `cycle-areas-empty`.
- **HTML:** estructura completa del cuerpo del ciclo dentro de `renderCycleBody()` con 6 secciones (Identidad y temporalidad, Indagación, Aprendizaje, Evaluación, Recursos y diferenciación, Reflexión) más sección de Áreas. Cada Quill tiene un id único `cycle-quill-{field}-{cid}`. La sumativa lleva un toggle (checkbox + wrapper oculto) y la tabla de áreas un container `cycle-areas-container-{cid}`.
- **JS — Variables globales nuevas:** `cycleQuills` ({cycleId: {field: QuillInstance}}), `catalogConnectionTypes`, `cycleAreasState` ({cycleId: Map<area_id, {cycle_area_id, connections: Set}>}).
- **JS — Catálogos:** se agregó `pln_connection_types` al `Promise.all` de `loadContext()`.
- **JS — Carga:** `cargarCiclos()` ahora también carga `pln_unit_cycle_areas` y `pln_unit_cycle_connections` para todos los ciclos en dos queries por lote.
- **JS — Render e hidratación:** `initCycleQuills(cycle)` crea 7 editores por ciclo (Idea/Líneas/Diferenciación de UI ya existían); `hidratarCiclo(cycle)` puebla campos simples + Quill (vía `setQuillHTML()` con `clipboard.dangerouslyPasteHTML`) + estado del toggle sumativo; al final invoca `renderCycleAreas(cycleId)`.
- **JS — Autosave:** `patchCycle()` (PATCH a `pln_unit_cycles` actualizando solo la columna modificada + `updated_at`), `debouncedPatchCycle()` con debounce 2s y blur que cancela el debounce. Listeners en `setupCycleAutosave(cycle)`:
  - Texto plano debounce: `topic`, `student_questions_emerging`, `resources`.
  - Inmediato (change): `inquiry_stage_id`, `start_date`, `end_date`.
  - Quill debounce: `guiding_questions`, `learning_outcomes`, `learning_experiences`, `formative_assessment`, `differentiation`, `teacher_reflection`.
  - Sumativa: checkbox toggle (marcar = mostrar editor sin guardar todavía; desmarcar = ocultar + setText('') + PATCH inmediato a NULL); Quill sumativa con debounce 2s solo si está visible.
  - **Filtro `source === 'user'`** en todos los listeners `text-change` de Quill para ignorar cambios programáticos durante la hidratación.
- **JS — Header dinámico:** `refrescarHeaderCiclo(cycleId)` actualiza solo el header de la tarjeta (badge #N, pill de etapa, topic, rango de fechas) sin tocar el cuerpo, para no destruir los Quill al cambiar `topic`, `inquiry_stage_id`, `start_date` o `end_date`.
- **JS — Áreas y conexiones:** `getAreasDisponiblesParaCiclos()` filtra `allAreas` por las area_id derivadas de `selectedSubjects → academic_subjects.area_id`. `renderCycleAreas(cycleId)` pinta tabla con filas por área y 6 columnas de conexiones IB; filas inactivas en gris con conexiones deshabilitadas. `onToggleAreaParticipates()` hace POST/DELETE en `pln_unit_cycle_areas` (cycle_area_id se obtiene del POST con representación completa); el DELETE confía en CASCADE de FK para limpiar conexiones. `onToggleConnection()` hace POST/DELETE en `pln_unit_cycle_connections` con `cycle_area_id` + `connection_type_id`.
- **JS — Reactividad cruzada con materias:** al cambiar las materias en Información General (`renderSubjectsSelect` `change`), se re-renderiza la tabla de áreas de todos los ciclos para reflejar el universo actualizado de áreas disponibles.
- **JS — Modo solo lectura:** `renderCycleAreas()` consulta `isReadOnly` y deshabilita los checkboxes de la tabla recién renderizada. Los inputs/textareas/Quill de los nuevos campos quedan deshabilitados por `aplicarModoSoloLectura()` ya existente (selectores genéricos a inputs/selects/textareas dentro de `#page-content` y `quill.enable(false)` no aplica a los de ciclo porque se instancian después; en práctica el banner amarillo y los `disabled` en inputs son suficientes — observación para sub-paso futuro si se requiere endurecer).
- **JS — Limpieza al eliminar ciclo:** `eliminarCiclo()` ahora también elimina referencias en `cycleQuills[cycleId]` y cancela timers de debounce pendientes con prefijo `cycle_${cycleId}_`.

**Decisiones de diseño tomadas durante la implementación (no en el SPEC v1.0):**

- **Patrón "render una vez + toggle CSS"** para los cuerpos de ciclo: `renderCycleCard()` siempre renderiza el cuerpo (no condicionado a `isExpanded`), y `toggleCycleExpansion()` solo cambia la clase `.expanded` que en CSS controla `display`. Los Quill se inicializan una sola vez por ciclo. Alternativa descartada: destruir/recrear Quill en cada toggle (más complejo, recrea estado).
- **Filtro `source === 'user'` en `text-change` de Quill**: indispensable para no disparar autosave durante la hidratación inicial vía `clipboard.dangerouslyPasteHTML`, que emite el evento como 'api'.
- **Tabla compacta** para áreas + conexiones (vs cards por área): el universo típico de 2-4 áreas por ciclo no justifica el espacio adicional.
- **Sumativa toggleable**: checkbox guarda inmediatamente NULL al desmarcar; al marcar no escribe nada hasta que el usuario tipee. Al recargar, si la columna en BD está vacía/null, el checkbox queda desmarcado y el editor oculto.
- **Recursos como `<textarea>`** (no Quill): la mayoría de docentes usan recursos como lista corta de enlaces/materiales; coherente con `student_questions_emerging` que también es textarea. El SPEC v1.0 deja la opción abierta.
- **Áreas huérfanas no se purgan automáticamente**: si el usuario quita una materia cuya área ya tenía registros en `pln_unit_cycle_areas`/`pln_unit_cycle_connections`, los registros quedan en BD (apuntan a un area_id que ya no es alcanzable desde la UI). No se purgan automáticamente por si el usuario revierte la decisión de quitar la materia. Si esto resulta confuso en uso real, se puede agregar limpieza explícita en una iteración posterior.
- **Re-renderizado de tabla tras toggle de "Participa"**: tras INSERT/DELETE en `pln_unit_cycle_areas` se llama de nuevo `renderCycleAreas()` para refrescar la fila (clase `participates-row`/`inactive`, habilitar/deshabilitar los 6 checkboxes de conexión). Alternativa descartada: actualizar la fila manipulando el DOM directamente (más código, menos confiable).

**Hallazgo y corrección durante la implementación:**

- **Bug de timing de Quill**: en el primer intento, los Quill de ciclos no aparecían en pantalla aunque las instancias existían en memoria. Causa: `renderCycles()` se llamaba dos veces durante la carga (una desde `cargarRelaciones()` y otra desde `renderUIData()`), y la segunda llamada hacía `container.innerHTML = cardsHtml` reemplazando los `<div>` que Quill ya había transformado. La defensa inicial `if (cycleQuills[cid][field]) return;` impedía recrear los Quill, dejando referencias huérfanas a nodos del DOM destruido. Corrección: `initCycleQuills()` ahora resetea `cycleQuills[cid] = {}` antes de crear Quills nuevos, garantizando que las instancias siempre apunten a los `<div>` actualmente en el DOM.

**Tests realizados en DEV (todos exitosos):**

- ✅ Hidratación de campos al expandir un ciclo con datos previos.
- ✅ Autosave de cada uno de los 13 campos del cuerpo (texto, selects, fechas, Quill, sumativa toggleable).
- ✅ Header del ciclo se refresca al cambiar topic/etapa/fechas sin destruir Quill.
- ✅ Persistencia entre recargas para todos los campos del cuerpo.
- ✅ Tabla de áreas muestra solo áreas vinculadas a la UI vía materias.
- ✅ Marcar/desmarcar "Participa" habilita/deshabilita las conexiones de la fila.
- ✅ Marcar/desmarcar conexiones individuales (POST/DELETE en `pln_unit_cycle_connections`).
- ✅ DELETE en cascada de conexiones al desmarcar "Participa" (verificado en BD).
- ✅ Reactividad: agregar/quitar materias en Información General refresca las tablas de áreas de todos los ciclos.
- ✅ Mensaje guía cuando no hay materias vinculadas.
- ✅ Eliminar un ciclo con cambios pendientes no genera errores (debounce timers cancelados).
- ✅ Persistencia entre ciclos: marcar áreas/conexiones distintas en ciclos diferentes se conserva al recargar.
---

### Paso 4.3a — Cierre de la unidad ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026. **Fecha de cierre en PROD:** 28 de mayo de 2026.

Implementado en `unit-form.html`:

- **HTML:** reemplazado el placeholder del Bloque 3 por la sección "Reflexiones finales" con 3 editores Quill: Reflexión del maestro, Reflexión de los estudiantes, Reflexión sobre la evaluación. Cada uno con su hint orientador debajo.
- **JS — Variables globales nuevas:** `quillTeacherReflection`, `quillStudentReflection`, `quillAssessmentReflection`.
- **JS — Inicialización:** los 3 nuevos Quill se crean en `initQuillEditors()` con la misma toolbar mínima del resto del formulario.
- **JS — Hidratación:** `renderUIData()` carga el contenido de las 3 columnas (`teacher_reflection`, `student_reflection`, `assessment_reflection` de `pln_units`) usando `setQuillHTML()` con `clipboard.dangerouslyPasteHTML`.
- **JS — Autosave:** las 3 columnas se agregan al `quillMap` de `setupAutosaveListeners()` con el patrón estándar (debounce 2s, `patchUnit()` para PATCH a `pln_units`).

**Corrección aprovechada (fuera del alcance estricto del paso 4.3a):**

- **Filtro `source === 'user'` en `text-change` de los Quill de la UI**: el handler original disparaba un PATCH por cada Quill durante la hidratación inicial, porque `setQuillHTML()` emite el evento con source 'api'. No se notaba antes porque el PATCH escribía el mismo valor que ya estaba en BD, pero generaba tráfico innecesario y PATCHs innecesarios. Ahora la condición `if (source !== 'user') return;` lo previene. Coherente con la misma lógica ya aplicada en los Quill de ciclos del paso 4.2.
- **`enable(false)` extendido a los Quill de ciclos en modo solo lectura**: observación pendiente del paso 4.2 — los Quill de ciclos quedaban editables pese al banner amarillo. Corregido: `aplicarModoSoloLectura()` ahora recorre `cycleQuills` y deshabilita cada instancia.

**Tests realizados en DEV:**

- ✅ Estructura visible: los 3 Quill aparecen con toolbar y hints.
- ✅ Autosave: escribir → esperar 2s → "Guardado ✓".
- ✅ Persistencia entre recargas para los 3 campos.
- ✅ Sin PATCH innecesarios al cargar (verificado en Network del navegador).
- ⏸️ Modo solo lectura: validación funcional postpuesta. El código que deshabilita los Quill del cierre y los Quill de ciclos está escrito pero no se puede ejercitar en DEV hoy porque no hay usuarios cuyo único acceso sea por caminos 3-6 (docente del grado, coordinador de área, director de programa, director de sección). Se validará cuando se pueblen `grades.program_id` y `academic_areas.coordinator_worker_id` en DEV y existan workers con esos roles.

---

### Paso 4.3b — Comentarios polimórficos ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026. **Fecha de cierre en PROD:** 28 de mayo de 2026.

Implementado en `unit-form.html`, sobre la tabla `pln_comments` (ya creada en paso 1.2). Implementación entregada en tres etapas validadas secuencialmente: A (estructura visual + carga), B (crear raíz y respuesta), C (soft-delete por el autor).

**Decisiones de diseño tomadas para este paso (no en el SPEC v1.0):**

1. **Múltiples hilos por UI**: un hilo a nivel de la UI completa (al final del formulario, después del cierre) y un hilo por cada ciclo (al final del cuerpo del ciclo, antes del botón "Eliminar ciclo"). `entity_type` se ajusta a `'unit'` o `'unit_cycle'` según el caso. El SPEC sección 8.9 dice "Hilo de comentarios al final de cualquiera de las vistas anteriores"; se interpretó "vista" tanto a nivel de UI como de ciclo, dado que el ciclo es la unidad de planificación pedagógica con vida propia.
2. **Solo editores pueden comentar**: en modo solo lectura los compositores quedan ocultos (no solo deshabilitados). Coherente con el modelo de acceso del paso 4.1.
3. **Soft-delete del raíz preserva las respuestas**: cuando se elimina un comentario raíz con respuestas, el raíz se muestra como placeholder ("Comentario eliminado") pero las respuestas siguen visibles. Patrón de Reddit/Twitter.
4. **No hay edición de comentarios** en esta versión. Si el usuario se equivoca, debe eliminar y crear nuevamente. La columna `updated_at` existe para soportar edición si se requiere en el futuro sin migración.
5. **Notificaciones por email diferidas** al sub-paso 4.3c (separado para mantener el alcance acotado).
6. **`<textarea>` plano** (no Quill mini) para el cuerpo del comentario: coherente con tono conversacional, sin overhead de inicialización de editores ricos en cada comentario.

**Implementación:**

- **CSS**: clases `comments-thread`, `comments-list`, `comment-item` (variantes `is-reply` con margin-left y `is-deleted` en gris), `comment-avatar` (iniciales sobre fondo claro), `comment-header`, `comment-author`, `comment-date`, `comment-body` (con `white-space: pre-wrap` para respetar saltos de línea), `comment-actions`, `comment-action-btn` (variante `.danger` para el botón eliminar), `comment-composer` (variante `is-reply-composer` para respuestas), `btn-comment-submit`, `btn-comment-cancel`, `comments-empty`.

- **HTML**: bloque colapsable "Comentarios sobre la unidad" como Bloque 4 al final del formulario, con `comments-list` + compositor. En `renderCycleBody()` se añadió una sección "Comentarios del ciclo" al final del cuerpo del ciclo (antes del botón rojo de eliminar), con el mismo patrón compositor + lista.

- **JS — Variable global nueva**: `commentsByEntity` (`{'unit:<unit_id>': [...], 'unit_cycle:<cycle_id>': [...]}`).

- **JS — Carga**: `cargarComentarios()` invocado al final de `cargarRelaciones()`. Una sola query con `entity_id=in.(<unit_id>, <cycle_id_1>, <cycle_id_2>, ...)` para todos los hilos de la UI en una llamada. Trae activos y eliminados (los eliminados son necesarios para mostrar el placeholder en respuestas huérfanas).

- **JS — Render**: `renderUnitCommentsThread()` y `renderCycleCommentsThread(cycleId)` cuentan activos para el badge "(N)" en la cabecera y delegan a `renderCommentsList()` (compartida). Esta separa raíces de respuestas (`parent_comment_id` NULL o no), agrupa respuestas por padre, e itera renderizando cada raíz seguida de sus respuestas. `renderSingleComment(comment, isReply)` produce el HTML de cada item, con avatar de iniciales del autor, fecha vía `formatRelativeDate()` (helper nuevo, devuelve "hace un momento" / "hace N min" / "hace N h" / "ayer" / "hace N días" / fecha absoluta corta para más de una semana), cuerpo escapado, y bloques de acciones condicionales.

- **JS — Visibilidad de acciones**:
  - "Responder" solo en comentarios raíz activos (`!isReply && !isReadOnly`).
  - "Eliminar" solo en comentarios donde `comment.author_id === currentWorkerId && !isReadOnly`.
  - Comentarios eliminados no muestran ninguna acción (se renderizan en una rama temprana del `if (isDeleted) return ...`).

- **JS — Crear**: `crearComentario(entityType, entityId, body, parentCommentId)` hace POST a `pln_comments` con `comment_status: 'active'`. Tras éxito, agrega el comentario al estado en memoria y re-renderiza solo el hilo afectado. Compositores conectados vía `setupUnitCommentComposer()` (UI) y `setupCycleCommentComposer(cycleId)` (ciclos, invocado al final de `initCycleQuills` igual que `setupCycleAutosave`). Botón de envío deshabilitado mientras el textarea esté vacío; se vuelve a habilitar al detectar contenido no-blanco.

- **JS — Responder**: `setupReplyListeners(containerEl, entityType, entityId)` con delegación al contenedor (escucha clicks una sola vez en `unit-comments-list` y en cada `cycle-comments-list-<cid>`, marcando con `dataset.replyListenerAttached` para no duplicar). Al detectar click en `[data-role="reply"]` invoca `abrirComposerRespuesta()`, que crea un compositor secundario inyectado justo debajo del comentario raíz (vía `insertAdjacentElement('afterend', composer)`). Solo un compositor de respuesta abierto a la vez por hilo (si existe uno, se elimina antes de crear el nuevo). Botón "Cancelar" lo destruye sin guardar. Botón "Responder" llama a `crearComentario()` con `parent_comment_id` del raíz.

- **JS — Eliminar (soft-delete)**: `eliminarComentario(commentId, entityType, entityId)` muestra `confirm()` nativo y al aceptar hace PATCH `comment_status='deleted'` + `updated_at=now`. Actualiza el estado en memoria (marca el comentario como deleted) y re-renderiza el hilo. El listener `[data-role="delete"]` se agregó al mismo handler delegado de `setupReplyListeners()`, ahora con dos ramas (reply / delete).

**Tests realizados en DEV (Etapa A — carga y visual):**

- ✅ Bloque "Comentarios sobre la unidad" al final del formulario, colapsable, contador "(N)" correcto contando solo activos.
- ✅ Sección "Comentarios del ciclo" dentro del cuerpo del ciclo, contador independiente por ciclo.
- ✅ Avatar con iniciales del autor, nombre completo, fecha relativa, cuerpo con saltos de línea respetados.
- ✅ Respuestas indentadas con `margin-left` bajo el comentario raíz correspondiente.
- ✅ Comentarios eliminados se renderizan en gris claro con ícono de basurero y texto "Comentario eliminado".

**Tests realizados en DEV (Etapa B — crear):**

- ✅ Botón "Comentar" se habilita/deshabilita según el contenido del textarea.
- ✅ Crear comentario raíz en hilo de UI (POST con `entity_type='unit'`, `parent_comment_id=NULL`).
- ✅ Crear comentario raíz en hilo de ciclo (POST con `entity_type='unit_cycle'`).
- ✅ Responder a un comentario raíz: aparece compositor secundario debajo, foco automático, POST con `parent_comment_id`.
- ✅ Cancelar respuesta cierra el compositor sin guardar.
- ✅ Abrir respuesta en otro comentario cierra automáticamente el primero (regla "uno a la vez").
- ✅ Comentarios que son respuesta no muestran botón "Responder" (regla 1 nivel de anidación).
- ✅ Comentarios eliminados no muestran botones de acción.
- ✅ Persistencia entre recargas.

**Tests realizados en DEV (Etapa C — soft-delete):**

- ✅ Botón "Eliminar" solo aparece en comentarios del autor actual.
- ✅ Eliminar un raíz sin respuestas: se marca como deleted, contador baja en 1.
- ✅ Eliminar un raíz con respuestas: el raíz queda como placeholder, las respuestas se preservan visibles.
- ✅ Eliminar una respuesta: solo la respuesta se marca como deleted, padre intacto.
- ✅ Cancelar confirmación no hace nada.
- ✅ Funciona idénticamente en hilos de ciclo.
- ✅ Persistencia entre recargas.
- ✅ Tras eliminar, el comentario eliminado ya no muestra botones de acción.

**Pendiente en este sub-paso (no bloqueante):**

- Validación funcional de "compositores ocultos en modo solo lectura". Misma limitación que el resto del paso 4.3: no hay forma de probar el modo solo lectura en DEV hoy con un usuario externo a los 6 caminos. El código que oculta los compositores con `style.display = 'none'` cuando `isReadOnly === true` está escrito en `setupUnitCommentComposer()` y `setupCycleCommentComposer()`.

---

## Estado del archivo `unit-form.html` al cierre del paso 4.3b

**Funcionalmente completo para uso pedagógico.** Un docente UI puede crear, editar y completar una UI de principio a fin: información general, ciclos con cuerpo completo + áreas + conexiones IB, cierre con tres reflexiones finales, y hilo de comentarios polimórfico tanto a nivel de UI como por ciclo. El control de acceso por los 6 caminos está implementado y el modo solo lectura aplica a todos los elementos editables (pendiente validación funcional cuando haya datos para ejercitarlo).

### Pendientes conocidos en `unit-form.html` (no bloquean uso real)

Estos puntos no impiden el uso normal del archivo y se difieren a sesiones posteriores. Quedan listados aquí para no perderlos del radar.

| # | Pendiente | Razón del aplazamiento | Cuándo abordar |
|---|---|---|---|
| 1 | **Notificaciones por email de comentarios** (paso 4.3c) | Alcance acotado al cierre de la sesión. La tabla `pln_comments` se llena correctamente pero el autor de la UI/ciclo no recibe email cuando alguien comenta. | Cuando se decida la política de notificación (solo autor / todos los editores / opt-out / agregación). |
| 2 | **Sección "Planeadores vinculados"** en `unit-form.html` | El SPEC original del paso 4.3 contemplaba mostrar qué planeadores de área (tabla `pln_planners`) están enlazados a la UI vía `pln_planners.unit_id`. No tiene utilidad hasta que exista el módulo de planeadores de área. | Al cerrar el paso 6 (`planner-form.html`). |
| 3 | **Validación funcional del modo solo lectura** | El código aplica `disabled` a inputs/selects/textareas, `enable(false)` a todos los Quill (UI + ciclos + cierre), y `display: none` a los compositores de comentarios. Está escrito y revisado, pero no se ha podido ejercitar porque no hay un worker en DEV cuyo acceso sea exclusivamente por caminos 3-6 (docente del grado, coordinador de área, director de programa o director de sección). | Cuando se pueblen `grades.program_id` y `academic_areas.coordinator_worker_id` en DEV y existan workers con esos roles. |
| 4 | **Test formal de `subjects-descriptions`** (descripción por materia vinculada) | Funcionalidad heredada del paso 4.1 que guarda en `pln_unit_subjects.description`. Está implementada y aparentemente funciona, pero no se le hizo un test formal en esta línea de sub-pasos. | En la próxima sesión que toque ese archivo, antes de retomar nuevas features. |
| 5 | **Auditoría de `pln_comments`, `pln_unit_cycle_areas` y `pln_unit_cycle_connections`** | En el paso 4.2 se agregaron triggers de auditoría a 10 tablas `pln_*`, pero quedaron sin trigger las tres tablas nuevas/usadas en los pasos 4.2-4.3. Esto significa que los comentarios, las áreas de ciclo y las conexiones IB no quedan auditadas. | Cuando se haga una sesión de mantenimiento general de auditoría del módulo, junto con la propagación de los triggers de paso 4.2 a PROD si aplica. |
| 6 | **Decisión sobre limpieza de "áreas huérfanas"** en ciclos | Si el usuario quita una materia en Información General cuya área ya tenía registros en `pln_unit_cycle_areas`, los registros quedan en BD apuntando a un `area_id` ya no alcanzable desde la UI. Decisión actual: no se purgan automáticamente (preservar contribuciones del usuario). | Si en uso real esto resulta confuso, decidir entre purgar al desvincular materia o mantener el comportamiento actual. |
| 7 | **Atomicidad SQL retroactiva para `pln_unit_cycles.cycle_number`** | El paso 4.2 calcula `cycle_number` con `Math.max(...) + 1` en cliente, vulnerable a "last write wins" con clientes concurrentes. El módulo Planeación ya tiene dos funciones atómicas análogas (`pln_create_planner_criterion`, `pln_create_planner_cycle`) que se pueden replicar como `pln_create_unit_cycle(p_unit_id uuid)`. | Antes de uso masivo de UIs en PROD, especialmente para grados PEP donde la codocencia es habitual. |
| 8 | **Polling de concurrencia retroactivo en `unit-form.html`** | El paso 4.x no implementó polling de `pln_units.updated_at`. El patrón ya está probado en `planner-form.html` (paso 6.2.A) y es directamente replicable. | Antes de uso masivo en PROD. |

---

---

## Decisión arquitectónica — Modelo "planeador-por-grado" (27 de mayo de 2026)

Antes de cerrar el sub-paso 6.1 se identificó un problema fundamental del modelo original del SPEC v1.0 y se tomó una decisión que afecta a `pln_planners` y a `pln_unit_collaborators`.

**Problema identificado:** la planificación académica del colegio se hace con anticipación. Es común planificar el trimestre del año siguiente durante el año vigente. Si entre la planificación y el inicio del año cambia el docente (renuncia, contratación), el SPEC original dejaba el planeador "huérfano" porque `pln_planners.teacher_id` y el UNIQUE incluyendo `teacher_id` ataban el planeador al docente original.

**Decisión:** el planeador es un artefacto institucional del colegio (de la combinación asignatura+grado+trimestre+año), no del docente individual. El docente lo "ocupa" mientras tenga la asignación académica activa.

**Implicaciones del modelo:**

1. **Acceso al planeador** se calcula por `academic_assignments` activas, no por `teacher_id`. Cualquier docente con assignment activa en algún curso de (subject_id, grade_id) en el año del planeador puede verlo y editarlo. Si cambia el docente real, basta con actualizar `academic_assignments`; el sistema lo detecta automáticamente.

2. **`teacher_id` se reinterpreta como "creador histórico"**: NO determina acceso, solo registra quién creó el planeador. La columna sigue existiendo (sin migración) pero pierde su rol funcional. En el listado se muestra "Creado por X" cuando el creador es distinto al usuario actual.

3. **El UNIQUE constraint cambió**: era `(teacher_id, subject_id, grade_id, trimester, academic_year_id)`, ahora es `(subject_id, grade_id, trimester, academic_year_id)` sin teacher_id. Esto garantiza un único planeador por (asignatura+grado+trimestre+año) a nivel BD. Aplicado en DEV y PROD el 27 de mayo de 2026 vía `DROP CONSTRAINT pln_planners_unique` + `ADD CONSTRAINT pln_planners_unique UNIQUE (...)`.

4. **No hay botón de "tomar control"** ni transferencia explícita. La transferencia es implícita y automática vía la actualización de `academic_assignments`.

5. **Codocencia natural**: si dos docentes dictan la misma materia en cursos paralelos del mismo grado (caso real validado: Belzner en Español Tercero B + Cajigas en Español Tercero A), comparten el mismo planeador. No hay duplicación.

**Hallazgo operativo durante las pruebas:** el sistema SchoolNet impone el constraint `academic_assignments_unique_per_year` sobre `(academic_year_id, subject_id, course_id)`, es decir, un curso tiene un solo docente por asignatura. Esto valida implícitamente el modelo "planeador-por-grado": la codocencia siempre ocurre a nivel de grado (cursos paralelos), nunca a nivel de curso.

**Implicaciones para `pln_unit_collaborators` (decisión análoga para UIs):** se identificó la misma vulnerabilidad en UIs — la pre-carga de colaboradores ocurre solo al crear, pero si cambian las assignments después, la lista queda desactualizada. Se agregó un mecanismo de sincronización automática (ver sub-paso 6.1 detallado abajo).

---

### Paso 6.1 — `my-planners.html` + sincronización de colaboradores en UIs ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026.
**Fecha de cierre en PROD:** 27 de mayo de 2026.

**Cambio en BD (DEV y PROD):**

- `pln_planners.pln_planners_unique` cambiado de `UNIQUE (teacher_id, subject_id, grade_id, trimester, academic_year_id)` a `UNIQUE (subject_id, grade_id, trimester, academic_year_id)`.
- `permissions.url_path`: actualizado para "Crear planeador de área" y "Gestionar planeadores de área", ambos apuntan a `/modules/planning/my-planners.html` (coherente con el patrón de UIs donde `my-units.html` cubre listado + creación).

**Archivo nuevo: `/modules/planning/my-planners.html` (~600 líneas).**

Implementa el modelo planeador-por-grado:

- **Cargado de contexto:** años académicos, grados, asignaturas, programas, workers (cache para mostrar nombres de creadores), `academic_assignments` activas del worker actual.
- **Encabezado:** selector de año académico (default: vigente).
- **Bloque "Crear planeador nuevo":**
  - Select de Asignatura (limitado a las asignaturas donde el worker tiene assignment activa en el año seleccionado).
  - Select de Grado (encadenado al subject, pre-selecciona si solo hay un grado disponible).
  - Select de Trimestre (1/2/3).
  - Validación antes de crear: busca si existe ya un planeador para esa combinación (subject_id, grade_id, trimester, academic_year_id). Si existe, muestra alert amarillo "Ya existe el planeador de X en Y, trimestre Z, creado por <nombre>" con botón "Abrir planeador" y deshabilita "Crear planeador". Esto previene intentos de duplicado y aprovecha el UNIQUE constraint.
  - Si no existe, validación del program_id del grado (mismo patrón del paso 4.0). Si OK, crea registro con `teacher_id = currentWorkerId` (creador histórico, informativo) + redirige a `planner-form.html?planner_id=<nuevo>`.
- **Bloque "Listado de planeadores":**
  - Filtra planeadores donde el worker actual tiene assignment activa en `(subject_id, grade_id)` en el año seleccionado. Lo realiza con un query a `pln_planners` con `IN` sobre subject_ids y grade_ids del worker, y luego filtra localmente por la combinación exacta de pares (subject_id, grade_id) — más eficiente que un OR complejo en PostgREST.
  - Para cada planeador en el listado: si el `teacher_id` (creador histórico) NO es el worker actual, muestra debajo del nombre de la asignatura "Creado por [nombre del creador]" en cursiva gris.
  - Click en una fila → redirige a `planner-form.html?planner_id=<uuid>`.
  - Estado vacío con mensaje guía.

**Cambios en `unit-form.html` (sincronización de colaboradores):**

Nueva función `sincronizarColaboradores(currentCollab)` invocada en `cargarUI()` justo después de cargar `pln_unit_collaborators`. Lo que hace:

1. Obtiene los `course_id` del grado de la UI.
2. Obtiene los `worker_id` con assignment activa en cualquiera de esos cursos en el año académico vigente.
3. Compara con los colaboradores actuales:
   - **A agregar:** workers en assignments pero NO en colaboradores → INSERT en lote con `is_lead = false`.
   - **A eliminar:** workers en colaboradores pero NO en assignments y `is_lead = false` → DELETE individual.
   - **Excepción crítica:** los workers con `is_lead = true` (creadores históricos) NUNCA se eliminan, aunque ya no tengan assignment activa.
4. Devuelve la lista actualizada para que `cargarRelaciones()` use el estado más reciente.
5. Si no hay cambios, no imprime log ni hace requests adicionales (idempotente).

**Decisiones de implementación durante este sub-paso:**

- **`teacher_id` se preserva en BD para todos los planeadores existentes**, sin backfill ni migración. La columna conserva su valor original (NOT NULL en el esquema) y solo cambia su interpretación funcional. Esto evita migraciones de datos.
- **Validación del planeador existente** consulta primero la lista en memoria (`visiblePlanners`) y, si no encuentra, hace una consulta directa a BD (cubriendo el caso donde otro docente del grado tenga ya creado el planeador pero el actual no lo vea por timing). Esto es defensivo y elimina el riesgo de violar el UNIQUE constraint con un error de BD.
- **Logs ricos** en consola en la sincronización (`🔄 Colaboradores sincronizados: +N agregados, -N eliminados`) para facilitar diagnóstico, pero solo cuando hay cambios reales.

**Tests realizados en DEV:**

- ✅ Listado de planeadores del worker actual (Belzner) muestra solo los que coinciden con sus assignments activas.
- ✅ Formulario de creación: dropdown de asignatura filtrado a las del worker, grado encadenado, validación de program_id.
- ✅ Creación exitosa de un planeador nuevo (Español, Tercero, T1). Redirección a `planner-form.html?planner_id=<uuid>` (404 esperado en este sub-paso, archivo aún no existe).
- ✅ Validación de duplicados: intentar crear "Español, Tercero, T1" como Belzner cuando ya existe → muestra alert amarillo con botón "Abrir planeador". Botón "Crear planeador" deshabilitado.
- ✅ **Test crítico de codocencia:** una segunda docente (Cajigas) con assignment activa en "Español, Tercero A" entró al sistema, vio el planeador creado por Belzner (Tercero B) con etiqueta "Creado por Margaret Emmily Belzner", y al intentar crear duplicado recibió el mismo alert con redirección al planeador existente.
- ✅ **Test crítico de retiro de docente:** inactivamos la assignment de Belzner en "Español, Tercero B" — Belzner ya no ve el planeador en su listado, Cajigas sigue viéndolo normalmente. Después inactivamos TODAS las assignments de Belzner en Tercero — Belzner queda bloqueada en `my-units.html` (validación de Unit of Inquiry activa, correcto), pero al acceder a la UI directamente por URL (Camino 1: creadora) entra y dispara `sincronizarColaboradores()`. Belzner se preserva como colaboradora con `is_lead = true` aunque ya no tenga assignment, los demás colaboradores se alinean exactamente con los workers con assignment activa.

**Tests realizados en PROD:**

- ✅ Cambio de UNIQUE constraint aplicado y verificado.
- ✅ URLs de permisos actualizadas.
- ⏸️ Verificación funcional del archivo pospuesta hasta que existan workers con assignments en grados con programa configurado en PROD (depende de la tarea operativa pendiente).

**Pendientes operativos relacionados al sub-paso 6.1 (no bloqueantes para el desarrollo, dependen de terceros):**

- Los permisos del módulo siguen sin estar asignados a roles en PROD.
- `grades.program_id` solo está poblado en 1 de 14 grados.
- Sin estos dos puntos, un docente real en PROD no puede usar `my-planners.html` aún.

---

## Decisión arquitectónica — Concurrencia de edición (27 de mayo de 2026)

Identificado durante la construcción del paso 6.2: dos docentes que comparten un planeador (codocencia legítima en el modelo planeador-por-grado) pueden editar simultáneamente. Sin mitigación, ocurre "last write wins" silencioso: el segundo PATCH sobrescribe al primero sin aviso al usuario.

**Modelo de mitigación adoptado (Opción B + atomicidad de creación de hijos):**

1. **Polling pasivo de `updated_at`** cada 15 segundos. Si el cliente detecta que el `updated_at` en BD ya no coincide con su valor cargado, muestra un banner amarillo sticky arriba: "Otra persona acaba de editar este planeador. Recargue para ver los cambios más recientes y evitar sobrescribirlos." con botón "Recargar". El usuario decide cuándo recargar. Una vez mostrado, no spamea (`concurrentEditDetected = true`).
2. **Pausa de polling** cuando la pestaña no está visible (`document.hidden`), para ahorrar requests.
3. **Cada PATCH local actualiza `lastKnownUpdatedAt`** para distinguir ediciones propias de externas.
4. **Atomicidad para creación de ciclos y criterios**: en los sub-bloques 6.2.D (criterios) y 6.2.F (ciclos del planeador), en lugar de calcular `objective_number` o `cycle_number` con `Math.max(...) + 1` en cliente, llamar a una función PostgreSQL que use `SELECT MAX(...) + 1` dentro de una transacción con `FOR UPDATE` previo sobre las filas existentes. Esto garantiza que dos clientes "simultáneos" no obtengan el mismo número.

**Opciones descartadas:** "last write wins" puro (sin mitigación) y bloqueo optimista con `If-Match` (refactorización muy costosa para el nivel de simultaneidad esperado en un colegio).

**Deuda técnica aplicable a archivos ya construidos:**

- `unit-form.html` debe recibir el mismo mecanismo de polling como mejora retroactiva antes de uso masivo en producción.
- Los ciclos de UI (paso 4.2) deben recibir la atomicidad SQL para `cycle_number` antes de uso masivo. Hoy calculan `cycle_number` con `Math.max(...) + 1` en cliente, lo que es vulnerable al mismo caso edge.

---

### Paso 6.2.A — Esqueleto + control de acceso + polling ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026. **Fecha de cierre en PROD:** 28 de mayo de 2026.

Archivo nuevo: `/modules/planning/planner-form.html` (~700 líneas iniciales).

**Implementación:**

- **HTML:** estructura completa con header informativo (badges: asignatura, grado, trimestre, programa; meta: año, creador histórico, estado) + 6 bloques colapsables (Vinculación con UI, Marco curricular, Criterios, Reflexión, Ciclos, Comentarios), todos con placeholder hasta sus sub-bloques.
- **CSS:** estilos para badges del header, bloques colapsables (mismo patrón que `unit-form.html`), indicador de autoguardado, banner sticky de conflicto concurrente con botón "Recargar".
- **JS — Variables globales:** `currentWorkerId`, `currentWorkerEmail`, `plannerId`, `plannerData`, `academicYearId`, `isReadOnly`. Caches de contexto (`allGrades`, `allSubjects`, `allPrograms`, `allWorkers`, `allAreas`, `allSections`). Polling (`lastKnownUpdatedAt`, `pollingIntervalId`, `concurrentEditDetected`).
- **JS — Carga:** `loadCurrentWorker()` (unión por email a `workers`), `loadContext()` (todos los catálogos base en paralelo), `cargarPlaneador()` (FROM `pln_planners` + resolución de nombres de asignatura/grado/programa/creador + nombre del año).
- **JS — Control de acceso `canEdit()`:** evalúa los 4 caminos en orden:
  1. Assignment activa en algún curso de (grade_id, subject_id) en el año.
  2. Coordinador del área de la asignatura (`academic_subjects.area_id → academic_areas.coordinator_worker_id`).
  3. Director del programa del grado (`programs.program_director_email`).
  4. Director de la sección del grado (`sections.director_email`).
  El creador histórico (`teacher_id`) NO es un camino por sí solo. Si una creadora se fue y ya no tiene ningún rol vigente, pierde acceso.
- **JS — Modo solo lectura `aplicarModoSoloLectura()`:** banner amarillo arriba con explicación de los 4 caminos. El bloqueo efectivo de inputs se aplica en los sub-bloques siguientes (los placeholders no necesitan disabled).
- **JS — Polling `iniciarPollingConcurrencia()`:** setInterval cada 15s que consulta `pln_planners.updated_at`. Si difiere de `lastKnownUpdatedAt`, muestra el banner sticky y deja de avisar. Solo se inicia si `!isReadOnly`. Cleanup en `beforeunload`.
- **JS — Pantalla de error amigable:** `mostrarPantallaError(mensaje, tipo)` con iconos según tipo (warning/error) y botones "Volver a mis planeadores" + "Volver al inicio".

**Decisiones tomadas durante la implementación:**

- **Detección de PEP por convención de nombre**: el código asume que el `program_name` de PEP empieza con "PEP". Alternativa más robusta sería agregar un campo `programs.short_code`, pero se considera fuera del alcance ahora. Si en el futuro se renombran programas, hay que revisar.
- **`isReadOnly` se evalúa antes de iniciar polling**: por eficiencia, no contamina con requests adicionales a un usuario que solo lee.
- **Polling se pausa con `document.hidden`**: pestañas no visibles no consultan.

**Tests realizados en DEV:**

- ✅ Acceso por Camino 1 (Belzner como docente con assignment): entrada sin banner, consola muestra "✅ canEdit: docente con assignment activa".
- ✅ Acceso por Camino 1 (codocencia con Cajigas en Tercero A): entrada sin banner.
- ✅ Acceso con planner_id inexistente: pantalla de error amigable.
- ✅ Acceso sin planner_id en URL: pantalla de error amigable.
- ✅ Header informativo muestra correctamente todos los datos del planeador.
- ✅ Polling: UPDATE externo en BD dispara banner en menos de 15s.
- ⏸️ Validación de Caminos 2-4: pospuesta (no hay datos poblados para ejercitarlos).

---

### Paso 6.2.B — Bloque 1: Vinculación con UI + conexiones IB ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026. **Fecha de cierre en PROD:** 28 de mayo de 2026.

**Implementación:**

- **HTML:** reemplazado el placeholder del Bloque 1 por un contenedor `#uilink-body` cuyo contenido se genera dinámicamente.
- **CSS:** estilos para selector de UI, hint, mensaje "no aplica a este programa", sección de conexiones (oculta cuando no hay UI vinculada), grid de checkboxes de conexión con variante `.checked`.
- **JS — Variables nuevas:** `availableUIs`, `catalogConnectionTypes`, `selectedConnections` (Set de connection_type_id).
- **JS — Carga:** `pln_connection_types` se agregó al `Promise.all` de `loadContext()`. Nueva función `cargarUILinkData()` invocada en la inicialización tras `cargarPlaneador()`: trae UIs activas del mismo grado y año vía `pln_unit_grades` (JOIN implícito por filtro IN), y trae las conexiones existentes del planeador.
- **JS — Render `renderUILinkBlock()`:** detecta si el programa es PEP por convención de nombre. Si NO es PEP, muestra mensaje informativo y sale. Si es PEP, construye un select de UIs (con "Sin vincular" + opciones), y una sección de conexiones con 6 checkboxes (Contenido, Conceptos, ATL, Pedagogía, Perfil IB, Contexto) inicialmente oculta cuando no hay UI vinculada.
- **JS — Autosave del select `onUnitLinkChange()`:**
  1. PATCH a `pln_planners.unit_id` con el nuevo valor (o NULL).
  2. Si se DESVINCULÓ (pasó a NULL), **borra todas las conexiones** del planeador con `DELETE pln_planner_connections WHERE planner_id=...` (decisión: las conexiones no tienen sentido sin UI vinculada).
  3. Muestra/oculta la sección de conexiones según haya UI o no.
  4. Actualiza `lastKnownUpdatedAt` para no disparar el banner de concurrencia con la propia edición.
  5. Reverso visual si el PATCH falla.
- **JS — Autosave de conexiones `onConnectionToggle()`:** INSERT/DELETE inmediato a `pln_planner_connections` según marcar/desmarcar. Mantiene `selectedConnections` sincronizado. Reverso visual si falla.

**Decisiones tomadas durante la implementación:**

- **Al desvincular UI se borran las conexiones IB del planeador**: decisión de UX (no de BD). Las conexiones IB representan "cómo este planeador se relaciona con su UI vinculada". Sin UI vinculada, pierden significado. Si el usuario re-vincula con otra UI después, debe marcar conexiones de nuevo desde cero.
- **Programas no-PEP muestran mensaje informativo en lugar de ocultar el bloque entero**: deja explícito al usuario por qué no aparecen UIs (mejor que un bloque vacío sin explicación).

**Tests realizados en DEV (todos exitosos):**

- ✅ Bloque visible y placeholder reemplazado en planeador de Tercero (PEP).
- ✅ UIs disponibles correctas (filtro por grado, año, status activo).
- ✅ Vincular UI: PATCH guarda `unit_id`, aparece sección de conexiones.
- ✅ Marcar conexiones: INSERT inmediato en `pln_planner_connections`.
- ✅ Persistencia entre recargas.
- ✅ Desvincular UI: PATCH `unit_id=NULL` + DELETE de todas las conexiones del planeador.
- ⏸️ Modo solo lectura: no probado funcionalmente (mismo bloqueo que el resto del paso 4.3 y 6.2.A).
- ⏸️ Sin UIs disponibles: no probado (no quisimos archivar la UI de prueba).

---

### Paso 6.2.C — Bloque 2: Marco curricular ✅

**Fecha de cierre en DEV y PROD:** 28 de mayo de 2026.

Implementado en dos sub-bloques.

#### 6.2.C.1 — 10 campos directos a `pln_planners`

**Campos del Bloque 2 según SPEC sección 8.5 (orden visual):**

| # | Etiqueta visible | Tipo de input | Columna `pln_planners` |
|---|---|---|---|
| 1 | Strand / Línea curricular | input text | `strand` |
| 2 | Objetivos de aprendizaje | Quill | `learning_objectives` |
| 3 | Estándares MEN | Quill | `men_standards` |
| 4 | Habilidades ATL | Multi-select | M:N `pln_planner_atl_skills` (entregado en 6.2.C.2) |
| 5 | Descripción de la actividad ATL | Quill | `atl_description` |
| 6 | Metodología | Quill | `methodology` |
| 7 | Diferenciación con apoyo | Quill | `differentiation_support` |
| 8 | Diferenciación con extensión | Quill | `differentiation_extension` |
| 9 | Materiales de diferenciación | input text | `differentiation_materials` |
| 10 | Descripción de evaluación sumativa | Quill | `summative_description` |
| 11 | Recursos del trimestre | Quill | `resources` |

Total en 6.2.C.1: 2 inputs text + 8 Quill (todos los del listado salvo el ATL, que es M:N y va en 6.2.C.2).

**Toolbar Quill mínima** definida en constante `CURRICULAR_TOOLBAR`: B/I/U, listas (ordered/bullet), link, clean. Reutilizada después por el Bloque 4 (Reflexión) y por los Quill de ciclos en 6.2.F.

**Helpers nuevos introducidos en este sub-bloque (aplicables retroactivamente al resto del archivo):**

- **`patchPlanner(payload)`**: PATCH centralizado a `pln_planners`. Actualiza `lastKnownUpdatedAt = new Date().toISOString()` automáticamente para que el polling de concurrencia no se autodispare con ediciones propias. También sincroniza `plannerData` en memoria con el payload aplicado vía `Object.assign(plannerData, payload)`. Patrón aplicable retroactivamente a `unit-form.html` (con `patchUnit()` análogo) cuando se implemente polling allí.
- **`debouncedPatch(key, fn, ms=2000)`**: debounce por clave con cancelación. Si ya hay un timer pendiente con la misma clave, lo cancela antes de programar uno nuevo. Llama internamente a `startSaving/doneSaving/errorSaving`. Usado por Quill (text-change) e inputs text (input event).
- **`flushDebounced(key, fn)`**: cancela un debounce pendiente con esa clave y ejecuta inmediato. Usado en blur de inputs text simples para no perder la última edición si el usuario sale del campo antes de los 2 segundos.
- **`setQuillHTML(quill, html)`**: hidrata un Quill con `clipboard.dangerouslyPasteHTML` cuando hay contenido. Si el contenido es null/undefined/string vacío, llama a `quill.setText('')`. El `dangerouslyPasteHTML` emite `text-change` con `source='api'`, no `'user'`.
- **`startSaving()` / `doneSaving()` / `errorSaving(err)`**: contador `pendingPatches` para el indicador de autoguardado. Múltiples PATCH concurrentes no rompen el indicador. Patrón ya probado en `unit-form.html`.

**Filtro `source === 'user'`** en los handlers `text-change` de cada Quill: indispensable para no disparar autosave durante la hidratación inicial. Coherente con el patrón ya validado en ciclos de UI (paso 4.2.B) y reflexiones finales (4.3a).

**Refactor de Bloque 1 aplicado en este sub-bloque:** las dos funciones existentes `onUnitLinkChange()` y `onConnectionToggle()` se reescribieron para usar los helpers nuevos (`patchPlanner`, `startSaving`, `doneSaving`, `errorSaving`). Antes tenían su propia lógica de PATCH directo + `setIndicator('saving', '...')` + cleanup manual de `lastKnownUpdatedAt`. Quedan consistentes con el resto del archivo.

**Decisiones de diseño tomadas durante la implementación:**

- **Detección de "vacío" en Quill por `getText().trim() === ''`**: coherente con cómo unit-form lo maneja. Si Quill devuelve `<p><br></p>` con texto vacío, el PATCH guarda `NULL` en BD (no string vacío ni el `<p><br></p>`).
- **`differentiation_materials` como input text** (no textarea o Quill): el SPEC lo deja como tipo simple; los materiales son típicamente lista corta.
- **`strand` como input text**: igual decisión.
- **Recursos como Quill** (no textarea como en ciclos de UI): el SPEC sección 8.5 lo define como Quill, y a nivel de trimestre el contenido es típicamente más estructurado (con links, listas) que en un ciclo individual.

**Tests realizados en DEV:**

- ✅ Estructura visible: los 11 campos en el orden del SPEC con el campo 4 como placeholder (ATL).
- ✅ Autosave del input simple (`strand`): debounce 2s + persistencia.
- ✅ Blur cancela debounce: Tab inmediato guarda sin esperar.
- ✅ Autosave de Quill: escribir + formato → persistencia con formato preservado.
- ✅ Sin PATCH al cargar: Network del navegador confirma que NO hay PATCH a `/pln_planners` durante la carga inicial.
- ✅ Vaciar Quill guarda `NULL` (no `<p><br></p>` ni string vacío).
- ✅ Polling no se autodispara: tras editar y esperar 30s, no aparece banner amarillo.
- ✅ Persistencia múltiple: llenar los 10 campos directos + recargar → todos hidratados correctamente.

**Anécdota durante las pruebas:** el campo `strand` apareció con texto residual "Cambio externo de prueba" — residuo del UPDATE manual del paso 6.2.A para probar el polling. Aprovechado para validar la prueba de "vaciar campo guarda NULL" (Opción A): borrar el contenido y hacer Tab. Funcionó correctamente.

#### 6.2.C.2 — Habilidades ATL (multi-select agrupado)

**Modelo:**
- M:N `pln_planner_atl_skills (planner_id, atl_skill_id)`.
- Catálogo `pln_ib_atl_skills` con 10 filas, columna `category` para agrupar visualmente.
- Las 5 categorías IB: Pensamiento, Comunicación, Investigación, Autogestión, Colaboración.

**Implementación:**

- **CSS:** estilos para `atl-groups` (flex column), `atl-group` (border con padding), `atl-group-title` (mayúsculas pequeñas, color primario oscuro), `atl-skills-grid` (grid responsive de 260px min), `atl-skill-item` (con variante `.checked`).
- **JS — Variables nuevas:** `catalogATLSkills`, `selectedATLSkills` (Set de atl_skill_id).
- **JS — Carga del catálogo:** `pln_ib_atl_skills?select=*&active=eq.true&order=category.asc,sort_order.asc` agregado al `Promise.all` de `loadContext()`.
- **JS — Carga de selecciones:** `pln_planner_atl_skills?select=atl_skill_id&planner_id=eq.X` agregado en `cargarUILinkData()` (función que también trae conexiones IB).
- **JS — Render `renderATLSkills()`:** agrupa habilidades por `category` preservando orden de llegada (que ya viene ordenado por category.asc, sort_order.asc desde la BD). Renderiza un sub-grupo por categoría con título en mayúsculas pequeñas y un grid de checkboxes.
- **JS — Autosave `onATLSkillToggle()`:** INSERT/DELETE inmediato a `pln_planner_atl_skills` (sin debounce — un click es una intención clara, igual que el patrón de conexiones IB del Bloque 1). Reverso visual si falla.
- **Modo solo lectura:** `aplicarSoloLecturaCurricular()` extendido para deshabilitar checkboxes de ATL.

**Decisiones de diseño:**

- **Checkboxes en grid agrupado por categoría**, no chips multi-select ni search: 10 habilidades total caben holgadamente, agrupar por categoría da contexto pedagógico, mismo patrón visual que conexiones IB del Bloque 1.
- **INSERT/DELETE inmediato sin debounce**: un click es intencional. Coherente con cómo se manejan las conexiones IB.

**Tests realizados en DEV (todos exitosos):**

- ✅ Estructura visible: 5 sub-grupos con títulos en mayúsculas (PENSAMIENTO · COMUNICACIÓN · INVESTIGACIÓN · AUTOGESTIÓN · COLABORACIÓN). 10 habilidades total.
- ✅ Orden interno de "Pensamiento": crítico, creativo, metacognitivas (por sort_order).
- ✅ INSERT al marcar, DELETE al desmarcar (verificado en BD).
- ✅ Persistencia entre recargas con 3 habilidades de distintas categorías.
- ✅ Toggle rápido (marcar/desmarcar varias veces seguidas) no rompe el indicador.
- ✅ El polling no se dispara tras toggle ATL (porque INSERT/DELETE a `pln_planner_atl_skills` NO actualiza `pln_planners.updated_at`).
- ✅ Integración: marcar 2 ATL + escribir en "Descripción de la actividad ATL" → recargar → ambos persisten.

---

### Paso 6.2.D — Bloque 3: Criterios de evaluación ✅

**Fecha de cierre en DEV y PROD:** 28 de mayo de 2026.

Implementado en dos sub-bloques.

#### 6.2.D.1 — SQL atómico + CRUD básico

**Función PostgreSQL nueva** `pln_create_planner_criterion(p_planner_id uuid)`:

```sql
CREATE OR REPLACE FUNCTION public.pln_create_planner_criterion(
    p_planner_id uuid
)
RETURNS SETOF public.pln_planner_assessment_criteria
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_number integer;
BEGIN
    -- Bloquea las filas existentes del planeador (sin agregación)
    PERFORM 1
    FROM public.pln_planner_assessment_criteria
    WHERE planner_id = p_planner_id
    FOR UPDATE;

    -- Calcula el siguiente número (ya con lock)
    SELECT COALESCE(MAX(objective_number), 0) + 1
    INTO v_next_number
    FROM public.pln_planner_assessment_criteria
    WHERE planner_id = p_planner_id;

    -- Inserta y devuelve la fila
    RETURN QUERY
    INSERT INTO public.pln_planner_assessment_criteria (
        planner_id, objective_number, objective_label,
        level_2, level_3, level_4, level_5
    )
    VALUES (p_planner_id, v_next_number, NULL, NULL, NULL, NULL, NULL)
    RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pln_create_planner_criterion(uuid)
    TO anon, authenticated, service_role;
```

**Bug encontrado y corregido durante la sesión:** la primera versión usaba `SELECT COALESCE(MAX(objective_number), 0) + 1 ... FOR UPDATE` directamente. PostgreSQL lo rechaza con error `0A000`: *"FOR UPDATE is not allowed with aggregate functions"*. Solución: separar el lock (`PERFORM 1 ... FOR UPDATE` sin agregación) del cálculo (`SELECT MAX(...)` sin lock pero ya bajo la transacción con filas bloqueadas).

**Limitación conocida:** si dos clientes crean el **primerísimo criterio** simultáneamente (planeador sin criterios previos), el `PERFORM` no bloquea ninguna fila (no hay filas que bloquear). PostgreSQL detectará la colisión vía el UNIQUE constraint `(planner_id, objective_number)` y uno de los dos clientes recibirá `23505`. Aceptable porque es muy improbable; si en uso real aparece, hay soluciones (lock advisory sobre `planner_id`, retry automático en JS).

**UI del CRUD:**

- **CSS:** `criteria-list`, `criterion-card` con header (badge de número + etiqueta o "Sin etiqueta" en gris cursivo + chevron + botón eliminar), `criterion-body` controlado por clase `.expanded`. Estado vacío con mensaje guía. Botón "Agregar objetivo" en estilo dashed.
- **HTML:** reemplazado el placeholder del Bloque 3 por un `<div class="criteria-list" id="criteria-list">` + botón "Agregar objetivo".
- **JS — Variables:** `plannerCriteria` (array ordenado por `objective_number`), `expandedCriterionId`.
- **JS — Carga:** `cargarCriterios()` consulta `/pln_planner_assessment_criteria?select=*&planner_id=eq.X&order=objective_number.asc` al inicializar el bloque.
- **JS — Render:** `renderCriteriaList()` itera `plannerCriteria` y delega a `renderCriterionCard(criterion)`. Listeners delegados: click en header → toggle expansión (auto-colapso del resto). Click en botón eliminar → `eliminarCriterio()`.
- **JS — Acciones:**
  - `agregarCriterio()`: POST a `/rpc/pln_create_planner_criterion` con `p_planner_id`. La función devuelve `SETOF`, así que se toma `res[0]`. Se agrega al estado local + se expande automáticamente.
  - `eliminarCriterio(criterionId)`: `confirm()` con la etiqueta (o `#N` si no hay etiqueta) → DELETE + renumeración + re-render.
  - `renumerarCriterios()`: tras eliminar, recorre `plannerCriteria` ordenado por `objective_number`, identifica los que cambiaron de número, hace PATCHs secuenciales. Al renumerar tras DELETE los números bajan a posiciones libres, no colisionan con el UNIQUE.

**Decisiones de diseño:**

- **Acordeones individuales, uno expandido a la vez** (mismo patrón que ciclos de UI).
- **Etiqueta opcional al crear** (no se valida): el docente puede agregar el criterio y rellenar después.
- **Mensaje de confirmación con etiqueta** si existe (`¿Eliminar el objetivo "Comprensión lectora"?`), o con número si no (`¿Eliminar el objetivo #2?`).
- **Sin drag & drop**: orden por `objective_number` ascendente.

#### 6.2.D.2 — Cuerpo editable

**Campos del cuerpo:**

- **Etiqueta del objetivo** — input text → `objective_label`.
- **Nivel 2 / Nivel 3 / Nivel 4 / Nivel 5** — 4 textareas en grid 2x2 → `level_2`, `level_3`, `level_4`, `level_5`.

**Por qué no Nivel 1:** decisión pedagógica registrada en SPEC sección 8.6. Nivel 1 representa "no logrado" implícito y no se almacena explícitamente. La tabla `pln_planner_assessment_criteria` no tiene columna `level_1`. Esta decisión se validó explícitamente con el usuario durante la sesión.

**Decisiones de diseño:**

- **Textareas, no Quill**: los descriptores de niveles son textos cortos descriptivos (típicamente 1-3 líneas). No necesitan formato rico. Coherente con SPEC sección 8.6.
- **Grid 2x2 responsive**: en desktop, 4 textareas en grid 2 columnas. En móvil (<768px), 1 columna.
- **Etiqueta en fila superior, fuera del grid**: el "qué se evalúa" se ve antes que el "cómo se mide en cada nivel".

**Implementación:**

- **HTML:** body de la tarjeta con 1 input + grid de 4 textareas. Cada campo con `data-criterion-id` y `data-field` para listeners genéricos.
- **JS — Hidratación `hidratarCriterio(criterion)`**: poblar input de etiqueta y los 4 textareas desde `plannerCriteria` ya en memoria. No requiere query adicional.
- **JS — Autosave `setupCriterionAutosave(cid)`**: para cada uno de los 5 campos, listener `input` con debounce 2s + listener `blur` que ejecuta `flushDebounced`. Cada campo invoca `patchCriterionField(cid, field, value)`.
- **JS — `patchCriterionField()`**: PATCH a `/pln_planner_assessment_criteria?criterion_id=eq.X` con el campo individual. Sincroniza estado local. Si el campo es `objective_label`, llama a `refrescarHeaderCriterio()` para actualizar el header sin destruir el body.
- **JS — `refrescarHeaderCriterio(cid)`**: actualiza solo el span `criterion-header-label-${cid}` con la nueva etiqueta (o el placeholder "Sin etiqueta" si quedó vacío). El body permanece intacto, preserva el foco y el contenido en edición.

**Tests realizados en DEV (todos exitosos):**

- ✅ Estructura visible: input + grid 2x2 de textareas. Responsive correcto.
- ✅ Autosave de etiqueta: el header se actualiza en vivo de "Sin etiqueta" (gris cursiva) a la etiqueta tecleada (negro).
- ✅ Blur cancela debounce: Tab inmediato guarda sin esperar.
- ✅ Autosave de los 4 niveles: persistencia entre recargas.
- ✅ Vaciar campo guarda NULL.
- ✅ Eliminar `#2` con 3 criterios: el `#3` se renumera a `#2` y su contenido permanece intacto.
- ✅ Edición en `#1` (sin esperar guardado) + expandir `#2` (auto-colapso) → debounce sigue corriendo → guarda OK.

---

### Paso 6.2.E — Bloque 4: Reflexión del trimestre ✅

**Fecha de cierre en DEV y PROD:** 28 de mayo de 2026.

4 Quill directos a `pln_planners`, mismo patrón del Bloque 2:

| # | Etiqueta visible | Columna |
|---|---|---|
| 1 | Reflexión antes de enseñar | `reflection_before` |
| 2 | Reflexión durante el trimestre | `reflection_during` |
| 3 | Reflexión después del trimestre | `reflection_after` |
| 4 | Síntesis de voces del estudiante | `student_reflection` |

**Implementación:**

- **HTML:** 4 Quill con su label y hint orientador. Containers con id `refl-before`, `refl-during`, `refl-after`, `refl-student`.
- **JS — Variables:** `reflectionQuills = {}` ({ field: QuillInstance }).
- **JS — Inicialización `initReflectionBlock()`**: crea los 4 Quill con `CURRICULAR_TOOLBAR` (reutilizada del Bloque 2). Hidrata desde `plannerData` vía `setQuillHTML()`. Conecta autosave. Si modo solo lectura, llama `quill.enable(false)` en cada uno.
- **JS — Autosave `setupReflectionAutosave()`**: handler `text-change` con filtro `source === 'user'`. PATCH centralizado vía `patchPlanner()`. Debounce 2s.

**Decisión de diseño:** los 4 Quill se inicializan al cargar la página aunque el bloque esté colapsado. Coherente con el patrón actual: la inicialización es barata y evita complicar con lazy-init.

**Tests realizados en DEV (todos exitosos):**

- ✅ Estructura visible: los 4 Quill con su toolbar.
- ✅ Autosave: escribir + esperar 2s → "Guardado ✓".
- ✅ Persistencia entre recargas con formato preservado.
- ✅ Vaciar guarda NULL.
- ✅ Sin PATCH al cargar (filtro `source === 'user'` funcionando).
- ✅ Polling no se autodispara tras editar.

---

### Paso 6.2.F — Bloque 5: Ciclos del planeador ✅

**Fecha de cierre en DEV y PROD:** 28 de mayo de 2026.

Implementado en dos sub-bloques. Antes de codificar, se confirmó el diseño técnico porque es el sub-bloque más extenso.

**Modelo de datos (SPEC sección 6.5)** — Tabla `pln_planner_cycles`:

| Campo | Tipo |
|---|---|
| `cycle_id` | `uuid PK` |
| `planner_id` | `uuid FK pln_planners` ON DELETE CASCADE |
| `cycle_number` | `integer NOT NULL` |
| `topic` | `varchar` |
| `start_date` | `date` |
| `end_date` | `date` |
| `session_objectives` | `text` |
| `learning_experiences` | `text` |
| `formative_assessment` | `text` |
| `summative_assessment` | `text` (nullable, toggleable) |
| `resources` | `text` |
| `cycle_reflection_during` | `text` |
| `cycle_reflection_after` | `text` |

**Diferencias clave con ciclos de UI** (paso 4.2), registrado para futuras consultas:

| Aspecto | Ciclos de UI | Ciclos de planeador |
|---|---|---|
| Etapa de indagación | Sí (`inquiry_stage_id`) | No |
| Tabla de áreas + conexiones | Sí | No |
| Preguntas emergentes del estudiante | Sí | No |
| Reflexión docente | 1 campo al final | 2 campos: `during` + `after` |
| Diferenciación específica del ciclo | Sí | No (queda en el planeador a nivel trimestre) |

Los ciclos del planeador son más simples que los de UI: no tienen etapa ni áreas participantes porque el planeador ya está atado a una asignatura/área única. Toda la matriz transdisciplinar vive en la UI.

#### 6.2.F.1 — SQL atómico + CRUD básico

**Función PostgreSQL nueva** `pln_create_planner_cycle(p_planner_id uuid)`: análoga a `pln_create_planner_criterion`, sobre `pln_planner_cycles`. Misma estructura `PERFORM 1 ... FOR UPDATE` + `SELECT MAX(...)` + `INSERT ... RETURNING *`. Mismas garantías y limitación conocida.

**UI del CRUD:**

- **CSS:** `pcycles-list`, `pcycle-card` con header (badge `#N` + badge de estado + topic + rango de fechas + chevron + botón eliminar), `pcycle-body` controlado por clase `.expanded`. Estado vacío. Botón "Agregar ciclo" estilo dashed.
- **HTML:** placeholder reemplazado por `<div class="pcycles-list" id="pcycles-list">` + botón.
- **JS — Variables:** `plannerCycles` (array ordenado por `cycle_number`), `expandedPCycleId`, `pcycleQuills = {}` ({ cycleId: { field: QuillInstance } }).
- **JS — Carga:** `cargarPCycles()` consulta `/pln_planner_cycles?select=*&planner_id=eq.X&order=cycle_number.asc`.
- **JS — Render:** `renderPCyclesList()` itera y delega a `renderPCycleCard()`. Listeners: click en header → toggle expansión. Click en botón eliminar → `eliminarPCycle()`.
- **JS — Acciones:**
  - `agregarPCycle()`: POST a `/rpc/pln_create_planner_cycle`. Se expande automáticamente el nuevo.
  - `eliminarPCycle(cid)`: `confirm()` con etiqueta del topic o `#N` → DELETE + renumeración + re-render.
  - `renumerarPCycles()`: análoga a `renumerarCriterios`.

**Estado calculado del ciclo (no se almacena):**

- Función `calcularEstadoPCycle(cycle)` devuelve `'pending'` / `'active'` / `'completed'` según comparación de `start_date`/`end_date` vs `getCurrentDateColombia()`.
- Función local `getCurrentDateColombia()` (UTC-5 sin DST) para no depender de `config.js`. Devuelve `'YYYY-MM-DD'`.
- Badges en el header: gris (pendiente), azul claro (en curso), verde (completado).

**Decisiones de diseño:**

- **Acordeones individuales, uno expandido a la vez** (mismo patrón que ciclos de UI y criterios).
- **Sin etapa de indagación** ni badge de etapa (no aplica al modelo).
- **Topic opcional al crear** (mismo criterio que ciclos de UI y criterios).
- **Header con `topic + rango de fechas`** además del badge de estado.

#### 6.2.F.2.a — Cuerpo editable (sin sumativa)

**Estructura visual:** 4 secciones agrupadas con títulos separadores en mayúsculas pequeñas:

1. **Identidad y temporalidad** — `topic` (input text) + `start_date` + `end_date` (grid 2 cols).
2. **Aprendizaje** — `session_objectives` (Quill) + `learning_experiences` (Quill) + `resources` (textarea).
3. **Evaluación** — `formative_assessment` (Quill) + placeholder de sumativa (que va en 6.2.F.2.b).
4. **Reflexión del ciclo** — `cycle_reflection_during` (Quill) + `cycle_reflection_after` (Quill).

Total en F.2.a: 1 input text + 2 date + 5 Quill + 1 textarea = 9 campos editables.

**Decisiones técnicas relevantes:**

- **Render una vez + toggle CSS** (mismo patrón que ciclos UI 4.2.B): `renderPCycleCard()` siempre renderiza el body completo. El toggle solo cambia clase `.expanded`. Los Quill se instancian al renderizar el body, no se destruyen ni recrean al colapsar.
- **`initPCycleQuills(cycle)` resetea `pcycleQuills[cid] = {}`** antes de crear instancias nuevas. Evita el bug que tuvimos en ciclos UI (referencias huérfanas tras re-render del DOM).
- **Variable global `PCYCLE_QUILL_FIELDS`** lista los campos Quill del ciclo (5 en F.2.a, 6 en F.2.b cuando se agregue summative).
- **`patchPCycleField(cid, field, value)`** análogo a `patchPlanner()` pero sobre `pln_planner_cycles`. **NO actualiza `pln_planners.updated_at`** — decisión deliberada (ver más abajo).
- **`refrescarHeaderPCycle(cid)`**: actualiza solo el header (badge `#N`, status badge, topic, rango de fechas) cuando cambia `topic`, `start_date` o `end_date`. No destruye el body.

**Decisión arquitectónica: polling vigila solo la tabla padre, no los hijos.**

El polling de concurrencia consulta solo `pln_planners.updated_at`. Los PATCH a `pln_planner_cycles` NO tocan `pln_planners.updated_at`. Implicación: un docente A editando un ciclo y un docente B editando el header del planeador no se "ven" mutuamente vía polling. Limitación aceptable para el nivel de concurrencia esperado en un colegio (típicamente codocencia de 2 personas, no edición masiva).

Si en el futuro se quiere endurecer, se puede agregar trigger en cada tabla hija para tocar `pln_planners.updated_at`. Por ahora, fuera del alcance.

**Fix incorporado durante esta sesión: validación cruzada de fechas (asimétrica).**

Tras el cierre inicial de F.2.a se identificó que el sistema aceptaba `end_date < start_date`. Decisión: validar.

Heurística:
- Si el usuario cambia `start_date` y queda > `end_date` actual, **arrastrar `end_date` automáticamente** al mismo valor (silencioso). Caso típico: el ciclo se corrió, probablemente también querías mover el fin.
- Si el usuario cambia `end_date` y queda < `start_date` actual, **rechazar**: revertir el campo al valor previo + `alert("La fecha de fin no puede ser anterior a la fecha de inicio.")`. Caso típico: error de tecleo.

Inspirado en calendarios de productividad (Google Calendar).

**Tests realizados en DEV (F.2.a + fix de fechas, todos exitosos):**

- ✅ Estructura visible: 4 secciones, layout responsive.
- ✅ Autosave del topic con header dinámico (de "Sin tema" a la etiqueta tecleada).
- ✅ Autosave de fechas con cambio de badge (PENDIENTE/EN CURSO/COMPLETADO).
- ✅ Autosave de Quill con persistencia de formato.
- ✅ Autosave del textarea de recursos con blur inmediato.
- ✅ Sin PATCH al cargar.
- ✅ Persistencia tras eliminar y recrear (eliminar `#2` con datos en `#1` mantiene `#1` intacto).
- ✅ Independencia entre ciclos.
- ✅ Polling no se autodispara tras editar ciclos.
- ✅ Validación cruzada de fechas:
  - Mover inicio adelante arrastra el fin.
  - Mover fin antes del inicio rechaza con alert + revierte.
  - Estado del header se actualiza tras el ajuste automático.

#### 6.2.F.2.b — Toggle de evaluación sumativa

**Comportamiento del toggle:**

- **Checkbox** "Incluir evaluación sumativa en este ciclo" sobre el editor.
- **Editor Quill oculto** cuando el checkbox está desmarcado.
- **Al marcar:** muestra el editor vacío. NO guarda nada hasta que el usuario tipee.
- **Al desmarcar:** PATCH inmediato `summative_assessment = NULL` + `setText('')` en el Quill + ocultar editor + cancelación de debounce pendiente.
- **Al hidratar:** si `summative_assessment` tiene contenido, checkbox marcado + editor visible. Si es NULL, checkbox desmarcado + editor oculto.

Misma semántica que la sumativa de ciclos de UI (paso 4.2.B).

**Implementación:**

- **CSS:** `pcycle-summative-toggle` (caja gris con checkbox + label), `pcycle-summative-editor.hidden { display: none; }`.
- **HTML:** placeholder de sumativa reemplazado por checkbox + wrapper con clase `hidden`.
- **JS:** el campo `summative_assessment` se agregó al array `PCYCLE_QUILL_FIELDS`. La hidratación inicializa `toggleEl.checked = tieneSumativa` y `wrapperEl.classList.toggle('hidden', !tieneSumativa)`.
- **JS — Listener del toggle:** al desmarcar, cancela debounce pendiente del Quill de sumativa, vacía el Quill, hace PATCH a NULL. Al marcar, solo muestra el editor (sin PATCH).

**Tests realizados en DEV (todos exitosos):**

- ✅ Estado inicial sin sumativa: checkbox desmarcado, editor oculto.
- ✅ Marcar muestra editor vacío sin PATCH.
- ✅ Escribir guarda con debounce 2s.
- ✅ Desmarcar limpia + guarda NULL.
- ✅ Volver a marcar tras desmarcar: editor vacío (contenido anterior NO se recupera).
- ✅ Persistencia entre recargas: si hay contenido en BD, checkbox marcado + editor visible.
- ✅ Persistencia del estado vacío: si NULL en BD, checkbox desmarcado + editor oculto.
- ✅ Desmarcar cancela debounce pendiente: solo se hace 1 PATCH (a NULL), no 2.
- ✅ Cada ciclo con toggle independiente.
- ✅ Sin PATCH al cargar.

**Decisión:**
1. **Eliminar el paso 3 original** ("`index.html` del módulo") del plan de desarrollo.
2. **Eliminar el permiso `'Planeación'`** (con `url_path = '/modules/planning/index.html'`) de la BD en DEV y PROD.
3. **Renumerar los pasos posteriores**: lo que era el paso 4 (`catalogs.html`) ahora es el paso 3, etc.

**Para futuro:** actualizar el SPEC `MODULO_PLANEACION_v1.0_Especificacion.md`:
- Sección 3.2: eliminar la fila del permiso `'Planeación'` (8 permisos → 7)
- Sección 10.1: eliminar `index.html` de la estructura de archivos
- Sección 10.2: eliminar la subsección sobre `index.html` del módulo
- Sección 11.3: renumerar orden de desarrollo

---

### 25 de mayo de 2026 — Convención de `permission_module`

**Hallazgo:** El SPEC v1.0 sección 3.2 indicaba `permission_module = 'Planeación'` (español con tilde). El patrón real en SchoolNet (verificado con consulta `SELECT DISTINCT permission_module`) es **slug en inglés minúscula** para todos los módulos (`hr`, `new-students`, `teacher-eval`, `institutional-eval`, etc.).

**Causa raíz:** El sidebar busca permisos por `mod.id` definido en `SIDEBAR_MODULE_ORDER` (que es `'planning'` en inglés), no por `permission_module` en español. Si los dos no coinciden, el sidebar oculta el módulo silenciosamente.

**Decisión:** Para todos los nuevos módulos, `permission_module` debe ser el mismo slug en inglés que se usa como `id` en `SIDEBAR_MODULE_ORDER` y como `id` en `APP_CONFIG.modules`. El nombre legible en español (con tildes y mayúsculas) va solo en el campo `permission_name` y en `name` dentro de `SIDEBAR_MODULE_ORDER`.

**Acción tomada:** UPDATE en DEV y PROD cambiando `permission_module` de `'Planeación'` a `'planning'`.

**Para futuro:** actualizar el SPEC `MODULO_PLANEACION_v1.0_Especificacion.md` sección 3.2 con la convención correcta.

---

## Pendientes y bloqueos

### 🟢 Listo para continuar — el archivo `planner-form.html` está cerrado en DEV y PROD

Tras el cierre de `planner-form.html`, las opciones de continuación son:

1. **Pantallas de coordinación** — `planners.html` (paso 7), `coordinator-area.html` y `coordinator-program.html` (paso 9). Requiere conversación previa con coordinaciones para validar qué información esperan.
2. **Notificaciones por email** — paso 4.3c. Requiere decisión de política antes de codificar.
3. **`units.html`** — paso 5. Listado general de UIs para coordinadores PEP.
4. **Pulido de bugs menores** — test formal de `subjects-descriptions` en `unit-form.html`. ~~Typo `alidatePageAccess` en `sections.html`~~, ~~auditoría faltante en tablas del módulo~~ y ~~deuda técnica en `unit-form.html` (polling + atomicidad SQL)~~ resueltos (ver histórico de hitos).

### 🟡 Pendientes operativos (no bloqueantes para desarrollo, dependen de terceros)

1. **Asignación manual de permisos a roles en PROD.** Los 7 permisos del módulo `planning` existen en PROD pero **ningún rol los tiene asignados** (excepto superadmin por lógica del sidebar). Pendiente asignar permisos a los roles correspondientes vía la UI de SchoolNet en PROD.

2. **Poblar datos pedagógicos en PROD:**
   - `grades.program_id`: asignar PEP/PAI/PD a cada grado (13 de 14 grados pendientes).
   - `academic_areas.coordinator_worker_id`: asignar coordinador a las áreas que correspondan (10 de 11 áreas pendientes).
   - Coordinar con direcciones de sección para que un par de docentes UI hagan pruebas reales.

3. **Pruebas con equipo académico real.** Las pruebas de desarrollo de `planner-form.html` fueron exitosas. Las pruebas con el equipo académico se harán cuando esté disponible.

4. **Actualización del SPEC v1.0** con las decisiones tomadas:
   - Sección 3.2: `permission_module = 'planning'` (no `'Planeación'`).
   - Sección 6.5: modelo de `pln_planners` sin `teacher_id` en UNIQUE, `teacher_id` como creador histórico.
   - Sección 8.1: formulario información general — colaboradores precargados.
   - Eliminación de la sección de `index.html` (10.1 y 10.2).

5. **Catálogo Tilatá:** poblar los atributos institucionales propios desde la interfaz de `catalogs.html` cuando el usuario tenga el material del PEI y sitio web.

6. **Deuda técnica de SchoolNet (no del módulo):** el sistema de auditoría no captura el usuario de la aplicación (registra `'DB: postgres'`). Reportada al sistema interno de tickets el 26/05/2026.

---

## Histórico de hitos cerrados

- **25 de mayo de 2026** — Paso 1.1 cerrado: 9 catálogos creados en DEV y PROD con seeds iniciales (excepto `pln_tilata_attributes`, intencionalmente vacía).
- **25 de mayo de 2026** — Paso 1.2 cerrado: 7 tablas principales creadas en DEV y PROD con 18 FKs correctas.
- **25 de mayo de 2026** — Paso 1.3 cerrado: 13 tablas M:N creadas en DEV y PROD. Total acumulado: 29 tablas del módulo.
- **25 de mayo de 2026** — Paso 1.4 cerrado: 24 índices de performance creados en DEV y PROD.
- **25 de mayo de 2026** — Paso 1.5 cerrado: 8 permisos creados en DEV y PROD. Asignación a roles se realizará manualmente vía UI.
- **25 de mayo de 2026** — 🎯 **Hito mayor: bloque SQL completo del módulo aplicado en DEV y PROD** (29 tablas + 24 índices + 8 permisos).
- **25 de mayo de 2026** — Paso 2 cerrado: módulo registrado en `sidebar.js` (en bloque "Académico" entre Evaluación de Desempeño e Indicadores) y `config.js` (entrada en `APP_CONFIG.modules`). Corrección aplicada: `permission_module` cambió de `'Planeación'` a `'planning'` para seguir el patrón de slug en inglés del resto de módulos.
- **25 de mayo de 2026** — Paso 2.1 cerrado: eliminado el permiso huérfano `'Planeación'` (índice de módulo) en DEV y PROD. El módulo queda con 7 permisos funcionales.
- **25 de mayo de 2026** — Paso 3 cerrado en DEV: `catalogs.html` desplegado con CRUD funcional para los 9 catálogos del módulo. Patrón visual de tabs Bootstrap replicado de `services-config.html`.
- **25 de mayo de 2026** — Hallazgo y corrección: las 29 tablas del módulo tenían RLS activado pese a los `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` originales. Corrección aplicada vía DO block (paso 3.1).
- **25 de mayo de 2026** — ⏸️ Paso 4.1 (`unit-form.html`) construido pero pausado antes de aplicar en DEV. Hallazgo durante el diseño: `academic_assignments` ya modela "Unit of Inquiry" como asignatura por curso. El modelo de autor/colaborador debe validarse con coordinación de programa antes de continuar.
- **25 de mayo de 2026** — Respuestas de coordinación recibidas: UI por grado, creadores son docentes con "Unit of Inquiry", todos los docentes del grado editan, coordinadores de área y programa también editan. Un coordinador puede coordinar varias áreas pero un área tiene un solo coordinador.
- **25 de mayo de 2026** — Verificaciones SQL: no hay relación nativa entre `grades` y `programs`, ni entre `academic_areas` y un coordinador. Se diseña paso 4.0 para ampliar el esquema con dos columnas nuevas. El archivo `unit-form.html` v0 queda descartado como base; se reescribirá sobre el modelo nuevo (v1).
- **26 de mayo de 2026** — Paso 4.0 cerrado: aplicado SQL de ampliación de esquema en DEV y PROD. `grades.program_id` y `academic_areas.coordinator_worker_id` agregados con sus índices. Verificación visual confirmada en ambos ambientes.
- **26 de mayo de 2026** — Paso 4.0a cerrado: ampliada la interfaz `grades.html` con selector de programa (modal + filtro), visualización del programa en cada tarjeta del grid, e integración con la BD. Aplicado en DEV y PROD.
- **26 de mayo de 2026** — Paso 4.0b cerrado: ampliada la interfaz `academic-areas.html` con selector de coordinador en el modal, visualización del coordinador en la lista de áreas, y fix de contraste para el ítem activo. Aplicado en DEV y PROD.
- **26 de mayo de 2026** — Refinamiento del modelo: se incorpora al **director de sección** como sexto editor de UIs (Opción C). La tabla `sections` y la pantalla `sections.html` ya existen y están pobladas. No requiere SQL ni nueva UI. El modelo final tiene 6 editores: creador, colaboradores, docentes del grado, coordinador de área, director de programa, director de sección.
- **26 de mayo de 2026** — Paso 4.1 Bloque 1 implementado en DEV: control de acceso con 6 caminos, validación de creación, pre-carga de colaboradores, modo solo lectura, pantalla de error amigable. Hallazgos: `workers` no tiene `user_id` (unión por email), URL del permiso "Crear unidad de indagación" requirió `?new=true`. Tests del Bloque 1 validados parcialmente (falta probar creación exitosa con grados poblados de programa).
- **26 de mayo de 2026** — Desviación del plan: se construyó `my-units.html` (listado de UIs del grado) tras descubrir bug de UX (cada click en "Crear" generaba UI nueva en blanco, no permitía retomar UIs existentes). Solución: el sidebar ahora apunta a `my-units.html` que muestra listado con selector de año académico y botón "Nueva unidad". La creación se mueve allí y `unit-form.html` se vuelve solo de edición. Funcional en DEV.
- **26 de mayo de 2026** — Bug en Quill: contenido HTML guardado vía `getSemanticHTML()` no se renderiza al recargar (usa formato semántico simplificado, no estructura interna de Quill). Solución: helper `setQuillHTML()` que usa `clipboard.dangerouslyPasteHTML()` para que Quill interprete y reconstruya su estructura visual. Aplicado en DEV.
- **26 de mayo de 2026** — Activación de auditoría en tablas `pln_*`: 30 triggers creados (10 tablas × 3 operaciones), función `audit_trigger_function()` actualizada con casos para las nuevas tablas. Validado: `row_id` captura correctamente el UUID del registro modificado. Aplicado en DEV y PROD.
- **26 de mayo de 2026** — Detectada deuda técnica del sistema SchoolNet: `audit_log.user_display_name` registra `'DB: postgres'` en lugar del usuario real (1.439 registros vs 3 con nombre real en últimos 30 días). Causa: `set_current_user()` usa `is_local = true`, la variable de sesión se pierde entre fetches HTTP separados. Fuera del alcance del paso 4. Reportada como bug en el sistema interno de tickets.
- **26 de mayo de 2026** — ✅ Paso 4.1 cerrado en DEV. Bloque 2 (informativo de coordinaciones) agregado: muestra debajo de los colaboradores los coordinadores de área de las materias vinculadas, el director del programa y el director de la sección. Personas con múltiples roles se muestran una sola vez con sus roles concatenados. El bloque se recalcula automáticamente cuando cambian las materias de la UI.
- **26 de mayo de 2026** — ✅ Sincronización PROD completa (BD): columnas nuevas, índices, RLS deshabilitado en las 29 tablas pln_*, URL del permiso "Crear unidad de indagación" actualizada, 10 triggers de auditoría, función `audit_trigger_function()` actualizada. PR de código mergeado a `main` y deployado a PROD por Vercel. Falta poblar datos manualmente (programas en grados, coordinaciones de área).
- **26 de mayo de 2026** — Lección aprendida: el cache del sidebar usa `sessionStorage` (no `localStorage`). Para limpiar tras cambios de permisos: `sessionStorage.removeItem('schoolnet_sidebar_permissions')` o `sessionStorage.clear()`.
- **26 de mayo de 2026** — Aclaración importante sobre `academic_years.cycles`: el "6" se refiere a la **rotación semanal de días tipo D1-D6** del horario, no a ciclos pedagógicos. Los ciclos del módulo Planeación son iteraciones pedagógicas internas de cada UI, independientes del calendario.
- **26 de mayo de 2026** — 🔵 Paso 4.2 Sub-bloque A en DEV: CRUD básico de ciclos funcional (crear, listar, expandir/colapsar, eliminar con renumeración automática). Decisiones de diseño: secuencia obligatoria, acordeones individuales con auto-colapso, sin drag&drop.
- **27 de mayo de 2026** — Paso 4.2 Sub-bloque B cerrado en DEV: cuerpo editable de ciclos (13 campos), tabla de áreas + conexiones IB, autosave coherente, sumativa toggleable, reactividad cruzada con materias. Bug de timing de Quill resuelto.
- **27 de mayo de 2026** — Paso 4.3a cerrado en DEV: 3 reflexiones finales de cierre de UI. Correcciones aprovechadas: filtro `source === 'user'` en Quill de UI, `enable(false)` extendido a Quill de ciclos en modo solo lectura.
- **27 de mayo de 2026** — Paso 4.3b cerrado en DEV: comentarios polimórficos sobre UI y cada ciclo de UI. Soft-delete del raíz preserva respuestas. 3 etapas validadas secuencialmente.
- **27 de mayo de 2026** — Decisión arquitectónica: modelo "planeador-por-grado". UNIQUE constraint cambiado en DEV y PROD. `teacher_id` reinterpretado como "creador histórico" sin migración.
- **27 de mayo de 2026** — Paso 6.1 cerrado en DEV y PROD: `my-planners.html` + sincronización automática de colaboradores en `unit-form.html`. Tests críticos de codocencia y retiro de docente validados.
- **27 de mayo de 2026** — Decisión arquitectónica: mecanismo de polling para concurrencia + atomicidad SQL para creación de hijos.
- **27 de mayo de 2026** — Pasos 6.2.A y 6.2.B cerrados en DEV.
- **27 de mayo de 2026** — Paso 3 (`catalogs.html`) sincronizado a PROD vía PR `developmen` → `main`.
- **28 de mayo de 2026** — ✅ Sincronización PROD del bloque acumulado: pasos 4.2, 4.3a, 4.3b, 6.2.A, 6.2.B + deuda de RLS verificada en PROD.
- **28 de mayo de 2026** — Paso 6.2.C cerrado en DEV y PROD (Marco curricular completo, 11 campos). Sub-bloques: C.1 (10 campos directos + helpers nuevos `patchPlanner`, `debouncedPatch`, `flushDebounced`, `setQuillHTML`, contador de PATCH) y C.2 (ATL multi-select agrupado por categoría). Refactor de Bloque 1 para usar los helpers nuevos.
- **28 de mayo de 2026** — Paso 6.2.D cerrado en DEV y PROD (Criterios de evaluación). Primera función SQL atómica del módulo: `pln_create_planner_criterion(uuid)`. Bug corregido durante el desarrollo: separación de lock y aggregation en plpgsql (`FOR UPDATE` no se permite con funciones de agregación).
- **28 de mayo de 2026** — Paso 6.2.E cerrado en DEV y PROD (Reflexión del trimestre, 4 Quill).
- **28 de mayo de 2026** — Paso 6.2.F cerrado en DEV y PROD (Ciclos del planeador completo, 11 campos por ciclo). Segunda función SQL atómica: `pln_create_planner_cycle(uuid)`. Validación cruzada asimétrica de fechas (mover inicio adelante arrastra el fin; mover fin antes del inicio rechaza con alert). Toggle de sumativa con cancelación de debounce. Decisión: PATCH de ciclos NO actualiza `pln_planners.updated_at`.
- **28 de mayo de 2026** — Paso 6.2.G cerrado en DEV y PROD (Comentarios polimórficos sobre planeador y sobre cada ciclo). Bugs corregidos durante el desarrollo: 401 por `Prefer` que rompía wrapper (regla confirmada: nunca pasar headers a `supabaseRequest()`); hilos de ciclos no hidratados al cargar (refresh explícito tras `cargarComentarios()`). Intento descartado: cache-buster `_cb=...` rompe PostgREST (regla confirmada: PostgREST no ignora parámetros desconocidos).
- **28 de mayo de 2026** — 🎯 **Hito mayor: `planner-form.html` funcionalmente completo en DEV y PROD** (6 bloques cubiertos, 4 caminos de acceso, polling de concurrencia, autosave coherente, dos funciones SQL atómicas en BD). Pruebas con equipo académico pendientes cuando esté disponible.
- - **Sesión previa sin documentar en su momento** — Bug menor `sections.html` (typo `alidatePageAccess` línea 308) corregido a `validatePageAccess`. Verificado el 28 de mayo de 2026 en visualización del archivo.

- **28 de mayo de 2026** — Ampliación de cobertura de auditoría del módulo Planeación: 10 triggers nuevos aplicados en DEV y PROD sobre `pln_unit_cycles`, `pln_unit_cycle_areas`, `pln_unit_cycle_connections`, `pln_planners`, `pln_planner_cycles`, `pln_planner_assessment_criteria`, `pln_planner_courses`, `pln_planner_atl_skills`, `pln_planner_connections`, `pln_comments`. `audit_trigger_function()` actualizada con 10 mapeos nuevos de `row_id`. Total de triggers `pln_*_audit_trigger` activos: 20 (10 previos + 10 nuevos). Catálogos del módulo (9 tablas `pln_ib_*`, `pln_action_*`, `pln_connection_types`, `pln_inquiry_stages`, `pln_tilata_attributes`) quedan intencionalmente sin auditoría por ser lookups gestionados desde `catalogs.html` con bajo flujo de cambios.

- **28 de mayo de 2026** — Función SQL atómica `pln_create_unit_cycle(p_unit_id uuid)` creada en DEV y PROD. Replica el patrón de `pln_create_planner_cycle`: `PERFORM 1 ... FOR UPDATE` + `SELECT MAX(cycle_number) + 1` + `INSERT ... RETURNING *`. Resuelve la race condition en la creación de ciclos de UI por clientes concurrentes (especialmente relevante en codocencia PEP).
- **28 de mayo de 2026** — Deuda técnica de `unit-form.html` cerrada en DEV y PROD: (1) `agregarCiclo()` migrado a RPC `pln_create_unit_cycle` (elimina el cálculo `Math.max(...) + 1` en cliente, vulnerable a race conditions); (2) mecanismo de polling de concurrencia implementado replicando el patrón de `planner-form.html` (banner sticky de conflicto, polling de `pln_units.updated_at` cada 15s, deshabilitado en modo solo lectura, sincronización de `lastKnownUpdatedAt` con PATCH propios). Decisión arquitectónica confirmada: el polling vigila solo la tabla padre, no las hijas — mismo criterio que en `planner-form.html`. Deuda técnica restante anotada: `renumerarCiclos()` también es vulnerable a race conditions ante eliminaciones concurrentes (no se aborda ahora porque eliminar es mucho menos frecuente que crear; arreglarlo requeriría una función SQL `pln_renumber_unit_cycles` adicional).

---

*Última actualización: 28 de mayo de 2026 — ✅ `planner-form.html` funcionalmente completo en DEV y PROD. ✅ `unit-form.html` funcionalmente completo en DEV y PROD con paridad de robustez frente a `planner-form.html` (polling de concurrencia + atomicidad SQL en creación de ciclos). Tres funciones SQL atómicas activas en ambos ambientes: `pln_create_planner_criterion(uuid)`, `pln_create_planner_cycle(uuid)`, `pln_create_unit_cycle(uuid)`. Cobertura de auditoría: 20 triggers `pln_*_audit_trigger` activos en DEV y PROD (5 tablas principales + criterios de evaluación + M:N pedagógicas). Bug menor `sections.html` verificado como ya corregido. Las pruebas de desarrollo fueron exitosas; las pruebas con el equipo académico real se harán cuando esté disponible. **Próximas opciones de continuación**: (b) pantallas de coordinación (`planners.html` paso 7, `coordinator-area.html` y `coordinator-program.html` paso 9); (c) notificaciones por email (paso 4.3c); (d) `units.html` (paso 5). Pendiente menor restante de (e): test formal de `subjects-descriptions` en `unit-form.html`. Deuda técnica futura anotada: `renumerarCiclos()` en `unit-form.html` es vulnerable a race conditions ante eliminaciones concurrentes — no urgente porque eliminar es poco frecuente. Tareas operativas pendientes (dependen de terceros): asignar 7 permisos del módulo a roles en PROD, poblar `grades.program_id` en 13 de 14 grados PROD, poblar `academic_areas.coordinator_worker_id` en 10 de 11 áreas PROD.*
