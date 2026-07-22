# Levantamiento — Autorización familiar de salidas

**Versión:** 1.0
**Fecha:** 22 de julio de 2026
**Módulos involucrados:** Servicios (`services`) + Portal de Familias
**Estado:** Levantamiento para aprobación. Sin código escrito.

---

## 1. Propósito

Cuando se programa una salida pedagógica, deportiva o de grupos de representación, el sistema debe solicitar a la familia de cada estudiante participante la autorización para que su hijo asista. La respuesta se da desde el Portal de Familias, autenticada por OTP.

**Regla institucional definida:** un estudiante sin autorización registrada **no viaja**. No se admiten autorizaciones registradas por fuera del sistema.

---

## 2. Alcance

### 2.1 Incluye
- Generación automática de solicitudes de autorización para las tres modalidades de salida.
- Disparo programado (X días antes de la salida) y recordatorios configurables.
- Pantalla de respuesta en el Portal de Familias.
- Cierre automático al vencer el plazo.
- Reapertura individual controlada por el solicitante de la salida.
- Reinicio de autorizaciones cuando cambian datos sustanciales de la salida.
- Bitácora de correos enviados (evidencia).
- Panel de seguimiento en el módulo de Servicios.

### 2.2 No incluye
- Registro manual de autorizaciones obtenidas por otros medios (decisión institucional explícita: no se permite).
- Autorizaciones generales por temporada o por equipo. Es salida por salida.
- Cobro o pago asociado a la salida.
- Vista de planeadores en el portal (funcionalidad independiente, ya prevista en la bitácora del portal).

---

## 3. Estructuras existentes sobre las que se construye

Las tres modalidades son estructuras paralelas ya implementadas:

| | Salida pedagógica | Salida deportiva | Salida de representación |
|---|---|---|---|
| Cabecera | `svc_pedagogical_trips` | `svc_sports_trips` | `svc_rep_trips` |
| Roster | `svc_pedagogical_trip_attendance` | `svc_sports_trip_attendance` | `svc_rep_trip_attendance` |
| Adultos | `svc_pedagogical_trip_adults` | `svc_sports_trip_adults` | `svc_rep_trip_adults` |
| Origen estudiantes | `svc_pedagogical_trip_grades` | `svc_sports_teams` | `svc_rep_groups` |

Elementos comunes verificados en BD:

- Las tres cabeceras tienen `request_id` → `svc_service_requests(request_id)`, **nullable**.
- Las tres cabeceras tienen `created_by` → `users(user_id)`, NOT NULL en pedagógicas y deportivas.
- Las tres cabeceras tienen `trip_status` con los mismos valores: `scheduled`, `imminent`, `in_progress`, `completed`, `suspended`, `cancelled`.
- Las tres tablas de roster tienen: `trip_id`, `student_id` (integer), `is_attending`, `unlinked_at`, `unlinked_reason`.
- `svc_service_requests` tiene `service_type` con valores `pedagogical_trip`, `sports_trip`, `internal_event`, `rep_trip`, y `request_status` en `pending` / `approved` / `rejected`.

Cadena hacia la familia (ya probada en el portal):

```
family_members.email → family_members.family_id (uuid)
  → families.family_id → families.family_code (integer)
  → students.family_id (integer) → students.student_id
```

**Nota:** `students.family_id` es entero y referencia `families.family_code`, no el uuid.

---

## 4. Decisiones tomadas

| # | Decisión | Definición |
|---|---|---|
| 1 | Quién autoriza | Cualquier familiar activo (`family_members.member_status = 'active'`) de la familia del estudiante. La primera respuesta define el estado. |
| 2 | Autenticación | Se mantiene OTP por correo. No se usan enlaces mágicos de un clic. |
| 3 | Efecto del "No autorizo" | No desvincula automáticamente. Alimenta el panel; la desvinculación la aplica una persona. |
| 4 | Disparo | Automático, X días antes de la fecha de salida. Parámetro configurable. |
| 5 | Cambios en la salida | Los cambios sustanciales reinician las autorizaciones. |
| 6 | Plazo de respuesta | Configurable en horas antes de la hora de salida. |
| 7 | Sin respuesta | El estudiante no viaja. Sin válvula de escape manual. |
| 8 | Alcance por salida | Autorización individual por salida, no por temporada. |
| 9 | Parámetros de tiempo | Un solo juego para las tres modalidades. |
| 10 | Textos | Dos textos por función (correo y declaración). Un juego general, con posibilidad de sobrescritura por tipo de salida. |
| 11 | Quién desvincula | El solicitante de la salida (`svc_service_requests.requested_by`). |

