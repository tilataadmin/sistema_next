# Módulo de Planeación — Extensión Programa de los Años Intermedios (PAI / MYP)
## Documento de Referencia de Desarrollo

**Sistema:** SchoolNet (Colegio Tilatá)
**Módulo:** `planning` — extensión para el Programa de los Años Intermedios (PAI)
**Versión:** 1.1 (levantamiento cerrado — sin decisiones abiertas)
**Fecha:** Julio 2026
**Estado:** Aprobado para inicio de desarrollo
**Complementa a:**
- `Módulo_de_Planeación_de_Clases — Especificación de Desarrollo v1.0` (fuente de verdad del módulo base / PEP).
- `Modulo_Planeacion_Extension_PD_Referencia_Desarrollo.md` (extensión PD). Este documento **reutiliza gran parte de la infraestructura del trimestral PD** y solo describe el delta del PAI.

**Implementación prevista con:** Claude modelo **Sonnet**. Diseño cerrado y literal: definiciones a nivel DDL, nombres de tabla/campo verificados contra `DataBase`, helpers verificados contra `config.js`.

**Cambios frente a v1.0:** O1 resuelto (uno-por-trimestre → reutilización directa de `pln_planners`; O4 anulado); O2 cerrado (estrategia multi-select); O3 cerrado (sin bi-anual); O5 cerrado (reflexión estilo PEP); O6 cerrado (dos puentes nuevos). **No quedan decisiones abiertas.**

---

## 0. Acerca de este documento

### 0.1 Propósito

Referencia única para implementar el planeador del **PAI** en SchoolNet. Insumos pedagógicos: el formato base institucional (`Planeador_PAI_-_Español_-Schoolnet.docx`) y el marco oficial de habilidades ATL del IB (`PAI.pdf`, Apéndice 1). Todo lo aquí definido fue contrastado contra el esquema real de la base de datos.

### 0.2 Convenciones obligatorias del proyecto (no negociables)

1. **RLS desactivado.** Toda tabla nueva incluye `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;`. Verificar tras crear.
2. **`supabaseRequest(endpoint, { method, body })`** — opciones en objeto, nunca posicionales. **Nunca** pasar `headers` explícitos (los inyecta `getHeaders()`; verificado en `config.js` línea 422).
3. **PostgREST no ignora parámetros desconocidos.** Sin cache-busters.
4. **UPDATE sin WHERE bloqueado** (safe mode). Siempre filtro.
5. **`getCurrentDateColombia()`** es local por página; no es global en `config.js` (confirmado).
6. **UUID en SQL** hexadecimal completo.
7. **DDL primero en DEV**, verificar con `SELECT`, confirmar, luego PROD.
8. **Edición solo vía GitHub web**; **SQL solo vía Supabase SQL Editor.**
9. **Numeración de secuencias** (cycle_number, day_number) atómica vía función SQL con `FOR UPDATE` + `MAX()+1`.
10. **Auditoría:** tablas operativas nuevas → `audit_trigger_function()` + 3 triggers. Catálogos no se auditan.
11. **No gradientes.** Solo colores sólidos.
12. **Español neutro.**
13. **Quill:** hidratar con `clipboard.dangerouslyPasteHTML()` (`setQuillHTML()` es helper local por página); filtrar `source === 'user'` en `text-change`; render-once + toggle CSS.

### 0.3 Entornos

- **DEV:** `spjzvpcsgbewxupjvmfm` / `sistema-next.vercel.app`
- **PROD:** `mrtuerkncqodhakuwjob` / `schoolnet.colegiotilata.edu.co`
- Flujo SQL: DEV → `SELECT` → confirmar → PROD. Código: GitHub web → `developmen` → Preview → PR a `main` → Producción.

---

## 1. Resumen ejecutivo y alcance

El planeador del PAI es **trimestral: tres por año académico por (asignatura + grado)**, uno por trimestre. En la práctica, cada planeador trimestral representa la unidad —o el tramo de unidad— que la asignatura trabaja en ese trimestre; por eso el formato habla de "unidad" y sus campos `unit_title` / `duration_hours` se llenan con eso.

