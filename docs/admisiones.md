# MÓDULO DE ADMISIONES — SchoolNet

**Documento:** Especificación funcional y técnica del módulo de admisiones
**Versión:** 0.9
**Última actualización:** 14 de julio de 2026
**Reemplaza:** v0.7, v0.8 y v0.8.1 (todos retirados)
**Estado:** Fases 1, 2 y 3 completadas y verificadas en DEV. Fase 4 sin iniciar.

---

## 0. QUÉ CAMBIA RESPECTO A v0.8.1

El v0.9 recoge lo aprendido construyendo las fases 2 y 3. Todo lo de aquí está verificado contra código que funciona en DEV, no contra diseño.

| # | Cambio | Sección |
|---|---|---|
| 1 | **`supabaseRequest()` NO serializa el body.** Siempre `JSON.stringify()`. | 11 |
| 2 | **`aap_contact_sources` exige desambiguación de FK.** Hay dos caminos desde `aap_applicants`. | 11 |
| 3 | **El Paso 1 es de solo lectura** en el tracker. Corrección al v0.8.1. | 8.2 |
| 4 | **`form-config.html` se elimina.** Absorbido por `module-config.html`. | 9 |
| 5 | **Las plantillas de correo no se crean ni se borran.** Conjunto fijo de 11, sembrado por SQL. | 7.4 |
| 6 | **Trigger `aap_applicants_create_steps`:** las 11 filas de pasos se crean solas al insertar un aspirante. | 3.9 |
| 7 | **El motor de formularios no alcanza para el Paso 4.** Decisión bloqueante de la Fase 6. | 12.1 |
| 8 | **`marketing_contacts` está vacía.** `upload-campaigns.html` nunca se ha usado. | 4 |

---

## 1. OBJETIVO Y ALCANCE

Gestionar el proceso completo de atracción y admisión de aspirantes al Colegio Tilatá, desde la llegada de leads por campañas de redes sociales hasta la matrícula.

**Fuera de alcance:**
- Integración con PHIDIAS.
- Promoción automática a `students`. Al cerrar el Paso 11 el aspirante queda en estado `matriculado`; la creación del estudiante es un proceso manual externo.
- Pago del proceso de admisión (es externo; la familia sube el comprobante como documento).
- **Migración de aspirantes de ciclos anteriores.**

---

## 2. DECISIONES DE ARQUITECTURA

### 2.1 Tabla única de aspirante

No hay separación entre "Base 1 (contactos depurados)" y "Base de Admisiones". Son la misma tabla (`aap_applicants`) en distintos momentos del ciclo de vida.

**Ciclo de vida (`lifecycle_status`):**

| Estado | Significado |
|---|---|
| `contacto` | Registrado por admisiones (llamada, visita, feria) o promovido desde Base 0 con "Siga". Aún no ha llenado el formulario. |
| `inscrito` | La familia envió el formulario del Paso 1. |
| `en_proceso` | Avanza por los pasos 2 al 11. |
| `desistido` | Terminal. Causa obligatoria. |
| `no_admitido` | Terminal. Resultado del comité. Razón obligatoria. |
| `aplazado` | Terminal para el año en curso. Resultado "Admitido aplazado". |
| `matriculado` | Terminal. Paso 11 cerrado. |

### 2.2 Sin tabla espejo del Paso 1

El registro histórico de lo que la familia escribió se conserva como snapshot JSONB congelado (`aap_applicants.step1_submission`). Nunca se modifica. `aap_web_applications` fue eliminada.

### 2.3 `procedure_instances` en modo standalone

`procedure_instances.procedure_id` es *nullable* y la tabla tiene su propio `form_id`. Los pasos 4, 6, 7 y 8 usan el sistema de formularios dinámicos existente con `procedure_id = NULL`. El borrador es `instance_status = 'in_progress'`; el envío final es `'completed'`.

### 2.4 El comité es un tipo de sesión más

`aap_session_types` unifica observaciones y comité con `session_category` (3 valores) y flag `invites_family`. La familia se invita automáticamente a las observaciones y no al comité — como dato, no como código.

### 2.5 Sin catálogo de estados de proceso

El estado es un campo cerrado (`lifecycle_status`). El paso actual se deriva de `aap_applicant_steps`.

### 2.6 Razones unificadas

`aap_loss_reasons.reason_category` con CHECK de tres valores:

| Valor | Uso |
|---|---|
| `base0_pare` | Lead de redes que no continúa. |
| `desistimiento` | Familia que desiste en cualquier paso. |
| `no_admision` | Razón de no admisión decidida por el comité. |

Una sola pantalla (`loss-reasons.html`) con filtro por categoría.

### 2.7 Arranque desde cero (decisión v0.8)

**El módulo entra en operación vacío, con el ciclo escolar nuevo.** No se migran los aspirantes de ciclos anteriores. Las inscripciones entran por el formulario del Paso 1.

*Nota operativa:* el ciclo anterior sigue vivo en paralelo fuera del sistema hasta que cierre. Hay que definir en qué momento SchoolNet pasa a ser la fuente única de verdad para admisiones.

---

## 3. ESQUEMA — ESTADO REAL EN DEV

> **Regla:** todo script que cree tablas debe incluir `ALTER TABLE public.<tabla> DISABLE ROW LEVEL SECURITY;` explícitamente. Supabase habilita RLS por defecto; SchoolNet la mantiene desactivada y resuelve seguridad en la capa JS.

### 3.1 Tablas creadas (22)

