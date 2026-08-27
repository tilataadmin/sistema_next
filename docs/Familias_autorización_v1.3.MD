# Levantamiento — Autorización familiar de salidas

**Versión:** 1.3
**Fecha:** 27 de agosto de 2026
**Módulos:** Servicios (`services`) + Portal de Familias
**Estado:** Capa de datos completa. Apps Script de DEV completo y probado. Pendientes: pantalla del portal, panel de Servicios, replicación a PROD.

> **Cambios respecto a v1.2:** se documenta la sesión del 27 de agosto — política de correo por ambiente, corrida diaria, endpoints del portal y corrección de `submit_trip_authorization`. Se corrigen tres afirmaciones de v1.2 que ya no eran ciertas. Se agrega la §15, inventario de datos de prueba en DEV, y la §16, verificación de inocuidad en PROD.

---

## 1. Respuesta a la pregunta operativa

**¿Si hoy alguien programa una salida en PRODUCCIÓN, se envían autorizaciones a las familias?**

**No.** No sale ningún correo a familias por concepto de autorizaciones. Cuatro razones independientes, cualquiera de ellas suficiente:

1. **El código de envío no existe en el proyecto GAS de producción.** Todo lo construido en esta sesión —`enviarCorreo`, `procesarAutorizacionesDiarias`, `enviarLoteAutorizaciones` y los tres endpoints— se escribió únicamente en `schoolnet_portal_familias` (DEV). El proyecto `Portal de Familias — PRODUCCIÓN` conserva la versión `26.8.3.1`, anterior a estos cambios.
2. **No hay activador por tiempo instalado en ninguno de los dos proyectos.** Verificado en DEV. Pendiente de verificar en PROD (§16).
3. **Ninguna página de SchoolNet invoca el disparo.** Verificado por inspección de `pedagogical-trips.html`, `sports-trips.html` y `rep-trips.html`: cero referencias a `svc_trip_authorizations` y cero llamadas a `dispatch_trip_authorizations`. La única RPC de salidas que las páginas invocan es `transition_trip_statuses`, que materializa el roster pero no dispara autorizaciones.
4. **Las funciones de Postgres no se autoejecutan.** Existen en PROD desde julio, pero una función solo corre si algo la llama.

**El momento en que esto deja de ser cierto es uno y está identificado:** cuando se copie el código a `Portal de Familias — PRODUCCIÓN`. Ese es el punto de no retorno y debe ser una decisión explícita, no un efecto colateral de sincronizar proyectos.

**Riesgo residual a vigilar:** la política de correo por ambiente protege DEV, no PROD. En PROD `enviarCorreo` envía sin filtro, por diseño. Si el código se copia antes de que la pantalla del portal exista, las familias recibirían un correo con un enlace a una página que no sabe mostrar autorizaciones.

---

## 2. Orden correcto de habilitación en PROD

El envío es lo último, no lo primero. Secuencia obligada:

1. Pantalla de respuesta en `families.html`, publicada en el dominio de PROD.
2. Panel de seguimiento en Servicios.
3. Replicación del código GAS a PROD.
4. Prueba de punta a punta en PROD con una familia controlada, **sin activador**, invocando la corrida a mano.
5. Instalación del activador diario, solo en PROD.

Invertir 3 y 1 produce exactamente el problema que motiva esta sección.

---

## 3. Correcciones a la versión 1.2

| §  v1.2 | Afirmación | Estado real |
|---|---|---|
| 12.3 | `supabaseFetch` devuelve `[]` cuando falla el parseo — severidad media | **Ya estaba resuelto.** La versión `26.8.3.1` lanza en caso de fallo y `doPost` lo traduce a JSON legible. |
| 14.2 | El trigger de GAS sería el primer punto donde el sistema envía correos reales a familias reales | **Falso.** `enviarCorreoCodigo` y `enviarCorreoInscripcion` ya enviaban sin filtro desde antes. La advertencia era correcta pero llegó tarde. |
| 14.4 | El proyecto GAS del portal tiene `request_code`, `verify_code`, `get_children`, `supabaseFetch` | **Incompleto.** También tiene el flujo completo de extracurriculares: `get_portal_data`, `get_extracurricular_offer`, `get_my_enrollments`, `enroll_student`. |
| 3 | `trip_auth_days_before_request` = 5 | **Es 6** en DEV. Verificar PROD y decidir cuál es el valor correcto. |
| 12.4 | Falta definir despliegue GAS separado para PROD | **Ya existe.** `Portal de Familias — PRODUCCIÓN`, apuntando a `mrtuerkncqodhakuwjob`. Mismo código, distintas Script Properties. |

---

## 4. Lo construido en esta sesión

### 4.1 Política de correo por ambiente