Estructura tomada del formato base:

1. **Encabezado:** profesor, asignatura, título de la unidad, Año PAI (derivado del grado), duración en horas.
2. **Indagación:** conceptos con definición, estrategia(s) pedagógica(s) para el aprendizaje conceptual, contexto global + perspectivas contextuales, atributos IB & Tilatá, enunciado de indagación, preguntas (fácticas / conceptuales / debatibles), objetivos con aspectos, evaluación sumativa, y enfoques de aprendizaje (ATL).
3. **Acción:** contenidos y estándares MEN, experiencias de aprendizaje, acción y servicio (opcional), evaluación formativa, diferenciación, recursos.
4. **Criterios de evaluación:** rejilla A–D × niveles de logro (0, 1–2, 3, 4, 5–6, 7–8).
5. **Cronograma:** ciclos (contenedores de hasta 6 días) → sesiones por día (tema, objetivo, actividades, recursos).
6. **Reflexión:** tres campos estilo PEP (maestro / estudiantes / evaluación).

### 1.1 Principio rector: reutilizar el chasis del trimestral, cuerpo propio

| Pieza | Se reutiliza (verificado en `DataBase`) | Nuevo para el PAI |
|---|---|---|
| Núcleo del planeador | `pln_planners` (`level = NULL`, `unit_id = NULL`, `dp_outline_id = NULL`) — **identidad trimestral tal cual** | — |
| Cronograma | `pln_planner_cycles` (contenedor) + `pln_planner_sessions` (día) | — |
| Cuerpo del planeador | — | `pln_planner_myp` (1:1) |
| Criterios de evaluación | **No aplica** `pln_planner_assessment_criteria` (es PEP) | `pln_myp_assessment_criteria` (rejilla A–D × bandas) |
| ATL | `pln_ib_atl_skills` + `pln_planner_atl_skills` (marco MYP separado por programa) | columna `program_scope` + seed marco MYP |
| Atributos IB & Tilatá | catálogos `pln_ib_learner_profile` + `pln_tilata_attributes` | **puentes de planeador** `pln_planner_learner_profile` + `pln_planner_tilata_attributes` |
| Estrategia de aprendizaje conceptual | — | catálogo `pln_myp_concept_strategies` + **puente multi-select** |
| Año PAI ↔ grado | — | tabla de equivalencia `pln_myp_grade_year` (gestión SQL, sin UI) |
| Comentarios | `pln_comments` (`entity_type` `'planner'` y `'planner_cycle'`, ya existen) | — |
| Auditoría, polling, control de acceso | infraestructura existente | triggers para tablas nuevas |
| Cursos del planeador | `pln_planner_courses` | — |

### 1.2 Fuera de alcance

- Compartir planeadores con familias.
- Bandas 1–7 institucionales como rúbrica gestionable (viven en Phidias / descriptivas).
- Reportes analíticos del PAI.

---

## 2. Registro de decisiones de diseño (todas cerradas)

