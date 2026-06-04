# Módulo de Planeación — Extensión Programa del Diploma (PD)
## Documento de Referencia de Desarrollo

**Sistema:** SchoolNet (Colegio Tilatá)
**Módulo:** `planning` — extensión para el Programa del Diploma (PD)
**Versión:** 1.0
**Fecha:** Junio 2026
**Estado:** Aprobado para inicio de desarrollo
**Complementa a:** `Módulo_de_Planeación_de_Clases — Especificación de Desarrollo v1.0` (mayo 2026). Ese documento es la fuente de verdad del módulo base (PEP). **Este documento describe únicamente el delta de PD** y no reescribe lo ya construido.

---

## 0. Acerca de este documento

### 0.1 Propósito y audiencia

Este documento es la referencia única para implementar la extensión del módulo de planeación al **Programa del Diploma**. La implementación se hará con **Claude (modelo Sonnet)**, por lo que el diseño se deja lo más cerrado y explícito posible: definiciones de tabla a nivel DDL, restricciones, índices, funciones SQL, control de acceso, pantallas y secuencia. Donde haya que decidir algo, ya está decidido aquí; las pocas decisiones diferidas están marcadas explícitamente en la sección 12.

### 0.2 Convenciones obligatorias del proyecto (no negociables)

Quien implemente **debe** respetar estas reglas, ya documentadas en el módulo base:

1. **RLS desactivado.** Toda tabla nueva debe incluir `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;`. Supabase activa RLS por defecto en tablas nuevas y produce 401 silenciosos. Verificar después de crear.
2. **`supabaseRequest(endpoint, { method, body })`** — las opciones van en un objeto, nunca como argumentos posicionales. **Nunca** pasar `headers` explícitos (sobrescriben la API key inyectada y rompen el wrapper; produce 401).
3. **PostgREST no ignora parámetros desconocidos.** No usar cache-busters (`_cb=...`).
4. **Funciones serverless Vercel:** `module.exports` (CommonJS). No aplica a este módulo salvo crons.
5. **`getCurrentDateColombia()`** se define localmente por página; no está global en `config.js`.
6. **UUID en SQL** siempre hexadecimal completo (`1ed1`, no `led1`).
7. **`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`** se aplica en **DEV primero**, se verifica con `SELECT`, se confirma, y luego en PROD.
8. **Edición solo vía GitHub web** y **SQL solo vía Supabase SQL Editor.** No hay terminal local.
9. **Creación de números de secuencia** (cycle_number, day_number, etc.) **debe** ser atómica vía función SQL con `... FOR UPDATE` + `SELECT MAX(...) + 1`, nunca `Math.max()` en cliente.
10. **Auditoría:** las tablas operativas nuevas se suman a `audit_trigger_function()` y reciben sus 3 triggers (INSERT/UPDATE/DELETE). Los catálogos no se auditan.
11. **No gradientes** en UI. Solo colores sólidos.
12. **Idioma:** español neutro (sin voseo).
13. **Quill:** hidratar con `clipboard.dangerouslyPasteHTML()` (`setQuillHTML()`); filtrar `source === 'user'` en `text-change` para no autoguardar durante la hidratación; arquitectura render-once + toggle CSS para tarjetas colapsables.

### 0.3 Entornos

- **DEV:** `spjzvpcsgbewxupjvmfm` / `sistema-next.vercel.app`
- **PROD:** `mrtuerkncqodhakuwjob` / `schoolnet.colegiotilata.edu.co`
- Flujo: SQL en DEV → `SELECT` de verificación → confirmar → PROD. Código: editor web GitHub → commit a `developmen` → Preview Vercel → PR a `main` → Producción.

---

## 1. Resumen ejecutivo y alcance

PD usa **dos planeadores encadenados**, más una bitácora de sesiones y una capa de componentes de evaluación:

1. **Planeador bi-anual (Esquema del curso)** — documento **vivo por asignatura + nivel**, abarca los dos años del programa (10° y 11°). Es lo primero que se diligencia. De él cuelgan los trimestrales.
2. **Planeador trimestral** — uno por (asignatura + nivel + grado + trimestre + año). Cuelga del bi-anual. **Mismo formato que PAI** (salvo las siglas SL/HL, que son exclusivas de PD).
3. **Cronograma sesión por sesión** dentro de cada trimestral, organizado en ciclos (contenedores de hasta 6 días, una semana de la rotación D1–D6).
4. **Componentes de evaluación sumativa con peso**, creados por el docente dentro de cada trimestral.

**Alcance de esta fase:** solo **PD**. PAI queda fuera, pero como comparte el formato trimestral, la infraestructura del trimestral PD se diseña para servir a PAI sin rediseño (ver 12.1).

**Fuera de alcance (ver sección 12):** la función de *compartir planeadores con familias* (solo se deja el parámetro listo), el levantamiento de PAI, y la integración con el Alcance y Secuencia.

### 1.1 Lo que NO se articula

PD **no** se articula con PEP. Los únicos elementos transversales entre programas son el **perfil de la comunidad de aprendizaje IB** (`pln_ib_learner_profile`) y los **atributos Tilatá** (`pln_tilata_attributes`). El `unit_id` de `pln_planners` (que en PEP apunta a una Unidad de Indagación) **no se usa en PD**; PD usa un FK propio al bi-anual (`dp_outline_id`).

---

## 2. Registro de decisiones de diseño

Estas decisiones se tomaron con la coordinación del Programa del Diploma y con Desarrollos. Se documentan con su justificación porque condicionan todo el modelo.

