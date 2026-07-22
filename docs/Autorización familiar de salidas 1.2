# Levantamiento — Autorización familiar de salidas

**Versión:** 1.2
**Fecha:** 22 de julio de 2026
**Módulos:** Servicios (`services`) + Portal de Familias
**Estado:** Capa de datos completa y verificada en DEV y PROD. Pendiente Apps Script e interfaces.

> **Cambios respecto a v1.1:** este documento ya no describe un plan, describe lo construido. Se agregan las funciones realmente implementadas (incluidas tres no previstas), la decisión sobre ventana insuficiente, el parámetro de URL del portal, y el hallazgo del estudiante revinculado. La sección 14 es el punto de retoma para la próxima sesión.

---

## 1. Propósito

Cuando se programa una salida pedagógica, deportiva o de grupos de representación, el sistema solicita a la familia de cada estudiante participante la autorización para que su hijo asista. La respuesta se da desde el Portal de Familias, autenticada por OTP.

**Regla institucional:** un estudiante sin autorización registrada **no viaja**. No se admiten autorizaciones registradas por fuera del sistema.

---

## 2. Decisiones tomadas

| # | Decisión | Definición | Origen |
|---|---|---|---|
| 1 | Quién autoriza | Cualquier familiar activo. Primera respuesta gana. Sustituye las dos firmas del formato en papel. | Institucional |
| 2 | Autenticación | OTP por correo. Sin enlaces mágicos. | Institucional |
| 3 | Efecto del "No autorizo" | No desvincula automáticamente. Alimenta el panel. | Institucional |
| 4 | Disparo | Automático, X días antes. Configurable. | Institucional |
| 5 | Cambios sustanciales | Reinician autorizaciones (red de seguridad, ver §7) | Institucional |
| 6 | Plazo | Configurable en horas antes de la salida | Institucional |
| 7 | Sin respuesta | No viaja. Sin válvula de escape. | Institucional |
| 8 | Alcance | Por salida, no por temporada | Institucional |
| 9 | Parámetros de tiempo | Un solo juego para las tres modalidades | Institucional |
| 10 | Textos | Dos por función. General con sobrescritura por tipo. | Institucional |
| 11 | Quién administra | `created_by` o permiso de administrador | Técnica |
| 12 | Campo `family_notice` | Se agrega a las tres tablas | Técnica |
| 13 | Borrado | Bloqueado si hay correos enviados | Técnica |
| 14 | **Ventana insuficiente** | **La salida procede con el plazo que quede.** No se bloquea ni se permite excepción sin autorización. Se advierte al responsable. | Técnica (delegada) |
| 15 | **URL del portal** | **Parámetro en `svc_module_config`, distinto por ambiente.** | Técnica |
| 16 | **Reingreso al roster** | **Un estudiante desvinculado y revinculado recibe autorización nueva en el ciclo siguiente.** | Técnica |

### 2.1 Campos sustanciales que disparan reinicio

`trip_date`, `departure_time`, `return_time`, `destination_id` (+ `specific_destination`), `trip_title` / `trip_name`, `trip_description`, `family_notice`, `transport_modality`, y la composición de `svc_*_trip_adults`.

---

## 3. Configuración real del módulo

Valores verificados en DEV **y** PROD, idénticos:

| `config_key` | Valor | Efecto |
|---|---|---|
| `min_days_advance` | **1** | Una salida puede programarse para mañana |
| `days_before_imminent` | **8** | Transición a `imminent` ocho días antes |
| `trip_auth_days_before_request` | 5 | Disparo |
| `trip_auth_reminder_days` | 3,1 | Recordatorios |
| `trip_auth_deadline_hours` | 24 | Cierre |
| `trip_auth_min_window_hours` | 48 | Ventana mínima antes de advertir |
| `trip_auth_email_subject` | (plantilla) | Asunto |
| `trip_auth_email_body` | (plantilla HTML) | Cuerpo |
| `trip_auth_declaration_text` | (plantilla HTML) | Declaración |
| `trip_auth_portal_url` | DEV: `sistema-next.vercel.app/families.html`<br>PROD: `schoolnet.colegiotilata.edu.co/families.html` | Enlace del correo |

