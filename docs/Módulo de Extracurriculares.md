# Bitácora — Portal de Familias (SchoolNet)

**Versión:** 3.0
**Fecha de corte:** 3 de agosto de 2026
**Reemplaza a:** la v2.0 del 31 de julio de 2026
**Estado general:** **La inscripción a extracurriculares por el portal está construida y probada de punta a punta en DEV.** Autenticación, oferta filtrada por grado, inscripción con congelamiento de valores, correo de confirmación e interfaz completa. Falta la prueba en producción y la parametrización de la temporada real.

---

## 0. Qué pasó entre la v2.0 y esta versión

En una sesión del 3 de agosto de 2026 se construyó y probó todo el camino de inscripción:

| Pieza | Estado |
|---|---|
| `get_portal_data` — oferta + inscripciones en una petición | ✅ probado |
| `enroll_student` con verificación de pertenencia | ✅ probado en 4 caminos |
| `get_my_enrollments` | ✅ probado |
| Correo de confirmación de inscripción | ✅ probado |
| Interfaz completa de inscripción en `families.html` | ✅ probada |
| Optimización de rendimiento: 16 lecturas → 7 | ✅ 14 s → 5 s |

**Lo que falta ya no es construcción**, es despliegue y parametrización. Ver la sección 8.

## 0.1 Por qué la v2.0 reenfocó el documento

La bitácora anterior se escribió cuando el portal existía para mostrar **planeadores por grado**. Ese sigue siendo un objetivo válido, pero pasó a segundo lugar por dos razones:

**Una fecha.** La temporada `2026-2027 I` de extracurriculares abre inscripciones el **10 de agosto de 2026**. Sin portal, todas las inscripciones las carga coordinación a mano, una por una, desde `enrollments.html`.

**Y un bloqueo que se levantó.** Los planeadores siguen esperando una decisión institucional que no depende de desarrollo: hoy `pln_planners.planner_status` solo admite `active/archived/deleted`, sin estado de aprobación, así que mostrar los activos incluiría borradores del docente. Extracurriculares, en cambio, ya tiene todo lo que necesita del lado del servidor.

**Lo construido hasta ahora no se pierde ni se rehace.** La autenticación por OTP, las sesiones, la resolución correo → familia → hijos y toda la arquitectura de seguridad son exactamente las mismas. Lo que cambia es qué se pinta en el dashboard.

---

## 1. Propósito

Portal **público** para que las familias del Colegio Tilatá:

1. **Inscriban a sus hijos en actividades extracurriculares** — objetivo inmediato.
2. Consulten los planeadores del grado de sus hijos — diferido, sección 9.

Sin usuarios ni login tradicional: acceso por **correo + código de un solo uso (OTP)**.

- URL: `schoolnet.colegiotilata.edu.co/families.html` (archivo en la **raíz** del repo `sistema_next`).
- No confundir con `modules/config/families.html`, que es la página **interna** de administración de familias.

---

## 2. Arquitectura y decisión de seguridad clave

*Sin cambios respecto de la v1. Se conserva completa porque es la base de todo lo demás.*

El portal es público y **no puede** hablar con Supabase directamente: `config.js` lleva la `anon key`, RLS está desactivado en toda la plataforma, y exponerla en un portal público permitiría leer los datos de todas las familias.

**Solución adoptada:** un **intermediario en Google Apps Script (GAS)** que guarda la `service_role key` del lado servidor —nunca en el navegador— y expone endpoints estrechos. El portal solo habla con GAS; **jamás carga `config.js` ni ninguna llave de Supabase**.

```
portal (families.html) → GAS Web App → Supabase (service_role)
```

Se descartó activar RLS por familia (choca con el modelo sin-login) y se descartó un backend en Vercel (el equipo ya domina GAS y el correo ya vive ahí).

> **Por qué esta arquitectura importa todavía más ahora.** El formulario público de admisiones sí habla directo con Supabase, porque solo inserta y nunca lee. Extracurriculares necesita leer *qué hijos tiene esta familia* y *qué actividades admiten su grado*, y hacerlo con `anon key` sin RLS expondría la base de estudiantes completa.

---

## 3. Lo que ya funciona (base heredada)

Probado de punta a punta en **DEV**:

| Pieza | Estado |
|---|---|
| Solicitud de código → correo llega | ✅ |
| Verificación de código → token + sesión de 1 h | ✅ |
| Código de un solo uso (se marca `used`) | ✅ |
| Dashboard: un botón por hijo con su nombre | ✅ |

### 3.1 Tablas del portal

| Tabla | DEV | PROD |
|---|---|---|
| `family_members` | ✅ | ✅ |
| `portal_access_codes` | ✅ | ✅ |
| `portal_sessions` | ✅ | ✅ |

> **Las dos tablas no existían en NINGÚN ambiente hasta el 31 de julio de 2026**, pese a que la bitácora de julio las daba por creadas en DEV. Se recrearon en ambos. Ver el hallazgo de la sección 7.5, que explica por qué el fallo pasó inadvertido semanas.

`family_members` — modelo 1:N, una familia con varios familiares (se evitó el patrón padre/madre por familias con dos madres o dos padres). Columnas: `family_member_id` (uuid PK), `family_id` (uuid, FK → `families.family_id`, ON DELETE CASCADE), `relationship`, `full_name`, `phone`, `email`, `is_primary`, `display_order`, `member_status`, `created_at`, `updated_at`.

Carga inicial: **289 familias / 574 familiares** en DEV y PROD.

`portal_access_codes` — `code_id`, `email`, `code_hash` (SHA-256), `expires_at`, `used`, `used_at`, `attempts`, `created_at`.

`portal_sessions` — `session_id`, `token_hash` (SHA-256, único), `email`, `expires_at`, `revoked`, `created_at`.

Las tres con RLS deshabilitado explícitamente.

### 3.2 Endpoints de acceso en GAS

Enrutados por `action` en `doPost`:

- **`request_code`** — recibe correo, valida contra `family_members` activo, genera código de 6 dígitos, lo guarda hasheado, invalida los anteriores y lo envía por `MailApp`. Respuesta **siempre neutra**: no revela si el correo existe.
- **`verify_code`** — valida contra el hash; controla expiración, `used` e intentos. Si es correcto marca el código usado y crea sesión, devolviendo `{ ok, token, expires_at }`.
- **`get_children`** — valida el token y devuelve los hijos. La resolución vive en el helper `hijosDelCorreo()`, que comparten todos los endpoints: correo → `family_members` → `families` → `students` (solo activos, `status_code = 1`), incluyendo hijos de **todas** las familias asociadas al correo. Devuelve `student_id` además del código, porque es lo que recibe `fn_extracurricular_enroll`.

Parámetros: `CODE_LENGTH = 6` · `CODE_TTL_MINUTES = 10` · `MAX_ATTEMPTS = 5` · `RESEND_COOLDOWN_SECONDS = 60` · `DAILY_CAP = 10` · `SESSION_TTL_MINUTES = 60`.

### 3.3 El portal (`families.html`, en la raíz)

Página autónoma con Bootstrap 5 por CDN, **sin `config.js`**. Logo y colores corporativos hardcodeados: primario `#1b365d`, secundario `#efefef`, terciario `#3d6199`, en variables CSS `--brand-*`.

Tres estados en una sola página: **correo** → **código** → **dashboard**. El `sessionToken` vive **solo en memoria**, nunca en `localStorage`.

Transporte: `request_code` va en `mode: 'no-cors'` (fire-and-forget, mensaje neutro siempre); `verify_code` y `get_children` van con `fetch` normal y `Content-Type: text/plain;charset=utf-8` para evitar el preflight.

---

## 4. Lo que cambió del lado de extracurriculares

**Todo el trabajo pesado ya está hecho, y no en el portal.** La v1.8 de la especificación de extracurriculares construyó `fn_extracurricular_enroll`, una función de base de datos que:

- recibe estudiante, actividad, opción de transporte, canal y correo declarante;
- **deriva** precio, tarifas y sesiones — quien llama no envía ningún valor de dinero;
- corre catorce validaciones, incluidas temporada publicada, actividad ofertada, grado admitido y no cruce de días;
- inserta inscripción y días **en una sola transacción**, deshaciendo todo si algo falla;
- devuelve la inscripción creada más un arreglo de advertencias.

**Y tiene una regla escrita pensando exactamente en este portal:**

| Canal | Fuera de la ventana de inscripción |
|---|---|
| `admin` | Pasa, con advertencia |
| Cualquier otro | **Rechazo** |

