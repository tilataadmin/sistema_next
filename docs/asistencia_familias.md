# Levantamiento — Mensajes automáticos de asistencia de familias

**Versión:** 1.0
**Fecha:** 4 de agosto de 2026
**Módulo:** Operación → Asistencia → Asistencia de familias
**Solicitante:** Comité de Liderazgo
**Estado:** Especificación en definición. Sin construcción iniciada.

---

## 1. Propósito

Cuando el colegio convoca a las familias a un encuentro, hoy se registra la asistencia pero no se devuelve nada a la familia. El Comité de Liderazgo pide que el colegio **se manifieste**: que agradezca a quien vino y que le diga a quien no vino que se notó su ausencia.

Dos mensajes por evento, firmados por Rectoría, con suficiente variedad para que no se lean como plantilla automática.

**Lo que el módulo no es:** un mecanismo de control. La ausencia no genera consecuencia, requerimiento ni solicitud de justificación. El tono es de puerta abierta.

---

## 2. Estado actual

`family-activities.html` (una página, tres pestañas):

1. **Actividades** — CRUD sobre `familia_actividad_actividades` + convocatoria de cursos vía `familia_actividad_cursos`.
2. **Registrar asistencia** — selección de actividad + curso, lista de estudiantes del curso, un checkbox por estudiante. Guarda en `familia_actividad_asistencias` (`actividad_id`, `estudiante_id`, `asistio`).
3. **Dashboard** — métricas por rango de fechas y curso, incluido un bloque de "actividades sin registro".

Tablas existentes:

- `familia_actividad_actividades` — `id`, `nombre`, `fecha`, `estado` (`abierta`/`cerrada`), `usuario_propietario_id`.
- `familia_actividad_cursos` — PK compuesta (`actividad_id`, `curso_id`). Solo la convocatoria.
- `familia_actividad_asistencias` — `id`, `actividad_id`, `estudiante_id`, `asistio`. UNIQUE (`actividad_id`, `estudiante_id`).

**Limitación estructural:** la asistencia se registra **por estudiante**, no por familiar. El sistema sabe *si vino alguien de la familia*, no *quién vino*. Las reglas de la sección 4 son inaplicables sobre ese modelo, por lo que la captura debe rediseñarse.

---

## 3. Insumo previo — saneamiento de `family_members`

El envío depende de que las familias tengan familiares con correo. Verificado en PROD el 4 de agosto de 2026 (ver bitácora `Bitacora_Familiares_Carga_PHIDIAS_2026-08-04.md`):

- 309 de 309 familias con estudiantes activos tienen familiares con correo.
- Ninguna familia tiene más de dos familiares activos: 313 con dos, 4 con uno.
- No hay razones sociales ni correos malformados entre los familiares activos.

**Consecuencia de diseño:** el máximo de destinatarios por estudiante es 2. Eso hace viable una captura con checkbox por familiar sin volver impracticable la pantalla del director.

**Punto de atención:** las 4 familias con un solo familiar tienen punto de contacto único. Si ese correo falla, la familia queda incomunicada sin que nadie lo note. El log de envíos debe permitir detectarlo.

---

## 4. Reglas de negocio del envío

### 4.1 Regla general

> La unidad de decisión es el par **(estudiante convocado × familiar)**.

Para cada hijo convocado y cada familiar activo de su familia:

| Situación en el curso de ese hijo | Familiar que asistió | Familiar que no asistió |
|---|---|---|
| Asistió al menos un familiar | **"Gracias por venir"** | *(nada)* |
| No asistió ningún familiar | — | **"Te extrañamos"** (a todos) |

### 4.2 Casos derivados