**Consecuencia de `min_days_advance = 1`:** una salida creada hoy para mañana no alcanzaría a disparar autorizaciones antes del vencimiento. Ver §12.2.

**Qué NO es configurable** (constantes de dominio, fijas en código): zona horaria `America/Bogota`, nombres de meses en español, etiquetas de modalidad de transporte, estados que habilitan el disparo.

**`deadline_at` se congela al crear la autorización.** Cambiar `trip_auth_deadline_hours` después solo afecta autorizaciones nuevas. Es deliberado: a las familias ya se les comunicó una fecha límite.

---

## 4. Estructuras existentes verificadas

| | Pedagógica | Deportiva | Representación |
|---|---|---|---|
| Cabecera | `svc_pedagogical_trips` | `svc_sports_trips` | `svc_rep_trips` |
| Roster | `svc_pedagogical_trip_attendance` | `svc_sports_trip_attendance` | `svc_rep_trip_attendance` |
| Adultos | `svc_pedagogical_trip_adults` | `svc_sports_trip_adults` | `svc_rep_trip_adults` |
| Origen | grados | `svc_sports_team_members` | `svc_rep_group_members` |
| **Roster se crea** | **al pasar a `imminent`** | **al crear la salida** | **al crear la salida** |
| Título | `trip_title` (nullable) | `trip_name` | `trip_name` |
| Descripción | `trip_description` | ninguna | ninguna |
| Destino específico | no tiene | `specific_destination` | `specific_destination` |
| `destination_id` | NOT NULL | NOT NULL | **nullable** |
| Creación | RPC `create_pedagogical_trip` | JS directo | JS directo |

Todos los roster tienen `UNIQUE (trip_id, student_id)`.

**Cadena hacia la familia:**
```
family_members.email → family_members.family_id (uuid)
  → families.family_id → families.family_code (integer)
  → students.family_id (integer) → students.student_id
```

**Puente `users` ↔ `workers`:** sin FK, se resuelve por correo (`users.user_mail` = `workers.email`). Usado en `SvcCommons.loadCurrentWorker()` y en `create_pedagogical_trip`. No se necesita para el control de acceso del panel.

**`request_id` siempre se llena.** Verificado en las tres modalidades: la solicitud se crea antes que la salida. En pedagógicas es atómico (misma función); en las otras dos son dos llamadas HTTP, así que el riesgo es una solicitud huérfana, no una salida sin solicitud.

---

## 5. Modelo de datos implementado

### 5.1 `svc_trip_authorizations`

22 columnas, 5 índices, RLS desactivada. Verificada en DEV y PROD.

Claves del diseño:
- `service_type` varchar con CHECK sobre `pedagogical_trip` / `sports_trip` / `rep_trip`, siguiendo la convención de `svc_trip_transport_nodes`
- `trip_id` uuid **sin FK** (polimórfica)
- `student_id` integer con FK a `students` — **no** `attendance_id`, porque la edición de salidas deportivas y de representación borra y recrea el roster completo
- `cycle_number` smallint, índice único sobre `(service_type, trip_id, student_id, cycle_number)`
- Estados: `pending`, `authorized`, `denied`, `expired`, `superseded`, `cancelled`
- `closed_reason`: `deadline`, `trip_cancelled`, `student_unlinked`, `superseded`
- Evidencia: `declaration_snapshot` (texto aceptado), `trip_data_snapshot` (jsonb con todas las variables, **incluye `aviso_familias`**), `responded_by_name` / `_email` / `_member_id`

### 5.2 `svc_trip_authorization_emails`

7 columnas, 2 índices, RLS desactivada. `ON DELETE CASCADE` desde autorizaciones.

Bitácora de evidencia: qué se envió, a quién, cuándo, con qué resultado. Con la política de "sin respuesta no viaja", no es opcional.

### 5.3 `family_notice`

Columna `text` nullable en las tres tablas de salidas. Editor Quill 1.3.7 implementado en los tres wizards.

