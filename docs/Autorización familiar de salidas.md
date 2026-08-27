# Levantamiento — Autorización familiar de salidas

**Versión:** 1.4
**Fecha:** 27 de agosto de 2026
**Módulos:** Servicios (`services`) + Portal de Familias
**Estado:** Capa de datos, Apps Script de DEV, portal y panel completos y probados. PROD tiene funciones y permisos; falta el código GAS. **Nada envía correos todavía.**

> **Cambios respecto a v1.3:** se documenta el resto de la sesión del 27 de agosto — panel de seguimiento, índice consolidado, permisos, reestructuración del portal, y la replicación parcial a PROD. Se corrigen tres afirmaciones más de v1.2. Nuevas secciones: §4 (el punto de no retorno), §11 (aprendizajes de plataforma) y §12 (estado por ambiente).

---

## 1. Dónde estamos

| Paso (§14.3 de v1.2) | Estado |
|---|---|
| 1. Esquema de pruebas de correo | Cerrado |
| 2. Corrida diaria GAS | Cerrado, sin activador |
| 3. Endpoints GAS del portal | Cerrado |
| 4. Pantalla de respuesta en `families.html` | **Cerrado** |
| 5. Panel de seguimiento en Servicios | **Cerrado en lectura**; acciones pendientes |
| 6. Pantalla de configuración en `config.html` | Pendiente |
| 7. Bloqueo de borrado con autorizaciones enviadas | Pendiente |
| 8. Invocar el disparo al aprobar una salida | Pendiente |
| 9. Trigger de reinicio por cambio sustancial | Pendiente |
| 10. Pruebas de punta a punta | Parcial |
| 11. Replicación a PROD | **En curso** |

---

## 2. Panel de seguimiento (paso 5)

### 2.1 Por qué se partió en dos fases

Se construyó **solo la lectura**. Las acciones —reenviar a pendientes, reabrir un caso— chocan con dos restricciones que no se habían advertido:

1. **SchoolNet no puede enviar correos a familias.** `sendNotification()` va al GAS de notificaciones, que escribe a trabajadores y necesita un navegador abierto. La ruta a familias es el GAS del portal. El panel solo podría **escribir la intención** y dejar que la corrida diaria la ejecute.
2. **`get_authorization_emails_to_send` no implementa `'reopen'`.** El valor existe en el CHECK de `svc_trip_authorization_emails`, pero la función solo maneja `'initial'` y `'reminder'`, y para `'initial'` excluye toda autorización que ya tenga un correo `sent` — que es justamente el caso de una reabierta. Las acciones exigen modificar esa función.

Esto coincide con el plan original de la v1.0, que decía "panel de seguimiento por salida (lectura primero)".

### 2.2 Funciones nuevas

**`get_trip_authorization_panel(service_type, trip_id)`** — cabecera de la salida, una fila por estudiante con estado, quién respondió, motivo de negativa y bitácora de correos anidada, más ocho contadores. Omite el ciclo `superseded`: el panel muestra el estado actual, no el historial.

Dos contadores merecen mención:
- **`sin_correo`** — autorización creada pero sin un solo correo registrado. Es el estudiante sin familiar activo con correo, cuya familia nunca se enteró. No existía forma de verlo antes.
- **`sin_solicitud`** — estudiante en el roster (`is_attending = true`) sin autorización vigente. Antes del disparo son todos; después son los que quedaron fuera.

**`list_trip_authorizations(p_user_id)`** — índice consolidado de las tres modalidades, con contadores por salida. **Resuelve el alcance internamente**, consultando `user_roles` → `roles` → `role_permissions`. Incluye salidas aprobadas aún sin autorizaciones, porque ver que una salida próxima sigue sin disparar es justamente lo que hay que notar a tiempo. Rango: desde `CURRENT_DATE - 30`.

### 2.3 Páginas nuevas