`aap_applicants` · `aap_applicant_sources` · `aap_applicant_steps` (rehecha) · `aap_applicant_documents` · `aap_applicant_experiences` · `aap_committee_result_types` · `aap_committee_results` · `aap_email_log` · `aap_email_templates` · `aap_experience_events` · `aap_experience_types` · `aap_financial_agreements` · `aap_financial_reviews` · `aap_form_available_years` · `aap_module_config` · `aap_required_documents` · `aap_required_document_grades` · `aap_session_forms` · `aap_session_invitees` · `aap_session_types` · `aap_session_type_roles` · `aap_sessions` · `aap_survey_sends` · `aap_survey_triggers`

### 3.2 Tablas eliminadas

`aap_web_applications` · `aap_web_application_sources` · `aap_process_states` · `aap_applicant_loss_reasons` · `temp_aspirantes` · `temp_aspirante_eventos`

### 3.3 Tablas modificadas

**`marketing_contacts`** — columnas agregadas:

| Columna | Tipo | CHECK |
|---|---|---|
| `validation_status` | varchar NOT NULL DEFAULT `'pendiente'` | `pendiente` / `validado` / `no_validado` |
| `lead_decision` | varchar NULL | `siga` / `pare` |
| `stop_reason_id` | uuid NULL → `aap_loss_reasons` | — |
| `stop_notes` | text NULL | — |
| `reviewed_by` | uuid NULL → `users` | — |
| `reviewed_at` | timestamptz NULL | — |
| `promoted_applicant_id` | uuid NULL → `aap_applicants` | — |

**`aap_loss_reasons`** — CHECK agregado sobre `reason_category`.

**`form_fields`** — `informative_text` agregado al CHECK de `field_type`.

### 3.4 `aap_applicants` — campos clave

```
applicant_id                  uuid PK
lifecycle_status              varchar NOT NULL DEFAULT 'contacto'  [CHECK 7 valores]
origin                        varchar NOT NULL  [CHECK: base0 | directo | formulario]
lead_contact_id               uuid → marketing_contacts

applicant_first_name          varchar NOT NULL
applicant_last_name_1         varchar NULL
applicant_last_name_2         varchar NULL
applicant_birthdate           date NULL  [CHECK <= CURRENT_DATE]
target_grade_id               uuid → grades
target_academic_year_id       uuid → academic_years
current_school                varchar
current_grade_text            varchar
current_school_calendar       varchar   [CHECK pendiente — ver 3.5]
current_school_total_grades   varchar   [CHECK pendiente — ver 3.5]
change_reason                 text
has_sibling_in_tilata         boolean

familiar1_relationship / familiar1_full_name / familiar1_phone / familiar1_email
familiar2_relationship / familiar2_full_name / familiar2_phone / familiar2_email

is_referred                   boolean
referral_type_id              uuid → aap_referral_types
referral_person_name          varchar
main_source_id                uuid → aap_contact_sources
kindergarten_id               uuid → aap_kindergartens
fair_id                       uuid → aap_fairs

access_token                  varchar UNIQUE
data_consent                  boolean NOT NULL DEFAULT false
step1_submitted_at            timestamptz
step1_submission              jsonb        -- snapshot congelado

step4_started_at              timestamptz
step4_submitted_at            timestamptz
step4_instance_id             integer → procedure_instances

withdrawn_at / withdrawn_step_id / withdrawn_reason_id /
withdrawn_destination_school / withdrawn_notes / withdrawn_by
not_admitted_reason_id        uuid → aap_loss_reasons

general_notes                 text
created_by                    uuid → users   -- NULL si vino del formulario público
created_at / updated_at
```

**Nombres:** el aspirante va separado (nombres / apellido 1 / apellido 2) porque se ordena y se busca. Los familiares van como texto completo porque son datos de contacto.

**`access_token`:** generado con `crypto.randomUUID()` en el cliente.

### 3.5 Constraints verificados en DEV

Todos aplicados. No hay nada pendiente en el esquema.

**CHECK sobre `aap_applicants`** (5): `birthdate_check`, `calendar_check`, `lifecycle_status_check`, `origin_check`, `total_grades_check`.

**Índice único `aap_module_config_single_row`** sobre `((true))`: garantiza que `aap_module_config` no pueda tener más de una fila. Es fila única por diseño; una segunda fila haría que el módulo lea configuración equivocada sin error visible.

### 3.6 `aap_applicant_steps`

```
applicant_id          uuid → aap_applicants ON DELETE CASCADE
step_id               uuid → aap_process_steps
step_status           varchar NOT NULL DEFAULT 'Pendiente'
                      [CHECK: Pendiente | En progreso | Completado | No aplica]
step_completion_date  date
completed_by          uuid → users
step_notes            text
PRIMARY KEY (applicant_id, step_id)
```

**Regla clave:** guarda el **estado agregado** de cada paso, una fila por paso. Las ocurrencias múltiples (varias jornadas, varios comités, varias experiencias) viven en sus tablas propias (`aap_sessions`, `aap_applicant_experiences`). No se duplica información.

### 3.7 Los 11 pasos

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

### 3.8 Resultados del comité

| `result_code` | `result_name` | `allows_enrollment` | Efecto en `lifecycle_status` |
|---|---|---|---|
| `admitido` | Admitido | `true` | — |
| `admitido_compromiso` | Admitido con compromiso | `true` | — |
| `admitido_anticipado` | Admitido anticipado | `true` | — |
| `admitido_aplazado` | Admitido aplazado | `false` | → `aplazado` |
| `segunda_observacion` | Segunda observación | `false` | — (vuelve a Paso 6 o 7) |
| `no_admitido` | No admitido | `false` | → `no_admitido` |

Un aspirante puede pasar por múltiples comités. El resultado **vigente** es el de `decided_at` más reciente.

### 3.9 Trigger: creación automática de pasos

