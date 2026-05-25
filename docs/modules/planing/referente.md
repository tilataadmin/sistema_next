# Módulo de Planeación de Clases — Especificación de Desarrollo

**Sistema:** SchoolNet (Colegio Tilatá)
**Módulo:** `planning`
**Documento:** Referencia única de desarrollo
**Versión:** 1.0
**Fecha:** Mayo 2026
**Estado:** Aprobado para inicio de desarrollo
**Reemplaza:** `Módulo_de_Planeación_de_Clases v0.4` (marzo 2026) — el v0.4 queda como referencia histórica del levantamiento; este documento es la fuente de verdad operativa.

---

## Acerca de este documento

Este documento unifica:

1. El **levantamiento funcional** realizado con coordinación académica (documento v0.4, marzo 2026).
2. El **SPEC técnico** elaborado por la directora académica en sesión separada (mayo 2026), que aporta el modelo conceptual depurado de Unidades de Indagación + Planeadores de Área.
3. Las **decisiones de arquitectura** tomadas frente a Google Classroom (documentos de abril 2026): SchoolNet es la fuente de verdad de la planeación; la publicación a Classroom es una integración posterior que no afecta el diseño del módulo.
4. La **realidad técnica de SchoolNet**: convenciones de base de datos, autenticación, sistema de permisos, librerías globales, RLS desactivado, stack Vanilla + Bootstrap 5 + Supabase + Vercel.

El propósito es que el equipo de desarrollo (humano y asistido por IA) tenga **un solo lugar** al cual volver para resolver dudas durante la implementación.

---

## Tabla de contenido

