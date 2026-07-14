# MÓDULO DE ADMISIONES — SchoolNet

**Documento:** Especificación funcional y técnica del módulo de admisiones
**Versión:** 0.7 — Especificación cerrada
**Fecha de inicio:** Marzo 2026
**Última actualización:** 14 de julio de 2026
**Reemplaza:** v0.6

---

## 0. PROPÓSITO Y ALCANCE DE ESTE DOCUMENTO

Este documento es la **especificación de implementación** del módulo. A diferencia de las versiones 0.1–0.6, que documentaban acuerdos funcionales en construcción, esta versión cierra el modelo de datos con nombres exactos de tablas, campos, tipos y restricciones.

**Decisión de arquitectura general (v0.7):** se hace *borrón y cuenta nueva* sobre las tablas de proceso. El módulo no está en operación productiva y no hay datos que preservar. Los catálogos que sí tienen datos útiles se conservan intactos.

**Quién implementa:** este documento es la entrada para la fase de codificación. Todo nombre de tabla, campo y restricción escrito aquí es literal y debe usarse tal cual. No se deben inventar nombres.

---

## 1. OBJETIVO DEL MÓDULO

Gestionar el proceso completo de atracción y admisión de aspirantes al Colegio Tilatá, desde la llegada de leads por campañas de redes sociales hasta la matrícula, incluyendo validación de leads, inscripción, proceso en línea, revisión financiera, observaciones, comité, notificación, prematrícula y matrícula.

**Fuera de alcance:**
- Integración con PHIDIAS.
- Promoción automática a la tabla `students`. Al cerrar el Paso 11 el aspirante queda en estado `matriculado`; la creación del estudiante es un proceso manual externo a este módulo.
- Pago del proceso de admisión (es externo; la familia sube el comprobante como documento).

---

## 2. CAMBIO ESTRUCTURAL RESPECTO A v0.6

### 2.1 Tabla única de aspirante

**Decisión v0.7:** se elimina la separación entre "Base 1 (contactos depurados)" y "Base de Admisiones". Ambas son **la misma tabla** (`aap_applicants`) en distintos momentos del ciclo de vida.

Razón: admisiones registra familias que llegan por teléfono o presencialmente, y esas familias son las mismas que después llenan el formulario. Mantenerlas en dos tablas obligaba a sincronizar y a convertir. Con una sola tabla, un contacto telefónico y un aspirante inscrito son **el mismo registro en distinto estado**.

**Ciclo de vida (`lifecycle_status`):**

| Estado | Significado |
|---|---|
| `contacto` | Registrado por admisiones (llamada, visita, feria) o promovido desde Base 0 con decisión "Siga". Aún no ha llenado el formulario. |
| `inscrito` | La familia envió el formulario del Paso 1. |
| `en_proceso` | Avanza por los pasos 2 al 11. |
| `desistido` | Terminal. La familia desistió. Causa obligatoria. |
| `no_admitido` | Terminal. Resultado del comité. Razón obligatoria. |
| `aplazado` | Terminal para el año en curso. Resultado "Admitido aplazado". |
| `matriculado` | Terminal. Paso 11 cerrado. |

### 2.2 Eliminación de `aap_web_applications`

El registro histórico de lo que la familia escribió en el Paso 1 se conserva como **snapshot JSONB congelado** (`aap_applicants.step1_submission`), no como tabla espejo. El equipo puede editar los campos normales del aspirante; el snapshot nunca se modifica y sirve como evidencia y para la trazabilidad que pide el Paso 4.

### 2.3 `procedure_instances` sirve tal cual

**Hallazgo verificado contra el esquema:** `procedure_instances.procedure_id` es *nullable* y la tabla tiene su propio `form_id`. El sistema de formularios dinámicos ya soporta el modo *standalone* (formulario sin trámite asociado). Además `instance_status` ya admite `in_progress / completed / cancelled`, que **es** el estado borrador del Paso 4.

**Consecuencia:** no se crean trámites falsos, ni tabla nueva de instancias, ni campo nuevo de borrador. Los pasos 4, 6, 7 y 8 usan `forms` / `form_fields` / `field_option_catalog` / `procedure_instances` / `form_responses` tal como están.

### 2.4 El comité es un tipo de sesión más

**Decisión v0.7:** en lugar de `aap_observation_types` (solo observaciones) + configuración aparte para el comité, se unifica en `aap_session_types`, con un campo `session_category` de tres valores y un flag `invites_family`.

Esto resuelve como **dato** (no como código) la regla de la reunión: la familia se invita automáticamente a las observaciones y no al comité.

### 2.5 Eliminación de `aap_process_states`

El "estado del proceso" deja de ser un catálogo editable. Es un campo cerrado (`lifecycle_status`). El **paso actual** se deriva de `aap_applicant_steps` y no se duplica en la ficha del aspirante.

### 2.6 Razones unificadas

Se conserva `aap_loss_reasons` con `reason_category` de tres valores:

| `reason_category` | Uso |
|---|---|
| `base0_pare` | Razón por la que un lead de redes no continúa. |
| `desistimiento` | Razón por la que una familia desiste en cualquier paso. |
| `no_admision` | Razón de no admisión decidida por el comité. |

Una sola pantalla (`loss-reasons.html`, ya existente) con filtro por categoría. Se elimina `aap_applicant_loss_reasons` (era N:N; el diseño pide una sola causa obligatoria).

---

## 3. INVENTARIO: QUÉ SE CONSERVA, QUÉ SE REHACE, QUÉ SE ELIMINA

### 3.1 Se conservan sin cambios

| Tabla | Página |
|---|---|
| `aap_kindergartens` | `kindergartens.html` |
| `kindergarten_actions` | `kindergarten-actions.html` |
| `aap_fairs` | `fairs.html` |
| `aap_contact_sources` | `contact-sources.html` |
| `aap_referral_types` | `referral-types.html` |
| `grades.age_range_description` | `grade-age-ranges.html` |
| `marketing_campaigns`, `marketing_contact_campaigns` | `upload-campaigns.html` |

### 3.2 Se modifican

| Tabla | Cambio |
|---|---|
| `aap_loss_reasons` | Se normalizan los valores de `reason_category` a los tres definidos en 2.6. |
| `marketing_contacts` | Se agregan columnas de validación y decisión (ver 5.1). |
| `form_fields` | Se agrega `informative_text` al CHECK de `field_type`. Se implementa soporte real a `validation_rules`. |

### 3.3 Se rehacen (DROP + CREATE)

| Tabla | Motivo |
|---|---|
| `aap_applicants` | La estructura actual es un vestigio del CRM anterior: un solo contacto, sin grado, sin Familiar 1/2, sin colegio actual. No sostiene el proceso de 11 pasos. |
| `aap_applicant_steps` | El CHECK de `step_status` no admite "Pendiente" y falta auditoría de quién completó. |
| `aap_process_steps` | Se recargan los 11 pasos definitivos. |

### 3.4 Se eliminan