Al insertar un aspirante, las 11 filas de `aap_applicant_steps` se crean solas en `Pendiente`.

```sql
CREATE OR REPLACE FUNCTION public.aap_create_applicant_steps()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.aap_applicant_steps (applicant_id, step_id, step_status)
  SELECT NEW.applicant_id, s.step_id, 'Pendiente'
  FROM public.aap_process_steps s
  WHERE s.is_active = true
  ON CONFLICT (applicant_id, step_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aap_applicants_create_steps
AFTER INSERT ON public.aap_applicants
FOR EACH ROW EXECUTE FUNCTION public.aap_create_applicant_steps();
```

**Va como trigger y no en la aplicación** porque el aspirante nace desde tres lugares: registro manual, promoción de un lead de Base 0, y formulario público. Si la lógica vive en el JS hay que repetirla en tres sitios y alguno se olvida.

**Supuesto explícito:** los 11 pasos son inmutables. `aap_process_steps.is_active` no se usa como interruptor operativo. Si alguien desactivara un paso, los aspirantes nuevos nacerían con 10 y los viejos seguirían con 11.

**Verificado en DEV y en PROD.**

### 3.10 Datos sembrados

| Objeto | Contenido |
|---|---|
| `aap_process_steps` | 11 pasos |
| `aap_committee_result_types` | 6 resultados |
| `aap_module_config` | 1 fila (`form_is_open = false`) |
| `aap_email_templates` | 11 plantillas con sus `template_key` |

**Los cuatro están en DEV y en PROD.**

---

## 4. BASE 0 — LEADS DE REDES SOCIALES

Los CSV siguen entrando por `upload-campaigns.html` a `marketing_campaigns` / `marketing_contacts` / `marketing_contact_campaigns`. **`upload-campaigns.html` no se modifica**: las columnas nuevas tienen DEFAULT o son nullable, así que sus INSERT no se rompen.

> **`marketing_contacts` está vacía en DEV y en PROD.** El módulo de campañas nunca ha entrado en operación, lo que significa que **`upload-campaigns.html` nunca se ha probado con datos reales**. Antes de la Fase 4 hay que subir un CSV real (Tráfico Perfil o Leads Meta Ads) en DEV y verificar que el parser funcione. Es una dependencia silenciosa: si está roto, `leads-review.html` va a esperar datos que nunca llegan.
>
> Lo bueno: no hay bandeja histórica que depurar. Los leads nuevos entran limpios con `validation_status = 'pendiente'`.

**Pantalla nueva (`leads-review.html`, Fase 4):**

1. Ver los leads con `validation_status = 'pendiente'`.
2. Marcar **Validado** o **No validado**. Los no validados se descartan.
3. Para los validados, decidir **Siga** o **Pare**:
   - **Siga:** se crea un registro en `aap_applicants` con `lifecycle_status = 'contacto'`, `origin = 'base0'` y `lead_contact_id` apuntando al lead. Se llena `promoted_applicant_id` en el lead.
   - **Pare:** `stop_reason_id` obligatorio (categoría `base0_pare`), `stop_notes` opcional. No avanza.

---

## 5. PASO 1 — FORMULARIO PÚBLICO

Formulario público único, sin login. Reemplaza los tres formularios de Google Forms.

### 5.1 Campos

| # | Campo | Destino |
|---|---|---|
| 1 | Aceptación de política de datos | `data_consent` |
| 2 | ¿Tiene o tuvo otro hijo en Tilatá? | `has_sibling_in_tilata` |
| 3 | Nombres del aspirante | `applicant_first_name` |
| 4 | Primer apellido | `applicant_last_name_1` |
| 5 | Segundo apellido | `applicant_last_name_2` |
| 6 | Fecha de nacimiento | `applicant_birthdate` |
| 7 | Curso actual (texto libre) | `current_grade_text` |
| 8 | Curso al que aspira | `target_grade_id` |
| 9 | Año en que desea ingresar | `target_academic_year_id` (de `aap_form_available_years`) |
| 10 | Jardín / colegio actual | `current_school` |
| 11 | Calendario del colegio actual | `current_school_calendar` |
| 12 | Número de grados del colegio actual | `current_school_total_grades` |
| 13 | Motivo del cambio | `change_reason` |
| 14–17 | Familiar 1: relación, nombre completo, celular, correo | `familiar1_*` |
| 18–21 | Familiar 2: relación, nombre completo, celular, correo | `familiar2_*` |
| 22 | ¿Es usted referido? | `is_referred` |
| 23 | Relación con el referido | `referral_type_id` — condicional a #22 |
| 24 | Nombre de quien lo refirió | `referral_person_name` — condicional a #22 |
| 25 | Medios donde nos ha conocido (multi) | `aap_applicant_sources` |
| 26 | Medio de mayor influencia | `main_source_id` |
| 27 | Inscripción a experiencia | `aap_applicant_experiences` |

Únicos campos condicionales: #23 y #24, visibles si #22 = Sí.

### 5.2 Deduplicación

Al enviar, el formulario busca en `aap_applicants` una coincidencia por:

> `applicant_birthdate` igual **Y** (`familiar1_email` o `familiar2_email` coincide con cualquiera de los dos correos enviados)

- **Coincidencia:** completa ese registro (de `contacto` a `inscrito`). No crea uno nuevo. Lo marca en `general_notes` para revisión del equipo.
- **Sin coincidencia:** crea registro nuevo con `origin = 'formulario'` y `lifecycle_status = 'inscrito'`.

Esto evita el duplicado clásico: admisiones registra a la familia por teléfono, y la familia después llena el formulario por su cuenta sin usar el enlace.