| # | Decisión | Justificación |
|---|---|---|
| D1 | **Reutilizar el núcleo `pln_planners`** para el trimestral PD (no crear un island `pln_dp_*` para el trimestral). | PAI comparte el formato; se reutiliza comentarios, auditoría, polling, ATL, control de acceso y las 4 pantallas de coordinación que ya consultan `pln_planners`. La no-articulación con PEP es pedagógica (el vínculo va al bi-anual, no a una UI), no de infraestructura. |
| D2 | **Cuerpo PD en extensión 1:1 `pln_planner_dp`**, no como columnas nullable en `pln_planners`. | Evita columnas de significado condicional en la tabla compartida. |
| D3 | **Identidad del trimestral = (asignatura + nivel + grado + trimestre + año).** Se agrega `level` al UNIQUE. | Los estudiantes se separan por nivel en sesiones distintas (NS y NM en grupos separados), por lo que el nivel parte el planeador. No es diferenciación dentro de un mismo registro. |
| D4 | **Bi-anual = documento vivo identificado por (asignatura + nivel).** Entidad nueva `pln_dp_outlines`. No es por cohorte. | Lo definió la coordinación: el esquema del curso es un documento vivo que se actualiza año a año (ej. "Actualizada Enero 2026") y que las cohortes comparten. |
| D5 | **El bi-anual es padre de todos los trimestrales** de esa asignatura+nivel a lo largo del tiempo (no solo de 6). | Los "6 por bienio" son una rebanada filtrada por año + grado. La vista por promoción es un reporte, no un insumo. |
| D6 | **Cronograma por sesión:** tabla hija nueva `pln_planner_sessions` bajo los ciclos. En PD el ciclo es solo un contenedor numerado; los campos pedagógicos de `pln_planner_cycles` no se usan en PD. | El formato registra cada día (sesión) con Tema/Objetivo/Actividades/Recursos; la profundidad pedagógica del trimestre vive en el cuerpo, no en el ciclo. |
| D7 | **Evaluación del trimestral = descriptiva (formativa/sumativa) en el cuerpo + componentes con peso.** PD **no usa** la rúbrica de niveles 2–5 (`pln_planner_assessment_criteria`); no hay tabla de rúbrica equivalente. Las bandas 1–7 son la escala institucional de calificación y no se modelan como rúbrica aquí. | El formato trimestral trae evaluación formativa/sumativa descriptiva, no una tabla de niveles. |
| D8 | **Componentes sumativos con peso creados por el docente** en `pln_planner_dp_components`. Coordinación de área y dirección de programa **ven y editan** (mismo modelo de acceso del módulo). Sin catálogo central ni capa parametrizada por cohorte. | Lo definió la coordinación: la creación está a cargo de los profesores; las coordinaciones ven y editan sobre lo que el profesor crea. |
| D9 | **Reflexión de PD = 3 campos** (funcionó / no funcionó / notas), distintos de las reflexiones before/during/after del PEP. | Estructura propia del documento de Reflexión de PD. |
| D10 | **Visibilidad de la reflexión para familias = flag por programa**, booleano en `programs`, default apagado, gobernado por el coordinador de programa. La función de compartir-con-familias no se construye ahora; el flag queda listo. | Es la postura del coordinador de programa actual, parametrizable con un clic para poder cambiarla mañana sin tocar código. |
| D11 | **Esquema del curso = tabla hija estructurada** `pln_dp_outline_topics` (6 celdas: Año 1/2 × Trimestre I-III), no texto libre. | Es el puente con los trimestrales y la vista de conjunto que coordinación consultará como dato. *(Recomendación de Desarrollos adoptada; revisable si coordinación prefiere texto.)* |
| D12 | **Año del programa derivado del grado:** Año 1 = 10°, Año 2 = 11°. No se almacena en el trimestral. | Regla institucional confirmada. El bi-anual abarca ambos años; cada trimestral conserva su `grade_id` + `academic_year_id`. |
| D13 | **Formularios PD en archivos propios** (`dp-outline-form.html`, `dp-planner-form.html`, etc.), reutilizando helpers JS, control de acceso, comentarios y polling, pero sin sobrecargar `planner-form.html` (que es PEP) con condicionales. | Menos riesgo de error para Sonnet que ramificar un formulario PEP grande. |

---

## 3. Modelo conceptual PD

### 3.1 Las tres capas

