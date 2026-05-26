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
| 3.1 | SQL correctivo — DISABLE RLS en las 29 tablas del módulo | 🔵 Aplicado en DEV, pendiente PROD |
| 4 | `unit-form.html` — formulario de Unidad de Indagación | ⏸️ Reformulado tras hallazgos de coordinación |
| 4.0 | SQL — ampliación de esquema (grades.program_id, academic_areas.coordinator_worker_id) | 🔵 SQL entregado, pendiente aplicar en DEV |
| 4.0a | Ampliar interfaz de gestión de grados para asignar programa | Pendiente — se hará para poblar `grades.program_id` por UI |
| 4.0b | Ampliar interfaz de áreas (`academic-areas.html`) para asignar coordinador | Pendiente — se hará para poblar `academic_areas.coordinator_worker_id` por UI |
| 4.0c | Poblar datos vía las interfaces ampliadas | Pendiente — depende de 4.0a y 4.0b |
| 4.1 | Refactor `unit-form.html` con modelo definitivo (control de acceso + selector de grado + pre-carga colaboradores) | Archivo previo descartado — se reescribe sobre el modelo nuevo |
| 4.2 | Gestión de ciclos | Pendiente |
| 4.3 | Cierre + planeadores vinculados + comentarios | Pendiente |
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
   - El director del programa al que pertenece el grado de la UI
4. **Pre-carga automática de colaboradores al crear:** todos los workers con asignaciones académicas en el grado se agregan automáticamente como `pln_unit_collaborators`. El creador es `is_lead = true`, los demás `is_lead = false`. El creador puede quitar manualmente a quienes no apliquen.

---

#### Hallazgos técnicos durante la verificación

Consultas a la BD revelaron dos huecos en el modelo de datos que **deben resolverse antes** de codificar el formulario:

1. **No hay relación nativa entre `grades` y `programs`.** `grades` no tiene `program_id`. Sin esa columna, no podemos saber qué director de programa puede editar una UI.

2. **No hay relación nativa entre `academic_areas` y un coordinador.** `academic_areas` no tiene `coordinator_worker_id`. Sin esa columna, no podemos saber qué coordinador de área puede editar una UI.

---

### Paso 4.0 — SQL: ampliación de esquema 🔵

**Estado:** SQL entregado al usuario el 25 de mayo de 2026, pendiente de aplicar en DEV.

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

**Aplicado en DEV:** pendiente
**Aplicado en PROD:** pendiente

---

### Paso 4.0a — Ampliar UI de gestión de grados Pendiente

**Objetivo:** Permitir a un administrador asignar el programa a cada grado desde la interfaz, **sin necesidad de ejecutar SQL manualmente**.

**Decisión explícita del usuario:** *"Después tendremos que modificar las interfaces actuales para no tener que poblar por consulta... necesito dejar el sistema listo."*

**Alcance:**
- Identificar la página actual de gestión de grados en SchoolNet (probablemente algo como `/modules/config/grades.html`).
- Agregar un campo select de "Programa" en el modal de crear/editar grado.
- Validación: el campo es opcional al crear, pero los programas que existan deben listarse desde `programs`.

**Pendiente de iniciar.**

---

### Paso 4.0b — Ampliar `academic-areas.html` para asignar coordinador Pendiente

**Objetivo:** Permitir a un administrador asignar un coordinador a cada área académica desde la interfaz.

**Alcance:**
- Modificar el modal de crear/editar área en `/modules/config/academic-areas.html` (ya existe).
- Agregar un campo select de "Coordinador de área" que lista workers activos.
- Guardar `coordinator_worker_id` en la tabla `academic_areas`.

**Pendiente de iniciar.**

---

### Paso 4.0c — Poblar datos vía las interfaces Pendiente

**Depende de:** 4.0a y 4.0b cerrados.

**Acciones del usuario:**
1. Asignar programa a cada uno de los grados desde la UI ampliada.
2. Asignar coordinador a cada área académica que tenga uno designado.

---

### Paso 4.1 — Refactor de `unit-form.html` (sobre el modelo nuevo) Pendiente

**Depende de:** 4.0, 4.0a, 4.0b, 4.0c cerrados.

**Diferencias con el archivo descartado:**

| Concepto | Archivo descartado (v0) | Archivo nuevo (v1) |
|---|---|---|
| Quién puede entrar | Cualquier worker con permiso | Solo workers con relación pedagógica con el grado (creador, colaboradores, docentes del grado, coord. área, director programa) |
| Selector de grado | Multi-select libre | Single-select restringido a grados donde el creador tiene asignación de "Unit of Inquiry" |
| Colaboradores | Lista vacía, se agregan ad-hoc | Pre-cargados automáticamente desde `academic_assignments` del grado |
| Modo solo lectura | No implementado | Sí, para workers que tienen permiso pero no relación pedagógica con la UI |
| Lógica de coordinadores | Inexistente | Funciones `canEdit()` evalúan coord. de área (vía materias de la UI) y director de programa (vía `grades.program_id`) |

**Archivo previo:** `unit-form.html` v0 (1423 líneas) — se conserva como referencia histórica pero no se aplica.

---

## Decisiones de implementación

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

1. **Ejecutar el DO block del paso 3.1 (DISABLE RLS) en PROD.** El SQL está documentado en la sección del paso 3.1 de esta bitácora.

2. **Hacer PR de `developmen` → `main`** para llevar a PROD:
   - `sidebar.js` (con entrada de Planeación en bloque "Académico")
   - `config.js` (con entrada en `APP_CONFIG.modules`)
   - `/modules/planning/catalogs.html`

3. **Asignación manual de permisos a roles** vía la UI de SchoolNet. Los 7 permisos del módulo están en BD pero aún no asignados a ningún rol específico (acordamos hacerlo manualmente).

4. **Actualización del SPEC v1.0** con las decisiones tomadas tras la conversación con coordinación. Especialmente secciones 3.2 (`permission_module = 'planning'`), 6.5 (modelo de `pln_units` y control de acceso), 8.1 (formulario información general — colaboradores precargados), y eliminación de la sección de `index.html` (10.1 y 10.2).

5. **Catálogo Tilatá:** poblar los atributos institucionales propios desde la interfaz de `catalogs.html` cuando el usuario tenga el material del PEI y sitio web.

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

---

*Última actualización: 25 de mayo de 2026 — Modelo de control de acceso a UIs definido tras conversación con coordinación. SQL del paso 4.0 (ampliar `grades` y `academic_areas`) entregado, pendiente de aplicar. Próximos pasos: ampliar interfaces de gestión de grados y de áreas académicas para poblar las nuevas relaciones por UI, no por SQL.*