**Caso límite conocido:** hermanos gemelos con la misma fecha de nacimiento y los mismos correos colisionan. Si aparece en la práctica, hay que agregar el nombre a la llave.

### 5.3 Comportamiento

**Envío:** genera `access_token`, congela `step1_submission`, marca `step1_submitted_at`, crea la fila del paso 1 en `aap_applicant_steps` como `Completado`, envía la plantilla `inscripcion_confirmacion` con el token.

**Edición posterior:** con el token, sin login, **solo mientras `lifecycle_status = 'inscrito'`**. Al pasar a `en_proceso` se bloquea. El snapshot nunca se modifica.

**Recuperación de token:** la familia ingresa un correo (Familiar 1 o 2); si coincide, recibe el token (`token_reenvio_familia`).

**Reenvío por administradores:** desde la ficha (`token_reenvio_admin`), con auditoría.

**Inscripción de hermanos:** botón que precarga Familiar 1 y Familiar 2.

**Estado del formulario:** abrible/cerrable desde `aap_module_config.form_is_open`.

---

## 6. PASO 2 — EXPERIENCIAS

`aap_experience_types` (modalidades: Entretilateños, Charla presencial, Charla virtual, Recorrido, Cita personalizada) → `aap_experience_events` (convocatorias con fecha, hora, lugar, cupo, responsable) → `aap_applicant_experiences` (inscripción + asistencia).

El campo 27 del formulario del Paso 1 lee de `aap_experience_events` donde `is_open_for_registration = true` y `event_date >= CURRENT_DATE`.

**Reagendamiento:** una familia puede inscribirse a varios eventos. Es el caso común (se reagendan de una charla a otra). El modelo lo soporta sin cambios.

---

## 7. PASO 4 — PROCESO EN LÍNEA

Las respuestas viven en `forms` / `form_fields` / `field_option_catalog` / `procedure_instances` / `form_responses`. La instancia se crea con `procedure_id = NULL` y `form_id = aap_module_config.step4_form_id`.

### 7.1 Estructura del formulario

| # | Módulo | Contenido |
|---|---|---|
| 1 | Autorizaciones formales | Habeas data extendida + centrales de riesgo. **Bloqueantes.** Textos desde `aap_module_config`. |
| 2 | Información inicial | 8 preguntas comunes + 4 solo para Primaria/Bachillerato. |
| 3 | Contexto familiar | Incluye la pregunta de declaraciones con `validation_rules = {"exact_count": 3}`. |
| 4 | Datos de Familiar 1 | Terminología "Familiar 1 / Familiar 2". |
| 5 | Datos de Familiar 2 | |
| 6 | Historia del aspirante | Sub-bloque condicional de apoyo terapéutico (`show_if_field_id` / `show_if_value`). |
| 7 | Preguntas al aspirante | En segunda persona, con `informative_text` de apertura. |
| 8 | Documentos | Valida que todos los `required` estén presentes antes del envío final. |

Los campos ya capturados en el Paso 1 se muestran pre-llenados y editables. La respuesta del Paso 4 queda en `form_responses`; el valor original del Paso 1 se conserva intacto en `step1_submission`.

### 7.2 Documentos

| `obligation_type` | Comportamiento |
|---|---|
| `required` | Bloquea el envío final del Paso 4. |
| `required_deferred` | No bloquea el Paso 4, pero **bloquea el Paso 10** (Prematrícula). |
| `optional` | No bloquea nada. |

Por defecto son `required_deferred`: paz y salvo y último reporte del colegio anterior.

**Storage:** bucket `admissions-documents` — **no creado. Ver capítulo 13.**

### 7.3 Mecánica

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

### 7.4 Configuración del módulo y plantillas de correo

**Una sola pantalla de configuración: `module-config.html`.** `form-config.html` fue eliminado. Las dos escribían sobre la misma fila única de `aap_module_config`, lo que era confuso y frágil.

Secciones: estado del formulario público · años académicos habilitados · textos del Paso 1 · `form_id` y textos de autorizaciones del Paso 4 · rol de notificación del Paso 9.

**Las plantillas de correo son un conjunto fijo de 11.** Se siembran por SQL con sus `template_key`. La pantalla (`email-templates.html`) permite editar *nombre, asunto, cuerpo y activar/desactivar*. **No permite crear, borrar ni renombrar la key.**

Razón: `template_key` es un contrato con el código. `form.html` busca `inscripcion_confirmacion` por su key. Si el equipo pudiera crear plantillas, crearía una y esperaría que se enviara sola. Si pudiera renombrar la key, rompería el envío.

| `template_key` | Envío | Estado |
|---|---|---|
| `inscripcion_confirmacion` | Automático | Redactada |
| `token_reenvio_familia` | Automático | Redactada |
| `token_reenvio_admin` | Manual | Redactada |
| `contacto_enlace_formulario` | Manual | Redactada |
| `paso3_informativo` | Manual | Redactada |
| `paso4_invitacion` | Manual | Redactada |
| `paso4_documento_subido` | Automático | Redactada |
| `paso4_envio_final` | Automático | Redactada |
| `sesion_invitacion_familia` | Automático | **Pendiente de contenido** |
| `paso9_notificacion_resultado` | Manual | **Pendiente de contenido** |
| `encuesta_desistimiento` | Automático | **Pendiente de contenido** |

Las pendientes llevan el marcador `[Pendiente: ...]` en el cuerpo. La pantalla las detecta sola y las marca en amarillo con badge «Sin redactar». Cuando alguien borre el marcador, pasan a «Lista».

**Variables:** sintaxis `{{variable}}`. Conjunto: `{{nombre_aspirante}}`, `{{nombre_familiar1}}`, `{{grado}}`, `{{año_academico}}`, `{{token_url}}`, `{{form_url}}`, `{{resultado_comite}}`.

