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
| 3 | `catalogs.html` — gestión de catálogos | ✅ Cerrado |
| 3.1 | SQL correctivo — DISABLE RLS en las 29 tablas del módulo | ✅ Cerrado (DEV y PROD) |
| 4 | `unit-form.html` — formulario de Unidad de Indagación | ⏸️ Reformulado tras hallazgos de coordinación |
| 4.0 | SQL — ampliación de esquema (grades.program_id, academic_areas.coordinator_worker_id) | ✅ Cerrado — aplicado en DEV y PROD |
| 4.0a | Ampliar interfaz de gestión de grados para asignar programa | ✅ Cerrado |
| 4.0b | Ampliar interfaz de áreas (`academic-areas.html`) para asignar coordinador | ✅ Cerrado |
| 4.0c | Poblar datos vía las interfaces ampliadas | 🔵 Próximo paso |
| 4.1 | Refactor `unit-form.html` con modelo definitivo (control de acceso + selector de grado + pre-carga colaboradores) | ✅ Cerrado en DEV |
| 4.2 | Gestión de ciclos | ✅ Cerrado en DEV (Sub-bloques A y B completos). Pendiente sincronización a PROD. |
| 4.3a | Cierre de la unidad (3 reflexiones finales) | ✅ Cerrado en DEV |
| 4.3b | Comentarios polimórficos (`pln_comments`) | ✅ Cerrado en DEV |
| 4.3c | Notificaciones por email de comentarios | Pendiente |
| 5 | `units.html` — listado de UIs | Pendiente |
| 6 | `planner-form.html` — formulario de Planeador de Área | Pendiente |
| 7 | `planners.html` — listado de planeadores | Pendiente |
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
**Fecha de cierre:** 25 de mayo de 2026
**Estado:** Cerrado — CRUD funcional en DEV (creación, edición, activar/desactivar)

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
**Aplicado en PROD:** pendiente PR de `developmen` → `main`

---

### Paso 3.1 — SQL correctivo: DISABLE RLS en las 29 tablas 🔵

**Fecha de inicio:** 25 de mayo de 2026
**Estado:** Aplicado en DEV, pendiente PROD

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
**Aplicado en PROD:** pendiente

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
**Estado:** Cerrado — aplicado y validado en DEV.

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
**Aplicado en PROD:** pendiente PR de `developmen` → `main`.

**Pendiente operativo (paso 4.0c parcial):** el usuario debe asignar el programa correspondiente a cada grado (PEP, PAI, PD) desde la interfaz ampliada. Esta acción se realiza una sola vez en DEV; tras hacer PR a PROD se repite en PROD.

---

### Paso 4.0b — Ampliar `academic-areas.html` con selector de coordinador ✅

**Fecha de inicio:** 26 de mayo de 2026
**Fecha de cierre:** 26 de mayo de 2026
**Estado:** Cerrado — aplicado y validado en DEV.

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
**Aplicado en PROD:** pendiente PR de `developmen` → `main`.

---

### Paso 4.0c — Poblar datos vía las interfaces 🔵

**Depende de:** 4.0a y 4.0b cerrados ✅

**Acciones del usuario (en DEV primero, luego en PROD tras hacer PR):**

1. Ir a `grades.html` y asignar el programa correspondiente a cada grado (PEP, PAI, PD).
2. Ir a `academic-areas.html` y asignar coordinador a cada área académica que tenga uno designado.

**Pendiente de ejecución por el usuario.**

---

### Paso 4.1 — Refactor de `unit-form.html` (sobre el modelo nuevo) ✅

**Fecha de cierre:** 26 de mayo de 2026
**Estado:** Cerrado en DEV. Pendiente PR a PROD.

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

#### Archivos modificados en DEV

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

### Paso 4.2 — Gestión de ciclos 🔵 EN CURSO

**Estado:** Sub-bloque A cerrado en DEV (26/05/2026). Sub-bloque B pendiente.

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

**Fecha de cierre en DEV:** 27 de mayo de 2026.

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

**Fecha de cierre en DEV:** 27 de mayo de 2026.

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

**Fecha de cierre en DEV:** 27 de mayo de 2026.

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

### Paso 4.3c — Notificaciones por email de comentarios — PENDIENTE

