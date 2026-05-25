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
| 4 | `unit-form.html` — formulario de Unidad de Indagación | ⏸️ Pausado — pendiente decisiones de coordinación |
| 4.1 | Estructura base + Información general | ⏸️ Archivo construido, NO aplicado en DEV (en espera) |
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

### Paso 4 — `unit-form.html` ⏸️ PAUSADO

**Fecha de inicio:** 25 de mayo de 2026
**Fecha de pausa:** 25 de mayo de 2026
**Estado:** Pausado — esperando decisiones de coordinación de programa

**Razón de la pausa:**

Durante el diseño funcional de la página, el usuario detectó dos hallazgos importantes que requieren confirmación de coordinación antes de continuar:

1. **`academic_assignments` ya modela "Unit of Inquiry" como una asignatura asignada por curso.** En el módulo `Config > Asignación Académica`, cada curso (Cuarto A, Cuarto B, etc.) tiene un docente específico asignado a la asignatura "Unit of Inquiry". Esto sugiere que el **autor/dueño** de cada UI no es un colaborador cualquiera, sino el docente asignado a "Unit of Inquiry" para ese curso.

2. **El modelo de "docentes colaboradores" puede no ser ad-hoc.** Los demás docentes del mismo curso (Science, Social Studies, Lenguaje, etc., también en `academic_assignments`) podrían preseleccionarse automáticamente como colaboradores, no agregarse manualmente desde un chip selector.

**Implicaciones de diseño:**

Si los hallazgos se confirman, el modelo de creación de UI cambia:

| Modelo actual (SPEC v1.0) | Modelo refinado (probable) |
|---|---|
| Cualquier worker con permiso `Crear unidad de indagación` crea UIs | Solo el docente con asignación a "Unit of Inquiry" del curso |
| `created_by` se setea al usuario actual sin validación | `created_by` se valida contra `academic_assignments` |
| Grado de la UI lo elige el docente vía multi-select | Grado/curso derivado de la asignación |
| Colaboradores se agregan vía chip selector | Colaboradores preseleccionados automáticamente desde `academic_assignments` (otros docentes del mismo curso) |
| UI vinculada a `grade_id` | UI posiblemente vinculada a `course_id` o ambos |

**Estado del archivo construido (sub-paso 4.1):**

- Archivo `unit-form.html` con 1.423 líneas / ~65 KB generado.
- Construido sobre el modelo del SPEC v1.0 original (cualquier worker con permiso crea, colaboradores ad-hoc).
- **Funcionalmente correcto y técnicamente sin errores conocidos.**
- **NO aplicado en DEV.** Se mantiene en pausa hasta que coordinación confirme el modelo.

**Posibles escenarios tras la respuesta de coordinación:**

- **Escenario A — confirman el modelo del SPEC v1.0:** se aplica el archivo tal cual está, sin cambios.
- **Escenario B — refinan el modelo de autoría:** se ajustan ~50-100 líneas del archivo (función `crearNuevaUI`, validación al cargar, prerellenado de colaboradores). No requiere rehacer estructura.
- **Escenario C — cambio mayor (ej: UI por `course_id` en lugar de `grade_id`):** requiere ajustes al SQL del módulo (agregar `course_id` a `pln_units` o cambiar `pln_unit_grades` por `pln_unit_courses`). El archivo se ajusta en consecuencia.

---

### Preguntas formuladas a coordinación de programa

Para que la conversación con coordinación sea productiva, estos son los puntos a llevar:

1. **¿Una UI pertenece a un curso específico (Cuarto A) o a un grado (Cuarto, ambos cursos juntos)?**

   En `academic_assignments` la asignación es por curso individual. ¿Cada curso hace su propia UI o trabajan en una sola UI compartida del grado?

2. **¿Quién puede crear una UI?**

   - Opción 1: Solo el docente asignado a "Unit of Inquiry" del curso (según `academic_assignments`).
   - Opción 2: Cualquier docente con asignación académica en el grado.
   - Opción 3: Cualquier worker con el permiso del módulo (lo más laxo).

3. **¿Los colaboradores se preseleccionan automáticamente?**

   Cuando el docente de UI crea la unidad, ¿los otros docentes del mismo curso (Science, Social Studies, etc.) se agregan automáticamente como colaboradores, o cada uno decide unirse manualmente?

4. **¿Qué pasa con UIs transdisciplinarias entre cursos paralelos?**

   Si Cuarto A y Cuarto B comparten una UI ("¿Cómo nos expresamos?"), ¿son dos UIs paralelas con el mismo título o una UI única que ambos docentes co-editan?

5. **¿El docente de "Unit of Inquiry" puede crear varias UIs al año o solo una por trimestre/ciclo?**

6. **¿El modelo de coordinación de PAI/PD es similar? ¿Hay una asignatura equivalente a "Unit of Inquiry" en PAI?**

7. **Decisión D7 original (quién edita una UI existente):** además del autor y colaboradores, ¿el coordinador de área y/o el coordinador de programa pueden editar el contenido o solo dejar comentarios? Esta pregunta ya estaba abierta antes de los hallazgos de hoy.

---

## Decisiones de implementación

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

### 🔴 Bloqueante para paso 4 — Decisiones de coordinación de programa

El sub-paso 4.1 está construido pero **NO aplicado en DEV** a la espera de las siguientes confirmaciones:

1. ¿Una UI pertenece a un curso o a un grado?
2. ¿Quién puede crear una UI? (docente con asignación a "Unit of Inquiry" vs. cualquier docente con permiso)
3. ¿Los colaboradores se preseleccionan automáticamente desde `academic_assignments`?
4. ¿UIs entre cursos paralelos: una sola UI compartida o dos UIs paralelas?
5. ¿Cuántas UIs puede crear un docente por año/trimestre?
6. ¿El modelo PAI/PD es equivalente?
7. **D7 original:** ¿coordinadores de área y programa editan o solo comentan?

### 🟡 Pendientes operativos (no bloqueantes)

1. **Ejecutar el DO block del paso 3.1 (DISABLE RLS) en PROD.** El SQL está documentado en la sección del paso 3.1 de esta bitácora.

2. **Hacer PR de `developmen` → `main`** para llevar a PROD:
   - `sidebar.js` (con entrada de Planeación en bloque "Académico")
   - `config.js` (con entrada en `APP_CONFIG.modules`)
   - `/modules/planning/catalogs.html`

3. **Asignación manual de permisos a roles** vía la UI de SchoolNet. Los 7 permisos del módulo están en BD pero aún no asignados a ningún rol específico (acordamos hacerlo manualmente).

4. **Actualización del SPEC v1.0** con las decisiones que tome coordinación de programa. Especialmente secciones 3.2 (`permission_module = 'planning'`), 6.5 (modelo de `pln_units`), 8.1 (formulario información general), y eliminación de la sección de `index.html` (10.1 y 10.2).

5. **Catálogo Tilatá:** poblar los atributos institucionales propios desde la interfaz de `catalogs.html` (acordado que el usuario lo hace cuando tenga el material del PEI y sitio web).

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

---

*Última actualización: 25 de mayo de 2026 — Paso 4 pausado a la espera de decisiones de coordinación de programa. Sub-paso 4.1 (`unit-form.html`) construido pero NO aplicado en DEV. Resumen de pendientes operativos disponibles en la sección "Pendientes y bloqueos".*
