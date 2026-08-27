# Levantamiento — Autorización familiar de salidas

**Versión:** 1.5
**Fecha:** 27 de agosto de 2026
**Módulos:** Servicios (`services`) + Portal de Familias
**Estado:** Desplegado en DEV y PROD. **El sistema está apagado por diseño**: no genera ni envía nada hasta que se escriba una fecha en `trip_auth_start_date`.

> **Cambios respecto a v1.4:** se agrega el interruptor de arranque (`trip_auth_start_date`), el despliegue del código GAS a producción, y la corrección de la pestaña de parámetros. Cambia el punto de no retorno. Nuevas secciones: §3 (el interruptor), §6 (replicación mensual PROD→DEV).

---

## 1. Cómo encender el sistema

Todo lo construido está desplegado en los dos ambientes. **Falta una sola cosa para que empiece a operar: escribir una fecha en `trip_auth_start_date`.**

Mientras ese parámetro esté vacío:
- `dispatch_trip_authorizations` no genera ninguna autorización, en ningún ambiente.
- No hay nada que enviar, así que la corrida diaria no manda correos.
- Verificado ejecutando la corrida completa en producción: `motivo: sin_fecha_de_arranque`, cero correos.

**Pasos que faltan, en orden:**

1. El colegio fija la fecha de arranque (§9.3).
2. Prueba de punta a punta en PROD con una familia controlada: escribir una fecha temporal, ejecutar `procesarAutorizacionesDiarias()` a mano, verificar, volver a vaciar el parámetro.
3. Instalar el activador diario, **solo en el proyecto GAS de producción**.
4. Escribir la fecha definitiva.

---

## 2. Lo que quedó desplegado

| Elemento | DEV | PROD |
|---|---|---|
| Tablas de autorizaciones | Sí | Sí |
| `portal_access_codes` / `portal_sessions` | Sí | Sí |
| Diez funciones originales | Sí | Sí |
| `submit_trip_authorization` corregida | Sí | Sí |
| `get_trip_authorization_panel` | Sí | Sí |
| `list_trip_authorizations` | Sí | Sí |
| `dispatch_trip_authorizations` con fecha de arranque | Sí | Sí |
| `trip_auth_start_date` (vacío) | Sí | Sí |
| Permisos y asignaciones | Sí | Sí |
| `authorizations.html`, `trip-authorizations.html` | Sí | Sí (PR) |
| `families.html` reestructurado | Sí | Sí (PR) |
| `config.html` corregido | Sí | Pendiente de PR |
| `sidebar.js` corregido | Sí | Sí (PR) |
| **Código GAS** | Sí | **Sí — Versión 6, 27 ago 11:51** |
| Activador diario | No | **No** |

Propiedades del script en producción verificadas: solo `SUPABASE_URL` y `SERVICE_ROLE_KEY`. Sin `DEV_EMAIL_WHITELIST`, que allá suprimiría los envíos reales en silencio.

---

## 3. El interruptor de arranque

### 3.1 Por qué

Copiar el código GAS a producción dejaba el envío a un clic de distancia. En PROD `enviarCorreo` manda sin filtro, por diseño, así que una ejecución por curiosidad habría escrito a familias reales pidiendo autorizar salidas que ya estaban en marcha por otro medio.

El caso concreto: `Invitación Alcaldía La Calera`, 28 de agosto, aprobada, 19 estudiantes. Ejecutar la corrida el 27 o el 28 habría creado 19 autorizaciones con el plazo ya vencido y enviado ~38 correos.

La alternativa era esperar al 29, cuando la salida cae fuera por `trip_date >= CURRENT_DATE`. Pero eso solo protegía contra esa salida y dependía de que nadie ejecutara nada mientras tanto.

### 3.2 Qué se hizo

Parámetro `trip_auth_start_date` en `svc_module_config`, y en `dispatch_trip_authorizations`:

- Si está vacío o ausente → retorna `motivo: 'sin_fecha_de_arranque'` sin procesar nada.
- Si tiene un valor que no es fecha → retorna `error: 'fecha_de_arranque_invalida'`.
- Si tiene fecha válida → se agrega `AND t.trip_date >= v_start_date` a las tres consultas del `UNION`.

**Vacío = apagado.** Misma lógica que la lista blanca de correo: el error por omisión es no enviar.

### 3.3 Qué resuelve