**Editor:** Quill 1.3.7 con `clipboard.dangerouslyPasteHTML()` para cargar el HTML.

**Envío:** todos los correos salen por `sendNotification(to, subject, htmlContent, silent)` de `config.js`.

---

## 8. LA FICHA DEL ASPIRANTE

### 8.1 Estructura

`applicant-detail.html` contiene:

- **Datos del aspirante:** todos los campos editables.
- **Tracker de los 11 pasos.**
- **Barra de acceso a las satélites** con estado, no solo enlaces: "Documentos (3 de 7)", "Sesiones (2 realizadas)", "Financiero: 🟡".

En Fase 2 los contadores no existen todavía (tablas vacías, sin lógica). La barra se construye con los rótulos puestos y los enlaces **deshabilitados**. Cada fase posterior activa el suyo y le agrega su contador.

### 8.2 Tracker de pasos — comportamiento

| Pasos | Comportamiento |
|---|---|
| **2, 3, 6, 7, 9** | Editables: estado, fecha, notas. `completed_by` se llena solo. |
| **5** | Editable **solo si** `aap_applicants.step4_submitted_at IS NOT NULL`. Si es NULL: deshabilitado con el mensaje *"Requiere el envío final del proceso en línea."* |
| **1, 4, 8, 10, 11** | **Solo lectura.** Insignia fija. Su estado se deriva de otra lógica. |

**Los cuatro bloqueados llevan leyenda explicativa, no un candado mudo:**

- **Paso 4:** "Se marca automáticamente cuando la familia envía el formulario del proceso en línea."
- **Paso 8:** "Se marca al registrar el resultado del comité de admisiones."
- **Paso 10:** "Se marca al confirmar la prematrícula. Requiere que los documentos pendientes estén cargados."
- **Paso 11:** "Se marca al confirmar la matrícula. Cierra el proceso."

**Sin botón manual de respaldo.** Si se pone, el equipo lo usará durante los meses hasta que llegue su fase, y quedarán aspirantes en estados que el sistema considera imposibles.

**Pasos 2, 6 y 7:** son editables en el tracker, pero su contenido real (experiencias, jornadas) vive en otras páginas. El tracker guarda el estado agregado del paso, no las ocurrencias. La leyenda de esos tres debe aclararlo.

**Anulación administrativa:** queda pendiente. Habrá casos que requieran corregir un paso bloqueado a mano (un aspirante que hizo el proceso por fuera, un error). Debe ser una acción con permiso propio y auditoría, no el botón normal del tracker. **No se construye en Fase 2.**

---

## 9. INVENTARIO DE PANTALLAS

Todas en `modules/admissions/`.

### 9.1 Existentes, se conservan

`kindergartens.html` · `kindergarten-actions.html` · `fairs.html` · `contact-sources.html` · `referral-types.html` · `grade-age-ranges.html` · `upload-campaigns.html` · `loss-reasons.html` (se ajusta para filtrar por las 3 categorías)

### 9.2 Estado de las pantallas

| Archivo | Contenido | Fase | Estado |
|---|---|---|---|
| `applicants.html` | Lista con filtros por `lifecycle_status` + registro de contacto | 2 | ✅ DEV |
| `applicant-detail.html` | Datos + tracker de 11 pasos + barra de satélites | 2 | ✅ DEV |
| `module-config.html` | Configuración completa del módulo | 3 | ✅ DEV |
| `email-templates.html` | Edición de las 11 plantillas | 3 | ✅ DEV |
| `leads-review.html` | Base 0: validar / siga / pare | 4 | Pendiente |
| `form.html` | **Público.** Formulario del Paso 1 | 4 | Pendiente |
| `experiences.html` | Paso 2: tipos + eventos con fecha | 5 | Pendiente |
| `documents-catalog.html` | Paso 4: catálogo de documentos | 6 | Pendiente |
| `step4-form.html` | **Público.** Formulario extenso + documentos | 6 | Pendiente |
| `applicant-documents.html` | **Satélite.** Documentos del aspirante | 6 | Pendiente |
| `applicant-financial.html` | **Satélite.** Semáforo + acuerdos financieros | 7 | Pendiente |
| `session-types.html` | Tipos de sesión + roles autorizados | 8 | Pendiente |
| `applicant-sessions.html` | **Satélite.** Observaciones y comité | 8 | Pendiente |
| `admissions-reports.html` | Consultas y exportaciones | 10 | Pendiente |
| `dashboard.html` | Tablero de control del módulo | 10 | Pendiente |

> **No hay `index.html`.** El tablero del módulo es `dashboard.html`.
> **`form-config.html` fue eliminado.** Su contenido está en `module-config.html`.

### 9.3 Páginas satélite

Las tres satélites reciben `?applicant_id={uuid}` y validan que el aspirante exista antes de renderizar. Cada una lleva un botón "← Volver al aspirante" arriba, con el nombre del aspirante visible.

**Motivo de la separación:** con edición solo por GitHub web, un `applicant-detail.html` que contuviera todo sería un archivo de miles de líneas donde cada cambio arriesga romper algo lejano.

### 9.4 Permisos — estado verificado en DEV

**Regla:** un permiso solo se activa cuando su página existe. Si se activa antes, el sidebar muestra un ítem que lleva a un 404.

**Activos (12):**

`Aspirantes` · `Ficha individual del aspirante` · `Configuración general del módulo` · `Plantillas de correo` · `Fuentes de contacto` · `Ferias de preescolares` · `Nacimiento - grados` · `Gestionar acciones de jardines` · `Jardines infantiles` · `Razones de pérdida` · `Tipos de referidos` · `Subir archivos de campañas`