- **`modules/services/authorizations.html`** — índice. Va en el menú lateral. Interruptor "Solo las que requieren atención", que reúne cuatro situaciones bajo un criterio único: hay vencidas, hay expiradas, hay negativas, o la salida no tiene autorizaciones generadas. Todas comparten que alguien debe actuar antes de que salga el bus.
- **`modules/services/trip-authorizations.html`** — panel por salida. Página satélite: requiere `?type=` y `?trip=` en la URL, sin permiso propio, valida contra el mismo permiso del índice.

### 2.4 Control de acceso

**Se revirtió una propuesta inicial.** Se había argumentado que restringir por creador daba poco, porque las páginas de salidas ya muestran todos los rosters. El argumento era malo: las autorizaciones contienen `denial_reason`, texto libre escrito por la familia, que puede decir "está en tratamiento médico" o "no tenemos cómo pagarlo". Eso es más sensible que una lista de estudiantes y no debe ser navegable por cualquiera con acceso al módulo.

Modelo final, dos permisos:

| Permiso | Alcance | `url_path` |
|---|---|---|
| `Seguimiento de autorizaciones` | Solo las salidas que el usuario creó | `/modules/services/authorizations.html` |
| `Administrador de autorizaciones de salidas` | Todas las salidas | `NULL` |

**El segundo es un modificador, no una llave.** Ambas páginas validan contra el primero, así que quien solo tenga el de administrador recibe "acceso denegado". Se detectó al intentar probar con `Secretaria Académica`. Las secretarías llevan los dos.

`created_by` está siempre lleno: verificado en DEV (0 salidas de representación) y PROD (1, con creador). Se descartó el respaldo por `svc_service_requests.requested_by`, que además apunta a `workers` y exigiría cruzar por correo.

**Asignación derivada de los datos, no escogida a mano:** el permiso base se dio a todos los roles que ya tienen alguno de los tres permisos de salidas. Es autolimitante — si un rol nunca programa una salida, el permiso no le muestra nada.

### 2.5 Deuda conocida del panel

El panel individual valida el acceso **en la página, después** de que la función devolvió los datos. Para un usuario normal basta; con la consola abierta, la respuesta está ahí. Cerrarlo implica que `get_trip_authorization_panel` reciba el `user_id` y resuelva el permiso adentro, como ya hace `list_trip_authorizations`. Media hora, y deja el criterio en un solo lugar en vez de dos. **Recomendado, precisamente por el `denial_reason`.**

---

## 3. Reestructuración del portal (paso 4)

`families.html` pasó de tres pantallas planas a siete vistas con un router mínimo (`mostrarVista`). Estructura: acceso → **inicio** → módulo → detalle.

- **Inicio**: tarjetas de módulo con contador de pendientes. Autorizaciones primero cuando las hay, porque tienen fecha límite.
- **Tarjetas, no pestañas**: las pestañas se rompen en móvil con etiquetas largas en español y no aguantan cinco módulos. Además el portal ya usa pestañas para los hijos dentro de extracurriculares; habría dos niveles.
- **Una sola petición**: `get_portal_data` se extendió para devolver también `authorizations`.
- `cargarDatos(destino)` permite recargar sin sacar a la familia de donde está.
- `sesionVencida()` centraliza la respuesta al token vencido.

**Decisiones de contenido:**
- El aviso a familias y la declaración se insertan **sin escapar**: son HTML redactado por el colegio (Quill y plantilla), no texto de la familia. Todo lo que viene de la base sí va escapado. Comentado en el código para que no se "corrija" por error.
- En una autorización respondida se muestra `declaracion_aceptada`, la declaración exacta firmada, no la plantilla actual.
- Una `pending` con plazo vencido —porque el cierre aún no ha corrido— muestra aviso rojo. Sin eso la familia creería que puede responder.

**Correcciones aplicadas:** doble punto en la fecha; huecos del editor Quill (`<p><br></p>` no es `:empty`, se resuelve con `p:has(> br:only-child)`); `day: 'numeric'` en vez de `'2-digit'`, porque en español no se escribe "01 de septiembre"; subtítulos de tarjeta acortados; fechas crudas movidas de GAS al portal.