Por implementar en sesión propia (cuando se decida):

- Notificar al autor de la UI/ciclo cuando alguien le comenta (excepto si se comenta a sí mismo).
- Opcional: notificar a todos los editores activos de la UI.
- Usar `sendNotification()` (Google Apps Script) ya existente en SchoolNet.
- Decisiones por tomar: alcance (solo autor o todos los editores), formato del email, opt-out por usuario, agregación (no spamear con un email por comentario).

---

### Paso 4.3b — Comentarios polimórficos — PENDIENTE

Por implementar (en sesión propia):
- Hilo de comentarios en `pln_units` y `pln_unit_cycles` (entity_type polimórfico).
- Render cronológico con avatar (`getWorkerPhotoUrl()`), nombre, fecha relativa.
- Crear comentario al nivel del entity.
- Responder (1 nivel de anidación, `parent_comment_id`).
- Soft-delete (`comment_status = 'deleted'`, solo autor).
- Notificación por email via `sendNotification()` al notificar al autor de la UI/ciclo.

---

## Decisiones de implementación

### 26 de mayo de 2026 — Activación de auditoría para tablas `pln_*`

**Hallazgo:** las tablas `pln_*` se crearon en el paso 1 sin triggers de auditoría. El sistema SchoolNet tiene una función estándar `audit_trigger_function()` que se aplica a cada tabla auditada mediante un trigger por tabla con el patrón `<tabla>_audit_trigger`.

**Aplicado en DEV:**

1. Se crearon 10 triggers (uno por cada tabla `pln_*`) que disparan en INSERT, UPDATE y DELETE:
   - `pln_units`, `pln_unit_grades`, `pln_unit_collaborators`, `pln_unit_subjects`, `pln_unit_key_concepts`, `pln_unit_atl_skills`, `pln_unit_learner_profile`, `pln_unit_tilata_attributes`, `pln_unit_action_types`, `pln_unit_action_scope`.
   - Total: 30 triggers (10 tablas × 3 operaciones).

2. Se modificó la función `audit_trigger_function()` para capturar correctamente el `row_id` de las nuevas tablas. La función tiene un IF-ELSIF que mapea nombre de tabla a su PK; antes caía al `ELSE` y guardaba `'unknown'`. Se agregaron los 10 casos `pln_*`. Las tablas M:N (todas menos `pln_units`) usan PK compuesta como row_id, ej. `unit_id || '-' || grade_id`, coherente con el patrón existente para `role_permissions` y `user_roles`.

**Validación realizada:** edición de título de UI desde el formulario por Belzner. Registro antes del fix: `row_id = 'unknown'`. Después del fix: `row_id` con el `unit_id` real.

**Aplicado en DEV:** ✅ 26 de mayo de 2026.
**Aplicado en PROD:** ⏸️ Pendiente. Mismo script de los triggers (sin requerir cambios) y nueva versión de `audit_trigger_function()`.

---

### 26 de mayo de 2026 — Deuda técnica detectada: usuario en auditoría

**Hallazgo:** el campo `audit_log.user_display_name` registra `'DB: postgres'` en lugar del usuario real de la aplicación en la gran mayoría de los registros de SchoolNet.

**Causa raíz identificada:** la función `set_current_user()` usa `set_config('app.current_user_id', user_uuid::text, true)` con el parámetro `is_local = true`, lo que hace que la variable solo persista durante UNA transacción. Como cada llamada a `supabaseRequest()` en `config.js` ejecuta `set_current_user` y la query subsecuente en **fetch HTTP separados** (= conexiones/transacciones distintas en PostgREST), la variable se pierde entre llamadas.

**Evidencia:** consulta agregada de los últimos 30 días muestra **1.439 registros** con `'DB: postgres'` vs **3 registros** con nombre de usuario real (`Mora Cortes Alexander`, en `env_water_readings_daily`). Es un bug arquitectónico del sistema completo, NO específico al módulo Planeación.

**Implicación:** la auditoría sigue capturando QUÉ cambió (`old_values`, `new_values`) y CUÁNDO (`changed_at`), pero rara vez identifica QUIÉN (el `changed_by` uuid también queda en NULL). Para investigaciones forenses se puede triangular con la hora y los registros del cliente (logs del navegador, IP, etc.), pero no es ideal.