Función única `enviarCorreo(to, subject, html)` por la que pasa **todo** envío del proyecto. El ambiente se deriva de `SUPABASE_URL`, no de una bandera aparte, de modo que el mismo código corre en los dos proyectos y la diferencia sigue viviendo en las Script Properties.

| Ambiente | Comportamiento |
|---|---|
| PRODUCCIÓN (`mrtuerkncqodhakuwjob`) | Envía sin filtro |
| DESARROLLO (`spjzvpcsgbewxupjvmfm`) | Envía solo a `DEV_EMAIL_WHITELIST`. Si la propiedad no existe o está vacía, **no envía nada** |
| No reconocido | No envía |

**El error por omisión es dejar de enviar, nunca enviar de más.** Se descartó la variante "si no hay lista, enviar a todos" precisamente por ser fail-open: una propiedad borrada por accidente habría producido un envío masivo silencioso.

Nueva Script Property, solo en DEV: `DEV_EMAIL_WHITELIST`, correos separados por coma.

Las dos rutas de correo preexistentes (`enviarCorreoCodigo`, `enviarCorreoInscripcion`) se redirigieron a esta función. Ya no hay llamadas sueltas a `MailApp.sendEmail`.

**Probado:** correo en lista blanca devuelve `true`; correo fuera devuelve `false` y registra `CORREO SUPRIMIDO (fuera de lista blanca)`.

### 4.2 Corrida diaria

`procesarAutorizacionesDiarias()` encadena: `dispatch_trip_authorizations` → lote `initial` → lote `reminder` → `close_trip_authorizations`. Registra el resultado de cada paso y destaca las salidas con ventana insuficiente.

`enviarLoteAutorizaciones(tipo)` envía y registra en bitácora. Decisiones de diseño:

- **La bitácora se escribe después de cada autorización, no al final del lote.** Si la ejecución se corta —tiempo agotado, cuota, red— lo ya enviado queda registrado y la corrida siguiente no lo repite. Al revés, un corte produciría correos enviados sin rastro que las familias recibirían dos veces.
- **Los correos suprimidos se registran como `sent` con `error_message = 'SIMULADO (DEV)'`.** Se prefirió esto a ampliar el CHECK de `send_status` con un tercer valor: no requiere DDL en dos ambientes y, sobre todo, hace que el flujo en DEV avance igual que en PROD. Con `failed`, la lógica de "ya se envió, no repetir" se comportaría distinto y estaríamos probando otro camino. El destinatario que habría recibido queda guardado, que es lo que constituye evidencia. Costo aceptado: `error_message` carga dos significados, pero la marca solo existe en DEV.
- **Un fallo de envío no aborta el lote.** Queda como `failed`; `get_authorization_emails_to_send` lo sigue listando y se reintenta en la corrida siguiente. No hace falta lógica de reintento propia.
- **Se consulta `MailApp.getRemainingDailyQuota()` antes del lote** y se detiene si no alcanza para la autorización en curso, dejando constancia. El agotamiento de cuota queda visible y no se confunde con un fallo.

**Probado en DEV:**

| Prueba | Resultado |
|---|---|
| Corrida sin salidas en ventana | Cuatro llamadas en ceros, 2.5 s |
| Corrida con salida en ventana | 1 salida, 19 autorizaciones creadas, 37 destinatarios, 37 suprimidos, 0 enviados, 0 fallidos, 19 s |
| Bitácora | 37 filas `initial` / `sent` / `SIMULADO (DEV)` |
| Segunda corrida (idempotencia) | `trips_processed: 1`, `authorizations_created: 0`, ambos lotes vacíos |
| Resolución de variables | Asunto correcto, fecha en español ("1 de septiembre de 2026") |

### 4.3 Endpoints del portal

Tres acciones nuevas registradas en `doPost`: `get_authorizations`, `get_authorization_detail`, `submit_authorization`. Más `mensajeAutorizacion(codigo)`, que traduce los códigos de error de Postgres a texto para la familia — se traduce en GAS y no en la base para que Postgres no cargue con textos de interfaz.

**Hallazgo de seguridad y su tratamiento.** `submit_trip_authorization` recibe `p_family_member_id` y valida que ese familiar pertenezca a la familia del estudiante, **pero no que corresponda al correo de la sesión**. Si GAS aceptara ese id desde el navegador, alguien con sesión de la familia A podría enviar un `authorization_id` y un `family_member_id` ambos de la familia B —coherentes entre sí— y la función los aceptaría: quedaría registrada una autorización firmada por una persona que nunca respondió.

**Tratamiento:** el `family_member_id` nunca viene del navegador. `submitAuthorization` llama primero a `get_authorization_detail` con el correo de la sesión —que sí resuelve el familiar desde el correo y devuelve `familiar_no_autorizado` si no empata— y usa el id que esa función devuelve. Cuesta una llamada adicional y reutiliza validación ya escrita en vez de duplicarla. Es el mismo hueco que `enroll_student` cubre con `hijosDelCorreo`, resuelto por otra vía.