---

## 4. El punto de no retorno

**Hoy, nada envía correos a familias por concepto de autorizaciones en PROD.** Cuatro razones independientes:

1. El proyecto GAS de producción conserva la versión `26.8.3.1`, anterior a todo lo construido.
2. No hay activador por tiempo instalado.
3. Ninguna página de SchoolNet invoca `dispatch_trip_authorizations`.
4. Las funciones de Postgres no se autoejecutan.

**El punto de no retorno es uno: copiar el código GAS a `Portal de Familias — PRODUCCIÓN`.** A partir de ahí el envío queda a un clic, y **en PROD `enviarCorreo` manda sin filtro, por diseño**. Si alguien ejecuta la corrida "para ver qué hace", salen los correos.

### 4.1 La salida viva en PROD

`Invitación Alcaldía La Calera`, representación, **28 de agosto**, `imminent`, aprobada, 19 estudiantes.

Si el GAS se actualiza el 28 y alguien ejecuta la corrida ese día, se crean 19 autorizaciones con el plazo ya vencido y salen ~38 correos reales pidiendo autorizar una salida que ocurre ese mismo día.

**Decisión: el GAS de PROD se actualiza el 29 o después.** Ese día la salida queda fuera por `trip_date >= CURRENT_DATE` y no hay forma de que dispare. Va en papel, como estaba previsto.

### 4.2 Red de seguridad pendiente: `trip_auth_start_date`

Parámetro en `svc_module_config` más una condición en `dispatch_trip_authorizations`: solo se generan autorizaciones para salidas con `trip_date >=` esa fecha. Si el parámetro está vacío, no dispara nada — el estado seguro por omisión, igual que la lista blanca de correo.

Deja de depender de que nadie se equivoque y pasa a depender de un dato. Vuelve innecesaria la decisión de "modo informativo" de la §13 de v1.2: en vez de enviar sin exigir, sencillamente no se envía hasta la fecha acordada.

**No es urgente hoy** porque `min_days_advance = 8` en PROD da margen, pero protege si alguien baja ese parámetro sin saber qué depende de él.

---

## 5. Los parámetros difieren entre ambientes

| Parámetro | DEV | PROD |
|---|---|---|
| `min_days_advance` | 1 | **8** |
| `days_before_imminent` | 8 | **2** |
| `trip_auth_days_before_request` | 6 | 6 |

La v1.2 registraba `min_days_advance = 1` y `days_before_imminent = 8` como idénticos en ambos. **Ya no es cierto.** Probar en DEV dice poco sobre PROD mientras esto siga así.

**Alinear los valores es decisión del colegio**, no técnica: son reglas de operación.

### 5.1 Consecuencia: el desfase del roster

En pedagógicas, el roster se materializa al pasar a `imminent`. En PROD eso ocurre **2 días** antes, pero el disparo ocurre **6 días** antes. Cuatro días de desfase.

`dispatch_trip_authorizations` llama a `materialize_pedagogical_roster` antes de crear autorizaciones, y esa función tiene `NOT EXISTS` por estudiante, así que **no duplica**. Verificado leyendo la definición en PROD.

**Pero materializar congela la lista.** La función toma los estudiantes activos de esos grados en ese momento. Un estudiante matriculado en los días siguientes entra al roster en la segunda llamada, pero **sin autorización**, porque el disparo ya pasó. Llegaría al día de la salida sin autorización.

Lo hace visible el contador `sin_solicitud` del panel. Cerrarlo del todo requiere, o bien revisar la condición de ventana del disparo para que vuelva a correr sobre salidas ya disparadas (la exclusión por estudiante ya está), o bien acercar los parámetros.

Caso poco frecuente —matrícula en la ventana de 6 días previos— pero real a comienzo de año. **No bloquea el despliegue.**

---