**Estado:** documentado como deuda técnica del sistema SchoolNet (no del módulo Planeación). Resolución requiere análisis arquitectónico (probablemente cambiar a `is_local = false` con session ID, o adoptar Supabase Auth + RLS para que `auth.uid()` esté disponible automáticamente). Fuera del alcance del paso 4.

---

Antes de codificar, se cerraron 3 decisiones funcionales en conversación con el usuario:

**Decisión 1 — Flujo de creación: sin modal de selección de grado**

- El sistema asume la regla institucional definitiva: **un docente UI = un solo grado**.
- Al hacer click en "Crear unidad de indagación", el sistema busca el grado del docente vía `academic_assignments` (subject "Unit of Inquiry", año vigente).
- Si tiene exactamente 1 grado → crea la UI directamente.
- Si tiene 0 grados → mensaje "No tiene asignación de Unit of Inquiry. No puede crear UIs."
- Si tiene 2+ grados (caso excepcional, no esperado en el próximo año) → mensaje de error pidiendo contactar al administrador.

**Decisión 2 — Pre-carga de colaboradores: Opción A**

Al crear la UI, todos los workers con asignaciones académicas activas en cualquier curso del grado se agregan automáticamente a `pln_unit_collaborators`:
- El creador como `is_lead = true`.
- Los demás como `is_lead = false`.
- El creador puede quitar manualmente a los que no aplican.
- Los workers de otras áreas (que no enseñan en el grado) se agregan manualmente vía buscador si se necesitan.

**Decisión 3 — Visualización del bloque informativo de coordinaciones**

Debajo de la lista de colaboradores se muestra un bloque informativo (read-only):
- Coordinador(es) del área académica de las materias vinculadas a la UI.
- Director del programa al que pertenece el grado.
- Director de la sección del grado.

Estas personas **NO se agregan como colaboradores**. Su capacidad de editar viene automáticamente por su rol (caminos 4, 5 y 6 del modelo de acceso).

**Decisión 4 — Cambios de personal: reacción automática**

- Caminos 3-6 reaccionan automáticamente a cambios en BD (asignaciones, coordinadores, directores).
- Camino 2 (colaboradores) requiere intervención manual para agregar/quitar de la lista.
- **Validación adicional:** el control de acceso de colaborador (camino 2) valida `worker_status = 'active'`. Un colaborador inactivo pierde acceso automáticamente.
- **Visualización:** los colaboradores inactivos se muestran tachados/grises con ícono de "inactivo" (no se ocultan, dan transparencia al equipo para limpiar la lista).

**Decisión 5 — Workers sin acceso: modo solo lectura (Opción B)**

- Un worker con el permiso `Gestionar unidades de indagación` que no cumpla ninguno de los 6 caminos de edición **puede ver la UI en modo solo lectura**.
- Todos los campos `disabled`, sin botones de añadir/quitar.
- Banner amarillo: "Está viendo esta unidad en modo lectura. No puede editarla."
- Razón: transparencia institucional, los docentes pueden inspirarse en UIs de otros grados/programas.
- Si en el futuro se necesita más estricto, se puede endurecer sin tocar UI.

---

### 26 de mayo de 2026 — Refinamiento del modelo: incorporar al director de sección como editor

**Planteamiento del usuario:** En el Colegio Tilatá, el PEP IB comprende oficialmente desde Prejardín hasta Quinto. Sin embargo, operativamente hay dos coordinaciones de facto:
- **Coordinación PEP "oficial"** → enfoque pedagógico en primero a quinto.
- **Dirección de preescolar** → revisa y acompaña las UIs de prejardín, jardín y transición.

**Opciones consideradas:**

- **A:** Crear un programa "Primera infancia" separado. Descartada: rompe la fidelidad al marco IB (el PEP oficialmente incluye preescolar).
- **B:** Permitir múltiples directores por programa (tabla M:N). Descartada: ambos editarían todo el PEP sin distinción, no refleja la realidad de delegación de funciones.
- **C (elegida):** Incorporar al **director de sección** como un editor adicional. Las secciones (Preescolar, Primaria, Escuela media, Escuela alta) ya están modeladas en la tabla `sections` con director_email, y los grados ya tienen `section_id`.