- Las salidas anteriores a la fecha se manejan por fuera del sistema, sin excepciones ni casos raros.
- Deja de depender de que nadie se equivoque y pasa a depender de un dato.
- Vuelve innecesaria la decisión de "modo informativo" de la §13 de v1.2: en vez de enviar sin exigir, sencillamente no se envía.
- **Cambia el punto de no retorno.** Ya no es copiar el código GAS —eso ya está hecho y es inocuo—; ahora es escribir una fecha en una pantalla, decisión explícita del colegio.

---

## 4. Corrección de la pestaña de parámetros

### 4.1 El defecto encontrado

`cargarParametros` en `config.html` trae **todas** las filas de `svc_module_config` sin filtro y las pinta. Los ocho parámetros `trip_auth_*` creados en julio ya estaban ahí, sin etiqueta —cayendo al `config_key` crudo— y como campos de una línea.

El valor se insertaba sin escapar:

```javascript
value="${p.config_value}"
```

`trip_auth_email_body` tiene 2962 caracteres y **12 comillas dobles**. Cada una rompía el atributo y corrompía el marcado del resto de la pestaña. Estaba así en DEV **y en PROD**.

### 4.2 Lo aplicado

- Función `escaparAtributo()` — no existía ninguna en `config.html` ni en `config.js`.
- Ocho entradas nuevas en `PARAM_META` con etiqueta y descripción.
- Tipo `textarea` para las dos plantillas HTML, en monoespaciada. Un `textarea` también expone `.value`, así que `guardarParametros` funciona sin cambios.
- `min="1"` ahora solo en campos numéricos; antes iba en todos, incluidos los de texto.

### 4.3 Pendiente

- `trip_auth_start_date` se muestra sin etiqueta. Falta agregarlo a `PARAM_META` con una advertencia visible de que dejarlo vacío apaga el sistema.
- La pestaña mezcla precios de refrigerios con parámetros de autorizaciones. Con dieciséis campos pide subtítulos por grupo.
- La descripción del ítem presupuestal ocupa dos líneas y desalinea su fila.

---

## 5. Los parámetros difieren entre ambientes

| Parámetro | DEV | PROD |
|---|---|---|
| `min_days_advance` | 1 | **8** |
| `days_before_imminent` | 8 | **2** |
| `trip_auth_days_before_request` | 6 | 6 |
| `trip_auth_portal_url` | igual a PROD | dominio de producción |

La v1.2 los registraba idénticos. Ya no lo son. **Probar en DEV dice poco sobre PROD mientras esto siga así.** Alinear los valores es decisión del colegio, no técnica.

### 5.1 Consecuencia: el desfase del roster

En pedagógicas el roster se materializa al pasar a `imminent`. En PROD eso ocurre **2 días** antes de la salida, pero el disparo ocurre **6 días** antes. Cuatro días de desfase.

`dispatch_trip_authorizations` llama a `materialize_pedagogical_roster` antes de crear autorizaciones, y esa función tiene `NOT EXISTS` por estudiante, así que **no duplica**. Verificado leyendo la definición en PROD.

**Pero materializar congela la lista.** Toma los estudiantes activos de esos grados en ese momento. Un estudiante matriculado en los días siguientes entra al roster en la segunda llamada, pero **sin autorización**, porque el disparo ya pasó. Llegaría al día de la salida sin poder viajar.

Lo hace visible el contador `sin_solicitud` del panel. Cerrarlo del todo requiere revisar la condición de ventana del disparo (la exclusión por estudiante ya existe) o acercar los parámetros.

Caso poco frecuente pero real a comienzo de año.

---

## 6. Replicación mensual PROD → DEV

El equipo replica los datos de producción a desarrollo una vez al mes, para tener pruebas consistentes. Dos consecuencias que hay que tener presentes:

**La lista blanca deja de ser una comodidad y pasa a ser indispensable.** Cada replicación trae direcciones de familias reales, y con ellas autorizaciones y bitácoras reales. Sin `DEV_EMAIL_WHITELIST`, una prueba en DEV después de una replicación escribiría a las familias que acaban de responder en producción. **Nunca quitarla.**

**`trip_auth_portal_url` no distingue ambientes.** Hoy vale el dominio de producción en los dos, y la replicación lo pisaría de todos modos. En DEV se accede al portal por URL directa, así que no molesta. Si algún día hace falta que DEV apunte a su propio portal, hay que recordar que la replicación lo sobrescribe.

**Y `trip_auth_start_date` también se replica.** Si PROD tiene una fecha y DEV recibe la copia, DEV queda encendido. La lista blanca lo contiene, pero conviene vaciar el parámetro en DEV después de cada replicación.

---

## 7. Historial de lo construido

### 7.1 Política de correo por ambiente