## 6. Correcciones a versiones anteriores

| Origen | Afirmación | Estado real |
|---|---|---|
| v1.2 §12.3 | `supabaseFetch` devuelve `[]` al fallar | Ya estaba resuelto en `26.8.3.1` |
| v1.2 §14.2 | El trigger sería el primer envío real a familias | Falso: OTP e inscripciones ya enviaban sin filtro |
| v1.2 §14.4 | El GAS tiene solo OTP y `get_children` | Incompleto: tiene el flujo entero de extracurriculares |
| v1.2 §12.4 | "El módulo de salidas nunca ha operado. Cero salidas en PROD" | **Falso.** La bitácora se escribió antes del año escolar. Hay una salida y vienen más |
| v1.2 §12.4 | Falta despliegue GAS separado para PROD | Ya existe |
| v1.2 §12.4 | Faltan `portal_access_codes` y `portal_sessions` en PROD | **Ya existen.** El portal opera en PROD |
| v1.2 §3 | `min_days_advance = 1`, `days_before_imminent = 8` en ambos | Ver §5 |

---

## 7. Hallazgos sobre datos

### 7.1 Correos de relleno y contactos únicos

`sin_correo` atrapa el caso de cero contactos, pero **no** estos dos, que sí aparecen en la salida de prueba de DEV:

- Un estudiante con `noaplica@noaplica.com` como uno de sus dos contactos. En PROD ese correo se enviaría, rebotaría, y para el sistema el envío fue exitoso.
- Un estudiante con **un solo** familiar registrado, donde el resto tiene dos.

Ninguno es detectable por contador. Por eso la bitácora de destinatarios por estudiante está a la vista en el panel: es lo único que permite verlos.

**Acción sugerida:** revisar `family_members` en busca de direcciones de relleno antes de operar.

### 7.2 El aviso a familias repite datos que el sistema ya tiene

El `family_notice` de la salida de prueba repite fecha, hora, destino y lugar de salida como texto libre, además con una errata. Son los mismos datos estructurados que el sistema conoce, escritos a mano, y van a divergir. Ya divergen: la descripción decía "10 de agosto / Colegio Frailejonal" mientras la tabla decía otra fecha y "Hato - La Calera".

El aviso debería limitarse a lo que la base no sabe: qué llevar, vestuario, seguros, gratuidad.

### 7.3 Destino genérico en la declaración firmada

`Hato - La Calera` en `svc_transport_destinations` no coincide con el destino real, `Colegio El Frailejonal La Calera`. Ese valor entra en `declaration_snapshot`, que es la evidencia. Revisar con quien administra destinos.

---

## 8. Pruebas realizadas

### 8.1 Corrida diaria (DEV)

| Prueba | Resultado |
|---|---|
| Sin salidas en ventana | Todo en ceros, 2.5 s |
| Con salida en ventana | 19 autorizaciones, 37 destinatarios, 37 suprimidos, 0 enviados, 0 fallidos, 19 s |
| Bitácora | 37 filas `initial` / `sent` / `SIMULADO (DEV)` |
| Segunda corrida (idempotencia) | 0 creadas, ambos lotes vacíos |

**Desempeño:** ~1 s por autorización, dominado por la escritura individual de bitácora. 300 autorizaciones ≈ 5 minutos, cerca del límite de ejecución de Apps Script. La corrida siguiente retoma lo que quede.

### 8.2 Portal, por interfaz vía `/exec` (DEV)

Los cuatro caminos: pendiente, autorizada, no autorizada con motivo, y ya respondida. Evidencia verificada en base: `declaration_snapshot` de 462 caracteres, `trip_data_snapshot` con `aviso_familias`, `denial_reason` correctamente limpiado al autorizar.

### 8.3 Control de acceso (DEV)

| Escenario | Resultado |
|---|---|
| Super admin | Ve todas |
| Secretaria Académica (con permiso admin) | Ve todas, incluida una salida ajena |
| Usuaria sin permiso admin ni salidas propias — índice | "Las salidas que tú programaste", vacío |
| La misma, **panel por URL directa** | Rechazado |