| Caso | Resultado |
|---|---|
| Un hijo, no asiste nadie | "Te extrañamos" a ambos familiares |
| Un hijo, asiste uno | "Gracias" a quien fue. Al otro, **silencio** |
| Dos hijos, un familiar en cada curso | "Gracias" a cada uno, por el hijo que le corresponde |
| Dos hijos, un familiar en un curso y nadie en el otro | "Gracias" a quien fue por ese hijo + "Te extrañamos" a **ambos** por el hijo cuyo curso quedó sin nadie |
| Tres o más hijos | Igual, hijo por hijo |

### 4.3 Corolarios

1. **La asistencia es individual; la ausencia es colectiva.** El agradecimiento reconoce a quien estuvo. La ausencia es de la familia, no de una persona.

2. **El silencio es deliberado.** Al familiar que no fue mientras el otro sí, no se le escribe nada. Evita que el mecanismo se lea como control de asistencia individual entre cónyuges.

3. **Una misma persona puede recibir ambos mensajes en un mismo evento**, cuando tiene hijos en cursos distintos y solo alcanzó uno.

4. **Por lo anterior, las plantillas deben nombrar al estudiante o al curso.** `{{estudiante}}` y `{{curso}}` son **obligatorias** en ambos bancos. Sin ellas, el corolario 3 se lee como un error del sistema.

5. **Sin consolidación.** Un familiar que asiste a los cursos de dos hijos recibe dos correos de agradecimiento, uno por hijo. Decisión confirmada: no se agrupan.

6. **Un correo por par (hijo × familiar).** El volumen de un evento que convoque a todo el colegio supera los 800 envíos.

---

## 5. Banco de mensajes

### 5.1 Naturaleza

**Institucional, no por evento.** Un banco central redactado y aprobado una vez, del que el sistema selecciona. El evento solo aporta variables (nombre, fecha).

Razón: los correos van firmados por Rectoría. Si cada organizador redacta los suyos, la firma de la Rectora queda sobre contenido que ella no aprobó.

**Aprobación de textos:** por fuera del sistema. El sistema solo gestiona quién tiene permiso de edición (Comunicaciones, por perfil).

### 5.2 Tamaño

Con 10–15 eventos de familia al año:

| Banco | Cantidad recomendada | Razón |
|---|---|---|
| Agradecimiento | **15** | Un año completo sin que una familia repita texto |
| Ausencia | **10** | Ver abajo |

**La asimetría es intencional.** El banco de agradecimiento admite variedad amplia y hasta calidez desenfadada; el peor error ahí es sonar repetitivo. El de ausencia es delicado: cada variante adicional es una oportunidad de que un texto se deslice hacia el reproche, y va firmado por la Rectora. Diez variantes muy controladas —puerta abierta, cero culpa, sin pedir explicación— valen más que quince donde tres se salieron del tono.

**Recomendación de implementación:** arrancar con 8 de cada uno bien escritos y crecer. Redactar 15 de golpe suele producir cinco buenos y diez de relleno, y el relleno se nota más que la repetición.

### 5.3 Selección: rotación, no azar

El sistema **no sortea**. Elige, entre las plantillas activas del tipo correspondiente, la que hace más tiempo no se le envía a ese destinatario (las nunca enviadas primero; empates al azar).

Razón: con sorteo puro una familia puede recibir el mismo texto tres veces seguidas, y el efecto es peor que no variar. El historial sale del log de envíos; no requiere tabla adicional.

### 5.4 Variables

Sintaxis **`{{variable}}`**, consistente con `aap_email_templates` del módulo de Admisiones.

| Variable | Origen | Obligatoria |
|---|---|---|
| `{{nombre_evento}}` | `familia_actividad_actividades.nombre` | — |
| `{{fecha_evento}}` | `familia_actividad_actividades.fecha`, formateada en español ("12 de agosto de 2026") | — |
| `{{familia}}` | `families.family_name` → "Familia Becerra Álvarez" | — |
| `{{estudiante}}` | Nombre del hijo del par | **Sí** (al menos una de las dos) |
| `{{curso}}` | `courses.course_name` | **Sí** (al menos una de las dos) |
| `{{familiar}}` | `family_members.full_name` | — |