```
┌───────────────────────────────────────────────────────────────┐
│ PLANEADOR BI-ANUAL (pln_dp_outlines)                          │
│ Documento vivo · identificado por (asignatura + nivel)        │
│ Esquema del curso = 6 celdas (Año1/Año2 × Trimestre I-III)    │
│   ↓ cada celda corresponde a un trimestral por grado+trimestre│
└───────────────────────────────────────────────────────────────┘
        │ dp_outline_id (FK opcional desde el trimestral)
        ▼
┌───────────────────────────────────────────────────────────────┐
│ PLANEADOR TRIMESTRAL (pln_planners + pln_planner_dp)          │
│ Uno por (asignatura + nivel + grado + trimestre + año)        │
│ Cuerpo PD: indagación, acción, TOK, CAS, evaluación, reflexión│
│ Componentes sumativos con peso (pln_planner_dp_components)     │
│   ↓ cronograma                                                │
│   ┌─────────────────────────────────────────────────────┐    │
│   │ CICLO (pln_planner_cycles, solo contenedor numerado) │    │
│   │   Día 1 (sesión)  ─ Tema/Objetivo/Actividades/Recursos│   │
│   │   Día 2 (sesión)  ─ ...        (pln_planner_sessions)│    │
│   │   ... hasta 6 días (rotación D1–D6)                  │    │
│   └─────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 Lógica de cohorte, año y grado

- **Año 1 = 10°, Año 2 = 11°.** Una cohorte avanza: la que está en 10° en el año académico N es la misma que estará en 11° en N+1.
- En cualquier año académico conviven **dos cohortes activas** de PD (una en su Año 1 / 10°, otra en su Año 2 / 11°), pertenecientes a bienios distintos.
- El **bi-anual no se ata a un año ni a un grado**: abarca dos años académicos consecutivos y dos grados. Agrupa todos los trimestrales de su (asignatura + nivel) a lo largo del tiempo.
- El **trimestral** sí conserva su `grade_id` (10° u 11°) y su `academic_year_id`. El **año del programa (1 o 2) se deriva del grado**, no se almacena.
- La **vista por promoción** (estilo "Prom 2027": 6 trimestrales = 3 de 10° del año N + 3 de 11° del año N+1) es un **reporte** que se obtiene filtrando, no una entidad ni un insumo a diligenciar.

### 3.3 SL/HL

Los estudiantes se separan por nivel en sesiones distintas, por lo que el **nivel es discriminador de identidad**, tanto en el bi-anual (un bi-anual por asignatura+nivel) como en el trimestral (un trimestral por asignatura+nivel+grado+trimestre+año). No existe el caso de un planeador único con columnas SL y HL: cada nivel tiene su propio registro. Las columnas "SL:/HL:" de la plantilla del IB son un artefacto de la plantilla, no del modelo. Para PAI y PEP, `level` es `NULL`.

### 3.4 Mapa reutilización vs. nuevo

| Pieza | Reutiliza lo existente | Nuevo para PD |
|---|---|---|
| Núcleo del trimestral | `pln_planners` (+ 2 columnas, + UNIQUE) | — |
| Cuerpo del trimestral | — | `pln_planner_dp` (1:1) |
| Cronograma | `pln_planner_cycles` (como contenedor) | `pln_planner_sessions` (hija de ciclo) |
| Componentes de evaluación | — | `pln_planner_dp_components` |
| Bi-anual | — | `pln_dp_outlines` + `pln_dp_outline_topics` |
| ATL | `pln_ib_atl_skills`, `pln_planner_atl_skills` | — |
| Perfil IB, atributos Tilatá | `pln_ib_learner_profile`, `pln_tilata_attributes` | — |
| Comentarios | `pln_comments` (+ entity_type `dp_outline`) | — |
| Auditoría, polling, control de acceso | Infraestructura existente | triggers para tablas nuevas |
| Listados de coordinación | `units.html`, `planners.html`, `coordinator-area.html`, `coordinator-program.html` | branch por programa para abrir el form correcto |
| Cursos del trimestral | `pln_planner_courses` | — |
| Rúbrica de niveles 2–5 | **No aplica a PD** (`pln_planner_assessment_criteria` queda solo para PEP/PAI) | — |
| Vínculo a UI (`unit_id`) | **No aplica a PD** | — |

---

## 4. Modelo de datos

Todas las definiciones siguen las convenciones del módulo: PK `uuid` con `gen_random_uuid()`, `created_at`/`updated_at` `timestamptz default now()`, `status` con `CHECK`. **Cada tabla nueva incluye `DISABLE ROW LEVEL SECURITY` y se registra en auditoría** (salvo indicación contraria).

### 4.1 Alteraciones a tablas existentes

#### `pln_planners` — agregar 2 columnas y cambiar el UNIQUE

```sql
ALTER TABLE pln_planners
  ADD COLUMN level varchar NULL CHECK (level IN ('SL','HL')),
  ADD COLUMN dp_outline_id uuid NULL REFERENCES pln_dp_outlines(outline_id);
```

- `level`: `'SL'`/`'HL'` para PD; `NULL` para PEP/PAI.
- `dp_outline_id`: FK al bi-anual; `NULL` para PEP/PAI. (Se agrega **después** de crear `pln_dp_outlines`; ver orden en sección 11.)

**Cambio de UNIQUE.** El UNIQUE actual `(subject_id, grade_id, trimester, academic_year_id)` debe incluir el nivel sin romper PEP/PAI (donde `level` es `NULL` y los NULL son distintos entre sí en un UNIQUE estándar). Solución: índice único con `COALESCE`.

```sql
-- Eliminar el UNIQUE/constraint actual (verificar el nombre real en DEV con \d pln_planners)
ALTER TABLE pln_planners DROP CONSTRAINT IF EXISTS pln_planners_subject_id_grade_id_trimester_academic_year_id_key;

-- Índice único que preserva la unicidad de PEP/PAI (level NULL → '') y agrega el nivel para PD
CREATE UNIQUE INDEX uq_pln_planners_identity
  ON pln_planners (subject_id, grade_id, trimester, academic_year_id, COALESCE(level, ''));
```

> Verificar en DEV el nombre exacto del constraint actual antes del `DROP`. Recordar la decisión histórica del módulo: el UNIQUE ya había pasado al modelo "planeador-por-grado" sin `teacher_id`. Aquí solo se le suma `level`.

#### `programs` — flag de visibilidad de reflexión para familias

```sql
ALTER TABLE programs
  ADD COLUMN share_reflection_with_families boolean NOT NULL DEFAULT false;
```

- Gobernado por el coordinador de programa, conmutable con un clic desde una pantalla de configuración de programa.
- Default `false` (postura actual del coordinador PD). La función de compartir-con-familias **no** se construye en esta fase; este flag queda para que esa función lo respete cuando exista.

#### `pln_comments` — admitir comentarios sobre el bi-anual

```sql
ALTER TABLE pln_comments DROP CONSTRAINT IF EXISTS pln_comments_entity_type_check;
ALTER TABLE pln_comments
  ADD CONSTRAINT pln_comments_entity_type_check
  CHECK (entity_type IN ('unit','unit_cycle','planner','planner_cycle','dp_outline'));