| # | Decisión | Justificación |
|---|---|---|
| D1 | **Reutilizar el núcleo `pln_planners`** con `level = NULL`, `unit_id = NULL`, `dp_outline_id = NULL`. | El chasis (comentarios, auditoría, polling, control de acceso, cronograma, cursos) ya existe y sirve al PAI sin rediseño. |
| **D1a** | **Identidad trimestral tal cual: `(subject_id, grade_id, trimester, academic_year_id)` con `level = NULL`.** Tres planeadores por año por asignatura-grado (uno por trimestre). **No se toca el `UNIQUE` existente.** | El PAI se organiza uno-por-trimestre (confirmado por coordinación/Desarrollos). No hay varias unidades concurrentes por asignatura en el mismo trimestre, así que la identidad trimestral del núcleo aplica sin cambios. *(Esto anula la antigua decisión abierta O4.)* |
| D2 | **Cuerpo PAI en extensión 1:1 `pln_planner_myp`**, no columnas nullable en `pln_planners`, ni reutilizando `pln_planner_dp`. | El cuerpo MYP es distinto del DP; evita columnas de significado condicional. |
| D3 | **Conceptos = texto libre** (`concepts`). Sin catálogo de conceptos clave ni tabla de conceptos relacionados. | El formato lo marca como espacio de texto. |
| D4 | **Criterios A–D = rejilla de texto libre.** `pln_myp_assessment_criteria`: una fila por (planeador + criterio A/B/C/D), con las 6 bandas (0, 1–2, 3, 4, 5–6, 7–8) como columnas de texto. | Conserva la estructura del formato; no cabe en `pln_planner_assessment_criteria` (PEP). |
| D5 | **Objetivos (con aspectos) = texto libre** (`objectives`), dentro de Indagación, distinto de los criterios A–D. | Donde el docente enuncia objetivos y *strands*; el formato lo trae como texto. |
| D6 | **Contextos globales y perspectivas contextuales = texto libre.** | El formato los marca como espacio de texto, no desplegable. |
| D7 | **Estrategia pedagógica para el aprendizaje conceptual = catálogo** de 6 valores fijos. | El formato lo marca como "Lista desplegable" con esos 6 valores. |
| **D7a** | **Estrategia = multi-select** (puente M:N `pln_planner_myp_concept_strategies`). | El formato repite el desplegable en dos filas → admite más de una estrategia por planeador. *(Cierra la antigua O2.)* |
| D8 | **Atributos IB & Tilatá = multiselect combinado** sobre `pln_ib_learner_profile` + `pln_tilata_attributes`. | El desplegable del formato mezcla perfil IB (10) + atributos Tilatá en una sola lista. |
| **D8a** | **Puentes de planeador nuevos** `pln_planner_learner_profile` + `pln_planner_tilata_attributes`. | No existen puentes a nivel de planeador (solo de UI); el planeador PAI no hereda de una unidad (`unit_id = NULL`), así que registra los atributos directamente. *(Cierra la antigua O6.)* |
| D9 | **ATL = catálogo, marco MYP separado por programa** (árboles independientes). Columna `program_scope` (`'PEP'`/`'PAI'`/`'PD'`) en `pln_ib_atl_skills`; marco MYP con `code` prefijado `myp_...` conservando el `UNIQUE (code)` global. Selección solo-hojas y M:N vía `pln_planner_atl_skills`. | El PEP ya resuelve árbol, selección solo-hojas y M:N. Columna de texto (no FK a `programs`) estable entre entornos, en línea con `program_name=like.PEP*`. |
| D10 | **Mapeo grado → Año PAI fijo, sin interfaz**, en `pln_myp_grade_year`: 6°→2, 7°→3, 8°→4, 9°→5. El Año PAI **no se almacena**; se deriva del grado. | Regla institucional confirmada. |
| D11 | **Distinción en el menú:** entrada y permiso propios (`Mis planeadores PAI`). | Coherencia con la separación por programa del sidebar (el PD ya tiene los suyos). |
| D12 | **Formularios PAI en archivos propios** (`myp-planner-form.html`, `my-myp-planners.html`). | Menos riesgo para Sonnet que ramificar los forms PEP/PD. |
| D13 | **`catalogs.html`: pestaña ATL separada por programa** (PEP filtrada + pestaña PAI). | Mantiene cada marco aislado; se apoya en el discriminador de D9. |
| **D14** | **Sin bi-anual.** El planeador PAI lleva `dp_outline_id = NULL`; no se crea entidad padre. | Las unidades MYP no se encadenan por bienio (confirmado). *(Cierra la antigua O3.)* |
| **D15** | **Reflexión estilo PEP: tres campos** en `pln_planner_myp` — `teacher_reflection`, `student_reflection`, `assessment_reflection`. | Definición de coordinación: adopta la estructura de reflexión del cierre de unidad del PEP. *(Cierra la antigua O5.)* |

---

## 3. Modelo conceptual PAI