Justificación: la circular real incluye requisitos de vestuario, qué llevar, especificaciones del recorrido, régimen de alimentación, guía externo, seguros y gratuidad. Nada de eso existía en la BD, y deportivas y representación no tenían ningún campo de texto libre.

---

## 6. Funciones implementadas

Diez funciones, todas probadas en DEV y replicadas a PROD.

| Función | Retorno | Consumidor | Qué hace |
|---|---|---|---|
| `materialize_pedagogical_roster(uuid)` | integer | Interna | Materializa roster de pedagógicas. Idempotente. Devuelve insertados. |
| `resolve_trip_variables(varchar, uuid, integer)` | jsonb | Interna | Datos de salida + estudiante. Doble como `trip_data_snapshot`. |
| `resolve_member_variables(uuid)` | jsonb | Interna | Datos de quien responde. Invierte "Apellido, Nombre". |
| `dispatch_trip_authorizations()` | json | Trigger GAS | Crea autorizaciones. Idempotente. |
| `get_authorization_emails_to_send(varchar)` | jsonb | Trigger GAS | Correos con texto resuelto y destinatarios. |
| `log_authorization_emails(jsonb)` | json | Trigger GAS | Registra envíos en lote. |
| `close_trip_authorizations()` | json | Trigger GAS | Cierra por plazo, cancelación o desvinculación. |
| `get_family_authorizations(text)` | jsonb | Portal | Autorizaciones agrupadas por hijo. |
| `get_authorization_detail(uuid, text)` | jsonb | Portal | Detalle + declaración resuelta. |
| `submit_trip_authorization(uuid, uuid, varchar, text)` | json | Portal | Registra respuesta con evidencia. |

Más `transition_trip_statuses()` refactorizada para invocar `materialize_pedagogical_roster` en vez de tener el INSERT embebido.

### 6.1 Detalles no obvios

**Zona horaria.** `deadline_at` se calcula con `(trip_date + departure_time) AT TIME ZONE 'America/Bogota'`. Sin eso el plazo quedaría corrido cinco horas.

**Idempotencia del disparo.** El `NOT EXISTS` es por estudiante y **excluye** `cancelled` y `superseded`, de modo que un estudiante revinculado recibe autorización nueva con `cycle_number + 1`. Sin esa exclusión quedaría sin poder viajar, en silencio.

**Primera respuesta gana.** `submit_trip_authorization` repite `AND authorization_status = 'pending'` dentro del UPDATE. Si dos familiares responden simultáneamente, ambos pasan la validación pero solo uno afecta filas; el otro recibe `ya_resuelta_concurrente`.

**`close_trip_authorizations` solo toca `pending`.** Una autorización respondida nunca se modifica, ni si la salida se cancela después. Esa fila es evidencia.

**Errores con código, no excepciones.** Las funciones del portal devuelven `{ok: false, error: 'codigo'}` para que GAS traduzca a mensajes sin interpretar texto de PostgreSQL.

**Meses en array, no `to_char` con `TM`.** El locale de Supabase puede no estar en español.

**Sin registro en `svc_student_year_services`** se asume que no hay servicio contratado. Es lo correcto y el mensaje más seguro para la familia.

---

## 7. Flujo funcional

**Disparo** (trigger diario GAS → `dispatch_trip_authorizations`):
1. `request_status = 'approved'`
2. `trip_status IN ('scheduled', 'imminent')` — incluye `imminent` porque con `days_before_imminent = 8` casi toda salida aprobada transiciona de inmediato
3. `trip_date - trip_auth_days_before_request <= CURRENT_DATE` — **`≤`, no igualdad**: si no, una salida aprobada tarde nunca dispararía
4. Materializa roster si es pedagógica
5. Crea autorización por estudiante con `is_attending = true`

**Envío** (GAS): `get_authorization_emails_to_send('initial')` → enviar → `log_authorization_emails`. Lo registrado deja de listarse, así que la corrida diaria no reenvía.

**Recordatorios:** mismo ciclo con `'reminder'`. Solo a quienes ya recibieron el inicial, en los días de `trip_auth_reminder_days`, uno por día máximo.