El último es el que importa: un enlace compartido por chat no es puerta trasera.

### 8.4 Sin probar todavía

- Recordatorios (exige que hoy coincida con `deadline_at` menos 3 o 1)
- Cierre por vencimiento
- Salida cancelada o suspendida
- Todo el flujo en PROD

---

## 9. Corrección a `submit_trip_authorization`

**Defecto:** guardaba `responded_by_name` con `familiar_registrado` ("Apellido, Nombre") pero devolvía `familiar` ("Nombre Apellido"). La declaración firmada y la columna mostraban formatos distintos, y todo lo que leyera de esa columna —panel, portal, aviso de "ya respondió"— quedaba inconsistente con la evidencia.

**Corrección:** `responded_by_name = v_member ->> 'familiar'`. Aplicada y verificada en DEV y **replicada a PROD**.

Se corrigió de inmediato y no se dejó para después porque cada respuesta registrada mientras tanto habría quedado con el formato incorrecto.

---

## 10. Defectos encontrados en `sidebar.js`

**El comparador de orden estaba mal:**

```javascript
if (ia === -1) return 1;
if (ib === -1) return 1;   // debía ser -1
```

Decía "si b no está en la lista, pon a después de b", cuando a sí está y debe ir antes. Como `Solicitud de reparación` y `Mis solicitudes de mantenimiento` no están en la lista de servicios, empujaban al final a todo lo que sí estaba. Un comparador inconsistente hace que `Array.sort` dé resultados impredecibles, no incorrectos de forma uniforme.

**Corregido.** Afecta a todos los módulos: cualquier permiso fuera de su lista de orden ahora se va al final, que es el comportamiento correcto pero puede reordenar visiblemente otros menús. **Pendiente revisar dos o tres módulos más.**

**Aclaración:** `MODULE_ITEM_ORDER` **no es lista blanca**, solo orden. Los ítems que no están se muestran igual, al final.

---

## 11. Aprendizajes de plataforma

### 11.1 `permission_module` debe coincidir con el id del módulo

El sidebar agrupa por `permission_module` y lo compara contra el id de `SIDEBAR_MODULE_ORDER`, que para servicios es **`services`** en minúscula. Se creó el permiso con `'Servicios'` y **desapareció del menú sin ningún error**: existía, tenía `url_path`, el usuario lo tenía, pero quedaba en un grupo que ningún módulo reclamaba.

La guía de creación de módulos dice usar CamelCase en español y trata el inglés minúscula como excepción legacy. **Servicios usa `services`.** Verificar siempre contra un permiso existente del mismo módulo antes de crear uno nuevo.

Es la misma clase de falla silenciosa que `url_path` en NULL.

### 11.2 Un permiso de alcance no reemplaza al de acceso

Ver §2.4. Un permiso que solo modifica el alcance debe ir siempre acompañado del permiso base contra el que validan las páginas.

### 11.3 `NULL` sin tipo en un `SELECT`

`INSERT ... SELECT ..., NULL` falla con `column is of type uuid but expression is of type text`. Hay que escribir `NULL::uuid`.

### 11.4 Sobre la tabla de permisos

Nunca `ON CONFLICT`. Los `INSERT` van con guarda `NOT EXISTS`. Y después de cualquier cambio, limpiar `sessionStorage.removeItem('schoolnet_sidebar_permissions')`.

---

## 12. Estado por ambiente

| Elemento | DEV | PROD |
|---|---|---|
| Tablas de autorizaciones | Sí | Sí |
| `portal_access_codes` / `portal_sessions` | Sí | Sí |
| Diez funciones originales | Sí | Sí |
| `submit_trip_authorization` corregida | Sí | **Sí** |
| `get_trip_authorization_panel` | Sí | **Sí** |
| `list_trip_authorizations` | Sí | **Sí** |
| Permisos + asignaciones | Sí | **Sí** (9 roles base, 2 secretarías con admin) |
| `authorizations.html` / `trip-authorizations.html` | Sí | Vía PR |
| `families.html` reestructurado | Sí | Vía PR |
| `sidebar.js` corregido | Sí | Vía PR |
| **Código GAS** | Sí | **NO — el 29 o después** |
| Activador diario | No | No |