```
┌─────────────────────────────────────────────────────────────────┐
│ PLANEADOR PAI (pln_planners + pln_planner_myp)                    │
│ Identidad: subject_id + grade_id + trimester + academic_year_id  │
│ level = NULL · unit_id = NULL · dp_outline_id = NULL             │
│ (tres por año: uno por trimestre)                                │
│                                                                   │
│ Cuerpo (pln_planner_myp, 1:1):                                    │
│   Indagación: conceptos, contexto global, perspectivas,           │
│               enunciado, preguntas (fáctica/conceptual/debatible),│
│               objetivos, evaluación sumativa                      │
│   Acción: contenidos MEN, experiencias, acción y servicio,        │
│           evaluación formativa, diferenciación, recursos          │
│   Reflexión: maestro / estudiantes / evaluación                   │
│                                                                   │
│ Relaciones M:N:                                                   │
│   ATL         → pln_planner_atl_skills → pln_ib_atl_skills(PAI)   │
│   Perfil IB   → pln_planner_learner_profile                       │
│   Tilatá      → pln_planner_tilata_attributes                     │
│   Estrategia  → pln_planner_myp_concept_strategies                │
│   Cursos      → pln_planner_courses                               │
│                                                                   │
│ Criterios: pln_myp_assessment_criteria (A–D × bandas)             │
│                                                                   │
│ Cronograma:                                                       │
│   CICLO (pln_planner_cycles) → Día 1..6 (pln_planner_sessions)    │
└─────────────────────────────────────────────────────────────────┘

  Año PAI = f(grado)  vía  pln_myp_grade_year   (no se almacena)
```

---

## 4. Modelo de datos

Tablas nuevas: PK `uuid` con `gen_random_uuid()`, `created_at`/`updated_at` `timestamptz default now()`, `DISABLE ROW LEVEL SECURITY`, auditoría salvo catálogos. **Los DDL son diseño de referencia.** El código se entrega después, inline y paso a paso.

### 4.1 Alteración a `pln_ib_atl_skills` — discriminador de programa (D9)

Estado verificado: 162 nodos (5/13/52/92), todos PEP; sin columna de programa; `code` con `UNIQUE (code)` global; `level smallint CHECK (1..5)`.

```sql
ALTER TABLE pln_ib_atl_skills
  ADD COLUMN program_scope varchar NOT NULL DEFAULT 'PEP'
  CHECK (program_scope IN ('PEP','PAI','PD'));

UPDATE pln_ib_atl_skills SET program_scope = 'PEP' WHERE program_scope IS NOT NULL;
```

Filtros de carga: `unit-form.html` → `program_scope=eq.PEP`; `myp-planner-form.html` → `program_scope=eq.PAI`; `catalogs.html` → por pestaña.

### 4.2 `pln_planner_myp` — Cuerpo del planeador PAI (1:1)

```sql
CREATE TABLE pln_planner_myp (
  planner_id uuid NOT NULL,
  -- Encabezado
  unit_title varchar,
  duration_hours varchar,
  -- Indagación
  concepts text,                          -- Concepto(s) especificado(s) con definición (D3)
  global_context_exploration text,        -- Contexto global con exploración (D6)
  perspective_individual text,            -- Perspectiva contextual: Individual (D6)
  perspective_local text,                 -- Perspectiva contextual: Local (D6)
  perspective_global text,                -- Perspectiva contextual: Global (D6)
  statement_of_inquiry text,              -- Enunciado indagatorio / pregunta de indagación
  inquiry_factual text,                   -- Preguntas: Fácticas
  inquiry_conceptual text,                -- Preguntas: Conceptuales
  inquiry_debatable text,                 -- Preguntas: Debatibles
  objectives text,                        -- Objetivos (con aspectos) (D5)
  summative_assessment text,              -- Evaluación sumativa (descripción y relación)
  -- Acción
  men_content text,                       -- Contenidos y estándares MEN
  learning_experiences text,              -- Experiencias de aprendizaje y estrategias de enseñanza
  action_service text,                    -- Acción y servicio (opcional)
  formative_assessment text,              -- Evaluación formativa
  differentiation text,                   -- Diferenciación
  resources text,                         -- Recursos
  -- Reflexión (estilo PEP, D15)
  teacher_reflection text,                -- Reflexión del maestro
  student_reflection text,                -- Reflexión de los estudiantes
  assessment_reflection text,             -- Reflexión sobre la evaluación
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pln_planner_myp_pkey PRIMARY KEY (planner_id),
  CONSTRAINT pln_planner_myp_planner_id_fkey
    FOREIGN KEY (planner_id) REFERENCES pln_planners(planner_id) ON DELETE CASCADE
);
ALTER TABLE pln_planner_myp DISABLE ROW LEVEL SECURITY;
```