**Probado en DEV** (llamando a las funciones de Postgres directamente, no aún vía `/exec`):

| Prueba | Resultado |
|---|---|
| `get_family_authorizations` | Devuelve el hijo con su autorización pendiente |
| `get_authorization_detail` | `puede_responder: true`, `motivo_bloqueo: null`, `family_member_id` resuelto |
| Declaración resuelta | Sin variables sin sustituir; nombre invertido, destino, fecha en español, horas en formato 12 h |
| `deadline_at` | 24 h exactas antes de la salida, zona horaria correcta |
| Respuesta `authorized` | `success: true`, evidencia escrita |
| Segunda respuesta sobre la misma | `success: false`, `error: ya_resuelta` — primera respuesta gana |
| Respuesta `denied` con razón | `success: true`, `denial_reason` guardada |
| Evidencia | `declaration_snapshot` de 462 caracteres, `trip_data_snapshot` con `aviso_familias` |

### 4.4 Corrección de `submit_trip_authorization`

**Defecto:** la función guardaba en `responded_by_name` el valor de `familiar_registrado` —formato crudo "Apellido, Nombre"— pero devolvía en su respuesta `familiar`, el invertido. Resultado: la declaración firmada decía "Cuenta de Pruebas" mientras la columna guardaba "Pruebas, Cuenta de", y todo lo que leyera de esa columna —panel de Servicios, `get_family_authorizations`, el aviso de "ya respondió Fulano"— mostraría un formato distinto al de la evidencia.

**Corrección:** `responded_by_name = v_member ->> 'familiar'`. Aplicada y verificada en DEV. **Pendiente en PROD.**

Se corrigió de inmediato y no se dejó para después porque cada respuesta registrada mientras tanto habría quedado con el formato incorrecto, obligando a un UPDATE masivo posterior.

---

## 5. Estado por paso del plan (§14.3 de v1.2)

| # | Paso | Estado |
|---|---|---|
| 1 | Esquema de pruebas de correo | **Cerrado** |
| 2 | Trigger diario GAS (lógica, sin activador) | **Cerrado** |
| 3 | Endpoints GAS del portal | **Cerrado** — falta prueba vía `/exec` con token real |
| 4 | Pantalla de respuesta en `families.html` | Pendiente |
| 5 | Panel de seguimiento en Servicios (`url_path = NULL`) | Pendiente |
| 6 | Pantalla de configuración en `config.html` de servicios | Pendiente |
| 7 | Bloqueo de borrado con autorizaciones enviadas | Pendiente |
| 8 | Invocar el disparo al aprobar una salida | Pendiente |
| 9 | Trigger de reinicio por cambio sustancial | Pendiente |
| 10 | Pruebas de punta a punta | Pendiente |
| 11 | Replicación a PROD | Pendiente |

---

## 6. Casos aún no probados

De la §11 de v1.2, siguen sin verificar:

- **Recordatorios.** Exigen que hoy coincida con `deadline_at` menos 3 o menos 1 días. Se prueban moviendo la fecha de la salida.
- **Cierre por vencimiento.** Se prueba dejando vencer el plazo o retrocediendo `deadline_at`.
- **Salida cancelada o suspendida.**

Ninguno bloquea el avance. Conviene agruparlos con la prueba de punta a punta.

---

## 7. Hallazgos nuevos

### 7.1 Correo de relleno en `family_members`

Existe `noaplica@noaplica.com` como familiar activo del estudiante 25. En PROD ese correo se enviaría, rebotaría, y el estudiante quedaría impedido para viajar sin que nadie se entere: para el sistema el envío fue exitoso.

Es una variante del riesgo de §12.4 de v1.2 que el levantamiento no contemplaba. No es "estudiante sin familiar con correo" —caso que sí se detecta y se omite—, es "estudiante con correo inválido", que no se detecta por ningún lado.

**Acción:** el contador de excepciones del panel debe incluir estos casos, no solo los estudiantes sin familiar. Conviene además una revisión de `family_members` en busca de direcciones de relleno antes de operar.

### 7.2 Desempeño de la corrida

19 autorizaciones en 19 segundos, poco menos de un segundo cada una, dominado por la escritura individual de bitácora. Unas 300 autorizaciones tomarían cerca de cinco minutos, próximo al límite de ejecución de Apps Script. Es asumible —la corrida siguiente retoma lo que quede— pero conviene tenerlo presente si coinciden varias salidas grandes el mismo día.

### 7.3 Migración de llaves de Supabase

La `SERVICE_ROLE_KEY` de PROD sigue siendo un JWT legado. Cuando se migre al formato nuevo hay que actualizar la Script Property. Si se olvida, el portal de PROD deja de responder con un síntoma confuso.