### 4.1 Campos sustanciales que disparan reinicio

Solo los que aparecen en el texto que la familia aceptó:

- `trip_date`
- `departure_time`
- `return_time`
- `destination_id` (y `specific_destination` en deportivas y de representación)
- `trip_title` / `trip_name`
- `trip_description` (donde exista)
- `transport_modality`
- Composición de la tabla de adultos acompañantes (`svc_*_trip_adults`)

Todo lo demás (tarifas congeladas, número de vehículos, catering, `actual_students`, valores de entrada) cambia libremente sin afectar autorizaciones.

---

## 5. Modelo de datos propuesto

### 5.1 `svc_trip_authorizations`

Tabla polimórfica única para las tres modalidades. Se prefiere una tabla sobre columnas en cada roster porque el portal necesita listar pendientes de todos los hijos sin importar el tipo, con una sola consulta.

| Columna | Tipo | Notas |
|---|---|---|
| `authorization_id` | uuid PK | `gen_random_uuid()` |
| `trip_type` | varchar | CHECK: `pedagogical_trip`, `sports_trip`, `rep_trip`. Se reutilizan los literales de `svc_service_requests.service_type`. |
| `trip_id` | uuid NOT NULL | Sin FK (polimórfica). Integridad validada en aplicación. |
| `student_id` | integer NOT NULL | FK → `students(student_id)` |
| `cycle_number` | smallint NOT NULL DEFAULT 1 | Se incrementa en cada reinicio |
| `authorization_status` | varchar NOT NULL DEFAULT `'pending'` | CHECK: `pending`, `authorized`, `denied`, `expired`, `superseded`, `cancelled` |
| `requested_at` | timestamptz | Momento del disparo de este ciclo |
| `deadline_at` | timestamptz | Calculado: `trip_date + departure_time − N horas` |
| `responded_at` | timestamptz | |
| `responded_by_member_id` | uuid | FK → `family_members(family_member_id)` |
| `responded_by_name` | varchar(150) | Snapshot |
| `responded_by_email` | varchar(150) | Snapshot |
| `denial_reason` | text | Opcional, si la familia explica |
| `declaration_snapshot` | text | Texto exacto aceptado, con variables ya resueltas |
| `trip_data_snapshot` | jsonb | Datos sustanciales de la salida al momento de responder |
| `closed_at` | timestamptz | |
| `closed_reason` | varchar | `deadline`, `trip_cancelled`, `student_unlinked`, `superseded` |
| `reopened_at` | timestamptz | |
| `reopened_by` | uuid | FK → `users(user_id)` |
| `reopen_reason` | text | |
| `created_at` / `updated_at` | timestamptz | |

Índice único: `(trip_type, trip_id, student_id, cycle_number)`.
Índices de consulta: `(student_id, authorization_status)`, `(trip_type, trip_id)`, `(authorization_status, deadline_at)`.

`ALTER TABLE ... DISABLE ROW LEVEL SECURITY` obligatorio.

**Sobre `cycle_number` y `superseded`:** al reiniciar, las filas del ciclo vigente pasan a `superseded` y se crean filas nuevas con `cycle_number + 1`. Así queda registro de qué se autorizó antes del cambio, que es precisamente la evidencia que se necesitaría en un reclamo.

### 5.2 `svc_trip_authorization_emails`

Bitácora de envíos. Con la política de "sin respuesta no viaja", poder demostrar qué se envió, a quién y cuándo deja de ser opcional.