| Objeto | Motivo |
|---|---|
| `aap_web_applications` | Reemplazada por `aap_applicants` + snapshot JSONB. |
| `aap_web_application_sources` | Reemplazada por `aap_applicant_sources`. |
| `aap_process_states` | Reemplazado por campo cerrado `lifecycle_status`. |
| `aap_applicant_loss_reasons` | Reemplazada por campos de desistimiento en `aap_applicants`. |
| `temp_aspirantes`, `temp_aspirante_eventos` | Datos temporales sin uso. |
| `laurix.html`, `temporal.html`, `process-states.html` | Archivos huérfanos. |
| `form.html`, `form-config.html`, `applicant-steps.html`, `applicants.html` | Se reescriben desde cero (no se parchean). |

---

## 4. VISIÓN GENERAL DEL FLUJO

```
FUENTES DE ENTRADA
├── Redes sociales (CSV) ──> BASE 0 (marketing_contacts)
│                             ├── Validado / No validado
│                             └── Siga / Pare (razón obligatoria si Pare)
│                                  │
│                                  ↓ (solo Siga)
└── Contacto directo (teléfono, presencial, feria, referido, web)
                                   │
                                   ↓
                    aap_applicants  [lifecycle_status = 'contacto']
                                   │
                    (se envía enlace del formulario)
                                   │
                                   ↓
                    PASO 1 — Formulario público de inscripción
                                   │
                    aap_applicants  [lifecycle_status = 'inscrito']
                                   │
                                   ↓
                    aap_applicants  [lifecycle_status = 'en_proceso']

  Paso 2  — Conocer el colegio (experiencias)
  Paso 3  — Correo informativo
  Paso 4  — Proceso en línea (formulario extenso + documentos)
  Paso 5  — Check de admisiones + revisión financiera
  Paso 6  — Observación del aspirante
  Paso 7  — Observación de la familia
  Paso 8  — Comité de admisiones
  Paso 9  — Notificación
  Paso 10 — Prematrícula
  Paso 11 — Matrícula

  Transversales: plantillas de correo · acuerdos financieros ·
                 desistimientos · encuestas · consultas y listados
```

---

## 5. MODELO DE DATOS

> **Regla obligatoria:** todo script que cree tablas debe incluir
> `ALTER TABLE public.<tabla> DISABLE ROW LEVEL SECURITY;`
> explícitamente para cada tabla nueva. Supabase habilita RLS por defecto; SchoolNet la mantiene desactivada en toda la plataforma y resuelve seguridad en la capa JS.

### 5.1 Capa 0 — Base 0: leads de redes sociales

**Modificación a `marketing_contacts`** (sin tablas nuevas):

| Columna | Tipo | Notas |
|---|---|---|
| `validation_status` | varchar NOT NULL DEFAULT `'pendiente'` | CHECK IN (`'pendiente'`, `'validado'`, `'no_validado'`) |
| `lead_decision` | varchar NULL | CHECK IN (`'siga'`, `'pare'`). Solo aplica si `validation_status = 'validado'`. |
| `stop_reason_id` | uuid NULL | FK `aap_loss_reasons(reason_id)`. Obligatorio en la app si `lead_decision = 'pare'`. |
| `stop_notes` | text NULL | Comentario libre opcional. |
| `reviewed_by` | uuid NULL | FK `users(user_id)`. |
| `reviewed_at` | timestamptz NULL | |
| `promoted_applicant_id` | uuid NULL | FK `aap_applicants(applicant_id)`. Se llena al promover con "Siga". |

**Regla:** los `no_validado` y los `pare` se descartan (no avanzan). Los `siga` generan un registro en `aap_applicants` con `lifecycle_status = 'contacto'` y `origin = 'base0'`.

---

### 5.2 Capa 1 — `aap_applicants` (Base de Admisiones)

```
applicant_id                  uuid PK DEFAULT gen_random_uuid()

-- Ciclo de vida y origen
lifecycle_status              varchar NOT NULL DEFAULT 'contacto'
                              CHECK IN ('contacto','inscrito','en_proceso',
                                        'desistido','no_admitido','aplazado','matriculado')
origin                        varchar NOT NULL
                              CHECK IN ('base0','directo','formulario')
lead_contact_id               uuid NULL     FK marketing_contacts(contact_id)

-- Aspirante
applicant_first_name          varchar NOT NULL      -- nombres
applicant_last_name_1         varchar NULL          -- primer apellido
applicant_last_name_2         varchar NULL          -- segundo apellido
applicant_birthdate           date NULL
                              CHECK (applicant_birthdate <= CURRENT_DATE)
target_grade_id               uuid NULL     FK grades(grade_id)
target_academic_year_id       uuid NULL     FK academic_years(year_id)
current_school                varchar NULL          -- jardín / colegio actual (texto libre)
current_grade_text            varchar NULL          -- curso actual (texto libre)
current_school_calendar       varchar NULL
                              CHECK IN ('Calendario A','Calendario B','Otro','No aplica')
current_school_total_grades   varchar NULL
                              CHECK IN ('11','12','No aplica')
change_reason                 text NULL
has_sibling_in_tilata         boolean NULL

-- Familiar 1
familiar1_relationship        varchar NULL          -- 'Mamá' | 'Papá'
familiar1_full_name           varchar NULL
familiar1_phone               varchar NULL
familiar1_email               varchar NULL

-- Familiar 2
familiar2_relationship        varchar NULL          -- 'Mamá' | 'Papá' | 'Otro'
familiar2_full_name           varchar NULL
familiar2_phone               varchar NULL
familiar2_email               varchar NULL

-- Referido y fuentes
is_referred                   boolean NULL
referral_type_id              uuid NULL     FK aap_referral_types(referral_type_id)
referral_person_name          varchar NULL
main_source_id                uuid NULL     FK aap_contact_sources(source_id)
                              -- "medio de mayor influencia" (selección única)
kindergarten_id               uuid NULL     FK aap_kindergartens(kindergarten_id)
fair_id                       uuid NULL     FK aap_fairs(fair_id)

-- Paso 1
access_token                  varchar NULL UNIQUE
data_consent                  boolean NOT NULL DEFAULT false
step1_submitted_at            timestamptz NULL
step1_submission              jsonb NULL            -- snapshot congelado, nunca se edita

-- Paso 4
step4_started_at              timestamptz NULL
step4_submitted_at            timestamptz NULL
step4_instance_id             integer NULL  FK procedure_instances(instance_id)

-- Desistimiento
withdrawn_at                  timestamptz NULL
withdrawn_step_id             uuid NULL     FK aap_process_steps(step_id)
withdrawn_reason_id           uuid NULL     FK aap_loss_reasons(reason_id)
withdrawn_destination_school  varchar NULL
withdrawn_notes               text NULL
withdrawn_by                  uuid NULL     FK users(user_id)

-- No admisión
not_admitted_reason_id        uuid NULL     FK aap_loss_reasons(reason_id)

-- General
general_notes                 text NULL
created_by                    uuid NULL     FK users(user_id)   -- NULL si vino del formulario público
created_at                    timestamptz DEFAULT now()
updated_at                    timestamptz DEFAULT now()
```

**Notas de implementación:**
- `applicant_last_name_1` es *nullable* porque un lead de redes puede llegar solo con el nombre del niño. La app exige apellido al pasar a `inscrito`.
- El nombre del aspirante va **separado** (nombres / apellido 1 / apellido 2) porque se usa para ordenar y buscar listados. El nombre de los familiares va como **texto completo** porque son datos de contacto, no registros ordenables.
- `access_token`: generado con `crypto.randomUUID()` en el cliente al enviar el formulario o al enviar el enlace desde la ficha.