1. [Visión general](#1-visión-general)
2. [Contexto institucional y antecedentes](#2-contexto-institucional-y-antecedentes)
3. [Roles, permisos y visibilidad](#3-roles-permisos-y-visibilidad)
4. [Modelo conceptual](#4-modelo-conceptual)
5. [Principios de diseño](#5-principios-de-diseño)
6. [Modelo de datos](#6-modelo-de-datos)
7. [Catálogos parametrizables y seed data](#7-catálogos-parametrizables-y-seed-data)
8. [Especificación campo a campo por entidad](#8-especificación-campo-a-campo-por-entidad)
9. [Reglas de negocio](#9-reglas-de-negocio)
10. [Rutas, vistas y navegación](#10-rutas-vistas-y-navegación)
11. [Alcance del MVP (Fase 1)](#11-alcance-del-mvp-fase-1)
12. [Pendientes y preguntas abiertas](#12-pendientes-y-preguntas-abiertas)
13. [Anexo A — Integración con Google Classroom](#anexo-a--integración-con-google-classroom)
14. [Anexo B — Mapeo SPEC original → SchoolNet](#anexo-b--mapeo-spec-original--schoolnet)
15. [Anexo C — Referencias y glosario](#anexo-c--referencias-y-glosario)

---

## 1. Visión general

### 1.1 Qué es el módulo

El módulo de **Planeación de Clases** es la herramienta institucional única de SchoolNet donde **todos los docentes** del Colegio Tilatá construyen, mantienen y consultan la planeación curricular. Reemplaza Toodle y consolida en una sola plataforma los documentos de planificación que actualmente viven en archivos separados (Word, PDF, Google Docs).

El módulo soporta los tres programas IB del colegio:

- **PEP** (Programa de la Escuela Primaria — Preescolar y Primaria)
- **PAI** (Programa de los Años Intermedios — Escuela Media)
- **PD** (Programa del Diploma — Escuela Alta)

> **Nota sobre alcance:** El detalle pedagógico de PAI y PD aún no se ha levantado formalmente. Este documento describe **PEP completo** y define una **arquitectura extensible** preparada para que PAI y PD se incorporen sin rediseñar el modelo. Ver sección [12.1](#121-alcance-pai-y-pd).

### 1.2 Qué resuelve

El docente del colegio hoy mantiene su planeación en archivos sueltos, sin trazabilidad, sin posibilidad de que coordinación tenga vista transversal, sin histórico institucional consultable. Cuando un docente cambia de grado, se va, o se enferma, la planeación se pierde o queda atrapada en su computador.

El módulo resuelve:

- **Fuente única de verdad** institucional para la planeación curricular del colegio.
- **Visibilidad para coordinaciones** de área y de programa, sin necesidad de pedir archivos individualmente.
- **Cierre y archivo anual** automático: la planeación del año queda vinculada al `academic_year` y se puede consultar desde años posteriores.
- **Traslado entre años**: las planeaciones del año anterior sirven como base/borrador para el siguiente ciclo.
- **Conversación pedagógica documentada**: coordinadores comentan, docentes responden, queda historial.
- **Coherencia con el modelo IB**: el módulo modela explícitamente Unidades de Indagación transdisciplinarias, planeadores de área disciplinares, ciclos de indagación, conceptos clave, ATL, perfil IB, etc. — cosas que ningún sistema genérico (Classroom, Toodle, Notion) puede modelar.

### 1.3 Qué NO es

Para evitar confusiones desde el inicio:

- **No es un sistema de notas oficial.** Las calificaciones oficiales del colegio viven en Phidias. Este módulo no las maneja.
- **No es un repositorio de tareas para estudiantes.** Esa función la cumple Google Classroom para los grados que lo usan (hoy 4° y 5°). Ver Anexo A para la integración propuesta.
- **No es un sistema de aprobación formal.** Es conversación pedagógica entre docente y coordinación. No hay estados de "aprobado", "rechazado", "pendiente de revisión". El docente publica cuando quiere; el coordinador comenta cuando quiere; el docente ajusta si lo considera. Todo queda en historial.
- **No es un sistema de reportes complejos.** El MVP entrega vistas básicas para coordinación. Reportes específicos se evalúan en fases posteriores.

---

## 2. Contexto institucional y antecedentes

### 2.1 Ecosistema digital del colegio

| Sistema | Rol institucional |
|---|---|
| **Phidias** | Fuente de verdad de matrículas y notas oficiales. SchoolNet consume datos de estudiantes vía API. |
| **SchoolNet** | Plataforma institucional propia. Alberga procesos administrativos y académicos: RRHH, procedimientos, servicios, presupuesto, asistencia, admisiones, egresados, evaluación de liderazgo, y ahora el módulo de planeación. |
| **Google Workspace** | Entorno de productividad institucional (correo, Drive, Calendar, Meet) adoptado a nivel dominio. |
| **Google Classroom** | Herramienta de entrega de tareas y materiales a estudiantes. Uso parcial: hoy se plantea adopción formal en 4° y 5°. |

El módulo de planeación vive **dentro de SchoolNet**. No es un sistema independiente.

### 2.2 Por qué SchoolNet y no Classroom

La decisión arquitectónica fundamental — discutida y documentada en los documentos de abril 2026 — es que **la planeación institucional debe vivir en SchoolNet**, no en Classroom. Las razones, en orden de peso:

1. **Modelo pedagógico IB.** El planeador PEP es transdisciplinario (cruza varias asignaturas y docentes simultáneamente). Classroom es un contenedor por curso-asignatura: no tiene cómo representar una Unidad de Indagación que vincula Español, Matemáticas y Ciencias en una misma indagación.
2. **Jerarquía de supervisión.** El colegio opera con tres niveles: Coordinador de Programa → Coordinador de Área → Docente. Classroom solo conoce dos roles dentro de un curso (docente y co-docente). Un coordinador de área que necesita ver todas las planeaciones de Matemáticas en Primaria tendría que ser invitado a cada Classroom individualmente. SchoolNet ya modela esta jerarquía con permisos por rol y vistas filtradas.
3. **Consulta histórica institucional.** Classroom archiva cursos individualmente, pero no es una base consultable. Preguntas como "¿cómo se planeó Matemáticas 5° en los últimos tres años?" o "¿qué unidades se hicieron sobre el tema X en Primaria?" son inviables en Classroom.
4. **Coherencia con entidades académicas existentes.** SchoolNet ya modela `academic_areas`, `academic_subjects`, `academic_subject_grades`, `academic_assignments`, `courses`, `grades`, `sections`, `programs`, `academic_years`, `workers`. Esa estructura es el cimiento sobre el cual se construye el módulo. Replicar ese andamiaje dentro de Classroom no es viable, y partirlo entre los dos sistemas genera doble verdad.
5. **Costo de adopción.** Pedirle a todos los docentes que operen su planeación en Classroom cuando solo una parte de los grados realmente usa Classroom implica curva de aprendizaje sin retorno claro para la mayoría.

La integración con Classroom (publicación de sesiones del planeador como `CourseWork` o `CourseWorkMaterial` para 4° y 5°) se trata por separado, como anexo y como fase posterior. Ver [Anexo A](#anexo-a--integración-con-google-classroom).

### 2.3 Versiones previas del documento

| Documento | Fecha | Rol |
|---|---|---|
| `Módulo_de_Planeación_de_Clases v0.1` | Enero 2026 | Recopilación inicial |
| `v0.2` | Enero 2026 | Inclusión de coordinadores de área |
| `v0.3` | Enero 2026 | Corrección sobre recursos existentes en BD |
| `v0.4` | Marzo 2026 | Post primera reunión de levantamiento; detalle PEP |
| `Schoolnet_Clasroom_tecnico.pdf` | Abril 2026 | Posición técnica frente a Classroom |
| `Schoolnet-classroom-estructura.pdf` | Abril 2026 | Posición pedagógica frente a Classroom |
| `SPEC.md` + `schema.sql` (carpeta `schoolnet-planning`) | Mayo 2026 | Modelo conceptual depurado por dirección académica |
| **Este documento (v1.0)** | **Mayo 2026** | **Especificación de desarrollo unificada** |

---

## 3. Roles, permisos y visibilidad

### 3.1 Roles funcionales

| Rol funcional | Quién es | Qué hace en el módulo |
|---|---|---|
| **Docente** | Cualquier `worker` con asignaciones en `academic_assignments` | Crea, edita, duplica y elimina sus propios planeadores. Lee planeadores donde figura como colaborador. Lee planeadores compartidos con su grado/área cuando se habilite la función "ver de otros para inspiración". |
| **Coordinador de Área** | `worker` con permiso `Coordinar área` (o el nombre exacto que se defina en `permissions`) y vinculado a una o más `academic_areas` | Ve todos los planeadores que toquen las áreas de su responsabilidad, en cualquier grado/curso. Edita y deja comentarios. **No aprueba**: es conversación pedagógica. |
| **Coordinador de Programa** | `worker` con permiso `Coordinar programa` y vinculado a uno o más `programs` (PEP, PAI, PD) | Ve todos los planeadores de los grados que pertenecen a su programa, en todas las áreas. Edita y deja comentarios. |
| **Administrador del módulo** | Usuario con permiso `Administrar planeación` | Todo lo anterior + gestión de catálogos (temas transdisciplinarios, conceptos IB, ATL, atributos, etc.). |

**Notas clave:**

- Los roles funcionales del módulo se construyen sobre el sistema de permisos existente de SchoolNet (tabla `permissions`, `roles`, `role_permissions`, `user_roles`). **No se crea un sistema de permisos paralelo.**
- Ambos tipos de coordinadores tienen **los mismos permisos** (ver, editar, comentar). La diferencia está en el **alcance** de lo que ven, no en las acciones que pueden realizar.
- Cuando un planeador colaborativo asocia varias áreas, los coordinadores de cada área involucrada pueden ver y comentar.

### 3.2 Permisos a crear en la tabla `permissions`

Estos son los permisos a insertar en la tabla `permissions` con `permission_module = 'Planeación'`:

| `permission_name` | Descripción | `url_path` |
|---|---|---|
| `Planeación` | Acceso al índice del módulo | `/modules/planning/index.html` |
| `Crear unidad de indagación` | Crear una nueva UI | `/modules/planning/unit-form.html` |
| `Gestionar unidades de indagación` | Listar, editar, duplicar, eliminar UIs propias | `/modules/planning/units.html` |
| `Crear planeador de área` | Crear un nuevo planeador disciplinar | `/modules/planning/planner-form.html` |
| `Gestionar planeadores de área` | Listar, editar, duplicar, eliminar planeadores propios | `/modules/planning/planners.html` |
| `Coordinar planeación de área` | Vista transversal por área disciplinar | `/modules/planning/coordinator-area.html` |
| `Coordinar planeación de programa` | Vista transversal por programa IB | `/modules/planning/coordinator-program.html` |
| `Administrar catálogos de planeación` | Gestionar temas, conceptos, ATL, perfil IB | `/modules/planning/catalogs.html` |

> **Convención:** `permission_module = 'Planeación'` (con tilde, CamelCase español, consistente con otros módulos institucionales como `'Talento Humano'`).

### 3.3 Determinación del rol a partir del usuario

El módulo determina el rol funcional del usuario actual en tiempo de carga, así:

1. **¿Tiene el permiso `Administrar catálogos de planeación`?** → es admin del módulo.
2. **¿Tiene el permiso `Coordinar planeación de programa`?** → es coordinador de programa. El alcance se determina por su asignación a programas IB.
3. **¿Tiene el permiso `Coordinar planeación de área`?** → es coordinador de área. El alcance se determina por su asignación a áreas académicas.
4. **De lo contrario** → es docente. Ve solo sus planeadores y aquellos donde es colaborador.

> **Pendiente operativo (no bloqueante para desarrollo del MVP):** Definir cómo se establece la asignación `worker → academic_area` (para coordinadores de área) y `worker → program` (para coordinadores de programa). Hoy no existe esa relación en BD. Opciones: tablas intermedias `worker_areas`, `worker_programs`; o resolver vía atributos del worker. Esto se cierra antes del desarrollo de las vistas de coordinación, no antes de las vistas de docente.

### 3.4 Resumen de visibilidad

| Vista | Docente | Coord. Área | Coord. Programa | Admin |
|---|---|---|---|---|
| Sus propios planeadores | ✅ | ✅ | ✅ | ✅ |
| Planeadores de docentes a su cargo (área) | ❌ | ✅ (su área) | ❌ | ✅ |
| Planeadores de docentes a su cargo (programa) | ❌ | ❌ | ✅ (su programa) | ✅ |
| Planeadores compartidos como colaborador | ✅ | ✅ | ✅ | ✅ |
| Catálogos (lectura) | ✅ | ✅ | ✅ | ✅ |
| Catálogos (edición) | ❌ | ❌ | ❌ | ✅ |
| Comentar en planeador | ✅ (los suyos) | ✅ | ✅ | ✅ |
| Editar contenido | ✅ (los suyos) | ✅ | ✅ | ✅ |

> **Importante:** "Editar contenido" para coordinadores significa que pueden agregar comentarios, sugerencias, ajustes — no que sean propietarios del planeador. El docente sigue siendo el autor (`created_by`). El historial de cambios deja claro quién hizo qué.

---

## 4. Modelo conceptual

### 4.1 Dos tipos de planeador

El módulo modela dos tipos de planeador con propósitos pedagógicos distintos pero relacionados. En PEP, la distinción es central; en PAI y PD se evaluará durante el levantamiento específico.

#### A. Unidad de Indagación (UI) — Planeador colaborativo

Eje pedagógico del PEP. Es **transdisciplinaria**: varios docentes de distintas áreas trabajan juntos en la misma unidad bajo un tema transdisciplinario IB. Tiene una idea central, conceptos clave, líneas de indagación, atributos del perfil IB, atributos Tilatá, ATL priorizados, acción local/global. Se desarrolla por **ciclos**.

#### B. Planeador de Área — Planeador disciplinar

Planeación individual del docente para su asignatura específica, durante un trimestre, en uno o varios cursos del mismo grado. Puede estar **vinculado opcionalmente** a una UI (cuando la asignatura del docente participa en una unidad transdisciplinaria), o existir de forma independiente. Incluye estándares MEN, objetivos del Alcance y Secuencia, ATL específicos, criterios de evaluación con rúbrica de niveles, diferenciación, recursos. Se desarrolla por **ciclos**.

### 4.2 La vinculación entre los dos

```
┌────────────────────────────────────────────────────────────────┐
│  UNIDAD DE INDAGACIÓN (transdisciplinaria)                     │
│  Tema: "¿Cómo nos expresamos?"                                  │
│  Idea central: ...                                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Ciclo 1 — Sintonización                                 │   │
│  │  Áreas participantes: Lenguaje, Artes                    │   │
│  │  Tipo de conexión: contenido, conceptos                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Ciclo 2 — Indagación                                    │   │
│  │  Áreas participantes: Lenguaje, Artes, Sociales          │   │
│  │  Tipo de conexión: contenido, perfil IB, contexto        │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
         ▲                          ▲                      ▲
         │ vinculación opcional     │                      │
         │                          │                      │
┌────────┴───────────┐  ┌───────────┴────────┐  ┌──────────┴─────────┐
│ PLANEADOR DE ÁREA  │  │ PLANEADOR DE ÁREA  │  │ PLANEADOR DE ÁREA  │
│ Lenguaje 3°        │  │ Artes 3°           │  │ Sociales 3°        │
│ Trimestre 2        │  │ Trimestre 2        │  │ Trimestre 2        │
│ Docente: A         │  │ Docente: B         │  │ Docente: C         │
│ unit_id → UI       │  │ unit_id → UI       │  │ unit_id → UI       │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

**Reglas:**

- La **vinculación se establece desde el planeador de área** (campo `unit_id` nullable que apunta a una UI), no desde la UI.
- Un planeador de área puede estar vinculado a **0 o 1 UI**.
- Una UI puede tener **0, 1 o muchos planeadores de área** vinculados.
- La participación de un área en **cada ciclo de la UI** se modela aparte, en la tabla de "áreas por ciclo de UI", con su tipo de conexión. Esto es independiente del vínculo planeador↔UI: una UI puede tener registrado que Matemáticas participa en su ciclo 3 aunque el planeador de Matemáticas del trimestre aún no esté vinculado.

### 4.3 Estructura por ciclos

El ciclo es la **unidad de planificación**, no la semana. Cada ciclo abarca varios días de clase (típicamente 6) y tiene su propio:

- Fecha de inicio y fin
- Etapa de indagación (en UIs): `sintonizacion`, `indagacion`, `accion`, `reflexion`
- Preguntas orientadoras
- Resultados de aprendizaje esperados
- Experiencias de aprendizaje
- Evaluación formativa (siempre)
- Evaluación sumativa (opcional — solo cuando aplica)
- Recursos
- Reflexión del docente (se llena durante y después del ciclo)

> **Cantidad de ciclos:** No es fija. El docente crea los ciclos que necesite para cubrir la unidad o el trimestre. En PEP la práctica común es entre 4 y 9 ciclos por unidad/trimestre, pero el sistema **no impone un máximo**. Hay un campo `cycles` en `academic_years` que ya define cuántos ciclos institucionales tiene el año académico — el módulo lo respeta como referencia pero no como restricción rígida.

### 4.4 Tipos de conexión entre área y UI

Cuando un área participa en un ciclo de UI, debe declararse **cómo** se conecta. Las opciones son las del marco IB:

| Código interno | Etiqueta visible | Significado |
|---|---|---|
| `contenido` | Contenido | Aporta contenido disciplinar a la indagación |
| `conceptos` | Conceptos | Trabaja los conceptos clave de la UI desde su disciplina |
| `atl` | Habilidades ATL | Desarrolla las habilidades ATL priorizadas en la UI |
| `pedagogia` | Pedagogía | Aplica enfoques pedagógicos coherentes con la UI |
| `perfil_ib` | Perfil IB | Promueve atributos del perfil IB declarados en la UI |
| `contexto` | Contexto | Aporta contexto local/global, casos, ambientes |

Un mismo ciclo puede tener varios tipos de conexión activos simultáneamente (multi-select).

### 4.5 Registro continuo (reflexión del docente)

En la práctica pedagógica del colegio, la reflexión del docente sucede en **tres momentos**:

- **Antes de enseñar** — anticipación, preparación, consideraciones previas. Se llena al inicio del ciclo/trimestre.
- **Durante** — observaciones mientras se enseña. Se actualiza a lo largo del ciclo.
- **Después** — reflexión sobre lo vivido, ajustes para siguiente ciclo. Se llena al cierre.

Estos tres campos están en el **planeador de área** (`reflection_before`, `reflection_during`, `reflection_after`) como reflexión del trimestre. Adicionalmente, **cada ciclo** del planeador de área tiene sus propios campos `cycle_reflection_during` y `cycle_reflection_after` para reflexión más granular por ciclo.

En la UI, la reflexión vive a dos niveles también: por ciclo (`teacher_reflection` por ciclo) y final de unidad (`teacher_reflection`, `student_reflection`, `assessment_reflection`).

---

## 5. Principios de diseño

Estos son los principios que el SPEC original estableció y que se mantienen como **regla de implementación**:

### 5.1 Una sola vez

La información de **contexto** (idea central de la UI, conceptos, ATL, perfil IB, estándares MEN, criterios de evaluación) se **ingresa una sola vez** a nivel padre (UI o planeador de área) y se hereda visualmente en cada ciclo. **Nunca se re-ingresa por ciclo.**

Implementación: en la vista de un ciclo, la información de contexto del padre se muestra en una **banda colapsable** ("Información general de la unidad") arriba del formulario del ciclo. Es solo lectura desde el ciclo; para editarla, el docente va al formulario del padre.

### 5.2 Sin flujos de aprobación

No existen estados `pendiente_revision`, `aprobado`, `rechazado`. Todo es editable en todo momento por su autor. Los coordinadores **comentan**, no aprueban. El docente decide qué incorpora de los comentarios.

### 5.3 Autoguardado

No hay botón "Guardar". El sistema guarda automáticamente:

- **Debounce de 2 segundos** tras la última pulsación de tecla en campos de texto.
- **Al `blur`** (cuando el campo pierde el foco) guarda inmediatamente, cancelando el debounce pendiente.
- **Indicador visual** permanente en algún punto fijo de la vista: `Guardando...` / `Guardado ✓` / `Error al guardar — reintentando`.

El autoguardado escribe **campos individuales**, no el formulario completo: cada `PATCH` a Supabase actualiza solo el campo modificado. Esto reduce conflictos cuando el docente y el coordinador editan simultáneamente.

### 5.4 Ciclos, no semanas

La unidad de planificación es el **ciclo**, no la semana calendario. El sistema modela ciclos con fechas de inicio y fin definidas por el docente. No hay vista "semana del 12 al 16 de mayo"; hay vista "Ciclo 3 — del 12 al 19 de mayo".

### 5.5 Conexión visible

Cada vez que un área participa en un ciclo de UI, debe declarar **cómo** se conecta (los seis tipos de conexión). Esto es lo que alimenta la vista "Áreas vinculadas al PEP" y permite a la coordinación ver de un vistazo qué áreas están tejiendo qué tipos de conexión.

### 5.6 Sin gradientes

Convención de SchoolNet: ningún elemento de UI usa `linear-gradient` o `radial-gradient`. Colores sólidos siempre. Este módulo respeta esa norma.

### 5.7 Acceso desde el sistema de permisos existente

El módulo no implementa su propio sistema de autenticación ni de permisos. Usa `validatePageAccess()` para páginas internas y `cargarPermisosDeModulo() + checkModuleAccess()` para el índice del módulo, ambas funciones ya disponibles en `config.js`.

### 5.8 Vanilla JS + Bootstrap 5

Sin frameworks reactivos (no React, no Vue), sin bundler, sin Node.js. El código se edita directamente en GitHub web editor y se despliega vía push. Las librerías permitidas son las que ya están en `config.js`: Bootstrap 5.3, Bootstrap Icons, Chart.js, jsPDF, Quill (rich text), qrcodejs.

> **Sobre Quill:** los campos largos de reflexión y de líneas de indagación se beneficiarían de un editor rich text. Decisión: **usar Quill** en los campos `central_idea`, `lines_of_inquiry`, `learning_outcomes`, `learning_experiences`, `formative_assessment`, `summative_assessment`, las reflexiones (`reflection_*`, `teacher_reflection`, `student_reflection`, `assessment_reflection`), y `differentiation`. Los campos cortos (títulos, preguntas, recursos) van como `<textarea>` o `<input>` simples.

---

## 6. Modelo de datos

### 6.1 Convenciones generales

Todas las tablas nuevas del módulo siguen las convenciones del esquema existente de SchoolNet:

- **PK**: `uuid NOT NULL DEFAULT gen_random_uuid()`
- **Nombre de PK**: `<entidad>_id` en singular (ej. `unit_id`, `planner_id`, `cycle_id`)
- **Status field**: `<entidad>_status varchar` con `CHECK` enum cuando aplique, default `'active'`
- **Timestamps**: `created_at`, `updated_at` con default `now()` y trigger de actualización
- **RLS**: **DESHABILITADO** en todas las tablas nuevas. Cada `CREATE TABLE` del módulo debe incluir explícitamente `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` para evitar que Supabase lo habilite por defecto. La seguridad se aplica en la capa JS via `validatePageAccess()` y queries con filtros explícitos.
- **Prefijo de tabla**: `pln_` para todas las tablas del módulo (PLaNeación). Esto evita colisiones de nombres y agrupa visualmente las tablas del módulo en el explorador de Supabase. Excepción: las tablas de catálogos IB tienen prefijo doble más descriptivo (ver más abajo).

### 6.2 Diagrama de entidades

```
                    ┌────────────────────────┐
                    │  Catálogos IB          │
                    │  pln_ib_themes         │
                    │  pln_ib_key_concepts   │
                    │  pln_ib_atl_skills     │
                    │  pln_ib_learner_profile│
                    │  pln_tilata_attributes │
                    │  pln_action_types      │
                    │  pln_connection_types  │
                    └────────────────────────┘
                                ▲
                                │ FKs
                                │
       ┌────────────────────────┴──────────────────────────┐
       │                                                    │
       ▼                                                    ▼
┌──────────────────┐                              ┌──────────────────────┐
│ pln_units        │ ◄── 0..N ───┐               │ pln_planners         │
│ (UI)             │             │               │ (Planeador área)     │
└──────┬───────────┘             │               └──────┬───────────────┘
       │ 1                       │ unit_id              │ 1
       │                         │ nullable             │
       │ N                       └──────────────────────┤
       ▼                                                ▼ N
┌──────────────────┐                              ┌──────────────────────┐
│ pln_unit_cycles  │                              │ pln_planner_cycles   │
└──────┬───────────┘                              └──────────────────────┘
       │ 1                                                
       │
       │ N
       ▼
┌──────────────────────┐
│ pln_unit_cycle_areas │
│ (áreas que           │
│ participan en        │
│ ciclo de UI)         │
└──────────────────────┘

Tablas de relación y auxiliares:
  pln_unit_collaborators       (UI ↔ workers)
  pln_unit_key_concepts        (UI ↔ conceptos clave)
  pln_unit_atl_skills          (UI ↔ ATL)
  pln_unit_learner_profile     (UI ↔ atributos perfil IB)
  pln_unit_tilata_attributes   (UI ↔ atributos Tilatá)
  pln_unit_subjects            (UI ↔ asignaturas + descripción)
  pln_unit_grades              (UI ↔ grados)
  pln_unit_action_types        (UI ↔ tipos de acción)
  pln_unit_action_scope        (UI ↔ ámbitos local/global)
  pln_unit_cycle_connections   (ciclo de UI ↔ tipos de conexión)
  pln_planner_atl_skills       (planeador ↔ ATL)
  pln_planner_assessment_criteria  (criterios de evaluación con niveles)
  pln_planner_courses          (planeador ↔ courses — un planeador puede aplicar a varios cursos paralelos)
  pln_comments                 (comentarios sobre cualquier entidad)
```

### 6.3 Decisiones de modelado relevantes

**Por qué arrays vs tablas de relación.**

El SPEC original propone arrays nativos de PostgreSQL (`uuid[]`, `text[]`) para los multi-selects (conceptos, ATL, perfil IB, colaboradores, grados, etc.). Esta especificación adopta **tablas de relación intermedias** (M:N convencional) en lugar de arrays. Razones:

- PostgREST (que es como SchoolNet consume Supabase) tiene mejor soporte para joins explícitos que para arrays con `cs.{}`.
- Las tablas intermedias permiten agregar atributos a la relación (ej: `pln_unit_subjects` necesita un campo `description` por asignatura vinculada — esto sería imposible con un array de UUIDs).
- Es coherente con el resto del esquema de SchoolNet, que ya usa M:N con tablas intermedias (`academic_subject_grades`, `worker_courses`, `user_roles`, etc.).
- Más fácil de auditar con el sistema de auditoría existente.

**Por qué `pln_planner_courses` (un planeador puede tener varios cursos).**

En el v0.4 y el SPEC se menciona la capacidad de "trasladar planeación entre cursos del mismo grado" y de aplicar un mismo planeador a varios cursos paralelos (ej: Matemáticas 5° aplica a 5°A y 5°B). Para modelar esto sin duplicar, el planeador de área se vincula a uno o varios `course_id` vía tabla intermedia. La validación de "todos los cursos del mismo grado" se hace en la capa JS.

**Frozen data.**

Cuando se cierra un año académico, los planeadores quedan **frozen**: el sistema permite consulta pero no edición. Esto es un principio sistémico del proyecto. La implementación es vía bandera derivada del estado del `academic_year` (`year_status = 'closed'`), no vía un campo separado en cada planeador. La capa JS verifica el estado del año en cada operación de escritura.

### 6.4 Scripts SQL — tablas de catálogo

Los scripts SQL se entregarán **al momento de implementación** (en una bitácora separada o como entregable directo). Aquí se documenta la **estructura conceptual**. Cada catálogo debe incluir:

- PK uuid
- Nombre español (`name_es`) y nombre inglés (`name_en`) — el colegio es bilingüe
- `sort_order` para presentación
- `active boolean` (no `status`, por simplicidad en catálogos)
- `created_at`, `updated_at`

Los catálogos a crear son:

| Tabla | Filas iniciales | Editable por admin |
|---|---|---|
| `pln_ib_themes` | 6 (los 6 temas transdisciplinarios del PEP) | Sí, pero rara vez |
| `pln_ib_key_concepts` | 8 (conceptos clave) | Sí |
| `pln_ib_related_concepts` | Texto libre por UI — no es catálogo, se elimina del modelo (ver nota) | — |
| `pln_ib_atl_skills` | ~10 (habilidades ATL agrupadas en 5 categorías) | Sí |
| `pln_ib_learner_profile` | 10 (atributos del perfil IB) | No (estándar IB) |
| `pln_tilata_attributes` | A definir con coordinación | Sí |
| `pln_action_types` | 5 (participación, promoción, justicia social, emprendimiento, estilos de vida) | No (estándar IB) |
| `pln_action_scope` | 2 (local, global) | No |
| `pln_connection_types` | 6 (contenido, conceptos, ATL, pedagogía, perfil IB, contexto) | No |
| `pln_inquiry_stages` | 4 (sintonización, indagación, acción, reflexión) | No |

> **Nota sobre "conceptos adicionales":** el SPEC y el v0.4 manejan dos catálogos separados: conceptos clave (lista cerrada IB) y conceptos adicionales/relacionados (lista propia o texto libre). Decisión: **`pln_ib_key_concepts`** es el catálogo cerrado de 8 conceptos clave IB. Los conceptos adicionales/relacionados se manejan como **texto libre** en el campo `related_concepts` de la UI, no como catálogo. Si más adelante la coordinación define una lista controlada, se promueve a catálogo sin romper el modelo.

### 6.5 Scripts SQL — tablas principales (estructura)

A continuación, la estructura conceptual de cada tabla principal. La sintaxis SQL exacta (`CREATE TABLE ... ALTER TABLE ... DISABLE ROW LEVEL SECURITY ...`) se genera en momento de implementación, no se incluye en este documento de especificación.

#### `pln_units` — Unidad de Indagación

| Campo | Tipo | Notas |
|---|---|---|
| `unit_id` | `uuid PK` | |
| `unit_title` | `varchar NOT NULL` | Título de la unidad |
| `theme_id` | `uuid FK pln_ib_themes` | Tema transdisciplinario |
| `central_idea` | `text` | Idea central (rich text Quill) |
| `lines_of_inquiry` | `text` | Líneas de indagación (rich text) |
| `teacher_questions` | `text` | Preguntas del maestro |
| `student_questions` | `text` | Preguntas del estudiante (se llena durante ciclo 1) |
| `related_concepts` | `text` | Conceptos adicionales en texto libre |
| `tilata_extra_attributes_text` | `text` | Atributos Tilatá descritos en texto libre (complemento al catálogo) |
| `prior_knowledge` | `text` | Conocimientos previos |
| `subject_connections_text` | `text` | Texto narrativo sobre conexiones entre materias (complementa la tabla `pln_unit_subjects`) |
| `differentiation` | `text` | Estrategias de diferenciación a nivel de UI |
| `action_description` | `text` | Descripción de la acción |
| `unit_type` | `varchar CHECK IN ('continua','iterativa')` | |
| `program_id` | `uuid FK programs` | Programa IB al que pertenece (PEP/PAI/PD) |
| `academic_year_id` | `uuid FK academic_years NOT NULL` | Año académico |
| `start_date` | `date` | |
| `end_date` | `date` | |
| `teacher_reflection` | `text` | Reflexión final del maestro |
| `student_reflection` | `text` | Reflexión final de estudiantes |
| `assessment_reflection` | `text` | Reflexión sobre evaluación |
| `created_by` | `uuid FK workers` | Autor principal |
| `unit_status` | `varchar CHECK IN ('active','archived','deleted')` | Default `'active'` |
| `created_at`, `updated_at` | `timestamptz` | |

#### `pln_unit_cycles` — Ciclos de la UI

| Campo | Tipo | Notas |
|---|---|---|
| `cycle_id` | `uuid PK` | |
| `unit_id` | `uuid FK pln_units` | ON DELETE CASCADE |
| `cycle_number` | `integer NOT NULL` | Orden del ciclo dentro de la unidad |
| `inquiry_stage_id` | `uuid FK pln_inquiry_stages` | Etapa de indagación |
| `topic` | `varchar` | Título del ciclo |
| `start_date` | `date` | |
| `end_date` | `date` | |
| `guiding_questions` | `text` | Preguntas orientadoras |
| `learning_outcomes` | `text` | Resultados de aprendizaje |
| `learning_experiences` | `text` | Experiencias de aprendizaje |
| `formative_assessment` | `text` | Evaluación formativa |
| `summative_assessment` | `text` | Evaluación sumativa (nullable) |
| `resources` | `text` | Recursos |
| `differentiation` | `text` | Diferenciación específica del ciclo |
| `student_questions_emerging` | `text` | Preguntas emergentes del estudiante |
| `teacher_reflection` | `text` | Reflexión del maestro al cerrar el ciclo |
| `created_at`, `updated_at` | `timestamptz` | |

> **`status` derivado**: No se almacena `pending`/`active`/`completed`. Se calcula en cliente comparando `start_date`/`end_date` con `getCurrentDateColombia()`.

#### `pln_unit_cycle_areas` — Áreas que participan en un ciclo de UI

| Campo | Tipo | Notas |
|---|---|---|
| `cycle_area_id` | `uuid PK` | |
| `cycle_id` | `uuid FK pln_unit_cycles` | ON DELETE CASCADE |
| `area_id` | `uuid FK academic_areas` | |
| `notes` | `text` | Notas adicionales |
| `created_at` | `timestamptz` | |
| UNIQUE | `(cycle_id, area_id)` | |

Los tipos de conexión van en la tabla intermedia `pln_unit_cycle_connections`:

| Campo | Tipo |
|---|---|
| `cycle_area_id` | `uuid FK pln_unit_cycle_areas` ON DELETE CASCADE |
| `connection_type_id` | `uuid FK pln_connection_types` |
| PK | `(cycle_area_id, connection_type_id)` |

#### `pln_planners` — Planeador de Área

| Campo | Tipo | Notas |
|---|---|---|
| `planner_id` | `uuid PK` | |
| `subject_id` | `uuid FK academic_subjects NOT NULL` | Asignatura |
| `grade_id` | `uuid FK grades NOT NULL` | Grado (los cursos del mismo grado se vinculan vía `pln_planner_courses`) |
| `trimester` | `integer CHECK IN (1,2,3) NOT NULL` | |
| `academic_year_id` | `uuid FK academic_years NOT NULL` | |
| `teacher_id` | `uuid FK workers NOT NULL` | Docente autor |
| `unit_id` | `uuid FK pln_units NULL` | Vínculo opcional a una UI |
| `program_id` | `uuid FK programs` | Programa IB |
| `strand` | `varchar` | Strand curricular (ej. "Numerical Thinking") |
| `learning_objectives` | `text` | Objetivos por strand y unidad |
| `men_standards` | `text` | Estándares MEN vinculados |
| `methodology` | `text` | Enfoque metodológico |
| `differentiation_support` | `text` | Estrategias con apoyo |
| `differentiation_extension` | `text` | Estrategias de extensión |
| `differentiation_materials` | `text` | Materiales de diferenciación |
| `summative_description` | `text` | Evaluación sumativa del trimestre |
| `resources` | `text` | Recursos del trimestre |
| `reflection_before` | `text` | Reflexión antes de enseñar |
| `reflection_during` | `text` | Reflexión durante |
| `reflection_after` | `text` | Reflexión después |
| `student_reflection` | `text` | Síntesis de voces del estudiante |
| `atl_description` | `text` | Descripción narrativa de la actividad ATL |
| `planner_status` | `varchar CHECK IN ('active','archived','deleted')` | |
| `created_at`, `updated_at` | `timestamptz` | |
| UNIQUE | `(teacher_id, subject_id, grade_id, trimester, academic_year_id)` | Un docente solo tiene un planeador por combinación |

> **Nota sobre `connection_types` del planeador con UI**: cuando el planeador se vincula a una UI (`unit_id` no nulo), los tipos de conexión del planeador con la UI se manejan vía tabla intermedia `pln_planner_connections (planner_id, connection_type_id)`.

#### `pln_planner_cycles` — Ciclos del planeador de área

| Campo | Tipo | Notas |
|---|---|---|
| `cycle_id` | `uuid PK` | |
| `planner_id` | `uuid FK pln_planners` | ON DELETE CASCADE |
| `cycle_number` | `integer NOT NULL` | |
| `topic` | `varchar` | |
| `start_date` | `date` | |
| `end_date` | `date` | |
| `session_objectives` | `text` | Objetivos de sesión |
| `learning_experiences` | `text` | Experiencias de aprendizaje |
| `formative_assessment` | `text` | |
| `summative_assessment` | `text` | nullable |
| `resources` | `text` | |
| `cycle_reflection_during` | `text` | Reflexión durante el ciclo |
| `cycle_reflection_after` | `text` | Reflexión después del ciclo |
| `created_at`, `updated_at` | `timestamptz` | |

#### `pln_planner_assessment_criteria` — Criterios de evaluación

| Campo | Tipo |
|---|---|
| `criterion_id` | `uuid PK` |
| `planner_id` | `uuid FK pln_planners` ON DELETE CASCADE |
| `objective_number` | `integer NOT NULL` |
| `objective_label` | `varchar` |
| `level_2` | `text` |
| `level_3` | `text` |
| `level_4` | `text` |
| `level_5` | `text` |
| UNIQUE | `(planner_id, objective_number)` |

> **Niveles de logro:** la escala es de 1 a 5; los niveles 1 (Semilla, en preescolar) y otros usan metáforas botánicas. La estructura del catálogo de niveles es separada y se decidirá en fase posterior cuando se aborde la conexión con Alcance y Secuencia. Por ahora, los textos de nivel 2-5 se almacenan como texto libre en estos campos. **El nivel 1 no se almacena explícitamente**: representa "no logrado" y es el default implícito.

#### `pln_comments` — Comentarios

Comentario unificado para cualquier entidad del módulo. Permite hilo de conversación pedagógica.

| Campo | Tipo | Notas |
|---|---|---|
| `comment_id` | `uuid PK` | |
| `entity_type` | `varchar CHECK IN ('unit','unit_cycle','planner','planner_cycle')` | |
| `entity_id` | `uuid NOT NULL` | ID del registro comentado (sin FK por ser polimórfica) |
| `author_id` | `uuid FK workers NOT NULL` | |
| `comment_body` | `text NOT NULL` | |
| `parent_comment_id` | `uuid FK pln_comments NULL` | Para respuestas anidadas (un nivel) |
| `comment_status` | `varchar CHECK IN ('active','deleted')` | |
| `created_at`, `updated_at` | `timestamptz` | |

#### Tablas de relación (M:N) — resumen

| Tabla | Vincula | Campos extra |
|---|---|---|
| `pln_unit_collaborators` | `pln_units` ↔ `workers` | `is_lead boolean` (autor principal vs colaborador) |
| `pln_unit_key_concepts` | `pln_units` ↔ `pln_ib_key_concepts` | — |
| `pln_unit_atl_skills` | `pln_units` ↔ `pln_ib_atl_skills` | — |
| `pln_unit_learner_profile` | `pln_units` ↔ `pln_ib_learner_profile` | — |
| `pln_unit_tilata_attributes` | `pln_units` ↔ `pln_tilata_attributes` | — |
| `pln_unit_subjects` | `pln_units` ↔ `academic_subjects` | `description text` (cómo conecta esa asignatura) |
| `pln_unit_grades` | `pln_units` ↔ `grades` | — |
| `pln_unit_action_types` | `pln_units` ↔ `pln_action_types` | — |
| `pln_unit_action_scope` | `pln_units` ↔ `pln_action_scope` | — |
| `pln_planner_courses` | `pln_planners` ↔ `courses` | — |
| `pln_planner_atl_skills` | `pln_planners` ↔ `pln_ib_atl_skills` | — |
| `pln_planner_connections` | `pln_planners` ↔ `pln_connection_types` | — |
| `pln_unit_cycle_connections` | `pln_unit_cycle_areas` ↔ `pln_connection_types` | — |

### 6.6 Índices recomendados

Para performance en queries frecuentes:

```
idx_pln_units_year             ON pln_units(academic_year_id)
idx_pln_units_program          ON pln_units(program_id)
idx_pln_units_created_by       ON pln_units(created_by)
idx_pln_unit_cycles_unit       ON pln_unit_cycles(unit_id)
idx_pln_planners_teacher       ON pln_planners(teacher_id)
idx_pln_planners_year          ON pln_planners(academic_year_id)
idx_pln_planners_unit          ON pln_planners(unit_id)
idx_pln_planner_cycles_planner ON pln_planner_cycles(planner_id)
idx_pln_comments_entity        ON pln_comments(entity_type, entity_id)
```

---

## 7. Catálogos parametrizables y seed data

Esta sección documenta el contenido inicial de cada catálogo. Cuando se ejecute el SQL de seed, estos valores son los que se insertan.

### 7.1 `pln_ib_themes` — Temas transdisciplinarios

| `name_es` | `name_en` | `sort_order` |
|---|---|---|
| ¿Quiénes somos? | Who we are | 1 |
| ¿Dónde nos encontramos en el tiempo y el espacio? | Where we are in place and time | 2 |
| ¿Cómo nos expresamos? | How we express ourselves | 3 |
| ¿Cómo funciona el mundo? | How the world works | 4 |
| ¿Cómo nos organizamos? | How we organize ourselves | 5 |
| Cómo compartimos el planeta | Sharing the planet | 6 |

### 7.2 `pln_ib_key_concepts` — Conceptos clave PEP

| `name_es` | `name_en` |
|---|---|
| Forma | Form |
| Función | Function |
| Causalidad | Causation |
| Cambio | Change |
| Conexión | Connection |
| Perspectiva | Perspective |
| Responsabilidad | Responsibility |
| Reflexión | Reflection |

(8 conceptos clave estándar IB)

### 7.3 `pln_ib_atl_skills` — Habilidades ATL

Agrupadas en 5 categorías. El campo `category` agrupa visualmente en la UI:

| Categoría | `name_es` | `name_en` |
|---|---|---|
| Pensamiento | Habilidades de pensamiento crítico | Thinking skills |
| Pensamiento | Habilidades de pensamiento creativo | Creative thinking skills |
| Pensamiento | Habilidades metacognitivas | Transfer skills |
| Comunicación | Habilidades de comunicación | Communication skills |
| Investigación | Habilidades de gestión de información | Information literacy skills |
| Investigación | Habilidades de alfabetización mediática | Media literacy skills |
| Autogestión | Habilidades de organización | Organisation skills |
| Autogestión | Habilidades afectivas | Affective skills |
| Autogestión | Habilidades de reflexión | Reflection skills |
| Colaboración | Habilidades de colaboración | Collaboration skills |

> **Esquema de tabla:** se incluye un campo `category varchar` además de `name_es`/`name_en`.

### 7.4 `pln_ib_learner_profile` — Atributos del perfil IB

10 atributos estándar IB. No editable por admin.

| `name_es` | `name_en` |
|---|---|
| Indagador | Inquirer |
| Instruido | Knowledgeable |
| Pensador | Thinker |
| Comunicador | Communicator |
| Íntegro | Principled |
| De mentalidad abierta | Open-minded |
| Solidario | Caring |
| Audaz | Risk-taker |
| Equilibrado | Balanced |
| Reflexivo | Reflective |

### 7.5 `pln_tilata_attributes` — Atributos propios Tilatá

**Pendiente:** la coordinación académica debe entregar la lista oficial. Hasta tanto, la tabla se crea vacía y el admin la puebla desde la vista de catálogos.

### 7.6 `pln_action_types` — Tipos de acción

| `code` | `name_es` | `name_en` |
|---|---|---|
| `participacion` | Participación | Participation |
| `promocion` | Promoción de causas | Advocacy |
| `justicia_social` | Justicia social | Social justice |
| `emprendimiento` | Emprendimiento | Social entrepreneurship |
| `estilos_vida` | Elecciones sobre el estilo de vida | Lifestyle choices |

### 7.7 `pln_action_scope` — Ámbito de la acción

| `code` | `name_es` | `name_en` |
|---|---|---|
| `local` | Local | Local |
| `global` | Global | Global |

### 7.8 `pln_connection_types` — Tipos de conexión área↔UI

| `code` | `name_es` | `name_en` |
|---|---|---|
| `contenido` | Contenido | Content |
| `conceptos` | Conceptos | Concepts |
| `atl` | Habilidades ATL | ATL skills |
| `pedagogia` | Pedagogía | Pedagogy |
| `perfil_ib` | Perfil IB | IB Learner Profile |
| `contexto` | Contexto | Context |

### 7.9 `pln_inquiry_stages` — Etapas de indagación

| `code` | `name_es` | `name_en` | `sort_order` |
|---|---|---|---|
| `sintonizacion` | Sintonización | Tuning in | 1 |
| `indagacion` | Indagación | Finding out & sorting out | 2 |
| `accion` | Acción | Going further & taking action | 3 |
| `reflexion` | Reflexión | Reflection | 4 |

---

## 8. Especificación campo a campo por entidad

Esta sección detalla, para cada formulario de la aplicación, qué campo se muestra, qué tipo de input usa, qué validaciones aplica y a qué columna de qué tabla mapea. Sirve de referencia para construir los formularios.

### 8.1 Formulario UI — Información general

Sección colapsable al inicio de la vista de UI. Se ingresa una vez al crear la UI; se hereda en cada ciclo.

| Etiqueta visible | Tipo UI | Columna DB | Validación |
|---|---|---|---|
| Título de la unidad | `<input type="text">` | `pln_units.unit_title` | Requerido, max 200 caracteres |
| Año académico | `<select>` | `pln_units.academic_year_id` | Default: `is_current = true` |
| Programa IB | `<select>` | `pln_units.program_id` | Default: PEP |
| Tipo de unidad | Radio | `pln_units.unit_type` | `continua` o `iterativa` |
| Tema transdisciplinario | `<select>` | `pln_units.theme_id` | Requerido (para PEP) |
| Idea central | Quill | `pln_units.central_idea` | — |
| Líneas de indagación | Quill | `pln_units.lines_of_inquiry` | — |
| Preguntas del maestro | `<textarea>` | `pln_units.teacher_questions` | — |
| Preguntas del estudiante | `<textarea>` | `pln_units.student_questions` | — |
| Conocimientos previos | `<textarea>` | `pln_units.prior_knowledge` | — |
| Conceptos clave | Multi-select con chips | M:N `pln_unit_key_concepts` | — |
| Conceptos adicionales | `<input type="text">` | `pln_units.related_concepts` | — |
| Habilidades ATL | Multi-select agrupado por categoría | M:N `pln_unit_atl_skills` | — |
| Atributos del perfil IB | Multi-select con chips | M:N `pln_unit_learner_profile` | — |
| Atributos Tilatá (lista) | Multi-select | M:N `pln_unit_tilata_attributes` | — |
| Atributos Tilatá (texto) | `<textarea>` | `pln_units.tilata_extra_attributes_text` | — |
| Materias vinculadas | Multi-select + descripción por materia | M:N `pln_unit_subjects` con `description` | — |
| Grados | Multi-select | M:N `pln_unit_grades` | Requerido al menos uno |
| Docentes colaboradores | Multi-select de workers | M:N `pln_unit_collaborators` | El autor se agrega automáticamente con `is_lead = true` |
| Fecha de inicio | `<input type="date">` | `pln_units.start_date` | — |
| Fecha de fin | `<input type="date">` | `pln_units.end_date` | >= start_date |
| Diferenciación | Quill | `pln_units.differentiation` | — |
| Tipos de acción | Multi-select | M:N `pln_unit_action_types` | — |
| Ámbito de la acción | Multi-select (max 2: local, global) | M:N `pln_unit_action_scope` | — |
| Descripción de la acción | `<textarea>` | `pln_units.action_description` | — |

### 8.2 Formulario UI — Ciclo

Cada ciclo se edita en una tarjeta expandible dentro de la vista de UI. El docente agrega ciclos uno por uno mediante un botón "Agregar ciclo".

| Etiqueta visible | Tipo UI | Columna DB |
|---|---|---|
| Número de ciclo | Auto-incremental | `pln_unit_cycles.cycle_number` |
| Etapa de indagación | `<select>` | `pln_unit_cycles.inquiry_stage_id` |
| Título del ciclo | `<input type="text">` | `pln_unit_cycles.topic` |
| Fecha inicio | `<input type="date">` | `pln_unit_cycles.start_date` |
| Fecha fin | `<input type="date">` | `pln_unit_cycles.end_date` |
| Estado | (calculado, badge visual) | — |
| Preguntas orientadoras | Quill | `pln_unit_cycles.guiding_questions` |
| Resultados de aprendizaje | Quill | `pln_unit_cycles.learning_outcomes` |
| Experiencias de aprendizaje | Quill | `pln_unit_cycles.learning_experiences` |
| Evaluación formativa | Quill | `pln_unit_cycles.formative_assessment` |
| Evaluación sumativa | Quill (toggleable: aplica o no aplica) | `pln_unit_cycles.summative_assessment` (NULL si no aplica) |
| Recursos | `<textarea>` o Quill | `pln_unit_cycles.resources` |
| Diferenciación específica del ciclo | Quill | `pln_unit_cycles.differentiation` |
| Preguntas emergentes del estudiante | `<textarea>` | `pln_unit_cycles.student_questions_emerging` |
| Áreas que participan en este ciclo | Selector múltiple con tipo de conexión por área | `pln_unit_cycle_areas` + `pln_unit_cycle_connections` |
| Reflexión del maestro | Quill | `pln_unit_cycles.teacher_reflection` |

### 8.3 Formulario UI — Cierre de la unidad

Sección al final de la vista de UI, separada visualmente de los ciclos.

| Etiqueta | Tipo | Columna |
|---|---|---|
| Reflexión del maestro | Quill | `pln_units.teacher_reflection` |
| Reflexión de los estudiantes | Quill | `pln_units.student_reflection` |
| Reflexión sobre la evaluación | Quill | `pln_units.assessment_reflection` |

### 8.4 Formulario Planeador de Área — Encabezado

| Etiqueta | Tipo | Columna DB |
|---|---|---|
| Docente | `<select>` (default: usuario actual) | `pln_planners.teacher_id` |
| Asignatura | `<select>` filtrado por las asignaciones del docente | `pln_planners.subject_id` |
| Grado | `<select>` filtrado por grados donde la asignatura aplica | `pln_planners.grade_id` |
| Trimestre | `<select>` 1/2/3 | `pln_planners.trimester` |
| Año académico | `<select>` | `pln_planners.academic_year_id` |
| Programa | (derivado del grado) | `pln_planners.program_id` |
| Cursos | Multi-select filtrado por grado | M:N `pln_planner_courses` |
| Vincular a una UI | `<select>` opcional | `pln_planners.unit_id` |
| Tipo de conexión con la UI | Multi-select (visible solo si `unit_id` ≠ null) | M:N `pln_planner_connections` |

### 8.5 Formulario Planeador de Área — Marco curricular

| Etiqueta | Tipo | Columna DB |
|---|---|---|
| Strand / Línea curricular | `<input type="text">` | `pln_planners.strand` |
| Objetivos de aprendizaje | Quill | `pln_planners.learning_objectives` |
| Estándares MEN | Quill | `pln_planners.men_standards` |
| Habilidades ATL | Multi-select | M:N `pln_planner_atl_skills` |
| Descripción de la actividad ATL | Quill | `pln_planners.atl_description` |
| Metodología | Quill | `pln_planners.methodology` |
| Diferenciación con apoyo | Quill | `pln_planners.differentiation_support` |
| Diferenciación con extensión | Quill | `pln_planners.differentiation_extension` |
| Materiales de diferenciación | `<input type="text">` | `pln_planners.differentiation_materials` |
| Descripción de evaluación sumativa | Quill | `pln_planners.summative_description` |
| Recursos del trimestre | Quill | `pln_planners.resources` |

### 8.6 Formulario Planeador de Área — Criterios de evaluación

Tabla editable. Una fila por objetivo. Cada fila tiene número, etiqueta y descriptores de niveles 2 a 5.

| Columna visible | Tipo | Columna DB |
|---|---|---|
| # | (auto) | `pln_planner_assessment_criteria.objective_number` |
| Objetivo | `<input type="text">` | `objective_label` |
| Nivel 2 | `<textarea>` | `level_2` |
| Nivel 3 | `<textarea>` | `level_3` |
| Nivel 4 | `<textarea>` | `level_4` |
| Nivel 5 | `<textarea>` | `level_5` |
| (botón eliminar fila) | — | — |

Botón "Agregar objetivo" al final agrega una fila nueva.

### 8.7 Formulario Planeador de Área — Reflexión del trimestre

| Etiqueta | Tipo | Columna |
|---|---|---|
| Reflexión antes de enseñar | Quill | `pln_planners.reflection_before` |
| Reflexión durante | Quill | `pln_planners.reflection_during` |
| Reflexión después | Quill | `pln_planners.reflection_after` |
| Voz del estudiante | Quill | `pln_planners.student_reflection` |

### 8.8 Formulario Planeador de Área — Ciclo

| Etiqueta | Tipo | Columna DB |
|---|---|---|
| Número de ciclo | Auto | `pln_planner_cycles.cycle_number` |
| Tema del ciclo | `<input>` | `topic` |
| Fecha inicio | Date | `start_date` |
| Fecha fin | Date | `end_date` |
| Estado | (calculado) | — |
| Objetivos de sesión | Quill | `session_objectives` |
| Experiencias de aprendizaje | Quill | `learning_experiences` |
| Evaluación formativa | Quill | `formative_assessment` |
| Evaluación sumativa | Quill (toggle) | `summative_assessment` |
| Recursos | `<textarea>` o Quill | `resources` |
| Reflexión durante el ciclo | Quill | `cycle_reflection_during` |
| Reflexión después del ciclo | Quill | `cycle_reflection_after` |

### 8.9 Comentarios

Hilo de comentarios al final de cualquiera de las vistas anteriores. Cada vista tiene su propio hilo según su `entity_type`/`entity_id`.

| Elemento UI | Comportamiento |
|---|---|
| Listado de comentarios | Ordenado cronológicamente ascendente |
| Avatar + nombre del autor | Foto desde `getWorkerPhotoUrl()` |
| Fecha | Formato relativo ("hace 3 horas") o absoluto |
| Botón "Responder" | Crea comentario hijo con `parent_comment_id` |
| Textarea + botón "Comentar" | Crea comentario al nivel del entity actual |
| Botón "Eliminar" (solo autor) | Soft delete: `comment_status = 'deleted'` |

---

## 9. Reglas de negocio

### 9.1 Autoguardado

**Cuándo guarda:**
- `input` o `change` en cualquier campo → debounce 2 segundos → `PATCH`
- `blur` en cualquier campo → guarda inmediatamente (cancela el debounce pendiente)
- `change` en `<select>` o `<input type="date">` → guarda inmediatamente

**Qué guarda:**
- Solo el campo modificado. Cada PATCH actualiza una columna a la vez (o un set pequeño de columnas relacionadas).

**Indicador visual:**
- Componente fijo en la esquina superior derecha del contenido (debajo del navbar), con tres estados:
  - `Todos los cambios guardados` (gris)
  - `Guardando...` (oscuro)
  - `Guardado ✓` (verde Tilatá, 2 segundos, vuelve a "Todos los cambios guardados")
  - `Error al guardar — reintentando` (rojo)

**Manejo de errores:**
- Si un PATCH falla, se reintenta 3 veces con backoff (1s, 2s, 4s).
- Si tras 3 reintentos sigue fallando, se muestra alerta y se almacena el cambio en `localStorage` con clave `planning_pending_changes_<entity>_<id>` para recuperación al recargar.

### 9.2 Estado calculado de un ciclo

El campo `status` de un ciclo **no se almacena**. Se calcula en cliente cada vez que se renderiza:

```
fecha_actual = getCurrentDateColombia()
if start_date == null || end_date == null → status = 'pending'
else if fecha_actual < start_date → status = 'pending'
else if fecha_actual > end_date → status = 'completed'
else → status = 'active'
```

Visualmente:
- `pending` → badge gris
- `active` → badge azul Tilatá (color primario)
- `completed` → badge verde

### 9.3 Duplicar planeador

Botón "Duplicar" en lista de UIs y de planeadores de área. Comportamiento:

1. Se copia el registro padre con todos sus campos.
2. Se copian todas las relaciones M:N (`pln_unit_subjects`, `pln_unit_atl_skills`, etc.).
3. Se copian todos los ciclos hijos.
4. **Se limpian** los campos de reflexión: `teacher_reflection`, `student_reflection`, `assessment_reflection`, `reflection_before`, `reflection_during`, `reflection_after`, `student_reflection`, todas las `teacher_reflection` y `cycle_reflection_*` de los ciclos.
5. **Se limpian** los campos de evaluación final: `student_questions_emerging`.
6. El título recibe el sufijo ` (copia)`.
7. Las fechas **se mantienen**: el docente las ajusta manualmente.
8. El `created_by` / `teacher_id` se setea al usuario que duplica.
9. Si la fuente está en otro año académico, se debe **preguntar al usuario** a qué año académico copiarla (default: año actual).

### 9.4 Vinculación UI ↔ Planeador de Área

- La vinculación se establece desde el planeador de área (campo `unit_id`).
- Un planeador puede vincularse a 0 o 1 UI.
- Cuando se vincula, debe declararse al menos un `connection_type`.
- Si la UI se elimina, el `unit_id` del planeador se setea a NULL (no se elimina el planeador). Usar `ON DELETE SET NULL` en la FK.
- Visualmente, en la vista de UI se muestra una sección "Planeadores de área vinculados" con la lista de planeadores que la referencian.

### 9.5 Cierre anual y traslado

**Cierre:**
- Cuando un `academic_year` cambia a `year_status = 'closed'`, todos los planeadores y UIs de ese año quedan **read-only** (frozen).
- La capa JS verifica `year_status` antes de permitir cualquier escritura. PATCH/POST/DELETE devuelven error si el año está cerrado.
- La consulta sigue funcionando normalmente desde años posteriores.

**Traslado al siguiente año:**
- Vista de administración con opción "Trasladar planeaciones del año X al año Y".
- Por defecto traslada la **estructura** (UIs, planeadores de área, sus ciclos) sin las reflexiones — equivalente a duplicar masivamente.
- El admin puede seleccionar qué planeadores trasladar (no es todo o nada).
- El traslado es **bajo demanda**, no automático al crear el nuevo año.
- Pendiente afinar: ¿se preserva el vínculo UI ↔ planeador? ¿qué pasa con `teacher_id` si el docente ya no está en el colegio? Estas decisiones se cierran al implementar la funcionalidad, no son bloqueantes del MVP.

### 9.6 Permisos en operaciones

Antes de cada operación de escritura, la capa JS verifica:

| Operación | Verificación |
|---|---|
| Crear UI o planeador | El usuario tiene el permiso correspondiente |
| Editar UI | El usuario es `created_by`, está en `pln_unit_collaborators`, o tiene permiso de coordinación con alcance que la incluye |
| Editar planeador | El usuario es `teacher_id`, o tiene permiso de coordinación con alcance que lo incluye |
| Eliminar | Solo `created_by`/`teacher_id` o admin del módulo |
| Comentar | Cualquier usuario que pueda leer la entidad |

### 9.7 Soft delete

Eliminar un planeador/UI no borra el registro: cambia `unit_status` o `planner_status` a `'deleted'`. Las listas filtran por `status = 'active'`. Esto permite recuperación administrativa si fuera necesario.

### 9.8 Notificaciones

Cuando un coordinador deja un comentario sobre el planeador de un docente, se envía notificación por correo al docente vía `sendNotification()` (función existente en `config.js`). El correo incluye:

- Quién comentó
- Sobre qué entidad
- Texto del comentario
- Enlace directo a la vista del planeador con anclaje al comentario

Configuración:
- Las notificaciones se envían **silenciosamente** (parámetro `silent = true`) para no interrumpir al coordinador con confirmación.
- Si el docente está suscrito a digest (futuro: pendiente decidir), el comentario entra al digest diario en lugar de enviarse al instante.

### 9.9 Auditoría

Las tablas principales del módulo (`pln_units`, `pln_planners`, `pln_unit_cycles`, `pln_planner_cycles`, `pln_comments`) se agregan al sistema de auditoría existente (v12.1) para captura automática de INSERT, UPDATE, DELETE. Esto se implementa vía triggers que ya están definidos en la infraestructura de auditoría.

---

## 10. Rutas, vistas y navegación

### 10.1 Estructura de archivos

```
/modules/planning/
├── index.html                      ← Índice del módulo (lista de funciones según permisos)
├── units.html                      ← Lista de Unidades de Indagación del docente
├── unit-form.html                  ← Vista de edición de una UI (incluye ciclos)
├── planners.html                   ← Lista de planeadores de área del docente
├── planner-form.html               ← Vista de edición de un planeador de área (incluye ciclos)
├── coordinator-area.html           ← Vista de coordinador de área (panorámica)
├── coordinator-program.html        ← Vista de coordinador de programa (panorámica)
├── catalogs.html                   ← Gestión de catálogos (solo admin del módulo)
├── assets/
│   ├── planning-shared.js          ← Funciones compartidas (CRUD, autoguardado, render)
│   ├── planning-shared.css         ← Estilos compartidos del módulo
│   ├── unit-form.js                ← Lógica específica de UI form
│   ├── planner-form.js             ← Lógica específica de planeador form
│   └── ...
```

> **Importante:** este módulo respeta la estructura de SchoolNet. Cada `.html` es una página independiente. NO hay SPA con history API, NO hay routing en cliente — la navegación es entre HTML como en el resto del sistema.

### 10.2 `index.html`

Sigue el patrón estándar de SchoolNet (ver `Estructura_unificada_para_Index.txt`). Muestra cards/tiles para cada función disponible al usuario según sus permisos:

- Mis unidades de indagación (link a `units.html`)
- Mis planeadores de área (link a `planners.html`)
- Nueva unidad de indagación (link a `unit-form.html?new=true`)
- Nuevo planeador de área (link a `planner-form.html?new=true`)
- Vista de coordinación de área (link a `coordinator-area.html` — solo si tiene permiso)
- Vista de coordinación de programa (link a `coordinator-program.html` — solo si tiene permiso)
- Catálogos (link a `catalogs.html` — solo admin)

`MODULE_CONFIG`:
```javascript
const MODULE_CONFIG = {
    name: 'Planeación',
    moduleId: 'Planeación',  // Debe coincidir con permission_module en BD
    color: {
        primary: '#1B365D',     // Color primario Tilatá
        secondary: '#378ADD',   // Azul Lenguaje del SPEC original — buena referencia
        light: '#e8f0f9'
    }
};
```

Y en `sidebar.js`, el `MODULE_ITEM_ORDER` para `'Planeación'` debe definirse según el orden visual deseado de las funciones en la barra lateral.

### 10.3 `units.html` — Lista de UIs

Tabla / cards con:

- Filtros: año académico (default: actual), programa, grado, mi rol (autor / colaborador / todos)
- Botón "Nueva unidad de indagación"
- Por cada UI: título, tema, fechas, # de ciclos, estado del ciclo activo (badge), # de planeadores vinculados, botones (Ver/Editar, Duplicar, Eliminar)

Click en una fila → `unit-form.html?unit_id=<uuid>`.

### 10.4 `unit-form.html` — Edición de UI

Layout vertical en una sola página:

1. **Header** con título de la UI, año académico, badge de estado.
2. **Indicador de autoguardado** (fixed top-right).
3. **Banda colapsable "Información general"** — todos los campos de la sección 8.1. Default: expandida en modo edición, colapsada cuando hay ciclos cargados.
4. **Botón "Agregar ciclo"** + lista de ciclos como tarjetas expandibles. Cada tarjeta:
   - Header con `Ciclo N — Etapa — fechas — badge estado`
   - Cuando se expande: formulario completo del ciclo (sección 8.2).
5. **Cierre de unidad** (sección 8.3) — colapsable.
6. **Hilo de comentarios** al final.

Querystring:
- `?new=true` → crea registro vacío y redirige a `?unit_id=<nuevo_uuid>`
- `?unit_id=<uuid>` → carga la UI

### 10.5 `planners.html` y `planner-form.html`

Análogo a UIs:

- `planners.html`: lista de planeadores de área del docente, filtros por año/trimestre/asignatura/grado.
- `planner-form.html`: estructura vertical con encabezado, marco curricular, criterios de evaluación (tabla), reflexión del trimestre, lista de ciclos, comentarios.

### 10.6 `coordinator-area.html` y `coordinator-program.html`

Vistas de coordinación. Listas en formato tabla con filtros:

**Coordinator-area:**
- Filtros: año académico, área (auto-filtrado según asignación del coordinador), grado, trimestre, docente
- Columnas: docente, asignatura, grado, trimestre, # de ciclos, # de comentarios pendientes (sin respuesta), último update
- Click → abre el planeador o UI en modo lectura/comentario

**Coordinator-program:**
- Filtros: año académico, programa (auto-filtrado), grado, área, docente
- Columnas similares

### 10.7 `catalogs.html`

Vista tabular para que el admin del módulo gestione cada catálogo: agregar, editar, marcar inactivo, reordenar. Patrón estándar de SchoolNet.

### 10.8 Breadcrumbs

Patrón estándar SchoolNet (Bootstrap):

```
Dashboard > Planeación > [Mis unidades | Mis planeadores | Coordinación de área | ...]
```

En vistas de edición:

```
Dashboard > Planeación > Mis unidades > [Título de la UI]
```

---

## 11. Alcance del MVP (Fase 1)

### 11.1 Qué entra al MVP

Esta primera entrega cubre el flujo completo del docente para PEP:

1. **Base de datos:** todas las tablas del módulo, todos los catálogos con seed inicial (excepto `pln_tilata_attributes`, que se puebla por admin).
2. **Permisos en BD:** los 8 permisos listados en 3.2.
3. **`config.js`:** módulo agregado a `APP_CONFIG.modules`, `URL_PERMISSIONS` ampliado con las nuevas URLs.
4. **`sidebar.js`:** `MODULE_ITEM_ORDER` definido para `'Planeación'`.
5. **`index.html`** del módulo.
6. **`units.html` + `unit-form.html`:** CRUD completo de UI, incluyendo todos los catálogos M:N, ciclos, áreas por ciclo con tipos de conexión, autoguardado, reflexión final.
7. **`planners.html` + `planner-form.html`:** CRUD completo de planeador de área, incluyendo vínculo opcional con UI, criterios de evaluación, ciclos, reflexión del trimestre, autoguardado.
8. **`coordinator-area.html`:** vista panorámica para coordinador de área (solo lectura + comentarios).
9. **`coordinator-program.html`:** vista panorámica para coordinador de programa (solo lectura + comentarios).
10. **Comentarios** en todas las entidades + notificaciones por correo.
11. **Duplicación** de UIs y planeadores.
12. **Catálogos editables** desde `catalogs.html`.

### 11.2 Qué NO entra al MVP

Estos elementos se difieren a fases posteriores:

- **Levantamiento y desarrollo de PAI y PD.** El modelo está preparado para soportarlos vía `program_id`, pero los formularios específicos se construyen tras el levantamiento pedagógico.
- **Cierre anual automático y traslado masivo entre años.** La estructura está, pero la UI de traslado se construye al final del primer año académico (cuando haya datos reales que trasladar).
- **Integración con Google Classroom** (botón "Publicar en Classroom" en ciclos del planeador disciplinar de 4° y 5°). Ver Anexo A — Fase posterior independiente.
- **Banco de recursos/actividades reutilizables** transversal entre planeadores.
- **Vista "Mi semana"** consolidada de un docente (todas sus clases de la semana en una sola pantalla).
- **Drag-and-drop** para reorganizar ciclos.
- **Réplica selectiva de contenidos planeador disciplinar → UI colaborativa.**
- **Vinculación al Alcance y Secuencia** (catálogo curricular Eje → Subproceso → Objetivo trimestral por asignatura/grado). Hoy se ingresa como texto libre en `learning_objectives`. La integración con el catálogo estructurado se diseña después.
- **Reportes y métricas** para coordinación (porcentaje de avance del trimestre, planeadores sin ciclos cargados, etc.).
- **Comentarios anidados a más de un nivel** (en MVP solo padre + un nivel de respuestas).
- **Realtime de Supabase** para comentarios en vivo. En MVP se refresca al recargar la página.

### 11.3 Orden sugerido de desarrollo

1. **SQL primero (DEV y PROD simultáneamente)** — tablas + catálogos + seeds + permisos.
2. **`config.js` + `sidebar.js`** — registrar módulo y permisos.
3. **`index.html`** — base mínima funcional.
4. **`catalogs.html`** — para que admin pueda poblar `pln_tilata_attributes` antes de que los docentes lo necesiten.
5. **`unit-form.html`** — la entidad más compleja primero. Si esto funciona, lo demás es derivativo.
6. **`units.html`** — lista una vez que el form funciona.
7. **`planner-form.html`** — similar a unit-form pero con menos catálogos.
8. **`planners.html`**.
9. **Comentarios** en ambos forms.
10. **`coordinator-area.html`** y **`coordinator-program.html`** — al final, porque dependen de tener datos reales y de la decisión sobre asignación de coordinadores a áreas/programas.

---

## 12. Pendientes y preguntas abiertas

### 12.1 Alcance PAI y PD

**Estado:** abierto. Decisión funcional pendiente.

**Pregunta:** ¿el levantamiento de PAI y PD se hace antes de empezar el desarrollo o se hace en paralelo, con MVP enfocado solo en PEP y luego extensión?

**Recomendación de Desarrollos:** desarrollar MVP enfocado en PEP completo. Cuando esté en producción y los docentes lo usen, levantar PAI y PD con coordinación. La arquitectura ya está preparada (`program_id` en `pln_units` y `pln_planners`).

### 12.2 Asignación de coordinadores a áreas/programas

**Estado:** abierto, no bloqueante para vistas de docente.

Hoy no existe relación en BD entre `workers` y `academic_areas` o `programs` específica para "coordinador de área X" / "coordinador de programa Y". Opciones:

- Tablas intermedias `pln_area_coordinators (worker_id, area_id)` y `pln_program_coordinators (worker_id, program_id)`.
- Usar `worker_job_roles` con roles específicos como "Coordinador Matemáticas" + tabla de mapeo.

**Recomendación de Desarrollos:** tablas intermedias específicas del módulo (`pln_*`), porque la lógica de coordinación de planeación es propia del módulo y no necesita ser global.

### 12.3 Catálogo Tilatá

**Estado:** pendiente entrega de coordinación.

La lista oficial de "Atributos Tilatá" debe ser entregada por coordinación académica. Hasta entonces, la tabla `pln_tilata_attributes` se crea vacía y los docentes solo pueden usar el campo `tilata_extra_attributes_text` (texto libre).

### 12.4 Relación con Alcance y Secuencia

**Estado:** abierto. Fase posterior.

El Alcance y Secuencia define la jerarquía Eje → Subproceso → Objetivo trimestral por asignatura/grado. En MVP, el campo `learning_objectives` del planeador es texto libre donde el docente puede pegar/parafrasear los objetivos. En fase posterior:

- Crear catálogos `pln_curriculum_axes`, `pln_curriculum_subprocesses`, `pln_curriculum_objectives`.
- Vincular el planeador con objetivos específicos vía tabla intermedia.
- Cargar el Alcance y Secuencia oficial de cada asignatura desde los Excel existentes.

Esto es proyecto en sí mismo. No se mete en MVP.

### 12.5 Niveles de logro y rúbrica

**Estado:** abierto.

Hoy, los niveles 2-5 son texto libre en `pln_planner_assessment_criteria`. La rúbrica institucional (Semilla → Flores y frutos en preescolar, etc.) debe modelarse explícitamente:

- ¿Catálogo de niveles configurable por sección/programa?
- ¿Cómo se vincula con los descriptores del Alcance y Secuencia?

Decisión diferida a la fase de integración con Alcance y Secuencia.

### 12.6 Quill rich text — sanitización

**Estado:** abierto, riesgo de seguridad.

Quill produce HTML que se almacena en columnas `text`. Al renderizar, hay riesgo de XSS si un usuario malicioso (poco probable en este contexto, pero existe) inserta `<script>`. Sanitización con DOMPurify o equivalente al renderizar comentarios y campos rich text.

**Decisión:** se valida la sanitización en revisión de código antes del primer deploy a PROD.

### 12.7 Realtime de comentarios

**Estado:** abierto, mejora post-MVP.

Supabase Realtime permitiría que los comentarios aparezcan sin recargar. En MVP no se implementa porque agrega complejidad. Se evalúa una vez el MVP esté estable.

### 12.8 Vista "Mi semana"

**Estado:** funcionalidad solicitada en v0.4, no en MVP.

Consolidación visual semanal de las clases del docente. Útil pero no crítica para el MVP. Se evalúa en Fase 2.

### 12.9 Cantidad máxima de ciclos

**Estado:** abierto, decisión menor.

El sistema no impone máximo. ¿Conviene poner un límite blando (warning a partir de 12 ciclos) por usabilidad? Decisión durante implementación.

---

## Anexo A — Integración con Google Classroom

> **Importante:** esta integración es una **fase posterior independiente** del MVP. El módulo de planeación se construye, despliega y opera sin Classroom. Cuando la coordinación apruebe formalmente la integración, se aborda como sub-proyecto con su propio levantamiento y cronograma.

### A.1 Resumen de la posición

- SchoolNet es la **fuente de verdad** de la planeación. Todos los docentes planean en SchoolNet.
- Classroom es **canal de salida** para los grados que lo usan pedagógicamente (hoy 4° y 5°).
- La integración es **unidireccional**: SchoolNet → Classroom. SchoolNet no consume de Classroom inicialmente.
- El docente de 4° y 5°, cuando publica una sesión en SchoolNet, tiene un botón "Publicar en Classroom" que la materializa como `CourseWork` o `CourseWorkMaterial`.
- El docente no digita dos veces. Mantiene una sola fuente.

### A.2 Componentes técnicos requeridos

Cuando llegue el momento de implementar:

**Google Cloud:**
- Proyecto en Google Cloud Console asociado al dominio Workspace del colegio.
- OAuth 2.0 Client ID con origin autorizado `schoolnet.colegiotilata.edu.co`.
- Scopes mínimos: `openid`, `email`, `profile`, `https://www.googleapis.com/auth/classroom.courses.readonly`, `https://www.googleapis.com/auth/classroom.coursework.students`.

**Tablas nuevas en Supabase** (las propusiste en el documento técnico de abril):
- `course_classroom_mapping` — vincula `courses.course_id` (SchoolNet) con `classroom_course_id` (Classroom). Incluye `academic_year_id` para mapeo por año.
- `worker_oauth_tokens` — refresh tokens de Google por docente. Estructura: `worker_id`, `provider='google'`, `refresh_token`, `scopes`, `expires_at`.
- `classroom_publications` — bitácora de qué sesión del planeador se publicó en qué `courseWorkId` de Classroom, cuándo, por quién. Permite trazabilidad y eventual re-publicación.

**Endpoints serverless en Vercel:**
- `/api/auth/google/callback` — intercambia authorization code por tokens.
- `/api/classroom/sync-courses` — al login, lista cursos de Classroom del docente y permite mapeo.
- `/api/classroom/publish-session` — recibe un `session_id` (en el contexto de este módulo, sería un `pln_planner_cycle.cycle_id`) y publica como CourseWork.

**UI en SchoolNet:**
- Pantalla de configuración personal del docente: "Conectar mi cuenta de Google".
- Pantalla de mapeo de cursos: cursos SchoolNet del docente ↔ Classrooms existentes.
- Botón "Publicar en Classroom" en cada ciclo del planeador disciplinar de docentes de 4° y 5°.
- Indicador visual de ciclos ya publicados con enlace al CourseWork creado.

### A.3 Decisiones pendientes (ya documentadas)

Sin reproducir todo el contenido del documento técnico de abril, las decisiones que el colegio debe tomar antes de implementar son:

1. ¿Alcance: solo 4° y 5° o todos los grados que usen Classroom?
2. ¿Quién provisiona los Classrooms: docentes manualmente o sistema automáticamente?
3. ¿SchoolNet sincroniza listas de estudiantes hacia Classroom o cada Classroom mantiene su propia lista?
4. ¿Las calificaciones de Classroom se reflejan en SchoolNet o quedan solo informativas?
5. ¿Quién es el contacto técnico de TI autorizado para configurar Google Cloud Console?

Ver documento `Schoolnet_Clasroom_tecnico.pdf` (abril 2026) para el detalle completo.

### A.4 Por qué no afecta este MVP

El módulo de planeación se construye independientemente. La única decisión arquitectónica relevante es **dejar la puerta abierta**:

- Los `cycle_id` de `pln_planner_cycles` son UUID estables que podrán ser referenciados desde la futura tabla `classroom_publications`.
- El modelo de roles del módulo no depende de Google OAuth — usa el sistema de permisos de SchoolNet basado en `users` y `permissions`.
- Si en el futuro se decide login con Google para SchoolNet completo, eso es un cambio del sistema entero, no del módulo de planeación.

---

## Anexo B — Mapeo SPEC original → SchoolNet

Esta tabla documenta las traducciones entre el SPEC original (carpeta `schoolnet-planning`) y la especificación adaptada a SchoolNet. Útil para quien venga del documento original y necesite ubicarse.

### B.1 Diferencias estructurales

| Aspecto | SPEC original | Esta especificación |
|---|---|---|
| Autenticación | Supabase Auth + `auth.users` + `profiles` con `role` | Sistema `users` propio de SchoolNet + `permissions` |
| RLS | Habilitado en todas las tablas | Deshabilitado, seguridad en capa JS |
| IDs | UUID (mantenido) | UUID (mantenido) |
| Multi-selects | Arrays nativos `uuid[]`/`text[]` | Tablas intermedias M:N convencionales |
| Frontend | Vite + ESM + componentes JS clase | Vanilla puro + Bootstrap 5 + páginas HTML |
| Routing | SPA con History API | Páginas HTML independientes |
| Variables de entorno | `import.meta.env.VITE_*` | `config.js` con `APP_CONFIG` |
| Catálogos | `td_themes`, `ib_concepts`, `atl_skills`, `learner_profile`, `subject_areas`, `grade_levels` | `pln_ib_themes`, `pln_ib_key_concepts`, `pln_ib_atl_skills`, `pln_ib_learner_profile` + se reusan `academic_areas` y `grades` existentes de SchoolNet |
| Niveles de grado | Tabla nueva `grade_levels` | Reusa `grades` existente |
| Áreas | Tabla nueva `subject_areas` | Reusa `academic_areas` existente |
| Programa IB | No modelado explícitamente | Reusa `programs` existente, con `program_id` en `pln_units` y `pln_planners` |

### B.2 Mapeo de tablas

| SPEC original | Esta especificación |
|---|---|
| `profiles` | (no aplica — usamos `users` y `workers` de SchoolNet) |
| `units_of_inquiry` | `pln_units` |
| `ui_cycles` | `pln_unit_cycles` |
| `ui_cycle_areas` | `pln_unit_cycle_areas` (+ `pln_unit_cycle_connections` para los tipos) |
| `subject_planners` | `pln_planners` |
| `subject_planner_cycles` | `pln_planner_cycles` |
| `assessment_criteria` | `pln_planner_assessment_criteria` |
| `planner_comments` | `pln_comments` |
| `td_themes` | `pln_ib_themes` |
| `ib_concepts` (type='key') | `pln_ib_key_concepts` |
| `ib_concepts` (type='related') | Eliminado — `related_concepts` como texto libre en `pln_units` |
| `atl_skills` | `pln_ib_atl_skills` |
| `learner_profile` | `pln_ib_learner_profile` |
| `subject_areas` | `academic_areas` (existente de SchoolNet) |
| `grade_levels` | `grades` (existente de SchoolNet) |

### B.3 Campos renombrados

- `title` (en UI) → `unit_title`
- `td_theme_id` → `theme_id`
- `key_concept_ids[]` → tabla `pln_unit_key_concepts`
- `atl_skill_ids[]` → tabla `pln_unit_atl_skills` (en UI) y `pln_planner_atl_skills` (en planeador)
- `learner_profile_ids[]` → tabla `pln_unit_learner_profile`
- `tilata_attributes` (texto único) → tabla `pln_unit_tilata_attributes` (multi-select) + campo `tilata_extra_attributes_text` (texto libre)
- `subject_connections` (texto) → tabla `pln_unit_subjects` (con descripción por asignatura) + campo `subject_connections_text` (texto narrativo)
- `grade_level_ids[]` → tabla `pln_unit_grades`
- `school_year` (texto) → `academic_year_id` (FK a `academic_years`)
- `collaborator_ids[]` → tabla `pln_unit_collaborators` con flag `is_lead`
- `action_types[]` → tabla `pln_unit_action_types`
- `action_scope[]` → tabla `pln_unit_action_scope`
- `inquiry_stage` (varchar enum) → `inquiry_stage_id` (FK a `pln_inquiry_stages`)
- `connection_types[]` → tablas `pln_unit_cycle_connections` / `pln_planner_connections`

### B.4 Campos eliminados

- `status` (`pending`/`active`/`completed`) — se calcula en cliente, no se almacena
- `tilata_attributes` como columna única — reemplazado por tabla M:N + texto libre

### B.5 Campos agregados

- `program_id` en `pln_units` y `pln_planners` — para soportar PEP/PAI/PD
- `parent_comment_id` en `pln_comments` — para hilo de respuestas (un nivel)
- `is_lead` en `pln_unit_collaborators` — distinguir autor principal de colaboradores
- `description` en `pln_unit_subjects` — descripción de cómo cada asignatura vinculada conecta con la UI
- `cycle_reflection_during`, `cycle_reflection_after` en `pln_planner_cycles` — reflexión por ciclo además de la del trimestre

---

## Anexo C — Referencias y glosario

### C.1 Documentos de referencia

Todos disponibles en el proyecto de SchoolNet:

| Documento | Propósito |
|---|---|
| `Módulo_de_Planeación_de_Clases v0.4` (marzo 2026) | Levantamiento funcional. Referencia histórica. |
| `Schoolnet-classroom-estructura.pdf` (abril 2026) | Posición pedagógica frente a Classroom. |
| `Schoolnet_Clasroom_tecnico.pdf` (abril 2026) | Análisis técnico de integración con Classroom. |
| Carpeta `schoolnet-planning/` (mayo 2026) | SPEC + schema + servicios + RLS originales. Referencia conceptual. |
| `Conocimiento_del_proyecto` | Arquitectura general de SchoolNet. |
| `GUIA_CREAR_NUEVOS_MODULOS.md` | Patrón estándar para nuevos módulos. |
| `Template_base_Schoolnet_v4.0.html` | Template HTML estándar de funciones. |
| `Estructura_unificada_para_Index.txt` | Template para índices de módulos. |
| `DataBase` | Esquema actual de la base de datos. |
| `config.js` | Librerías globales, `supabaseRequest`, `validatePageAccess`, etc. |
| `sidebar.js` | Construcción del menú lateral con `MODULE_ITEM_ORDER`. |

### C.2 Documentos pedagógicos del colegio

| Documento | Uso |
|---|---|
| `Plantilla_Planificador_Primaria_2025-2026_actualizado.docx` | Referencia visual del planeador colaborativo PEP. |
| `Formato_Planificador_por_asignatura.docx` | Referencia visual del planeador disciplinar PEP. |
| `ESPANOL_-_ALCANCE_Y_SECUENCIA_2024-2025.xlsx` | Ejemplo de Alcance y Secuencia (uno por asignatura). Insumo para integración futura. |

### C.3 Glosario

| Término | Definición |
|---|---|
| **UI** | Unidad de Indagación — planeador transdisciplinario del PEP. |
| **PEP** | Programa de la Escuela Primaria (PYP en inglés). Cubre Preescolar y Primaria. |
| **PAI** | Programa de los Años Intermedios (MYP). Cubre Escuela Media. |
| **PD** | Programa del Diploma (DP). Cubre Escuela Alta. |
| **IB / OBI** | Bachillerato Internacional / Organización del Bachillerato Internacional. |
| **Ciclo** | Unidad temporal de planificación dentro de una unidad o trimestre. Típicamente 6 días escolares. |
| **ATL** | Approaches to Learning — Enfoques del Aprendizaje IB. |
| **Perfil IB** | Perfil de la Comunidad de Aprendizaje IB (10 atributos). |
| **Tema transdisciplinario** | Uno de los 6 ejes pedagógicos del PEP que enmarca una UI. |
| **Idea central** | Enunciado que sintetiza el sentido de una UI. |
| **Líneas de indagación** | Ejes específicos a través de los cuales se desarrolla la idea central. |
| **Conceptos clave** | Los 8 conceptos del PEP (forma, función, causalidad, cambio, conexión, perspectiva, responsabilidad, reflexión). |
| **Strand** | Componente curricular dentro de una asignatura. |
| **Alcance y Secuencia** | Documento curricular institucional que define Eje → Subproceso → Objetivo trimestral por asignatura y grado. |
| **Trimestre** | Periodo académico. El colegio opera con 3 trimestres por año. |
| **Coordinador de Área** | Responsable pedagógico de una `academic_area` (Matemáticas, Lenguaje, etc.). |
| **Coordinador de Programa** | Responsable pedagógico de un `program` IB (PEP, PAI, PD). |
| **Phidias** | Sistema oficial de matrículas y notas del colegio. Externo a SchoolNet. |
| **Classroom** | Google Classroom. Herramienta de Google para entrega de tareas. Fuera del MVP de planeación. |
| **Frozen data** | Datos en estado de solo lectura por estar vinculados a un año académico cerrado. |
| **RLS** | Row Level Security de PostgreSQL. **Deshabilitado** en SchoolNet. |
| **PATCH** | Operación HTTP de Supabase para actualización parcial de un registro. Usada en autoguardado. |
| **`supabaseRequest()`** | Función global de SchoolNet en `config.js` para llamadas a Supabase REST. |
| **`validatePageAccess()`** | Función global de SchoolNet para verificación de permisos en páginas internas. |
| **`getCurrentDateColombia()`** | Función auxiliar para fecha actual en zona horaria de Colombia. Debe definirse localmente en cada página. |
| **`sendNotification()`** | Función global para envío de correos vía Google Apps Script. |

### C.4 Convenciones de nombres en este módulo

| Convención | Ejemplo | Observación |
|---|---|---|
| Prefijo de tabla del módulo | `pln_*` | Agrupa todas las tablas del módulo |
| Prefijo de catálogo IB | `pln_ib_*` | Catálogos del marco IB |
| Prefijo de catálogo institucional | `pln_tilata_*` | Catálogos propios del colegio |
| PK | `<entidad>_id` | Singular |
| Status | `<entidad>_status` | `active` / `archived` / `deleted` típicamente |
| FK al año académico | `academic_year_id` | Existente en SchoolNet |
| FK a docente/colaborador | `worker_id`, `teacher_id`, `created_by` | Apunta a `workers.worker_id` |

---

## Cierre

Este documento es la referencia única para el desarrollo del módulo. Cualquier desviación durante la implementación debe documentarse en una bitácora de cambios anexa y, si afecta el modelo de datos o las reglas de negocio, debe reflejarse en una nueva versión de este documento.

**Próximos pasos sugeridos:**

1. Revisión de este documento por coordinación académica (validar que la traducción del SPEC original a SchoolNet preserva la intención pedagógica).
2. Aprobación formal del alcance del MVP.
3. Generación del script SQL completo de migración (tablas + catálogos + seeds + permisos).
4. Ejecución del SQL en **DEV primero**, luego en PROD una vez validado.
5. Inicio del desarrollo siguiendo el orden de la sección 11.3.
6. Apertura de una bitácora de desarrollo del módulo (`Bitácora___Módulo_de_Planeación`) en el proyecto para registrar decisiones de implementación.

---

*Documento elaborado por Desarrollos · Mayo 2026 · Versión 1.0*
