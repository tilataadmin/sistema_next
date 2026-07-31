# Bitácora — Portal de Familias (SchoolNet)

**Versión:** 2.0
**Fecha de corte:** 31 de julio de 2026
**Reemplaza a:** la bitácora del 7 de julio de 2026
**Estado general:** Autenticación por OTP y dashboard de hijos funcionando en DEV. **El propósito del portal cambió:** su primer uso productivo es la **inscripción a extracurriculares**, no la vista de planeadores.

---

## 0. Por qué esta versión reenfoca el documento

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
| `portal_access_codes` | ✅ | ❌ **pendiente** |
| `portal_sessions` | ✅ | ❌ **pendiente** |

`family_members` — modelo 1:N, una familia con varios familiares (se evitó el patrón padre/madre por familias con dos madres o dos padres). Columnas: `family_member_id` (uuid PK), `family_id` (uuid, FK → `families.family_id`, ON DELETE CASCADE), `relationship`, `full_name`, `phone`, `email`, `is_primary`, `display_order`, `member_status`, `created_at`, `updated_at`.

Carga inicial: **289 familias / 574 familiares** en DEV y PROD.

`portal_access_codes` — `code_id`, `email`, `code_hash` (SHA-256), `expires_at`, `used`, `used_at`, `attempts`, `created_at`.

`portal_sessions` — `session_id`, `token_hash` (SHA-256, único), `email`, `expires_at`, `revoked`, `created_at`.

Las tres con RLS deshabilitado explícitamente.

### 3.2 Endpoints existentes en GAS

Enrutados por `action` en `doPost`:

- **`request_code`** — recibe correo, valida contra `family_members` activo, genera código de 6 dígitos, lo guarda hasheado, invalida los anteriores y lo envía por `MailApp`. Respuesta **siempre neutra**: no revela si el correo existe.
- **`verify_code`** — valida contra el hash; controla expiración, `used` e intentos. Si es correcto marca el código usado y crea sesión, devolviendo `{ ok, token, expires_at }`.
- **`get_children`** — valida el token, resuelve correo → `family_members` → `families` → `students` (solo activos, `status_code = 1`), incluyendo hijos de **todas** las familias asociadas al correo. Devuelve `{ ok, children: [{ student_code, name }] }`.

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

## 5. Endpoints nuevos que hay que construir

### 5.1 `get_extracurricular_offer`

**Qué devuelve:** la temporada con inscripciones abiertas y, para cada hijo, las actividades que admiten su grado.

Cadena de resolución: `family_members.email → families → students.family_id → students.course_id → courses.grade_id → grades → svc_extracurricular_activity_grades`.

> **Ojo con las llaves.** `students.student_id` es **entero**, y `students.family_id` es **entero** que referencia `families.family_code`, no el uuid `families.family_id`. La cadena traduce uuid → código vía `families`.

> **El selector de grados no filtra por año académico.** `grades.academic_year_id` no es el año en que el grado existe, sino el **año de graduación proyectado** de la cohorte que hoy lo cursa: Undécimo apunta a 2025-2026 y Prejardín a 2038-2039. Filtrar por el año de la temporada dejaría un solo grado.

**Por cada actividad debe devolver:** nombre, descripción, foto, días de la semana, cupo máximo, inscritos actuales, `frozen_price`, y las **tres opciones de tarifa** ya calculadas —sin transporte, con ruta vinculada, con ruta no vinculada— porque la familia necesita ver un valor firme antes de decidir.

**Por cada hijo debe devolver además los días que ya tiene ocupados** en esa temporada. Sin eso el portal no puede advertir el cruce antes de enviar, y la familia se toparía con un rechazo sin entender por qué.

**Qué NO debe devolver:** nada de otras familias. Ni conteos que permitan inferirlo, más allá del cupo ocupado que ya es público en la práctica.

### 5.2 `enroll_student`

**Envoltura delgada sobre `fn_extracurricular_enroll`**, con una responsabilidad propia que la función no puede asumir.

```
1. validarSesion(token) → correo autenticado
2. resolver los hijos de ese correo (misma cadena de get_children)
3. VERIFICAR que el student_id recibido está en esa lista   ← crítico
4. llamar por RPC a fn_extracurricular_enroll con:
     p_student_id        = el estudiante
     p_activity_id       = la actividad
     p_transport_option  = 'none' | 'linked' | 'unlinked'
     p_channel           = el literal del canal familias
     p_declared_by_email = el correo AUTENTICADO, no uno que venga del navegador
     p_enrolled_by       = null (las familias no tienen user_id)
5. devolver { ok, enrollment_id, total_value, warnings } o el error traducido
```

