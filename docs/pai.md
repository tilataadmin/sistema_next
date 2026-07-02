# Módulo de Planeación — Extensión Programa de los Años Intermedios (PAI / MYP)
## Documento de Referencia de Desarrollo

**Sistema:** SchoolNet (Colegio Tilatá)
**Módulo:** `planning` — extensión para el Programa de los Años Intermedios (PAI)
**Versión:** 1.0 (borrador de levantamiento)
**Fecha:** Julio 2026
**Estado:** En levantamiento — contiene decisiones cerradas y decisiones abiertas marcadas explícitamente
**Complementa a:**
- `Módulo_de_Planeación_de_Clases — Especificación de Desarrollo v1.0` (fuente de verdad del módulo base / PEP).
- `Modulo_Planeacion_Extension_PD_Referencia_Desarrollo.md` (extensión PD). Este documento **reutiliza gran parte de la infraestructura del trimestral PD** y solo describe el delta del PAI. No reescribe lo ya construido.

**Implementación prevista con:** Claude modelo **Sonnet**. Por eso el diseño se deja lo más cerrado y literal posible: definiciones a nivel DDL, nombres de tabla/campo verificados contra `DataBase`, y las decisiones pendientes marcadas para no dejar que el implementador improvise.

---

## 0. Acerca de este documento

### 0.1 Propósito

Referencia única para implementar el planeador del **PAI** en SchoolNet. El formato base institucional (`Planeador_PAI_-_Español_-Schoolnet.docx`) y el marco oficial de habilidades ATL del IB (`PAI.pdf`, Apéndice 1) son los insumos pedagógicos. Todo lo que aquí se define ya fue contrastado contra el esquema real de la base de datos.

### 0.2 Convenciones obligatorias del proyecto (no negociables)

Las mismas del módulo base y de la extensión PD:

1. **RLS desactivado.** Toda tabla nueva incluye `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;`. Verificar tras crear.
2. **`supabaseRequest(endpoint, { method, body })`** — opciones en objeto, nunca posicionales. **Nunca** pasar `headers` explícitos (los inyecta `getHeaders()` en `config.js`; pasarlos rompe la auth). *(Verificado en `config.js`, línea 422.)*
3. **PostgREST no ignora parámetros desconocidos.** Sin cache-busters.
4. **UPDATE sin WHERE está bloqueado** (safe mode). Usar siempre filtro.
5. **`getCurrentDateColombia()`** se define localmente por página; no es global en `config.js` *(confirmado)*.
6. **UUID en SQL** siempre hexadecimal completo.
7. **DDL primero en DEV**, verificar con `SELECT`, confirmar, luego PROD.
8. **Edición solo vía GitHub web** y **SQL solo vía Supabase SQL Editor.**
9. **Numeración de secuencias** (cycle_number, day_number) siempre atómica vía función SQL con `FOR UPDATE` + `MAX()+1`, nunca `Math.max()` en cliente.
10. **Auditoría:** tablas operativas nuevas se suman a `audit_trigger_function()` con sus 3 triggers. Los catálogos no se auditan.
11. **No gradientes** en UI. Solo colores sólidos.
12. **Idioma:** español neutro.
13. **Quill:** hidratar con `clipboard.dangerouslyPasteHTML()` (`setQuillHTML()` es helper local por página, ver `unit-form.html`); filtrar `source === 'user'` en `text-change`; patrón render-once + toggle CSS.

### 0.3 Entornos

- **DEV:** `spjzvpcsgbewxupjvmfm` / `sistema-next.vercel.app`
- **PROD:** `mrtuerkncqodhakuwjob` / `schoolnet.colegiotilata.edu.co`
- Flujo SQL: DEV → `SELECT` → confirmar → PROD. Código: editor web GitHub → commit `developmen` → Preview → PR a `main` → Producción.

---

## 1. Resumen ejecutivo y alcance

El planeador del PAI es **un documento por unidad**, con la siguiente estructura tomada del formato base:

1. **Encabezado**: profesor, asignatura, título de la unidad, Año PAI (derivado del grado), duración en horas.
2. **Indagación**: conceptos con definición, estrategia pedagógica para el aprendizaje conceptual, contexto global + perspectivas contextuales, atributos IB & Tilatá, enunciado de indagación, preguntas de indagación (fácticas / conceptuales / debatibles), objetivos con aspectos, evaluación sumativa, y enfoques de aprendizaje (ATL).
3. **Acción**: contenidos y estándares MEN, experiencias de aprendizaje, acción y servicio (opcional), evaluación formativa, diferenciación, recursos.
4. **Criterios de evaluación**: rejilla A–D × niveles de logro (0, 1–2, 3, 4, 5–6, 7–8).
5. **Cronograma**: ciclos (contenedores de hasta 6 días) → sesiones por día (tema, objetivo, actividades, recursos).