La condición está escrita como *"distinto de `admin`"*, no como *"igual a familia"*, de modo que el portal no puede saltarse la ventana ni por error de configuración.

> **Consecuencia de esto para el alcance del portal:** `enroll_student` dejó de ser una segunda implementación completa de la lógica de inscripción. Se reduce a verificar pertenencia y llamar una función. Es la razón principal por la que el portal pasó de ser trabajo grande a trabajo acotado.

---

## 5. Endpoints — construidos y probados

### 5.1 `get_portal_data` — el que usa el portal

**Una sola petición** que devuelve la oferta y las inscripciones vigentes.

Nació de una medición: los dos endpoints separados tardaban 7,7 s y 6,1 s, y cada uno resolvía los hijos por su cuenta con las mismas cuatro consultas. Combinados y con las lecturas anidadas, el total bajó a **5 s**.

```
{ ok, offer: { season, children[] }, enrollments[] }
```

Los endpoints individuales `get_extracurricular_offer` y `get_my_enrollments` siguen existiendo: sirven para diagnosticar sin ruido.

### 5.2 Qué devuelve la oferta

Por cada hijo, **solo las actividades que admiten su grado**, y de cada una:

| Campo | Para qué |
|---|---|
| `days`, `sessions` | Lo que la familia necesita ver |
| `cupos_libres`, `lleno` | Cupo restante |
| `conflict` | `{ day, activity }` cuando choca con un día ya ocupado |
| `options` | Los **tres** precios totales ya calculados |

**Las actividades donde el hijo ya está inscrito no se ofrecen.** Ofrecerlas produce un rechazo evitable, y marcarlas como "choca con Minichef" sobre la tarjeta de Minichef es incomprensible. Fue un defecto real, detectado en pruebas.

**No devuelve el desglose de costos.** Ahí viven honorarios del instructor, materiales y el margen institucional. La familia ve el precio final y sus tres opciones; publicar el desglose sería un problema institucional, no técnico.

### 5.3 `enroll_student`

Envoltura delgada sobre `fn_extracurricular_enroll`:

```
1. validarSesion(token) → correo autenticado
2. hijosDelCorreo(email)
3. VERIFICAR que el student_id recibido está en esa lista   ← crítico
4. RPC a fn_extracurricular_enroll con p_channel = 'portal'
5. enviar correo de confirmación (sin lanzar si falla)
6. devolver { ok, enrollment_id, total_value, warnings } o el error traducido
```

> **El paso 3 es lo único que este endpoint defiende por su cuenta.** `fn_extracurricular_enroll` no recibe el correo autenticado —solo el declarado— así que no puede saber si el estudiante pertenece a quien pide. Sin esa verificación, cualquiera con sesión válida podría inscribir a un estudiante ajeno enviando otro `student_id`. **Probado:** con el `student_id` de una estudiante de otra familia, devuelve `forbidden` y no escribe nada.

> **`p_declared_by_email` sale de la sesión, nunca del cuerpo de la petición.** Si viniera del navegador dejaría de ser evidencia de quién inscribió y sería un texto que cualquiera escribe.

**El canal es `portal`**, verificado contra la restricción `CHECK` de `enrollment_channel`, que admite exactamente `portal` y `admin`. La regla de ventana de la función está escrita como *"distinto de `admin`"*, así que `portal` cae del lado del rechazo fuera de plazo.

**Los mensajes de error de la base pasan tal cual.** Los `RAISE` de `fn_extracurricular_enroll` llegan ya redactados para el usuario final; `mensajeDeError()` los extrae del JSON de PostgREST y los devuelve sin reemplazarlos por un genérico.

### 5.4 Guion de prueba ejecutado

Todo contra DEV, el 3 de agosto de 2026. Se conserva como guion de regresión.