**Validación en la pantalla del banco:** no debe permitir guardar una plantilla que no contenga ni `{{estudiante}}` ni `{{curso}}`.

### 5.5 Firma

De `system_config`: `principal_name` y `principal_signature_url`. Fija para todos los mensajes, no configurable por evento.

La imagen de firma debe estar alojada en **Supabase Storage** (patrón ya establecido en la plataforma para evitar fallas de CORS y bloqueo de imágenes en clientes de correo).

---

## 6. Flujo y ciclo de vida

### 6.1 El cierre es un acto explícito del director

**Decisión tomada: no hay cierre automático con envío.**

Cerrar no es cambiar un estado: es disparar correos irreversibles firmados por la Rectora. El cierre automático convertiría un olvido en un acto institucional afirmativo sobre datos que nadie confirmó.

Escenario que lo descarta: el director marca media lista, lo interrumpen, piensa terminar mañana. A medianoche el sistema cierra y envía "los extrañamos" a familias que sí estuvieron. Peor: si nunca abrió la pantalla, no hay filas, y "sin registro" se interpretaría como "no vino nadie" — correo de ausencia al curso completo.

### 6.2 Escalación

| Momento | Acción |
|---|---|
| **D+0** | El director cierra su curso → se envían los correos de ese curso |
| **D+1** | Recordatorio por correo al director del curso |
| **D+3** | Recordatorio al director **con copia al director de sección**, quien puede cerrar en su nombre (queda registrado quién cerró) |
| **D+7** | El curso se marca **vencido sin cierre**. Los datos quedan para el dashboard. **No se envía nada** |

**Origen del director de sección:** `courses.grade_id → grades.section_id → sections.director_email`. Cadena verificada en el esquema.

**Por qué existe el vencimiento:** el mensaje tiene fecha de caducidad. "Gracias por acompañarnos" ocho días después no comunica cercanía sino desorden; "los extrañamos" una semana tarde es peor que el silencio.

**Por qué escala a coordinación:** si el único mecanismo fuera recordarle al director, bastaría con que ignore los correos para que la funcionalidad muera calladamente y nadie se entere.

### 6.3 El cierre es por curso, no por actividad

Hoy `familia_actividad_actividades.estado` es único para todo el evento. Debe pasar a nivel de `familia_actividad_cursos`: cada director cierra **su** curso. La actividad queda cerrada cuando todos sus cursos lo están.

**Consecuencia positiva:** desaparece la necesidad de esperar a que todos los cursos registren antes de enviar. Cada curso dispara lo suyo al cerrarse.

**Consecuencia aceptada:** una familia con hijos en dos cursos recibe sus correos en momentos distintos, según cuándo cierre cada director. Es natural y no molesta.

### 6.4 Idempotencia

El envío debe ser idempotente. Si un curso se reabre y se vuelve a cerrar, **no puede reenviar**. El log de envíos, con restricción de unicidad sobre el par (actividad, curso, estudiante, familiar), es el candado.

---

## 7. Rediseño de la captura de asistencia

### 7.1 Cambio requerido

La lista del curso debe desplegar, bajo cada estudiante, **sus familiares activos**, con un checkbox por familiar. El director marca a quién vio.

Con máximo dos familiares por familia, son dos checkboxes por estudiante en vez de uno. Carga tolerable.

### 7.2 El caso "asistió otro familiar"

Si viene la abuela, el tío o un acudiente no registrado en `family_members`, el director no tiene dónde marcarlo.

**Solución:** casilla adicional por estudiante, **"Asistió otro familiar"**. Cuenta como asistencia del estudiante para efectos del dashboard, pero **no dispara agradecimiento a nadie en particular** ni ausencia a los familiares registrados.

### 7.3 Trazabilidad

