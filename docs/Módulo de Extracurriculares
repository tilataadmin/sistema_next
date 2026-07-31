# Módulo de Extracurriculares — Especificación de diseño

**Sistema:** SchoolNet — Colegio Tilatá
**Repo:** `tilataadmin/sistema_next`
**Versión:** 1.9
**Fecha:** 31 de julio de 2026
**Estado:** Fases 0 a 5 completas y probadas en DEV. **La base de PROD está replicada completa.** El flujo operativo ya es recorrible de punta a punta: las cinco transiciones de estado están construidas y `delivered_at` deja constancia permanente de la entrega a Tesorería.
**Reemplaza a:** v1.8 del 31 de julio de 2026

---

# PARTE I — DÓNDE RETOMAR

Esta parte existe para que quien retome el trabajo —incluido quien lo escribió— sepa en un minuto qué falta. El detalle de diseño está en la Parte II.

## 1. Estado por fase

| Fase | Contenido | DEV | PROD |
|---|---|---|---|
| 0 | Retiro de la página de Servicios y limpieza de datos | ✅ | ✅ |
| 1 | DDL sobre tablas existentes | ✅ | ✅ |
| 2 | Ocho tablas nuevas | ✅ | ✅ |
| 3 | Disparador de liberación de días | ✅ | ✅ verificado |
| 4 | Nueve permisos | ✅ | ✅ |
| 4 | Registro en `sidebar.js` | ✅ | ✅ mezclado a `main` |
| 5 | `extracurricular-engine.js` — sesiones y precios | ✅ | ✅ mismo archivo |
| 5 | `calendario-escolar.js` — festivos y semanas de receso | ✅ | ✅ mismo archivo |
| 5 | `seasons.html` etapas 1-3 — listado, días/sesiones, tarifas | ✅ | — |
| 5 | `seasons.html` etapa 4 — publicación y transiciones | ✅ | — |
| 5 | `cost-concepts.html` | ✅ | — |
| 5 | `activities.html` etapas 1-3 — CRUD, costos propios, precios | ✅ | — |
| 5 | `fn_extracurricular_enroll` — inscripción transaccional | ✅ **probada** | ✅ |
| 5 | Columna `enrolled_by` en `svc_extracurricular_enrollments` | ✅ | ✅ |
| 5 | `enrollments.html` etapa 1 — inscribir y retirar | ✅ **probada** | ✅ |
| 5 | Columna `delivered_at` en `svc_extracurricular_cycles` | ✅ | ✅ |
| 5 | `seasons.html` etapa 5 — transiciones de estado y candado de reversa | ✅ **probada** | ⚠️ **falta PR** |
| 5 | `enrollments.html` etapa 2 — validación de transporte y reubicación | ❌ | — |
| 6 | `attendance.html`, `routes.html`, `daily-routes.html` | ❌ | — |
| 7 | `treasury.html`, `reports.html` | ❌ | — |

## 2. Lo primero al retomar

### 2.1 Lo primero: parametrizar en producción

**La etapa 1 de `enrollments.html` quedó probada de punta a punta el 31 de julio de 2026, y la inscripción se movió a una función de base de datos.** No queda nada sin verificar en la fase 5.

**Actualización de la v1.9:** la replicación a PROD está hecha —base completa y verificada, código mezclado a `main`— y las transiciones de estado están construidas y probadas. El módulo es utilizable en producción.

**Lo primero, y no es nuestro:** que coordinación parametrice la temporada real en PROD. Días, cálculo de sesiones, conceptos de costo con sus valores, tarifas de transporte, y las actividades reales con grados y cupos. La ventana de inscripción abre el **10 de agosto de 2026**. Si eso no arranca esta semana, el módulo llega listo a una temporada sin oferta publicada.

Lo que sigue de nuestro lado, en orden que manda el calendario:

1. **PR de `seasons.html`** con las transiciones de estado (sección 2.4). Sin él, una temporada publicada en PROD no puede avanzar nunca.
2. **`attendance.html`** — se necesita el **1 de septiembre**, cuando arranca la temporada.
3. **Etapa 2 de `enrollments.html`** y el reporte de pasajeros por día — para el cierre de inscripciones del **10 de septiembre**.
4. **`treasury.html`** — para la entrega, hacia mediados de septiembre.
5. **Portal de familias** — temporada II. Dejó de ser el trabajo grande que era: la escritura ya está resuelta en la base.

### 2.1.1 Implementado: inscripción por función de base de datos

**Construida y probada el 31 de julio de 2026.** Ver la especificación completa en la sección 7.6 de la Parte II.

El razonamiento que la motivó sigue vigente y conviene conservarlo: inscribir son dos escrituras que deben ocurrir juntas —la inscripción y sus días— y PostgREST no da transacciones entre peticiones HTTP. `enrollments.html` imitaba la atomicidad borrando la inscripción recién creada si el segundo `INSERT` fallaba. Funcionaba, pero cuando existiera el portal esa misma lógica habría quedado escrita dos veces, en dos lenguajes distintos.

**Resultado:** `enrollments.html` ya no envía ningún valor de dinero. Envía estudiante, actividad, opción de transporte, canal y correo declarante; el servidor deriva precio, tarifas y sesiones. La pantalla quedó reducida a pedir, mostrar y traducir errores.

Se aparta de la decisión 21, que optó por JavaScript. No la contradice: aquella era sobre un cálculo puro, esta es sobre una transacción.

### 2.1.2 Guion de prueba ejecutado

Nueve caminos, todos contra DEV el 31 de julio de 2026. Se conserva porque es el guion de regresión cuando la función cambie.

| # | Caso | Resultado esperado | Verificado |
|---|---|---|---|
| 1 | Alta normal con transporte vinculado | Valores congelados, días insertados, sin advertencias | ✅ |
| 2 | Cruce de días | `El estudiante ya tiene una actividad ese día` | ✅ |
| 3 | **Atomicidad tras el cruce** | Cero filas huérfanas: la inscripción alcanzó a insertarse y se deshizo sola | ✅ |
| 4 | Misma actividad dos veces | `El estudiante ya está inscrito en esta actividad` | ✅ |
| 5 | Fuera de ventana, canal distinto de `admin` | Rechazo | ✅ |
| 6 | Fuera de ventana, canal `admin` | Alta creada + una advertencia | ✅ |
| 7 | Fuera de ventana **y** temporada iniciada, canal `admin` | Alta creada + **dos** advertencias independientes | ✅ |
| 8 | Grado no admitido por la actividad | Rechazo | ✅ |
| 9 | Llamada desde `enrollments.html` por RPC | Alta creada, advertencia visible en pantalla, `enrolled_by` poblado | ✅ |

Los casos 3, 5 y 8 son los que no existían en el guion de la v1.7 y son los que justifican la función: ninguno de los tres lo garantizaba la pantalla.

> **Sobre el caso 3.** Es el punto entero del ejercicio. El bloque `BEGIN ... EXCEPTION` de PL/pgSQL crea una subtransacción: cuando falla el `INSERT` de los días, el de la inscripción se deshace solo. Verificado contando las inscripciones del estudiante después del error: una, no dos.

### 2.2 Prueba ejecutada: el descuento de fechas no lectivas

**Ejecutada el 30 de julio de 2026 y aprobada, tras corregir dos defectos.** Se corrió sobre 2026-2027 —no sobre 2025-2026 como preveía la v1.3— porque en el camino se cargó el calendario de ese año en DEV.

| Campo | Valor |
|---|---|
| Temporada | `2026-2027 I` |
| Rango | `2026-09-01` a `2026-12-10` |
| Días | lunes, miércoles, jueves |

**Resultado final:** lunes 10, miércoles 14, jueves 14. Fechas descontadas nombradas una por una: 5, 7 y 8 de octubre por semana de receso; 12 de octubre, 2 y 16 de noviembre por festivo.

El conteo crudo era 14/15/15. La expansión de rangos de `hr_non_work_days` funciona.

**Defecto encontrado y corregido: las semanas de receso no existían para el motor.** Ver sección 5.4. Antes de la corrección el lunes daba 11 y miércoles y jueves 15, contando como lectiva una semana completa sin colegio.

**Lección de método, cara.** El diagnóstico tomó una sesión entera y produjo tres hipótesis erradas seguidas —RLS, unión por cadena, tipo de columna— porque las consultas de verificación se corrieron contra PROD creyendo que eran DEV. La regla de la sección 0 sobre indicar el proyecto en cada verificación existía y no bastó. **Lo que sí resuelve la ambigüedad es leer el host de la petición en la consola del navegador:** `mrtuerkncqodhakuwjob` es producción, `spjzvpcsgbewxupjvmfm` es desarrollo.

### 2.3 Prerrequisito institucional: calendario laboral

**No se puede publicar una temporada de un año académico cuyo calendario laboral no esté cargado en `hr_non_work_days`.**

**Estado al 30 de julio de 2026:** ambos ambientes tienen 2026-2027 cargado — 18 festivos nacionales y 10 jornadas pedagógicas. En DEV se cargó ese día: el clon PROD→DEV se había hecho antes de que existieran esas filas.

Si se publica sin calendario, el conteo de sesiones da el máximo teórico y **los precios salen inflados**: los honorarios del instructor son `valor × sesiones ÷ mínimo`, así que más sesiones significa precio más alto. El colegio recaudaría por jornadas que no se dictan y la familia pagaría de más, sin que nada lo delate — el número viene de un cálculo automático que se ve confiable. Y como el precio se congela al publicar, el error queda en cada fila de inscripción sin corrección posible salvo revertir toda la temporada.

Es la sexta validación de publicación (sección 9 de la Parte II).

> **No volver a clonar PROD→DEV para resolver huecos de calendario.** El script `clonar_prod_a_dev.sh` hace un `drop` por tabla, y las nueve tablas del módulo con sus datos de prueba viven solo en DEV. Un clon se lleva todo el trabajo. Los festivos se recargan con el botón de `generar-dias-tilata.html`, que los calcula por algoritmo; las jornadas pedagógicas se copian con `INSERT` generados desde PROD.

> **`generar-dias-tilata.html` opera sobre el año vigente de `system_config`, no sobre el año que uno esté mirando.** En DEV ese año seguía siendo 2025-2026 mientras PROD ya estaba en 2026-2027, y la página reportaba "0 nuevos por insertar" sobre el año equivocado. Después de cada clon o cierre anual conviene verificar que `system_config.current_academic_year_id` esté alineado.

### 2.4 Replicación a PROD — ejecutada

**Verificada el 31 de julio de 2026** con una consulta de inventario contra PROD: doce tablas del módulo, `season_status`, `enrolled_by`, `delivered_at`, la función `fn_extracurricular_enroll`, el disparador de liberación y los nueve permisos. El código se mezcló a `main` y se comprobó en producción que el módulo aparece en el sidebar y que `seasons.html` abre sin errores.

**Queda un pendiente:** el PR de `seasons.html` con las transiciones de estado y el candado de reversa (sección 6.4), construidos *después* de la mezcla anterior. Sin él, una temporada publicada en PROD no puede avanzar a `enrollment_closed` ni más allá.

> **Cómo distinguir los ambientes sin ambigüedad.** La consulta de inventario es idéntica en los dos y nada en su resultado dice cuál es. Lo que sí los distingue: `SELECT count(*) FROM svc_extracurricular_activities` da **0** en PROD y **3** en DEV. Es la aplicación concreta de la lección de la sección 2.2, que costó cinco diagnósticos errados.

> **Orden obligatorio al replicar:** primero las columnas, después la función, después las pantallas. La función escribe en `enrolled_by`; si la columna no existe, falla al primer uso y el mensaje no señala la causa.

> **Cuando una escritura falle con error de transporte** —`Failed to fetch` contra `api.supabase.com`— la pregunta no es *"¿reintento?"* sino *"¿qué quedó?"*. Ocurrió el 31 de julio con el `ALTER TABLE` de `delivered_at`: el error era del panel de administración, no del proyecto, y la sentencia no había llegado a ejecutarse. Verificar antes de reintentar, y preferir la forma idempotente (`ADD COLUMN IF NOT EXISTS`) en los scripts de replicación.

### 2.5 Datos de prueba que quedaron en DEV

**Estado al cierre del 31 de julio de 2026.** Conviene limpiarlos antes de dar el módulo por productivo, o al menos saber que están ahí.