| # | Caso | Resultado | ✓ |
|---|---|---|---|
| 1 | Oferta antes de abrir la ventana | `season: null`, `reason: not_yet` | ✅ |
| 2 | Oferta con ventana abierta | Tres actividades con sus tres precios | ✅ |
| 3 | Los totales de la oferta contra los de la inscripción | **Coinciden exactamente** | ✅ |
| 4 | `conflict` tras inscribir en una actividad de miércoles | La de lunes+miércoles queda marcada | ✅ |
| 5 | Actividad donde ya está inscrito | Desaparece de la oferta | ✅ |
| 6 | Inscripción normal | `ok: true`, valores congelados | ✅ |
| 7 | **Inscribir a un estudiante ajeno** | `forbidden`, cero filas escritas | ✅ |
| 8 | Cruce de días | Mensaje de la base, tal cual | ✅ |
| 9 | Ventana cerrada por canal `portal` | Rechazo, **antes** que el duplicado | ✅ |
| 10 | Correo de confirmación | Llega con la tabla de datos | ✅ |

> **Sobre el caso 3.** Es la verificación que más importa: el precio que ve la familia lo calcula JavaScript en GAS, y el que se congela lo calcula PL/pgSQL en la base. Son dos implementaciones independientes de la misma aritmética. Que den el mismo número —$678.400 en la prueba— es lo que garantiza que la familia no vea un precio y se le cobre otro.

## 6. Decisiones — resueltas

| # | Decisión | Resolución |
|---|---|---|
| 1 | Literal de `enrollment_channel` | **`portal`.** Verificado contra el `CHECK`, que admite `portal` y `admin` |
| 2 | ¿`get_children` devuelve `student_id`? | **Sí.** La función recibe `student_id` (entero), no `student_code`. Exponerlo es irrelevante para la seguridad: la verificación de pertenencia es la que defiende |
| 3 | ¿Quién manda el correo de confirmación? | **El mismo GAS del portal, con `MailApp`**, igual que el código de acceso. No cruza proyectos ni depende del GAS de notificaciones de SchoolNet |
| 4 | ¿Qué ve la familia si no hay temporada abierta? | **Cinco mensajes distintos**: sin temporada, sin ventana definida, ventana no abierta, ventana cerrada, sin hijos. El de ventana cerrada dice que se comunique con el colegio |
| 5 | ¿Un hijo puede inscribirse en varias actividades? | **Sí, sin tope.** El cruce de días ya limita naturalmente al número de días habilitados. Poner un máximo menor sería inventar una política que nadie pidió |
| 6 | ¿El transporte tiene opción por omisión? | **No.** El botón queda deshabilitado hasta que la familia elija. Es la decisión con consecuencia económica: un valor por omisión se acepta sin mirar |
| 7 | ¿Se muestra el precio o la diferencia? | **Los tres precios totales**, uno por opción. La familia compara tres cifras completas |
| 8 | ¿Qué pasa si falla el correo de confirmación? | **No se lanza.** La inscripción ya está escrita y es válida; perder el correo es molesto, perder la inscripción por un fallo de correo sería peor |
| 9 | ¿Se recarga todo tras inscribir? | **Sí, desde el servidor.** Una inscripción cambia cupos y días ocupados, y eso afecta la oferta de todos los hijos, no solo del que se inscribió |

### 6.1 Textos acordados con el colegio

La redacción de las opciones de transporte no es cosmética: la familia **declara** algo que después se verifica, y de eso depende el valor a cobrar.

| Opción | Texto |
|---|---|
| `none` | Sin transporte — *La familia lo recoge al terminar.* |
| `linked` | Solicito servicio de ruta y **ya tengo** ruta con el operador oficial del colegio |
| `unlinked` | Solicito servicio de ruta y **no tengo** ruta con el operador oficial del colegio |

Acompañados de dos avisos, en pantalla y en el correo:

- *El colegio verifica con el operador de transporte lo que declares aquí. Si no corresponde, se ajusta el valor a cobrar.*
- *El colegio enviará la factura por el medio acostumbrado. Cualquier inquietud al respecto, por favor contacte a Tesorería.*

> **Por qué el aviso de verificación es explícito.** La opción no vinculada cuesta más, así que la familia tiene incentivo a declarar la barata. Decir de entrada que se verifica es más honesto que descubrirlo después, y probablemente más efectivo.

**Estos textos viven en dos lugares:** la constante `TRANSPORTE` de `families.html` y `TRANSPORTE_TEXTO` del GAS. Si cambian en uno, hay que cambiarlos en el otro.

## 6.2 Lo que el portal NO hace