**Inactivos, se activan al terminar su fase:**

| Permiso | `url_path` | Activar en |
|---|---|---|
| Revisión de leads | `leads-review.html` | Fase 4 |
| Experiencias | `experiences.html` | Fase 5 |
| Catálogo de documentos | `documents-catalog.html` | Fase 6 |
| Documentos del aspirante | `applicant-documents.html` | Fase 6 |
| Financiero del aspirante | `applicant-financial.html` | Fase 7 |
| Tipos de sesión | `session-types.html` | Fase 8 |
| Sesiones del aspirante | `applicant-sessions.html` | Fase 8 |
| Reportes | `admissions-reports.html` | Fase 10 |
| Dashboard | `dashboard.html` | Fase 10 |

**Inactivos y sin `url_path` — no se reactivan nunca:**

`Estados del proceso` · `Pasos del proceso` · `Gestión de pasos por aspirante` · `Vista de seguimiento del proceso` · `Configuración del formulario`

Apuntaban a páginas eliminadas o inexistentes. No se borran con DELETE por las FKs desde `role_permissions`; quedan desactivados y sin ruta.

**Las páginas públicas (`form.html`, `step4-form.html`) no llevan permiso** y no llaman `validatePageAccess()`.

**Después de activar un permiso:** limpiar `schoolnet_sidebar_permissions` de `sessionStorage`, o cerrar la pestaña y abrir una nueva.

> **Advertencia:** el bloque de permisos de la Fase 1 usó `ON CONFLICT DO UPDATE` y revivió tres permisos que ya habían sido desactivados a propósito. Antes de cualquier carga de permisos, hacer un SELECT previo y verificar contra esta tabla.

### 9.5 Eliminadas

`laurix.html` · `temporal.html` · `process-states.html` · `process-steps.html` · `applicant-steps.html`

---

## 10. CONSULTAS Y LISTADOS (`admissions-reports.html`)

**Listados operativos:**
- Aspirantes por paso actual.
- Acciones pendientes del equipo: documentos por revisar, observaciones por agendar, comités sin resultado, notificaciones por enviar.
- Acciones pendientes de la familia: borrador sin envío final, documentos obligatorios faltantes, no han abierto el Paso 4.
- Jornadas próximas con sus invitados.

**Filtros:** año académico, grado, sección, `lifecycle_status`, paso actual, semáforo financiero, fuente de contacto, rango de fechas, trabajador invitado.

**Métricas:**
- Total por año/grado.
- **Conversión `contacto → inscrito`.** Es la métrica que hoy no existe y que admisiones necesita: cuántos contactos registrados terminan llenando el formulario.
- Conversión por paso.
- Tiempo promedio por paso.
- Distribución de resultados del comité.
- Razones de desistimiento.
- **Desistimiento después de admitido** — hay que distinguirlo del desistimiento temprano. No es lo mismo perder un lead que perder un admitido. En el modelo es `lifecycle_status = 'desistido'` con un resultado de comité `allows_enrollment = true` vigente.

**Exportación:** Excel / CSV (SheetJS).

---

## 11. CONVENCIONES OBLIGATORIAS

**Base de datos**
- Toda tabla nueva: `ALTER TABLE public.<tabla> DISABLE ROW LEVEL SECURITY;` explícito.
- SQL siempre primero en DEV (`spjzvpcsgbewxupjvmfm`), verificar con SELECT, luego replicar a PROD (`mrtuerkncqodhakuwjob`). Nunca al revés.
- Antes de escribir SQL o código: consultar `DataBase.md` y `config.js`. La base viva puede diverger de la documentación.

**PostgREST — las tres que nos costaron un error cada una**

1. **`supabaseRequest()` NO serializa el body.** Lo pasa directo a `fetch`, que convierte el objeto a la cadena `"[object Object]"` y PostgREST responde `PGRST102 - Empty or invalid json`. **Siempre `JSON.stringify(payload)`.**

   ```javascript
   await supabaseRequest('/aap_applicants', {
       method: 'POST',
       body: JSON.stringify(payload)   // ← obligatorio
   });
   ```

2. **`aap_contact_sources` exige desambiguación de FK.** Hay dos caminos desde `aap_applicants`: directo (`main_source_id`) y vía la N:N (`aap_applicant_sources`). PostgREST no sabe cuál quieres y responde `PGRST201`.

   ```
   aap_contact_sources!aap_applicants_main_source_fkey(source_name)
   ```

   `grades`, `academic_years`, `aap_referral_types`, `aap_kindergartens` y `aap_fairs` se referencian una sola vez y no necesitan desambiguación. **`aap_loss_reasons` sí** — está dos veces (`withdrawn_reason_id` y `not_admitted_reason_id`).

3. **Nunca pasar `headers` explícitamente** — sobrescribe la API key inyectada.

Además:
- `Prefer: return=representation` ya viene en `getHeaders()`.
- PATCH y DELETE **siempre** con filtro. Ej.: `?config_id=not.is.null`.
- Sin cache-busters en la URL.

**Relaciones N:N** (`aap_applicant_sources`, `aap_form_available_years`): se reemplazan por completo — DELETE de todas las filas del padre, luego POST de las seleccionadas. Es el patrón usado y probado.

**Escapado de HTML obligatorio.** El formulario público del Paso 1 escribe nombres directamente en las tablas que ve el equipo, sin autenticación. Todo lo que venga de la base y se pinte con `innerHTML` pasa por `escapeHtml()`.