`familia_actividad_asistencias` no registra quién capturó el dato. Dado que el resultado dispara correos firmados por Rectoría, hay que poder responder "¿quién marcó esto?".

Se agregan `registrado_por` (uuid → `users`) y `registrado_at`. **Con `user_id`, nunca con correo**: los correos de cargo se reciclan entre personas (deuda arquitectónica ya documentada en el módulo de Presupuesto con `worker_email_legacy`).

---

## 8. Estructura de páginas y permisos

Donde hoy hay una página con tres pestañas, quedan cuatro páginas.

| # | Página | Contenido | Acceso |
|---|---|---|---|
| 1 | **Banco de mensajes** | CRUD de plantillas, ambos tipos, con vista previa | Permiso por rol, restringido (Comunicaciones) |
| 2 | **Actividades** | CRUD de actividades + convocatoria de cursos | Permiso por rol |
| 3 | **Registrar asistencia** | Captura por familiar + cierre del curso | **Universal** + filtro por `course_director_email` |
| 4 | **Dashboard** | Métricas por sección, grado, curso y familia | Permiso por rol, lectura amplia |

### 8.1 El permiso universal de la página 3

**Problema:** el sidebar se arma desde `permissions` cruzado con los roles del usuario y descarta lo no autorizado. Si el registro no valida por rol sino contra `courses.course_director_email`, el director nunca vería la opción en el menú.

**Solución:** `permissions.is_universal = true`. Tanto `sidebar.js` como `config.js` respetan ese flag y agregan el permiso a todos los usuarios autenticados.

Comportamiento de la página:

1. Consulta `courses?course_director_email=eq.{correo de sesión}&course_status=eq.active`.
2. Si devuelve un curso → entra directo, sin selector de curso. Solo pide escoger **actividad**, entre las que convocaron a ese curso y siguen abiertas.
3. Si devuelve vacío → mensaje "No tienes cursos asignados como director" y nada más.

**Costo aceptado:** la opción aparece en el menú de todos, incluido quien nunca la usará. Se descartó crear un rol "Director de curso" porque duplicaría información que ya vive en `courses` y se desincronizaría al cambiar un director.

### 8.2 Un director, un curso

Confirmado como regla institucional. Es **convención, no restricción del esquema**: `courses.course_director_email` no tiene índice único. La pantalla debe tomar el primer resultado y no fallar si aparecieran dos, pero no se construye para ese caso.

### 8.3 Notas de implementación del sidebar

- Los permisos sin `url_path` se descartan silenciosamente del sidebar. Los permisos de páginas aún no construidas deben crearse con `url_path = NULL` intencionalmente y llenarse al desplegar.
- El sidebar cachea en `sessionStorage` bajo `schoolnet_sidebar_permissions`. Hay que limpiarlo después de cualquier cambio de permisos.

---

## 9. Cambios de base de datos

> Todas las tablas nuevas deben incluir `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` explícitamente. Supabase habilita RLS por defecto.
> Todo cambio se aplica primero en **DEV**, se verifica, y luego se replica a **PROD**.

### 9.1 Tablas nuevas

**`familia_actividad_plantillas`** — banco de mensajes

| Columna | Tipo | Notas |
|---|---|---|
| `plantilla_id` | uuid PK | |
| `tipo` | varchar | CHECK (`asistencia`, `ausencia`) |
| `nombre` | varchar | Identificador interno ("Agradecimiento 01") |
| `asunto` | varchar | Admite variables |
| `cuerpo_html` | text | Admite variables |
| `plantilla_status` | varchar | default `active`, CHECK (`active`, `inactive`) |
| `created_by` | uuid | FK → `users` |
| `created_at` / `updated_at` | timestamptz | |

Desactivar en vez de borrar: el log de envíos referencia plantillas históricas.