| Qué | Detalle |
|---|---|
| Temporada `2026-2027 I` | `published`, `delivered_at` en nulo. Ventana **10 de agosto – 10 de septiembre**, inicio **1 de septiembre**. Todas las fechas restauradas tras las pruebas |
| Actividad `Futbol` | Creada el 31 de julio para probar el cruce. Lunes y miércoles, mínimo 10, 24 sesiones, $393.000 |
| Inscripciones | **Ninguna.** Las siete de prueba se retiraron y se borraron |

> **Comprobación de determinismo, hecha de paso.** La temporada se revirtió a borrador y se republicó sin cambiar nada de la parametrización. Los tres precios volvieron **exactamente** a $243.000, $453.000 y $393.000. El motor produce el mismo número sobre la misma entrada; conviene tenerlo comprobado antes de que esto opere con dinero real.

> **Durante las pruebas se movieron fechas de la temporada.** Mover `start_date` o la ventana de inscripción **no recalcula nada**: las sesiones ya están congeladas en `cycle_days` y los precios en las actividades. Es seguro mientras no se republique. Ojo con `..._enrollment_dates_check`: exige que el fin sea posterior al inicio, así que para simular una ventana vencida hay que mover **las dos** fechas.

> **La creación de `Futbol` movió los precios de toda la oferta**, porque el divisor de los conceptos de temporada pasó de 18 a 28. Minichef bajó de $247.000 a $243.000 y Externa 1 de $457.000 a $453.000, **exactamente $4.000 cada una**. Esa caída idéntica es la firma correcta del prorrateo por suma de mínimos: si hubiera sido distinta entre las dos, el reparto se estaría dividiendo entre el mínimo propio de cada actividad, que es un error difícil de ver a simple vista. Vale la pena conservar la observación como prueba de regresión del acoplamiento de 5.5.

## 3. Decisiones abiertas

### 3.1 Inscripción posterior al inicio — replanteada en la v1.6

**Las versiones anteriores planteaban esta sección mal.** Presentaban tres opciones de cobro —completo, prorrateo total, prorrateo parcial— como una decisión pendiente del módulo, y de ahí concluían que `enrollments.html` estaba bloqueada.

**No lo está. La facturación no es de este módulo.** SchoolNet registra la inscripción y entrega a Tesorería; la política de cobro la aplica la tesorera al facturar en Phidias. El módulo no debe decidir cuánto paga quien entra tarde, ni ofrecer una configuración para ello.

**Lo que sí es del módulo** es qué dato entrega, y ahí sí hay algo que definir: el significado de `frozen_sessions` cuando alguien se inscribe con la temporada empezada.

| Lectura | Sirve para |
|---|---|
| Sesiones **de la temporada** | Es el número con el que se calculó el precio congelado |
| Sesiones **restantes** desde la inscripción | Es el número para prorratear, si Tesorería decide hacerlo |

**Resolución:** `frozen_sessions` guarda **las sesiones de la temporada**, el sentido que corresponde al precio congelado. La entrega a Tesorería incluye además la **fecha de inscripción**, con la que las restantes se calculan sin ambigüedad.

Así el módulo no toma ninguna decisión de cobro y Tesorería tiene los dos datos que necesita, sin que ninguno tenga que reconstruirse a mano.

> **Consecuencia para `enrollments.html`:** debe advertir en pantalla cuando la fecha de inscripción es posterior al inicio de la temporada —para que quien registra sepa que ese caso llegará a facturación con particularidades— pero **no debe calcular ni proponer ningún ajuste de precio**.

### 3.2 Tarifario de transporte — cerrada en la v1.5

Las dos filas duplicadas de capacidad 24 que documentaba la v1.3 ya están corregidas: hoy son **18 pasajeros a $260.000 y 24 a $310.000, ambas activas**. Era una digitación errada de la capacidad, como se sospechaba.

**Corrección a la v1.4:** afirmaba que no existe pantalla para administrar el tarifario y que se edita por SQL. **Es falso.** Está en `config.html`, sección "Tarifario — Extracurriculares", con altas, ediciones y activación.

**El tarifario no se vincula al año académico**, y no necesita hacerlo: es un catálogo de referencia por capacidad de vehículo, no una fuente de precios. Lo que se cobra se congela dos veces, en la temporada y en cada fila de inscripción.

> **Convención recomendada, no impuesta por el esquema.** Cuando el operador suba tarifas, **desactivar la fila vieja y crear una nueva** en vez de editarla. Editando se pierde la referencia con la que se fijó la tarifa de una temporada ya publicada, y con ella la posibilidad de explicar de dónde salió ese número. El campo `is_active` ya existe para eso.

**Distinción que confunde y conviene tener escrita:**

| Dónde | Qué es | Unidad |
|---|---|---|
| `config.html` → tarifario | Lo que el **operador le cobra al colegio** | Por recorrido completo, según capacidad |
| `seasons.html` → tarifas de transporte | Lo que el **colegio le cobra al estudiante** | Por estudiante y por sesión |

La tabla de referencia hace el puente dividiendo entre la capacidad y mostrando el costo por asiento al 85% de ocupación, que es la franja realista para fijar la tarifa.

### 3.3 Menores

- **Breadcrumb de `seasons.html`** muestra "Dashboard / Temporadas", sin el nivel del módulo. `sidebar.js` debería reescribir el segundo elemento. Sin impacto funcional.
- **Comentario obsoleto en `sidebar.js`**: afirma que `SIDEBAR_LAYOUT` no se usa en el render. Sí se usa.
- **`generar-dias-tilata.html` conserva su propia copia de las reglas de festivos y recesos.** Debe migrarse a `calendario-escolar.js`. Mientras no lo haga, hay dos implementaciones de la misma regla que pueden divergir. La migración es mecánica: borrar las copias locales y llamar a las funciones con prefijo `cal`.
- **Defecto de despliegue, no de código.** El arreglo de `requiereTemporada()` en `seasons.html` se dio por aplicado el 30 de julio y **nunca llegó al archivo**. Durante horas el botón "Guardar tarifas" no hizo nada —`ReferenceError` antes del `try`, sin `catch`, sin mensaje— y solo se detectó cuando la validación 3 de publicación lo delató. **Lección: una edición no está aplicada hasta que se verifica en el archivo.** El `updated_at` de la fila es la prueba objetiva: si no cambió, el `PATCH` no salió.
- **`step` en los campos numéricos.** `step="50"` en las tarifas de transporte de `seasons.html` no significa "las flechas suben de a 50": el navegador rechaza cualquier valor que no sea múltiplo. Una tarifa de $15.675 no se podría digitar. Mismo defecto corregido en `cost-concepts.html`.
- **Los mensajes de la interfaz se autodescartan.** Para una confirmación está bien; para la advertencia de inscripción fuera de plazo, no: es información que el coordinador puede necesitar diez segundos después. Durante la prueba del 31 de julio la advertencia se disparó correctamente y el operador no alcanzó a verla. Conviene que las advertencias de inscripción no se borren solas, o que el texto viaje dentro del mismo mensaje de éxito en vez de competir con él.
- **La línea secundaria de la tabla de inscritos.** Muestra `precio + transporte` incluso en las filas sin transporte, donde no hay nada que sumar, y en las que sí lo tienen no dice cuánto es —que es justo el número que una familia preguntaría—. Debería mostrar el desglose real o desaparecer en el caso sin transporte.
- **El mensaje de `_activity_student_unique` no es alcanzable desde la pantalla.** El filtro de candidatos impide seleccionar a alguien ya inscrito. Quedó probado por RPC directo; si algún día el filtro cambia, ese texto lleva tiempo sin ejercitarse.
- **Ajenos al módulo, detectados de paso en DEV:** `phidias_auto_sync_enabled` quedó en `true` después del clon, con la URL y el token de producción — el sincronizador de DEV consultaría el Phidias real del colegio. Y el token de Phidias en `system_config` conviene rotarlo.

### 3.4 El candado de reversa — resuelto en la v1.9

> **Implementado y probado el 31 de julio de 2026.** Se conserva el razonamiento porque explica por qué el candado tiene cuatro reglas y no una. La implementación está en la sección 6.4.

**Hallazgo del 31 de julio de 2026.** La sección 6.3 dice que `published → draft` está *"bloqueada si existe al menos una inscripción"*, sin distinguir estado, y `seasons.html` lo implementó literal. Retirar las tres inscripciones de prueba no destrabó la reversa; hubo que borrarlas físicamente.

**El criterio debería ser "cero inscripciones activas", pero no basta por sí solo.** La razón del candado es que publicar congela valores que se copian a la fila de inscripción, y republicar con precios distintos deja dos generaciones conviviendo sin manera de detectarlas al cierre. Una inscripción anulada no se factura, así que no genera esa convivencia.

**Lo que el criterio no cubre:** una inscripción anulada **que ya se entregó a Tesorería** sí es un hecho contable. Salió en el archivo de entrega, pudo facturarse y tener nota crédito. Si la temporada revierte y republica con otro divisor, el reporte de *proyectado contra ejecutado* mezcla generaciones y nadie puede explicar el número.

Y ese caso es alcanzable: `delivered → enrollment_closed` y `enrollment_closed → published` están ambas permitidas con confirmación, así que se puede llegar a `published` con historia de entrega y cero activas.

**Reglas implementadas:**

| Situación | Tratamiento |
|---|---|
| Cero inscripciones de cualquier tipo | Reversa libre |
| Solo inscripciones anuladas, temporada nunca entregada | Reversa **con advertencia explícita** que diga cuántas anuladas quedan y que sus valores congelados dejarán de corresponder a la parametrización |
| Al menos una inscripción activa | **Bloqueada** |
| La temporada estuvo en `delivered` alguna vez | **Bloqueada** |

**Prerrequisito de esquema, resuelto:** `delivered_at` se agregó en ambos ambientes el 31 de julio de 2026. La última fila era inevaluable sin ella, y una temporada ya entregada no se puede reconstruir hacia atrás: agregarla después de la primera entrega real habría dejado esa temporada sin poder responder nunca si estuvo entregada.

**Las cuatro reglas quedaron probadas**, incluida la de `delivered_at`, que se pudo ejercitar gracias a una entrega accidental durante las pruebas. Ver la tabla de la sección 6.4.

> La fila de inscripción sobrevive a la reversa porque es autosuficiente por diseño (7.4), no porque nadie se dé cuenta. Esa autosuficiencia es lo que hace posible la advertencia en vez del bloqueo.

### 3.5 El `DataBase.md` del proyecto estaba desactualizado

**Detectado el 31 de julio de 2026, antes de escribir `fn_extracurricular_enroll`.** El catálogo de esquema que vive en el proyecto tenía la versión de `svc_extracurricular_cycles` **anterior a la fase 1** —con `is_active`, sin `season_status` ni las seis columnas nuevas— y **no contenía ninguna de las ocho tablas de la fase 2**.

Escribir contra ese catálogo habría producido una función que congela dinero contra columnas que no existen. Se resolvió consultando `information_schema.columns` directamente en DEV.

**Regla que queda:** antes de escribir código que dependa del esquema de este módulo, verificar contra la base, no contra el archivo. Y regenerar el `DataBase.md` cuando se replique la fase 5 a PROD.

---

# PARTE II — ESPECIFICACIÓN

## 0. Cómo usar este documento

Fuente de verdad para la construcción. Reglas de trabajo:

- **DEV primero, verificar, luego PROD.**
- **SQL antes que frontend.** Una sentencia a la vez, con `SELECT` de verificación después de cada una.
- **Al correr una verificación de estado, indicar contra cuál proyecto se corrió.** DEV y PROD tienen contenido distinto aunque el esquema sea idéntico. Esta regla nació de dos confusiones reales durante la construcción: el conteo de la fase 0 y el calendario laboral.
- **Ediciones buscables** con Ctrl+F (edición por el editor web de GitHub, sin entorno local).
- **Toda tabla nueva** debe incluir `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` explícito.
- **Sin gradientes** en la interfaz. Solo colores sólidos.
- `supabaseRequest(endpoint, { method, body })` — nunca `headers` explícitos, nunca cache-busters. Los headers por defecto ya incluyen `Prefer: return=representation`, así que un `POST` devuelve la fila creada.
- Contradicciones entre este documento y la base de datos **se reportan, no se resuelven unilateralmente**.

## 1. Propósito y alcance

Gestionar la oferta, inscripción, costeo, transporte y asistencia de las actividades extracurriculares.

**Dentro del alcance:** parametrización de temporadas, días, actividades y conceptos de costo; cálculo de precios y cargo de transporte; inscripción, reubicación y retiro por parte del coordinador; consulta para Tesorería; configuración de rutas y registro diario; registro de asistencia.