> **El paso 3 es lo único que el portal debe defender por su cuenta.** `fn_extracurricular_enroll` no recibe el correo autenticado —solo el declarado— así que no puede saber si el estudiante pertenece a quien pide. Sin esa verificación, cualquiera con una sesión válida podría inscribir a un estudiante ajeno enviando otro `student_id`. Es la única brecha real del diseño y vive entera en GAS.

> **`declared_by_email` se toma de la sesión, nunca del cuerpo de la petición.** Si se tomara del navegador, el campo dejaría de ser evidencia de quién inscribió y pasaría a ser un texto que cualquiera escribe.

**Traducción de errores.** La función devuelve mensajes con código `P0001` ya redactados para el usuario final —"El estudiante ya tiene una actividad ese día", "La ventana de inscripción está cerrada"—. GAS debe extraerlos del JSON de PostgREST y pasarlos tal cual, no reemplazarlos por un genérico.

### 5.3 `get_my_enrollments`

Inscripciones vigentes de los hijos de la familia: actividad, días, opción de transporte declarada, valor total y estado.

**Solo las `active`.** Una inscripción anulada no se muestra: la sección 6.1 de la especificación de extracurriculares dice que el retiro no se expone a las familias.

### 5.4 Lo que el portal NO hace

| Acción | Por qué no |
|---|---|
| **Retirar una inscripción** | El retiro no se expone a las familias. Va por coordinación, con motivo obligatorio |
| **Cambiar la opción de transporte** | La familia declara al inscribirse; el colegio valida contra la información del operador. Un cambio posterior mueve el valor congelado y debe quedar registrado |
| **Inscribirse fuera de la ventana** | La función lo rechaza por canal. Esos casos van por coordinación |
| **Ver o pagar** | La facturación y el recaudo son de Phidias, fuera del alcance del módulo |

---

## 6. Decisiones abiertas

### 6.1 El literal del canal — verificación pendiente

`svc_extracurricular_enrollments.enrollment_channel` tiene una restricción `CHECK` cuyos valores admitidos **no se han verificado**. Se sabe que `admin` es válido porque es el valor por defecto y el que usa `enrollments.html`. El literal para el portal —`family`, `portal`, u otro— hay que confirmarlo antes de escribir el endpoint:

```sql
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'svc_extracurricular_enrollments'::regclass
  AND conname LIKE '%channel%';
```

Si el valor que envía GAS no está en la lista, la inscripción falla con un `23514` cuyo mensaje no dice nada útil a la familia.

### 6.2 `get_children` debe devolver también el identificador interno

Hoy devuelve `{ student_code, name }`. `fn_extracurricular_enroll` recibe `p_student_id`, que es `students.student_id` —entero, distinto de `student_code`—. Hay dos caminos:

- **Devolver `student_id`** junto al código. Simple, y no empeora nada: la verificación de pertenencia del paso 3 hace que exponer el identificador sea irrelevante para la seguridad.
- **Resolver por `student_code`** dentro de `enroll_student`. Un salto más, ningún beneficio.

**Recomendación: devolver `student_id`.**

### 6.3 ¿Confirmación por correo?

La sección 13 de la especificación de extracurriculares prevé notificación de confirmación a la familia con actividad, días, transporte declarado y valor. El módulo la envía por `sendNotification()`, que vive en **otro** proyecto GAS.

Hay que decidir si la confirmación la manda el portal con `MailApp` —como ya hace `request_code`— o si se llama al GAS de notificaciones. Lo primero es más simple y no cruza proyectos.

### 6.4 ¿Qué ve la familia si no hay temporada abierta?

Debe verse algo distinto de un error. Tres casos: no hay temporada publicada, hay temporada pero la ventana no ha abierto, o la ventana ya cerró. Los tres merecen mensaje propio, y el tercero debería decir que se comunique con el colegio.

---

## 7. Bloqueos reales, en orden de gravedad

### 7.1 La cobertura de `family_members` está incompleta

El documento entregado a IT (`Inconsistencias_BD_Estudiantes_para_IT.md`) reporta:

- **Bloque A:** 26 códigos de familia del CSV que no existen en `families`.
- **Bloque B:** familia 106000 con padres distintos entre "hermanos".
- **Bloque C:** 8 registros con datos de contacto faltantes, ya cargados con lo disponible.