### 1.1 Principio rector: reutilizar el chasis del trimestral, cuerpo propio

La infraestructura del trimestral PD **sí sirve al PAI** en el chasis, pero **el cuerpo y la evaluación del PAI son propios** y no reutilizan las tablas del PD. Esta distinción es el eje de todo el diseño:

| Pieza | Se reutiliza (verificado en `DataBase`) | Nuevo para el PAI |
|---|---|---|
| Núcleo del planeador | `pln_planners` (`level = NULL`, `unit_id = NULL`, `dp_outline_id = NULL`) | — |
| Cronograma | `pln_planner_cycles` (contenedor) + `pln_planner_sessions` (día) | — |
| Cuerpo del planeador | — | `pln_planner_myp` (1:1) |
| Criterios de evaluación | **No aplica** `pln_planner_assessment_criteria` (es PEP: `objective_number` + `level_2..5`) | `pln_myp_assessment_criteria` (rejilla A–D × bandas) |
| ATL | `pln_ib_atl_skills` + `pln_planner_atl_skills` (con marco MYP separado por programa) | columna `program_scope` + seed del marco MYP |
| Atributos IB & Tilatá | catálogos `pln_ib_learner_profile` + `pln_tilata_attributes` | puentes de planeador (ver 4.6) |
| Estrategia de aprendizaje conceptual | — | catálogo `pln_myp_concept_strategies` + puente |
| Año PAI ↔ grado | — | tabla de equivalencia `pln_myp_grade_year` (gestión SQL, sin UI) |
| Comentarios | `pln_comments` (`entity_type` `'planner'` y `'planner_cycle'`, ya existen) | — |
| Auditoría, polling, control de acceso | infraestructura existente | triggers para tablas nuevas |
| Cursos del planeador | `pln_planner_courses` | — |

### 1.2 Fuera de alcance

- Reflexión del docente: **el formato base del PAI no incluye sección de reflexión** (a diferencia del PD). No se modela. Ver decisión abierta O5.
- Compartir planeadores con familias.
- Bandas 1–7 institucionales como rúbrica gestionable (viven en Phidias / descriptivas).
- Reportes analíticos del PAI.

---

## 2. Registro de decisiones de diseño

### 2.1 Decisiones cerradas (confirmadas con Desarrollos)

| # | Decisión | Justificación |
|---|---|---|
| D1 | **Reutilizar el núcleo `pln_planners`** para el planeador PAI, con `level = NULL`, `unit_id = NULL`, `dp_outline_id = NULL`. | El chasis (comentarios, auditoría, polling, control de acceso, cronograma, cursos) ya existe y sirve al PAI sin rediseño. |
| D2 | **Cuerpo PAI en extensión 1:1 `pln_planner_myp`**, no como columnas nullable en `pln_planners`, ni reutilizando `pln_planner_dp`. | Mismo criterio que el PD (D2 del doc PD): evita columnas de significado condicional; el cuerpo MYP es distinto del DP. |
| D3 | **Conceptos = texto libre** (un campo Quill, `concepts`). Sin catálogo de conceptos clave MYP ni tabla de conceptos relacionados. | El formato marca "(Espacio en blanco para meter texto)". |
| D4 | **Criterios A–D = rejilla de texto libre** (Opción A). Tabla hija `pln_myp_assessment_criteria`: una fila por (planeador + criterio A/B/C/D), con las 6 bandas de logro (0, 1–2, 3, 4, 5–6, 7–8) como columnas de texto. | Conserva la estructura visual del formato y permite PDF ordenado; no cabe en `pln_planner_assessment_criteria` (PEP). |
| D5 | **Objetivos (con aspectos) = texto libre** (`objectives`), dentro de Indagación, distinto de los criterios A–D. | Es donde el docente enuncia los objetivos y sus *strands*; el formato lo trae como espacio de texto. |
| D6 | **Contextos globales y perspectivas contextuales = texto libre**, no catálogo. | El formato los marca como espacio de texto, no como desplegable. |
| D7 | **Estrategia pedagógica para el aprendizaje conceptual = catálogo pequeño** de 6 valores fijos (Generalización, Clasificación, Representación, Transferencia cercana y lejana, Conceptos en uso, Internalización), consumido como desplegable. | El formato lo marca explícitamente como "Lista desplegable" con esos 6 valores. |
| D8 | **Atributos IB & Tilatá = multiselect combinado** sobre los catálogos existentes `pln_ib_learner_profile` + `pln_tilata_attributes`. | El desplegable del formato mezcla los 10 atributos del perfil IB con los atributos institucionales Tilatá en una sola lista. |
| D9 | **ATL = catálogo, marco MYP separado por programa** (Opción A: árboles independientes). Se agrega la columna `program_scope` (texto `'PEP'`/`'PAI'`/`'PD'`) a `pln_ib_atl_skills`; el marco MYP entra como su propio árbol (5 raíces + 10 grupos + indicadores) con `code` prefijado `myp_...` conservando el `UNIQUE (code)` global. Selección solo-hojas y M:N vía `pln_planner_atl_skills`, igual que el PEP. | El PEP ya resuelve el árbol, la selección solo-hojas y la M:N. La columna de texto (no FK a `programs`) sigue el patrón `program_name=like.PEP*` estable entre entornos. Prefijar el `code` no toca la restricción existente. |
| D10 | **Mapeo grado → Año PAI fijo, sin interfaz**, en tabla de equivalencia gestionada por SQL: 6°→2, 7°→3, 8°→4, 9°→5. El Año PAI **no se almacena** en el planeador; se deriva del grado en tiempo de render. | Regla institucional confirmada. Sin pantalla de administración. |
| D11 | **Distinción en el menú.** El PAI tiene su propia entrada de sidebar y su propio permiso, como el PD tiene `Mis esquemas bienales PD` y `Mis planeadores trimestrales PD`. | Coherencia con la separación por programa ya visible en el sidebar. |
| D12 | **Formularios PAI en archivos propios** (`myp-planner-form.html`, `my-myp-planners.html`), reutilizando helpers, control de acceso, comentarios, polling y la mecánica de ciclos/sesiones, sin sobrecargar `planner-form.html` (PEP) ni `dp-planner-form.html` (PD) con condicionales. | Mismo criterio que D13 del PD: menos riesgo para Sonnet. |
| D13 | **En `catalogs.html`, pestaña separada por programa para ATL**: la pestaña PEP existente se filtra a `program_scope='PEP'`; se agrega una pestaña PAI que filtra `program_scope='PAI'`. | Mantiene cada marco aislado visualmente; se apoya en el mismo discriminador de D9. |