**Decisión:**

Se incorpora el **director de sección** como un sexto editor en el modelo de control de acceso a UIs. La directora de preescolar puede editar UIs de prejardín/jardín/transición por ser directora de sección "Preescolar"; la coordinadora PEP puede editar todas las UIs del PEP por ser directora del programa.

**Ventaja adicional:** la Opción C refleja la estructura organizacional colombiana real (directores de sección como figura institucional) sin forzar el marco IB.

**Verificación técnica realizada:** la tabla `sections` ya existe con `director_email` poblado para las 4 secciones (Preescolar, Primaria, Escuela media, Escuela alta). Existe la pantalla `sections.html` con CRUD completo. No requiere SQL adicional ni nueva interfaz.

**Modelo definitivo de control de acceso a UIs (6 editores):**

1. Creador (`pln_units.created_by`)
2. Colaboradores (`pln_unit_collaborators`)
3. Docentes del grado (vía `academic_assignments` del año vigente)
4. Coordinador del área académica de las materias de la UI (vía `academic_areas.coordinator_worker_id`)
5. Director del programa del grado de la UI (vía `programs.program_director_email`)
6. Director de la sección del grado de la UI (vía `sections.director_email`)

---

### 25 de mayo de 2026 — Respuestas de coordinación de programa al modelo de UIs

**Confirmaciones recibidas:**

1. **Una UI por grado** (no por curso). Cuarto A y Cuarto B comparten una sola UI.
2. **Quién crea:** cualquier docente con asignación de "Unit of Inquiry" en algún curso del grado. En el ejemplo de Cuarto: Sánchez Ramírez Carlos Andrés (Cuarto A) **o** Leguizamón Russi Juan Nicolás (Cuarto B). Cualquiera de los dos.
3. **Quién edita:** además del creador y colaboradores, todos los docentes del grado (en cualquier asignatura), los coordinadores de área de las materias vinculadas, y el director del programa al que pertenece el grado.
4. **Un worker puede coordinar varias áreas, pero un área tiene un solo coordinador.** Esta confirmación específica del usuario descartó la propuesta de tabla M:N para coordinadores y validó el uso de un campo directo `coordinator_worker_id` en `academic_areas`.

---

### 25 de mayo de 2026 — Decisión: poblar nuevas relaciones por UI, no por SQL

**Decisión explícita del usuario:**

> *"Después tendremos que modificar las interfaces actuales para no tener que poblar por consulta... necesito dejar el sistema listo."*

**Implicación:** se crearon los sub-pasos 4.0a y 4.0b para ampliar las interfaces existentes:
- Gestión de grados → agregar selector de programa.
- `academic-areas.html` → agregar selector de coordinador en el modal de edición.

Esto asegura que cualquier cambio futuro en programas o coordinadores se haga vía la UI, sin necesidad de SQL ad-hoc.

---

### 25 de mayo de 2026 — Hallazgo: `academic_assignments` ya modela "Unit of Inquiry"

**Contexto:** Durante el diseño de `unit-form.html`, el usuario revisó el módulo `Config > Asignación Académica` y descubrió que `academic_assignments` ya tiene una asignatura específica llamada **"Unit of Inquiry"** que se asigna a un docente por curso (no por grado).

**Evidencia capturada:**
- En grado Cuarto: Cuarto A tiene asignada a Cajigas Silva Giovanna Marcela, Cuarto B a Sanchez Ramírez Carlos Andrés.
- La asignación es **por curso individual**, no por grado.

**Implicación pedagógica:**

El SPEC v1.0 modeló la UI como "transdisciplinaria, varios docentes de distintas áreas trabajando juntos" — pedagógicamente correcto. Pero el **autor/dueño** de cada UI probablemente NO es cualquier docente colaborador: **es el docente asignado a "Unit of Inquiry" para ese curso**.

Los demás docentes (Science, Social Studies, Lenguaje, etc.) son **colaboradores** que aportan a la UI desde sus áreas, pero el dueño es el docente UI.

**Acciones tomadas:**