**Frontend**
- Bootstrap 5.3 + Bootstrap Icons.
- **Sin gradientes en ningún elemento.** Solo colores sólidos.
- Páginas internas: `initializePage()` + `validatePageAccess('<permiso>')`.
- Páginas públicas: **no** llaman `validatePageAccess()`.
- Correos: `sendNotification(to, subject, htmlContent, silent)`.
- Storage: seguir `GUIA_SUPABASE_STORAGE_SIN_AUTH.md`.
- Quill 1.3.7 para editores de texto enriquecido.
- Versionado de archivos: `26.D.D.N` en el encabezado.

---

## 12. DECISIONES PENDIENTES

### 12.1 El motor de formularios no alcanza para el Paso 4 — BLOQUEA LA FASE 6

El v0.7 asumió que el sistema de formularios dinámicos (`forms` / `form_fields` / `form_responses` / `procedure_instances`) servía tal cual para el Paso 4. **Lo revisé y no alcanza.** Cinco huecos, por gravedad:

**1. No hay concepto de módulo o sección.** `form_fields` solo tiene `field_order`. No hay columna de agrupación. El Paso 4 son **8 módulos** con títulos y navegación paso a paso. Con el motor actual, las ~60 preguntas salen en una sola lista corrida. **Este es el hueco grande; los demás son parcheables.**

**2. El pre-llenado no puede leer del aspirante.** `prefill_source` solo admite `user_name`, `user_email`, `current_date`. El v0.9 exige que los campos ya capturados en el Paso 1 salgan pre-llenados con su valor y editables. El motor solo sabe pre-llenar con datos del *usuario del sistema* — que en el Paso 4 no existe, porque la familia entra sin login.

**3. `validation_rules` no tiene motor.** La columna jsonb existe. **Nada la lee.** El `exact_count: 3` de la pregunta de declaraciones hay que implementarlo desde cero.

**4. El sub-bloque condicional funciona a medias.** `show_if_field_id` / `show_if_value` condiciona un campo a la vez. El Módulo 6 tiene un sub-bloque completo que aparece o desaparece entero. Se puede simular poniendo el mismo `show_if` en cada campo, pero es frágil.

**5. No hay acceso por token.** `forms.standalone_is_public` hace el formulario público a secas. El Paso 4 necesita que la familia entre con su token y que las respuestas queden atadas a *su* aspirante.

**Opciones:**

| | Qué implica | Riesgo |
|---|---|---|
| **(a) Extender el motor** | Agregar secciones, ampliar `prefill_source`, escribir el motor de `validation_rules`, montar acceso por token. | Toca `forms` y `form_fields`, que usan otros módulos. Cualquier error se propaga fuera de admisiones. |
| **(b) Página propia** | `step4-form.html` con los 8 módulos escritos en el HTML. Respuestas igual en `form_responses` / `procedure_instances`. | El formulario deja de ser configurable. |
| **(c) Híbrido** | Motor dinámico para observaciones y comité. Página propia para el Paso 4. | Dos caminos que mantener. |

**Recomendación: (c).** El formulario del Paso 4 tiene contenido institucional cerrado — 8 módulos, ~60 preguntas, aprobados. No cambia cada semestre. Hacerlo dinámico es pagar el costo de un motor genérico para un formulario único y estable. En cambio los formularios de observación **sí** varían por tipo (EAE, dirección de sección, rectoría) y los define cada área: ahí el motor dinámico gana.

**Consecuencia si se elige (b) o (c):** el select de «Formulario del proceso en línea» en `module-config.html` deja de tener sentido y se elimina de la pantalla.

### 12.2 Otras decisiones pendientes

| # | Pendiente | Quién decide | Bloquea |
|---|---|---|---|
| 0 | **Rol de notificación (Paso 9).** Sigue en «Sin asignar» en `aap_module_config`. Es quien dispara la notificación del resultado del comité — típicamente rectoría o dirección académica, no necesariamente admisiones. | Rectoría | Fase 9 |
| 1 | **Reactivación de aplazados.** Un aspirante `aplazado` debe poder reactivarse el año siguiente. ¿Se reactiva el mismo registro (cambia `target_academic_year_id` y vuelve a `en_proceso`)? ¿Se conserva el historial de pasos o se reinicia? ¿Se conserva el resultado del comité anterior? | Desarrollos + Admisiones | Fase 8 |
| 2 | **Anulación administrativa de pasos bloqueados.** Permiso propio, con auditoría. | Desarrollos | Fase 9 |
| 3 | Textos oficiales de las dos autorizaciones del Paso 4. Deben validarse legalmente. | Rectoría / asesoría jurídica | Fase 6 |
| 4 | Monto y datos bancarios del proceso de admisión (van en `document_description` del recibo de pago). | Contabilidad | Fase 6 |
| 5 | Listado definitivo de las 9 declaraciones sobre valores. El Excel tiene una repetida ("conscientes y activos frente al abuso del medio ambiente" aparece dos veces). | Rectoría | Fase 6 |
| 6 | Responsable interno de cada documento del catálogo. | Equipo de admisiones (desde el CRUD) | Fase 6 |
| 7 | Contenido del catálogo de razones de no admisión. | Admisiones / Rectoría | Fase 8 |
| 8 | Campos del formulario dinámico del comité. | Rectoría / Dirección académica | Fase 8 |
| 9 | Campos de los formularios de observación por tipo. | EAE / Dirección de sección | Fase 8 |

**La #1 es la más importante.** "Proceso 2027" era el estado más común en la operación real de admisiones: muchísimas familias aplazan al año siguiente. Si no se define, se va a resolver improvisando.

---

## 13. RIESGOS CONOCIDOS

### 13.1 Documentos de menores en bucket público — SIN RESOLVER