| Columna | Tipo | Notas |
|---|---|---|
| `email_id` | uuid PK | |
| `authorization_id` | uuid NOT NULL | FK → `svc_trip_authorizations` ON DELETE CASCADE |
| `email_type` | varchar NOT NULL | CHECK: `initial`, `reminder`, `reset`, `reopen` |
| `sent_to` | varchar(150) NOT NULL | Una fila por destinatario |
| `sent_at` | timestamptz DEFAULT now() | |
| `send_status` | varchar DEFAULT `'sent'` | CHECK: `sent`, `failed` |
| `error_message` | text | |

Índice: `(authorization_id, sent_at)`.

### 5.3 Parámetros en `svc_module_config`

Se reutiliza la tabla existente (`config_key` único, `config_value` text).

| `config_key` | Contenido |
|---|---|
| `trip_auth_days_before_request` | Días antes de la salida para el disparo inicial |
| `trip_auth_reminder_days` | Días antes para recordatorios, separados por coma (ej. `5,2`) |
| `trip_auth_deadline_hours` | Horas antes de la hora de salida para el cierre |
| `trip_auth_min_window_hours` | Ventana mínima aceptable tras un reinicio; por debajo se alerta al solicitante |
| `trip_auth_email_subject` | Asunto del correo |
| `trip_auth_email_body` | Cuerpo del correo (HTML, editable con Quill) |
| `trip_auth_declaration_text` | Declaración que acepta la familia (general) |
| `trip_auth_declaration_text_pedagogical_trip` | Sobrescritura opcional |
| `trip_auth_declaration_text_sports_trip` | Sobrescritura opcional |
| `trip_auth_declaration_text_rep_trip` | Sobrescritura opcional |

Resolución: si existe la clave por tipo y no está vacía, se usa esa; si no, la general.

**Variables sustituibles** en correo y declaración: `{estudiante}`, `{tipo_salida}`, `{titulo}`, `{descripcion}`, `{fecha}`, `{hora_salida}`, `{hora_regreso}`, `{destino}`, `{modalidad_transporte}`, `{acompanantes}`, `{fecha_limite}`, `{url_portal}`.

---

## 6. Flujo funcional

### 6.1 Disparo inicial

Ejecutado por un activador diario de Google Apps Script (una corrida en la madrugada).

Condiciones para generar autorizaciones de una salida:

1. `svc_service_requests.request_status = 'approved'`
2. `trip_status = 'scheduled'`
3. `trip_date − trip_auth_days_before_request ≤ hoy`
4. No existen autorizaciones vigentes para esa salida

**La condición 3 es un "≤", no una igualdad.** Si una salida se aprueba después de haber pasado el umbral, con una igualdad nunca se dispararía. Con "≤" dispara en la corrida siguiente.

Para cada estudiante del roster con `is_attending = true` se crea una fila en `svc_trip_authorizations` con estado `pending` y se envía correo a todos los familiares activos de su familia, registrando cada envío en la bitácora.

### 6.2 Respuesta de la familia

1. La familia recibe el correo y entra a `families.html`.
2. Se autentica con OTP (flujo existente).
3. Ve la lista de autorizaciones pendientes por hijo.
4. Abre una, lee la declaración resuelta y los datos de la salida.
5. Responde: autorizo / no autorizo. Puede agregar una razón si no autoriza.
6. El sistema guarda `declaration_snapshot`, `trip_data_snapshot`, `responded_by_*` y `responded_at`.

Si dos familiares responden casi al tiempo, la primera respuesta que llega define el estado; la segunda recibe un mensaje indicando que ya fue resuelta y por quién.

### 6.3 Recordatorios

En cada corrida diaria, para las autorizaciones aún en `pending` cuya fecha coincida con alguno de los días definidos en `trip_auth_reminder_days`, se reenvía correo y se registra en bitácora con `email_type = 'reminder'`.

### 6.4 Cierre por vencimiento