**`aap_applicant_sources`** — medios por los que la familia conoció el colegio (multi-selección):

```
applicant_id   uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
source_id      uuid NOT NULL  FK aap_contact_sources(source_id)
created_at     timestamptz DEFAULT now()
PRIMARY KEY (applicant_id, source_id)
```

---

### 5.3 Capa 2 — Pasos del proceso

**`aap_process_steps`** (estructura actual, se conserva; se recargan los datos):

Los 11 pasos, en orden:

| `step_order` | `step_name` |
|---|---|
| 1 | Inscripción |
| 2 | Conocer el colegio |
| 3 | Correo informativo |
| 4 | Proceso en línea |
| 5 | Check y revisión financiera |
| 6 | Observación del aspirante |
| 7 | Observación de la familia |
| 8 | Comité de admisiones |
| 9 | Notificación |
| 10 | Prematrícula |
| 11 | Matrícula |

**`aap_applicant_steps`** (rehecha):

```
applicant_id          uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
step_id               uuid NOT NULL  FK aap_process_steps(step_id)
step_status           varchar NOT NULL DEFAULT 'Pendiente'
                      CHECK IN ('Pendiente','En progreso','Completado','No aplica')
step_completion_date  date NULL
completed_by          uuid NULL      FK users(user_id)
step_notes            text NULL
created_at            timestamptz DEFAULT now()
updated_at            timestamptz DEFAULT now()
PRIMARY KEY (applicant_id, step_id)
```

**Regla clave:** esta tabla guarda el **estado agregado** de cada paso, una fila por paso. Las **ocurrencias múltiples** (varias jornadas de observación, varios comités, varias experiencias) viven en sus tablas propias (`aap_sessions`, `aap_applicant_experiences`). No se duplica información.

Se elimina `step_result` (el resultado del comité vive en `aap_committee_results`).

---

### 5.4 Capa 3 — Configuración

**`aap_module_config`** — fila única.

```
config_id                        uuid PK DEFAULT gen_random_uuid()

-- Paso 1 (formulario público)
form_is_open                     boolean NOT NULL DEFAULT true
form_intro_text                  text NULL
form_data_policy_text            text NULL       -- aceptación ligera
form_rejection_message           text NULL       -- si no acepta la política
form_closed_message              text NULL
form_confirmation_message        text NULL

-- Paso 4
step4_form_id                    integer NULL  FK forms(form_id)
step4_habeas_data_text           text NULL
step4_credit_bureau_text         text NULL
step4_authorization_block_message text NULL

-- Paso 9
notification_role_id             uuid NULL     FK roles(role_id)

updated_by                       uuid NULL     FK users(user_id)
updated_at                       timestamptz DEFAULT now()
```

> **Nota PostgREST:** los PATCH sobre esta tabla deben llevar filtro (p. ej. `?config_id=not.is.null`). El modo seguro rechaza PATCH/DELETE sin WHERE.

**`aap_form_available_years`** — años académicos habilitados en el formulario del Paso 1.

```
year_id        uuid PK   FK academic_years(year_id)
display_order  integer NULL
is_active      boolean NOT NULL DEFAULT true
created_at     timestamptz DEFAULT now()
```

---

### 5.5 Capa 4 — Paso 2: experiencias

**`aap_experience_types`** — catálogo de modalidades (Entretilateños, Charla presencial, Charla virtual, Recorrido, Cita personalizada).

```
experience_type_id  uuid PK DEFAULT gen_random_uuid()
type_name           varchar NOT NULL UNIQUE
type_description    text NULL
type_order          integer NULL
is_active           boolean NOT NULL DEFAULT true
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

**`aap_experience_events`** — convocatorias con fecha. *Resuelve la decisión pendiente "estructura de fechas para modalidades del Paso 2".*

```
event_id                 uuid PK DEFAULT gen_random_uuid()
experience_type_id       uuid NOT NULL  FK aap_experience_types(experience_type_id)
event_date               date NOT NULL
event_time               time NULL
event_location           varchar NULL
capacity                 integer NULL
responsible_worker_id    uuid NULL      FK workers(worker_id)
event_status             varchar NOT NULL DEFAULT 'Programada'
                         CHECK IN ('Programada','Realizada','Cancelada')
is_open_for_registration boolean NOT NULL DEFAULT true
notes                    text NULL
created_at               timestamptz DEFAULT now()
updated_at               timestamptz DEFAULT now()
```

**`aap_applicant_experiences`** — inscripción y asistencia.

```
applicant_experience_id  uuid PK DEFAULT gen_random_uuid()
applicant_id             uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
event_id                 uuid NOT NULL  FK aap_experience_events(event_id)
registered_at            timestamptz DEFAULT now()
attended                 boolean NULL
comments                 text NULL
created_by               uuid NULL      FK users(user_id)
UNIQUE (applicant_id, event_id)
```

**Integración con el Paso 1:** el campo "Inscripción a experiencia" del formulario público lee de `aap_experience_events` donde `is_open_for_registration = true` y `event_date >= CURRENT_DATE`.

---

### 5.6 Capa 5 — Paso 4: proceso en línea

**Respuestas del formulario:** viven en `forms` / `form_fields` / `field_option_catalog` / `procedure_instances` / `form_responses`. La instancia se crea con `procedure_id = NULL` y `form_id = aap_module_config.step4_form_id`. El borrador es `instance_status = 'in_progress'`; el envío final es `instance_status = 'completed'` + `aap_applicants.step4_submitted_at`.

**Modificaciones necesarias a `form_fields`:**

1. Agregar `informative_text` al CHECK de `field_type`:

```sql
ALTER TABLE public.form_fields DROP CONSTRAINT form_fields_field_type_check;
ALTER TABLE public.form_fields ADD CONSTRAINT form_fields_field_type_check
CHECK (field_type::text = ANY (ARRAY[
  'text','textarea','number','date','select','file','boolean',
  'system_table','radio','checkbox','informative_text'
]::text[]));
```

2. **Soporte real a `validation_rules`** (columna jsonb ya existe, hoy sin uso). Esquema acordado:

```json
{ "exact_count": 3 }
{ "min_count": 1, "max_count": 5 }
```

Aplica a campos `checkbox`. La validación se implementa en el frontend del formulario (no hay backend propio). Uso concreto: la pregunta de declaraciones sobre valores (Módulo 3, pregunta 7) exige exactamente 3 opciones.

**Catálogo de documentos:**

```
aap_required_documents
  document_id            uuid PK DEFAULT gen_random_uuid()
  document_name          varchar NOT NULL UNIQUE
  document_description   text NULL     -- aquí van monto e instrucciones del recibo de pago
  obligation_type        varchar NOT NULL
                         CHECK IN ('required','required_deferred','optional')
  responsible_worker_id  uuid NULL     FK workers(worker_id)
  document_order         integer NULL
  is_active              boolean NOT NULL DEFAULT true
  created_at             timestamptz DEFAULT now()
  updated_at             timestamptz DEFAULT now()