### 2.2 Decisiones abiertas (requieren definición antes de escribir DDL)

| # | Punto | Impacto | Estado |
|---|---|---|---|
| **O1** | **Identidad/cardinalidad del planeador PAI.** `pln_planners` exige `trimester` (NOT NULL, CHECK 1–3) y su índice único es `(subject_id, grade_id, trimester, academic_year_id, COALESCE(level,''))`. Pero el formato del PAI es **por unidad**, y una asignatura MYP suele tener **más de una unidad por trimestre**. Si se conserva la identidad por trimestre, no se pueden tener dos unidades de la misma asignatura en el mismo trimestre. | **Bloqueante.** Define si se puede reutilizar `pln_planners` tal cual o si hay que relajar el `UNIQUE` (p. ej. agregar un consecutivo de unidad) para el PAI. | **Abierto.** Escalar a coordinación PAI: ¿los planeadores se organizan uno-por-trimestre o uno-por-unidad? |
| **O2** | **Cardinalidad de la estrategia de aprendizaje conceptual.** El formato repite el desplegable en dos filas → sugiere que puede haber más de una estrategia por planeador. | Single-select (columna FK en `pln_planner_myp`) vs. multi-select (puente M:N). | **Abierto.** Recomendación: multi-select (M:N), por lo que se ve en el formato. |
| **O3** | **¿El PAI tiene equivalente al bi-anual del PD?** Lectura de Desarrollos: no; las unidades MYP no se encadenan por bienio. | Si no, el planeador PAI no lleva `dp_outline_id` (queda `NULL`) y no hay entidad padre nueva. | **Abierto (con recomendación: NO).** Confirmar con coordinación. |
| **O4** | **`trimester` cuando el PAI es por unidad.** Si O1 se resuelve como "por unidad", hay que decidir qué se guarda en `trimester` (¿el trimestre predominante de la unidad? ¿se relaja el CHECK?). | Afecta el INSERT del planeador y el `UNIQUE`. | Depende de O1. |
| **O5** | **Sección de reflexión.** El formato del PAI no la trae. | Si coordinación la quiere, se agregan campos a `pln_planner_myp`. | **Abierto (con recomendación: omitir, seguir el formato).** |
| **O6** | **Puentes de planeador para perfil IB / Tilatá.** No existen `pln_planner_learner_profile` ni `pln_planner_tilata_attributes` en `DataBase` (solo existen los de UI: `pln_unit_learner_profile`, `pln_unit_tilata_attributes`). Verificar si el PD ya los creó antes de crearlos para el PAI, para no duplicar. | Define si se crean 2 tablas puente nuevas o ya existen. | **Abierto.** Verificar en repo/DB el estado del PD. |