Función única `enviarCorreo(to, subject, html)` por la que pasa todo envío. El ambiente se deriva de `SUPABASE_URL`, no de una bandera aparte, así el mismo código corre en los dos proyectos.

| Ambiente | Comportamiento |
|---|---|
| PRODUCCIÓN | Envía sin filtro |
| DESARROLLO | Solo a `DEV_EMAIL_WHITELIST`. Vacía o ausente → **no envía nada** |
| No reconocido | No envía |

Se descartó la variante "si no hay lista, enviar a todos" por ser fail-open.

**Corrección de contexto a v1.2 §14.2:** el trigger no era el primer punto de envío real a familias. `enviarCorreoCodigo` y `enviarCorreoInscripcion` ya enviaban sin filtro desde antes.

### 7.2 Corrida diaria

`procesarAutorizacionesDiarias()` encadena disparo → lote `initial` → lote `reminder` → cierre.

- **La bitácora se escribe después de cada autorización**, no al final del lote: si la ejecución se corta, lo enviado queda registrado y no se repite.
- **Los suprimidos se registran como `sent` con `error_message = 'SIMULADO (DEV)'`**, para que el flujo en DEV avance igual que en PROD. Se prefirió a ampliar el CHECK de `send_status`.
- **Un fallo no aborta el lote**: queda como `failed` y se reintenta en la corrida siguiente.
- Se consulta `MailApp.getRemainingDailyQuota()` antes del lote.

**Desempeño:** ~1 s por autorización, dominado por la escritura individual de bitácora. 300 autorizaciones ≈ 5 minutos, cerca del límite de Apps Script.

### 7.3 Endpoints del portal

`get_authorizations`, `get_authorization_detail`, `submit_authorization`, más `mensajeAutorizacion()` que traduce códigos de error de Postgres.

**Hallazgo de seguridad:** `submit_trip_authorization` valida que el `family_member_id` pertenezca a la familia del estudiante, **pero no que corresponda al correo de la sesión**. Con un `authorization_id` y un `family_member_id` ambos de otra familia —coherentes entre sí— la función los aceptaría y quedaría registrada una respuesta firmada por alguien que nunca respondió.

**Tratamiento:** el `family_member_id` nunca viene del navegador. `submitAuthorization` llama primero a `get_authorization_detail` con el correo de la sesión y usa el id que esa función devuelve.

### 7.4 Portal reestructurado

De tres pantallas planas a siete vistas con router (`mostrarVista`): acceso → inicio → módulo → detalle.

- **Inicio con tarjetas de módulo**, no pestañas: las pestañas se rompen en móvil con etiquetas largas en español y no aguantan cinco módulos; además ya hay pestañas para los hijos dentro de extracurriculares.
- Autorizaciones primero cuando hay pendientes, porque tienen fecha límite.
- `get_portal_data` extendido para devolver también `authorizations`: una sola petición.
- El aviso a familias y la declaración se insertan **sin escapar** —son HTML del colegio, no de la familia—; todo lo que viene de la base sí va escapado.
- En una autorización respondida se muestra `declaracion_aceptada`, la firmada, no la plantilla actual.

### 7.5 Panel e índice

**`get_trip_authorization_panel(service_type, trip_id)`** — una fila por estudiante con estado, quién respondió, motivo de negativa y bitácora de correos. Contadores destacables: `sin_correo` (autorización sin ningún envío: la familia nunca se enteró) y `sin_solicitud` (estudiante en el roster sin autorización).

**`list_trip_authorizations(p_user_id)`** — índice de las tres modalidades. **Resuelve el alcance internamente** consultando `user_roles` → `roles` → `role_permissions`. Incluye salidas aprobadas aún sin autorizaciones.

**Páginas:** `authorizations.html` (índice, va en el menú) y `trip-authorizations.html` (panel por salida, satélite, sin permiso propio).

### 7.6 Control de acceso

Se revirtió una propuesta inicial. Se había argumentado que restringir por creador daba poco porque las páginas de salidas ya muestran todos los rosters. El argumento era malo: **`denial_reason` es texto libre escrito por la familia** y puede contener información médica o económica.

| Permiso | Alcance | `url_path` |
|---|---|---|
| `Seguimiento de autorizaciones` | Solo las salidas que el usuario creó | `/modules/services/authorizations.html` |
| `Administrador de autorizaciones de salidas` | Todas | `NULL` |

**El segundo es un modificador, no una llave.** Ambas páginas validan contra el primero. Las secretarías llevan los dos.

Asignación derivada de los datos: el permiso base se dio a los roles que ya tienen alguno de los tres permisos de salidas. Es autolimitante — quien nunca programa una salida no ve nada.