1. Sub-paso 4.1 pausado antes de aplicar en DEV.
2. Lista de preguntas formuladas a coordinación de programa (ver sección "Paso 4" en este documento).
3. El archivo `unit-form.html` se mantiene generado y disponible, listo para aplicar o ajustar tras la respuesta de coordinación.

**Para futuro:** dependiendo de la respuesta, ajustar el SPEC v1.0 secciones 6.3 (modelo de datos), 8.1 (formulario de información general), 9 (reglas de negocio) y posiblemente 6.5 (`pln_units` con `course_id` además de `grade_id`).

---

### 25 de mayo de 2026 — RLS no se deshabilita confiablemente con ALTER inline

**Hallazgo:** Las 29 tablas creadas en los pasos 1.1, 1.2 y 1.3 incluían `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` inmediatamente después de cada `CREATE TABLE`. A pesar de eso, la verificación con `pg_tables.rowsecurity` reveló que las 29 tablas tenían RLS activado en DEV.

**Causa raíz:** No identificada con certeza. Posibles hipótesis:
- Trigger automático del proyecto DEV de Supabase que reactiva RLS post-creación.
- Algún ajuste de la consola SQL de Supabase que ignoró silenciosamente los ALTER.
- Política global aplicada al schema `public` que rehabilita RLS al final de transacciones.

**Decisión para futuras migraciones del módulo:**
1. Ejecutar siempre los `CREATE TABLE` y los `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` en **bloques SQL separados**, no en el mismo bloque.
2. **Después de cada migración** que cree tablas nuevas, ejecutar siempre un DO block de verificación + corrección como el del paso 3.1.
3. Documentar este paso como **obligatorio** en la guía interna de creación de módulos del proyecto.

---

### 25 de mayo de 2026 — Eliminación del paso "index.html del módulo"

**Hallazgo:** La arquitectura actual de SchoolNet, definida en el documento "Reestructuración de Módulos", **ya no usa índices por módulo**. La navegación se hace 100% por el sidebar lateral. El `config.js` lo dice explícitamente:

```
// Los index.html de cada módulo fueron eliminados tras la migración al
// menú lateral.
```

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

### 🟢 Sin bloqueantes — Listo para continuar cuando se retome

Las decisiones de coordinación de programa quedaron cerradas el 25 de mayo de 2026. El modelo de control de acceso a UIs está definido. Cuando se retome el trabajo, los próximos pasos son inmediatos:

1. **Aplicar SQL del paso 4.0** en DEV (y luego PROD). SQL listo en la sección "Paso 4.0" de esta bitácora.
2. **Construir paso 4.0a** (ampliar UI de gestión de grados con selector de programa).
3. **Construir paso 4.0b** (ampliar `academic-areas.html` con selector de coordinador).
4. **Poblar datos** (paso 4.0c) vía las interfaces ampliadas: asignar programa a cada grado y coordinador a cada área que tenga uno.
5. **Reescribir `unit-form.html`** (paso 4.1) sobre el modelo definitivo.

### 🟡 Pendientes operativos (no bloqueantes)

1. ~~**Ejecutar el DO block del paso 3.1 (DISABLE RLS) en PROD.**~~ ✅ Verificado el 27/05/2026: las 29 tablas `pln_*` en PROD ya tienen RLS deshabilitado. Bitácora no estaba actualizada.

2. **Hacer PR de `developmen` → `main`** para llevar a PROD:
   - `sidebar.js` (con entrada de Planeación en bloque "Académico")
   - `config.js` (con entrada en `APP_CONFIG.modules`)
   - `/modules/planning/catalogs.html`

3. **Asignación manual de permisos a roles** vía la UI de SchoolNet. Los 7 permisos del módulo están en BD pero aún no asignados a ningún rol específico (acordamos hacerlo manualmente).

4. **Actualización del SPEC v1.0** con las decisiones tomadas tras la conversación con coordinación. Especialmente secciones 3.2 (`permission_module = 'planning'`), 6.5 (modelo de `pln_units` y control de acceso), 8.1 (formulario información general — colaboradores precargados), y eliminación de la sección de `index.html` (10.1 y 10.2).

5. **Catálogo Tilatá:** poblar los atributos institucionales propios desde la interfaz de `catalogs.html` cuando el usuario tenga el material del PEI y sitio web.