**Fuera del alcance:**

- **Facturación y recaudo.** Se hacen en Phidias.
- **Portal para instructores.** No son usuarios de SchoolNet.
- **Registro de abordaje al bus.** Solo asistencia a la actividad.
- **Mantenimiento de la vinculación con el operador de transporte.**

**Diferido:** portal de familias (sección 12).

## 2. Ubicación en la plataforma

Módulo `id = extracurricular`, inmediatamente después de Servicios.

> Eventos → Servicios → **Extracurriculares** → Asistencia

**Convención de nombre:** minúscula, consistente con `services`, `budget`, `config`, aunque la guía de módulos sugiera CamelCase.

### 2.1 Identidad visual

| Atributo | Valor |
|---|---|
| Ícono | `bi-palette` |
| Color | `#993556` |

`#993556` también lo usa `teacher-eval` en otro grupo. La reutilización entre grupos es la norma en esta paleta. Lo que importaba era romper la secuencia de azules entre Servicios (`#378ADD`) y Asistencia (`#185FA5`).

### 2.2 Estructura real del sidebar

`sidebar.js` tiene **dos estructuras**, y registrar un módulo exige tocar ambas:

- **`SIDEBAR_MODULE_ORDER`** — catálogo de metadatos.
- **`SIDEBAR_LAYOUT`** — agrupación en categorías y orden vertical.

**`buildSidebarHTML()` itera sobre `SIDEBAR_LAYOUT`.** Un módulo registrado solo en el catálogo **no se renderiza nunca**. Extracurriculares va dentro de la categoría `operations`.

Se retiró `'Extracurriculares'` del bloque `'services'` de `MODULE_ITEM_ORDER`, que era referencia muerta.

### 2.3 Nota de usabilidad

Siete de los nueve ítems se truncan en el menú. Lo que se corta es el sufijo *"de extracurriculares"*, que el encabezado del módulo ya provee. El sufijo gana su lugar en la pantalla de asignación de permisos, donde los nueve conviven con doscientos sin contexto. Se acepta el truncamiento.

## 3. Prerrequisito ejecutado: retiro de la página de Servicios

Existía el permiso `Extracurriculares` (`a3a24dbb-7bc6-4847-b0c1-03f8fc4c5298`) y la página `/modules/services/extracurricular.html`, funcional en código pero no productiva.

**No podían convivir.** Esa página, al guardar un ciclo, borraba todos los días del ciclo antes de reinsertarlos. Con `sessions_count` poblado habría destruido las sesiones congeladas y con ellas el respaldo de los precios publicados.

**Ejecutado en DEV y PROD:**

1. Permiso a `permission_status = 'inactive'` y `url_path = NULL`. Registro conservado.
2. Eliminación del archivo.
3. Borrado de datos: `daily_records` → `vehicle_configs` → `cycle_days` → `cycles`.

`svc_transport_rates_extracurricular` conservada.

> El nombre `Extracurriculares` queda ocupado permanentemente por el permiso retirado, dada la unicidad global de `permission_name`.

## 4. Modelo conceptual

```
Año académico
  └── Temporada (2 por año: "2026-2027 I", "2026-2027 II")
        ├── Días de la semana habilitados (típicamente 3)
        │     └── Sesiones (días lectivos de ese día en la temporada)
        ├── Conceptos de costo
        ├── Tarifas de transporte (vinculado / no vinculado)
        └── Actividades
              ├── Días (subconjunto de los días de la temporada)
              ├── Grados a los que aplica (N:N)
              ├── Cupos (mínimo y máximo)
              ├── Modalidad (instructor propio / alianza con tercero)
              ├── Costos propios
              └── Inscripciones
                    ├── Días ocupados (materializados, garantizan el no cruce)
                    └── Asistencia diaria
```

La temporada **es** `svc_extracurricular_cycles`; no se creó tabla paralela. De `cycle_id` ya colgaban la configuración de vehículos y el registro diario de rutas, y el cruce valioso es "cuántos inscritos hay el lunes / cuántos vehículos necesito el lunes".

**Formato del nombre:** `2026-2027 I` y `2026-2027 II`, con unicidad sobre `(academic_year_id, cycle_name)`.

## 5. Modelo de costeo

### 5.1 Principio general

```
aporte por estudiante = valor
                        × (sesiones, si el concepto es por sesión; 1 si es por temporada)
                        ÷ divisor de reparto
```

| Ámbito | Reparto | Divisor | Ejemplos |
|---|---|---|---|
| Actividad | Prorrateo | mínimo de esa actividad | honorarios del instructor, refrigerio |
| Temporada | Prorrateo | **suma de los mínimos de todas las actividades** | coordinador, desayuno de bienvenida |
| Cualquiera | Por estudiante | 1 | recordatorios, tarifa del tercero |

**Por qué el ámbito es indispensable.** Los honorarios del instructor son un costo *de cada actividad*. El coordinador es *uno solo para todo el programa*. Dividirlo entre el mínimo de cada actividad multiplicaría el recaudo por el número de actividades:

> Coordinador $3.000.000, 12 actividades con mínimo 10.
> Entre el mínimo de cada actividad (10): $300.000 c/u → $36.000.000. ❌
> Entre la suma de los mínimos (120): $25.000 c/u → $3.000.000. ✅

### 5.2 Combinación prohibida — ámbito temporada + base sesión

**Restricción `svc_extracurricular_cost_concepts_scope_time_check`.**

Esa combinación no tiene divisor definido: un concepto de temporada no pertenece a ninguna actividad, y las sesiones difieren por día. Se evaluó definirlo como la suma de las sesiones de todos los días habilitados, pero el caso de uso que lo motivaba —costos globales diarios como enfermería o vigilancia— **no aplica en Tilatá**: ese personal ya está cubierto por su horario laboral y cargarlo sería cobrarlo dos veces.

**Efecto útil:** un concepto de temporada siempre se multiplica por 1.

### 5.3 La modalidad no gobierna la aritmética

Dos modalidades: **instructor propio** (valor por sesión, igual para todas) y **alianza con tercero** (valor por estudiante, propio de cada actividad).

El cobro del tercero entra por la misma puerta que los recordatorios. La modalidad se conserva para reportes y para **filtrar qué conceptos aplican**, pero el motor no la lee en la aritmética.

### 5.4 Cálculo de sesiones

```
sesiones de un día de la semana =
    fechas de ese día entre inicio y fin de temporada
    − pedagogical_days
    − hr_non_work_days
    − semanas de receso (calculadas, no almacenadas)
```

> **Vocabulario:** "día Tilatá" es el número del ciclo rotativo, no un día de semana. Aquí "sesión" significa **día lectivo**.

**No existe tabla canónica de días lectivos.** "Generar días Tilatá" produce eventos en Google Calendar, no filas consultables.

**Estructura de las fuentes, verificada:**

| Tabla | Forma | Vínculo con el año |
|---|---|---|
| `pedagogical_days` | una fecha por fila (`pedagogical_day`, tipo `date`) | `year_id` uuid ✅ |
| `hr_non_work_days` | **rango** (`start_date`, `end_date`) | `academic_year` **varchar** ⚠️ |
| Semanas de receso | **ninguna: se calculan** | — ⚠️ |

`hr_non_work_days` guarda rangos, no fechas sueltas: un receso de semana santa es **una fila que cubre cinco días lectivos**. El motor expande cada rango día a día.

El vínculo por cadena se verificó funcionando: `hr_non_work_days.academic_year` coincide exactamente con `academic_years.year_name` (`"2025-2026"`, `"2026-2027"`). Sigue siendo deuda: una cadena mal escrita rompería el conteo en silencio.

**Las semanas de receso no están en ninguna tabla.** `hr_non_work_days` guarda solo festivos —es lo único que inserta `generar-dias-tilata.html`— y su `day_type` admite `holiday`, `paid_break`, `unpaid_break` y `virtual_day`: vocabulario de nómina. Registrar el receso ahí obligaría a declararlo pagado o no pagado, que es una decisión directiva que varía cada año, para representar un hecho del calendario estudiantil que no varía: los estudiantes no asisten. **Por eso la regla vive en código, en `calendario-escolar.js`.**

Son dos por año calendario, y la semana completa queda sin clases aunque solo alguno de sus días sea festivo nacional:

- **Semana Santa:** lunes a viernes de la semana de Pascua.
- **Semana de receso de octubre:** lunes a viernes de la semana anterior al festivo de Día de la Raza (Decreto 1373 de 2007).

Una temporada que cruce dos años calendario toma los recesos de ambos.

**`virtual_day` no cuenta como sesión.** Queda cubierto por la fórmula, que resta la totalidad de `hr_non_work_days`. En un día virtual no hay extracurricular presencial, ni instructor a quien pagar, ni bus.

**El conteo es calculado pero editable.** El sistema lo calcula, lo muestra con el detalle de lo excluido, y permite ajustarlo antes de congelar. Las fuentes de calendario son imperfectas y el coordinador conoce excepciones que la base no registra.

Se almacena **por día de la semana**, no global.

### 5.5 Precio de la actividad

```
precio = redondeo( Σ aportes por estudiante de todos los conceptos aplicables )
```

Conceptos aplicables = los de ámbito temporada + los de ámbito actividad compatibles con su modalidad.

> **Precisión sobre `applies_to_modality`.** El motor aplica ese filtro **sin mirar el ámbito**: un concepto de ámbito temporada con modalidad declarada quedaría filtrado, contra la intención de este párrafo. `cost-concepts.html` fuerza el nulo cuando el ámbito es temporada, así que la regla la garantiza la pantalla, no la base ni el motor. Un concepto creado por SQL con ambas cosas se aplicaría a medias y el faltante no aparecería en ningún lado. Las sesiones de la actividad = suma de las sesiones de los días que ocupa.

**Los precios quedan acoplados entre sí.** Como los conceptos de temporada se reparten entre la suma de los mínimos, agregar una actividad, quitarla o cambiarle el mínimo mueve el precio de todas. **La oferta se cierra completa, se calcula en una pasada y se publica de una vez.**

### 5.6 Redondeo

**Decisión institucional: hacia arriba, al múltiplo de mil, sobre el total.**

| Nivel | Tratamiento |
|---|---|
| Aporte de cada concepto | `Math.round` al peso, solo para mostrarlo sin decimales |
| Precio de la actividad | `Math.ceil` al múltiplo de 1.000 |

Implementado como `EC_UNIDAD_REDONDEO = 1000` y `ecRedondear()` en el motor.

> **Consecuencia para la interfaz.** El desglose **no suma el total**: la diferencia va de $1 a $999. `ecCalcularPrecios()` devuelve tres campos —`precioSinRedondear`, `precio` y `ajusteRedondeo`— para que la pantalla muestre una línea de ajuste explícita. Sin ella, el coordinador verá cuatro cifras que no dan el precio de abajo. **Aplica a `activities.html`.**

Ejemplo verificado: mínimo 7, un día de 18 sesiones, tres conceptos → aportes de $462.857 + $428.571 + $35.000 = $926.428, precio publicado $927.000, ajuste $572.

### 5.7 Cargo de transporte

El transporte **se cuelga del día, no de la actividad**. El bus sale el lunes con todos los niños del lunes. Cargo separado y opcional.

```
cargo de transporte = tarifa unitaria × sesiones de los días de su actividad
```

**No se redondea**, porque no es un aporte de concepto. Si el coordinador digita tarifas en múltiplos de mil, las tres opciones salen redondas solas.

**Tarifa unitaria digitada, no proyectada.** Al inscribir no se sabe cuántos tomarán ruta ni qué vehículos asignará el operador, y la familia necesita un valor firme. El operador no agrega vehículos vacíos por un estudiante adicional: ajusta capacidad.

`svc_transport_rates_extracurricular` sirve como **referencia visual**, mostrando el costo por asiento lleno y al 85% de ocupación. Ver la advertencia de la sección 3.2 de la Parte I sobre la vigencia de esos datos.

**No hay mínimo de inscritos para abrir ruta.**

### 5.8 Las tres opciones de tarifa

| Opción | Valor |
|---|---|
| 1 — Sin transporte | precio de la actividad |
| 2 — Con transporte, familia vinculada | precio + (tarifa vinculada × sesiones) |
| 3 — Con transporte, familia NO vinculada | precio + (tarifa no vinculada × sesiones) |

**Dos valores absolutos independientes**, no un valor más un porcentaje. Se valida que la no vinculada sea ≥ la vinculada.