```

| `obligation_type` | Comportamiento |
|---|---|
| `required` | Bloquea el envío final del Paso 4. |
| `required_deferred` | No bloquea el Paso 4, pero bloquea el Paso 10 (Prematrícula). |
| `optional` | No bloquea nada. |

Por defecto son `required_deferred`: paz y salvo y último reporte del colegio anterior.

```
aap_required_document_grades
  document_id  uuid NOT NULL  FK aap_required_documents(document_id) ON DELETE CASCADE
  grade_id     uuid NOT NULL  FK grades(grade_id)
  PRIMARY KEY (document_id, grade_id)
```

```
aap_applicant_documents
  applicant_document_id     uuid PK DEFAULT gen_random_uuid()
  applicant_id              uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
  document_id               uuid NULL      FK aap_required_documents(document_id)
                                           -- NULL = documento libre no catalogado
  free_document_name        varchar NULL   -- nombre dado por quien sube, si document_id es NULL
  file_name                 varchar NOT NULL
  file_path                 varchar NOT NULL
  file_size                 integer NULL
  mime_type                 varchar NULL
  uploaded_at               timestamptz DEFAULT now()
  uploaded_by_family        boolean NOT NULL DEFAULT true
  uploaded_by               uuid NULL      FK users(user_id)   -- NULL si lo subió la familia
  is_post_final_submission  boolean NOT NULL DEFAULT false
  notes                     text NULL
```

**Supabase Storage:**
- Bucket: `admissions-documents`, público, con las políticas RLS del anon key según `GUIA_SUPABASE_STORAGE_SIN_AUTH.md`.
- Ruta: `{applicant_id}/{timestamp}_{nombre_archivo_sanitizado}`.
- Captura desde cámara: `<input type="file" accept="image/*" capture="environment">`.

**Mecánica del Paso 4:**

```
(Familia abre enlace)     → step4_started_at
(Avanza de módulo)        → guarda borrador (instance_status = 'in_progress')
(Sube documento)          → notifica al responsable interno del documento
(Módulo de documentos)    → valida que todos los 'required' estén cargados
(Envío final)             → step4_submitted_at
                          → instance_status = 'completed'
                          → notifica a administradores
                          → bloquea edición de información
                          → bloquea borrado de documentos previos
                          → permite agregar 'required_deferred' y 'optional'
                             (is_post_final_submission = true)
```

---

### 5.7 Capa 6 — Paso 5: check y revisión financiera

El **check de admisiones** es una fila en `aap_applicant_steps` (paso 5). No requiere tabla propia. Solo se puede marcar después de `step4_submitted_at`.

La **revisión financiera** es independiente del check y puede registrarse en cualquier momento desde el envío final del Paso 4. Se conserva historial completo.

```
aap_financial_reviews
  review_id     uuid PK DEFAULT gen_random_uuid()
  applicant_id  uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
  review_light  varchar NOT NULL CHECK IN ('verde','amarillo','rojo')
  review_notes  text NULL
  reviewed_by   uuid NOT NULL  FK users(user_id)
  reviewed_at   timestamptz DEFAULT now()
```

La revisión **vigente** es la de `reviewed_at` más reciente (no se usa flag `is_current`). Se muestra en la ficha del aspirante y se presenta al comité en el Paso 8.

**Acuerdos financieros (transversal, abribles en cualquier momento):**

```
aap_financial_agreements
  agreement_id         uuid PK DEFAULT gen_random_uuid()
  applicant_id         uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
  opened_at            timestamptz DEFAULT now()
  opened_by            uuid NULL      FK users(user_id)
  opened_at_step_id    uuid NULL      FK aap_process_steps(step_id)  -- captura automática
  request_description  text NOT NULL
  agreement_status     varchar NOT NULL DEFAULT 'Abierta'
                       CHECK IN ('Abierta','En revisión','Cerrada aprobada',
                                 'Cerrada rechazada','Cerrada retirada')
  response_notes       text NULL
  closed_at            timestamptz NULL
  closed_by            uuid NULL      FK users(user_id)
  created_at           timestamptz DEFAULT now()
  updated_at           timestamptz DEFAULT now()
```

Un aspirante puede tener varias solicitudes a lo largo del proceso. Trazabilidad completa por auditoría.

---

### 5.8 Capa 7 — Pasos 6, 7 y 8: motor de sesiones

Las tres clases de reunión (observación del aspirante, observación de la familia, comité) comparten **un solo motor**. La diferencia es el `session_category` y el flag `invites_family`.

**`aap_session_types`** — catálogo de tipos.

```
session_type_id   uuid PK DEFAULT gen_random_uuid()
type_name         varchar NOT NULL UNIQUE
session_category  varchar NOT NULL
                  CHECK IN ('observacion_aspirante','observacion_familia','comite')
form_id           integer NOT NULL  FK forms(form_id)
invites_family    boolean NOT NULL DEFAULT false
type_order        integer NULL
is_active         boolean NOT NULL DEFAULT true
created_at        timestamptz DEFAULT now()
updated_at        timestamptz DEFAULT now()
```

**Reglas de negocio:**
- Los tipos con categoría `observacion_*` llevan `invites_family = true`.
- La categoría `comite` tiene **un solo tipo** con `invites_family = false` y un único formulario dinámico.
- Ejemplos de tipos de observación: "Observación de aspirante por EAE", "Observación de aspirante por Dirección de sección", "Observación de familia por EAE", "Observación de familia por Rectoría".

**`aap_session_type_roles`** — roles autorizados a diligenciar cada tipo.

```
session_type_id  uuid NOT NULL  FK aap_session_types(session_type_id) ON DELETE CASCADE
role_id          uuid NOT NULL  FK roles(role_id)
created_at       timestamptz DEFAULT now()
PRIMARY KEY (session_type_id, role_id)
```

**`aap_sessions`** — jornadas agendadas.

```
session_id        uuid PK DEFAULT gen_random_uuid()
applicant_id      uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
session_category  varchar NOT NULL
                  CHECK IN ('observacion_aspirante','observacion_familia','comite')
session_title     varchar NOT NULL
session_date      date NOT NULL
session_time      time NULL
session_status    varchar NOT NULL DEFAULT 'Agendada'
                  CHECK IN ('Agendada','Realizada','Cancelada')
session_notes     text NULL
scheduled_by      uuid NULL  FK users(user_id)
created_at        timestamptz DEFAULT now()
updated_at        timestamptz DEFAULT now()
```

Un aspirante puede tener múltiples sesiones de cualquier categoría.

**`aap_session_invitees`** — invitados. **Para las tres categorías, los trabajadores se eligen del listado de `workers`.** La familia se agrega automáticamente si la categoría es de observación.

```
invitee_id  uuid PK DEFAULT gen_random_uuid()
session_id  uuid NOT NULL  FK aap_sessions(session_id) ON DELETE CASCADE
worker_id   uuid NULL      FK workers(worker_id)
is_family   boolean NOT NULL DEFAULT false
attended    boolean NULL
created_at  timestamptz DEFAULT now()
CHECK ((worker_id IS NOT NULL AND is_family = false)
    OR (worker_id IS NULL     AND is_family = true))