### 12.1 Estado intermedio esperado tras el PR

`families.html` decide su GAS por el nombre del host. El de PROD aún no tiene los tres endpoints, así que `get_portal_data` no devolverá `authorizations`. El portal no falla: el campo llega vacío y la tarjeta sale deshabilitada con "No hay salidas por autorizar". Aceptable, pero conviene saberlo.

### 12.2 Datos de prueba en DEV

| Elemento | Reversión |
|---|---|
| Solicitud `7bce6fe2-...` aprobada a mano | `request_status = 'pending'` |
| Salida `9b5ce7e3-...` con fecha movida | `trip_date = '2026-08-10'` |
| Familiar `dafi@colegiotilata.edu.co` en la familia del estudiante 425 | `DELETE FROM family_members WHERE email = 'dafi@colegiotilata.edu.co'` |
| 19 autorizaciones + 37 correos `SIMULADO (DEV)` | `DELETE FROM svc_trip_authorizations WHERE trip_id = '9b5ce7e3-...'` |
| `probarPoliticaCorreo`, `probarEndpointsAutorizaciones`, `probarRespuestaAutorizacion` en GAS | Borrar antes de replicar |

---

## 13. Pendientes

### 13.1 Antes de habilitar el envío

1. **Actualizar el GAS de PROD** — el 29 de agosto o después (§4.1)
2. Prueba de punta a punta en PROD sin activador, con familia controlada
3. Instalar el activador diario, solo en PROD

### 13.2 Deuda técnica

| # | Pendiente | Prioridad |
|---|---|---|
| 1 | `trip_auth_start_date` como red de seguridad (§4.2) | Alta |
| 2 | Endurecer el acceso del panel dentro de la función (§2.5) | Alta |
| 3 | Botón de acceso al panel desde las tres páginas de salidas | Media |
| 4 | Acciones del panel: reenviar, reabrir, desvincular (§2.1) | Media |
| 5 | Alinear parámetros entre ambientes (§5) | Media — decisión institucional |
| 6 | Desfase del roster en pedagógicas (§5.1) | Media |
| 7 | Probar recordatorios y cierre por vencimiento | Media |
| 8 | Revisar el orden del sidebar en otros módulos (§10) | Baja |
| 9 | Versión de `rep-trips.html` sin actualizar (`26.03.17.03.25`) | Baja |
| 10 | `linear-gradient` en `pedagogical-trips.html` línea 45 | Baja |
| 11 | Correo real embebido en `medirTiempos()` y `verOpciones()` | Baja |
| 12 | `created_by` a NOT NULL en `svc_rep_trips` | Baja |
| 13 | Interacción entre `family_notice` y el futuro trigger de reinicio | A tener en cuenta |

### 13.3 Decisiones institucionales

1. Valores definitivos de los parámetros de tiempo, y si se alinean entre ambientes
2. Qué se hace hoy cuando hay que mover la fecha de una salida aprobada
3. Fecha de arranque del sistema (`trip_auth_start_date`)
4. Depuración de correos de relleno en `family_members` (§7.1)
5. Criterio de contenido del `family_notice` (§7.2)
6. Revisión del catálogo de destinos (§7.3)

---

## 14. Punto de retoma

El siguiente paso es **el código GAS a PROD, el 29 de agosto o después**. Antes conviene resolver el pendiente 1 de la §13.2, que es media hora y quita la dependencia de que nadie ejecute la corrida por curiosidad.

Después: prueba de punta a punta en PROD con una familia controlada, invocando la corrida a mano, y solo entonces el activador.