> **Nota de método:** O1 es la decisión más importante. Todo el resto del modelo puede cerrarse en paralelo, pero el INSERT del planeador y su unicidad dependen de O1. No se debe escribir el DDL de `pln_planners` (ni su uso) hasta resolverlo.

---

## 3. Modelo conceptual PAI

```
┌─────────────────────────────────────────────────────────────────┐
│ PLANEADOR PAI (pln_planners + pln_planner_myp)                    │
│ Identidad: ver decisión abierta O1                                │
│ level = NULL · unit_id = NULL · dp_outline_id = NULL              │
│                                                                   │
│ Cuerpo (pln_planner_myp, 1:1):                                    │
│   Indagación: conceptos, contexto global, perspectivas,           │
│               enunciado, preguntas (fáctica/conceptual/debatible),│
│               objetivos, evaluación sumativa                      │
│   Acción: contenidos MEN, experiencias, acción y servicio,        │
│           evaluación formativa, diferenciación, recursos          │
│                                                                   │
│ Relaciones M:N:                                                   │
│   ATL            → pln_planner_atl_skills → pln_ib_atl_skills(PAI) │
│   Atributos      → perfil IB + Tilatá (ver O6)                    │
│   Estrategia     → pln_myp_concept_strategies (ver O2)            │
│   Cursos         → pln_planner_courses                            │
│                                                                   │
│ Criterios de evaluación:                                          │
│   pln_myp_assessment_criteria (A–D × bandas 0/1-2/3/4/5-6/7-8)    │
│                                                                   │
│ Cronograma:                                                       │
│   ┌───────────────────────────────────────────────────────┐      │
│   │ CICLO (pln_planner_cycles, contenedor numerado)        │      │
│   │   Día 1..6 (pln_planner_sessions):                     │      │
│   │     Tema / Objetivo / Actividades / Recursos           │      │
│   └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

  Año PAI = f(grado)  vía  pln_myp_grade_year   (no se almacena)
```

---

## 4. Modelo de datos

Todas las tablas nuevas: PK `uuid` con `gen_random_uuid()`, `created_at`/`updated_at` `timestamptz default now()`, `DISABLE ROW LEVEL SECURITY`, y registro en auditoría salvo los catálogos. **Los DDL de abajo son diseño de referencia, no ejecución.** El código se entregará después, inline y paso a paso, tras cerrar las decisiones abiertas.

### 4.1 Alteración a `pln_ib_atl_skills` — discriminador de programa (D9)

Estado verificado hoy: 162 nodos (5/13/52/92), todos PEP; sin columna de programa; `code` con `UNIQUE (code)` global; `level smallint CHECK (1..5)`.

```sql
-- 1) Agregar discriminador de programa
ALTER TABLE pln_ib_atl_skills
  ADD COLUMN program_scope varchar NOT NULL DEFAULT 'PEP'
  CHECK (program_scope IN ('PEP','PAI','PD'));

-- 2) Todo lo existente queda como PEP (el DEFAULT ya lo hace; explícito por claridad)
UPDATE pln_ib_atl_skills SET program_scope = 'PEP' WHERE program_scope IS NOT NULL;
```

- El marco MYP se carga como árbol nuevo con `program_scope='PAI'` y `code` prefijado `myp_...` (conserva el `UNIQUE (code)` global).
- Las tres consultas de carga se filtran por programa:
  - `unit-form.html` (PEP): `...&program_scope=eq.PEP`
  - futuro `myp-planner-form.html` (PAI): `...&program_scope=eq.PAI`
  - `catalogs.html`: cada pestaña filtra su programa (D13).

### 4.2 `pln_planner_myp` — Cuerpo del planeador PAI (1:1)

