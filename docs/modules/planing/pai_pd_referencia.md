# Módulo de Planeación PAI y PD — Documento de referencia para desarrollo

**Borrador base · Mayo 2026 · v0.1**

> **Estado:** este documento es un **borrador base** que recoge lo conocido del marco oficial IB (PAI/MYP y PD/DP), de las buenas prácticas de plataformas de mercado (ManageBac, Toddle), y la arquitectura ya implementada en el módulo PEP de SchoolNet. Los espacios marcados `[PENDIENTE LEVANTAMIENTO]` esperan respuestas de la coordinación de PAI y PD del Colegio Tilatá (ver `PLANTILLA_LEVANTAMIENTO_PAI_PD.md`). Una vez resuelto el levantamiento, este documento se promueve a v1.0 y sirve como referencia oficial de desarrollo.

---

## Índice

1. [Visión general](#1-visión-general)
2. [Decisiones de arquitectura](#2-decisiones-de-arquitectura)
3. [Roles, permisos y visibilidad](#3-roles-permisos-y-visibilidad)
4. [Modelo conceptual](#4-modelo-conceptual)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Catálogos IB e institucionales](#6-catálogos-ib-e-institucionales)
7. [Evaluación y rúbricas](#7-evaluación-y-rúbricas)
8. [Articulación con MEN y Phidias](#8-articulación-con-men-y-phidias)
9. [Estructura de páginas y flujos](#9-estructura-de-páginas-y-flujos)
10. [Alcance del MVP](#10-alcance-del-mvp)
11. [Pendientes y preguntas abiertas](#11-pendientes-y-preguntas-abiertas)
12. [Anexos](#12-anexos)

---

## 1. Visión general

### 1.1 Contexto

El Colegio Tilatá opera los tres programas IB. El módulo de **Planeación PEP** ya está en producción cubriendo Preescolar y Primaria. Este documento define la extensión del módulo para cubrir:

- **PAI** (Programa de los Años Intermedios / MYP) — Escuela Media.
- **PD** (Programa del Diploma / DP) — Escuela Alta.

La arquitectura del módulo de planeación ya contempla `program_id` como discriminador en las entidades principales (`pln_planners`, `pln_units`), por lo que la base existe. Lo nuevo son las entidades, catálogos y formularios específicos a cada programa.

### 1.2 Qué resuelve

Los mismos objetivos del módulo PEP, aplicados a PAI y PD:

- **Fuente única de verdad** institucional para la planeación curricular.
- **Visibilidad para coordinaciones** del programa y de las áreas.
- **Articulación con MEN** vía campos de estándares y vinculación con Pruebas Saber.
- **Conversación pedagógica documentada** entre docente y coordinación.
- **Coherencia con el marco IB** de cada programa.

### 1.3 Qué NO es

- No es un sistema de notas oficial. Las calificaciones siguen en Phidias.
- No reemplaza a TOK, EE, CAS, ni Personal Project como entidades del estudiante (esos quedan fuera del módulo de planeación; el módulo solo planea cómo el docente conecta sus unidades con esos componentes).
- No es un sistema de aprobación formal. Es conversación pedagógica.

### 1.4 Diferencias fundamentales con PEP

| Dimensión | PEP | PAI | PD |
|---|---|---|---|
| **Carácter curricular** | Transdisciplinario | Interdisciplinario y multidisciplinario | Multidisciplinario |
| **Entidad central** | Unidad de Indagación (UI) transdisciplinaria + planeador disciplinar | Planeador disciplinar (unidad de asignatura) | Planeador disciplinar (unidad de asignatura) |
| **Unidad temporal de planeación** | Trimestre | Unidad de duración variable | Unidad de duración variable |
| **Marco conceptual** | Tema transdisciplinario + Idea central + Líneas de indagación + Conceptos clave | Key Concept + Related Concepts + Global Context + Statement of Inquiry | Aims + Assessment Objectives + Syllabus Content |
| **Criterios de evaluación** | Definidos por el docente (escala 2-5 institucional) | 4 criterios A/B/C/D fijos por asignatura, escala 0-8 IB | Assessment Objectives publicados por IB, escala 1-7 |
| **Conexiones obligatorias** | Perfil IB, ATL | ATL, Service as Action, Mentalidad internacional, Perfil IB, IDU | ATL, TOK, CAS, Mentalidad internacional, Perfil IB |
| **Niveles** | Por grado | Por año (MYP 1-5) | HL / SL |
| **Componente terminal** | — | Personal Project (MYP 5) | EE + TOK exhibition/essay |

---

## 2. Decisiones de arquitectura

Estas son decisiones tomadas con base en el marco IB y la arquitectura existente del módulo PEP, **antes** del levantamiento con coordinación. Validables pero no negociables salvo justificación pedagógica.

### 2.1 Tablas separadas por programa

Los planeadores PAI y PD **no extienden** la tabla `pln_planners` actual. Se crean tablas separadas:

- `pln_planners` queda como "planeador PEP de área" (no se renombra para no romper el código existente, pero se documenta su scope).
- `pln_myp_planners` — planeador PAI disciplinar.
- `pln_dp_planners` — planeador PD disciplinar.

**Justificación:** los campos obligatorios de cada programa son tan distintos que extender una sola tabla generaría 60+ columnas con la mayoría NULL en cada fila según el programa. Es un anti-patrón. Las tablas separadas permiten:

- Constraints específicos por programa (ej. PD obligatorio HL/SL).
- Catálogos IB ligados directamente sin ambigüedad.
- Migraciones independientes.
- Código de UI más limpio (cada `*-form.html` opera sobre una tabla concreta).

### 2.2 Catálogos IB se cargan tal cual

Los catálogos del IB son **datos canónicos** publicados por la organización. No se editan localmente. El admin puede:

- Cargarlos desde documentos oficiales IB (CSV/JSON de referencia).
- Marcar elementos como inactivos si Tilatá no los usa (pero no editarlos).
- Agregar traducciones al español si el catálogo viene en inglés.

No se permite crear, editar ni eliminar elementos del catálogo IB. Esta es una decisión de integridad pedagógica, no técnica.

### 2.3 Catálogos institucionales son separados

Tilatá agrega sus propios catálogos (Atributos Tilatá, estándares MEN, ejes del PEI). Estos van en tablas con prefijo `pln_tilata_*` igual que en PEP, y son completamente editables por el admin.

### 2.4 Articulación con MEN como capa transversal

El campo `men_standards` (texto enriquecido) ya existe en `pln_planners` (PEP). Se replica en `pln_myp_planners` y `pln_dp_planners` con la misma semántica. Cuando se levante el Alcance y Secuencia institucional para PAI/PD, se convertirá en vinculación estructurada (igual que está previsto para PEP).

### 2.5 Comentarios polimórficos extendidos

La tabla `pln_comments` ya soporta entidades polimórficas vía `entity_type` y `entity_id`. Se agregan los nuevos tipos:

- `myp_planner` y `myp_planner_section` (si se decide comentar por sección).
- `dp_planner` y `dp_planner_section`.
- `myp_idu` (unidad interdisciplinaria PAI) si aplica.

No requiere cambios estructurales en la tabla — solo nuevos valores válidos en `entity_type`.

### 2.6 Reutilización del modelo de ciclos

El concepto de "ciclos dentro de la unidad" del PEP es reutilizable. PAI usa el mismo modelo (con catálogo de stages distinto si se quiere) y PD también (con stages probablemente más simples: introducción, desarrollo, evaluación).

`pln_myp_planner_cycles` y `pln_dp_planner_cycles` replican la estructura de `pln_planner_cycles`.

### 2.7 Vista panorámica de coordinación reutilizable

Las pantallas `coordinator-area.html` y `coordinator-program.html` existentes se extienden para mostrar los tres programas. La lógica de filtrado por área/programa/sección ya está implementada y soporta `program_id`. Se agregan:

- Vista de planeadores PAI con sus métricas específicas.
- Vista de planeadores PD con sus métricas específicas.
- Toggle de programa si el coordinador tiene acceso a más de uno.

---

## 3. Roles, permisos y visibilidad

### 3.1 Permisos nuevos a crear

Los siguientes permisos se agregan a la tabla `permissions` con `permission_module = 'Planeación'`:

| `permission_name` | Descripción | `url_path` |
|---|---|---|
| `Crear planeador PAI` | Crear unidad PAI | `/modules/planning/myp-planner-form.html` |
| `Gestionar planeadores PAI` | Listar y editar planeadores PAI propios | `/modules/planning/my-myp-planners.html` |
| `Crear planeador PD` | Crear unidad PD | `/modules/planning/dp-planner-form.html` |
| `Gestionar planeadores PD` | Listar y editar planeadores PD propios | `/modules/planning/my-dp-planners.html` |
| `Coordinar PAI` | Vista panorámica del programa PAI | `/modules/planning/myp-coordinator.html` |
| `Coordinar PD` | Vista panorámica del programa PD | `/modules/planning/dp-coordinator.html` |
| `Administrar catálogos PAI` | Cargar catálogos IB MYP | `/modules/planning/catalogs.html` (mismo, con tab PAI) |
| `Administrar catálogos PD` | Cargar catálogos IB DP | `/modules/planning/catalogs.html` (mismo, con tab PD) |

Los permisos `Coordinar planeación de área` y `Coordinar planeación de programa` existentes se mantienen — el coordinador de área cubre los tres programas para su área; el coordinador de programa (rol propio del programa) se modela vía `program_director_email` ya existente en la tabla `programs`.

### 3.2 Matriz de visibilidad

| Vista | Docente PAI | Docente PD | Coord. Área | Coord. Programa PAI | Coord. Programa PD | Admin |
|---|---|---|---|---|---|---|
| Sus planeadores PAI | ✅ | — | ✅ (su área) | ✅ | — | ✅ |
| Sus planeadores PD | — | ✅ | ✅ (su área) | — | ✅ | ✅ |
| Sus planeadores PEP | — | — | ✅ (su área) | — | — | ✅ |
| Catálogos IB MYP (lectura) | ✅ | — | ✅ | ✅ | — | ✅ |
| Catálogos IB DP (lectura) | — | ✅ | ✅ | — | ✅ | ✅ |
| Catálogos (edición) | — | — | — | — | — | ✅ |
| Comentar en su planeador | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar contenido | ✅ (propio) | ✅ (propio) | ✅ (área) | ✅ (programa) | ✅ (programa) | ✅ |

### 3.3 Determinación del rol

Misma lógica del módulo PEP, aplicada al programa específico:

1. ¿Tiene permiso `Administrar catálogos`? → admin.
2. ¿Es el director del programa (`programs.program_director_email` = email del usuario)? → coordinador de programa.
3. ¿Es coordinador de un área activa (`academic_areas.coordinator_worker_id` = worker_id)? → coordinador de área.
4. ¿Es director de sección (`sections.director_email` = email del usuario)? → director de sección.
5. ¿De lo contrario? → docente. Ve solo sus planeadores y aquellos donde es colaborador.

---

## 4. Modelo conceptual

### 4.1 Entidad central por programa

**PAI:** la entidad central es `pln_myp_planners` — una unidad disciplinar de una asignatura en un grado del PAI durante un período de tiempo definido por fechas (no por trimestre).

**PD:** la entidad central es `pln_dp_planners` — una unidad disciplinar de una asignatura en un nivel (HL/SL) del PD durante un período de tiempo definido por fechas.

### 4.2 Unidades interdisciplinarias PAI (IDU)

PAI requiere al menos una unidad interdisciplinaria por año por estudiante. Se modela como entidad separada `pln_myp_idu`, análoga a `pln_units` del PEP pero con marco IDU específico:

- Múltiples asignaturas participantes (M:N).
- IDU Statement of Inquiry.
- IDU Disciplinary Grounding (qué aporta cada disciplina).
- IDU Assessment Criteria (criterios específicos IDU del IB).
- Conexión opcional con Personal Project para PAI 5.

`[PENDIENTE LEVANTAMIENTO]` — confirmar con coordinación si las IDU se modelan en el sistema o se gestionan como anotaciones en cada planeador disciplinar.

### 4.3 El Core del PD

TOK, EE y CAS son componentes del Core del PD. Decisión arquitectónica:

- **TOK** se modela como una asignatura más en `academic_subjects`, con sus propios planeadores PD que pueden tener un layout especial (sin Internal Assessment, con estructura de Exhibición + Ensayo).
- **EE** queda **fuera** del módulo de planeación. Es responsabilidad individual del estudiante con un supervisor docente. Se gestionará en un módulo aparte si el colegio lo requiere.
- **CAS** queda **fuera** del módulo de planeación por la misma razón.
- **Conexiones** con TOK y CAS son campos de texto enriquecido en cada planeador PD, no entidades vinculadas estructuralmente. Esto permite que el docente declare cómo su unidad se conecta sin tener que vincular a entidades específicas (que pueden no existir aún).

`[PENDIENTE LEVANTAMIENTO]` — validar con coordinación PD si esta separación les hace sentido.

### 4.4 Vinculación entre programas

¿Puede una UI del PEP "continuar" como una IDU del PAI en grados de transición? `[PENDIENTE LEVANTAMIENTO]`.

Posibilidades:
- **Opción A:** sin vinculación estructural. Cada programa es independiente.
- **Opción B:** vinculación opcional con campo `previous_program_unit_id` que apunta a una UI/IDU/planeador del programa anterior.
- **Opción C:** plantillas de unidad que se pueden duplicar entre programas para mantener continuidad temática.

### 4.5 Heredabilidad entre años

Como en PEP, los planeadores PAI y PD deben poder heredarse año a año. El docente del año siguiente toma el planeador del año anterior como base y lo ajusta. Se implementa con el mismo patrón de `pln_planners.created_from_planner_id` que ya existe en PEP.

---

## 5. Modelo de datos

### 5.1 Tablas nuevas — PAI

#### `pln_myp_planners`

```sql
CREATE TABLE pln_myp_planners (
    planner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(year_id),
    subject_id UUID NOT NULL REFERENCES academic_subjects(subject_id),
    grade_id UUID NOT NULL REFERENCES grades(grade_id),
    program_id UUID NOT NULL REFERENCES programs(program_id),
    teacher_id UUID NOT NULL REFERENCES workers(worker_id),

    -- Identidad
    unit_title TEXT,
    myp_year INT, -- MYP 1 a 5
    start_date DATE,
    end_date DATE,
    estimated_hours INT,

    -- Marco conceptual
    key_concept_id UUID REFERENCES pln_myp_key_concepts(key_concept_id),
    global_context_id UUID REFERENCES pln_myp_global_contexts(global_context_id),
    global_context_exploration_id UUID REFERENCES pln_myp_global_context_explorations(exploration_id),
    statement_of_inquiry TEXT, -- texto enriquecido

    -- Contenido y skills
    content_summary TEXT, -- texto enriquecido
    transfer_skills TEXT, -- texto enriquecido

    -- Articulación
    men_standards TEXT, -- texto enriquecido
    institutional_attributes TEXT, -- texto enriquecido (Atributos Tilatá si aplican)

    -- Diferenciación
    differentiation_support TEXT, -- texto enriquecido
    differentiation_extension TEXT, -- texto enriquecido
    differentiation_materials TEXT,

    -- Reflexión
    reflection_before TEXT, -- texto enriquecido
    reflection_during TEXT, -- texto enriquecido
    reflection_after TEXT, -- texto enriquecido
    student_voice_reflection TEXT, -- texto enriquecido

    -- Recursos generales
    resources TEXT, -- texto enriquecido

    -- Conexiones IDU
    linked_idu_id UUID REFERENCES pln_myp_idu(idu_id),

    -- Metadatos
    planner_status TEXT NOT NULL DEFAULT 'active', -- active | archived | deleted
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_from_planner_id UUID REFERENCES pln_myp_planners(planner_id) -- herencia entre años
);

ALTER TABLE pln_myp_planners DISABLE ROW LEVEL SECURITY;
```

#### `pln_myp_planner_related_concepts`

M:N — Related Concepts del planeador (varían por grupo de asignatura).

```sql
CREATE TABLE pln_myp_planner_related_concepts (
    planner_id UUID NOT NULL REFERENCES pln_myp_planners(planner_id) ON DELETE CASCADE,
    related_concept_id UUID NOT NULL REFERENCES pln_myp_related_concepts(related_concept_id),
    PRIMARY KEY (planner_id, related_concept_id)
);
ALTER TABLE pln_myp_planner_related_concepts DISABLE ROW LEVEL SECURITY;
```

#### `pln_myp_planner_inquiry_questions`

Subentidad — las preguntas de indagación del planeador, en sus tres categorías.

```sql
CREATE TABLE pln_myp_planner_inquiry_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES pln_myp_planners(planner_id) ON DELETE CASCADE,
    question_type TEXT NOT NULL CHECK (question_type IN ('factual', 'conceptual', 'debatable')),
    question_text TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE pln_myp_planner_inquiry_questions DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_myp_iq_planner ON pln_myp_planner_inquiry_questions(planner_id);
```

#### `pln_myp_planner_atl_skills`

M:N — ATL skills priorizadas. Mismo patrón que en PEP pero con catálogo MYP.

```sql
CREATE TABLE pln_myp_planner_atl_skills (
    planner_id UUID NOT NULL REFERENCES pln_myp_planners(planner_id) ON DELETE CASCADE,
    atl_skill_id UUID NOT NULL REFERENCES pln_myp_atl_skills(atl_skill_id),
    PRIMARY KEY (planner_id, atl_skill_id)
);
ALTER TABLE pln_myp_planner_atl_skills DISABLE ROW LEVEL SECURITY;
```

#### `pln_myp_planner_assessment_tasks`

Tareas de evaluación del planeador. Cada una vinculada a uno o más criterios A/B/C/D.

```sql
CREATE TABLE pln_myp_planner_assessment_tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES pln_myp_planners(planner_id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('formative', 'summative')),
    task_title TEXT NOT NULL,
    task_description TEXT, -- texto enriquecido
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pln_myp_assessment_task_criteria (
    task_id UUID NOT NULL REFERENCES pln_myp_planner_assessment_tasks(task_id) ON DELETE CASCADE,
    subject_criterion_id UUID NOT NULL REFERENCES pln_myp_subject_criteria(subject_criterion_id),
    PRIMARY KEY (task_id, subject_criterion_id)
);

ALTER TABLE pln_myp_planner_assessment_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_assessment_task_criteria DISABLE ROW LEVEL SECURITY;
```

#### `pln_myp_planner_cycles`

Ciclos dentro de la unidad PAI. Mismo patrón que `pln_planner_cycles` del PEP.

```sql
CREATE TABLE pln_myp_planner_cycles (
    cycle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES pln_myp_planners(planner_id) ON DELETE CASCADE,
    cycle_number INT NOT NULL,
    topic TEXT,
    start_date DATE,
    end_date DATE,
    session_objectives TEXT, -- texto enriquecido
    learning_experiences TEXT, -- texto enriquecido
    formative_assessment TEXT, -- texto enriquecido
    summative_assessment TEXT, -- texto enriquecido
    resources TEXT,
    cycle_reflection_during TEXT, -- texto enriquecido
    cycle_reflection_after TEXT, -- texto enriquecido
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (planner_id, cycle_number)
);
ALTER TABLE pln_myp_planner_cycles DISABLE ROW LEVEL SECURITY;
```

#### `pln_myp_planner_learner_profile`

M:N — atributos del perfil IB priorizados (catálogo común a los tres programas).

```sql
CREATE TABLE pln_myp_planner_learner_profile (
    planner_id UUID NOT NULL REFERENCES pln_myp_planners(planner_id) ON DELETE CASCADE,
    profile_attribute_id UUID NOT NULL REFERENCES pln_ib_learner_profile(profile_attribute_id),
    PRIMARY KEY (planner_id, profile_attribute_id)
);
ALTER TABLE pln_myp_planner_learner_profile DISABLE ROW LEVEL SECURITY;
```

#### `pln_myp_planner_service_as_action`

`[PENDIENTE LEVANTAMIENTO]` — modelado depende de cómo Tilatá documenta Service as Action.

#### `pln_myp_idu`

Unidad interdisciplinaria PAI. Análoga a `pln_units` del PEP.

```sql
CREATE TABLE pln_myp_idu (
    idu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(year_id),
    myp_year INT NOT NULL,
    idu_title TEXT,
    statement_of_inquiry TEXT,
    disciplinary_grounding TEXT, -- texto enriquecido
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES workers(worker_id),
    idu_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pln_myp_idu_subjects (
    idu_id UUID NOT NULL REFERENCES pln_myp_idu(idu_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES academic_subjects(subject_id),
    PRIMARY KEY (idu_id, subject_id)
);

CREATE TABLE pln_myp_idu_collaborators (
    idu_id UUID NOT NULL REFERENCES pln_myp_idu(idu_id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(worker_id),
    is_lead BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (idu_id, worker_id)
);

ALTER TABLE pln_myp_idu DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_idu_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_idu_collaborators DISABLE ROW LEVEL SECURITY;
```

### 5.2 Tablas nuevas — PD

#### `pln_dp_planners`

```sql
CREATE TABLE pln_dp_planners (
    planner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(year_id),
    subject_id UUID NOT NULL REFERENCES academic_subjects(subject_id),
    grade_id UUID NOT NULL REFERENCES grades(grade_id),
    program_id UUID NOT NULL REFERENCES programs(program_id),
    teacher_id UUID NOT NULL REFERENCES workers(worker_id),

    -- Identidad
    unit_title TEXT,
    dp_level TEXT CHECK (dp_level IN ('HL', 'SL')),
    dp_year INT, -- 1 o 2
    start_date DATE,
    end_date DATE,
    estimated_hours INT,

    -- Vinculación con syllabus IB
    syllabus_topic_ids UUID[], -- referencia múltiple a pln_dp_syllabus_topics
    -- Alternativa: tabla M:N pln_dp_planner_syllabus_topics

    -- Marco de la unidad
    inquiry_questions TEXT, -- texto enriquecido (sin tipificación como PAI)
    transfer_goals TEXT, -- texto enriquecido
    content_skills_concepts TEXT, -- texto enriquecido

    -- Conexiones con el Core
    tok_connections TEXT, -- texto enriquecido
    cas_connections TEXT, -- texto enriquecido
    ee_opportunities TEXT, -- texto enriquecido

    -- Mentalidad internacional y Perfil
    international_mindedness TEXT, -- texto enriquecido
    language_and_learning TEXT, -- texto enriquecido

    -- Articulación
    men_standards TEXT, -- texto enriquecido
    institutional_attributes TEXT,

    -- Diferenciación
    differentiation_support TEXT,
    differentiation_extension TEXT,
    differentiation_materials TEXT,

    -- Recursos y reflexión
    resources TEXT,
    reflection_before TEXT,
    reflection_during TEXT,
    reflection_after TEXT,

    -- Metadatos
    planner_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_from_planner_id UUID REFERENCES pln_dp_planners(planner_id)
);

ALTER TABLE pln_dp_planners DISABLE ROW LEVEL SECURITY;
```

#### `pln_dp_planner_aims_objectives`

M:N — Aims y Assessment Objectives del syllabus vinculados a la unidad.

```sql
CREATE TABLE pln_dp_planner_aims (
    planner_id UUID NOT NULL REFERENCES pln_dp_planners(planner_id) ON DELETE CASCADE,
    aim_id UUID NOT NULL REFERENCES pln_dp_subject_aims(aim_id),
    PRIMARY KEY (planner_id, aim_id)
);

CREATE TABLE pln_dp_planner_assessment_objectives (
    planner_id UUID NOT NULL REFERENCES pln_dp_planners(planner_id) ON DELETE CASCADE,
    objective_id UUID NOT NULL REFERENCES pln_dp_assessment_objectives(objective_id),
    PRIMARY KEY (planner_id, objective_id)
);

ALTER TABLE pln_dp_planner_aims DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_dp_planner_assessment_objectives DISABLE ROW LEVEL SECURITY;
```

#### `pln_dp_planner_atl_skills`

M:N — ATL skills priorizadas (catálogo DP).

```sql
CREATE TABLE pln_dp_planner_atl_skills (
    planner_id UUID NOT NULL REFERENCES pln_dp_planners(planner_id) ON DELETE CASCADE,
    atl_skill_id UUID NOT NULL REFERENCES pln_dp_atl_skills(atl_skill_id),
    PRIMARY KEY (planner_id, atl_skill_id)
);
ALTER TABLE pln_dp_planner_atl_skills DISABLE ROW LEVEL SECURITY;
```

#### `pln_dp_planner_assessment_tasks`

Tareas de evaluación del planeador, con vinculación a Assessment Objectives.

```sql
CREATE TABLE pln_dp_planner_assessment_tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES pln_dp_planners(planner_id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('formative', 'summative', 'internal_assessment', 'mock_exam')),
    task_title TEXT NOT NULL,
    task_description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pln_dp_assessment_task_objectives (
    task_id UUID NOT NULL REFERENCES pln_dp_planner_assessment_tasks(task_id) ON DELETE CASCADE,
    objective_id UUID NOT NULL REFERENCES pln_dp_assessment_objectives(objective_id),
    PRIMARY KEY (task_id, objective_id)
);

ALTER TABLE pln_dp_planner_assessment_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_dp_assessment_task_objectives DISABLE ROW LEVEL SECURITY;
```

#### `pln_dp_planner_cycles`

Ciclos dentro de la unidad PD. Estructura simplificada vs PAI.

```sql
CREATE TABLE pln_dp_planner_cycles (
    cycle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES pln_dp_planners(planner_id) ON DELETE CASCADE,
    cycle_number INT NOT NULL,
    topic TEXT,
    start_date DATE,
    end_date DATE,
    learning_objectives TEXT,
    learning_experiences TEXT,
    formative_assessment TEXT,
    resources TEXT,
    cycle_reflection TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (planner_id, cycle_number)
);
ALTER TABLE pln_dp_planner_cycles DISABLE ROW LEVEL SECURITY;
```

#### `pln_dp_planner_learner_profile`

M:N — atributos del perfil IB.

```sql
CREATE TABLE pln_dp_planner_learner_profile (
    planner_id UUID NOT NULL REFERENCES pln_dp_planners(planner_id) ON DELETE CASCADE,
    profile_attribute_id UUID NOT NULL REFERENCES pln_ib_learner_profile(profile_attribute_id),
    PRIMARY KEY (planner_id, profile_attribute_id)
);
ALTER TABLE pln_dp_planner_learner_profile DISABLE ROW LEVEL SECURITY;
```

### 5.3 Tablas de catálogos IB

#### Catálogos MYP

```sql
-- Key Concepts MYP (16 globales)
CREATE TABLE pln_myp_key_concepts (
    key_concept_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_es TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Related Concepts MYP (por grupo de asignatura)
CREATE TABLE pln_myp_related_concepts (
    related_concept_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_group TEXT NOT NULL, -- 'Language and Literature', 'Sciences', etc.
    name_es TEXT NOT NULL,
    name_en TEXT,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Global Contexts (6 fijos)
CREATE TABLE pln_myp_global_contexts (
    global_context_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_es TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Global Context Explorations (líneas específicas de cada contexto)
CREATE TABLE pln_myp_global_context_explorations (
    exploration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_context_id UUID NOT NULL REFERENCES pln_myp_global_contexts(global_context_id),
    name_es TEXT NOT NULL,
    name_en TEXT,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ATL Skills MYP
CREATE TABLE pln_myp_atl_skills (
    atl_skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster TEXT NOT NULL, -- 'Communication', 'Social', 'Self-management', 'Research', 'Thinking'
    sub_skill TEXT,
    name_es TEXT NOT NULL,
    name_en TEXT,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Subject Group Criteria (4 por grupo)
CREATE TABLE pln_myp_subject_criteria (
    subject_criterion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_group TEXT NOT NULL,
    criterion_code TEXT NOT NULL CHECK (criterion_code IN ('A', 'B', 'C', 'D')),
    criterion_name_es TEXT NOT NULL,
    criterion_name_en TEXT,
    max_score INT NOT NULL DEFAULT 8,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (subject_group, criterion_code)
);

-- Descriptores 0-8 de cada criterio
CREATE TABLE pln_myp_criterion_descriptors (
    descriptor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_criterion_id UUID NOT NULL REFERENCES pln_myp_subject_criteria(subject_criterion_id),
    band_min INT NOT NULL, -- 0, 1, 3, 5, 7
    band_max INT NOT NULL, -- 0, 2, 4, 6, 8
    descriptor_text TEXT NOT NULL,
    UNIQUE (subject_criterion_id, band_min, band_max)
);

ALTER TABLE pln_myp_key_concepts DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_related_concepts DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_global_contexts DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_global_context_explorations DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_atl_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_subject_criteria DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_myp_criterion_descriptors DISABLE ROW LEVEL SECURITY;
```

#### Catálogos DP

```sql
-- Subject Aims (por asignatura, por nivel)
CREATE TABLE pln_dp_subject_aims (
    aim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES academic_subjects(subject_id),
    dp_level TEXT CHECK (dp_level IN ('HL', 'SL', 'BOTH')),
    aim_number INT,
    aim_text TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Assessment Objectives (por asignatura, por nivel)
CREATE TABLE pln_dp_assessment_objectives (
    objective_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES academic_subjects(subject_id),
    dp_level TEXT CHECK (dp_level IN ('HL', 'SL', 'BOTH')),
    objective_code TEXT, -- AO1, AO2, AO3...
    objective_text TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Syllabus Topics (temas oficiales por asignatura)
CREATE TABLE pln_dp_syllabus_topics (
    topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES academic_subjects(subject_id),
    dp_level TEXT CHECK (dp_level IN ('HL', 'SL', 'BOTH')),
    topic_number TEXT, -- '1.1', '2.3', etc.
    topic_name TEXT NOT NULL,
    parent_topic_id UUID REFERENCES pln_dp_syllabus_topics(topic_id),
    recommended_hours INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ATL Skills DP
CREATE TABLE pln_dp_atl_skills (
    atl_skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster TEXT NOT NULL,
    sub_skill TEXT,
    name_es TEXT NOT NULL,
    name_en TEXT,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Grade Descriptors 1-7 (por nivel)
CREATE TABLE pln_dp_grade_descriptors (
    descriptor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES academic_subjects(subject_id),
    dp_level TEXT CHECK (dp_level IN ('HL', 'SL', 'BOTH')),
    grade_value INT NOT NULL CHECK (grade_value BETWEEN 1 AND 7),
    descriptor_text TEXT NOT NULL,
    UNIQUE (subject_id, dp_level, grade_value)
);

ALTER TABLE pln_dp_subject_aims DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_dp_assessment_objectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_dp_syllabus_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_dp_atl_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE pln_dp_grade_descriptors DISABLE ROW LEVEL SECURITY;
```

#### Catálogo común a los tres programas

```sql
-- Perfil IB (10 atributos, común a PYP, MYP y DP)
CREATE TABLE pln_ib_learner_profile (
    profile_attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_es TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE pln_ib_learner_profile DISABLE ROW LEVEL SECURITY;
```

### 5.4 Extensiones a `pln_comments`

No requiere cambios estructurales. Solo se documentan los nuevos valores válidos de `entity_type`:

- `'myp_planner'`
- `'myp_planner_cycle'`
- `'myp_idu'`
- `'myp_idu_cycle'`
- `'dp_planner'`
- `'dp_planner_cycle'`

---

## 6. Catálogos IB e institucionales

### 6.1 Estrategia de carga

Los catálogos IB se cargan desde **archivos de referencia oficial** entregados por la coordinación. El proceso es:

1. Coordinación entrega CSV o JSON con la lista oficial IB en español (y/o inglés).
2. Desarrollos prepara el script SQL de carga.
3. Se ejecuta primero en DEV con verificación visual desde `catalogs.html`.
4. Se ejecuta en PROD una vez validado.
5. Los elementos quedan marcados como `active = true` por defecto. Tilatá puede desactivar los que no use.

`[PENDIENTE LEVANTAMIENTO]` — confirmar qué documentos oficiales IB tiene la coordinación (Subject Guides, From Principles into Practice, etc.) y cuáles requieren solicitud al IB.

### 6.2 Catálogos institucionales

Los catálogos `pln_tilata_*` ya existentes para PEP se reutilizan donde aplique. Específicamente:

- **Atributos Tilatá**: si la coordinación PAI/PD decide que aplican, se reutiliza `pln_tilata_attributes` con campo `program_scope` opcional para indicar a qué programas aplica cada atributo.
- **Estándares MEN**: se mantiene como texto enriquecido en cada planeador hasta que se levante el Alcance y Secuencia estructurado.

---

## 7. Evaluación y rúbricas

### 7.1 Modelo PAI

Estructura fija:

- Cada asignatura PAI tiene 4 criterios A/B/C/D fijos (del catálogo `pln_myp_subject_criteria`).
- Cada criterio se evalúa de 0 a 8 según descriptores publicados (catálogo `pln_myp_criterion_descriptors`).
- Cada tarea de evaluación del planeador (`pln_myp_planner_assessment_tasks`) se vincula M:N a uno o más criterios.

El docente PAI **no escribe descriptores** propios — selecciona criterios y consulta los descriptores oficiales como referencia. Esto difiere del modelo PEP donde el docente sí escribe descriptores libres.

`[PENDIENTE LEVANTAMIENTO]` — confirmar si Tilatá traduce la escala 0-8 IB a una escala institucional 1-5 para Phidias, y cómo.

### 7.2 Modelo PD

Estructura fija:

- Cada asignatura PD tiene Aims y Assessment Objectives publicados por IB.
- Cada tarea de evaluación se vincula M:N a uno o más Assessment Objectives.
- La calificación final de la asignatura PD es 1-7 según descriptores oficiales `pln_dp_grade_descriptors`.
- Las calificaciones oficiales del estudiante NO viven en este módulo — viven en Phidias.

`[PENDIENTE LEVANTAMIENTO]` — confirmar cómo se hace el puente con Phidias y si el módulo debe registrar resultados de mock exams.

### 7.3 Internal Assessment (PD)

El IA es una tarea del estudiante, no del docente. En el módulo de planeación se modela como una **referencia** en el planeador del docente (cuándo introduce el IA, qué tema, qué cronograma propone). La gestión efectiva del IA por estudiante queda fuera del módulo.

---

## 8. Articulación con MEN y Phidias

### 8.1 Articulación con MEN

Misma estrategia que en PEP:

- Campo `men_standards` (texto enriquecido) en cada planeador PAI/PD.
- Pendiente fase posterior: levantamiento del Alcance y Secuencia institucional para PAI/PD con catálogos estructurados análogos a los planeados para PEP.
- `[PENDIENTE LEVANTAMIENTO]` — vinculación explícita con Pruebas Saber.

### 8.2 Articulación con Phidias

El módulo de planeación **no** se integra automáticamente con Phidias. La traducción de escalas IB a escala institucional sigue siendo responsabilidad del docente al momento de calificar en Phidias.

`[PENDIENTE LEVANTAMIENTO]` — confirmar si se requiere algún tipo de exportación/reporte que facilite el puente Phidias.

---

## 9. Estructura de páginas y flujos

### 9.1 Páginas nuevas

**Para PAI:**

| Archivo | Propósito | Equivalente PEP |
|---|---|---|
| `myp-planner-form.html` | Formulario de planeador PAI | `planner-form.html` |
| `my-myp-planners.html` | Lista de planeadores PAI del docente | `my-planners.html` |
| `myp-planners.html` | Lista de planeadores PAI para coordinaciones | `planners.html` |
| `myp-idu-form.html` | Formulario de IDU | `unit-form.html` |
| `my-myp-idu.html` | Lista de IDU del docente | `my-units.html` |
| `myp-idu.html` | Lista de IDU para coordinaciones | `units.html` |
| `myp-coordinator.html` | Vista panorámica del programa PAI | (variante de `coordinator-area.html`) |

**Para PD:**

| Archivo | Propósito | Equivalente PEP |
|---|---|---|
| `dp-planner-form.html` | Formulario de planeador PD | `planner-form.html` |
| `my-dp-planners.html` | Lista de planeadores PD del docente | `my-planners.html` |
| `dp-planners.html` | Lista de planeadores PD para coordinaciones | `planners.html` |
| `dp-coordinator.html` | Vista panorámica del programa PD | (variante de `coordinator-area.html`) |

### 9.2 Reutilización de páginas existentes

- `catalogs.html` se extiende con tabs por programa (PEP, PAI, PD).
- `coordinator-area.html` se extiende para mostrar planeadores y unidades de los tres programas que tocan el área coordinada.
- `coordinator-program.html` ya funciona para los tres programas; solo se adapta para mostrar las métricas específicas de cada uno.

### 9.3 Sidebar y `MODULE_ITEM_ORDER`

Se ajusta el orden del módulo Planeación en `sidebar.js`:

```javascript
'Planeación': [
    'Inicio del módulo',
    // PEP
    'Mis unidades de indagación',
    'Mis planeadores de área',
    // PAI
    'Mis planeadores PAI',
    'Mis IDU',
    // PD
    'Mis planeadores PD',
    // Coordinación (común a los tres)
    'Coordinación de área',
    'Coordinación de programa',
    'Unidades de indagación',
    'Planeadores de área',
    'Planeadores PAI',
    'IDU',
    'Planeadores PD',
    // Catálogos
    'Administrar catálogos de planeación'
]
```

`[PENDIENTE LEVANTAMIENTO]` — confirmar nombres exactos y agrupamiento preferido por coordinaciones.

---

## 10. Alcance del MVP

### 10.1 Qué entra al MVP

**Versión 1 (PAI):**

1. Base de datos: todas las tablas `pln_myp_*` con catálogos cargados.
2. Permisos en BD.
3. `config.js` y `sidebar.js` actualizados.
4. `myp-planner-form.html` con todos los componentes obligatorios IB.
5. `my-myp-planners.html` para gestión del docente.
6. `myp-idu-form.html` y `my-myp-idu.html` para unidades interdisciplinarias.
7. Comentarios en planeadores y IDU.
8. Vista de coordinación PAI extendida.
9. Catálogos editables vía `catalogs.html`.

**Versión 2 (PD), después de PAI estable:**

1. Base de datos: tablas `pln_dp_*`.
2. Permisos.
3. `dp-planner-form.html`.
4. `my-dp-planners.html`.
5. Comentarios.
6. Vista de coordinación PD extendida.

### 10.2 Qué NO entra al MVP

- Gestión digital del Personal Project (PAI 5).
- Gestión digital del Extended Essay (PD).
- Gestión digital del CAS (PD).
- Gestión digital de TOK como módulo separado (el planeador TOK se hace con `dp-planner-form.html` y campos adicionales).
- Vinculación estructurada con Alcance y Secuencia (sigue siendo texto libre).
- Integración con Phidias.
- Reportes específicos para auditorías IB.
- Traslado masivo de planeadores entre años (común a los tres programas, se difiere).

### 10.3 Orden sugerido de desarrollo

1. **Levantamiento con coordinación** PAI y PD (basado en `PLANTILLA_LEVANTAMIENTO_PAI_PD.md`).
2. **Consolidación** de respuestas en este documento (promoción a v1.0).
3. **SQL primero** (DEV y PROD): tablas + catálogos + seeds + permisos.
4. **`config.js` + `sidebar.js`**: registrar módulos y permisos.
5. **Catálogos IB MYP** cargados desde documentos oficiales.
6. **`myp-planner-form.html`** — la entidad más compleja primero.
7. **`my-myp-planners.html`** y **`myp-planners.html`**.
8. **`myp-idu-form.html`** si la coordinación decide modelarlas en sistema.
9. **Extensión de coordinaciones** existentes para mostrar PAI.
10. **Validación con coordinación PAI** con docentes piloto.
11. **Lecciones aprendidas** y ajustes antes de empezar PD.
12. **Catálogos IB DP** cargados.
13. **`dp-planner-form.html`**.
14. **`my-dp-planners.html`** y **`dp-planners.html`**.
15. **Extensión de coordinaciones** para PD.
16. **Validación con coordinación PD**.

---

## 11. Pendientes y preguntas abiertas

Lista consolidada de todo lo marcado `[PENDIENTE LEVANTAMIENTO]` para fácil seguimiento durante la reunión con coordinaciones:

1. **Modelado de IDU** — entidad propia, marca en planeador disciplinar, o no modelar.
2. **Service as Action** — cómo documentarlo (campo libre, catálogo, entidad aparte).
3. **Vinculación entre programas** — UI del PEP que continúa como IDU del PAI.
4. **Catálogos IB disponibles** — qué documentos oficiales tiene la coordinación.
5. **Escala 0-8 vs 1-5** — cómo se hace la traducción institucional.
6. **Puente con Phidias** — qué automatización se desea.
7. **TOK como asignatura** — si se modela en `academic_subjects` o aparte.
8. **Pruebas Saber** — vinculación explícita o implícita.
9. **Trimestres vs unidades libres** — calendario y ritmo de planificación.
10. **Ciclos dentro de la unidad** — se mantienen, se renombran, o se reemplazan.
11. **Sidebar y nombres** — agrupamiento preferido en el menú.
12. **Prioridad de desarrollo** — PAI primero o PD primero.
13. **Coordinadores actuales** — emails para vincular en el sistema.
14. **Plantillas institucionales actuales** — entrega de coordinación para referencia.

---

## 12. Anexos

### 12.1 Glosario adicional

| Término | Definición |
|---|---|
| **IDU** | Interdisciplinary Unit — unidad interdisciplinaria PAI. |
| **SOI** | Statement of Inquiry — enunciado que sintetiza qué se va a aprender y por qué en una unidad PAI. |
| **HL / SL** | Higher Level / Standard Level — niveles de profundidad de las asignaturas PD. |
| **IA** | Internal Assessment — componente de evaluación interna del PD, con peso significativo en la calificación final IB. |
| **EE** | Extended Essay — ensayo extenso de investigación obligatorio en PD. |
| **TOK** | Theory of Knowledge — componente del Core del PD. |
| **CAS** | Creativity, Activity, Service — componente del Core del PD. |
| **Key Concept** | Concepto clave dominante de una unidad PAI. |
| **Related Concept** | Concepto relacionado, específico por grupo de asignatura PAI. |
| **Global Context** | Uno de los 6 contextos globales que enmarca una unidad PAI. |
| **ATL** | Approaches to Learning — habilidades del enfoque de aprendizaje, comunes a los tres programas con descriptores específicos en cada uno. |
| **Subject Group** | Grupo de asignaturas del PAI (8 grupos en total). |
| **Assessment Objective** | Objetivo de evaluación publicado por IB para cada asignatura PD. |
| **Personal Project** | Proyecto personal obligatorio en PAI 5. |
| **eAssessment** | Evaluación externa opcional al final del PAI que da acceso al MYP Certificate. |

### 12.2 Referencias

| Fuente | Uso |
|---|---|
| IB Programme Resource Centre | Documentos oficiales de cada programa. |
| IB Subject Guides | Aims, Objectives y Syllabus de cada asignatura. |
| From Principles into Practice (MYP, DP) | Estándares y prácticas para implementación. |
| ManageBac documentation | Referencia de buenas prácticas de modelado. |
| Toddle documentation | Referencia complementaria. |
| MEN Colombia — Lineamientos y Estándares | Articulación con currículo nacional. |
| Guía 34 MEN | Articulación institucional. |

### 12.3 Convenciones del módulo

| Convención | Ejemplo |
|---|---|
| Prefijo PAI | `pln_myp_*` |
| Prefijo PD | `pln_dp_*` |
| Prefijo común IB | `pln_ib_*` (perfil IB compartido) |
| Prefijo institucional | `pln_tilata_*` |
| Programa discriminador | `program_id` en planeadores |
| Nivel HL/SL | `dp_level` en planeadores PD |
| Año MYP | `myp_year` en planeadores PAI |

---

## Cierre

Este documento es un **borrador base**. Su promoción a v1.0 requiere:

1. Reunión de levantamiento con la coordinación PAI y PD usando `PLANTILLA_LEVANTAMIENTO_PAI_PD.md`.
2. Resolución de todos los puntos `[PENDIENTE LEVANTAMIENTO]`.
3. Validación pedagógica de la coordinación académica.
4. Aprobación formal del alcance del MVP por dirección.

Una vez en v1.0, el documento sirve como referencia oficial para el desarrollo, en paralelo a `Módulo_de_Planeación_de_Clases___Especificación_de_Desarrollo` (que cubre PEP) y `Bitácora___Módulo_de_Planeación_de_Clases` (donde se registran decisiones de implementación).

---

*Documento elaborado por Desarrollos · Mayo 2026 · Versión 0.1 (borrador base)*