```

- El trimestral PD usa `entity_type='planner'` y sus ciclos `entity_type='planner_cycle'` (sin cambios, ya existe).
- El bi-anual usa el nuevo `entity_type='dp_outline'`.
- Las **sesiones no llevan comentarios** (no aparece en el formato; la conversación pedagógica vive a nivel de planeador y ciclo).

### 4.2 `pln_dp_outlines` — Planeador bi-anual (Esquema del curso)

Documento vivo por (asignatura + nivel). **No tiene `academic_year_id`** (no es por año) y por lo tanto **nunca se congela** (frozen no aplica): es siempre editable.

```sql
CREATE TABLE pln_dp_outlines (
  outline_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id          uuid NOT NULL REFERENCES academic_subjects(subject_id),
  level               varchar NOT NULL CHECK (level IN ('SL','HL')),
  program_id          uuid REFERENCES programs(program_id),  -- PD; se almacena para filtrado
  -- Identificación (cabecera del esquema IB)
  completed_by_worker_id  uuid REFERENCES workers(worker_id),  -- profesor que completó el esquema
  school_code         varchar,
  ib_training_date    varchar,   -- texto libre: el formato lo trae como rango ("June 5–July 3, 2024")
  workshop_name       varchar,   -- nombre y categoría del taller
  completion_date     date,
  -- Secciones narrativas (Quill HTML en columnas text)
  chosen_works        text,   -- "Obras elegidas" (propio de Literatura; opcional para otras asignaturas)
  internal_external_assessment text,  -- Requisitos de evaluación interna y externa del IB
  tok_links           text,   -- Vínculos con Teoría del Conocimiento (TdC/TOK)
  atl_approaches      text,   -- Enfoques del aprendizaje (ejemplo narrativo)
  international_mindedness text, -- Mentalidad internacional
  learner_profile_development text, -- Desarrollo del perfil de la comunidad de aprendizaje IB
  resources           text,   -- Recursos del curso
  outline_status      varchar NOT NULL DEFAULT 'active' CHECK (outline_status IN ('active','archived','deleted')),
  created_by          uuid REFERENCES workers(worker_id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pln_dp_outlines DISABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX uq_pln_dp_outlines_subject_level
  ON pln_dp_outlines (subject_id, level)
  WHERE outline_status <> 'deleted';
```

> El UNIQUE parcial (`WHERE outline_status <> 'deleted'`) permite "recrear" un bi-anual tras un soft-delete sin colisión. Si se prefiere unicidad estricta, quitar el `WHERE`.

> **Perfil IB y ATL como multiselect a nivel de bi-anual:** se modelan como **texto narrativo** (`learner_profile_development`, `atl_approaches`), siguiendo la plantilla del IB que los pide como ejemplos ilustrativos. Los multiselect operativos (ATL) viven en el trimestral. Si más adelante coordinación quiere estructurarlos, se promueven a tablas M:N sin romper el modelo.

### 4.3 `pln_dp_outline_topics` — Esquema del curso (6 celdas)

Las celdas del esquema: Año 1/Año 2 × Trimestre I-III. Puente con los trimestrales: un trimestral de (grado→año, trimestre) corresponde a la celda con el mismo (program_year, trimester).

```sql
CREATE TABLE pln_dp_outline_topics (
  topic_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outline_id          uuid NOT NULL REFERENCES pln_dp_outlines(outline_id) ON DELETE CASCADE,
  program_year        integer NOT NULL CHECK (program_year IN (1,2)),  -- 1 = 10°, 2 = 11°
  trimester           integer NOT NULL CHECK (trimester IN (1,2,3)),
  theme               text,  -- Tema / Área de exploración / preguntas de indagación
  contents            text,  -- Contenidos
  assigned_time       text,  -- Tiempo asignado (ej. "12 clases")
  assessment_instruments text, -- Instrumentos de evaluación (ej. "P1, Oral individual")
  resources           text,  -- Recursos de la celda
  sort_order          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_pln_dp_outline_topics UNIQUE (outline_id, program_year, trimester)
);
ALTER TABLE pln_dp_outline_topics DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pln_dp_outline_topics_outline ON pln_dp_outline_topics (outline_id);
```

> Las 6 celdas se pueden precrear al crear el bi-anual (loop 1..2 × 1..3) o crearse a demanda. El UNIQUE garantiza una sola celda por (año, trimestre).

### 4.4 `pln_planner_dp` — Cuerpo del trimestral PD (1:1)

Extensión 1:1 de `pln_planners` con los campos propios del formato PD. La PK **es** el `planner_id` (relación 1:1).

```sql
CREATE TABLE pln_planner_dp (
  planner_id          uuid PRIMARY KEY REFERENCES pln_planners(planner_id) ON DELETE CASCADE,
  unit_title          varchar,  -- "Unidad" (título de la unidad del trimestre)
  assigned_hours      varchar,  -- "Fechas / Horas" del nivel de este planeador
  -- INDAGACIÓN: establecer el propósito
  unit_description    text,  -- Descripción de la Unidad & Conceptos
  transfer_objectives text,  -- Objetivos de transferencia
  -- ACCIÓN: contenido/habilidades/conceptos + entendimientos esenciales
  essential_understandings text, -- Entendimientos esenciales
  content             text,  -- Contenido
  skills              text,  -- Habilidades
  concepts            text,  -- Conceptos (con definiciones)
  -- ACCIÓN: proceso de aprendizaje
  learning_process    text,  -- Descripción del proceso de aprendizaje
  formative_assessment text, -- Evaluación formativa (del nivel de este planeador)
  summative_assessment text, -- Evaluación sumativa (descriptiva)
  differentiation     text,  -- Diferenciación
  -- Conexiones
  language_and_learning text, -- Lenguaje y Aprendizaje
  tok_connections     text,  -- Conexiones con TOK
  cas_connections     text,  -- Conexiones con CAS
  -- Reflexión (3 campos; bloque NO compartido con familias por defecto, ver programs.share_reflection_with_families)
  reflection_worked     text, -- ¿Qué funcionó bien?
  reflection_not_worked text, -- ¿Qué no funcionó?
  reflection_notes      text, -- Notas / Cambios / Sugerencias
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pln_planner_dp DISABLE ROW LEVEL SECURITY;
```

> **ATL del trimestral PD:** se reutiliza `pln_planner_atl_skills` (M:N a `pln_ib_atl_skills`) y el campo narrativo `pln_planners.atl_description`. No se duplica.
> **Recursos del trimestral:** se reutiliza `pln_planners.resources`.
> **`level` y `dp_outline_id`** viven en `pln_planners`, no aquí (son identidad / vínculo, no cuerpo).

### 4.5 `pln_planner_sessions` — Cronograma sesión por sesión

Cada fila es un día/sesión dentro de un ciclo. El ciclo (`pln_planner_cycles`) actúa como contenedor numerado; en PD no se llenan sus campos pedagógicos.

```sql
CREATE TABLE pln_planner_sessions (
  session_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id            uuid NOT NULL REFERENCES pln_planner_cycles(cycle_id) ON DELETE CASCADE,
  day_number          integer NOT NULL,  -- 1..6 (rotación D1–D6); el orden de la sesión dentro del ciclo
  topic               text,  -- Tema
  session_objective   text,  -- Objetivo de la sesión
  activities          text,  -- Actividades
  resources           text,  -- Recursos (enlaces cuando sea necesario)
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_pln_planner_sessions UNIQUE (cycle_id, day_number)
);
ALTER TABLE pln_planner_sessions DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pln_planner_sessions_cycle ON pln_planner_sessions (cycle_id);
```

> No se impone un máximo duro de 6 en BD (un ciclo podría tener menos). El front sugiere hasta 6. La creación de `day_number` es atómica (ver 4.9).

### 4.6 `pln_planner_dp_components` — Componentes sumativos con peso

Creados por el docente; coordinaciones ven/editan vía el control de acceso del trimestral.

```sql
CREATE TABLE pln_planner_dp_components (
  component_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id          uuid NOT NULL REFERENCES pln_planners(planner_id) ON DELETE CASCADE,
  name                varchar NOT NULL,  -- ej. "Carpeta del Alumno", "P1", "Ensayo NS"
  weight              numeric(5,2),      -- porcentaje 0–100 (sin forzar suma = 100 en BD)
  sort_order          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pln_planner_dp_components DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pln_planner_dp_components_planner ON pln_planner_dp_components (planner_id);
```

> La validación de que los pesos sumen 100 % se hace en el front (advertencia, no bloqueo), porque el docente puede estar a mitad de captura. No es constraint de BD.

### 4.7 Índices recomendados (resumen)

```sql
CREATE INDEX idx_pln_planners_dp_outline ON pln_planners (dp_outline_id);
CREATE INDEX idx_pln_planners_level      ON pln_planners (level);
-- + los índices ya incluidos arriba por tabla nueva
-- + uq_pln_planners_identity (índice único con COALESCE) de la sección 4.1
```

### 4.8 RLS y auditoría

- **RLS:** confirmar `DISABLE ROW LEVEL SECURITY` en las 5 tablas nuevas tras crearlas (Supabase reactiva por defecto).
- **Auditoría:** agregar a `audit_trigger_function()` el mapeo de `row_id` para las 5 tablas nuevas y crear sus 3 triggers (INSERT/UPDATE/DELETE) cada una, replicando el patrón de las tablas `pln_*` existentes (20 triggers ya activos). `pln_dp_outline_topics`, `pln_planner_sessions` y `pln_planner_dp_components` son hijas de alto flujo de edición → **sí** se auditan. (Los catálogos `pln_*` siguen sin auditoría; aquí no se crean catálogos nuevos.)

### 4.9 Funciones SQL atómicas

Replicar el patrón ya usado (`pln_create_planner_cycle`, `pln_create_unit_cycle`): `PERFORM 1 ... FOR UPDATE` sobre el padre + `SELECT COALESCE(MAX(...),0)+1` + `INSERT ... RETURNING *`. **Separar el lock de la agregación** (un `FOR UPDATE` no se permite junto a funciones de agregación en el mismo SELECT — bug ya documentado en el módulo).

- `pln_create_planner_session(p_cycle_id uuid)` → bloquea el ciclo, calcula `MAX(day_number)+1`, inserta y retorna la fila. **Requerida**: la creación de sesiones es concurrente en codocencia.
- Ciclos del trimestral PD: **reutilizar** `pln_create_planner_cycle(p_planner_id uuid)` (ya existe).
- `pln_planner_dp_components.sort_order`: se puede asignar en cliente (baja concurrencia); si se quiere atomicidad, crear `pln_create_planner_dp_component(p_planner_id uuid)` siguiendo el mismo patrón. **Opcional.**
- `pln_dp_outline_topics`: las 6 celdas se precrean en un loop al crear el bi-anual; el UNIQUE evita duplicados. No requiere función atómica.

---

## 5. Control de acceso

### 5.1 Trimestral PD

El trimestral PD es una fila de `pln_planners`, así que **reutiliza el control de acceso ya construido** sin cambios estructurales:

- Validación de página con `validatePageAccessAny([...])` (helper existente en `config.js`) sobre los permisos de planeador y de coordinación.
- `canEdit()` interno decide editar/solo-lectura con los caminos ya definidos del módulo: creador, colaboradores, docentes del grado, coordinador de área, director de programa, director de sección.
- Frozen aplica igual que en PEP: si el `academic_year` está cerrado, el trimestral pasa a solo lectura (regla derivada del estado del año, no campo propio).

### 5.2 Bi-anual

`pln_dp_outlines` es entidad nueva → define sus propios caminos de acceso. Como es un documento vivo por asignatura+nivel, **no** se ata a grado ni año. Caminos de edición (al menos uno autoriza, vía `validatePageAccessAny`):

1. **Docente de la asignatura:** existe en `academic_assignments` una asignación del usuario a esa `subject_id` (en cualquier grado de Escuela Alta). Une `workers` por email (`workers.email = users.user_mail`; recordar que `workers` no tiene `user_id`).
2. **Coordinador del área** de la asignatura: `academic_areas.coordinator_worker_id` del área a la que pertenece la asignatura.
3. **Director de programa (PD):** `programs.program_director_email = workers.email` (vinculación por email institucional, decisión deliberada del módulo).
4. **Director de sección (Escuela Alta):** `sections.director_email = workers.email`.

Lectura: los mismos, más las pantallas de coordinación. **Frozen no aplica** al bi-anual (no tiene año académico; es siempre editable salvo soft-delete).

---

## 6. Permisos a crear (tabla `permissions`, `permission_module = 'planning'`)

Reutilizar el patrón de slug en inglés del resto del módulo. Permisos nuevos para las pantallas del bi-anual y del trimestral PD:

| `permission_name` | Descripción | `url_path` |
|---|---|---|
| `Crear planeador bianual PD` | Crear un esquema bi-anual | `/modules/planning/my-dp-outlines.html` |
| `Gestionar planeadores bianuales PD` | Listado de bi-anuales para coordinación | `/modules/planning/dp-outlines.html` |
| `Crear planeador trimestral PD` | Crear un trimestral PD | `/modules/planning/my-dp-planners.html` |

> **Notas de asignación (operativo, PROD, depende de terceros):**
> - Los permisos funcionales (no navegación) deben tener `url_path = NULL` para evitar duplicación en el sidebar.
> - Tras cambios de permisos, limpiar `sessionStorage.removeItem('schoolnet_sidebar_permissions')`.
> - El sidebar lee `url_path` desde la BD; las correcciones de URL van en BD, no en `sidebar.js`. Ítems sin `url_path` se descartan silenciosamente.
> - Registrar los nuevos ítems en `MODULE_ITEM_ORDER` (si no, aparecen al final/alfabéticos). Los nombres en `MODULE_ITEM_ORDER` deben coincidir **exactamente** con los `permission_name`.
> - El trimestral PD reutiliza los listados de coordinación existentes; ahí no se crean permisos nuevos, pero el listado debe **ramificar por programa** para abrir el formulario correcto (ver sección 8).

---

## 7. Pantallas y rutas

Archivos PD nuevos (decisión D13: archivos propios, reutilizando helpers JS, comentarios, polling y control de acceso del módulo; **sin** sobrecargar `planner-form.html`).

| Archivo | Rol | Notas |
|---|---|---|
| `my-dp-outlines.html` | Listado + creación de bi-anuales del docente | Selector de nivel; "Nuevo bi-anual". La creación vive aquí (patrón `my-units.html`/`my-planners.html`); el form es solo edición. |
| `dp-outline-form.html` | Edición del bi-anual | Cabecera + 6 celdas del esquema (`pln_dp_outline_topics`) + secciones narrativas Quill + comentarios (`entity_type='dp_outline'`). Sin polling de año (documento vivo); sí polling de concurrencia sobre `pln_dp_outlines.updated_at`. |
| `my-dp-planners.html` | Listado + creación de trimestrales PD del docente | Selector de año + nivel; "Nuevo trimestral". Al crear, vincula opcionalmente al bi-anual de su asignatura+nivel. |
| `dp-planner-form.html` | Edición del trimestral PD | Cuerpo PD (`pln_planner_dp`) + componentes (`pln_planner_dp_components`) + cronograma (ciclos → `pln_planner_sessions`) + reflexión (3 campos) + comentarios (`entity_type='planner'` y `'planner_cycle'`). Reutiliza helpers `patchPlanner`, `debouncedPatch`, `flushDebounced`, `setQuillHTML`, polling de concurrencia y `pln_create_planner_cycle`. |
| Config de programa | Toggle `share_reflection_with_families` | Puede ser una pantalla existente de administración de programas o un control en la vista de coordinación de programa. Un clic. |

**Ramificación en listados de coordinación.** `units.html`, `planners.html`, `coordinator-area.html`, `coordinator-program.html` ya consultan `pln_planners`/UIs. Para PD:
- Los trimestrales PD aparecen en los listados de planeadores (son `pln_planners`). Al hacer clic, **branch por `program_id`/`level`**: si es PD → abrir `dp-planner-form.html`; si no → `planner-form.html`.
- Agregar (opcional, fase posterior) un listado/tab de bi-anuales en coordinación, o usar `dp-outlines.html`.

**Autoguardado y concurrencia:** mismo patrón del módulo. PATCH debounced + flush en blur para texto; inmediato para selects/fechas; M:N (ATL, componentes) como INSERT/DELETE inmediato. Polling cada 15 s sobre el `updated_at` del padre (`pln_planners` o `pln_dp_outlines`), deshabilitado en solo lectura. El polling vigila solo la tabla padre, no las hijas (criterio del módulo).

---

## 8. Mapeo campo a campo: formato IB → modelo

### 8.1 Planeador trimestral PD (formato "DP — Año X — Asignatura — Trimestre")

| Campo del formato | Destino |
|---|---|
| Profesor | `pln_planners.teacher_id` (creador histórico) + colaboradores |
| Grupo y Asignatura | `pln_planners.subject_id` (+ `pln_planner_courses`) |
| Unidad | `pln_planner_dp.unit_title` |
| SL O HL | `pln_planners.level` |
| Año 1 o 2 | **Derivado** de `pln_planners.grade_id` (10°=1, 11°=2) |
| Fechas / Horas (SL:/HL:) | `pln_planner_dp.assigned_hours` (del nivel de este planeador) + trimestre/año |
| Descripción de la Unidad & Conceptos | `pln_planner_dp.unit_description` |
| INDAGACIÓN — Objetivos de transferencia | `pln_planner_dp.transfer_objectives` |
| ACCIÓN — Entendimientos esenciales | `pln_planner_dp.essential_understandings` |
| ACCIÓN — Contenido | `pln_planner_dp.content` |
| ACCIÓN — Habilidades | `pln_planner_dp.skills` |
| ACCIÓN — Conceptos (con definiciones) | `pln_planner_dp.concepts` |
| Proceso de aprendizaje — Descripción | `pln_planner_dp.learning_process` |
| Evaluación formativa | `pln_planner_dp.formative_assessment` |
| Evaluación sumativa | `pln_planner_dp.summative_assessment` (descriptiva) + `pln_planner_dp_components` (componentes con peso) |
| Diferenciación | `pln_planner_dp.differentiation` |
| Enfoques de aprendizaje (ATL) | `pln_planner_atl_skills` (M:N) + `pln_planners.atl_description` |
| Lenguaje y Aprendizaje | `pln_planner_dp.language_and_learning` |
| Conexiones con TOK | `pln_planner_dp.tok_connections` |
| Conexiones con CAS | `pln_planner_dp.cas_connections` |
| Recursos | `pln_planners.resources` |
| Cronograma → Ciclo | `pln_planner_cycles` (contenedor) |
| Cronograma → Día | `pln_planner_sessions.day_number` |
| Cronograma → Tema | `pln_planner_sessions.topic` |
| Cronograma → Objetivo de la sesión | `pln_planner_sessions.session_objective` |
| Cronograma → Actividades | `pln_planner_sessions.activities` |
| Cronograma → Recursos | `pln_planner_sessions.resources` |
| Reflexión — ¿Qué funcionó bien? | `pln_planner_dp.reflection_worked` |
| Reflexión — ¿Qué no funcionó? | `pln_planner_dp.reflection_not_worked` |
| Reflexión — Notas / Cambios / Sugerencias | `pln_planner_dp.reflection_notes` |

### 8.2 Planeador bi-anual (formato "Esquema de asignaturas del PD")

| Campo del formato | Destino |
|---|---|
| Nombre de la asignatura PD | `pln_dp_outlines.subject_id` |
| Nivel (Superior/Medio) | `pln_dp_outlines.level` |
| Nombre del profesor que completó | `pln_dp_outlines.completed_by_worker_id` |
| Código del colegio | `pln_dp_outlines.school_code` |
| Fecha de capacitación del IB | `pln_dp_outlines.ib_training_date` |
| Nombre del taller | `pln_dp_outlines.workshop_name` |
| Fecha en que se completó | `pln_dp_outlines.completion_date` |
| Obras elegidas | `pln_dp_outlines.chosen_works` |
| Esquema del curso (cada celda Año/Trimestre) | `pln_dp_outline_topics` (theme, contents, assigned_time, assessment_instruments, resources) |
| Requisitos de evaluación interna y externa | `pln_dp_outlines.internal_external_assessment` |
| Vínculos con TdC | `pln_dp_outlines.tok_links` |
| Enfoques del aprendizaje | `pln_dp_outlines.atl_approaches` |
| Mentalidad internacional | `pln_dp_outlines.international_mindedness` |
| Perfil de la comunidad de aprendizaje IB | `pln_dp_outlines.learner_profile_development` |
| Recursos | `pln_dp_outlines.resources` |

---

## 9. Reglas de negocio PD

1. **Año del programa = grado.** 10° → Año 1; 11° → Año 2. No se almacena; se deriva del `grade_id` del trimestral.
2. **Bi-anual vivo, nunca frozen.** No tiene `academic_year_id`; siempre editable (salvo soft-delete). Lo comparten todas las cohortes de su asignatura+nivel.
3. **Trimestral frozen por año cerrado.** Igual que PEP: solo lectura si su `academic_year` está cerrado.
4. **Un trimestral por (asignatura + nivel + grado + trimestre + año).** Garantizado por `uq_pln_planners_identity`.
5. **Vínculo trimestral → bi-anual** vía `dp_outline_id`. Al crear un trimestral PD, sugerir/asignar el bi-anual de su asignatura+nivel (puede quedar `NULL` si aún no existe el bi-anual).
6. **Celda del esquema ↔ trimestral:** correspondencia por (program_year derivado del grado, trimester). Es informativa/navegacional, no un FK rígido.
7. **Componentes de evaluación:** creados por el docente; pesos sugeridos a sumar 100 % (advertencia en front, no constraint). Coordinaciones editan.
8. **Reflexión:** bloque de 3 campos; su visibilidad para familias depende de `programs.share_reflection_with_families` (default false). La función de compartir no existe aún; el flag queda listo.
9. **SL/HL:** discriminador de identidad en bi-anual y trimestral. Para PAI/PEP, `level = NULL`.

---

## 10. Secuencia de implementación

Orden recomendado, **DEV primero → verificar → confirmar → PROD** en cada bloque.

**Bloque 1 — SQL de esquema (en este orden por dependencias de FK):**
1. `CREATE TABLE pln_dp_outlines` (+ DISABLE RLS + UNIQUE parcial).
2. `CREATE TABLE pln_dp_outline_topics` (+ DISABLE RLS + índices).
3. `ALTER TABLE pln_planners` ADD `level`, `dp_outline_id` (este último referencia ya creada).
4. Reemplazo del UNIQUE de `pln_planners` por `uq_pln_planners_identity` (verificar nombre del constraint actual antes del DROP).
5. `CREATE TABLE pln_planner_dp` (+ DISABLE RLS).
6. `CREATE TABLE pln_planner_sessions` (+ DISABLE RLS + índices).
7. `CREATE TABLE pln_planner_dp_components` (+ DISABLE RLS + índices).
8. `ALTER TABLE programs` ADD `share_reflection_with_families`.
9. `ALTER` del CHECK de `pln_comments.entity_type` (agregar `'dp_outline'`).
10. Índices de la sección 4.7.
11. Auditoría: actualizar `audit_trigger_function()` + crear 3 triggers por cada tabla nueva (5 tablas → 15 triggers).
12. Función `pln_create_planner_session(uuid)` (+ opcional `pln_create_planner_dp_component`).
13. **Verificación:** `SELECT` de conteo de tablas, prueba de RLS deshabilitado, prueba de los triggers (un INSERT manual y revisión de `audit_log`), prueba del UNIQUE con `COALESCE`.

**Bloque 2 — Permisos y sidebar:**
14. Insertar los 3 permisos nuevos (sección 6).
15. Registrar ítems en `sidebar.js` (`MODULE_ITEM_ORDER`) con `url_path` correctos.
16. Asignación de permisos a roles: **operativo en PROD, depende de terceros** (ver sección 12).

**Bloque 3 — Bi-anual (UI):**
17. `my-dp-outlines.html` (listado + creación, precrea las 6 celdas).
18. `dp-outline-form.html` (cabecera + esquema 6 celdas + secciones Quill + comentarios + polling).

**Bloque 4 — Trimestral PD (UI):**
19. `my-dp-planners.html` (listado + creación, vínculo a bi-anual).
20. `dp-planner-form.html` por sub-bloques (replicar el orden probado en `planner-form.html`):
    - 20.1 Control de acceso (4 caminos) + cuerpo PD (`pln_planner_dp`) con autosave.
    - 20.2 Componentes de evaluación (`pln_planner_dp_components`).
    - 20.3 ATL multiselect + reflexión (3 campos).
    - 20.4 Cronograma: ciclos (reusar `pln_create_planner_cycle`) → sesiones (`pln_create_planner_session`), con polling.
    - 20.5 Comentarios (planeador + ciclo).

**Bloque 5 — Integración con coordinación:**
21. Branch por programa en los listados (`planners.html`, `coordinator-*`) para abrir `dp-planner-form.html`.
22. Toggle `share_reflection_with_families` en config de programa.

**Bloque 6 — Sincronización a PROD:** PR `developmen` → `main` por bloque validado.

**Bloque 7 — Manuales de usuario:** tras estabilizar cada pantalla, crear su manual HTML siguiendo `GUIA_ELABORACION_MANUALES_SCHOOLNET_v4_0.md` y `manual_template`, con correspondencia 1:1 (`/manual/planning/<archivo>.html` por cada `/modules/planning/<archivo>.html`): `my-dp-outlines.html`, `dp-outline-form.html`, `my-dp-planners.html`, `dp-planner-form.html` (+ la página de config del flag si aplica). Son HTML para usuarios finales, sin tecnicismos. Énfasis propios de PD que el manual debe aclarar: la relación bi-anual → trimestral (qué se llena primero), la separación SL/HL en planeadores distintos, que el cronograma se llena por sesión dentro de ciclos, y que la reflexión hoy no se comparte con familias. **Se elaboran al final, cuando la pantalla existe y está estable; no antes.**

---

## 11. Pruebas mínimas

- UNIQUE: crear dos trimestrales SL y HL para la misma (asignatura, grado, trimestre, año) → debe permitir ambos; un tercero SL duplicado → debe rechazar. PEP (level NULL) → sigue siendo uno por combinación.
- Bi-anual: un bi-anual por (asignatura, nivel); intentar un segundo → rechaza.
- Cronograma: creación concurrente de sesiones (dos pestañas) → sin colisión de `day_number` (función atómica).
- Acceso: docente de la asignatura edita el bi-anual; coordinador de área/programa edita; usuario sin relación → solo lectura o acceso denegado.
- Reflexión: con `share_reflection_with_families = false`, el bloque queda marcado como no compartible (la función de compartir no existe aún; verificar solo el flag y el marcado).
- Auditoría: editar cada tabla nueva y verificar el registro en `audit_log` (recordar la deuda de SchoolNet: `user_display_name = 'DB: postgres'` por el pool de PostgREST; es esperado, no es bug de este módulo).
- Frozen: cerrar un año → trimestral de ese año pasa a solo lectura; el bi-anual sigue editable.

---

## 12. Pendientes y fuera de alcance

| # | Tema | Estado |
|---|---|---|
| 12.1 | **PAI.** Comparte el formato trimestral con PD; la infraestructura del trimestral PD (núcleo + extensión + sesiones + componentes) se diseñó para servir a PAI con `level = NULL`. Falta levantamiento pedagógico de PAI y definir si PAI tiene equivalente al bi-anual. | Diferido. |
| 12.2 | **Compartir planeadores con familias.** Feature propia y grande. Aquí solo se deja el flag `programs.share_reflection_with_families`. | Fuera de alcance. |
| 12.3 | **Bandas 1–7 + descriptores.** Escala institucional de calificación; vive en Phidias y de forma descriptiva en el cuerpo. No se modela como rúbrica en el módulo. Si coordinación pide gestionar los descriptores en SchoolNet, es un proyecto aparte. | Fuera de alcance. |
| 12.4 | **Obras elegidas** es propio de Literatura; se modela como texto libre (`chosen_works`) y otras asignaturas lo dejan vacío. Si se quiere estructurar como lista, fase posterior. | Diferido. |
| 12.5 | **Estructurar ATL/Perfil IB del bi-anual** como multiselect (hoy narrativo). | Diferido. |
| 12.6 | **Reporte por promoción** (vista de las 6 sumativas de una cohorte). Sale de los datos por filtro; construir como reporte cuando haya uso real. | Fase posterior. |
| 12.7 | **Tareas operativas en PROD (dependen de terceros):** asignar los permisos nuevos a roles; poblar `grades.program_id` (PD en 10° y 11°); poblar `academic_areas.coordinator_worker_id`; verificar `programs.program_director_email` y `sections.director_email` de Escuela Alta. | Operativo. |
| 12.8 | **Decisión revisable:** Esquema del curso como tabla estructurada (D11). Si coordinación lo prefiere como texto libre, colapsar `pln_dp_outline_topics` a un campo en `pln_dp_outlines`. | Revisable. |
| 12.9 | **Manuales de usuario** (Bloque 7). Entregable obligatorio por pantalla, en HTML, según la guía v4.0. Se elaboran cuando la UI está estable, no durante el diseño. | Entregable post-UI. |

---

## 13. Glosario PD

| Término | Definición |
|---|---|
| **PD** | Programa del Diploma (DP). Escuela Alta (10° y 11°). |
| **Bi-anual / Esquema del curso** | Planeador padre, vivo, por asignatura+nivel, que abarca los dos años. `pln_dp_outlines`. |
| **Trimestral** | Planeador hijo, por asignatura+nivel+grado+trimestre+año. `pln_planners` + `pln_planner_dp`. |
| **SL / NM** | Standard Level / Nivel Medio. |
| **HL / NS** | Higher Level / Nivel Superior. |
| **Año 1 / Año 2** | Primer y segundo año del PD = 10° y 11°. |
| **Sesión / Día** | Una clase dentro de un ciclo. `pln_planner_sessions`. |
| **Ciclo** | Contenedor de hasta 6 días (rotación D1–D6). En PD solo agrupa sesiones. `pln_planner_cycles`. |
| **TOK / TdC** | Theory of Knowledge / Teoría del Conocimiento. |
| **CAS** | Creatividad, Actividad y Servicio. |
| **ATL** | Approaches to Learning / Enfoques del Aprendizaje. |
| **Componente sumativo** | Evaluación sumativa con peso (ej. P1, Oral Individual, Carpeta del Alumno). `pln_planner_dp_components`. |
| **Cohorte / Promoción** | Grupo que cursa el bienio (10° año N → 11° año N+1). No es entidad; es un filtro. |
| **Frozen** | Solo lectura por año académico cerrado. Aplica al trimestral, no al bi-anual. |

---

*Documento elaborado por Desarrollos · Junio 2026 · Versión 1.0 · Extensión PD del módulo `planning`. Complementa la Especificación de Desarrollo v1.0 (mayo 2026).*