En la corrida diaria (o en una corrida adicional más frecuente, según se decida), las autorizaciones en `pending` con `deadline_at < ahora` pasan a `expired` con `closed_reason = 'deadline'`.

El estudiante queda marcado como no autorizado a efectos operativos, pero **la desvinculación del roster sigue siendo manual**, en manos del solicitante.

### 6.5 Reapertura individual

Mientras la salida siga en `trip_status = 'scheduled'`, el solicitante puede reabrir un caso individual desde el panel: la autorización vuelve a `pending` con un nuevo `deadline_at`, se registra `reopened_by` y `reopen_reason`, y se reenvía el correo.

Esto no es una autorización por fuera del sistema: la familia sigue respondiendo en el portal, solo se le extiende el plazo.

### 6.6 Reinicio por cambio sustancial

Al guardar una salida, se comparan los campos sustanciales (§4.1) contra su estado previo. Si alguno cambió y existen autorizaciones vigentes:

1. Las filas del ciclo actual pasan a `superseded`.
2. Se crean filas nuevas con `cycle_number + 1` en `pending`.
3. Se envía correo con `email_type = 'reset'`.
4. Se recalcula `deadline_at`.
5. **Si la nueva ventana es menor a `trip_auth_min_window_hours`, se advierte al usuario antes de confirmar el cambio**, para que decida entre sostener la fecha o moverla.

Este último punto resuelve el choque entre las reglas 5 y 7: sin la advertencia, un cambio administrativo tardío podría dejar media salida sin autorizar por efecto colateral y no por desatención de las familias.

---

## 7. Panel en el módulo de Servicios

Página satélite (requiere `trip_id` y `trip_type` en la URL), por lo tanto **`url_path = NULL` en su permiso**: valida acceso pero no aparece como ítem del menú lateral.

Contenido:

- Encabezado con datos de la salida y estado del ciclo vigente.
- Contadores: autorizados / no autorizados / pendientes / vencidos.
- Tabla por estudiante: nombre, curso, estado, quién respondió, cuándo, razón de negativa.
- Acciones: reenviar a pendientes, reabrir caso individual, ver bitácora de envíos de un estudiante.
- Acceso a la desvinculación del estudiante del roster (reutilizando el flujo existente con `unlinked_at` / `unlinked_reason`).

**Control de acceso:** el usuario en sesión debe corresponder al solicitante de la salida. Como no existe FK entre `users` y `workers`, el puente es el correo (`users.user_mail` ↔ `workers.email`, ambos UNIQUE). En implementación se debe revisar cómo resuelve hoy esta correspondencia el módulo de Servicios y reutilizar ese patrón, no crear uno nuevo.

**Respaldo:** si la salida no tiene `request_id`, el control recae en `created_by`.

---

## 8. Endpoints nuevos en Apps Script

Se suman a los existentes (`request_code`, `verify_code`, `get_children`).

| Acción | Entrada | Salida |
|---|---|---|
| `get_authorizations` | token | Autorizaciones pendientes y resueltas, agrupadas por hijo |
| `get_authorization_detail` | token, `authorization_id` | Datos de la salida + declaración resuelta |
| `submit_authorization` | token, `authorization_id`, decisión, razón opcional | Confirmación o estado ya resuelto |

Validaciones obligatorias en `submit_authorization`:

1. Sesión válida y no vencida (`portal_sessions`).
2. La autorización pertenece a un estudiante de una familia asociada al correo de la sesión.
3. Estado actual `pending`.
4. `deadline_at` no vencido.
5. La salida sigue en `scheduled`.

Adicionalmente, una función `procesarAutorizacionesDiarias()` asociada a un activador por tiempo, que ejecuta disparo, recordatorios y cierre.

**Nota de despliegue:** todo cambio en GAS requiere re-desplegar para verse desde el navegador. Y el activador diario debe existir de forma separada en el proyecto GAS de DEV y en el de PROD.

---

## 9. Casos borde contemplados