**Origen del diferencial:** el operador no le cobra más al colegio por estudiantes no vinculados; la retribución que entrega al colegio sería mayor si esas familias se afiliaran. El mayor valor de la opción 3 es una **compensación**, no un costo.

> **Por eso no entra en el modelo de costeo.** Registrarlo como costo mostraría un déficit permanente inexistente en los reportes de cierre.

**O las dos tarifas o ninguna.** Ambas se congelan en la fila de inscripción y van `NOT NULL`; dejar una sola produciría un fallo al inscribir, lejos del punto de digitación y sin relación aparente.

### 5.9 Declaración y validación de la vinculación

La familia **declara**; el colegio **valida** manualmente contra su información del operador.

**La inscripción congela ambas tarifas** más un señalador de cuál aplica, para que corregir una declaración solo mueva el señalador.

**El riesgo es financiero y acotado, no operativo.** La flota se dimensiona con quienes declaran tomar ruta; la vinculación solo afecta el recaudo.

### 5.10 Congelamiento

Al publicar se congelan sesiones por día, precios de actividades y las dos tarifas. Al inscribir se congelan en la fila de inscripción.

### 5.11 Cobertura del faltante cuando una actividad no abre

**El colegio lo asume.** Sin margen de seguridad ni reparto restringido.

**Argumento aritmético.** El modelo divide entre la **suma de los mínimos**, no entre los inscritos reales. Si se inscriben 150 en lugar de 120, el colegio recauda $3.750.000 para un costo de $3.000.000: sobran $750.000, que compensan el faltante de $500.000 del escenario de dos actividades caídas.

Un margen de seguridad cobraría dos veces el mismo riesgo; repartir solo entre las que siempre abren exige un histórico inexistente y crea un subsidio oculto entre actividades.

## 6. Flujo operativo

| # | Paso | Responsable | Estado |
|---|---|---|---|
| 1 | Parametrización: temporada, días, sesiones, conceptos, tarifas | Coordinador | `draft` |
| 2 | Creación de la oferta | Coordinador | `draft` |
| 3 | **Publicación**: se calculan y congelan sesiones, precios y tarifas | Coordinador | `draft` → `published` |
| 4 | Inscripción | Coordinador | `published` |
| 5 | **Cierre de inscripciones** | Coordinador | `published` → `enrollment_closed` |
| 6 | Validación de la vinculación | Coordinador | `enrollment_closed` |
| 7 | Cierre de actividades sin mínimo + reubicaciones | Coordinador | `enrollment_closed` |
| 8 | Entrega a Tesorería | Tesorería | `enrollment_closed` → `delivered` |
| 9 | Configuración de rutas con el operador | Coordinador | `delivered` |
| 10 | Operación diaria: asistencia + banderazo de rutas | Coordinador | `delivered` |
| 11 | Cierre de temporada y reportes | Coordinador | `delivered` → `closed` |

### 6.1 Reglas del flujo

**No se bloquea por cupo.** El máximo es indicativo; el balanceo es proceso humano. Elimina el problema de concurrencia por el último cupo.

**Sí se bloquea por cruce de días.**

| Caso | Resultado |
|---|---|
| A (lunes) + H (martes) | ✅ |
| A (lunes) + F (martes y jueves) | ✅ |
| A (lunes) + E (lunes y martes) | ❌ Se cruza el lunes |

**No hay tope de actividades por estudiante.** El límite lo impone la regla de no cruce: tantas actividades como días habilitados tenga la temporada.

**El orden importa.** Validación → reubicaciones y recálculo → entrega a Tesorería. El sistema debe advertir si se mueve a alguien después de `delivered`.

**Toda reubicación recalcula.** La pantalla debe mostrar **el valor antes y después** y disparar notificación.

**El retiro no se expone a las familias.** Se marca como anulada; nunca se borra.

**Retiro posterior a `delivered`:** nota crédito en Phidias. SchoolNet registra y notifica; **sin lógica de reversa**.

### 6.2 El cierre de inscripciones puede ser posterior al inicio de la temporada

**Sin restricción de base.** Advertencia en pantalla, no bloqueo. La consecuencia de cobro no la resuelve este módulo: ver 3.1 de la Parte I.

### 6.3 Reversibilidad de estados

| Transición | Tratamiento |
|---|---|
| `published` → `draft` | **Bloqueada si existe al menos una inscripción.** Permitida si hay cero |
| `enrollment_closed` → `published` | Libre |
| `delivered` → `enrollment_closed` | Permitida con confirmación explícita |
| `closed` → `delivered` | Permitida con confirmación explícita |

**Por qué `published → draft` es el único caso duro.** Publicar congela valores que al inscribir se copian a la fila de inscripción. Volver a borrador con inscripciones y republicar con precios distintos deja dos generaciones de precio conviviendo, sin manera de detectarlo en el cierre.

**En pantalla:** badge de estado y **botones explícitos**, nunca un desplegable.

### 6.4 Implementación de las transiciones — v1.9

**Construidas y probadas el 31 de julio de 2026.** Hasta entonces `seasons.html` solo escribía `published` y `draft`: una temporada publicada **no podía avanzar nunca**, y con ella eran inalcanzables los pasos 5 al 11 del flujo. Eso volvía inconstruible la etapa 2 de `enrollments.html`, que ocurre en `enrollment_closed`, y `treasury.html`, que parte de `delivered`.

#### El mapa `TRANSICIONES`

Cada estado declara a dónde puede **avanzar** y a dónde puede **devolverse**, con el texto de confirmación que corresponde. La reversa a borrador no está en el mapa: tiene su propio candado y su propia función.

| Estado | Avanza a | Devuelve a |
|---|---|---|
| `published` | `enrollment_closed` — "Cerrar inscripciones" | — (la reversa a borrador va aparte) |
| `enrollment_closed` | `delivered` — "Entregar a Tesorería" | `published` — "Reabrir inscripciones", **sin confirmación** |
| `delivered` | `closed` — "Cerrar temporada" | `enrollment_closed` — con confirmación |
| `closed` | — | `delivered` — con confirmación |

La escritura es un solo `PATCH`. **Ningún estado dispara recálculos**, porque los valores ya están congelados desde la publicación.

#### `delivered_at`

Se escribe al pasar a `delivered` y **no se limpia nunca**: ni al revertir, ni al republicar. Registra que la temporada **estuvo** entregada, no que lo esté ahora, que es la pregunta que el candado necesita hacer. Una columna que se limpiara al reversar no serviría para nada.

Tampoco se sobrescribe: si la temporada se reversa y se vuelve a entregar, conserva la fecha de la primera entrega.

#### Por qué el cierre de inscripciones es manual

**La fecha ya cierra la puerta sola para quien tiene que cerrársele:** `fn_extracurricular_enroll` rechaza cualquier alta por canal distinto de `admin` fuera de la ventana, sin importar el estado de la temporada. El portal deja de aceptar familias por sí mismo.

**El estado es otra cosa: es la declaración de que la fase de inscripción terminó**, y eso no lo decide una fecha sino coordinación. Pasar a `enrollment_closed` bloquea las altas **incluso para coordinación**, porque solo `published` las admite (decisión 47). Si ocurriera automáticamente a la medianoche del día de cierre, al día siguiente coordinación no podría registrar a la familia que llamó, que es justamente el caso para el que existe el canal administrativo.

Hay además una razón práctica: SchoolNet no tiene tareas programadas. Un cierre automático exigiría un disparador por tiempo que hoy no existe en la plataforma.

#### El aviso de ventana vencida

Nada le recordaba a coordinación que la ventana ya pasó. Si la temporada sigue publicada tres semanas después del cierre, el olvido no cuesta nada visible pero retrasa toda la cadena.

`renderPublicacion()` muestra un aviso ámbar cuando el estado es `published` y `enrollment_end_date` ya pasó, con **cuántos días** hace que cerró y **qué queda bloqueado por no haber cerrado**: validar la vinculación de transporte, cerrar las actividades sin mínimo, entregar a Tesorería. No bloquea nada; solo recuerda.

#### Recorrido probado

| Transición | Resultado |
|---|---|
| `published → enrollment_closed` | ✅ Confirmación con el texto correcto; desaparece "Devolver a borrador" |
| `enrollment_closed → delivered` | ✅ `delivered_at` escrito |
| `delivered → enrollment_closed` | ✅ La línea de entrega **sobrevive** a la reversa |
| `enrollment_closed → published` | ✅ Sin confirmación, como declara el mapa |
| `published → draft` con temporada entregada | ✅ **Bloqueada**, sin cuadro de confirmación |
| `published → draft` con inscripciones anuladas | ✅ Permitida, con el conteo en la advertencia |
| `published → draft` con inscripciones activas | ✅ Bloqueada, diciendo cuántas |
| `delivered → closed` y su reversa | ❌ Sin probar. Misma mecánica que las demás |

## 7. Modelo de datos

### 7.1 Tablas existentes reutilizadas

| Tabla | Rol | Cambios |
|---|---|---|
| `svc_extracurricular_cycles` | **La temporada** | 7 columnas nuevas, 1 eliminada, 6 restricciones |
| `svc_extracurricular_cycle_days` | Días habilitados | `sessions_count` + restricción |
| `svc_extracurricular_vehicle_configs` | Flota acordada (paso 9) | Sin cambios |
| `svc_extracurricular_daily_records` | Banderazo diario (paso 10) | Sin cambios |
| `svc_transport_rates_extracurricular` | Referencia de tarifas | Sin cambios |
| `academic_years`, `pedagogical_days`, `hr_non_work_days` | Calendario y sesiones | Sin cambios |
| `grades` | `grade_id` es **uuid** | Sin cambios |
| `students`, `courses` | `students.student_id` es **integer**, sin `DEFAULT` | Sin cambios |
| `families`, `family_members` | Fase de portal | Sin cambios |
| `users` | `user_id` es **uuid** | Sin cambios |

**Cambio de papel de `svc_extracurricular_vehicle_configs`:** de insumo de proyección a **registro de lo que el operador efectivamente armó**, para conciliar contra `daily_records` al cierre. Admite flota mixta como filas separadas; `effective_from` permite cambios a mitad de temporada.

### 7.2 `svc_extracurricular_cycles`

**Columnas nuevas:**

| Columna | Tipo | Nulo |
|---|---|---|
| `enrollment_start_date` | date | sí |
| `enrollment_end_date` | date | sí |
| `season_status` | varchar | **no**, default `'draft'` |
| `transport_rate_linked` | numeric | sí |
| `transport_rate_unlinked` | numeric | sí |
| `published_at` | timestamptz | sí |
| `published_by` | uuid, FK a `users` | sí |
| `delivered_at` | timestamptz | sí |

> **`delivered_at` se agregó en la v1.8** y la escribe la v1.9. Es la única constancia de que una temporada estuvo entregada a Tesorería: no existe bitácora de transiciones de estado. No se limpia ni se sobrescribe. Ver 6.4.

**Columna eliminada:** `is_active`. Duplicaba el propósito de `season_status`. Se eliminó porque, tras retirar la página de Servicios, no quedó código que la consumiera.

**Restricciones nuevas:** `..._name_unique`, `..._published_by_fkey`, `..._season_status_check`, `..._enrollment_dates_check`, `..._rate_linked_check`, `..._rate_unlinked_check`.

> **Las restricciones de comparación no muerden con nulos.** `NULL >= NULL` es desconocido, no falso, y un `CHECK` solo rechaza lo explícitamente falso. Una temporada en borrador pasa sin problema. **La validación de completitud al publicar es de la aplicación** (sección 9).

### 7.3 `svc_extracurricular_cycle_days`

`sessions_count integer`, nulo, con `CHECK >= 0`.

**Nulo a propósito, sin defecto en cero.** Nulo dice *"no se ha calculado"*; cero diría *"se calculó y no hay sesiones"*, que es un estado real aunque patológico. Con defecto en cero, publicar sin pasar por el cálculo produciría precios multiplicados por cero sin error visible.

### 7.4 Tablas nuevas

#### `svc_extracurricular_activities`

`activity_id` (PK), `cycle_id`, `activity_name` (único en la temporada), `activity_description`, `photo_url`, `modality`, `instructor_name`, `min_students`, `max_students`, `activity_status`, `frozen_price`, `display_order`.

**`min_students > 0`, no `>= 0`.** Un mínimo en cero produciría división por cero en el prorrateo.

**`frozen_price` nulo hasta publicar**, no cero: una actividad que se escapara del cálculo aparecería a $0 sin error visible.

**Andamiaje:** `..._cycle_unique UNIQUE (activity_id, cycle_id)`. PostgreSQL exige unicidad sobre la combinación destino de toda llave foránea compuesta.