**`familia_actividad_asistencias_familiares`** — asistencia por familiar

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint PK | |
| `asistencia_id` | bigint | FK → `familia_actividad_asistencias`, ON DELETE CASCADE |
| `family_member_id` | uuid | FK → `family_members` |
| `asistio` | boolean | default false |
| `created_at` / `updated_at` | timestamp | |

UNIQUE (`asistencia_id`, `family_member_id`).

**`familia_actividad_envios`** — log de envíos

| Columna | Tipo | Notas |
|---|---|---|
| `envio_id` | uuid PK | |
| `actividad_id` | bigint | FK → `familia_actividad_actividades` |
| `curso_id` | uuid | FK → `courses` |
| `estudiante_id` | integer | FK → `students` |
| `family_member_id` | uuid | FK → `family_members` |
| `plantilla_id` | uuid | FK → `familia_actividad_plantillas` |
| `tipo` | varchar | CHECK (`asistencia`, `ausencia`) |
| `destinatario_email` | varchar | Congelado al momento del envío |
| `asunto` | varchar | Congelado |
| `envio_status` | varchar | CHECK (`enviado`, `fallido`, `omitido`) |
| `error_message` | text | |
| `enviado_at` | timestamptz | |

UNIQUE (`actividad_id`, `curso_id`, `estudiante_id`, `family_member_id`) — es el candado de idempotencia.

**Patrón de datos congelados:** `destinatario_email` y `asunto` se guardan tal como salieron, no se releen. Si mañana la familia cambia de correo, el log debe seguir diciendo a dónde se envió realmente. Mismo principio que precios y salarios en Presupuesto.

Este log es además la fuente de la rotación (§5.3).

### 9.2 Modificaciones a tablas existentes

**`familia_actividad_cursos`** — el cierre baja a nivel de curso:

| Columna nueva | Tipo | Notas |
|---|---|---|
| `estado` | varchar | default `abierto`, CHECK (`abierto`, `cerrado`, `vencido`) |
| `cerrado_por` | uuid | FK → `users` |
| `cerrado_at` | timestamptz | |
| `recordatorio_1_at` | timestamptz | Control de D+1 |
| `recordatorio_2_at` | timestamptz | Control de D+3 |

**`familia_actividad_asistencias`** — trazabilidad y caso "otro familiar":

| Columna nueva | Tipo | Notas |
|---|---|---|
| `asistio_otro_familiar` | boolean | default false |
| `registrado_por` | uuid | FK → `users` |
| `registrado_at` | timestamptz | |

`asistio` se conserva como dato consolidado a nivel de estudiante (vino alguien de la familia), calculado por la interfaz como el OR de los familiares marcados más `asistio_otro_familiar`. Se mantiene denormalizado porque el dashboard lo consulta intensivamente.

**`familia_actividad_actividades`** — `estado` deja de ser el estado operativo real (que pasa a `familia_actividad_cursos`) y se convierte en un derivado: cerrada cuando todos sus cursos lo están. Evaluar si conservarlo o calcularlo.

---

## 10. Envío y recordatorios

**Transporte:** `sendNotification(to, subject, htmlContent, silent)` — Web App de Google Apps Script ya en operación.

**Disparador programado:** ya existe el patrón en la plataforma (`system_config.phidias_auto_sync_enabled` / `phidias_auto_sync_time`). Los recordatorios D+1, D+3 y el vencimiento D+7 caben en un trigger horario de Apps Script. No hay que inventar infraestructura.

### 10.1 Restricción de cuota — verificación pendiente

Con un correo por par (hijo × familiar), un evento que convoque a todo el colegio genera **más de 800 envíos**.

`sendNotification()` corre sobre cuota de Gmail, que según el tipo de cuenta va de 100 a 1.500 correos diarios, y Apps Script tiene además límite de tiempo de ejecución por invocación.

**Consulta en curso con IT.** Si el techo resulta ajustado, la mitigación natural es que el envío ya está fragmentado por curso: cada cierre dispara solo los correos de su curso (20–30 familias), y los cierres se distribuyen naturalmente en el tiempo. El riesgo real es el día en que muchos directores cierren a la vez. Puede requerir una cola con procesamiento por lotes.