**Mientras eso no se resuelva, esas familias no pueden entrar al portal**, y por el diseño de respuesta neutra de `request_code` **ni siquiera sabrán por qué**: pedirán el código, no llegará, y no habrá mensaje que lo explique.

> Abrir la inscripción por portal con cobertura parcial deja a un grupo de familias sin canal y sin explicación. Es razón suficiente para que coordinación tenga listo el canal administrativo en paralelo, y para avisar por otro medio que quien no reciba el código llame al colegio.

### 7.2 PROD no tiene las tablas del portal

`portal_access_codes` y `portal_sessions` existen solo en DEV. Sin ellas no hay autenticación posible en producción.

### 7.3 El GAS apunta a DEV

Las Script Properties `SUPABASE_URL` y `SERVICE_ROLE_KEY` apuntan al proyecto de desarrollo.

**Recomendación: un despliegue GAS separado para PROD**, en vez de cambiar las propiedades del mismo. Con un solo proyecto, saber a qué ambiente apunta el portal exige abrir la configuración y leerla; con dos, la URL lo dice. Y una inscripción escrita en el ambiente equivocado es dinero congelado en la base que no es.

### 7.4 El margen de utilidad debe existir antes de publicar

Ajeno al portal pero con la misma fecha límite. El margen se expresa como un concepto de costo de ámbito actividad, base temporada y reparto por estudiante, y **entra en `frozen_price`, que se congela al publicar**. Si coordinación publica sin él, cada inscripción congela un precio sin utilidad y no hay corrección posible salvo revertir la temporada completa.

---

## 8. Plan de construcción

| # | Paso | Depende de |
|---|---|---|
| 1 | Verificar el literal de `enrollment_channel` (6.1) | — |
| 2 | Crear `portal_access_codes` y `portal_sessions` en PROD | — |
| 3 | Despliegue GAS separado para PROD | 2 |
| 4 | `get_children` devuelve `student_id` | — |
| 5 | `get_extracurricular_offer` | 1, 4 |
| 6 | `enroll_student` con verificación de pertenencia | 1, 4 |
| 7 | `get_my_enrollments` | 4 |
| 8 | Interfaz: oferta, selección de transporte, confirmación | 5, 6, 7 |
| 9 | Correo de confirmación (6.3) | 6 |
| 10 | Prueba de punta a punta en DEV con correo controlado | 5–9 |
| 11 | Publicar en PROD | todo |

**Los pasos 1 a 4 son baratos y desbloquean el resto.** Los pasos 5 y 6 son el corazón. El 8 es el que más tiempo consume y el que más se beneficia de que la familia lo pruebe antes.

---

## 9. Planeadores — diferido

Sigue siendo el segundo objetivo del portal y no se descarta. Lo que falta no es código:

- **Marca de visibilidad.** `pln_planners.planner_status` solo admite `active/archived/deleted`. Sin un campo tipo `visible_para_familias`, mostrar los activos incluiría borradores del docente. Requiere decisión de coordinación y control en el módulo de Planeación.
- **Qué campos se muestran.** Muchos son internos del docente y no deben exponerse.
- **Cadena verificada:** `students.course_id → courses.grade_id → grades → pln_planners`, filtrando por `system_config.current_academic_year_id`.

---

## 10. Limpieza pendiente

- Borrar las funciones de prueba `test_diagnostico` y `test_verify` del GAS.
- Revertir el correo de prueba `hgmoncadal@gmail.com`, vinculado manualmente a la familia Niño De Toro (`family_code` 105695) en `family_members` de DEV.
- Borrar las filas `TEST_DIAGNOSTICO` de `portal_access_codes`.
- Agregar un `favicon.ico` (hoy da 404, cosmético).

---

## 11. Cómo retomar

1. Abrir el proyecto GAS con la cuenta corporativa: ahí están `request_code`, `verify_code` y `get_children`.
2. **Confirmar a qué ambiente apuntan las Script Properties** antes de tocar nada.
3. El portal es `families.html` en la raíz de `sistema_next`; `GAS_ENDPOINT` ya apunta al Web App.
4. Para probar en DEV, usar un correo controlado vinculado en `family_members`.
5. Empezar por los pasos 1 a 4 de la sección 8.

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
- **Un portal que escribe dinero necesita que su ambiente sea evidente.** De ahí el despliegue separado por ambiente en vez de propiedades intercambiables.