| Acción | Por qué no |
|---|---|
| **Retirar una inscripción** | El retiro no se expone a las familias. Va por coordinación, con motivo obligatorio |
| **Cambiar la opción de transporte** | La familia declara al inscribirse; el colegio valida contra el operador. Un cambio posterior mueve el valor congelado y debe quedar registrado |
| **Inscribirse fuera de la ventana** | La función lo rechaza por canal. Esos casos van por coordinación |
| **Ver o pagar** | La facturación y el recaudo son de Phidias, fuera del alcance del módulo |

## 7. Bloqueos y hallazgos, en orden de gravedad

### 7.1 La cobertura de `family_members` está incompleta

El documento entregado a IT (`Inconsistencias_BD_Estudiantes_para_IT.md`) reporta:

- **Bloque A:** 26 códigos de familia del CSV que no existen en `families`.
- **Bloque B:** familia 106000 con padres distintos entre "hermanos".
- **Bloque C:** 8 registros con datos de contacto faltantes, ya cargados con lo disponible.

**Mientras eso no se resuelva, esas familias no pueden entrar al portal**, y por el diseño de respuesta neutra de `request_code` **ni siquiera sabrán por qué**: pedirán el código, no llegará, y no habrá mensaje que lo explique.

> Abrir la inscripción por portal con cobertura parcial deja a un grupo de familias sin canal y sin explicación. Es razón suficiente para que coordinación tenga listo el canal administrativo en paralelo, y para avisar por otro medio que quien no reciba el código llame al colegio.

### 7.2 ~~PROD no tiene las tablas del portal~~ — resuelto

Creadas en ambos ambientes el 31 de julio de 2026.

### 7.3 ~~El GAS apunta a DEV~~ — resuelto con dos proyectos

**Hay dos proyectos GAS independientes**, uno por ambiente, con el **mismo código** y distintas Script Properties. El ambiente lo determinan las propiedades, no el archivo.

| Proyecto | `SUPABASE_URL` |
|---|---|
| Portal de Familias | desarrollo (`spjzvpcsgbewxupjvmfm`) |
| Portal de Familias — PRODUCCIÓN | producción (`mrtuerkncqodhakuwjob`) |

**Por qué dos proyectos y no dos implementaciones del mismo:** las Script Properties son del proyecto, no del despliegue. Un solo proyecto tiene un solo `SUPABASE_URL`. Y guardar ambas configuraciones y dejar que la petición elija sería peor: el portal es público, así que cualquiera podría mandar una petición diciendo "soy producción" y escribir en la base real.

`families.html` elige el endpoint **por el nombre del host**, igual que `config.js`. El caso por defecto es desarrollo a propósito: un dominio no previsto debe escribir en la base que no importa.

> **El código debe mantenerse idéntico en los dos proyectos.** Ya pasó una vez que los endpoints nuevos quedaron solo en desarrollo. El ciclo es: pegar en desarrollo, probar, copiar a producción, re-desplegar ambos. `diagnostico()` confirma a qué ambiente apunta cada uno en un segundo.

### 7.5 Hallazgo: los fallos de escritura eran invisibles

**Diagnosticado el 31 de julio de 2026, después de una hora.** Tres defectos apilados hacían que un fallo de base de datos se presentara como un error de CORS:

1. **`supabaseFetch` devolvía `[]` ante cualquier fallo.** Tabla inexistente, llave equivocada, ambiente mal configurado: todo se veía igual que "no hay filas", y la función que llamaba seguía como si nada.
2. **El correo se enviaba antes de confirmar que el código quedó guardado.** Con las tablas inexistentes, la familia recibía un código que no existía en ninguna parte.
3. **Una excepción en `doPost` hacía que Google devolviera su página HTML de error**, servida sin cabeceras CORS. El navegador reportaba un error de CORS que ocultaba la causa real.

Y un cuarto, ajeno al código: **el asunto idéntico en todos los correos hacía que Gmail los agrupara** y escondiera los repetidos, así que era fácil teclear un código viejo creyendo que era el último.

**Los cuatro están corregidos:** `supabaseFetch` lanza si la respuesta no es 2xx, el correo se envía después de confirmar la escritura, `doPost` envuelve todo en `try/catch` y devuelve JSON legible, y el asunto lleva la hora.

> **La lección general:** una capa de acceso a datos que se traga los errores convierte cualquier fallo en un misterio. El costo se paga semanas después y multiplicado.