**El bucket `admissions-documents` no se ha creado. No se cree hasta que esta decisión esté tomada.**

La guía de Storage de la plataforma (`GUIA_SUPABASE_STORAGE_SIN_AUTH.md`) especifica buckets públicos. Ahí van a quedar informes médicos, reportes psicológicos y documentos de identidad de menores de edad. Cualquiera con la URL puede verlos sin autenticarse.

Las rutas incluyen el `applicant_id` (uuid) y un timestamp, lo que hace impráctico adivinarlas, pero **no son secretas**.

**Opciones:**
- **(a) Bucket público**, siguiendo el patrón de la plataforma. Simple, consistente, y expone documentos sensibles de menores.
- **(b) Bucket privado con URLs firmadas** de vida corta. Rompe el patrón actual, requiere generar la URL en cada visualización, pero los documentos dejan de ser accesibles por URL.

**Recomendación: (b).** El costo técnico es bajo comparado con el riesgo. Esta decisión debe tomarse con la Directora General antes de la Fase 6.

### 13.2 Formulario público y `anon key`

`form.html` y `step4-form.html` son públicos y usan el `anon key`, que está en `config.js` y es visible en el navegador. Con RLS desactivada, ese key permite leer y escribir cualquier tabla.

Esto **no es un riesgo nuevo** de este módulo (aplica ya a la pantalla de login y a toda la plataforma), pero exponer formularios públicos amplía la superficie. Queda anotado como deuda técnica de plataforma.

### 13.3 Historial de Git

`laurix.html` y `temporal.html` contenían datos personales de menores (232 aspirantes con nombres, fechas de nacimiento, correos y celulares de los padres, y observaciones sensibles) y estaban desplegados públicamente sin control de acceso. Se bajaron del sistema.

**Los archivos siguen en el historial de Git.** Purgarlos requiere reescribir historia, lo cual es incómodo desde GitHub web. Queda como pendiente abierto.

---

## 14. PLAN DE FASES

| Fase | Contenido | Estado |
|---|---|---|
| **1** | Esquema, trigger, datos sembrados, permisos | ✅ **DEV + PROD** |
| **2** | `applicants.html` + `applicant-detail.html` | ✅ DEV |
| **3** | `module-config.html` + `email-templates.html` | ✅ DEV |
| **4** | `leads-review.html` + `form.html` | ← Siguiente |
| **5** | `experiences.html` (Paso 2) + check del Paso 3 | Pendiente |
| **6** | `documents-catalog.html` + `step4-form.html` + `applicant-documents.html` + bucket | **Bloqueada por 12.1 y 13.1** |
| **7** | `applicant-financial.html` (Paso 5 + acuerdos) | Pendiente |
| **8** | `session-types.html` + `applicant-sessions.html` (Pasos 6, 7, 8) | **Bloqueada por 12.2 #1** |
| **9** | Pasos 9, 10 y 11 en la ficha. Desistimientos. | Pendiente |
| **10** | `admissions-reports.html` + `dashboard.html` + encuestas | Pendiente |

**Estado de PROD:** el esquema completo, el trigger y los datos sembrados (11 pasos, 6 resultados, fila de config, 11 plantillas) **ya están en PROD**. Los HTML no — siguen solo en la rama `developmen`.

**Antes del despliegue a PROD** hay que verificar que el trigger `aap_applicants_create_steps` esté allá. Un script de CREATE TABLE no lo arrastra; es un objeto aparte. Si falta, cada aspirante nuevo nace sin sus 11 pasos y la ficha sale vacía sin dar error.

```sql
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.aap_applicants'::regclass AND NOT tgisinternal;
```

**Recomendación:** no desplegar a PROD hasta cerrar la Fase 4. Un `applicants.html` sin formulario público es una libreta de contactos; no vale congelar el esquema por eso.

---

## 15. HISTORIAL

| Fecha | Versión | Avance |
|---|---|---|
| Marzo 2026 | 0.1–0.3 | Flujo inicial. Paso 1 detallado. Sistema de token. |
| Abril 2026 | 0.4–0.5 | Pasos 4–11. Desistimientos. Encuestas. |
| Abril 2026 | 0.6 | Estructura del formulario del Paso 4. Catálogo de documentos. |
| Julio 2026 | 0.7 | Especificación cerrada. Tabla única de aspirante. Reutilización de `procedure_instances`. Modelo de datos completo. |
| Julio 2026 | 0.8 | Esquema como quedó construido en DEV. Arranque desde cero (sin migración). Páginas satélite. Tracker de solo lectura para pasos 4, 8, 10 y 11. Bucket sin crear. Reactivación de aplazados identificada como decisión crítica. |
| Julio 2026 | 0.8.1 | Permisos saneados y documentados con su fase de activación. Se desactivaron 4 permisos que apuntaban a páginas eliminadas o inexistentes (incluido `applicant-process.html`, que no existe en el diseño). Se desactivaron 3 permisos de páginas aún no construidas. El tablero del módulo es `dashboard.html`, no `index.html`. Constraints de la Fase 1 verificados. |
| **Julio 2026** | **0.9** | **Fases 2 y 3 construidas y verificadas en DEV.** Trigger de creación de pasos. Tres convenciones de PostgREST aprendidas a golpes (`JSON.stringify` obligatorio, desambiguación de `aap_contact_sources`, escapado de HTML). Paso 1 pasa a solo lectura; transición `inscrito → en_proceso` automatizada. `form-config.html` eliminado. Plantillas de correo como conjunto fijo. **Identificado que el motor de formularios no alcanza para el Paso 4** — decisión bloqueante de la Fase 6. `marketing_contacts` vacía: `upload-campaigns.html` nunca probado. |