**Respuesta** (portal): OTP → `get_family_authorizations` → `get_authorization_detail` → `submit_trip_authorization`.

**Cierre** (`close_trip_authorizations`): por `deadline_at` vencido, salida cancelada o suspendida, o estudiante desvinculado. **Se ancla en `deadline_at`, nunca en el estado de la salida**: una salida en `imminent` sin banderazo nunca llega a `completed`.

**Reinicio** (§2.1): no implementado. Las tres páginas bloquean la edición de salidas aprobadas, y las autorizaciones solo se disparan después de aprobar, así que por interfaz no puede ocurrir. Se construirá como trigger `AFTER UPDATE` para cubrir PATCH directos. **No bloquea la primera versión.**

---

## 8. Reparto de responsabilidades

| Componente | Responsabilidad |
|---|---|
| Postgres | Toda la lógica de datos |
| GAS portal | Trigger diario, envío de correos a familias, endpoints del portal |
| SchoolNet | Panel de seguimiento, configuración, desvinculación |

**Dos rutas de correo, dos audiencias.** SchoolNet notifica a trabajadores con `sendNotification()` (aprobador, chef, supervisora, `svc_service_type_notifications`). El GAS del portal notifica a familias desde el trigger. La ruta de SchoolNet exige un navegador abierto y no sirve para el disparo automático.

---

## 9. Estado del código de interfaz

**Modificado y verificado:**
- `pedagogical-trips.html`: Quill + `family_notice` vía PATCH posterior al RPC (ver §12.1)
- `sports-trips.html`: **corrección de llave faltante** + Quill + `family_notice`
- `rep-trips.html`: Quill + `family_notice`

**Sin tocar:** `families.html`, GAS del portal, `config.html` de servicios.

### 9.1 Corrección crítica en `sports-trips.html`

El archivo tenía un `else` sin cerrar en `submitTrip()`. Resultado: `Uncaught SyntaxError: Unexpected token 'catch'`, que rompía el parseo de todo el bloque `<script>`. **La página no funcionaba desde marzo** (`page-version 26.03.17.04.20`) y nadie lo había notado porque el módulo nunca entró en operación.

Corregido en DEV. **Debe subirse a `main` como corrección independiente.**

Consecuencia pendiente de probar: ahora la edición sí ejecuta los pasos 3–5 (roster, nodos, adultos). Ese camino **nunca se ha ejercido**. Conviene crear una salida deportiva, editarla y verificar que roster, nodos y adultos siguen existiendo después.

---

## 10. Textos

**Declaración aprobada:**

```
Yo, {familiar}, en calidad de {parentesco} de {estudiante}, del curso
{curso}, autorizo su participación en {titulo}, con destino a {destino},
el día {fecha}, con salida a las {hora_salida} y regreso a las
{hora_regreso}.

Declaro haber leído la información enviada por el Colegio sobre esta
salida y aceptar las condiciones allí descritas.
```

Diferencias respecto al desprendible en papel, deliberadas:
- Incorpora fecha, horas y destino: el snapshot debe sostenerse solo como evidencia
- Identifica a quien responde: el equivalente de la firma es la sesión autenticada
- El segundo párrafo ata la declaración al `family_notice`

**Variables disponibles:** `{estudiante}`, `{curso}`, `{tipo_salida}`, `{titulo}`, `{descripcion}`, `{aviso_familias}`, `{fecha}`, `{fecha_iso}`, `{hora_salida}`, `{hora_regreso}`, `{destino}`, `{modalidad_transporte}`, `{acompanantes}`, `{servicio_alimentacion}`, `{fecha_limite}`, `{url_portal}`, `{familiar}`, `{familiar_registrado}`, `{parentesco}`.

**Momentos de resolución distintos:** el correo se resuelve al disparar; la declaración al responder, porque nombra a quien responde.

`{servicio_alimentacion}` se resuelve por estudiante desde `svc_student_year_services` con el año de `academic_years.is_current`. Reemplaza el párrafo genérico de la circular por una indicación concreta.