```sql
CREATE TABLE pln_planner_myp (
  planner_id uuid NOT NULL,
  -- Encabezado
  unit_title varchar,
  duration_hours varchar,                 -- "Duración de la Unidad (horas)"
  -- Indagación
  concepts text,                          -- Concepto(s) especificado(s) con definición (D3, texto libre)
  global_context_exploration text,        -- Contexto global con exploración (D6)
  perspective_individual text,            -- Perspectiva contextual: Individual (D6)
  perspective_local text,                 -- Perspectiva contextual: Local (D6)
  perspective_global text,                -- Perspectiva contextual: Global (D6)
  statement_of_inquiry text,              -- Enunciado indagatorio y/o pregunta de indagación
  inquiry_factual text,                   -- Preguntas de indagación: Fácticas
  inquiry_conceptual text,                -- Preguntas de indagación: Conceptuales
  inquiry_debatable text,                 -- Preguntas de indagación: Debatibles
  objectives text,                        -- Objetivos (con aspectos) (D5, texto libre)
  summative_assessment text,              -- Evaluación sumativa (descripción y relación con el enunciado)
  -- Acción
  men_content text,                       -- Contenidos y estándares MEN
  learning_experiences text,              -- Experiencias de aprendizaje y estrategias de enseñanza
  action_service text,                    -- Acción y servicio (opcional)
  formative_assessment text,              -- Evaluación formativa
  differentiation text,                   -- Diferenciación
  resources text,                         -- Recursos
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pln_planner_myp_pkey PRIMARY KEY (planner_id),
  CONSTRAINT pln_planner_myp_planner_id_fkey
    FOREIGN KEY (planner_id) REFERENCES pln_planners(planner_id) ON DELETE CASCADE
);
ALTER TABLE pln_planner_myp DISABLE ROW LEVEL SECURITY;
```

> `men_content` se pone en la extensión (no se reutiliza `pln_planners.men_standards`) por el mismo criterio de D2: mantener el cuerpo MYP autocontenido y evitar columnas de significado condicional en la tabla compartida.

### 4.3 `pln_myp_assessment_criteria` — Rejilla de criterios A–D (D4)

Una fila por (planeador + letra de criterio). Las 6 bandas de logro son columnas de texto.

```sql
CREATE TABLE pln_myp_assessment_criteria (
  criterion_id uuid NOT NULL DEFAULT gen_random_uuid(),
  planner_id uuid NOT NULL,
  criterion_letter varchar NOT NULL CHECK (criterion_letter IN ('A','B','C','D')),
  criterion_title varchar,                -- cada asignatura nombra su A/B/C/D
  band_0 text,                            -- nivel de logro 0
  band_1_2 text,                          -- 1–2
  band_3 text,                            -- 3
  band_4 text,                            -- 4
  band_5_6 text,                          -- 5–6
  band_7_8 text,                          -- 7–8
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pln_myp_assessment_criteria_pkey PRIMARY KEY (criterion_id),
  CONSTRAINT pln_myp_assessment_criteria_unique UNIQUE (planner_id, criterion_letter),
  CONSTRAINT pln_myp_assessment_criteria_planner_fkey
    FOREIGN KEY (planner_id) REFERENCES pln_planners(planner_id) ON DELETE CASCADE
);
ALTER TABLE pln_myp_assessment_criteria DISABLE ROW LEVEL SECURITY;
```

### 4.4 `pln_myp_concept_strategies` — Catálogo estrategia de aprendizaje conceptual (D7)

```sql
CREATE TABLE pln_myp_concept_strategies (
  strategy_id uuid NOT NULL DEFAULT gen_random_uuid(),
  code varchar NOT NULL UNIQUE,           -- ej. 'generalizacion'
  name_es varchar NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT pln_myp_concept_strategies_pkey PRIMARY KEY (strategy_id)
);
ALTER TABLE pln_myp_concept_strategies DISABLE ROW LEVEL SECURITY;
-- Seed: Generalización, Clasificación, Representación,
--       Transferencia cercana y lejana, Conceptos en uso, Internalización
```

Persistencia en el planeador — **depende de O2**:
- Si single-select: columna `concept_strategy_id uuid NULL REFERENCES pln_myp_concept_strategies` en `pln_planner_myp`.
- Si multi-select (recomendado): puente `pln_planner_myp_concept_strategies (planner_id, strategy_id)`.

### 4.5 `pln_myp_grade_year` — Equivalencia grado → Año PAI (D10)

```sql
CREATE TABLE pln_myp_grade_year (
  grade_id uuid NOT NULL,
  myp_year smallint NOT NULL CHECK (myp_year IN (2,3,4,5)),
  CONSTRAINT pln_myp_grade_year_pkey PRIMARY KEY (grade_id),
  CONSTRAINT pln_myp_grade_year_grade_fkey FOREIGN KEY (grade_id) REFERENCES grades(grade_id)
);
ALTER TABLE pln_myp_grade_year DISABLE ROW LEVEL SECURITY;
```

- Sin pantalla de administración (gestión por SQL).
- **Seed:** el `grade_id` difiere entre DEV y PROD, así que el seed resuelve por `grade_name` (patrón `parent_code`/nombre, no UUID manual). Mapeo: 6°→2, 7°→3, 8°→4, 9°→5.
- El planeador **no almacena** el Año PAI; el formulario lo deriva del grado con esta tabla.

### 4.6 Puentes de atributos IB & Tilatá (D8) — **depende de O6**

El formato combina perfil IB (10) + Tilatá en un solo desplegable. Como no existen puentes de planeador (solo de UI), se diseñan dos M:N nuevos (o se reutilizan si el PD ya los creó — verificar):