> `men_content`, `teacher_reflection`, `student_reflection`, `assessment_reflection` van en la extensión (no se reutilizan las columnas homónimas de `pln_planners`/`pln_units`) por el criterio de D2: cuerpo MYP autocontenido. No hay colisión porque es otra tabla.

### 4.3 `pln_myp_assessment_criteria` — Rejilla de criterios A–D (D4)

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

### 4.4 `pln_myp_concept_strategies` — Catálogo estrategia (D7) + puente multi-select (D7a)

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

CREATE TABLE pln_planner_myp_concept_strategies (
  planner_id uuid NOT NULL,
  strategy_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT pln_planner_myp_cs_pkey PRIMARY KEY (planner_id, strategy_id),
  CONSTRAINT pln_planner_myp_cs_planner_fkey FOREIGN KEY (planner_id) REFERENCES pln_planners(planner_id) ON DELETE CASCADE,
  CONSTRAINT pln_planner_myp_cs_strategy_fkey FOREIGN KEY (strategy_id) REFERENCES pln_myp_concept_strategies(strategy_id)
);
ALTER TABLE pln_planner_myp_concept_strategies DISABLE ROW LEVEL SECURITY;
```

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

- Sin pantalla de administración (gestión SQL).
- **Seed** resuelto por `grade_name` (el `grade_id` difiere DEV/PROD): 6°→2, 7°→3, 8°→4, 9°→5.
- El planeador no almacena el Año PAI; el formulario lo deriva del grado.

### 4.6 Puentes de atributos IB & Tilatá (D8, D8a)

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

La UI combina ambos catálogos en un solo selector y escribe en el puente que corresponda por ítem.

### 4.7 Reutilización directa (sin cambios)

- **`pln_planners`** — núcleo. Identidad trimestral tal cual (D1a). INSERT: `subject_id`, `grade_id`, `trimester` (1/2/3), `academic_year_id`, `teacher_id` (creador), `program_id` (PAI); `level`/`unit_id`/`dp_outline_id` = NULL.
- **`pln_planner_cycles`** — ciclo como contenedor numerado (solo `cycle_id`, `planner_id`, `cycle_number` en el PAI).
- **`pln_planner_sessions`** — `(cycle_id, day_number)` único; `topic`, `session_objective`, `activities`, `resources`. Mapea 1:1 con el cronograma.
- **`pln_planner_atl_skills`** — M:N a `pln_ib_atl_skills` (filtrado `program_scope='PAI'`).
- **`pln_planner_courses`** — cursos del planeador.
- **`pln_comments`** — `entity_type='planner'` y `'planner_cycle'` (ya en el CHECK).

---

## 5. Mapeo campo por campo (formato → almacenamiento)

| Formato base PAI | Almacenamiento | Tipo |
|---|---|---|
| Profesor | `pln_planners.teacher_id` (creador) | FK workers |
| Asignatura | `pln_planners.subject_id` | FK |
| Título de la Unidad | `pln_planner_myp.unit_title` | texto |
| Año PAI (2/3/4/5) | derivado vía `pln_myp_grade_year` (no se almacena) | — |
| Duración de la Unidad (horas) | `pln_planner_myp.duration_hours` | texto |
| **Indagación** | | |
| Concepto(s) especificado(s) con definición | `pln_planner_myp.concepts` | texto libre |
| Estrategia pedagógica para el aprendizaje conceptual | `pln_planner_myp_concept_strategies` → `pln_myp_concept_strategies` | multiselect |
| Contexto global con exploración | `pln_planner_myp.global_context_exploration` | texto libre |
| Perspectivas contextuales: Individual / Local / Global | `perspective_individual` / `perspective_local` / `perspective_global` | texto libre |
| Atributos IB & Tilatá | `pln_planner_learner_profile` + `pln_planner_tilata_attributes` | multiselect |
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
| **Reflexión (estilo PEP)** | | |
| Reflexión del maestro / de los estudiantes / sobre la evaluación | `teacher_reflection` / `student_reflection` / `assessment_reflection` | texto libre |

---

## 6. Pantallas

### 6.1 `my-myp-planners.html` — Listado y creación

- Análoga a `my-units.html`. Lista los planeadores PAI del docente y permite crear.
- Creación: valida asignación académica del docente (asignatura PAI en grado `program_name=like.PAI*`), crea registro en `pln_planners` (identidad trimestral) + fila 1:1 en `pln_planner_myp`.
- Permiso: `Mis planeadores PAI`.

### 6.2 `myp-planner-form.html` — Edición

- Reutiliza `supabaseRequest`, `setQuillHTML` (local), autoguardado (debounced PATCH + flush en blur; M:N como INSERT/DELETE inmediato), polling de concurrencia (15 s sobre `pln_planners.updated_at`, ancla desde la respuesta del PATCH), y creación atómica de ciclos vía función SQL.
- Bloques: Encabezado → Indagación → Acción → Criterios (rejilla A–D) → Cronograma → Reflexión → Comentarios.
- ATL: árbol colapsable solo-hojas idéntico al PEP (`renderAtlTree`), query `program_scope='PAI'`.
- Atributos IB & Tilatá: un `checkbox-grid` que combina ambos catálogos, escribiendo al puente que corresponda.
- Estrategia: multiselect del catálogo de 6 valores.
- **Solo lectura** cuando el control de acceso no habilita edición.

### 6.3 `catalogs.html` — Pestaña ATL PAI (D13)

- Pestaña ATL actual filtrada a `program_scope='PEP'`; corregir su texto (hoy "3 niveles 5/13/21"; real **4 niveles 5/13/52/92**).
- Pestaña **ATL PAI** que filtra `program_scope='PAI'`, mismo árbol/edición (solo texto/orden/estado).
- Gestión del catálogo `pln_myp_concept_strategies` (opcional, como pestaña o sección).

### 6.4 Pantallas de coordinación

`units.html`, `planners.html`, `coordinator-area.html`, `coordinator-program.html`, `coordinator-section.html` ya consultan `pln_planners`. Se agrega branch por programa (`program_name like PAI*`) para abrir `myp-planner-form.html`. Sin rediseño.

---

## 7. Sidebar y permisos (D11)

En `sidebar.js`, `MODULE_ITEM_ORDER.planning` (verificado) hoy:

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

Permisos (SQL en `permissions` + asignación a roles):
- Nuevo permiso `Mis planeadores PAI`, `permission_module='planning'`, `url_path` a `my-myp-planners.html` (verificar convención de ruta del módulo en repo).
- Coordinación reutiliza los permisos existentes.
- Tras cambios: limpiar cache de sidebar (`sessionStorage` key `schoolnet_sidebar_permissions`).

---

## 8. Catálogo ATL del marco MYP (seed)

Del `PAI.pdf`, Apéndice 1, a transcribir con `program_scope='PAI'` y `code` prefijado `myp_...`:

- **Nivel 1 (5 categorías):** Comunicación, Sociales, Autogestión, Investigación, Pensamiento *(mismas 5 que el PEP; por eso van como árbol separado — D9)*.
- **Nivel 2 (10 grupos I–X):** I. Comunicación · II. Colaboración · III. Organización · IV. Afectivas · V. Reflexión · VI. Gestión de la información · VII. Alfabetización mediática · VIII. Pensamiento crítico · IX. Pensamiento creativo · X. Transferencia.
- **Nivel 3 (indicadores = hojas):** viñetas de cada grupo.
- **Excepción de profundidad:** las **Afectivas (IV)** llevan un nivel intermedio (Conciencia plena, Perseverancia, Gestión emocional, Automotivación, Resiliencia); las hojas cuelgan de ahí. `pln_ib_atl_skills` (autorreferenciada, `level` 1–5) lo soporta; "hoja = nodo sin hijos" se deriva en JS.

> El conteo exacto de hojas se fija al transcribir el seed desde el PDF; no se estima aquí.

---

## 9. Control de acceso

El planeador PAI reutiliza el **modelo de acceso del trimestral** ya definido para planeadores (mismos caminos). No se rediseña. **Verificar en `planner-form.html` / `dp-planner-form.html`** los caminos exactos y el helper `validatePageAccessAny` (usado por el form PEP pero **no** presente en `config.js` — es helper de página; replicar/verificar).

---

## 10. Secuencia de implementación (para Sonnet)

Ejecutar en DEV, verificar con `SELECT`, confirmar, replicar en PROD. Un cambio a la vez, con confirmación entre pasos.

1. `ALTER TABLE pln_ib_atl_skills ADD COLUMN program_scope ...` + `UPDATE` a `'PEP'`. Verificar conteo por `program_scope`.
2. Seed marco MYP en `pln_ib_atl_skills` (`program_scope='PAI'`, `code` `myp_...`). Verificar estructura y cero huérfanos.
3. `CREATE TABLE pln_myp_grade_year` + seed por `grade_name`. Verificar.
4. `CREATE TABLE pln_myp_concept_strategies` + seed 6 + `CREATE TABLE pln_planner_myp_concept_strategies`. Verificar.
5. `CREATE TABLE pln_planner_myp` (+ DISABLE RLS + auditoría).
6. `CREATE TABLE pln_myp_assessment_criteria` (+ DISABLE RLS + auditoría).
7. `CREATE TABLE pln_planner_learner_profile` + `pln_planner_tilata_attributes` (+ DISABLE RLS).
8. Permiso `Mis planeadores PAI` + asignación a roles; ajuste de `MODULE_ITEM_ORDER` en `sidebar.js`.
9. `my-myp-planners.html` (listado + creación).
10. `myp-planner-form.html` (cuerpo + ATL + atributos + estrategia + criterios + cronograma + reflexión + comentarios + polling + control de acceso).
11. `catalogs.html`: filtro PEP + pestaña PAI + corrección del texto a 5/13/52/92.
12. Branch por programa en las pantallas de coordinación.
13. Manuales de usuario por pantalla (post-UI).

---

## 11. Glosario

| Término | Definición |
|---|---|
| PAI / MYP | Programa de los Años Intermedios del IB. En Tilatá: Años 2–5 = grados 6°–9°. |
| Planeador PAI | Documento trimestral (3 por año por asignatura-grado). `pln_planners` (chasis) + `pln_planner_myp` (cuerpo). |
| ATL | Enfoques del aprendizaje. `pln_ib_atl_skills`, marco MYP separado por `program_scope='PAI'`. |
| Rejilla de criterios | Matriz A–D × bandas de logro (0, 1–2, 3, 4, 5–6, 7–8). `pln_myp_assessment_criteria`. |
| Año PAI | Derivado del grado (`pln_myp_grade_year`); no se almacena. |

---

## 12. Estado de cierre

**Todas las decisiones están cerradas.** No hay pendientes bloqueantes. El modelo del PAI está completo:

- Identidad trimestral, reutilización directa de `pln_planners` (D1, D1a).
- Cuerpo 1:1 `pln_planner_myp` con reflexión estilo PEP (D2, D15).
- Rejilla A–D propia (D4); conceptos/objetivos/contextos/perspectivas texto libre (D3, D5, D6).
- Estrategia multi-select (D7, D7a); atributos IB & Tilatá multi-select con puentes nuevos (D8, D8a).
- ATL marco MYP separado por `program_scope`, `code` prefijado (D9); mapeo grado→año sin UI (D10).
- Sin bi-anual (D14); menú y archivos propios (D11, D12); pestaña PAI en catálogos (D13).

Siguiente paso: iniciar la secuencia de la sección 10, un cambio a la vez, con confirmación entre pasos.