```

**`aap_session_forms`** — diligenciamientos dentro de una jornada. Una jornada puede tener uno o varios.

```
session_form_id        uuid PK DEFAULT gen_random_uuid()
session_id             uuid NOT NULL  FK aap_sessions(session_id) ON DELETE CASCADE
session_type_id        uuid NOT NULL  FK aap_session_types(session_type_id)
responsible_worker_id  uuid NOT NULL  FK workers(worker_id)
instance_id            integer NULL   FK procedure_instances(instance_id)
form_status            varchar NOT NULL DEFAULT 'Borrador'
                       CHECK IN ('Borrador','Completado')
completed_at           timestamptz NULL
created_by             uuid NULL      FK users(user_id)
created_at             timestamptz DEFAULT now()
updated_at             timestamptz DEFAULT now()
```

**Separación conceptual:** el *tipo* define qué se pregunta y quién puede responder. La *sesión* define cuándo y quiénes participan. El *diligenciamiento* define quién responde y qué respondió.

**`aap_committee_result_types`** — catálogo cerrado de 6.

```
result_type_id     uuid PK DEFAULT gen_random_uuid()
result_code        varchar NOT NULL UNIQUE
                   CHECK IN ('admitido','admitido_compromiso','admitido_anticipado',
                             'admitido_aplazado','segunda_observacion','no_admitido')
result_name        varchar NOT NULL UNIQUE
allows_enrollment  boolean NOT NULL DEFAULT false   -- habilita pasos 10 y 11
result_order       integer NULL
is_active          boolean NOT NULL DEFAULT true
```

Datos iniciales:

| # | `result_code` | `result_name` | `allows_enrollment` | Rumbo |
|---|---|---|---|---|
| 1 | `admitido` | Admitido | `true` | Prematrícula o matrícula |
| 2 | `admitido_compromiso` | Admitido con compromiso | `true` | Prematrícula o matrícula, con compromiso documentado |
| 3 | `admitido_anticipado` | Admitido anticipado | `true` | Prematrícula o matrícula |
| 4 | `admitido_aplazado` | Admitido aplazado | `false` | Aplazado a año posterior → `lifecycle_status = 'aplazado'` |
| 5 | `segunda_observacion` | Segunda observación | `false` | Vuelve a Paso 6 o 7 para nueva ronda |
| 6 | `no_admitido` | No admitido | `false` | Fin del proceso → `lifecycle_status = 'no_admitido'` |

**`aap_committee_results`** — resultado por sesión de comité.

```
committee_result_id        uuid PK DEFAULT gen_random_uuid()
session_id                 uuid NOT NULL  FK aap_sessions(session_id)
applicant_id               uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
result_type_id             uuid NOT NULL  FK aap_committee_result_types(result_type_id)
commitment_notes           text NULL      -- si result_code = 'admitido_compromiso'
deferred_academic_year_id  uuid NULL      FK academic_years(year_id)
                                          -- si result_code = 'admitido_aplazado'
not_admitted_reason_id     uuid NULL      FK aap_loss_reasons(reason_id)
                                          -- si result_code = 'no_admitido' (categoría 'no_admision')
result_notes               text NULL
decided_at                 timestamptz DEFAULT now()
decided_by                 uuid NULL      FK users(user_id)
created_at                 timestamptz DEFAULT now()
updated_at                 timestamptz DEFAULT now()
```

Un aspirante puede pasar por múltiples comités. El resultado **vigente** es el de `decided_at` más reciente.

---

### 5.9 Capa 8 — Transversales

**`aap_email_templates`** — sistema centralizado de plantillas.

```
template_key         varchar NOT NULL UNIQUE   -- identificador estable usado por el código
template_id          uuid PK DEFAULT gen_random_uuid()
template_name        varchar NOT NULL
step_id              uuid NULL      FK aap_process_steps(step_id)
subject              varchar NOT NULL
body_html            text NOT NULL
send_type            varchar NOT NULL CHECK IN ('automatico','manual')
available_variables  text NULL      -- documentación de las variables usables
is_active            boolean NOT NULL DEFAULT true
created_at           timestamptz DEFAULT now()
updated_at           timestamptz DEFAULT now()
```

Plantillas iniciales (`template_key`):

| `template_key` | Paso | Envío |
|---|---|---|
| `inscripcion_confirmacion` | 1 | Automático (incluye token) |
| `token_reenvio_familia` | 1 | Automático |
| `token_reenvio_admin` | 1 | Manual |
| `contacto_enlace_formulario` | — | Manual (desde la ficha en estado `contacto`) |
| `paso3_informativo` | 3 | Manual |
| `paso4_invitacion` | 4 | Manual |
| `paso4_documento_subido` | 4 | Automático (al responsable interno) |
| `paso4_envio_final` | 4 | Automático (a administradores) |
| `sesion_invitacion_familia` | 6 / 7 | Automático |
| `paso9_notificacion_resultado` | 9 | Manual |
| `encuesta_desistimiento` | — | Automático (opcional) |

**Variables dinámicas:** sintaxis `{{variable}}`. Conjunto disponible: `{{nombre_aspirante}}`, `{{grado}}`, `{{año_academico}}`, `{{nombre_familiar1}}`, `{{token_url}}`, `{{resultado_comite}}`, `{{lista_documentos_pendientes}}`. Editor: Quill 1.3.7, con `clipboard.dangerouslyPasteHTML()` para cargar HTML y filtro `source === 'user'` en `text-change` para no autoguardar durante la hidratación.

**Envío:** todos los correos salen por `sendNotification(to, subject, htmlContent, silent)` de `config.js` (Google Apps Script).

**`aap_email_log`** — historial. **El Paso 9 (Notificación) se registra aquí, no en tabla aparte.**

```
log_id                 uuid PK DEFAULT gen_random_uuid()
template_id            uuid NULL  FK aap_email_templates(template_id)
applicant_id           uuid NULL  FK aap_applicants(applicant_id) ON DELETE SET NULL
recipient_email        varchar NOT NULL
subject                varchar NULL
sent_at                timestamptz DEFAULT now()
send_status            varchar NOT NULL DEFAULT 'enviado'
                       CHECK IN ('enviado','fallido')
error_message          text NULL
triggered_by           uuid NULL  FK users(user_id)   -- NULL si fue automático
related_result_type_id uuid NULL  FK aap_committee_result_types(result_type_id)
                                  -- solo para el Paso 9: qué resultado se notificó
notes                  text NULL
```

**Encuestas** — se integran con el módulo existente. No se crea sistema nuevo.

```
aap_survey_triggers
  trigger_id        uuid PK DEFAULT gen_random_uuid()
  trigger_event     varchar NOT NULL
                    CHECK IN ('post_paso2','post_notificacion','desistimiento','no_admitido')
  survey_master_id  uuid NOT NULL  FK survey_masters(<PK>)   -- verificar nombre exacto del PK
  template_id       uuid NULL      FK aap_email_templates(template_id)
  send_type         varchar NOT NULL CHECK IN ('automatico','manual')
  is_active         boolean NOT NULL DEFAULT true
  created_at        timestamptz DEFAULT now()