```sql
CREATE TABLE pln_planner_learner_profile (
  planner_id uuid NOT NULL,
  profile_attribute_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT pln_planner_learner_profile_pkey PRIMARY KEY (planner_id, profile_attribute_id),
  CONSTRAINT pln_planner_lp_planner_fkey FOREIGN KEY (planner_id) REFERENCES pln_planners(planner_id) ON DELETE CASCADE,
  CONSTRAINT pln_planner_lp_attr_fkey FOREIGN KEY (profile_attribute_id) REFERENCES pln_ib_learner_profile(profile_attribute_id)
);
ALTER TABLE pln_planner_learner_profile DISABLE ROW LEVEL SECURITY;

CREATE TABLE pln_planner_tilata_attributes (
  planner_id uuid NOT NULL,
  tilata_attribute_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT pln_planner_tilata_pkey PRIMARY KEY (planner_id, tilata_attribute_id),
  CONSTRAINT pln_planner_tilata_planner_fkey FOREIGN KEY (planner_id) REFERENCES pln_planners(planner_id) ON DELETE CASCADE,
  CONSTRAINT pln_planner_tilata_attr_fkey FOREIGN KEY (tilata_attribute_id) REFERENCES pln_tilata_attributes(tilata_attribute_id)
);
ALTER TABLE pln_planner_tilata_attributes DISABLE ROW LEVEL SECURITY;
```

La UI combina ambos catálogos en un solo selector (perfil IB + Tilatá) y escribe en el puente que corresponda por ítem.

### 4.7 Reutilización directa (sin cambios)

- **`pln_planners`** — núcleo (pendiente O1/O4 para su identidad).
- **`pln_planner_cycles`** — ciclo como contenedor numerado. En el PAI se usan solo `cycle_id`, `planner_id`, `cycle_number` (los campos pedagógicos del ciclo no aplican, igual que en el PD).
- **`pln_planner_sessions`** — `(cycle_id, day_number)` único; `topic`, `session_objective`, `activities`, `resources`. Mapea 1:1 con el cronograma del formato.
- **`pln_planner_atl_skills`** — M:N a `pln_ib_atl_skills` (filtrado `program_scope='PAI'`).
- **`pln_planner_courses`** — cursos del planeador.
- **`pln_comments`** — `entity_type='planner'` (planeador) y `'planner_cycle'` (ciclo); ambos ya existen en el CHECK.

---

## 5. Mapeo campo por campo (formato → almacenamiento)

| Formato base PAI | Almacenamiento | Tipo |
|---|---|---|
| Profesor | `pln_planners.teacher_id` (creador) | FK workers |
| Asignatura | `pln_planners.subject_id` | FK |
| Título de la Unidad | `pln_planner_myp.unit_title` | texto |
| Año PAI (2/3/4/5) | derivado del grado vía `pln_myp_grade_year` (no se almacena) | — |
| Duración de la Unidad (horas) | `pln_planner_myp.duration_hours` | texto |
| **Indagación** | | |
| Concepto(s) especificado(s) con definición | `pln_planner_myp.concepts` | texto libre |
| Estrategia pedagógica para el aprendizaje conceptual | catálogo `pln_myp_concept_strategies` (ver O2) | desplegable |
| Contexto global con exploración | `pln_planner_myp.global_context_exploration` | texto libre |
| Perspectivas contextuales: Individual / Local / Global | `perspective_individual` / `perspective_local` / `perspective_global` | texto libre |
| Atributos IB & Tilatá | `pln_planner_learner_profile` + `pln_planner_tilata_attributes` (ver O6) | multiselect |
| Enunciado indagatorio / pregunta de indagación | `pln_planner_myp.statement_of_inquiry` | texto libre |
| Preguntas: Fácticas / Conceptuales / Debatibles | `inquiry_factual` / `inquiry_conceptual` / `inquiry_debatable` | texto libre |
| Objetivos (con aspectos) | `pln_planner_myp.objectives` | texto libre |
| Evaluación sumativa (descripción y relación) | `pln_planner_myp.summative_assessment` | texto libre |
| Enfoques de Aprendizaje (ATL) | `pln_planner_atl_skills` → `pln_ib_atl_skills` (PAI) | multiselect solo-hojas |
| **Acción** | | |
| Contenidos y estándares MEN | `pln_planner_myp.men_content` | texto libre |
| Experiencias de aprendizaje y estrategias de enseñanza | `pln_planner_myp.learning_experiences` | texto libre |
| Acción y servicio (opcional) | `pln_planner_myp.action_service` | texto libre |
| Evaluación formativa | `pln_planner_myp.formative_assessment` | texto libre |
| Diferenciación | `pln_planner_myp.differentiation` | texto libre |
| Recursos | `pln_planner_myp.resources` | texto libre |
| **Criterios de evaluación** | | |
| Rejilla A–D × niveles 0/1-2/3/4/5-6/7-8 | `pln_myp_assessment_criteria` | rejilla de texto |
| **Cronograma** | | |
| Ciclo / Día / Tema / Objetivo / Actividades / Recursos | `pln_planner_cycles` + `pln_planner_sessions` | — |