| Caso | Tratamiento |
|---|---|
| Estudiante agregado al roster después del disparo | Se le genera solicitud individual inmediata, sin esperar la corrida siguiente |
| Estudiante desvinculado del roster | Sus autorizaciones pendientes se cierran con `closed_reason = 'student_unlinked'` |
| Salida cancelada o suspendida | Autorizaciones pendientes pasan a `cancelled` |
| Familia con dos hijos en la misma salida | Una autorización por estudiante, no una por familia |
| Correo asociado a varias familias | Ve los hijos de todas (comportamiento ya implementado en `get_children`) |
| Dos familiares responden simultáneamente | Primera respuesta gana; la segunda ve el estado ya resuelto |
| Estudiante sin familiares activos registrados | No se puede generar autorización. Debe aparecer como excepción visible en el panel desde el disparo |
| Salida sin `request_id` | Control recae en `created_by` |

---

## 10. Riesgos y dependencias

### 10.1 Cobertura de datos de contacto
La carga de `family_members` está incompleta a la espera del cierre de matrículas. Quedan pendientes con IT los 26 códigos de familia inexistentes (Bloque A), la familia 106000 (Bloque B) y 8 registros sin contacto (Bloque C).

Con la política de "sin respuesta no viaja", un estudiante sin familiar registrado queda automáticamente impedido para viajar por una falla de datos, no por decisión de su familia. **El módulo no debe entrar en operación real antes de cerrar la carga.** Si Phidias puede exportar los correos de familias, es mejor fuente que el CSV actual.

### 10.2 Cuota de correo de Apps Script
El envío usa `MailApp`, con cuota diaria limitada en Google Workspace. Una salida de un grado son del orden de 40 a 80 correos (dos familiares por familia). Varias salidas disparando el mismo día, más recordatorios, más los OTP del portal, pueden acercarse al límite. Conviene medir el volumen esperado y considerar envío por lotes.

### 10.3 Adopción
La política sin válvula de escape depende de que las familias revisen el correo. Es previsible que los primeros meses haya estudiantes impedidos por no respuesta. Vale la pena acompañar el lanzamiento con comunicación institucional y, en las primeras salidas, revisar el panel con anticipación.

### 10.4 Prerrequisitos técnicos del portal
Siguen pendientes de la fase anterior:
- Crear `portal_access_codes` y `portal_sessions` en PROD.
- Definir despliegue GAS separado para PROD (recomendado, para no mezclar ambientes con la `service_role`).
- Publicar `families.html` en el dominio de PROD.
- Limpiar datos y funciones de prueba en DEV.

---

## 11. Pendientes de definición

| # | Pendiente | Responsable |
|---|---|---|
| 1 | Texto de la declaración que acepta la familia. Se tomará como base el formato en papel vigente, ya solicitado | Institucional |
| 2 | Valores iniciales de los parámetros de tiempo (días de disparo, recordatorios, horas de cierre, ventana mínima) | Coordinación de Servicios |
| 3 | Confirmar si el cierre por vencimiento corre una vez al día o con mayor frecuencia | Técnico / operativo |
| 4 | Verificar en DEV y PROD si existen salidas con `request_id IS NULL`; si son cero, endurecer la columna | Técnico |

---

## 12. Orden de construcción propuesto

1. Verificación previa: conteo de salidas sin `request_id`; revisión del patrón `users` ↔ `workers` en el módulo de Servicios.
2. Tablas `svc_trip_authorizations` y `svc_trip_authorization_emails` en DEV.
3. Parámetros en `svc_module_config` y pantalla de configuración en Servicios.
4. Panel de seguimiento por salida en Servicios (lectura primero).
5. Endpoints GAS de lectura (`get_authorizations`, `get_authorization_detail`).
6. Pantalla de respuesta en el portal + `submit_authorization`.
7. Detección de cambios sustanciales y reinicio.
8. `procesarAutorizacionesDiarias()` y activador.
9. Acciones del panel: reenvío, reapertura, desvinculación.
10. Pruebas de punta a punta en DEV con familia controlada.
11. Replicación a PROD.

Cada paso se confirma antes de pasar al siguiente.