**Datos de `family_members` verificados:** 574 activos, 100% con formato "Apellido, Nombre", 100% con parentesco, solo dos valores ("Madre" 289, "Padre" 285). 289 familias con prácticamente ambos padres registrados.

---

## 11. Casos borde verificados

| Caso | Comportamiento | Probado |
|---|---|---|
| Reejecución del disparo | No duplica | Sí |
| Reejecución de la transición | No duplica roster | Sí |
| Estudiante desvinculado | Autorización a `cancelled` / `student_unlinked` | Sí |
| Estudiante revinculado | Autorización nueva, ciclo 2 | Sí |
| Dos familiares responden a la vez | Primera gana, segunda recibe `ya_resuelta` | Sí |
| Familiar de otra familia | `familiar_no_autorizado` | Sí |
| Correo desconocido | Devuelve vacío | Sí |
| Estudiante sin familiar con correo | Se omite del envío | Sí — 4 de 46 en DEV |
| Salida fuera de ventana de disparo | No se procesa | Sí |
| Registro de correo con autorización inexistente | Se descarta sin abortar el lote | Sí |
| Salida cancelada o suspendida | Autorizaciones a `cancelled` | No |
| Recordatorios | — | No |
| Cierre por vencimiento | — | No |

---

## 12. Deuda técnica y riesgos

### 12.1 Introducida por este desarrollo

**`family_notice` en pedagógicas se guarda con un PATCH posterior al RPC**, no dentro de la transacción. Si el PATCH falla, la salida queda creada sin el aviso y se muestra una advertencia. Razón: `create_pedagogical_trip` y `update_pedagogical_trip` tienen parámetros fijos, y `CREATE OR REPLACE` no puede cambiar el número de parámetros — habría que hacer `DROP FUNCTION` con la firma completa y reescribir dos funciones largas. Se puede plegar ahí cuando haya otra razón para tocarlas.

### 12.2 Hueco conocido del disparo

Con `min_days_advance = 1`, una salida creada hoy para mañana no dispararía hasta la corrida de las 3 a.m., cuando el plazo (24 h antes) ya venció. **Solución: invocar `dispatch_trip_authorizations` también al aprobar una salida**, no solo desde el cron. Pendiente, va con la pantalla de aprobaciones.

### 12.3 Detectada en código existente

| Hallazgo | Ubicación | Severidad |
|---|---|---|
| `else` sin cerrar — página muerta desde marzo | `sports-trips.html` | **Corregido** |
| `EXCEPTION WHEN OTHERS` devuelve `success: false` y la página solo hace `console.warn`: fallo de roster invisible | `transition_trip_statuses` | Alta |
| Las transiciones de estado solo corren si alguien abre la página. Sin navegador, ninguna salida cambia de estado | `pedagogical-trips.html`, `commons.js` | Alta |
| La edición borra el roster completo, perdiendo desvinculaciones previas | deportivas y representación | Media |
| `supabaseFetch` devuelve `[]` cuando falla el parseo: un error se ve igual que un resultado vacío | GAS portal | Media |
| Default de `days_before_imminent` inconsistente: `2` en el RPC, `3` en `commons.js` (el real es 8) | ambos | Baja |
| Contactos de emergencia hardcodeados | tres páginas | Baja |
| `PERM_RESOLUCION_ID` hardcodeado | `commons.js` | Baja |
| `linear-gradient` en `.cost-summary-card` | `pedagogical-trips.html` | Cosmética |

### 12.4 Riesgos de operación

**El módulo de salidas nunca ha operado.** Cero salidas en PROD. La primera salida real estrenaría a la vez el módulo, el portal en PROD y la política de "sin respuesta no viaja". Mitigación sugerida: parámetro de **modo informativo** para las primeras salidas — se envían autorizaciones y se ve el panel, pero la falta de respuesta no impide viajar.

**Carga de familias incompleta.** A la espera del cierre de matrículas. En DEV, 4 de 46 estudiantes sin familiar activo con correo (Bloque C: familia existe, familiar sin correo). El módulo no debe operar antes de cerrar la carga. **El panel debe mostrar este contador siempre**, no solo ahora: un estudiante nuevo a mitad de año reproduce el caso con las matrículas cerradas.