aap_survey_sends
  send_id       uuid PK DEFAULT gen_random_uuid()
  applicant_id  uuid NOT NULL  FK aap_applicants(applicant_id) ON DELETE CASCADE
  trigger_id    uuid NOT NULL  FK aap_survey_triggers(trigger_id)
  sent_at       timestamptz DEFAULT now()
  send_status   varchar NOT NULL DEFAULT 'enviado' CHECK IN ('enviado','fallido')
  notes         text NULL
```

**Desistimientos** — no tienen tabla propia. Se registran en los campos `withdrawn_*` de `aap_applicants` + `lifecycle_status = 'desistido'`. La causa es obligatoria (categoría `desistimiento` de `aap_loss_reasons`). El paso en que desiste se captura automáticamente del paso actual. Reversible por usuario con permiso; queda en la auditoría.

---

## 6. PASO 1 — FORMULARIO PÚBLICO DE INSCRIPCIÓN

Formulario público único, alojado en SchoolNet, sin login. Reemplaza los tres formularios de Google Forms.

### 6.1 Campos

| # | Campo | Tipo | Destino |
|---|---|---|---|
| 1 | Aceptación de política de datos | Sí/No | `data_consent` |
| 2 | ¿Tiene o tuvo otro hijo en Tilatá? | Sí/No | `has_sibling_in_tilata` |
| 3 | Nombres del aspirante | Texto | `applicant_first_name` |
| 4 | Primer apellido del aspirante | Texto | `applicant_last_name_1` |
| 5 | Segundo apellido del aspirante | Texto | `applicant_last_name_2` |
| 6 | Fecha de nacimiento | Fecha | `applicant_birthdate` |
| 7 | Curso actual | Texto libre | `current_grade_text` |
| 8 | Curso al que aspira | Select (`grades`) | `target_grade_id` |
| 9 | Año en que desea ingresar | Select (`aap_form_available_years`) | `target_academic_year_id` |
| 10 | Jardín / colegio actual | Texto libre | `current_school` |
| 11 | Calendario del colegio actual | Select | `current_school_calendar` |
| 12 | Número de grados del colegio actual | Select | `current_school_total_grades` |
| 13 | Motivo del cambio | Texto libre | `change_reason` |
| 14 | Familiar 1 — Relación | Select (Mamá/Papá) | `familiar1_relationship` |
| 15 | Familiar 1 — Nombre completo | Texto | `familiar1_full_name` |
| 16 | Familiar 1 — Celular | Texto | `familiar1_phone` |
| 17 | Familiar 1 — Correo | Texto | `familiar1_email` |
| 18 | Familiar 2 — Relación | Select (Mamá/Papá/Otro) | `familiar2_relationship` |
| 19 | Familiar 2 — Nombre completo | Texto | `familiar2_full_name` |
| 20 | Familiar 2 — Celular | Texto | `familiar2_phone` |
| 21 | Familiar 2 — Correo | Texto | `familiar2_email` |
| 22 | ¿Es usted referido? | Sí/No | `is_referred` |
| 23 | Relación con el referido | Select (`aap_referral_types`) | `referral_type_id` — condicional a #22 |
| 24 | Nombre de quien lo refirió | Texto | `referral_person_name` — condicional a #22 |
| 25 | Medios donde nos ha conocido | Multi-select (`aap_contact_sources`) | `aap_applicant_sources` |
| 26 | Medio de mayor influencia | Select única (`aap_contact_sources`) | `main_source_id` |
| 27 | Inscripción a experiencia | Select (`aap_experience_events` abiertos) | `aap_applicant_experiences` |

Único campo condicional: #23 y #24, visibles si #22 = Sí. El formulario no cambia por nivel; el sistema infiere el nivel del `target_grade_id` para uso interno.

### 6.2 Comportamiento

**Deduplicación (decisión v0.7 — nueva).** Al enviar, el formulario busca en `aap_applicants` una coincidencia por:

> `applicant_birthdate` igual **Y** (`familiar1_email` o `familiar2_email` coincide con cualquiera de los dos correos enviados)

- **Si encuentra coincidencia:** completa ese registro (pasa de `contacto` a `inscrito`), no crea uno nuevo, y lo marca en `general_notes` para revisión del equipo.
- **Si no encuentra:** crea registro nuevo con `origin = 'formulario'` y `lifecycle_status = 'inscrito'`.

Esto evita el duplicado clásico: admisiones registra a la familia por teléfono, y la familia después llena el formulario por su cuenta sin usar el enlace enviado.

**Envío:** se genera `access_token`, se congela `step1_submission` (jsonb con todo lo enviado), se marca `step1_submitted_at`, se crea la fila del paso 1 en `aap_applicant_steps` como `Completado`, y se envía la plantilla `inscripcion_confirmacion` con el token.

**Edición posterior:** la familia edita con el token, sin login, **solo mientras `lifecycle_status = 'inscrito'`**. Al pasar a `en_proceso` se bloquea. El snapshot `step1_submission` nunca se modifica.

**Recuperación de token:** la familia ingresa un correo (Familiar 1 o 2); si coincide, recibe el token por correo (`token_reenvio_familia`).

**Reenvío por administradores:** desde la ficha del aspirante (`token_reenvio_admin`), con auditoría.

**Inscripción de hermanos:** botón "Inscribir otro hijo/a" que precarga Familiar 1 y Familiar 2.

**Estado del formulario:** abrible/cerrable desde `aap_module_config.form_is_open`, con mensaje configurable.

---

## 7. PASO 4 — ESTRUCTURA DEL FORMULARIO EXTENSO

Formulario único con lógica condicional por nivel (`show_if_field_id` / `show_if_value`). Los campos ya capturados en el Paso 1 se muestran **pre-llenados y editables**; la respuesta del Paso 4 queda como respuesta formal en `form_responses` y el valor original del Paso 1 se conserva intacto en `step1_submission`.

**Módulos:**

| # | Módulo | Contenido |
|---|---|---|
| 1 | Autorizaciones formales | Habeas data extendida + consulta a centrales de riesgo. Radio Sí autorizo / No autorizo. **Bloqueantes:** si cualquiera es "No autorizo", no permite avanzar. Textos desde `aap_module_config`. |
| 2 | Información inicial | 8 preguntas comunes + 4 solo para Primaria/Bachillerato. |
| 3 | Contexto familiar | Incluye la pregunta 7 de declaraciones sobre valores, con `validation_rules = {"exact_count": 3}`. |
| 4 | Datos de Familiar 1 | Terminología "Familiar 1 / Familiar 2", no "Papá / Mamá". |
| 5 | Datos de Familiar 2 | |
| 6 | Historia del aspirante | Incluye sub-bloque condicional de apoyo terapéutico (`show_if_field_id` / `show_if_value`). Solo "Estado del proceso" es obligatoria dentro del sub-bloque. Las respuestas huérfanas se conservan en BD y se ignoran si el bloque está oculto. |
| 7 | Preguntas al aspirante | **En segunda persona** (dirigidas al hijo), con texto informativo de apertura (`informative_text`) que guía a familias con hijos pequeños. |
| 8 | Documentos | Carga de documentos del catálogo. Valida que todos los `required` estén presentes antes del envío final. |

---

## 8. PASOS 9, 10 Y 11

**Paso 9 — Notificación.** No es automática al cerrar el comité. Se dispara manualmente por un usuario con el rol de `aap_module_config.notification_role_id`. Se registra en `aap_email_log` con `related_result_type_id`.

**Paso 10 — Prematrícula.** Check simple en `aap_applicant_steps`. Reglas:
- Solo aplicable si el resultado vigente del comité tiene `allows_enrollment = true`.
- **Requiere que todos los documentos `required_deferred` aplicables al grado estén cargados.** Si faltan, el check no se puede marcar y el sistema muestra la lista de pendientes.

**Paso 11 — Matrícula.** Check simple. Al marcarlo, `lifecycle_status = 'matriculado'`. Cierra el proceso. **No crea el estudiante en `students`** (decisión v0.7: es un proceso manual externo).

---

## 9. CONSULTAS Y LISTADOS (`admissions-reports.html`)

Fortaleza central del módulo. Pantalla dedicada que concentra las consultas.

**Listados operativos:**
- Aspirantes por paso actual.
- Acciones pendientes del equipo: documentos por revisar, observaciones por agendar, comités sin resultado, notificaciones por enviar.
- Acciones pendientes de la familia: borrador sin envío final, documentos obligatorios faltantes, no han abierto el Paso 4.
- Documentos subidos por aspirante, con estado y responsable.
- Jornadas próximas con sus invitados.

**Filtros:** año académico, grado, sección, `lifecycle_status`, paso actual, semáforo financiero, fuente de contacto, rango de fechas, trabajador invitado, responsable asignado.

**Tablero:** semáforo / barra de progreso por aspirante a través de los 11 pasos. Alertas visuales: documento obligatorio faltante, revisión financiera en rojo, jornada sin responsable.

**Métricas:** total por año/grado, conversión por paso (incluye conversión `contacto → inscrito`), tiempo promedio por paso, distribución de resultados del comité, razones de desistimiento, distribución por fuente.

**Exportación:** Excel / CSV (SheetJS).

**Permisos:** listados filtrados por permisos del usuario. Rectoría y administradores ven todo.

---

## 10. INVENTARIO DE PANTALLAS

Todas en `modules/admissions/`.

### 10.1 Existentes, se conservan

`kindergartens.html` · `kindergarten-actions.html` · `fairs.html` · `contact-sources.html` · `referral-types.html` · `grade-age-ranges.html` · `upload-campaigns.html` · `loss-reasons.html` (se ajusta para filtrar por las 3 categorías)

### 10.2 Se reescriben desde cero

| Archivo | Contenido |
|---|---|
| `index.html` | Dashboard del módulo |
| `applicants.html` | Base de Admisiones: lista con filtros por `lifecycle_status` |
| `applicant-detail.html` | Ficha del aspirante: datos + los 11 pasos + documentos + sesiones + financiero |
| `form.html` | **Público.** Formulario del Paso 1 |
| `form-config.html` | Configuración del Paso 1 + años disponibles |

### 10.3 Nuevas

| Archivo | Contenido |
|---|---|
| `leads-review.html` | Base 0: revisión de leads (validar / siga / pare) |
| `module-config.html` | Configuración general: `form_id` del Paso 4, textos de autorizaciones, rol de notificación |
| `email-templates.html` | CRUD de plantillas de correo + preview |
| `experiences.html` | Paso 2: tipos de experiencia + eventos con fecha |
| `documents-catalog.html` | Paso 4: catálogo de documentos, grados aplicables, obligatoriedad, responsable |
| `step4-form.html` | **Público.** Formulario extenso del Paso 4 + carga de documentos |
| `session-types.html` | Tipos de sesión (observaciones y comité) + roles autorizados |
| `admissions-reports.html` | Consultas, tablero y exportaciones |

### 10.4 Se eliminan

`laurix.html` · `temporal.html` · `process-states.html` · `process-steps.html` · `applicant-steps.html`

*(Los 11 pasos son fijos; no requieren pantalla de administración. Si más adelante se necesita, se retoma.)*

---

## 11. CONVENCIONES OBLIGATORIAS DE IMPLEMENTACIÓN

Estas convenciones son de la plataforma, no negociables, y su incumplimiento es la causa habitual de errores.

**Base de datos**
- Toda tabla nueva: `ALTER TABLE public.<tabla> DISABLE ROW LEVEL SECURITY;` explícito.
- SQL siempre primero en DEV (`spjzvpcsgbewxupjvmfm`), verificar con SELECT, luego replicar a PROD (`mrtuerkncqodhakuwjob`). Nunca al revés.
- Antes de escribir SQL o código: consultar `DataBase.md` y `config.js`. La base viva puede diverger de la documentación; verificar con SELECT.

**PostgREST**
- Firma: `supabaseRequest(endpoint, { method, body })`. **Nunca** pasar `headers` explícitamente — sobrescribe la API key inyectada.
- `Prefer: return=representation` ya viene en `getHeaders()`.
- PATCH y DELETE **siempre** con filtro (el modo seguro rechaza los no filtrados). Ej.: `?config_id=not.is.null`.
- Sin cache-busters en la URL (PostgREST no ignora parámetros desconocidos).
- Desambiguación de FK: sintaxis `!nombre_constraint`.

**Frontend**
- Bootstrap 5.3 + Bootstrap Icons.
- **Sin gradientes en ningún elemento.** Solo colores sólidos.
- Páginas internas: `initializePage()` + `validatePageAccess('<permiso>')`.
- Páginas públicas (`form.html`, `step4-form.html`): **no** llaman `validatePageAccess()`.
- Correos: `sendNotification(to, subject, htmlContent, silent)`.
- Storage: seguir `GUIA_SUPABASE_STORAGE_SIN_AUTH.md`.
- Quill 1.3.7 para editores de texto enriquecido (plantillas de correo).
- Chart.js solo si barras en CSS+HTML no bastan.
- Versionado de archivos: `26.D.D.N` en el encabezado.

**Permisos**
- Los permisos que no son de navegación deben tener `url_path = NULL`, o el sidebar los descarta en silencio.
- Después de cambiar permisos: limpiar `schoolnet_sidebar_permissions` en `sessionStorage`.
- Orden del sidebar: `MODULE_ITEM_ORDER` en `sidebar.js`.

---

## 12. PLAN DE TRABAJO POR FASES

| Fase | Contenido | Depende de |
|---|---|---|
| **1** | Esquema completo en DEV: DROP de lo obsoleto, CREATE de las tablas nuevas, ALTER de `form_fields` y `marketing_contacts`, carga de los 11 pasos y de `aap_committee_result_types`. Bucket `admissions-documents`. Permisos nuevos. | — |
| **2** | `applicants.html` + `applicant-detail.html`: Base de Admisiones y ficha con los 11 pasos. **Núcleo — todo lo demás cuelga de aquí.** | 1 |
| **3** | `module-config.html` + `email-templates.html`. Las plantillas se necesitan desde el Paso 1. | 1 |
| **4** | `leads-review.html` (Base 0) + `form.html` + `form-config.html` (Paso 1, con deduplicación). | 2, 3 |
| **5** | `experiences.html` (Paso 2) + check del Paso 3. | 2, 3 |
| **6** | `documents-catalog.html` + `step4-form.html` (Paso 4 + Storage). **La fase más pesada.** | 2, 3 |
| **7** | Paso 5: check de admisiones + semáforo financiero + acuerdos financieros (en la ficha). | 2, 6 |
| **8** | `session-types.html` + motor de sesiones y comité (Pasos 6, 7, 8) en la ficha. | 2, 3 |
| **9** | Pasos 9, 10 y 11 en la ficha. Desistimientos. | 8 |
| **10** | `admissions-reports.html` + encuestas + `index.html` (dashboard). | Todas |

**Números:** ~20 tablas nuevas, 3 rehechas, 5 eliminadas, 2 modificadas. 13 pantallas (8 nuevas, 5 reescritas), 8 conservadas.

---

## 13. DECISIONES TOMADAS EN v0.7

- [x] **Tabla única de aspirante.** Se elimina la separación Base 1 / Base de Admisiones. `lifecycle_status` con 7 valores.
- [x] **Snapshot JSONB del Paso 1** (`step1_submission`) en lugar de tabla espejo. Se elimina `aap_web_applications`.
- [x] **`procedure_instances` en modo standalone** (`procedure_id = NULL`). No se crean trámites falsos. `instance_status = 'in_progress'` es el borrador.
- [x] **El comité es un tipo de sesión más.** `aap_session_types` con `session_category` e `invites_family` como dato, no como código.
- [x] **Se elimina `aap_process_states`.** El paso actual se deriva de `aap_applicant_steps`.
- [x] **Razones unificadas** en `aap_loss_reasons` con 3 categorías: `base0_pare`, `desistimiento`, `no_admision`.
- [x] **Razones de no admisión: catálogo cerrado** (no campo libre).
- [x] **Sin promoción automática a `students`.** Paso 11 solo marca `matriculado`.
- [x] **Deduplicación en el formulario público** por fecha de nacimiento + correo de familiar.
- [x] **Estructura de fechas del Paso 2 resuelta:** `aap_experience_types` + `aap_experience_events` + `aap_applicant_experiences`.
- [x] **Paso 9 se registra en `aap_email_log`,** no en tabla propia. Se elimina `aap_notifications`.
- [x] **Nombre del aspirante separado** (nombres / apellido 1 / apellido 2); nombre de familiares como texto completo.
- [x] **Invitados de las tres categorías de sesión se eligen de `workers`.** La familia se invita automáticamente solo si `invites_family = true`.

**Se mantienen de v0.6:** formulario único del Paso 1 sin campos condicionales salvo referido · token sin login · precarga para hermanos · recuperación y reenvío de token · formulario abrible/cerrable · aceptación ligera en Paso 1 y autorizaciones formales en Paso 4 · guardado de borrador y envío final explícito en Paso 4 · bloqueo post envío excepto agregar documentos · captura desde cámara · tres tipos de obligatoriedad de documentos · pago externo con comprobante como documento · terminología "Familiar 1 / Familiar 2" · tipo `informative_text` · `validation_rules` con `exact_count` · Módulo 7 en segunda persona · sub-bloque condicional del Módulo 6 · semáforo financiero verde/amarillo/rojo · acuerdos financieros abribles en cualquier momento · desistimientos con causa obligatoria · encuestas integradas con el módulo existente · sin integración PHIDIAS.

---

## 14. DECISIONES PENDIENTES

Ninguna bloquea el arranque de la Fase 1. Todas son **contenido institucional**, no arquitectura.

| # | Pendiente | Quién decide | Bloquea |
|---|---|---|---|
| 1 | Textos oficiales de las dos autorizaciones del Paso 4 (habeas data extendida + centrales de riesgo). Vienen del Excel pero deben validarse legalmente. | Rectoría / asesoría jurídica | Fase 6 |
| 2 | Monto y datos bancarios del proceso de admisión (van en `document_description` del recibo de pago). | Contabilidad | Fase 6 |
| 3 | Listado definitivo de las 9 declaraciones sobre valores (Módulo 3, pregunta 7). El Excel tiene una repetida: "conscientes y activos frente al abuso del medio ambiente" aparece dos veces. | Rectoría | Fase 6 |
| 4 | Responsable interno de cada documento del catálogo. | Equipo de admisiones (lo cargan desde el CRUD) | Fase 6 |
| 5 | Contenido del catálogo de razones de no admisión. | Equipo de admisiones / Rectoría | Fase 8 |
| 6 | Campos del formulario dinámico del comité. | Rectoría / Dirección académica | Fase 8 |
| 7 | Campos de los formularios de observación por tipo. | EAE / Dirección de sección | Fase 8 |
| 8 | Definición puntual de roles y permisos por funcionalidad. | Desarrollos | Fase 1 (permisos base) |

---

## 15. RIESGOS CONOCIDOS

**Formulario público y `anon key`.** `form.html` y `step4-form.html` son públicos y usan el `anon key`, que está en `config.js` y es visible en el navegador. Con RLS desactivada en toda la plataforma, ese key permite leer y escribir cualquier tabla. Esto **no es un riesgo nuevo** introducido por este módulo (aplica ya a la pantalla de login y a toda la plataforma), pero exponer formularios públicos amplía la superficie. Queda anotado como deuda técnica de plataforma, no como bloqueo de este módulo.

**Documentos en bucket público.** El bucket `admissions-documents` es público (requisito de la guía de Storage sin auth). Cualquiera con la URL puede ver un documento. Las rutas incluyen el `applicant_id` (uuid) y un timestamp, lo que hace impráctico adivinarlas, pero no son secretas. Documentos sensibles (informes médicos, reportes psicológicos) quedarán ahí. **Recomendación: evaluar antes de la Fase 6** si conviene un bucket privado con URLs firmadas, aunque eso rompa el patrón actual de la plataforma.

---

## 16. HISTORIAL DE DEFINICIÓN

| Fecha | Versión | Avance |
|---|---|---|
| Marzo 2026 | 0.1 | Definición inicial: flujo Base 0 → Base 1 → Formulario → Base Admisiones. |
| Marzo 2026 | 0.2 | Pasos 1, 2 y 3 acordados. Preguntas documentadas para pasos 4–11 y transversales. |
| Marzo 2026 | 0.3 | Paso 1 detallado. Formulario único dinámico. Sistema de token. Precarga para hermanos. |
| Abril 2026 | 0.4 | Ajustes Paso 1. Paso 4 detallado. Paso 5 (check + semáforo). Pasos 6, 7, 8. Paso 9 manual. |
| Abril 2026 | 0.5 | Pasos 10 y 11 como checks simples. Desistimientos. Encuestas. Consultas como fortaleza central. |
| Abril 2026 | 0.6 | Estructura detallada del formulario del Paso 4. Autorizaciones formales trasladadas al Paso 4. Catálogo de 15 documentos. Pago externo. |
| **Julio 2026** | **0.7** | **Especificación cerrada.** Tabla única de aspirante con ciclo de vida. Eliminación de `aap_web_applications` y `aap_process_states`. Reutilización de `procedure_instances` en modo standalone. Unificación del comité como tipo de sesión. Deduplicación en el formulario público. Estructura de experiencias del Paso 2. Modelo de datos completo con nombres, tipos y restricciones. Plan de trabajo en 10 fases. |