### 7.7 Corrección de `submit_trip_authorization`

Guardaba `responded_by_name` con `familiar_registrado` ("Apellido, Nombre") pero devolvía `familiar` ("Nombre Apellido"). La declaración firmada y la columna quedaban con formatos distintos. Corregido a `v_member ->> 'familiar'` y replicado a PROD.

### 7.8 Defecto en `sidebar.js`

El comparador de orden tenía `if (ib === -1) return 1;` donde debía ser `-1`. Como algunos permisos no están en la lista de orden de su módulo, empujaban al final a todo lo que sí estaba. Corregido — afecta a todos los módulos.

**`MODULE_ITEM_ORDER` no es lista blanca**, solo orden: los ítems ausentes se muestran igual, al final.

---

## 8. Pruebas realizadas

### 8.1 DEV

| Prueba | Resultado |
|---|---|
| Corrida sin salidas en ventana | Todo en ceros, 2.5 s |
| Corrida con salida en ventana | 19 autorizaciones, 37 destinatarios, 37 suprimidos, 0 enviados |
| Bitácora | 37 filas `initial` / `sent` / `SIMULADO (DEV)` |
| Idempotencia | 0 creadas en la segunda corrida |
| Portal: los cuatro caminos vía `/exec` | Pendiente, autorizada, negada con motivo, ya respondida |
| Evidencia en base | `declaration_snapshot` 462 caracteres, `trip_data_snapshot` con `aviso_familias`, `denial_reason` limpiado al autorizar |
| Fecha de arranque vacía | `motivo: sin_fecha_de_arranque`, cero procesadas |
| Fecha de arranque puesta | Procesa la salida, cero creadas por idempotencia |

### 8.2 Control de acceso (DEV)

| Escenario | Resultado |
|---|---|
| Super admin | Ve todas |
| Secretaria Académica con permiso admin | Ve todas, incluida una salida ajena |
| Usuaria sin admin ni salidas propias — índice | "Las salidas que tú programaste", vacío |
| La misma, **panel por URL directa** | Rechazado |

El último es el que importa: un enlace compartido no es puerta trasera.

### 8.3 PROD

| Prueba | Resultado |
|---|---|
| `diagnostico()` | Ambiente PRODUCCIÓN, tres lecturas OK |
| Propiedades del script | Solo `SUPABASE_URL` y `SERVICE_ROLE_KEY` |
| Despliegue | Versión 6, 27 ago 11:51 |
| `procesarAutorizacionesDiarias()` | `sin_fecha_de_arranque`, ambos lotes vacíos, cierre en ceros, 955 ms, **cero correos** |

### 8.4 Sin probar todavía

- Recordatorios (exige que hoy coincida con `deadline_at` menos 3 o 1)
- Cierre por vencimiento
- Salida cancelada o suspendida
- Flujo completo del portal en PROD
- Envío real de un correo de autorización, en cualquier ambiente

---

## 9. Pendientes

### 9.1 Deuda técnica

| # | Pendiente | Prioridad |
|---|---|---|
| 1 | Endurecer el acceso del panel dentro de la función, como ya hace `list_trip_authorizations` | Alta |
| 2 | Botón de acceso al panel desde las tres páginas de salidas | Media |
| 3 | Acciones del panel: reenviar, reabrir, desvincular. Exigen modificar `get_authorization_emails_to_send` para manejar `'reopen'` | Media |
| 4 | Etiqueta y advertencia para `trip_auth_start_date` en la pestaña de parámetros | Media |
| 5 | Subtítulos por grupo en la pestaña de parámetros | Baja |
| 6 | Alinear parámetros entre ambientes | Media — institucional |
| 7 | Desfase del roster en pedagógicas (§5.1) | Media |
| 8 | Probar recordatorios y cierre por vencimiento | Media |
| 9 | `config.html` corregido pendiente de llevar a PROD | Media |
| 10 | Revisar el orden del sidebar en otros módulos | Baja |
| 11 | `verOpciones()` y `medirTiempos()` llevan un correo de familia real, ahora también en el código de PROD | Baja |
| 12 | En `construirOferta`, `not_yet` y `no_window` comparten mensaje; se distinguen solo porque uno trae `date` | Baja |
| 13 | Versión de `rep-trips.html` sin actualizar (`26.03.17.03.25`) | Baja |
| 14 | `linear-gradient` en `pedagogical-trips.html` línea 45 | Baja |
| 15 | `created_by` a NOT NULL en `svc_rep_trips` | Baja |
| 16 | Interacción entre `family_notice` y el futuro trigger de reinicio | A tener en cuenta |