**Cuota de `MailApp`.** Una salida de un grado son 40–80 correos. Varias salidas el mismo día, más recordatorios, más OTP, pueden acercarse al límite diario de Workspace.

**Prerrequisitos del portal:** crear `portal_access_codes` y `portal_sessions` en PROD; despliegue GAS separado para PROD; publicar `families.html` en PROD; limpiar datos de prueba en DEV.

---

## 13. Pendientes de definición

| # | Pendiente | Responsable |
|---|---|---|
| 1 | Valores definitivos de los parámetros de tiempo (los actuales son propuesta) | Coordinación de Servicios |
| 2 | Qué se hace hoy cuando hay que mover la fecha de una salida aprobada. Si es cancelar y recrear, el reinicio queda como red de seguridad | Coordinación de Servicios |
| 3 | Si se adopta el modo informativo para las primeras salidas | Institucional |
| 4 | Esquema de pruebas de correo (ver §14) | Técnica |

---

## 14. Punto de retoma

### 14.1 Estado de los ambientes

DEV y PROD **alineados**: dos tablas, diez funciones, `transition_trip_statuses` refactorizada, `family_notice` en tres tablas, diez parámetros de configuración.

**En DEV quedan datos de prueba.** La salida `f0e1aeba-7f45-4f99-a2db-e2374b462eeb` ("Titulo de la salida", Cuarto A, 46 estudiantes) tiene la fecha adelantada a `CURRENT_DATE + 4` y 46 autorizaciones creadas, una de ellas con un correo registrado en la bitácora. Para limpiar:

```sql
DELETE FROM svc_trip_authorizations
WHERE trip_id = 'f0e1aeba-7f45-4f99-a2db-e2374b462eeb';

UPDATE svc_pedagogical_trips SET trip_date = '2026-07-28'
WHERE trip_id = 'f0e1aeba-7f45-4f99-a2db-e2374b462eeb';
```

**PROD sin autorizaciones.** Verificado en cero.

### 14.2 Advertencia antes de tocar Apps Script

El trigger de GAS es el primer punto donde el sistema **envía correos reales a familias reales**. En DEV, `family_members` contiene las direcciones de producción — son personas.

Antes de ejecutar cualquier envío hay que definir el esquema de pruebas. Lo habitual es una lista blanca en Script Properties: en DEV solo se envía a direcciones autorizadas, y el resto se registra en la bitácora como si se hubiera enviado. Sin eso, una sola ejecución de prueba escribe a decenas de familias.

### 14.3 Orden sugerido

1. **Esquema de pruebas de correo** (§14.2) — bloquea todo lo demás
2. Trigger diario GAS: `dispatch` → `get_emails('initial')` → enviar → `log` → `get_emails('reminder')` → enviar → `log` → `close`
3. Endpoints GAS: `get_authorizations`, `get_authorization_detail`, `submit_authorization` — envolturas sobre las funciones de Postgres, siguiendo el patrón de `getChildren`
4. Pantalla de respuesta en `families.html`
5. Panel de seguimiento en Servicios (página satélite, **`url_path = NULL`** en su permiso)
6. Pantalla de configuración en `config.html` de servicios
7. Bloqueo de borrado con autorizaciones enviadas
8. Invocar el disparo al aprobar una salida (§12.2)
9. Trigger de reinicio por cambio sustancial
10. Pruebas de punta a punta con familia controlada
11. Replicación a PROD

### 14.4 Contexto que hará falta

Archivos que la próxima sesión debe tener a la vista: el proyecto GAS del portal (`doPost`, `request_code`, `verify_code`, `get_children`, `supabaseFetch`), `families.html`, `modules/services/config.html`, y `modules/services/approvals.html` para el punto 8.

**Sobre el repositorio:** la rama `developmen` estaba **880 commits detrás de `main`** al momento de esta sesión. Conviene verificar de qué rama sale el código antes de editarlo, y resincronizar si hace falta. La corrección de `sports-trips.html` (§9.1) debe subirse a `main` de forma independiente.