### 7.4 Versión de `rep-trips.html`

Quedó en `26.03.17.03.25` pese a haber recibido el editor Quill y el guardado de `family_notice`. Pedagógicas está en `26.7.22.1` y deportivas en `26.7.2.2`. Rompe la trazabilidad: al comparar versiones se concluiría que representación no tiene el campo.

### 7.5 Gradiente pendiente

`linear-gradient` sigue en `.cost-summary-card`, línea 45 de `pedagogical-trips.html`. Va contra la regla de no usar gradientes.

### 7.6 Correo real embebido en el código

`medirTiempos()` y `verOpciones()` tienen la dirección de una familia real escrita en el fuente, y ese fuente es idéntico en PROD. `verOpciones()` está además marcada como temporal. Conviene reemplazar por una constante leída de propiedades o por una dirección de la lista blanca.

### 7.7 Interacción futura entre `family_notice` y el reinicio

`family_notice` es campo sustancial que dispara reinicio (§2.1 de v1.2), y en pedagógicas se guarda con un PATCH **posterior** a la creación (deuda 12.1). Cuando se construya el trigger `AFTER UPDATE` del paso 9, ese PATCH será un UPDATE sobre una salida recién creada. Si el trigger no distingue "primer llenado" de "cambio real", intentaría reiniciar autorizaciones que aún no existen. Hoy no rompe nada porque el disparo solo ocurre tras aprobación, pero debe contemplarse al escribir el trigger.

---

## 8. Inventario de datos de prueba en DEV

Todo lo siguiente es artificial y debe revertirse al terminar las pruebas. Se mantiene por ahora porque es el insumo para probar la pantalla del portal.

| Elemento | Valor | Reversión |
|---|---|---|
| Solicitud aprobada a mano | `request_id = 7bce6fe2-ffb0-47e0-837f-5d6cc10fbb80` | `request_status = 'pending'` |
| Fecha de salida movida | `trip_id = 9b5ce7e3-b5df-4a58-8cd2-2788ed3f626b`, hoy en `CURRENT_DATE + 5` | `trip_date = '2026-08-10'` |
| Familiar de prueba | `dafi@colegiotilata.edu.co`, "Pruebas, Cuenta de", Acudiente, familia del estudiante 425 | `DELETE FROM family_members WHERE email = 'dafi@colegiotilata.edu.co'` |
| Autorizaciones | 19 creadas: 1 `authorized`, 1 `denied`, 17 `pending` | `DELETE FROM svc_trip_authorizations WHERE trip_id = '9b5ce7e3-b5df-4a58-8cd2-2788ed3f626b'` |
| Bitácora de correos | 37 filas `SIMULADO (DEV)` | Cascada al borrar las autorizaciones |
| Funciones de prueba en GAS | `probarPoliticaCorreo`, `probarEndpointsAutorizaciones`, `probarRespuestaAutorizacion` | Borrar antes de replicar a PROD |

Autorizaciones tocadas individualmente:
- `b7cd0b6f-8137-4937-91d4-5067cb49ea57` → `authorized` (estudiante 425)
- `08c98979-b037-44a8-9d9e-c6ddc32e2053` → `denied`, razón "Prueba de negativa"

---

## 9. Verificaciones pendientes en PROD

Antes de dar por buena la respuesta de la §1, conviene confirmar en el proyecto `Portal de Familias — PRODUCCIÓN`:

1. **Activadores:** panel lateral → Activadores. Debe estar vacío.
2. **Versión del código:** el encabezado debe decir `26.8.3.1`, no `26.8.27.1`. Si dice lo segundo, alguien ya copió el código nuevo.
3. **`pg_cron` en Supabase PROD:** verificar que no exista ningún job programado invocando `dispatch_trip_authorizations`.
4. **Valor de `trip_auth_days_before_request`** en PROD, para contrastar con el 6 de DEV.

---

## 10. Deuda pendiente de replicar a PROD

| Elemento | Estado |
|---|---|
| Corrección de `submit_trip_authorization` (`responded_by_name`) | Solo en DEV |
| Código GAS completo (política de correo, corrida, endpoints) | Solo en DEV — **replicar únicamente después de la §2** |
| `portal_access_codes` y `portal_sessions` | Pendientes en PROD desde la fase anterior |
| `families.html` publicado en dominio de PROD | Pendiente |

---

## 11. Punto de retoma

El siguiente paso técnico es la **pantalla de respuesta en `families.html`** (paso 4). Requiere tener el archivo a la vista.

La secuencia de §2 es la que responde a la preocupación operativa: el portal se prepara primero, el envío se habilita al final, y el punto de no retorno —copiar el código a PROD— queda como una decisión explícita.