### 10.2 Manejo de fallos

Todo envío fallido se registra con `envio_status = 'fallido'` y su mensaje de error. El dashboard debe exponerlos: una familia con punto de contacto único (§3) que falle queda incomunicada sin que nadie lo note.

---

## 11. Decisiones pendientes

| # | Decisión | Responsable | Bloquea |
|---|---|---|---|
| **A** | **Cuota de correo** de la cuenta corporativa (§10.1) | IT | Arquitectura del envío |
| **B** | **Redacción de los textos** (15 agradecimiento / 10 ausencia), con `{{estudiante}}` o `{{curso}}` en cada uno | Comunicaciones + Rectoría | Puesta en producción, no la construcción |
| **C** | **Curso sin director** (`course_director_email` nulo o desactualizado): ¿quién cierra? **Propuesta:** el director de sección, desde el arranque y no solo en D+3 | Coordinación Académica | Pantalla de registro |
| **D** | **Reapertura de un curso ya cerrado.** ¿Se permite corregir después de enviados los correos? **Propuesta:** permitirla solo a un perfil administrador, con registro de quién y cuándo, y sin reenvío bajo ninguna circunstancia (§6.4) | Desarrollos + Liderazgo | Pantalla de registro |
| **E** | **Retiro de `family-activities.html`.** ¿Se desmonta al terminar las cuatro páginas nuevas, o convive mientras se construye? Lo segundo es más seguro pero deja opciones duplicadas en el menú por un tiempo | Desarrollos | Despliegue |

---

## 12. Alcance no incluido

- **Dashboard detallado.** Se acordó que habrá vistas por sección, grado, curso y familia, pero su especificación es posterior. Este documento solo garantiza que el modelo de datos la soporte.
- **Portal de Familias.** No se contempla que la familia vea su historial de asistencia. Podría ser una extensión natural.
- **Confirmación previa de asistencia (RSVP).** Fuera de alcance.
- **Tope automático de mensajes de ausencia.** Se evaluó y se descartó. La gestión de familias con ausencia sostenida es humana: cada dirección de sección revisa el dashboard trimestralmente, antes de la entrega de calificaciones, y aborda el caso con la familia. Si a futuro apareciera un patrón que lo amerite, se reevalúa.
- **Registro de asistentes no vinculados a estudiantes** (exalumnos, invitados). Fuera de alcance.

---

## 13. Orden de construcción sugerido

1. **Cambios de esquema en DEV** (§9), verificación, replicación a PROD.
2. **Banco de mensajes** — es autónomo, no depende de nada más, y permite que Comunicaciones empiece a redactar mientras se construye el resto.
3. **Rediseño de la captura** (§7) — el cambio de mayor riesgo, porque toca datos ya en producción.
4. **Cierre por curso + motor de envío** (§6, §10).
5. **Recordatorios y vencimiento** (trigger de Apps Script).
6. **Dashboard.**
7. **Retiro de `family-activities.html`** (decisión E).

---

## 14. Principios que gobiernan este módulo

1. **El cierre es una firma.** Ningún proceso automático decide que un curso está listo para enviar correos a nombre de la Rectora.
2. **Ausencia de dato ≠ ausencia de la familia.** Nunca se envía un mensaje de inasistencia sobre un curso que no fue registrado y cerrado explícitamente.
3. **El silencio es una opción válida.** Al familiar que no fue mientras el otro sí, no se le escribe.
4. **El mensaje caduca.** Pasada la ventana, no se envía: tarde es peor que nunca.
5. **El correo no reemplaza la conversación.** El mensaje automático reconoce la asistencia; los patrones de ausencia sostenida los gestiona la dirección de sección en la revisión trimestral del dashboard, antes de cada entrega de calificaciones.