> **Sobre el estado:** un booleano de "activa" no alcanza. Son tres cosas distintas: *se muestra en la oferta*, *se abrió porque cumplió el mínimo*, y *fue cancelada*.

#### `svc_extracurricular_activity_days`

`activity_id`, `cycle_id`, `day_of_week`. PK `(activity_id, day_of_week)`.

**Dos llaves foráneas que trabajan en pareja.** La primera ata `(activity_id, cycle_id)` a la actividad. La segunda ata `(cycle_id, day_of_week)` a los días habilitados. El efecto combinado: **una actividad solo puede usar días habilitados en su propia temporada**, garantizado por la base.

`ON DELETE CASCADE` hacia la actividad; **sin cascada** hacia los días de la temporada: quitar un jueves con actividades de jueves **falla**, y la pantalla debe traducir el error. Ya implementado en `seasons.html`.

**Lo que no impide:** un tope de dos días por actividad requeriría un disparador. No se agregó: una temporada de tres días podría legítimamente tener una actividad de tres días.

#### `svc_extracurricular_activity_grades`

`activity_id`, `grade_id`. PK compuesta.

> **Corregido en la v1.4. La nota anterior era falsa y decía lo contrario.** `grades` es un catálogo de niveles: **catorce filas, una por grado**, de Prejardín a Undécimo. Su `academic_year_id` **no es el año en que el grado existe, sino el año de graduación proyectado de la cohorte que hoy lo cursa** — Undécimo apunta a 2025-2026, Prejardín a 2038-2039. Filtrar por el año de la temporada deja **un solo grado**, el que se gradúa ese año. El selector no debe filtrar por año; filtra por `grade_status = 'active'` y ordena por `grade_order`. Esto vuelve a importar en el portal de familias, cuya cadena de resolución (sección 12.1) termina en `courses.grade_id → grades`.

#### `svc_extracurricular_cost_concepts`

`concept_id` (PK), `cycle_id`, `concept_name` (único en la temporada), `scope`, `time_base`, `allocation_base`, `default_value`, `applies_to_modality`, `is_active`, `display_order`.

Más `..._scope_time_check` (sección 5.2) y `..._cycle_unique` como andamiaje.

**`default_value` nulo** significa que el valor lo pone cada actividad — el caso de la tarifa del tercero. De ahí la validación 4 de la sección 9.

**`applies_to_modality` nulo** significa "aplica a todas". Un `CHECK` con `IN` sobre nulo da desconocido, no falso.

#### `svc_extracurricular_activity_costs`

`activity_id`, `concept_id` (PK compuesta), `cycle_id`, `concept_value` (`NOT NULL`, `>= 0`).

> **Desvío deliberado respecto a la v1.1.** Sin `cycle_id`, nada impedía asignarle a una actividad de la temporada I un concepto de la temporada II: ambas llaves foráneas serían válidas por separado. El precio se calcularía con un valor de otro semestre sin manera de detectarlo. Con `cycle_id` compartido entre ambas llaves compuestas, la combinación es imposible.

#### `svc_extracurricular_enrollments`

`enrollment_id` (PK), `activity_id`, `cycle_id`, `student_id`, `transport_option`, `validated_transport_option`, `transport_validated`, `validated_by`, `validated_at`, `enrollment_channel`, `declared_by_email`, `enrolled_by`, `frozen_activity_price`, `frozen_transport_rate_linked`, `frozen_transport_rate_unlinked`, `frozen_sessions`, `enrollment_status`, `withdrawn_at`, `withdrawn_by`, `withdrawal_reason`.

> **`enrolled_by` se agregó en la v1.8.** `uuid` nulo con FK a `users`. Existían `withdrawn_by` y `validated_by` pero no el equivalente para el alta: se sabía quién retiró y no quién inscribió. Cuando el portal cargue el volumen, las altas por canal `admin` serán justamente las excepciones —la familia que llamó, la inscripción fuera de ventana, la reubicación— y son las que alguien va a querer explicar después. Admite nulo porque las inscripciones del portal no lo tendrán: las familias no tienen `user_id`, y para ese caso la autoría queda en `enrollment_channel` más `declared_by_email`.

Únicos: `(activity_id, student_id)` y el andamiaje `(enrollment_id, cycle_id, student_id, activity_id)`.

**Los cuatro campos congelados van `NOT NULL`** porque la fila debe ser autosuficiente: el valor total se calcula sin consultar ninguna otra tabla. Verificado en la prueba del disparador: una inscripción sembrada devolvió $1.279.750 sin tocar temporada ni actividad.

**`frozen_sessions > 0`.** Aquí vive la solución a la inscripción tardía: el número se congela por fila, así que prorratear no exige cambiar ninguna tabla.

**Lo que deliberadamente no se restringió:** coherencia entre `validated_transport_option` y `transport_option`; que `validated_at` esté lleno si la validación es verdadera; que el estudiante pertenezca a un grado ofertado. Son reglas de proceso, y encerrarlas en la base haría que corregir un error de digitación exigiera un orden específico de actualizaciones.

> **Autoría:** las familias no tienen `user_id`. Por eso se registra canal más correo del familiar.

#### `svc_extracurricular_enrollment_days`

`enrollment_id`, `cycle_id`, `student_id`, `activity_id`, `day_of_week`. PK `(enrollment_id, day_of_week)`.

**`..._no_overlap UNIQUE (cycle_id, student_id, day_of_week)` es el corazón del módulo.** Un estudiante, una temporada, un día: una sola fila.

Efecto secundario valioso: **el cargo de transporte no puede duplicarse** para el mismo día.

> **Desvío deliberado respecto a la v1.1.** Con las cuatro columnas originales, la base garantizaba que un estudiante no ocupara dos veces el mismo día, pero **no que el día ocupado fuera un día de su actividad**. El estudiante quedaría bloqueado un día al que no asiste, sin poder inscribirse en otra cosa, y el diagnóstico es difícil porque todo se ve consistente.

**Errores que `enrollments.html` debe distinguir.** Ambos llegan como `23505` con el nombre de la restricción:

| Restricción | Mensaje |
|---|---|
| `..._no_overlap` | "El estudiante ya tiene una actividad ese día" |
| `..._activity_student_unique` | "El estudiante ya está inscrito en esta actividad" |

#### `svc_extracurricular_attendance`

`attendance_id` (PK), `enrollment_id`, `attendance_date`, `attendance_status`, `notes`, `recorded_by` (admite nulo). Único `(enrollment_id, attendance_date)`. Índice `idx_svc_extracurricular_attendance_date`.

**El índice no es decorativo.** La pantalla se organiza por fecha y el único no sirve porque la fecha va en segunda posición.

> **Por qué la asistencia NO se ata a `enrollment_days`.** Sería una trampa. El disparador borra las filas de días cuando la inscripción sale de `active`. Con cascada, **retirar a un estudiante borraría su historial de asistencia**; sin cascada, **retirar a un estudiante con asistencia sería imposible**. La regla que hace de `enrollment_days` un buen control de cruce —existe solo mientras la inscripción está activa— es la que lo inhabilita como referencia histórica. **Los datos volátiles no sirven de ancla para los permanentes.**

### 7.5 Liberación de días ocupados

**Regla:** existe una fila en `svc_extracurricular_enrollment_days` **si y solo si** la inscripción tiene `enrollment_status = 'active'`.

**Implementación:** `fn_extracurricular_release_days()` y `trg_extracurricular_release_days`, `AFTER UPDATE OF enrollment_status`, con la condición en la cláusula `WHEN`.

**Por qué la condición va en `WHEN`.** PostgreSQL la evalúa antes de invocar el código: en un `UPDATE` masivo que no toque el estado, la función no se ejecuta ni una vez.

**Por qué disparador y no frontend:**

- **Consistencia.** Misma decisión que las llaves foráneas compuestas.
- **Operaciones masivas.** El cierre de una actividad sin mínimo es un solo `UPDATE`.
- **Ausencia de transacciones.** PostgREST no da transacciones entre peticiones HTTP. Si el frontend borra días y luego actualiza el estado y falla en medio, queda una inscripción activa sin días —recuperable—. Al revés, queda una inscripción anulada bloqueando un día **para siempre**, sin explicación visible.

**Probado en DEV** con tres escenarios: valor total autosuficiente, rechazo del cruce, y liberación con reinscripción posterior exitosa.

**Reubicación:** anular la vieja —el disparador libera el día— y crear la nueva. Si la segunda falla, el estudiante queda sin actividad pero con el día libre: el estado recuperable.

**Reactivación:** volver a `active` **no repone los días**. La aplicación debe reinsertarlos, y fallará si otro tomó el día. Ese fallo es correcto y necesita mensaje claro.

### 7.6 Inscripción transaccional — `fn_extracurricular_enroll`

**Construida el 31 de julio de 2026.** Es el único camino de escritura hacia `svc_extracurricular_enrollments` y `svc_extracurricular_enrollment_days`. La llaman por RPC tanto `enrollments.html` como, en su momento, el Apps Script del portal de familias.

#### Firma

```
fn_extracurricular_enroll(
  p_student_id        integer,
  p_activity_id       uuid,
  p_transport_option  varchar DEFAULT 'none',
  p_channel           varchar DEFAULT 'admin',
  p_declared_by_email varchar DEFAULT NULL,
  p_enrolled_by       uuid    DEFAULT NULL
) RETURNS json
```

**Quien llama no envía ningún valor de dinero.** Ni precio, ni tarifas, ni sesiones. Todo se deriva adentro. Es lo que impide que el portal calcule por su cuenta y que las dos implementaciones diverjan.

#### Lo que deriva

| Dato congelado | Origen |
|---|---|
| `cycle_id` | De la actividad |
| `frozen_activity_price` | `activities.frozen_price` |
| `frozen_transport_rate_linked` / `_unlinked` | De la temporada, ambas siempre |
| `frozen_sessions` | Suma de `cycle_days.sessions_count` de los días de la actividad |
| Días ocupados | Un `INSERT ... SELECT` desde `activity_days` |

#### Validaciones, en orden de evaluación

| # | Validación | Tratamiento |
|---|---|---|
| 1 | Opción de transporte en `none` / `linked` / `unlinked` | Rechazo |
| 2 | La actividad existe | Rechazo |
| 3 | Actividad en `offered` | Rechazo |
| 4 | Actividad con `frozen_price` | Rechazo |
| 5 | Temporada en `published` | Rechazo (decisión 47) |
| 6 | Las dos tarifas de transporte digitadas | Rechazo |
| 7 | Ventana de inscripción | **Depende del canal** (ver abajo) |
| 8 | Temporada ya iniciada | **Advertencia**, nunca rechazo |
| 9 | Estudiante existe y `student_status.status_code = 1` | Rechazo |
| 10 | Estudiante con curso asignado | Rechazo |
| 11 | El grado del estudiante está en `activity_grades` | Rechazo |
| 12 | La actividad tiene al menos un día | Rechazo |
| 13 | Ningún día con `sessions_count` nulo | Rechazo |
| 14 | Sesiones > 0 | Rechazo |

**El estudiante activo se resuelve por `status_code = 1`, no por el uuid** de `student_status`. Así la misma sentencia sirve en DEV y en PROD sin depender de que los uuid del catálogo coincidan entre ambientes.

> **Por qué la 13 existe y no es paranoia.** `SUM()` **ignora los nulos**: una actividad con un día sin conteo no daría suma nula, daría *el total de los otros días*. Menos sesiones de las reales, cargo de transporte más bajo, congelado en la fila, y nada que lo delate. La validación 1 de publicación lo previene, pero la función tiene que defenderse sola porque el portal la llama directo.

> **Por qué la 11 vive aquí.** La sección 7.4 la dejó deliberadamente fuera de las restricciones de base, como regla de proceso, y `enrollments.html` la resuelve filtrando la lista de candidatos. Un filtro de interfaz no defiende nada frente a una llamada por RPC.

#### La regla del canal

| Canal | Fuera de la ventana de inscripción |
|---|---|
| `admin` | **Pasa**, con advertencia (decisión 48) |
| Cualquier otro | **Rechazo** |

La condición está escrita como *"distinto de `admin`"*, no como *"igual a familia"*. Así no depende de qué literal termine usando el portal, y cualquier canal que se invente después nace bloqueado en vez de nacer permitido.

**Consecuencia institucional, aceptada el 31 de julio de 2026:** una familia que llega tarde no puede inscribirse sola. Tiene que llamar al colegio y que coordinación la registre. Es más trabajo para coordinación, pero conserva el control de los casos tardíos, que son justamente los que llegan a Tesorería con particularidades de cobro.