6. **Auditoría en PROD:** ✅ aplicada el 26/05/2026 (10 triggers + `audit_trigger_function()` actualizada).

7. **`my-units.html` y permiso "Crear unidad de indagación":** ✅ sincronizado en PROD el 26/05/2026.

8. **Deuda técnica de SchoolNet (no del módulo):** el sistema de auditoría no captura el usuario de la aplicación (registra `'DB: postgres'`). Bug reportado al sistema interno de tickets el 26/05/2026.

9. **Asignación de permisos en PROD:** los 7 permisos del módulo `planning` existen en PROD pero **ningún rol los tiene asignados**. El superadmin ve el módulo (lógica de sidebar otorga todos los permisos a superadmins), pero los docentes/coordinadores reales no. Pendiente asignar permisos a los roles correspondientes vía la UI de SchoolNet en PROD.

10. **Poblar datos pedagógicos en PROD:**
    - `grades.program_id`: asignar PEP/PAI/PD a cada grado.
    - `academic_areas.coordinator_worker_id`: asignar coordinador a las áreas que correspondan.
    - Coordinar con direcciones de sección para que un par de docentes UI hagan pruebas reales.

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
- **25 de mayo de 2026** — Paso 3 cerrado: `catalogs.html` desplegado en DEV con CRUD funcional para los 9 catálogos del módulo. Patrón visual de tabs Bootstrap replicado de `services-config.html`.
- **25 de mayo de 2026** — Hallazgo y corrección: las 29 tablas del módulo tenían RLS activado pese a los `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` originales. Corrección aplicada vía DO block (paso 3.1).
- **25 de mayo de 2026** — ⏸️ Paso 4.1 (`unit-form.html`) construido pero pausado antes de aplicar en DEV. Hallazgo durante el diseño: `academic_assignments` ya modela "Unit of Inquiry" como asignatura por curso. El modelo de autor/colaborador debe validarse con coordinación de programa antes de continuar.
- **25 de mayo de 2026** — Respuestas de coordinación recibidas: UI por grado, creadores son docentes con "Unit of Inquiry", todos los docentes del grado editan, coordinadores de área y programa también editan. Un coordinador puede coordinar varias áreas pero un área tiene un solo coordinador.
- **25 de mayo de 2026** — Verificaciones SQL: no hay relación nativa entre `grades` y `programs`, ni entre `academic_areas` y un coordinador. Se diseña paso 4.0 para ampliar el esquema con dos columnas nuevas. El archivo `unit-form.html` v0 queda descartado como base; se reescribirá sobre el modelo nuevo (v1).
- **26 de mayo de 2026** — Paso 4.0 cerrado: aplicado SQL de ampliación de esquema en DEV y PROD. `grades.program_id` y `academic_areas.coordinator_worker_id` agregados con sus índices. Verificación visual confirmada en ambos ambientes.
- **26 de mayo de 2026** — Paso 4.0a cerrado: ampliada la interfaz `grades.html` con selector de programa (modal + filtro), visualización del programa en cada tarjeta del grid, e integración con la BD. Aplicado en DEV. Pendiente PR a PROD y asignación de programa a cada grado por el admin.
- **26 de mayo de 2026** — Paso 4.0b cerrado: ampliada la interfaz `academic-areas.html` con selector de coordinador en el modal, visualización del coordinador en la lista de áreas, y fix de contraste para el ítem activo. Aplicado en DEV. Pendiente PR a PROD.
- **26 de mayo de 2026** — Refinamiento del modelo: se incorpora al **director de sección** como sexto editor de UIs (Opción C). La tabla `sections` y la pantalla `sections.html` ya existen y están pobladas. No requiere SQL ni nueva UI. El modelo final tiene 6 editores: creador, colaboradores, docentes del grado, coordinador de área, director de programa, director de sección.
- **26 de mayo de 2026** — Paso 4.1 Bloque 1 implementado en DEV: control de acceso con 6 caminos, validación de creación, pre-carga de colaboradores, modo solo lectura, pantalla de error amigable. Hallazgos: `workers` no tiene `user_id` (unión por email), URL del permiso "Crear unidad de indagación" requirió `?new=true`. Tests del Bloque 1 validados parcialmente (falta probar creación exitosa con grados poblados de programa).
- **26 de mayo de 2026** — Desviación del plan: se construyó `my-units.html` (listado de UIs del grado) tras descubrir bug de UX (cada click en "Crear" generaba UI nueva en blanco, no permitía retomar UIs existentes). Solución: el sidebar ahora apunta a `my-units.html` que muestra listado con selector de año académico y botón "Nueva unidad". La creación se mueve allí y `unit-form.html` se vuelve solo de edición. Funcional en DEV.
- **26 de mayo de 2026** — Bug en Quill: contenido HTML guardado vía `getSemanticHTML()` no se renderiza al recargar (usa formato semántico simplificado, no estructura interna de Quill). Solución: helper `setQuillHTML()` que usa `clipboard.dangerouslyPasteHTML()` para que Quill interprete y reconstruya su estructura visual. Aplicado en DEV.
- **26 de mayo de 2026** — Activación de auditoría en tablas `pln_*`: 30 triggers creados (10 tablas × 3 operaciones), función `audit_trigger_function()` actualizada con casos para las nuevas tablas. Validado: `row_id` captura correctamente el UUID del registro modificado. Pendiente aplicar en PROD.
- **26 de mayo de 2026** — Detectada deuda técnica del sistema SchoolNet: `audit_log.user_display_name` registra `'DB: postgres'` en lugar del usuario real (1.439 registros vs 3 con nombre real en últimos 30 días). Causa: `set_current_user()` usa `is_local = true`, la variable de sesión se pierde entre fetches HTTP separados. Fuera del alcance del paso 4. Reportada como bug en el sistema interno de tickets.
- **26 de mayo de 2026** — ✅ Paso 4.1 cerrado en DEV. Bloque 2 (informativo de coordinaciones) agregado: muestra debajo de los colaboradores los coordinadores de área de las materias vinculadas, el director del programa y el director de la sección. Personas con múltiples roles se muestran una sola vez con sus roles concatenados. El bloque se recalcula automáticamente cuando cambian las materias de la UI.
- **26 de mayo de 2026** — ✅ Sincronización PROD completa (BD): columnas nuevas, índices, RLS deshabilitado en las 29 tablas pln_*, URL del permiso "Crear unidad de indagación" actualizada, 10 triggers de auditoría, función `audit_trigger_function()` actualizada. PR de código mergeado a `main` y deployado a PROD por Vercel. Falta poblar datos manualmente (programas en grados, coordinaciones de área).
- **26 de mayo de 2026** — Lección aprendida: el cache del sidebar usa `sessionStorage` (no `localStorage`). Para limpiar tras cambios de permisos: `sessionStorage.removeItem('schoolnet_sidebar_permissions')` o `sessionStorage.clear()`.
- **26 de mayo de 2026** — Aclaración importante sobre `academic_years.cycles`: el "6" se refiere a la **rotación semanal de días tipo D1-D6** del horario, no a ciclos pedagógicos. Los ciclos del módulo Planeación son iteraciones pedagógicas internas de cada UI, independientes del calendario.
- **26 de mayo de 2026** — 🔵 Paso 4.2 Sub-bloque A en DEV: CRUD básico de ciclos funcional (crear, listar, expandir/colapsar, eliminar con renumeración automática). Decisiones de diseño: secuencia obligatoria, acordeones individuales con auto-colapso, sin drag&drop. Próximo: Sub-bloque B (cuerpo editable + áreas académicas + conexiones).

---

*Última actualización: 27 de mayo de 2026 — ✅ Pasos 4.2, 4.3a y 4.3b cerrados en DEV. Paso 4.2 sincronizado a PROD (queda pendiente sincronizar 4.3a y 4.3b). Paso 3.1 (DISABLE RLS) verificado como ya aplicado en PROD. **Próximo paso al retomar: sincronizar 4.3a + 4.3b a PROD (un único PR `developmen` → `main`), luego paso 5 (`units.html` — listado para coordinadores) o paso 4.3c (notificaciones por email de comentarios).** Tareas operativas pendientes (dependen de terceros, no de desarrollo): asignar 7 permisos del módulo a roles en PROD, poblar `grades.program_id` en 13 de 14 grados PROD, poblar `academic_areas.coordinator_worker_id` en 10 de 11 áreas PROD.*