### 7.6 Hallazgo: `enrollments.cycle_id` no tiene llave foránea

`svc_extracurricular_enrollments` tiene la columna `cycle_id` pero **sin restricción que la respalde**, así que PostgREST no puede resolver la relación hacia `svc_extracurricular_cycles`. Se rodea trayendo la temporada anidada dentro de la actividad, que sí la tiene.

Es una columna que apunta a otra tabla sin integridad referencial. No es urgente, pero conviene revisarlo.

### 7.4 El margen de utilidad debe existir antes de publicar

Ajeno al portal pero con la misma fecha límite. El margen se expresa como un concepto de costo de ámbito actividad, base temporada y reparto por estudiante, y **entra en `frozen_price`, que se congela al publicar**. Si coordinación publica sin él, cada inscripción congela un precio sin utilidad y no hay corrección posible salvo revertir la temporada completa.

---

## 8. Qué falta

La construcción está completa. Lo que queda es despliegue, parametrización y una decisión institucional.

| # | Paso | De quién | Estado |
|---|---|---|---|
| 1 | Copiar el GAS v3 a producción y re-desplegar | Desarrollo | ⚠️ verificar |
| 2 | Publicar `families.html` en producción | Desarrollo | ⚠️ pendiente |
| 3 | **Crear el concepto de margen de utilidad en PROD** | Coordinación | ❌ **antes de publicar la temporada** |
| 4 | Parametrizar la temporada real en PROD | Coordinación | ❌ pendiente |
| 5 | Restaurar la ventana de DEV al 10 de agosto | Desarrollo | ⚠️ hoy abre el 1 de agosto por pruebas |
| 6 | Prueba de punta a punta en producción | Desarrollo | ❌ pendiente |
| 7 | Avisar a las familias de los bloques A y B (7.1) | Coordinación | ❌ pendiente |

> **El paso 3 tiene la fecha límite más dura y no es del portal.** El margen entra en `frozen_price`, que se congela al publicar. Si coordinación publica sin él, cada inscripción congela un precio sin utilidad y no hay corrección posible salvo revertir la temporada completa.

### 8.1 Rendimiento — medido y optimizado

La primera versión tardaba **7,7 s** en las inscripciones y **6,1 s** en la oferta, con los dos endpoints resolviendo los hijos por separado.

| Optimización | Efecto |
|---|---|
| `families` anidada en `family_members` | −1 lectura |
| `student_status` filtrado por relación en vez de consulta previa | −1 lectura |
| Días y grados anidados en las actividades | −2 lecturas |
| Una sola consulta de inscripciones para cupos y para "ya inscrito" | −1 lectura |
| Temporada y días anidados en las inscripciones | −2 lecturas |
| **Un endpoint en vez de dos** (los hijos se resuelven una vez) | −4 lecturas, −1 petición HTTP |

**De 16 lecturas a 7. De ~14 s a 5 s.**

> **Lo que pesa es cuántas peticiones son, no cuántos datos traen.** Cada llamada a Supabase cuesta entre 600 y 800 ms por la ida y vuelta desde los servidores de Google. Bajar de aquí exigiría vistas o funciones en la base, y ahí la complejidad ya no compensa.

> **Ojo con el ambiente al medir:** DEV está en São Paulo y PROD en Ohio. Los tiempos de producción hay que medirlos aparte; no se pueden extrapolar de desarrollo.

## 9. Planeadores — diferido

Sigue siendo el segundo objetivo del portal y no se descarta. Lo que falta no es código:

- **Marca de visibilidad.** `pln_planners.planner_status` solo admite `active/archived/deleted`. Sin un campo tipo `visible_para_familias`, mostrar los activos incluiría borradores del docente. Requiere decisión de coordinación y control en el módulo de Planeación.
- **Qué campos se muestran.** Muchos son internos del docente y no deben exponerse.
- **Cadena verificada:** `students.course_id → courses.grade_id → grades → pln_planners`, filtrando por `system_config.current_academic_year_id`.

---

## 10. Limpieza pendiente