#### Advertencias

Una función de base **no puede advertir**: o rechaza o acepta. Pero sí puede devolver la advertencia, y debe hacerlo por la misma razón que existe la función: si el texto vive en `enrollments.html`, cuando exista el portal habrá que escribirlo otra vez en Apps Script y las dos versiones divergirán.

El campo `warnings` del JSON de respuesta trae un arreglo de textos ya redactados para el usuario. Dos previstos:

- **Fuera de la ventana de inscripción**, con las fechas.
- **Inscripción posterior al inicio de la temporada**, con la fecha de inicio y la aclaración de que el cobro lo define Tesorería.

**Son independientes y pueden salir juntas.** El 11 de septiembre la ventana ya cerró *y* la temporada ya arrancó; una inscripción el 5 de agosto estaría fuera de ventana sin que la temporada haya empezado. Verificado en las pruebas 6 y 7.

**La función no propone ningún ajuste de precio en ninguno de los dos casos.** Es de Tesorería (sección 3.1 de la Parte I).

#### Atomicidad

Los dos `INSERT` van dentro de un bloque `BEGIN ... EXCEPTION`, que en PostgreSQL crea una subtransacción: si el de los días falla, el de la inscripción se deshace solo. Ahí desaparece el remedo que hacía `enrollments.html`, que borraba a mano la inscripción recién creada.

El manejador distingue las dos restricciones que llegan con el mismo `23505`, leyendo `CONSTRAINT_NAME` con `GET STACKED DIAGNOSTICS`:

| Restricción | Mensaje devuelto |
|---|---|
| `..._no_overlap` | El estudiante ya tiene una actividad ese día |
| `..._activity_student_unique` | El estudiante ya está inscrito en esta actividad |

Cualquier otra violación de unicidad se relanza sin traducir.

#### Respuesta

```json
{
  "ok": true,
  "enrollment_id": "...",
  "activity_name": "Futbol",
  "transport_option": "linked",
  "frozen_activity_price": 393000,
  "frozen_transport_rate_linked": 16100,
  "frozen_transport_rate_unlinked": 21000,
  "frozen_sessions": 24,
  "total_value": 779400,
  "days": [1, 3],
  "warnings": []
}
```

#### Consumo desde la pantalla

`POST` a `/rpc/fn_extracurricular_enroll` por el `supabaseRequest()` de siempre, sin headers explícitos. Los nombres de los parámetros en el cuerpo son los de la firma, con prefijo `p_`: PostgREST los mapea literalmente.

> **Los errores llegan envueltos.** `_supabaseRequestSingle` lanza `Error("HTTP 400: {…json…}")`, así que el mensaje legible queda adentro de ese texto como el campo `message`. `traducirError()` lo extrae y, cuando el `code` es `P0001` —un `RAISE` nuestro—, lo muestra tal cual: el texto ya está escrito para el usuario. Sin esa extracción el coordinador vería el `HTTP 400` crudo.

#### Seguridad

La función queda expuesta por RPC y es invocable con la `anon key`, igual que cualquier tabla hoy. **No empeora nada respecto al estado actual de la plataforma** —RLS está desactivado y la seguridad vive en la capa JS— pero conviene tenerlo escrito y no descubrirlo de paso. Cuando el portal exista, la llamada del lado familias pasa por Apps Script con `service_role`, no desde el navegador.

## 8. El motor: `extracurricular-engine.js` y `calendario-escolar.js`

Dos archivos compartidos por `seasons.html` y `activities.html`, porque el cálculo lo necesitan las dos. `calendario-escolar.js` debe cargarse **antes** del motor. Verificado con **catorce pruebas automáticas** que reproducen el anexo.

`calendario-escolar.js` contiene las reglas de calendario que no viven en ninguna tabla: los festivos nacionales colombianos y las dos semanas de receso.

| Función | Papel |
|---|---|
| `calComputeEaster(año)` | Domingo de Pascua (Meeus/Jones/Butcher) |
| `calToNextMonday(fecha)` | Traslado de la Ley Emiliani |
| `calSemanasDeReceso(año)` | Semana Santa y semana de receso de octubre |
| `calRecesosEntreAnios(desde, hasta)` | Une los recesos de un rango de años calendario |
| `calMapaFechasReceso(desde, hasta)` | Expande a un mapa fecha → nombre del receso |

Existe para que la regla no esté duplicada entre el motor y `generar-dias-tilata.html`. Esa página aún conserva su copia; migrarla es deuda abierta (sección 3.3).

| Función | Papel |
|---|---|
| `ecObtenerInsumosCalendario(yearId)` | Trae jornadas y no laborables; **expande los rangos** a un mapa fecha → motivo |
| `ecCalcularSesiones(ini, fin, dias, insumos)` | Cuenta lectivos por día de semana y **devuelve el detalle de lo excluido**. Descuenta también las semanas de receso, que obtiene de `calMapaFechasReceso()` |
| `ecAdvertenciasCalendario(ini, fin, insumos)` | Avisos que no bloquean |
| `ecCalcularPrecios(actividades, conceptos, propios, sesiones)` | Desglose completo por concepto, no solo el total |
| `ecOpcionesTarifa(precio, sesiones, tv, tnv)` | Las tres opciones de 5.8 |
| `ecRedondear(valor)` | `Math.ceil` a múltiplos de `EC_UNIDAD_REDONDEO` |
| `ecAutoprueba()` | Catorce casos contra el anexo. Ejecutable en consola, sin tocar la base |

**Devuelve el detalle, no solo el número.** La pantalla muestra *"Lunes: 18 sesiones — 2 excluidos: festivo 20 de julio, jornada pedagógica 5 de septiembre"*. Un número solo obliga a confiar a ciegas.

**Las jornadas pedagógicas tienen precedencia** sobre los días no laborables cuando una fecha aparece en ambos. Es solo para la etiqueta; el día se excluye igual. Los recesos van al final de esa cadena de precedencia, por la misma razón.

> **Hueco conocido: una actividad sin días recibe precio, no error.** `ecSesionesActividad()` sobre una lista vacía devuelve `0`, no `null`, y el motor no lo trata como error: los conceptos por sesión aportan cero y la actividad queda con el precio de los conceptos de temporada. Publicable, con número, y mal. `activities.html` lo bloquea impidiendo que una actividad sin días pase a `offered`. El motor sigue sin defenderse solo.

**`ecAdvertenciasCalendario()` no bloquea.** La advertencia más importante es la de calendario vacío (sección 2.3 de la Parte I).

> **Lección de construcción:** los avisos deben renderizarse **dentro del panel donde el coordinador está mirando**, no en `alertContainer` al tope de la página. Durante las pruebas, la advertencia de calendario vacío se disparó y nunca se vio.

## 9. Validaciones de publicación — responsabilidad de la aplicación

**Ninguna vive en una restricción de base.** `seasons.html` debe verificarlas todas antes de permitir `draft → published`.

| # | Validación | Consecuencia de omitirla |
|---|---|---|
| 1 | Ningún día con `sessions_count` nulo | Precios nulos en las actividades de ese día |
| 2 | Fechas de inscripción digitadas | Ventana indefinida |
| 3 | Las dos tarifas digitadas, aunque sean cero | La inscripción falla: son `NOT NULL` en la fila congelada |
| 4 | Todo concepto aplicable con defecto o valor propio | Aporte nulo que contamina la suma |
| 5 | Toda actividad `offered` con `frozen_price` calculado | Actividad publicada a $0 o con precio nulo |
| 6 | **Calendario laboral cargado para el año académico** | **Precios inflados en la proporción de festivos faltantes** |
| 7 | Al menos una actividad en estado `offered` | Temporada publicada vacía: las seis anteriores pasan por vacuidad |

La validación 6 se agregó en la v1.3 tras detectar que DEV no tenía calendario para 2026-2027. Se cargó el 30 de julio de 2026; la validación sigue siendo necesaria para años futuros. Ver sección 2.3 de la Parte I.

La validación 7 se agregó en la v1.5, al construir la etapa 4. Sin ella una temporada sin actividades cumplía las seis anteriores y se publicaba vacía.

**La lista se muestra permanentemente en la tarjeta de publicación**, con el detalle de qué falta bajo cada línea roja, y el botón deshabilitado mientras alguna falle.

`activities.html` adelanta las validaciones 4 y 5 a la lista de actividades —la columna **Costos** muestra "Falta 1 de 3" en rojo— para que no aparezcan por primera vez cuando el coordinador intente publicar.

Se recomienda que la pantalla muestre las seis como **lista de verificación visible**, no como alerta al fallar. El coordinador debe ver qué falta antes de intentar publicar.

## 10. Pantallas y permisos

| # | `permission_name` | `url_path` | Estado |
|---|---|---|---|
| 1 | Gestionar temporadas de extracurriculares | `seasons.html` | ✅ completa |
| 2 | Conceptos de costo de extracurriculares | `cost-concepts.html` | ✅ |
| 3 | Gestionar actividades extracurriculares | `activities.html` | ✅ |
| 4 | Gestionar inscripciones a extracurriculares | `enrollments.html` | ✅ etapa 1 probada, por RPC |
| 5 | Registrar asistencia a extracurriculares | `attendance.html` | ❌ |
| 6 | Configurar rutas de extracurriculares | `routes.html` | ❌ |
| 7 | Registro diario de rutas de extracurriculares | `daily-routes.html` | ❌ |
| 8 | Consulta de Tesorería de extracurriculares | `treasury.html` | ❌ |
| 9 | Reportes de extracurriculares | `reports.html` | ❌ |

Todos bajo `/modules/extracurricular/`.

### 10.1 Atributos de los nueve registros

| Campo | Valor |
|---|---|
| `permission_module` | `extracurricular` |
| `permission_type` | `admin` |
| `permission_status` | `active` |
| `is_universal` | `false` |
| `url_manual` | `NULL` |

`admin` es el valor dominante en el sistema, aplicado incluso a páginas de consulta.

### 10.2 Nombres largos: razón

`permissions.permission_name` tiene **unicidad global**. `Registrar asistencia` ya está ocupado por el módulo `attendance`, y `Extracurriculares` por el permiso retirado.

### 10.3 Notas de diseño

**La consulta de Tesorería es página aparte** con permiso propio: la tesorera no debe ver el resto del módulo.

**La pantalla de asistencia se organiza por fecha, no por actividad.** Un lunes pueden correr cinco actividades simultáneas y el coordinador no está en cinco lugares; registra a posteriori.

**Fuera de `draft`, los formularios son de solo lectura**, y el botón de editar cambia a un ojo. No es restricción de base: esos valores sostienen precios ya copiados a filas de inscripción. Las correcciones van por la vía de revertir a borrador, con su propio candado.

**"Entregar a Tesorería" promete más de lo que hace.** Hoy solo escribe el estado y `delivered_at`: no genera archivo, no manda correo, no avisa a la tesorera. La entrega real es `treasury.html`, que pertenece a la fase 7 y no existe. Mientras tanto conviene que la etiqueta o el texto de ayuda lo digan, porque quien la pulse esperando que algo salga no verá nada.

**Marcar un día guarda de inmediato; el número de sesiones no.** Marcar el jueves es estructural. "17 sesiones" es un número derivado que el coordinador debe poder revisar antes de comprometerlo.

### 10.4 Asignación a roles

**Fuera del alcance del desarrollo.** La maneja administración desde `/modules/security/`.

### 10.5 Recordatorio operativo

El sidebar cachea permisos en `sessionStorage` bajo `schoolnet_sidebar_permissions`. Debe limpiarse tras cualquier cambio de permisos.

## 11. Almacenamiento de fotos

Bucket de Supabase Storage con **lectura pública**. Se crea público desde ya aunque el portal esté diferido.

> **Recordatorio:** los buckets **no se transfieren en los restores PROD→DEV**. Debe crearse manualmente en cada ambiente.

## 12. Portal de familias — diferido

La inscripción ocurriría en `families.html`, página pública sin `config.js` ni sesión, comunicándose **exclusivamente** con Google Apps Script, que usa `service_role` del lado servidor.

> **Por qué GAS y no el patrón del formulario público de admisiones.** Ese formulario habla directo con Supabase porque solo inserta y nunca lee. Extracurriculares necesita leer *qué hijos tiene esta familia*, y hacerlo con `anon key` sin RLS expondría la base de estudiantes completa.

### 12.1 Endpoints previstos