### 9.2 Hallazgos sobre datos

**Correos de relleno y contactos únicos.** `sin_correo` atrapa el caso de cero contactos, pero no estos dos, presentes en DEV: un estudiante con `noaplica@noaplica.com` (en PROD se enviaría, rebotaría, y para el sistema el envío fue exitoso) y otro con un solo familiar donde el resto tiene dos. Ninguno es detectable por contador; por eso la bitácora de destinatarios está a la vista en el panel.

**El aviso a familias repite datos que el sistema ya tiene.** El `family_notice` de la salida de prueba repite fecha, hora, destino y lugar de salida como texto libre, con una errata, y ya diverge de los datos estructurados. Debería limitarse a lo que la base no sabe: qué llevar, vestuario, seguros, gratuidad.

**Destino genérico en la declaración firmada.** `Hato - La Calera` no coincide con el destino real, `Colegio El Frailejonal La Calera`. Ese valor entra en `declaration_snapshot`, que es la evidencia.

### 9.3 Decisiones institucionales

1. **Fecha de arranque del sistema** (`trip_auth_start_date`) — es lo único que falta para encender
2. Valores definitivos de los parámetros de tiempo, y si se alinean entre ambientes
3. Qué se hace cuando hay que mover la fecha de una salida ya aprobada
4. Depuración de correos de relleno en `family_members`
5. Criterio de contenido del `family_notice`
6. Revisión del catálogo de destinos

---

## 10. Aprendizajes de plataforma

**`permission_module` debe coincidir con el id del módulo en `SIDEBAR_MODULE_ORDER`**, que para servicios es `services` en minúscula. Se creó el permiso con `'Servicios'` y desapareció del menú sin ningún error: existía, tenía `url_path`, el usuario lo tenía, pero quedaba en un grupo que ningún módulo reclamaba. La guía de módulos dice CamelCase en español y trata el inglés minúscula como excepción legacy; servicios usa `services`. **Verificar siempre contra un permiso existente del mismo módulo.**

**Un permiso de alcance no reemplaza al de acceso.** Debe ir siempre acompañado del permiso base contra el que validan las páginas.

**`NULL` sin tipo en un `SELECT`** falla con `column is of type uuid but expression is of type text`. Escribir `NULL::uuid`.

**Sobre la tabla de permisos:** nunca `ON CONFLICT`; los `INSERT` van con guarda `NOT EXISTS`; después de cualquier cambio, limpiar `sessionStorage.removeItem('schoolnet_sidebar_permissions')`.

**Los valores que van dentro de un atributo HTML deben escaparse.** Ni `config.html` ni `config.js` tenían función de escape, y eso permitió que una plantilla HTML almacenada en base corrompiera una pestaña entera durante semanas sin que nadie lo notara.

**Un despliegue de Apps Script no es guardar.** `diagnostico()` corre desde el editor y no prueba el `/exec`. Cada cambio exige Implementar → Nueva implementación con versión nueva.

---

## 11. Datos de prueba en DEV

| Elemento | Reversión |
|---|---|
| Solicitud `7bce6fe2-...` aprobada a mano | `request_status = 'pending'` |
| Salida `9b5ce7e3-...` con fecha movida | `trip_date = '2026-08-10'` |
| Familiar `dafi@colegiotilata.edu.co` en la familia del estudiante 425 | `DELETE FROM family_members WHERE email = 'dafi@colegiotilata.edu.co'` |
| 19 autorizaciones + 37 correos `SIMULADO (DEV)` | `DELETE FROM svc_trip_authorizations WHERE trip_id = '9b5ce7e3-...'` |
| `trip_auth_start_date` con fecha de prueba | Vaciar |

Las funciones de prueba (`probarPoliticaCorreo`, `probarEndpointsAutorizaciones`, `probarRespuestaAutorizacion`) ya se retiraron del código antes de replicar.

---

## 12. Punto de retoma

El sistema está completo y apagado. Lo siguiente es una decisión institucional, no técnica: **la fecha de arranque**.

Cuando esté definida, la secuencia es la de la §1. Antes conviene resolver el pendiente 1 de la §9.1 —endurecer el acceso del panel dentro de la función— que es media hora y deja el criterio de acceso en un solo lugar en vez de dos.

**La salida `Invitación Alcaldía La Calera` del 28 de agosto se maneja por fuera del sistema**, como estaba previsto. A partir del 29 queda fuera del disparo por fecha, además de estar protegida por el interruptor de arranque.