- **Restaurar la ventana de inscripción de DEV al 10 de agosto.** Hoy abre el 1 de agosto para poder probar.
- Borrar `probarMisInscripciones()` y `medirTiempos()` del proyecto GAS de **producción**: llevan un correo escrito y en producción leerían datos reales. En desarrollo son útiles.
- Revisar el vínculo del correo de pruebas en `family_members` de PROD: si no corresponde a una familia real, quitarlo antes de abrir el portal.
- Revertir el correo de prueba `hgmoncadal@gmail.com`, vinculado manualmente a la familia Niño De Toro (`family_code` 105695) en `family_members` de DEV.
- Agregar un `favicon.ico` (hoy da 404, cosmético).

> Las funciones `test_diagnostico` y `test_verify` ya se eliminaron; las reemplaza `diagnostico()`.

---

## 11. Cómo retomar

1. Abrir el proyecto GAS que corresponda con la cuenta corporativa. **Hay dos: uno por ambiente.**
2. **Ejecutar `diagnostico()` desde el editor** antes de tocar nada: dice a qué ambiente apunta y si las tres tablas responden.
3. El portal es `families.html` en la raíz de `sistema_next`. Elige el endpoint por el nombre del host; fuera de producción muestra una cinta amarilla que dice DESARROLLO.
4. Para probar en DEV, usar un correo vinculado en `family_members` **de DEV** — la carga de familiares es distinta en cada ambiente.
5. `medirTiempos()` desde el editor dice cuánto tarda cada parte, sin pasar por el navegador.
6. Los pendientes están en la sección 8. El único con fecha dura es el margen de utilidad.

---

## 12. Principios y aprendizajes

*De la fase anterior, todos vigentes:*

- El portal público **nunca** toca Supabase directo; todo pasa por GAS con `service_role` del lado servidor.
- Códigos y tokens se guardan **hasheados** (SHA-256), nunca en claro.
- Respuesta **neutra** en `request_code` para no revelar qué correos están registrados.
- CORS con GAS: `no-cors` cuando no se lee la respuesta; `text/plain` para evitar el preflight cuando sí se lee.
- **Todo cambio en GAS requiere re-desplegar** para verse desde afuera: Implementar → Gestionar implementaciones → editar → Nueva versión → Implementar. La URL `/exec` no cambia. Las pruebas *dentro del editor* usan el código guardado; las que llegan *desde el portal* usan la versión desplegada.
- En el editor de GAS, Ctrl+F busca **por línea**: anclar ediciones en una sola línea, nunca en bloques multilínea.
- `students.family_id` es entero y referencia `families.family_code`, no el uuid `family_id`.

*De esta fase:*

- **La lógica de negocio vive en la base, no en el intermediario.** GAS autentica, verifica pertenencia y llama. No calcula precios, no valida cruces, no decide ventanas. Cuando la regla cambie, cambia en un solo lugar.
- **El correo autenticado y el correo declarado no son el mismo dato.** El primero sale de la sesión y es evidencia; el segundo viene del navegador y es texto.
- **Un portal que escribe dinero necesita que su ambiente sea evidente.** De ahí los dos proyectos GAS y la cinta amarilla en desarrollo.
- **Una capa de acceso a datos que se traga los errores convierte cualquier fallo en un misterio.** El `[]` silencioso de `supabaseFetch` costó una hora de diagnóstico semanas después de haberse escrito. Sección 7.5.
- **Escribir primero y notificar después.** El correo se envía cuando la escritura está confirmada, no antes.
- **Verificar antes de reintentar.** Cuando una escritura falla con error de transporte, la pregunta no es *"¿reintento?"* sino *"¿qué quedó?"*.
- **Lo que cuesta son las peticiones, no los datos.** Anidar relaciones y combinar endpoints bajó el tiempo de carga de 14 a 5 segundos sin cambiar una sola consulta de fondo.
- **Que dos implementaciones independientes den el mismo número es la prueba que vale.** El precio lo calcula JavaScript para mostrar y PL/pgSQL para congelar; que coincidan es lo que garantiza que la familia no vea un precio y se le cobre otro.
- **En el editor de GAS, un ancla de dos líneas no se encuentra.** Ctrl+F busca por línea. Las ediciones se anclan en una sola, o se entrega el archivo completo.
- **Un archivo recién escrito se entrega completo, no en parches.** El buscar-y-reemplazar tiene sentido en archivos grandes y viejos, donde entregar todo obligaría a revisar qué más cambió. En una página nueva, doce reemplazos manuales son doce oportunidades de que algo salga mal.
