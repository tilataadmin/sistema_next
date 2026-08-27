# MÓDULO DE ADMISIONES — SchoolNet

**Documento:** Especificación funcional y técnica del módulo de admisiones
**Versión:** 0.14
**Última actualización:** 17 de julio de 2026
**Reemplaza:** v0.7 … v0.13 (todos retirados)
**Estado:** Fases 1–3, 5, 6 y 7 completas en DEV. Fase 4 parcial (`form.html` listo; `leads-review.html` en espera). **Fase 10 (dashboard + consultas) completa en DEV y desplegada a PROD.** Fases 8 y 9 pendientes. Módulo desplegado a PROD (ficha, formularios, catálogos, satélites, `module-config.html`, dashboard y reportes); permisos de PROD alineados con lo desplegado.

---

## 0. QUÉ CAMBIA RESPECTO A v0.13

El v0.14 cierra la **Fase 10 (dashboard + consultas)** y la despliega a PROD, documenta dos mejoras de la ficha, y registra la corrección de un desfase de permisos en PROD.

| # | Cambio | Sección |
|---|---|---|
| 1 | **Fase 10 completa en DEV y desplegada a PROD:** `dashboard.html` (tablero del módulo con KPIs y gráficas de barras CSS — estado, origen, grado, año, referidos, semáforo financiero, desistimientos por causa y por paso, registros por mes, y un embudo aproximado) y `admissions-reports.html` (tabla filtrable de aspirantes con exportación a Excel y CSV vía SheetJS). | 9.2, 10, 14 |
| 2 | **Embudo aproximado (dashboard).** Los desistidos se ubican en el embudo según su `withdrawn_step_id` (paso de salida real), no por un supuesto fijo. El embudo *fiel* por paso, con tiempos, sigue siendo trabajo de reportes y depende de que los pasos se marquen con fecha. | 8.1, 10 |
| 3 | **Acción «Marcar desistimiento» en la ficha.** `applicant-detail.html` escribe `withdrawn_reason_id` (causa obligatoria, categoría `desistimiento`), `withdrawn_step_id`, `withdrawn_destination_school`, `withdrawn_notes`, `withdrawn_at` y `withdrawn_by`, y pasa el aspirante a `lifecycle_status = 'desistido'`. Banner en la ficha cuando ya desistió; botón oculto en estados terminales. La *reversión* de un desistimiento queda fuera (misma decisión pendiente que la anulación administrativa, 12.2 #2). | 8.1, 9 |
| 4 | **Contador de documentos en la ficha.** La tarjeta «Documentos» muestra «X de Y cargados» (Y = documentos `required` + `required_deferred` del grado; se excluyen los `optional`). No bloqueante: si falla o el aspirante no tiene grado, conserva la leyenda. Cierra el contador que quedaba pendiente en 8.1. | 8.1 |
| 5 | **Permisos de Fase 10 activados** en DEV y PROD: `Dashboard` y `Reportes` (`active`, con su `url_path`). | 9.4 |
| 6 | **Corrección de desfase de permisos en PROD (Fase 6).** En PROD habían quedado `inactive` «Catálogo de documentos» (se activó, conserva ruta) y «Documentos del aspirante» (se activó **y** se le quitó el `url_path`, por ser satélite). PROD quedó alineado con lo desplegado y con DEV. | 9.4 |

**Estado de despliegue (v0.14):** el módulo está desplegado a PROD (ficha, formulario público del Paso 1, Paso 4, catálogos, satélites, `module-config.html`, dashboard y reportes). Los datos reales de PROD son mínimos todavía (el ciclo aún no opera en el sistema), así que el dashboard y los reportes saldrán casi vacíos allá — es lo esperado, no un error. El sembrado de prueba (`SEED_FASE10`, 24 aspirantes + revisiones financieras) vive **solo en DEV**; PROD nunca lo tuvo y no hay nada que limpiar allá.

---

## 0-bis. QUÉ CAMBIA RESPECTO A v0.12

El v0.13 cierra la **Fase 7 (Financiero)** y añade el **borrado de documentos** que quedaba pendiente de la Fase 6.

| # | Cambio | Sección |
|---|---|---|
| 1 | **Fase 7 completa en DEV:** `applicant-financial.html` (satélite) con semáforo (verde/amarillo/rojo, asignación manual por el equipo financiero), historial de revisiones y acuerdos financieros con sus 5 estados. | 9.2, sección Financiero |
| 2 | **Color del semáforo en la ficha:** la tarjeta "Financiero" de `applicant-detail.html` muestra el color vigente (lectura amplia para los implicados) y enlaza a la satélite (gestión restringida por permiso). | 8.1 |
| 3 | **Permiso «Financiero del aspirante» activo sin `url_path`** (satélite; se abre desde la ficha, no desde el menú). | 9.4 |
| 4 | **Borrado de documentos (cierre de Fase 6):** endpoint `delete-document.js` + botón "Eliminar" en `applicant-documents.html`. Respeta la regla: no se borran documentos previos al envío final; sí los `is_post_final_submission`. | 7.5, 7.6 |

**Contexto de despliegue (dicho por Desarrollos en esta sesión):** las tablas de PROD están listas, el código en GitHub listo; el push a PROD lo hará Desarrollos cuando decida, y **los catálogos (documentos, etc.) los llenarán las responsables del proceso.**

---

## 0-ter. QUÉ CAMBIÓ EN v0.12 (histórico)

El v0.12 cierra la **Fase 6 completa**: la interfaz de documentos y, sobre todo, el **Paso 4 (`step4-form.html`)** construido bajo la opción híbrida (c). Se resolvió el motor de formularios que bloqueaba la fase. El esquema del Paso 4 quedó replicado en PROD.

| # | Cambio | Sección |
|---|---|---|
| 1 | **Fase 6 — interfaz de documentos completa en DEV:** `documents-catalog.html` (CRUD del catálogo + asignación de grados N:N + responsable) y `applicant-documents.html` (satélite: subir/ver documentos con los dos endpoints). | 7.6, 9.2 |
| 2 | **Paso 4 completo (`step4-form.html`)** bajo la opción **(c) híbrida**: página propia, dirigida por datos de `form_fields`, con guardado de borrador, reanudación, condicionales, documentos y envío final con validación. | 7.6 |
| 3 | **Corrección al §7.1:** la estructura de módulos del v0.11 era incorrecta. Los módulos 4 y 5 NO son "Datos de Familiar 1/2" (esos datos se capturan en el Paso 1). La estructura real del Excel está en 7.1. | 7.1 |
| 4 | **Un solo formulario con render condicional por grado.** No dos formularios. La página muestra la variante Preescolar o Primaria/Bachillerato según `grade_order` del aspirante. | 7.6 |
| 5 | **Limpieza de `module-config.html`:** se eliminó el select «Formulario del proceso en línea». `step4_form_id` se fija por SQL y la página lo lee de la config. | 7.4, 7.6 |
| 6 | **Bucket `admissions-documents` creado en PROD** y variables de Vercel (`SUPABASE_URL`/`ANON_KEY`/`SERVICE_ROLE_KEY`) ya separadas por entorno. | 13.1, 14 |
| 7 | **Corrección de permiso:** «Ficha individual del aspirante» aparecía en el menú y fallaba al abrirse en seco. Se le quitó el `url_path` (activo, sin ruta). | 9.4 |
| 8 | **Cinco convenciones/lecciones técnicas nuevas** (índice único de `form_responses`, convenio `__NOT__`, clasificación por `grade_order`, `informative_text` desde `help_text`, `field_label` es varchar(255)). | 11 |

**Herencia vigente:** deduplicación diferida, modo edición por token, flag `SCHOOLNET_PUBLIC_PAGE`, las tres convenciones de PostgREST, el trigger de pasos.

**Decisiones que se DESTRABARON en v0.12:** el motor de formularios (12.1, opción c elegida); las declaraciones (8 opciones únicas); los textos legales y el monto bancario resultaron ser contenido editable por pantalla, no bloqueos de construcción; el destinatario de `paso4_envio_final` (admisiones@colegiotilata.edu.co + acuse a la familia).

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
>
> **`leads-review.html` queda en espera** hasta que el equipo de admisiones se reintegre y pruebe `upload-campaigns.html` con un CSV real. No tiene sentido construir la pantalla de revisión antes de confirmar que la carga funciona y de ver la forma real de los datos.

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

### 5.2 Deduplicación diferida (decisión v0.10)

**El formulario público NO lee `aap_applicants`.** Solo inserta.

Razón de seguridad: con RLS desactivada y el `anon key` visible en el navegador, un formulario público que pudiera hacer `SELECT` sobre `aap_applicants` permitiría a cualquiera leer **toda la base de aspirantes** — nombres de menores, correos, teléfonos — abriendo la consola. La deduplicación automática del v0.9 (buscar coincidencia por fecha + correo antes de insertar) exigía justamente ese SELECT. Se descarta.

**Nuevo comportamiento:** el formulario siempre crea registro nuevo con `origin = 'formulario'` y `lifecycle_status = 'inscrito'`. La detección de duplicados se hace **del lado del equipo**, en `applicants.html`, como una alerta "estos dos registros podrían ser el mismo aspirante". El equipo ya revisa los inscritos de todas formas.

El caso que esto cubre (familia registrada por teléfono que luego llena el formulario sin usar el enlace) es real pero poco frecuente, y resolverlo del lado del equipo es mucho más barato que exponer la base de menores al internet abierto.

**Pendiente de construir:** la alerta de posibles duplicados en `applicants.html`. No urge — sin inscripciones reales todavía no hay duplicados. Se construye cuando el módulo entre en operación.

### 5.3 Comportamiento — implementado y probado

**Página pública.** No llama `validatePageAccess()`, no requiere sesión, no muestra navbar ni sidebar (ver flag `SCHOOLNET_PUBLIC_PAGE` en el capítulo 11).

**Estado cerrado.** Si `aap_module_config.form_is_open = false`, muestra el mensaje de cierre y no renderiza el formulario.

**Envío (registro nuevo):**
1. Genera `access_token` con `crypto.randomUUID()`.
2. Inserta en `aap_applicants` con `lifecycle_status = 'inscrito'`, `origin = 'formulario'`.
3. Congela `step1_submission` (jsonb con todo lo enviado, incluidos los medios seleccionados).
4. Inserta los medios en `aap_applicant_sources` (N:N).
5. Marca el Paso 1 como `Completado` en `aap_applicant_steps` (las 11 filas ya existen por el trigger).
6. Envía la plantilla `inscripcion_confirmacion` con el `token_url` por `sendNotification`. **No bloqueante:** si el correo falla, la inscripción ya quedó guardada.

**Modo edición (`?token=...`):**
- Consulta **solo** por `access_token=eq.{token}`. El token es un UUID v4 (122 bits): imposible de adivinar o enumerar. Sin token no devuelve nada; con token válido, un único registro. Seguro incluso con el `anon key` público.
- Si el token no existe → pantalla "Enlace no válido".
- Si el aspirante ya avanzó (`lifecycle_status != 'inscrito'`) → datos en **solo lectura** con mensaje "Tu inscripción está en revisión".
- Si está `inscrito` → carga los datos, muestra banner de edición, y el envío hace **PATCH filtrado por token** en vez de INSERT.
- El PATCH **nunca toca** `step1_submission` (snapshot inmutable), `lifecycle_status`, ni ningún campo de proceso. Solo datos de inscripción.
- Los medios se releen del snapshot (`step1_submission.medios_seleccionados`), porque el formulario público no lee la tabla N:N.

**Recuperación de token (decisión v0.10):** **no** se hace desde el cliente — buscar por correo implicaría leer la tabla. Se resuelve desde la ficha del aspirante con el botón de reenvío (`token_reenvio_admin`), que es una acción del equipo con sesión. En el formulario público solo se indica a la familia que contacte a admisiones si perdió su enlace.

**No pide jardín.** El jardín de referencia es dato interno que asigna el equipo; no se le pregunta a la familia.

**Reenvío por administradores** e **inscripción de hermanos** (precarga de Familiar 1 y 2): pendientes, se agregan cuando el equipo lo requiera.

---

## 6. PASO 2---

## 6. PASO 2 — EXPERIENCIAS (Fase 5, completa en DEV)

`aap_experience_types` (modalidades) → `aap_experience_events` (convocatorias con fecha, hora, lugar, cupo, responsable) → `aap_applicant_experiences` (inscripción + asistencia, con UNIQUE por aspirante+evento).

**Pantalla `experiences.html`** — una sola pantalla, dos pestañas:
- **Eventos:** convocatorias con filtro (Próximos / Programadas / Realizadas / Canceladas / Todos). Tarjeta con fecha, badges de estado e inscripción abierta, contador de inscritos/cupo.
- **Modalidades:** CRUD del catálogo.

**Registro de asistencia:** desde el evento → botón "Asistentes" → lista de inscritos con toggle de asistencia.

**Inscripción interna:** botón "Inscribir aspirante" en el modal de asistentes, con buscador por nombre/apellido (debounce 300ms, `ilike`, límite 15). Cubre el reagendamiento que hace admisiones. Verifica el `UNIQUE` antes de insertar para no duplicar.

**Inscripción de la familia (Paso 1):** el campo 27 de `form.html` lista los eventos con `is_open_for_registration = true`, `event_status = 'Programada'` y `event_date >= hoy`. Es **opcional** (la familia puede coordinarla después). La sección solo se muestra si hay eventos disponibles. Al enviar, crea la fila en `aap_applicant_experiences`. En modo edición la familia solo **agrega** (no reemplaza lo que el equipo pudo haber asignado).

**Trabajadores:** se cargan con `worker_first_name`/`worker_last_name_1`/`worker_last_name_2` y se formatean con `formatWorkerName()` / `sortWorkersByName()` de `config.js`.

---

## 7. PASO 4---

## 7. PASO 4 — PROCESO EN LÍNEA

Las respuestas viven en `forms` / `form_fields` / `field_option_catalog` / `procedure_instances` / `form_responses`. La instancia se crea con `procedure_id = NULL` y `form_id = aap_module_config.step4_form_id`.

### 7.1 Estructura del formulario (corregida en v0.12 contra el Excel real)

> **Corrección:** el v0.11 describía los módulos 4 y 5 como "Datos de Familiar 1/2". **Eso era incorrecto** — esos datos se capturan en el Paso 1 y el Paso 4 no los vuelve a pedir. La estructura real, tomada del Excel institucional (`Formulario_Admisiones_Tilatá_-_Sistema.xlsx`), es:

| # | Módulo | Contenido |
|---|---|---|
| 1 | Autorizaciones para el inicio del proceso | Habeas data + centrales de riesgo. **Bloqueantes.** Textos desde `aap_module_config`; la respuesta Sí/No se captura como 2 campos. |
| 2 | Información inicial | 8 preguntas comunes + **4 solo Primaria/Bachillerato** (historia académica). |
| 3 | Queremos conocer a tu familia | Incluye la pregunta de declaraciones (checkbox) con `validation_rules = {"exact_count": 3}`. |
| 4 | ¿Por qué Tilatá? | 3 preguntas abiertas. |
| 5 | Queremos conocer a tu hijo | 8 preguntas abiertas. |
| 6 | Información del proceso de desarrollo y formación | Texto introductorio (`informative_text`) + sub-bloque condicional de apoyo terapéutico (`show_if`). |
| 7 | Preguntas para tu hijo | En segunda persona. |
| 8 | Documentación e información financiera | Pregunta opcional de ingresos + documentos requeridos (reutiliza el catálogo). Valida que los `required` estén cargados antes del envío. |

**Los módulos 3 a 7 son idénticos entre Preescolar y Primaria.** Solo difieren en el módulo 2 (+4 preguntas para Primaria) y en la lista de documentos del módulo 8. Por eso **es un solo formulario** con render condicional por grado (ver 7.6), no dos.

Los campos ya capturados en el Paso 1 se muestran pre-llenados y editables. La respuesta del Paso 4 queda en `form_responses`; el valor original del Paso 1 se conserva intacto en `step1_submission`.

### 7.2 Documentos

| `obligation_type` | Comportamiento |
|---|---|
| `required` | Bloquea el envío final del Paso 4. |
| `required_deferred` | No bloquea el Paso 4, pero **bloquea el Paso 10** (Prematrícula). |
| `optional` | No bloquea nada. |

Por defecto son `required_deferred`: paz y salvo y último reporte del colegio anterior.

El envío final del Paso 4 **bloquea** si falta algún documento `required` (regla implementada en `step4-form.html`, ver 7.6).

**Storage:** bucket privado `admissions-documents` — creado y probado en **DEV y PROD**. Ver 7.5 y 13.1.

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

Secciones: estado del formulario público · años académicos habilitados · textos del Paso 1 · textos de autorizaciones del Paso 4 · rol de notificación del Paso 9.

> **Cambio v0.12:** se eliminó de la pantalla el select «Formulario del proceso en línea». Con la opción (c), el `step4_form_id` se fija una sola vez por SQL y la página lo lee de la config; dejar que un humano lo cambiara desde la pantalla podía romper el enganche de respuestas.

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

### 7.5 Infraestructura de documentos — bucket privado (resuelta y probada)

**Decisión:** el bucket `admissions-documents` es **privado** (no público), a diferencia del patrón de la plataforma. Ahí van documentos de identidad, paz y salvos, reportes del colegio anterior e **informes médicos/psicológicos de menores**. Un bucket público dejaría esos documentos accesibles por URL permanente; inaceptable para datos clínicos de niños.

**Cómo funciona el acceso:**
- El bucket **no tiene políticas para el rol `anon`** → el `anon key` (visible en el navegador) no puede tocarlo.
- Solo la **service_role key** entra, y vive **exclusivamente** en dos endpoints serverless. Nunca llega al navegador.

**Endpoints (en `api/admissions/`, patrón CommonJS + `fetch`, igual que los cron):**

- **`upload-document.js`** — recibe el archivo en base64. Valida sesión (si lo sube el equipo) o lo permite sin sesión (si lo sube la familia, `uploaded_by_family = true`). Verifica que el aspirante exista. Sube al bucket con la service key en ruta `{applicant_id}/{timestamp}_{nombre}`. Registra en `aap_applicant_documents`. Valida tamaño (10 MB) y MIME (pdf/jpeg/png/webp).
- **`sign-document.js`** — recibe `applicant_document_id`. Valida sesión (ver documentos **siempre** requiere sesión). Toma la ruta **de la BD** (no del cliente). Devuelve una URL firmada de **5 minutos**.
- **`delete-document.js`** (v0.13) — recibe `applicant_document_id` + `user_id`. Requiere sesión. Lee la ruta de la BD, **aplica la regla de bloqueo** (no borra documentos previos al envío final; sí los `is_post_final_submission`), borra el objeto del bucket (Storage: solo `Authorization`) y luego la fila (REST: ambos headers).

**Variables de entorno (Vercel):** `SUPABASE_SERVICE_ROLE_KEY`, separada por entorno — valor de DEV en Preview, valor de PROD en Production.

**Modelo de seguridad — honesto:** la sesión de SchoolNet usa `user_id` plano (sin JWT), así que la validación **bloquea al público anónimo** pero confía en la capa de sesión existente para usuarios internos. Es coherente con el resto de la plataforma; blindaje criptográfico completo sería un proyecto aparte (migrar todo SchoolNet a JWT).

**Lección técnica clave:** la Storage API de Supabase con keys *legacy* rechaza la petición (`signature verification failed`) si se envían **ambos** headers `apikey` y `Authorization`. Para Storage, usar **solo** `Authorization: Bearer {service_key}`. Las llamadas a la REST API (PostgREST) sí necesitan ambos.

**Estado:** bucket creado y probado en **DEV y PROD** (subida + firma + apertura).

### 7.6 Paso 4 construido — opción (c), dirigido por datos (v0.12)

Se eligió la **opción (c)** de 12.1: página propia para el Paso 4, motor dinámico reservado para observaciones y comité (Fase 8). La página **no duplica las preguntas en el HTML**: las lee de `form_fields`. Es un renderizador a medida que maneja el condicional por grado, el sub-bloque terapéutico, la validación de las 3 declaraciones, el pre-llenado del Paso 1 y el módulo de documentos.

**Sembrado en la base (DEV y PROD):**
- Un registro contenedor en `forms` (`form_mode = 'standalone_only'`, `standalone_is_public = false`). En ambos entornos quedó `form_id = 10` (coincidencia por la réplica PROD→DEV; **la página no asume ese número**).
- **50 `form_fields`** (`field_order` 1–50): módulo 1 (2 campos de autorización), módulos 2–7 (preguntas), y el campo `ingresos_no_formales` (orden 50). El módulo 8 (documentos) **no** son `form_fields`: reutiliza el catálogo.
- `aap_module_config.step4_form_id` apunta al contenedor.

**La página lee `step4_form_id` de `aap_module_config`** (no está fijo en el código). Así funciona en cualquier entorno sin cambiar código, sin depender de que los ids coincidan.

**Mecánica implementada y probada en DEV:**
- **Acceso público por token** (`?token=`), mismo patrón que `form.html`. Estados: sin token, token inválido, ya enviado.
- **Render condicional por grado:** `grade_order <= 0` → Preescolar (oculta los 4 campos de Primaria); `>= 1` → Primaria/Bachillerato.
- **Condicionales `show_if`:** sub-bloque terapéutico (mostrar si `apoyo_terapeutico = 'Sí'`) y referido (convenio `__NOT__`, ver 11).
- **Instancia:** al abrir por primera vez crea la `procedure_instance` (`procedure_id = NULL`, `form_id`, `in_progress`) y marca `step4_started_at` + `step4_instance_id`. Reutiliza la existente al reabrir.
- **Guardar borrador:** sin validaciones (permite vacíos; la familia diligencia por fases). Reemplazo completo de las respuestas de la instancia. **Una fila por campo** (los checkbox unen sus valores con ` || `, por el índice único; ver 11).
- **Reanudar:** al volver con el enlace, recarga las respuestas guardadas.
- **Envío final con validación:** ambas autorizaciones en "Sí autorizo", 3 declaraciones exactas, obligatorios **visibles** llenos, y documentos `required` cargados. Marca `step4_submitted_at`, instancia `completed`, y el Paso 4 del tracker en `Completado`.
- **Documentos (módulo 8):** la familia ve los requeridos de su grado y los sube con `uploaded_by_family = true` (endpoint `upload-document.js`, sin sesión).
- **Borrado de documentos (v0.13):** el equipo puede eliminar documentos desde `applicant-documents.html` (endpoint `delete-document.js`). Botón "Eliminar" por documento; si el aspirante ya hizo el envío final, los documentos previos muestran un candado en vez del botón (el bloqueo real lo hace el endpoint). Los agregados tras el envío (`is_post_final_submission = true`) sí se pueden borrar.
- **Notificaciones de envío final (no bloqueantes):** aviso interno a `admisiones@colegiotilata.edu.co` con la plantilla `paso4_envio_final`, más un acuse a la familia (`familiar1_email`).

**Contenido que se llena por pantalla (no bloquea el código):** los textos legales de las autorizaciones se pegan en `module-config.html` (Rectoría confirma); el monto y datos bancarios van en la descripción del documento "Recibo de pago" en `documents-catalog.html` (Contabilidad).

---

## 8. LA FICHA DEL ASPIRANTE

### 8.1 Estructura

`applicant-detail.html` contiene:

- **Datos del aspirante:** todos los campos editables.
- **Tracker de los 11 pasos.**
- **Barra de acceso a las satélites** con estado, no solo enlaces: "Documentos (3 de 7)", "Sesiones (2 realizadas)", "Financiero: 🟡".

**Estado real de la barra (v0.13):**
- **Documentos** → activo, enlaza a `applicant-documents.html` ("Ver y subir documentos").
- **Financiero** → activo, enlaza a `applicant-financial.html` y **muestra el color del semáforo vigente** ("Semáforo: 🟢 Verde", o "sin revisión"). La consulta a `aap_financial_reviews` es no bloqueante: si falla, el enlace sigue activo. Esto cubre la lectura amplia del color; la gestión vive en la satélite (permiso propio).
- **Observaciones y comité** → deshabilitado (Fase 8).
- **Contador de documentos (v0.14)** → activo: la tarjeta «Documentos» muestra «X de Y cargados» (Y = documentos `required` + `required_deferred` del grado; los `optional` se excluyen). No bloqueante: si falla o el aspirante no tiene grado, conserva la leyenda. El contador de «Sesiones» sigue pendiente (Fase 8).

**Acción «Marcar desistimiento» (v0.14).** Botón en el encabezado de la ficha, visible solo en estados activos (`contacto`, `inscrito`, `en_proceso`). Abre un modal con causa obligatoria (razón de categoría `desistimiento`), paso de salida opcional (`withdrawn_step_id`, poblado desde los pasos del aspirante), colegio destino y notas. Al confirmar, escribe `withdrawn_reason_id`, `withdrawn_step_id`, `withdrawn_destination_school`, `withdrawn_notes`, `withdrawn_at` y `withdrawn_by`, y pasa el aspirante a `desistido`. La ficha muestra un banner con la causa y oculta el botón. La **reversión** de un desistimiento no se construye — es la misma decisión pendiente que la anulación administrativa (12.2 #2).

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
| `form.html` | **Público.** Formulario del Paso 1 (envío + edición por token) | 4 | ✅ DEV |
| `leads-review.html` | Base 0: validar / siga / pare | 4 | ⏸ Espera equipo de admisiones |
| `experiences.html` | Paso 2: modalidades + eventos + asistencia + inscripción interna | 5 | ✅ DEV |
| `documents-catalog.html` | Fase 6: catálogo de documentos (CRUD + grados + responsable) | 6 | ✅ DEV |
| `step4-form.html` | **Público.** Paso 4 completo (formulario + documentos) | 6 | ✅ DEV |
| `applicant-documents.html` | **Satélite.** Documentos del aspirante (subir/ver) | 6 | ✅ DEV |
| `applicant-financial.html` | **Satélite.** Semáforo + acuerdos financieros | 7 | ✅ DEV |
| `session-types.html` | Tipos de sesión + roles autorizados | 8 | Pendiente |
| `applicant-sessions.html` | **Satélite.** Observaciones y comité | 8 | Pendiente |
| `admissions-reports.html` | Consultas y exportaciones (tabla filtrable + Excel/CSV) | 10 | ✅ DEV + PROD |
| `dashboard.html` | Tablero del módulo (KPIs, gráficas, embudo aproximado) | 10 | ✅ DEV + PROD |

> **No hay `index.html`.** El tablero del módulo es `dashboard.html`.
> **`form-config.html` fue eliminado.** Su contenido está en `module-config.html`.

### 9.3 Páginas satélite

Las tres satélites reciben `?applicant_id={uuid}` y validan que el aspirante exista antes de renderizar. Cada una lleva un botón "← Volver al aspirante" arriba, con el nombre del aspirante visible.

**Motivo de la separación:** con edición solo por GitHub web, un `applicant-detail.html` que contuviera todo sería un archivo de miles de líneas donde cada cambio arriesga romper algo lejano.

### 9.4 Permisos — estado verificado en DEV y PROD

**Regla:** un permiso solo se activa cuando su página existe. Si se activa antes, el sidebar muestra un ítem que lleva a un 404.

**Activos y visibles en el menú (v0.12):**

`Aspirantes` · `Configuración general del módulo` · `Plantillas de correo` · `Experiencias` · `Fuentes de contacto` · `Ferias de preescolares` · `Nacimiento - grados` · `Gestionar acciones de jardines` · `Jardines infantiles` · `Razones de pérdida` · `Tipos de referidos` · `Subir archivos de campañas` · **`Catálogo de documentos`** (activado en Fase 6) · **`Dashboard`** y **`Reportes`** (activados en Fase 10, en DEV y PROD)

**Activos pero SIN `url_path` — no salen en el menú (se abren solo desde la ficha):**

- **`Ficha individual del aspirante`** — el menú se arma leyendo permisos activos con `url_path`. La ficha necesita `?applicant_id=`; abrirla en seco desde el menú fallaba. **Corrección v0.12:** se le quitó el `url_path`; sigue activa para validar acceso, pero no aparece en la barra. Se llega desde el listado de aspirantes.
- **`Documentos del aspirante`** — misma lógica: es satélite (`?applicant_id=`). Activada en Fase 6 **sin** `url_path`; se llega desde la ficha.
- **`Financiero del aspirante`** — satélite (`?applicant_id=`). Activada en Fase 7 **sin** `url_path`; se llega desde la tarjeta "Financiero" de la ficha. La lectura del color del semáforo es amplia (en la ficha); la gestión (revisiones, acuerdos) es restringida por este permiso.

> **Lección v0.12:** el sidebar se arma solo desde la base (permiso `active` + `permission_module = 'admissions'` + `url_path` no nulo). No hay que tocar `sidebar.js` para agregar un ítem del módulo. Para páginas satélite (que exigen `applicant_id`), el patrón correcto es **permiso activo sin `url_path`**.

**Inactivos, se activan al terminar su fase:**

| Permiso | `url_path` | Activar en |
|---|---|---|
| Revisión de leads | `leads-review.html` | Fase 4 |
| Tipos de sesión | `session-types.html` | Fase 8 |
| Sesiones del aspirante | `applicant-sessions.html` (satélite → sin ruta) | Fase 8 |

**Inactivos y sin `url_path` — no se reactivan nunca:**

`Estados del proceso` · `Pasos del proceso` · `Gestión de pasos por aspirante` · `Vista de seguimiento del proceso` · `Configuración del formulario`

Apuntaban a páginas eliminadas o inexistentes. No se borran con DELETE por las FKs desde `role_permissions`; quedan desactivados y sin ruta.

**Las páginas públicas (`form.html`, `step4-form.html`) no llevan permiso** y no llaman `validatePageAccess()`.

**Después de activar un permiso:** limpiar `schoolnet_sidebar_permissions` de `sessionStorage`, o cerrar la pestaña y abrir una nueva.

> **Advertencia:** el bloque de permisos de la Fase 1 usó `ON CONFLICT DO UPDATE` y revivió tres permisos que ya habían sido desactivados a propósito. Antes de cualquier carga de permisos, hacer un SELECT previo y verificar contra esta tabla.

**Alineación de permisos en PROD (v0.14).** Al desplegar Fase 10 se activaron en PROD `Dashboard` y `Reportes` (ambos ya tenían su `url_path`). Además se corrigió un desfase de Fase 6 que había quedado en PROD: «Catálogo de documentos» estaba `inactive` (se activó, conserva ruta) y «Documentos del aspirante» estaba `inactive` **y con `url_path` puesto** (se activó **y** se le quitó la ruta, por ser satélite). Con eso PROD quedó alineado con lo desplegado y con DEV. El resto de permisos `inactive` en PROD es correcto: `Revisión de leads` (Fase 4, en espera), `Tipos de sesión` y `Sesiones del aspirante` (Fase 8), y los cinco que "no se reactivan nunca". Todos los `UPDATE` de activación se hicieron quirúrgicos (filtro por nombre exacto + `permission_status = 'inactive'`), nunca por upsert.

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

**Storage API vs REST API (endpoints serverless):** la Storage API rechaza la firma si se envían los dos headers `apikey` + `Authorization`. Para Storage usar **solo** `Authorization: Bearer {service_key}`. La REST API (PostgREST) sí necesita ambos. Endpoints en `api/`: CommonJS (`module.exports`), `fetch` puro, sin SDK.

**Escapado de HTML obligatorio.** El formulario público del Paso 1 escribe nombres directamente en las tablas que ve el equipo, sin autenticación. Todo lo que venga de la base y se pinte con `innerHTML` pasa por `escapeHtml()`.

**Frontend**
- Bootstrap 5.3 + Bootstrap Icons.
- **Sin gradientes en ningún elemento.** Solo colores sólidos.
- Páginas internas: `validatePageAccess('<permiso>')`.
- **Páginas públicas** (`form.html`, y luego `step4-form.html`): declaran `window.SCHOOLNET_PUBLIC_PAGE = true` **antes** de cargar `config.js`. Esto evita que `injectUserNavbar()` monte el navbar y el sidebar internos. No llaman `validatePageAccess()`.

  ```html
  <script>window.SCHOOLNET_PUBLIC_PAGE = true;</script>
  <script src="../../assets/js/config.js"></script>
  ```

  El cambio en `config.js` es aditivo (una condición al inicio de `injectUserNavbar`) y no afecta las 250+ páginas internas. `injectUserNavbar` ya se protegía sola cuando no hay sesión; el flag lo hace explícito y robusto ante usuarios con sesión que abren una página pública.
- Correos: `sendNotification(to, subject, htmlContent, silent)`.
- Storage: seguir `GUIA_SUPABASE_STORAGE_SIN_AUTH.md`.
- Quill 1.3.7 para editores de texto enriquecido.
- Versionado de archivos: `26.D.D.N` en el encabezado.

**Motor de formularios / Paso 4 — lecciones nuevas (v0.12)**

Estas se aprendieron construyendo el Paso 4 y **no estaban en `DataBase.md`**; conviene reflejarlas ahí.

1. **Índice único no documentado: `idx_form_responses_unique (instance_id, field_id)`** en `form_responses`. Impide dos filas con el mismo campo por instancia. Consecuencia: cada campo se guarda como **una sola fila**. Los checkbox de valores múltiples (declaraciones) unen sus valores con el delimitador ` || ` y se separan al reanudar.

2. **Convenio `__NOT__` en `show_if_value`.** El motor solo sabe "mostrar si el padre = valor". No tiene "distinto de". Para `referido_nombre` (mostrar si `referido_tipo` ≠ "No vengo referido") se usa `show_if_value = '__NOT__No vengo referido'`; la página interpreta el prefijo `__NOT__` como "distinto de". El sub-bloque terapéutico sí es "igual a Sí" normal.

3. **`field_label` es `varchar(255)`.** Un texto largo (p. ej. el intro de información sensible) no cabe. Los `informative_text` llevan un `field_label` corto y **el cuerpo va en `help_text`** (tipo `text`, sin límite). La página renderiza el `informative_text` desde `help_text`.

4. **Clasificación Preescolar vs Primaria por `grade_order`, no por nombre de sección.** Preescolar = `grade_order <= 0` (Prejardín −2, Jardín −1, Transición 0). Hay cuatro secciones (Preescolar, Primaria, Escuela media, Escuela alta); usar el nombre sería frágil.

5. **`form_fields` no tiene columna de módulo.** La agrupación en los 8 módulos va por rangos de `field_order`, fija en la página (constante `MODULOS`). Coherente con la opción (c).

6. **La página del Paso 4 lee `step4_form_id` de `aap_module_config`**, no lo tiene fijo. Robusto ante ids distintos entre entornos.

7. **Réplica PROD→DEV.** El equipo replica periódicamente PROD sobre DEV para pruebas fidedignas. Implica que los seriales (`form_id`, `field_id`) coinciden entre entornos, y que **una réplica sobrescribe en DEV lo que se haya sembrado allí**. PROD es el origen; sembrar allí primero cuando el cambio debe sobrevivir a una réplica.

---

## 12. DECISIONES PENDIENTES

### 12.1 El motor de formularios no alcanza para el Paso 4 — RESUELTO en v0.12 (opción c)

> **Resuelto:** se eligió la **opción (c)**. `step4-form.html` es una página propia dirigida por datos (lee `form_fields`), no el motor genérico. Los cinco huecos de abajo se resolvieron a mano en la página (módulos por rango de orden, pre-llenado desde `aap_applicants` en JS, validación de `exact_count` y de documentos, sub-bloque condicional con `show_if`, acceso por token). Ver 7.6. Se mantiene el registro histórico del análisis:

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
| 3 | Textos oficiales de las dos autorizaciones del Paso 4. **No bloquea el código:** se editan en `module-config.html` y la página los lee de config. Los textos existen en el Excel; falta que Rectoría/jurídica confirme que son los definitivos y alguien los pegue. | Rectoría / asesoría jurídica | Contenido |
| 4 | Monto y datos bancarios. **No bloquea el código:** van en la descripción del documento "Recibo de pago" en `documents-catalog.html`. Falta el dato de Contabilidad. | Contabilidad | Contenido |
| 5 | **RESUELTO (v0.12): son 8 declaraciones únicas** (se quitó la repetida "abuso del medio ambiente"). Ya están sembradas en `fam_declaraciones`. | Rectoría | ✅ |
| 6 | Responsable interno de cada documento del catálogo. Se asigna desde `documents-catalog.html` (campo nullable). | Equipo de admisiones (desde el CRUD) | Contenido |
| 7 | Contenido del catálogo de razones de no admisión. | Admisiones / Rectoría | Fase 8 |
| 8 | Campos del formulario dinámico del comité. | Rectoría / Dirección académica | Fase 8 |
| 9 | Campos de los formularios de observación por tipo. | EAE / Dirección de sección | Fase 8 |

**La #1 es la más importante.** "Proceso 2027" era el estado más común en la operación real de admisiones: muchísimas familias aplazan al año siguiente. Si no se define, se va a resolver improvisando.

---

## 13. RIESGOS CONOCIDOS

### 13.1 Documentos de menores — RESUELTO (bucket privado)

**Decidido y probado:** bucket **privado** `admissions-documents`, acceso solo por endpoints serverless con service key y URLs firmadas de 5 min. Ver 7.5. La decisión (b) del v0.10 se implementó. **Creado y probado en DEV y PROD (v0.12).**

Cierra el riesgo del internet abierto (que era lo crítico para el habeas data de menores). Queda la limitación conocida: sin JWT, no distingue criptográficamente entre usuarios internos. Aceptable y coherente con la plataforma.

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
| **4** | `form.html` (Paso 1: envío + edición por token) ✅ DEV · `leads-review.html` ⏸ espera equipo | Parcial |
| **5** | `experiences.html` (Paso 2) | ✅ DEV |
| **6** | Bucket privado + endpoints, `documents-catalog.html`, `applicant-documents.html`, `step4-form.html` (Paso 4 completo, opción c). | ✅ **DEV. Esquema del Paso 4 replicado a PROD.** |
| **7** | `applicant-financial.html` (semáforo + acuerdos) + color en la ficha. Borrado de documentos (cierre de Fase 6). | ✅ DEV |
| **8** | `session-types.html` + `applicant-sessions.html` (Pasos 6, 7, 8) | **Bloqueada por 12.2 #1 (reactivación de aplazados) y #8/#9 (formularios de observación).** Siguiente fase grande, parcialmente construible. |
| **9** | Pasos 9, 10 y 11 en la ficha. Desistimientos. | Parcial: **desistimientos hechos en la ficha (v0.14, DEV + PROD)**; pasos 9/10/11 pendientes (bloqueados por 12.2 #0 y por Fase 8). |
| **10** | `admissions-reports.html` + `dashboard.html` (+ encuestas) | ✅ **DEV + PROD** (dashboard + reportes). Encuestas pendiente. |

**✅ Separación DEV/PROD en Vercel — RESUELTA (v0.12).** Las tres variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) ya están separadas por entorno. El bucket `admissions-documents` ya existe en PROD.

**Estado de PROD (v0.12):** el esquema completo, el trigger, los datos sembrados (11 pasos, 6 resultados, config, 11 plantillas), el bucket, **y el esquema del Paso 4** (contenedor `forms`, 50 `form_fields` con condicionales, `step4_form_id` fijado) **ya están en PROD**. En v0.12 **ningún HTML del módulo estaba desplegado a PROD** — el despliegue del módulo se realizó en v0.14 (ver abajo).

**Despliegue del módulo a PROD — HECHO (v0.14).** Los HTML del módulo están desplegados en PROD (ficha, `form.html`, `step4-form.html`, catálogos, satélites, `module-config.html`, `dashboard.html`, `admissions-reports.html`). Los permisos de PROD quedaron alineados (ver 9.4). **Pendiente de contenido/operación, no de código:** sembrar en PROD el catálogo de documentos completo del Excel y los años habilitados, y verificar los endpoints con datos reales. Los datos de PROD son mínimos todavía, así que el dashboard y los reportes salen casi vacíos allá — es lo esperado. El sembrado de prueba `SEED_FASE10` es solo de DEV.

**Antes del despliegue a PROD** hay que verificar que el trigger `aap_applicants_create_steps` esté allá. Un script de CREATE TABLE no lo arrastra; es un objeto aparte. Si falta, cada aspirante nuevo nace sin sus 11 pasos y la ficha sale vacía sin dar error.

```sql
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.aap_applicants'::regclass AND NOT tgisinternal;
```

**Recomendación:** el formulario público (`form.html`) ya funciona en DEV. Cuando se decida desplegar a PROD, verificar antes: (a) que el trigger esté en PROD, (b) que `config.js` en PROD tenga el flag `SCHOOLNET_PUBLIC_PAGE`, (c) que `form_is_open` arranque en `false` para no abrir el formulario por accidente. **El enlace de token no funciona a través del preview de Vercel** (muro de autenticación de deployment); la prueba de punta a punta del modo edición solo es fiable en producción o con sesión de Vercel activa.

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
| Julio 2026 | 0.9 | **Fases 2 y 3 construidas y verificadas en DEV.** Trigger de creación de pasos. Tres convenciones de PostgREST aprendidas a golpes (`JSON.stringify` obligatorio, desambiguación de `aap_contact_sources`, escapado de HTML). Paso 1 pasa a solo lectura; transición `inscrito → en_proceso` automatizada. `form-config.html` eliminado. Plantillas de correo como conjunto fijo. **Identificado que el motor de formularios no alcanza para el Paso 4** — decisión bloqueante de la Fase 6. `marketing_contacts` vacía: `upload-campaigns.html` nunca probado. |
| 15 jul 2026 | 0.10 | **Formulario público del Paso 1 (`form.html`) completo y probado en DEV:** envío con correo de confirmación, y modo edición por token con las tres reglas de seguridad (lectura filtrada por token, bloqueo si el aspirante avanzó, snapshot inmutable). **Deduplicación diferida** — el formulario ya no lee `aap_applicants`, la detección de duplicados pasa al equipo. **Flag `SCHOOLNET_PUBLIC_PAGE`** en `config.js` para páginas públicas sin navbar. Recuperación de token vía equipo, no cliente. `leads-review.html` en espera del equipo de admisiones. |
| **16 jul 2026** | **0.11** | **Fase 5 (Experiencias) completa en DEV:** `experiences.html` con modalidades, eventos, asistencia e inscripción interna; campo 27 del Paso 1 reincorporado. **Fase 6 — bucket privado resuelto:** `admissions-documents` privado + endpoints `upload-document.js` y `sign-document.js` con service key, probados de punta a punta. Lección: Storage API exige `Authorization` sin `apikey`. Separación DEV/PROD de variables Vercel marcada como obligatoria pre-despliegue. Falta la interfaz de documentos y el Paso 4 (bloqueado por el motor de formularios). |
| **16 jul 2026** | **0.12** | **Fase 6 completa en DEV.** `documents-catalog.html` y `applicant-documents.html` construidos y probados; permisos y menú saneados (incl. corrección de «Ficha individual del aspirante»). **Paso 4 completo (`step4-form.html`)** bajo opción (c), dirigido por datos: 50 `form_fields` sembrados, guardado de borrador, reanudación, condicionales, un solo formulario con render por grado, documentos y envío final con validación y bloqueo por `required`, notificaciones. **Corrección al §7.1** (módulos 4/5 no eran Familiar 1/2). Cinco lecciones técnicas nuevas (índice único de `form_responses`, `__NOT__`, `grade_order`, `help_text`, `field_label` 255). **Bucket y variables Vercel ya en PROD; esquema del Paso 4 replicado a PROD.** Falta desplegar los HTML a PROD (sesión aparte). |
| **16 jul 2026** | **0.13** | **Fase 7 (Financiero) completa en DEV:** `applicant-financial.html` con semáforo manual (verde/amarillo/rojo), historial de revisiones y acuerdos financieros (5 estados); color del semáforo visible en la ficha (lectura amplia) + enlace a la satélite; permiso «Financiero del aspirante» activo sin `url_path`. **Borrado de documentos (cierre de Fase 6):** endpoint `delete-document.js` + botón "Eliminar" en la satélite de documentos, con bloqueo de los documentos previos al envío final. PROD: tablas y código listos; el push y el llenado de catálogos quedan a cargo de Desarrollos y las responsables del proceso. |
| **17 jul 2026** | **0.14** | **Fase 10 (dashboard + consultas) completa en DEV y desplegada a PROD.** `dashboard.html`: KPIs + barras CSS (estado, origen, grado, año, referidos, semáforo, desistimientos por causa y por paso, registros por mes) + embudo aproximado que ubica los desistidos por su `withdrawn_step_id`. `admissions-reports.html`: tabla filtrable (año, grado, estado, fuente, semáforo, rango de fechas) + exportación Excel/CSV (SheetJS, CSV con BOM UTF-8). **Ficha:** acción «Marcar desistimiento» (campos `withdrawn_*`) y contador «X de Y» de documentos requeridos. **Módulo desplegado a PROD.** Permisos `Dashboard` y `Reportes` activados en DEV y PROD; corregido el desfase de Fase 6 en PROD («Catálogo de documentos» y «Documentos del aspirante» activados, a la satélite se le quitó el `url_path`). Sembrado de prueba `SEED_FASE10` solo en DEV. Lección: `aap_applicants` tiene **dos** FKs a `aap_process_steps` (directa `withdrawn_step_id` y vía la N:N `aap_applicant_steps`); el embed exige desambiguar con `!aap_applicants_withdrawn_step_fkey` o PostgREST responde `PGRST201`. |