| Endpoint | Función |
|---|---|
| `get_extracurricular_offer` | Temporada abierta, actividades filtradas por grados de los hijos |
| `enroll_student` | **Envoltura delgada sobre `fn_extracurricular_enroll`** (v1.8) |
| `get_my_enrollments` | Inscripciones vigentes |

> **`enroll_student` dejó de ser trabajo de diseño.** La v1.7 lo describía como *"valida ventana y no cruce, inserta inscripción y días"*, que era la especificación de una segunda implementación completa, en un tercer lenguaje. Con la función de la sección 7.6 el endpoint se reduce a: recibir estudiante, actividad y opción de transporte declarada, verificar contra la sesión del portal que ese estudiante pertenece a la familia del correo autenticado, y llamar la función por RPC con `p_channel` distinto de `'admin'`. Toda la aritmética, las catorce validaciones y la atomicidad ya están resueltas del lado del servidor.

> **Lo único que el portal sigue debiendo por su cuenta** es la verificación de pertenencia: que el estudiante que llega en la petición sea hijo de la familia asociada al correo de la sesión. La función no lo puede saber —no recibe el correo autenticado, solo el declarado— y sin esa verificación cualquiera con una sesión válida podría inscribir a un estudiante ajeno.

Cadena de resolución: `family_members.email → families → students.family_id → students.course_id → courses.grade_id → grades`.

> **Ojo con las llaves:** `students.student_id` es entero y `students.family_id` es entero contra `families.family_code`.

### 12.2 Prerrequisito bloqueante

`portal_access_codes` y `portal_sessions` no existen en PROD y las Script Properties apuntan a DEV.

### 12.3 Papel de `enrollments.html` frente al portal

**No se vinculan.** `families.html` es una página pública sin `config.js` ni sesión, que habla exclusivamente con Apps Script; la familia nunca toca `enrollments.html` ni el cliente de Supabase del navegador. Son **dos caminos de escritura independientes hacia las mismas tablas**, y `enrollment_channel` existe para distinguirlos.

Cuando el portal esté vivo, `enrollments.html` queda para dos cosas:

**Excepciones a cargo del coordinador.** La familia sin acceso al portal o que llama en vez de entrar; las inscripciones fuera de ventana, que el portal rechazaría; los retiros, que la sección 6.1 dice que no se exponen a las familias; y las reubicaciones cuando una actividad no alcanza el mínimo.

**La vista operativa.** Quién va en qué actividad, si se alcanzó el mínimo, quién declaró transporte. Eso el portal no lo da.

> **Actualización de la v1.8.** Las dos escrituras dejaron de ser independientes: ambas pasan por `fn_extracurricular_enroll`. Lo que sigue siendo independiente es el **camino de autenticación** —sesión de SchoolNet contra sesión del portal— y por eso `enrollment_channel` conserva su razón de ser, junto con la regla de ventana que se comporta distinto según el canal.

> **Ajuste de diseño previsto.** La etapa 1 presenta las actividades como tarjetas para escoger una a la vez. Sirve para inscribir, que es lo que se tuvo en mente al construirla. **No sirve para la pregunta diaria del coordinador cuando el portal cargue el volumen** —"¿cuáles actividades van a abrir?"—, porque obliga a entrar y salir de cada una. Debe convertirse en una tabla con conteos, sin perder el acceso al detalle. Se posterga hasta que exista el portal: hoy no hay volumen que justifique el rediseño.

### 12.4 Impacto en esta entrega

Inscripción únicamente desde `enrollments.html` con `enrollment_channel = 'admin'`; `declared_by_email` opcional. **El modelo de datos no cambia**: todas las columnas del portal existen ya.

### 12.5 Bloqueo institucional, no técnico

**La carga de `family_members` está incompleta.** El documento entregado a IT (`Inconsistencias_BD_Estudiantes_para_IT.md`) reporta 26 códigos de familia del CSV que no existen en `families`, y la familia 106000 con padres distintos entre hermanos. Mientras eso no se resuelva, esas familias no pueden entrar al portal: `request_code` valida contra `family_members` y devuelve respuesta neutra, así que ni siquiera sabrían por qué.

**Abrir la inscripción por portal con cobertura parcial deja a un grupo de familias sin canal y sin explicación visible.** Es razón suficiente para que la primera temporada la cargue coordinación, independientemente de que el portal esté técnicamente listo.

## 13. Notificaciones

Por `sendNotification()` de Apps Script, desde `desarrollos@colegiotilata.edu.co`. Destinatarios: los correos de `family_members`.

| Evento | Destinatario | Contenido |
|---|---|---|
| Confirmación de inscripción | Familia | Actividad, días, transporte declarado, valor |
| Reubicación con recálculo | Familia | Actividad y valor, antes y después |
| Actividad que no abre | Familia | Cerrada por no alcanzar el mínimo |
| Retiro | Familia + Tesorería | Estudiante, actividad, fecha efectiva |

## 14. Reportes

**Pasajeros por día de la semana**, al cerrar inscripciones. Es el dato que el operador necesita para armar rutas. Debe existir desde la primera temporada.

**Proyectado contra ejecutado**, al cerrar temporada. Calibra la tarifa unitaria de la siguiente.

**Sesiones proyectadas contra dictadas.** Única forma de saber si el costeo funcionó.

**Cobertura de los conceptos de temporada.** Cuantifica el faltante o excedente de 5.11.

## 15. Riesgos y deuda conocida

| # | Riesgo | Comentario |
|---|---|---|
| 1 | `hr_non_work_days` se une por cadena, no por `year_id` | Verificado funcionando hoy. Una cadena mal escrita rompería el conteo en silencio |
| 2 | No existe tabla canónica de días lectivos | Infraestructura institucional, no subproducto de este módulo |
| 3 | Calendario laboral incompleto | Se materializó en DEV para 2026-2027 y se resolvió el 30 de julio de 2026. Inflaría precios. Validación 6 |
| 4 | Cobertura parcial de los costos de temporada | Decisión tomada (5.11). Monitoreado con el reporte de cobertura |
| 5 | Precios acoplados | Obliga a publicar la oferta completa de una vez |
| 6 | Autodeclaración de la vinculación | Riesgo financiero, no operativo |
| 7 | `audit_log.user_display_name` registra `'DB: postgres'` | Deuda sistémica del sistema |
| 8 | Denormalización en `enrollment_days` | Mitigado por el disparador y las llaves compuestas |
| 9 | Nombre `Extracurriculares` inutilizable | Sin impacto funcional |
| 10 | Reactivación de inscripciones | Puede fallar si el día fue tomado. El fallo es correcto, necesita mensaje claro |
| 11 | Las seis validaciones de publicación son de la aplicación | Sección 9 |
| 12 | El desglose no suma el total | Por el redondeo hacia arriba. `activities.html` debe mostrar la línea de ajuste |
| 13 | Tarifario con una sola capacidad activa | La tabla de referencia pierde su propósito comparativo. Sin pantalla de administración |
| 14 | Divergencia DEV/PROD en datos | Costó **cinco** diagnósticos errados entre la v1.3 y la v1.4. Indicar el proyecto en la consulta no basta: hay que verificar el host de la petición |
| 15 | Reglas de calendario duplicadas | `generar-dias-tilata.html` conserva su copia de festivos y recesos. Migrar a `calendario-escolar.js` |
| 16 | `conceptoAplica()` duplica `ecConceptoAplica()` | `activities.html` necesita decidir qué conceptos mostrar antes de que exista cálculo. Si divergen, la pantalla pide valores que el motor ignora |
| 17 | Dos fuentes de superávit apiladas | Prorratear sobre mínimos en vez de inscritos reales, más el redondeo hacia arriba. Ninguna es un error, pero quien apruebe los precios ante el Consejo Directivo debería poder explicar de dónde sale el excedente |
| 18 | El motor no rechaza una actividad sin días | Devuelve `0` sesiones, no error. Mitigado en `activities.html`, no en el motor |
| 19 | `system_config.current_academic_year_id` desalineado entre ambientes | Hace que `generar-dias-tilata.html` opere sobre el año equivocado sin avisar |
| 20 | ~~El candado de reversa cuenta inscripciones sin filtrar por estado~~ | **Resuelto en la v1.9.** Cuatro reglas, todas probadas. Secciones 3.4 y 6.4 |
| 21 | No existe bitácora de transiciones de temporada | `delivered_at` cubre el único caso que el candado necesita. El resto de las transiciones no deja rastro: no se sabe quién cerró inscripciones ni cuándo se reabrieron. Sin impacto hoy; sería trabajo si alguna vez hay que auditar el flujo |
| 24 | El paso 7 del flujo no tiene pantalla | Cerrar las actividades que no alcanzaron el mínimo y reubicar a sus estudiantes es trabajo **actividad por actividad**, no un botón de temporada. No pertenece a `seasons.html` y todavía no está construido en ninguna parte |
| 25 | El cierre de inscripciones depende de que alguien se acuerde | Mitigado con el aviso de ventana vencida (6.4), que no bloquea. No hay tareas programadas en la plataforma |
| 22 | La función queda expuesta por RPC con la `anon key` | No empeora el estado actual de la plataforma, donde RLS está desactivado en todas las tablas. Se documenta para que sea una decisión y no un descubrimiento. Sección 7.6 |
| 23 | El `DataBase.md` del proyecto se desactualiza en silencio | Tenía el esquema previo a la fase 1 y ninguna tabla de la fase 2. Verificar contra `information_schema`, no contra el archivo. Sección 3.5 |

## 16. Bitácora de decisiones

### 16.1 Cerradas en la v1.1

| # | Decisión | Resolución |
|---|---|---|
| 1 | ¿`virtual_day` cuenta como sesión? | No. Excluido por la fórmula |
| 2 | Cobertura del faltante | El colegio lo asume |
| 3 | Ícono y color | `bi-palette`, `#993556` |
| 4 | ¿Tope de actividades? | No. El límite es la regla de no cruce |
| 5 | Formato del nombre | `2026-2027 I` / `II`, con único |
| 6 | Retiro posterior a `delivered` | Nota crédito en Phidias, sin reversa |
| 7 | Portal de familias | Diferido. Modelo de datos completo igual |
| 8 | Tipo de `published_by` | `uuid` con FK a `users(user_id)` |
| 9 | Perfiles que reciben permisos | Los asigna administración |
| 10 | Datos existentes | Eliminados. Tarifas conservadas |
| 11 | Reversibilidad de estados | Todas salvo `published → draft` con inscripciones |
| 12 | Días ocupados en `not_opened` | Se liberan, por disparador |

### 16.2 Cerradas en la v1.2 (construcción del modelo de datos)

| # | Decisión | Resolución |
|---|---|---|
| 13 | Ámbito temporada + base sesión | **Prohibido** por restricción |
| 14 | Cierre de inscripciones posterior al inicio | **Permitido**, sin restricción de base |
| 15 | `cycle_id` en `activity_costs` | **Agregado**, para impedir cruce de temporadas |
| 16 | `activity_id` en `enrollment_days` | **Agregado**, para impedir días fantasma |
| 17 | ¿Atar asistencia a `enrollment_days`? | **No.** Los datos volátiles no anclan a los permanentes |
| 18 | Índice por fecha en asistencia | **Agregado** |
| 19 | Andamiajes de unicidad | Tres restricciones exigidas por PostgreSQL |
| 20 | Registro del módulo en el sidebar | Debe ir en `SIDEBAR_LAYOUT`, no solo en `SIDEBAR_MODULE_ORDER` |

### 16.3 Cerradas en la v1.3 (construcción del motor y `seasons.html`)

| # | Decisión | Resolución |
|---|---|---|
| 21 | ¿Cálculo de sesiones en JS o en Postgres? | **JavaScript**, consistente con el stack y sin objeto que replicar |
| 22 | ¿`activities.html` muestra precio estimado? | **Sí**, de solo lectura. Decidir un mínimo a ciegas es incómodo |
| 23 | Consecuencia de 21 y 22 | Motor en **archivo compartido** desde el principio |
| 24 | ¿El cálculo se dispara al marcar un día? | **No.** Paso aparte, revisable antes de guardar |
| 25 | Unidad de redondeo | **Miles de pesos** |
| 26 | ¿Dónde se aplica el redondeo? | **Hacia arriba, sobre el total**, no sobre los aportes |
| 27 | Validación 6 de publicación | Calendario laboral cargado. Agregada tras detectar el hueco en DEV |
| 28 | ¿Dónde se muestran los avisos del motor? | **Dentro del panel**, no en `alertContainer` |
| 29 | Orden de construcción de pantallas | `cost-concepts` → `activities` → cerrar `seasons` → `enrollments` |