---

## 6. Pantallas

### 6.1 `my-myp-planners.html` — Listado y creación

- Análoga a `my-units.html` (PEP). Lista los planeadores PAI del docente y permite crear.
- La creación valida asignación académica del docente (asignatura PAI en grado con `program_name=like.PAI*`) y crea el registro en `pln_planners` (identidad según O1) + fila 1:1 en `pln_planner_myp`.
- Permiso: **`Mis planeadores PAI`** (ver 7).

### 6.2 `myp-planner-form.html` — Edición del planeador PAI

- Reutiliza: helpers `supabaseRequest`, `setQuillHTML` (local), `debouncedPatch`/`patch...`, indicador de autoguardado, polling de concurrencia (15 s sobre `pln_planners.updated_at`, ancla desde la respuesta del PATCH), y la mecánica de ciclos/sesiones con creación atómica de secuencia vía función SQL.
- Bloques de UI: Encabezado → Indagación → Acción → Criterios (rejilla A–D) → Cronograma (ciclos → sesiones) → Comentarios.
- ATL: árbol colapsable solo-hojas idéntico al del PEP (`renderAtlTree`), con la query filtrada a `program_scope='PAI'`.
- Atributos IB & Tilatá: un solo `checkbox-grid` que combina ambos catálogos.
- Estrategia de aprendizaje conceptual: desplegable (o multiselect, según O2).
- **Solo lectura** cuando el control de acceso no habilita edición (mismo patrón del módulo).

### 6.3 `catalogs.html` — Pestaña ATL PAI (D13)

- La pestaña ATL actual se filtra a `program_scope='PEP'` y se corrige su texto descriptivo (hoy dice "3 niveles 5/13/21"; el real es **4 niveles 5/13/52/92** — verificado). Corrección cosmética.
- Se agrega pestaña **ATL PAI** que filtra `program_scope='PAI'`, con el mismo árbol/edición (solo texto/orden/estado; estructura fija).
- Nueva pestaña o sección para el catálogo `pln_myp_concept_strategies` (gestión de las 6 estrategias), opcional.

### 6.4 Pantallas de coordinación

`units.html`, `planners.html`, `coordinator-area.html`, `coordinator-program.html`, `coordinator-section.html` ya consultan `pln_planners`. Se agrega un **branch por programa** (`program_name like PAI*`) para abrir `myp-planner-form.html`. Sin rediseño de esas pantallas.

---

## 7. Sidebar y permisos (D11)

En `sidebar.js`, `MODULE_ITEM_ORDER.planning` incluye hoy (verificado):

```
'Mis planeadores de asignatura',
'Mis unidades de indagación',
'Mis esquemas bienales PD',
'Mis planeadores trimestrales PD',
'Coordinar planeación de asignatura',
'Coordinar planeación de programa',
'Coordinar planeación de sección',
'Administrar catálogos de planeación'
```

Cambio: agregar **`'Mis planeadores PAI'`** después de `'Mis planeadores trimestrales PD'`.

Tareas de permisos (SQL, en `permissions` + asignación a roles):
- Nuevo permiso `Mis planeadores PAI` con `permission_module='planning'` y `url_path` a `my-myp-planners.html` (verificar convención de ruta del módulo en repo).
- Las pantallas de coordinación reutilizan los permisos `Coordinar planeación de asignatura/programa/sección` existentes.
- Tras cambios de permisos: limpiar el cache de sidebar (`sessionStorage` key `schoolnet_sidebar_permissions`).

---

## 8. Catálogo ATL del marco MYP (seed)

Estructura del marco oficial (`PAI.pdf`, Apéndice 1), a transcribir tal cual en el seed con `program_scope='PAI'` y `code` prefijado `myp_...`:

- **Nivel 1 (5 categorías):** Comunicación, Sociales, Autogestión, Investigación, Pensamiento. *(Son las mismas 5 categorías que el PEP; por eso van como árbol separado, no compartido — D9.)*
- **Nivel 2 (10 grupos I–X):** I. Comunicación · II. Colaboración · III. Organización · IV. Afectivas · V. Reflexión · VI. Gestión de la información · VII. Alfabetización mediática · VIII. Pensamiento crítico · IX. Pensamiento creativo · X. Transferencia.
- **Nivel 3 (indicadores = hojas):** las viñetas de cada grupo.
- **Excepción de profundidad:** las **Habilidades afectivas (IV)** llevan un nivel intermedio adicional (Conciencia plena, Perseverancia, Gestión emocional, Automotivación, Resiliencia), y las hojas cuelgan de ese nivel. La tabla `pln_ib_atl_skills` (autorreferenciada, `level` 1–5) soporta esta profundidad despareja sin cambios; "hoja = nodo sin hijos" se deriva en JS (igual que el PEP).

> El conteo exacto de hojas del MYP se fija al transcribir el seed desde el PDF; no se estima aquí. El `code` de cada nodo debe ser único global (prefijo `myp_`).

---

## 9. Control de acceso

El planeador PAI reutiliza el **modelo de acceso del trimestral** ya definido para los planeadores (mismos "caminos": creador, docente del grado/asignatura, coordinación de área, dirección de programa, dirección de sección). No se rediseña. **Verificar en `planner-form.html` / `dp-planner-form.html`** los caminos exactos y el helper `validatePageAccessAny` (usado por el form PEP pero **no** presente en `config.js`; es helper de página — replicar/verificar).

---

## 10. Secuencia de implementación (para Sonnet)

Ejecutar en DEV, verificar con `SELECT`, confirmar, replicar en PROD. Nada de esto arranca hasta cerrar **O1** (y preferiblemente O2, O5, O6).

1. `ALTER TABLE pln_ib_atl_skills ADD COLUMN program_scope ...` + `UPDATE` a `'PEP'`. Verificar conteo por `program_scope`.
2. Seed del marco MYP en `pln_ib_atl_skills` (`program_scope='PAI'`, `code` `myp_...`). Verificar 5/10/… y cero huérfanos.
3. `CREATE TABLE pln_myp_grade_year` + seed por `grade_name`. Verificar.
4. `CREATE TABLE pln_myp_concept_strategies` + seed de las 6. Verificar.
5. `CREATE TABLE pln_planner_myp` (+ DISABLE RLS + auditoría).
6. `CREATE TABLE pln_myp_assessment_criteria` (+ DISABLE RLS + auditoría).
7. Puentes de atributos (según O6) y de estrategia (según O2), con DISABLE RLS.
8. Permiso `Mis planeadores PAI` + asignación a roles; ajuste de `MODULE_ITEM_ORDER` en `sidebar.js`.
9. `my-myp-planners.html` (listado + creación).
10. `myp-planner-form.html` (cuerpo + ATL + atributos + criterios + cronograma + comentarios + polling + control de acceso).
11. `catalogs.html`: filtro PEP + pestaña PAI + corrección del texto 5/13/52/92.
12. Branch por programa en las 4–5 pantallas de coordinación.
13. Manuales de usuario por pantalla (post-UI).

---

## 11. Glosario

| Término | Definición |
|---|---|
| PAI / MYP | Programa de los Años Intermedios del IB. En Tilatá: Años 2–5 = grados 6°–9°. |
| Planeador PAI | Documento por unidad. `pln_planners` (chasis) + `pln_planner_myp` (cuerpo). |
| ATL | Enfoques del aprendizaje. Catálogo `pln_ib_atl_skills`, marco MYP separado por `program_scope='PAI'`. |
| Rejilla de criterios | Matriz A–D × bandas de logro (0, 1–2, 3, 4, 5–6, 7–8). `pln_myp_assessment_criteria`. |
| Contexto global / perspectivas | Texto libre (D6). No catálogo. |
| Año PAI | Derivado del grado (`pln_myp_grade_year`); no se almacena en el planeador. |

---

## 12. Estado de cierre

**Cerrado:** cuerpo (D2), conceptos (D3), criterios (D4), objetivos (D5), contextos (D6), estrategia como catálogo (D7), atributos IB & Tilatá (D8), ATL separado por programa + `program_scope` + `code` prefijado (D9), mapeo grado→año sin UI (D10), distinción en menú (D11), archivos propios (D12), pestaña PAI en catálogos (D13).

**Abierto y bloqueante:** **O1** (identidad/cardinalidad del planeador — ¿por trimestre o por unidad?).
**Abierto no bloqueante:** O2 (estrategia single/multi), O3 (¿bi-anual PAI? recomendado no), O4 (qué guardar en `trimester`, depende de O1), O5 (reflexión, recomendado omitir), O6 (verificar puentes perfil/Tilatá del PD).

El siguiente paso, una vez resuelto O1, es empezar la secuencia de la sección 10 — un cambio a la vez, con confirmación entre pasos.