### 16.4 Cerradas en la v1.4 (`cost-concepts.html` y `activities.html`)

| # | Decisión | Resolución |
|---|---|---|
| 30 | ¿Qué actividades entran al divisor de los conceptos de temporada? | Las de estado **`offered`**. Las de `draft` quedan fuera: una actividad a medio armar no puede mover el precio de las demás. Coherente con 5.11: `not_opened` y `cancelled` ocurren después de congelar y tampoco lo tocan |
| 31 | ¿`draft → offered` requiere que la actividad esté completa? | **Sí**: días, grados y cupos válidos. Es la defensa contra el hueco del motor con cero sesiones |
| 32 | ¿Los conceptos sin valor bloquean pasar a `offered`? | **No.** Ofertar es una decisión de alcance; digitar costos es trabajo posterior. Solo bloquea publicar |
| 33 | ¿Dónde se guardan las semanas de receso? | **En ninguna tabla.** Se calculan en `calendario-escolar.js`. `hr_non_work_days` es de nómina y su vocabulario no admite un hecho del calendario estudiantil |
| 34 | ¿Cómo se dice "usa el valor por defecto"? | **Borrando la fila** de `activity_costs`. La llave primaria es `(activity_id, concept_id)` y `concept_value` va `NOT NULL`. Vaciar el campo borra; cero es un costo que no se cobra |
| 35 | ¿`applies_to_modality` en conceptos de ámbito temporada? | **Forzado a nulo** por la pantalla. El motor no distingue por ámbito y lo filtraría |
| 36 | ¿El selector de grados filtra por año académico? | **No.** La nota de la v1.3 era falsa. Ver sección 7.4 |
| 37 | ¿Dónde se muestra el ajuste por redondeo? | **Línea propia en el desglose**, no diluido en el total. Es dinero que alguien tiene que poder explicar |
| 38 | ¿`activities.html` guarda el precio calculado? | **No.** Es estimación de solo lectura; `frozen_price` se escribe al publicar |

### 16.8 Cerradas en la v1.9 (transiciones de estado)

| # | Decisión | Resolución |
|---|---|---|
| 64 | ¿El cierre de inscripciones es automático por fecha? | **No, manual.** La fecha ya cierra el portal por sí sola dentro de la función; el estado es una declaración de coordinación. Automatizarlo dejaría a coordinación sin poder registrar el caso tardío al día siguiente |
| 65 | ¿`delivered_at` se limpia al revertir? | **Nunca.** Registra que la temporada *estuvo* entregada, no que lo esté. Una columna que se limpia no responde la pregunta del candado |
| 66 | ¿`delivered_at` se sobrescribe si se entrega dos veces? | **No.** Conserva la fecha de la primera entrega |
| 67 | ¿Dónde viven las transiciones? | En un **mapa declarativo** `TRANSICIONES`, no en condicionales dispersos. Agregar un estado es agregar una entrada |
| 68 | ¿La reversa a borrador entra al mapa? | **No.** Tiene cuatro reglas propias y un candado que consulta la base; el resto son un solo `PATCH` |
| 69 | ¿Qué hacer cuando la ventana venció y nadie cerró? | **Avisar, no bloquear.** Aviso ámbar con los días transcurridos y lo que queda trabado por no haber cerrado |
| 70 | ¿El paso 7 es un botón de temporada? | **No.** Cerrar actividades sin mínimo y reubicar es trabajo actividad por actividad. Queda fuera de `seasons.html` |

### 16.7 Cerradas en la v1.8 (prueba de `enrollments.html` y función transaccional)

| # | Decisión | Resolución |
|---|---|---|
| 53 | ¿La función recibe los valores congelados o los deriva? | **Los deriva.** Quien llama no envía dinero. Es lo que impide que el portal calcule por su cuenta |
| 54 | ¿La ventana de inscripción se comporta distinto según el canal? | **Sí.** `admin` pasa con advertencia, cualquier otro canal rechaza. Consecuencia aceptada: la familia que llega tarde llama al colegio |
| 55 | ¿Cómo se escribe la regla del canal? | **"Distinto de `admin`"**, no "igual a familia". Un canal nuevo nace bloqueado, no permitido |
| 56 | ¿Una función de base puede advertir? | **No, pero puede devolver la advertencia.** El texto vive en la función, no en cada llamador, para que no diverja cuando existan dos |
| 57 | ¿Dónde vive la validación de grado? | **En la función.** Un filtro de interfaz no defiende nada frente a una llamada por RPC |
| 58 | ¿Se agrega `enrolled_by`? | **Sí**, antes de escribir la función para no cambiarle la firma después. Nulo, porque el portal no lo tendrá |
| 59 | ¿Cómo se identifica al estudiante activo? | Por **`student_status.status_code = 1`**, no por uuid: los catálogos pueden no coincidir entre ambientes |
| 60 | ¿Qué hace la función si un día no tiene `sessions_count`? | **Rechaza.** `SUM()` ignora los nulos y devolvería menos sesiones de las reales, congeladas y sin rastro |
| 61 | ¿Se conservan las ramas viejas de `traducirError()`? | **Sí**, como red por si algo escribe directo a las tablas sin pasar por la función |
| 62 | ¿La reversa a borrador debe permitirse con inscripciones anuladas? | **Sí, con advertencia**, salvo que la temporada haya estado en `delivered`. Pendiente de implementar: requiere `delivered_at`. Sección 3.4 |
| 63 | ¿Qué queda de `enroll_student` en el portal? | **Una envoltura delgada** más la verificación de pertenencia del estudiante a la familia autenticada, que la función no puede hacer |

### 16.6 Cerradas en la v1.6

| # | Decisión | Resolución |
|---|---|---|
| 44 | ¿El módulo decide qué se cobra a quien se inscribe tarde? | **No.** La facturación es de Tesorería, en Phidias. El módulo registra y entrega |
| 45 | ¿Qué guarda `frozen_sessions` en una inscripción tardía? | **Las sesiones de la temporada**, que son las del precio congelado. La fecha de inscripción permite derivar las restantes |

### 16.5 Cerradas en la v1.5 (etapa 4 de `seasons.html`)

| # | Decisión | Resolución |
|---|---|---|
| 39 | ¿Séptima validación de publicación? | **Agregada:** al menos una actividad en la oferta. Sin ella las seis anteriores pasan por vacuidad |
| 40 | ¿Qué se escribe primero al publicar, precios o estado? | **Los precios.** Si falla a mitad, la temporada sigue en borrador y se reintenta. Al revés quedaría publicada con actividades sin precio, estado sin salida limpia |
| 41 | ¿La reversa borra los `frozen_price`? | **Sí.** Un precio congelado en una temporada que volvió a borrador es un número que nadie sabría si sigue vigente |
| 42 | ¿Dónde vive la lista de verificación? | **Visible siempre** en la tarjeta de publicación, no como alerta al fallar. El botón se deshabilita mientras alguna falle |
| 43 | Tarifario de transporte | **Cerrada.** Tiene pantalla en `config.html`, no se vincula al año académico y no necesita hacerlo. Ver 3.2 |
| 46 | ¿Temporadas en borrador en el selector de inscripciones? | **No aparecen.** Sin precios congelados no hay nada que copiar a la inscripción |
| 47 | ¿Qué estados de temporada admiten altas? | **Solo `published`.** Los demás quedan de consulta: mover a alguien después de cerrar inscripciones desordena lo entregado |
| 48 | ¿Bloquear fuera de la ventana de inscripción? | **No, advertir.** El canal administrativo existe para los casos que la ventana pública no cubre |
| 49 | ¿Qué hacer si fallan los días tras crear la inscripción? | **Deshacerla en el acto.** La 7.5 dice que es recuperable, y lo es, pero ocupa cupo sin ocupar día. Si el deshacer también falla, se dice explícitamente |
| 50 | ¿Motivo de retiro obligatorio? | **Sí en la pantalla**, aunque la columna admita nulo. Un retiro sin explicación es un registro que nadie sabrá interpretar después |
| 51 | ¿Dónde se resuelve el cobro de quien entra tarde? | **En Tesorería.** La pantalla lo dice en texto, para que quien registra no espere que el sistema lo resuelva |
| 52 | Inscripción por función de base de datos | **Sí**, tras probar la pantalla. Ver 2.1.1 |

## 17. Anexo — Ejemplo numérico

> **⚠️ VALORES DE EJEMPLO, NO DATOS REALES.** Las cifras de este anexo se construyeron para ilustrar el modelo de costeo y **no corresponden a la parametrización del colegio**. En particular, la tabla de tarifas de transporte de abajo no refleja `svc_transport_rates_extracurricular`, que hoy tiene una sola capacidad activa (24 pasajeros a $260.000). Ver sección 3.2 de la Parte I.

**Temporada:** 2026-2027 I. Días: lunes, miércoles, jueves.
**Sesiones:** lunes 18, miércoles 19, jueves 17.

**Conceptos de costo:**

| Concepto | Ámbito | Base temporal | Reparto | Valor |
|---|---|---|---|---|
| Honorarios instructor | actividad | sesión | prorrateo | $180.000 |
| Refrigerio instructor | actividad | sesión | prorrateo | $12.000 |
| Coordinador | temporada | temporada | prorrateo | $3.000.000 |
| Recordatorios | temporada | temporada | por estudiante | $35.000 |

**Oferta:** 12 actividades, mínimo 10 cada una → suma de los mínimos = **120**.

**Actividad "Ajedrez"** — lunes y jueves, instructor, mínimo 10. Sesiones = **35**

| Concepto | Cálculo | Aporte |
|---|---|---|
| Honorarios instructor | $180.000 × 35 ÷ 10 | $630.000 |
| Refrigerio instructor | $12.000 × 35 ÷ 10 | $42.000 |
| Coordinador | $3.000.000 ÷ 120 | $25.000 |
| Recordatorios | $35.000 × 1 | $35.000 |
| | **Precio** | **$732.000** |

**Tarifas de transporte de ejemplo:** vinculada $15.650, no vinculada $19.000.

| Opción | Cálculo | Valor |
|---|---|---|
| 1 — Sin transporte | $732.000 | **$732.000** |
| 2 — Vinculada | $732.000 + ($15.650 × 35) | **$1.279.750** |
| 3 — No vinculada | $732.000 + ($19.000 × 35) | **$1.397.000** |

> **Verificado en la prueba del disparador:** una inscripción sembrada con estos valores devolvió `frozen_activity_price + (frozen_sessions × frozen_transport_rate_linked) = 1279750`, sin consultar temporada ni actividad.

**Actividad "Cerámica"** — solo miércoles, alianza con tercero ($240.000 por estudiante), mínimo 12. Sesiones = **19**. No aplican honorarios ni refrigerio.

| Concepto | Cálculo | Aporte |
|---|---|---|
| Tarifa del tercero | $240.000 × 1 | $240.000 |
| Coordinador | $3.000.000 ÷ 120 | $25.000 |
| Recordatorios | $35.000 × 1 | $35.000 |
| | **Precio** | **$300.000** |

| Opción | Cálculo | Valor |
|---|---|---|
| 1 — Sin transporte | $300.000 | **$300.000** |
| 2 — Vinculada | $300.000 + ($15.650 × 19) | **$597.350** |
| 3 — No vinculada | $300.000 + ($19.000 × 19) | **$661.000** |

Un estudiante en Ajedrez (lunes y jueves) y Cerámica (miércoles) **no se cruza** y paga ambos.

**Caso de redondeo** — mínimo 7, un día de 18 sesiones, sin refrigerio:

| Concepto | Cálculo | Aporte |
|---|---|---|
| Honorarios instructor | $180.000 × 18 ÷ 7 | $462.857 |
| Coordinador | $3.000.000 ÷ 7 | $428.571 |
| Recordatorios | $35.000 × 1 | $35.000 |
| | Suma de aportes | $926.428 |
| | **Precio publicado** | **$927.000** |
| | Ajuste por redondeo | $572 |

**Cobertura del coordinador (5.11):**

| Escenario | Inscritos | Recaudo | Costo | Diferencia |
|---|---|---|---|---|
| Todas abren, al mínimo | 120 | $3.000.000 | $3.000.000 | $0 |
| Dos no abren | 100 | $2.500.000 | $3.000.000 | **−$500.000** |
| Todas abren, por encima del mínimo | 150 | $3.750.000 | $3.000.000 | **+$750.000** |

---

*Fin del documento.*
