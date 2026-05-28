# Bitácora — Módulo de Planeación de Clases

**Sistema:** SchoolNet (Colegio Tilatá)
**Módulo:** `planning`
**Inicio del desarrollo:** Mayo 2026
**Documento de referencia:** `MODULO_PLANEACION_v1.0_Especificacion.md`

---

## Propósito de esta bitácora

Registrar el avance del desarrollo del módulo, las decisiones tomadas durante la implementación, los puntos donde nos detuvimos y los pendientes. Permite retomar el trabajo en cualquier momento sin perder contexto.

Se actualiza al cerrar cada sub-paso (no en cada mensaje).

---

## Convenciones

- **Estado de cada sub-paso:** `Pendiente` / `En curso` / `Aplicado en DEV` / `Aplicado en PROD` / `Cerrado`
- **Hitos** marcados con `🔵` (en curso), `✅` (cerrado), `⏸️` (pausado/bloqueado)
- Las decisiones tomadas durante el desarrollo (no documentadas en el SPEC v1.0) se registran en la sección "Decisiones de implementación".

---

## Plan de desarrollo (revisado el 25 de mayo de 2026)

**Cambio:** se eliminó el paso original "3 - `index.html` del módulo" porque la arquitectura actual de SchoolNet usa sidebar lateral en lugar de índices por módulo (decisión arquitectónica del proyecto de Reestructuración de Módulos). Los pasos posteriores se renumeran.

| # | Sub-paso | Estado |
|---|---|---|
| 1.1 | SQL — Catálogos (9 tablas + seeds) | ✅ Cerrado |
| 1.2 | SQL — Tablas principales | ✅ Cerrado |
| 1.3 | SQL — Tablas de relación M:N | ✅ Cerrado |
| 1.4 | SQL — Índices recomendados | ✅ Cerrado |
| 1.5 | SQL — Permisos | ✅ Cerrado |
| 2 | `config.js` + `sidebar.js` — registro del módulo | ✅ Cerrado |
| 2.1 | SQL correctivo — eliminar permiso huérfano 'Planeación' (índice) | ✅ Cerrado |
| 3 | `catalogs.html` — gestión de catálogos | ✅ Cerrado |
| 3.1 | SQL correctivo — DISABLE RLS en las 29 tablas del módulo | ✅ Cerrado (DEV y PROD) |
| 4 | `unit-form.html` — formulario de Unidad de Indagación | ⏸️ Reformulado tras hallazgos de coordinación |
| 4.0 | SQL — ampliación de esquema (grades.program_id, academic_areas.coordinator_worker_id) | ✅ Cerrado — aplicado en DEV y PROD |
| 4.0a | Ampliar interfaz de gestión de grados para asignar programa | ✅ Cerrado |
| 4.0b | Ampliar interfaz de áreas (`academic-areas.html`) para asignar coordinador | ✅ Cerrado |
| 4.0c | Poblar datos vía las interfaces ampliadas | 🔵 Próximo paso |
| 4.1 | Refactor `unit-form.html` con modelo definitivo (control de acceso + selector de grado + pre-carga colaboradores) | ✅ Cerrado en DEV y PROD |
| 4.2 | Gestión de ciclos | ✅ Cerrado en DEV y PROD |
| 4.3a | Cierre de la unidad (3 reflexiones finales) | ✅ Cerrado en DEV y PROD |
| 4.3b | Comentarios polimórficos (`pln_comments`) | ✅ Cerrado en DEV y PROD |
| 4.3c | Notificaciones por email de comentarios | Pendiente |
| 5 | `units.html` — listado de UIs | Pendiente |
| 6.1 | `my-planners.html` — listado y creación de planeadores (modelo planeador-por-grado) | ✅ Cerrado en DEV y PROD |
| 6.2 | `planner-form.html` — formulario de Planeador de Área | ✅ Cerrado en DEV (pendiente sincronizar a PROD) |
| 6.2.A | Esqueleto + control de acceso (4 caminos) + polling de concurrencia + header informativo | ✅ Cerrado en DEV y PROD |
| 6.2.B | Bloque 1 — Vinculación con UI + tipos de conexión IB | ✅ Cerrado en DEV y PROD |
| 6.2.C | Bloque 2 — Marco curricular (Quill, ATL, campos simples) | ✅ Cerrado en DEV |
| 6.2.D | Bloque 3 — Criterios de evaluación (tabla dinámica con atomicidad) | ✅ Cerrado en DEV |
| 6.2.E | Bloque 4 — Reflexión del trimestre (4 Quill) | ✅ Cerrado en DEV |
| 6.2.F | Bloque 5 — Ciclos del planeador (CRUD + cuerpo editable + atomicidad) | ✅ Cerrado en DEV |
| 6.2.G | Bloque 6 — Comentarios polimórficos (planner + ciclo) | ✅ Cerrado en DEV |
| 7 | `planners.html` — listado general de planeadores (para coordinadores) | Pendiente |
| 8 | Comentarios en ambos forms | Pendiente |
| 9 | `coordinator-area.html` y `coordinator-program.html` | Pendiente |

---

## Avance

### Pasos 1.x — Base de datos del módulo ✅

(Cerrados el 25 de mayo de 2026 en DEV y PROD. Ver detalle en sección "Histórico de hitos cerrados" abajo.)

- 9 catálogos creados con seed inicial (excepto `pln_tilata_attributes`, vacía por decisión).
- 7 tablas principales con 18 FKs.
- 13 tablas de relación M:N.
- 24 índices de performance.
- 8 permisos en `permissions` (luego reducidos a 7 tras eliminar el huérfano `'Planeación'` en paso 2.1).

**Total: 29 tablas del módulo, todas con RLS deshabilitado tras paso 3.1.**

---

### Paso 2 — Registro en `config.js` y `sidebar.js` ✅

Cerrado el 25 de mayo de 2026 en DEV y PROD. Decisión correctiva importante: `permission_module` debe ser slug en inglés (`'planning'`), no nombre legible en español (`'Planeación'`). El sidebar busca permisos por `mod.id` definido en `SIDEBAR_MODULE_ORDER`. Aplicada corrección vía UPDATE.

---

### Paso 3 — `catalogs.html` + corrección RLS ✅

Cerrado en DEV (25 de mayo) y PROD (27 de mayo). Patrón visual de tabs Bootstrap replicado de `services-config.html`. Las 29 tablas tenían RLS activado pese a los `ALTER ... DISABLE` originales; corrección masiva vía DO block.

---

### Paso 4.0 — Ampliación de esquema ✅

Agregadas dos columnas al esquema base de SchoolNet (no del módulo):
- `grades.program_id uuid REFERENCES programs(program_id)`
- `academic_areas.coordinator_worker_id uuid REFERENCES workers(worker_id)`

Aplicado en DEV y PROD el 26 de mayo de 2026.

---

### Pasos 4.0a, 4.0b — Interfaces ampliadas ✅

Ampliadas las pantallas existentes `grades.html` y `academic-areas.html` para gestionar los nuevos campos vía UI. Aplicado en DEV (26 de mayo) y PROD (26 de mayo).

---

### Paso 4.1 — Refactor `unit-form.html` ✅

Modelo definitivo de control de acceso con 6 caminos: creador, colaboradores, docentes del grado, coordinador de área, director de programa, director de sección. Pre-carga automática de colaboradores. Modo solo lectura. Pantalla de error amigable.

Adicional: `my-units.html` (listado de UIs por grado del docente). Triggers de auditoría para 10 tablas `pln_*` + `audit_trigger_function()` actualizada para mapear correctamente los nuevos `row_id`.

Aplicado en DEV (26 de mayo) y PROD (26 de mayo).

---

### Paso 4.2 — Gestión de ciclos de UI ✅

CRUD completo de ciclos: cuerpo editable (13 campos), áreas + conexiones IB por ciclo, autosave coherente, reactividad cruzada con materias de la UI. Aplicado en DEV (27 de mayo) y PROD (28 de mayo).

---

### Paso 4.3a — Cierre de la unidad ✅

3 reflexiones finales con Quill (`teacher_reflection`, `student_reflection`, `assessment_reflection`). Aplicado en DEV (27 de mayo) y PROD (28 de mayo).

---

### Paso 4.3b — Comentarios polimórficos en UI ✅

Hilo de comentarios sobre `pln_units` y sobre cada `pln_unit_cycles`. Soft-delete preservando respuestas. Aplicado en DEV (27 de mayo) y PROD (28 de mayo).

---

### Paso 6.1 — `my-planners.html` + modelo planeador-por-grado ✅

Decisión arquitectónica importante: el planeador es un artefacto institucional del colegio (asignatura+grado+trimestre+año), no del docente individual. UNIQUE constraint cambiado en BD. `teacher_id` se reinterpreta como "creador histórico" sin migración de datos. Sincronización automática de colaboradores en `unit-form.html` ante cambios de assignments.

Aplicado en DEV (27 de mayo) y PROD (27 de mayo).

---

## Decisión arquitectónica — Concurrencia de edición (27 de mayo de 2026)

Identificado durante la construcción del paso 6.2: dos docentes que comparten un planeador (codocencia legítima en el modelo planeador-por-grado) pueden editar simultáneamente. Sin mitigación, ocurre "last write wins" silencioso.

**Modelo de mitigación adoptado (Opción B + atomicidad de creación de hijos):**

1. **Polling pasivo de `updated_at`** cada 15 segundos. Si difiere de `lastKnownUpdatedAt`, banner amarillo sticky con botón "Recargar". No spamea.
2. **Pausa de polling** con `document.hidden`.
3. **Cada PATCH local actualiza `lastKnownUpdatedAt`** para distinguir ediciones propias de externas.
4. **Atomicidad SQL para creación de ciclos y criterios**: funciones PostgreSQL con `SELECT MAX(...) + 1` bajo lock de fila (`FOR UPDATE`) dentro de una transacción.

**Opciones descartadas:** "last write wins" puro (sin mitigación) y bloqueo optimista con `If-Match` (refactor costoso para el nivel de simultaneidad esperado).

**Deuda técnica aplicable a archivos ya construidos:**
- `unit-form.html` debe recibir polling como mejora retroactiva antes de uso masivo en PROD.
- Los ciclos de UI (paso 4.2) deben recibir la atomicidad SQL para `cycle_number` antes de uso masivo. Hoy calculan con `Math.max(...) + 1` en cliente.

---

### Paso 6.2.A — Esqueleto + control de acceso + polling ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026. **Fecha de cierre en PROD:** 28 de mayo de 2026.

Archivo: `/modules/planning/planner-form.html` (~700 líneas iniciales).

**Implementación:**

- HTML con header informativo (badges: asignatura, grado, trimestre, programa; meta: año, creador, estado) + 6 bloques colapsables con placeholder.
- CSS para badges, bloques colapsables, indicador de autoguardado, banner sticky de conflicto concurrente.
- JS: variables globales, caches de contexto, polling.
- `loadCurrentWorker()` (unión por email a `workers`), `loadContext()` (catálogos base en paralelo), `cargarPlaneador()` (resolución de nombres).
- `canEdit()` evalúa los 4 caminos:
  1. Assignment activa en algún curso de (grade_id, subject_id) en el año.
  2. Coordinador del área de la asignatura.
  3. Director del programa del grado.
  4. Director de la sección del grado.

  El creador histórico (`teacher_id`) NO es un camino por sí solo.
- `aplicarModoSoloLectura()`: banner amarillo arriba.
- `iniciarPollingConcurrencia()`: setInterval cada 15s. Solo si `!isReadOnly`.
- `mostrarPantallaError()` con iconos y botones "Volver".

**Decisión técnica:** detección de PEP por convención de nombre (`program_name.startsWith('PEP')`). Alternativa más robusta: agregar `programs.short_code`. Fuera del alcance.

---

### Paso 6.2.B — Bloque 1: Vinculación con UI + conexiones IB ✅

**Fecha de cierre en DEV:** 27 de mayo de 2026. **Fecha de cierre en PROD:** 28 de mayo de 2026.

- Select de UI filtrado por grado y año.
- 6 checkboxes de conexión IB (Contenido, Conceptos, ATL, Pedagogía, Perfil IB, Contexto).
- Solo visible para programas PEP. Para PAI/PD: mensaje informativo.
- Al desvincular UI, las conexiones se borran (decisión UX, no de BD).
- Autosave inmediato en ambos elementos.

---

### Paso 6.2.C — Bloque 2: Marco curricular ✅

**Fecha de cierre en DEV:** 28 de mayo de 2026. Pendiente sincronización a PROD.

Implementado en dos sub-bloques.

#### 6.2.C.1 — 10 campos directos a `pln_planners`

- 2 inputs text: `strand`, `differentiation_materials`.
- 8 Quill: `learning_objectives`, `men_standards`, `atl_description`, `methodology`, `differentiation_support`, `differentiation_extension`, `summative_description`, `resources`.
- Toolbar Quill mínima: B/I/U, listas, link, clean.

**Helpers nuevos introducidos (aplicables retroactivamente al resto del archivo):**

- `patchPlanner(payload)`: PATCH centralizado a `pln_planners`. Actualiza `lastKnownUpdatedAt` automáticamente para no autodisparar el polling de concurrencia con ediciones propias.
- `debouncedPatch(key, fn, ms=2000)`: debounce por clave con cancelación.
- `flushDebounced(key, fn)`: cancela debounce pendiente y ejecuta inmediato. Usado en blur.
- `setQuillHTML(quill, html)`: hidrata Quill con `clipboard.dangerouslyPasteHTML` (que emite `text-change` con `source='api'`).
- `startSaving()` / `doneSaving()` / `errorSaving()`: contador de PATCH pendientes para el indicador.

**Decisión técnica:** filtro `source === 'user'` en los handlers `text-change` de Quill para ignorar la hidratación inicial (que dispara eventos `source='api'`). Esto evita PATCH innecesarios al cargar y queda como patrón estable.

**Refactor:** las dos funciones del Bloque 1 (`onUnitLinkChange`, `onConnectionToggle`) se reescribieron para usar `patchPlanner()` y los nuevos helpers de indicador. Quedan consistentes con el resto del archivo.

#### 6.2.C.2 — Habilidades ATL (multi-select agrupado)

- Multi-select agrupado por categoría (5 categorías IB: Pensamiento, Comunicación, Investigación, Autogestión, Colaboración).
- 10 habilidades total, una por fila del catálogo.
- INSERT/DELETE inmediato a `pln_planner_atl_skills` (sin debounce — un click es una intención clara).
- Patrón visual coherente con conexiones IB del Bloque 1.

---

### Paso 6.2.D — Bloque 3: Criterios de evaluación ✅

**Fecha de cierre en DEV:** 28 de mayo de 2026. Pendiente sincronización a PROD.

Implementado en dos sub-bloques.

#### 6.2.D.1 — SQL atómico + CRUD básico

**Función PostgreSQL nueva** `pln_create_planner_criterion(p_planner_id uuid)`:

```sql
PERFORM 1 FROM pln_planner_assessment_criteria WHERE planner_id = p_planner_id FOR UPDATE;
SELECT COALESCE(MAX(objective_number), 0) + 1 INTO v_next_number ...;
INSERT ... RETURNING *;
```

**Bug encontrado y corregido durante la sesión:** la primera versión usaba `SELECT MAX(...) FOR UPDATE` directamente, lo cual PostgreSQL rechaza con error `0A000` ("FOR UPDATE is not allowed with aggregate functions"). Corrección: separar lock (`PERFORM 1 ... FOR UPDATE`) y aggregation (`SELECT MAX(...)`) en dos statements.

**Limitación conocida:** si dos clientes crean el **primerísimo criterio** simultáneamente (planeador sin criterios previos), el `PERFORM` no bloquea ninguna fila. PostgreSQL detectará colisión vía el UNIQUE constraint `(planner_id, objective_number)` y uno recibirá `23505`. Aceptable porque es muy improbable; si en uso real aparece, hay soluciones (advisory locks por `planner_id`, retry automático).

**UI del CRUD:**
- Acordeones individuales, uno expandido a la vez.
- Header del criterio cerrado: `#N · etiqueta` + botón eliminar.
- Estado vacío con mensaje guía.
- Eliminar con `confirm()` + DELETE + renumeración automática.
- Botón "Agregar objetivo" en estilo dashed.

#### 6.2.D.2 — Cuerpo editable

- Etiqueta del objetivo (input text).
- 4 textareas en grid 2x2 (responsive a 1 columna en móvil): `level_2`, `level_3`, `level_4`, `level_5`.
- No se incluye `level_1` porque representa "no logrado" implícito (decisión IB/Tilatá, registrada en SPEC sección 8.6).
- Autosave por campo: debounce 2s + blur inmediato.
- Header de la tarjeta se refresca dinámicamente cuando cambia la etiqueta (sin destruir el body, función `refrescarHeaderCriterio()`).

---

### Paso 6.2.E — Bloque 4: Reflexión del trimestre ✅

**Fecha de cierre en DEV:** 28 de mayo de 2026. Pendiente sincronización a PROD.

4 Quill directos a `pln_planners`, mismo patrón del Bloque 2:
- `reflection_before` — Reflexión antes de enseñar
- `reflection_during` — Reflexión durante el trimestre
- `reflection_after` — Reflexión después del trimestre
- `student_reflection` — Síntesis de voces del estudiante

Reusa `CURRICULAR_TOOLBAR`, `patchPlanner()`, `debouncedPatch()`, `setQuillHTML()` y filtro `source === 'user'`.

---

### Paso 6.2.F — Bloque 5: Ciclos del planeador ✅

**Fecha de cierre en DEV:** 28 de mayo de 2026. Pendiente sincronización a PROD.

Implementado en dos sub-bloques.

#### 6.2.F.1 — SQL atómico + CRUD básico

**Función PostgreSQL nueva** `pln_create_planner_cycle(p_planner_id uuid)`: análoga a `pln_create_planner_criterion` pero sobre `pln_planner_cycles`. Misma estructura: `PERFORM 1 ... FOR UPDATE` + `SELECT MAX(...)` + `INSERT ... RETURNING *`.

**UI del CRUD:**
- Acordeones individuales, uno expandido a la vez.
- Header del ciclo cerrado: `#N · badge de estado · tema · rango de fechas`.
- **Estado calculado en cliente** (no se almacena): `pending` / `active` / `completed` según `start_date`/`end_date` vs `getCurrentDateColombia()`. Badges gris / azul / verde.
- Función local `getCurrentDateColombia()` (UTC-5 sin DST) para no depender de `config.js`.
- Eliminar con `confirm()` + DELETE + renumeración automática.
- Mensaje de confirmación con tema si existe (`¿Eliminar el ciclo "..."`?).

**Diferencias clave con ciclos de UI** (registrado para futuras consultas):

| Aspecto | Ciclos de UI | Ciclos de planeador |
|---|---|---|
| Etapa de indagación | Sí | No |
| Tabla de áreas + conexiones | Sí | No |
| Preguntas emergentes | Sí | No |
| Reflexión docente | 1 campo | 2 campos (during + after) |

Los ciclos del planeador son más simples porque el planeador ya está atado a una asignatura/área única.

#### 6.2.F.2 — Cuerpo editable

**Estructura visual:** 4 secciones agrupadas con títulos separadores en mayúsculas pequeñas:

1. **Identidad y temporalidad** — `topic` (input text) + `start_date` + `end_date`.
2. **Aprendizaje** — `session_objectives` (Quill) + `learning_experiences` (Quill) + `resources` (textarea).
3. **Evaluación** — `formative_assessment` (Quill) + `summative_assessment` (Quill con toggle).
4. **Reflexión del ciclo** — `cycle_reflection_during` (Quill) + `cycle_reflection_after` (Quill).

Total: 1 input text + 2 date + 6 Quill + 1 textarea + 1 toggle = 11 campos.

**Decisiones técnicas:**

- **Render una vez + toggle CSS** (mismo patrón que ciclos UI 4.2): el body se renderiza completo al cargar la lista. El toggle solo cambia clase `.expanded`. Los Quill se instancian al renderizar el body. `initPCycleQuills()` resetea `pcycleQuills[cid] = {}` antes de instanciar para evitar referencias huérfanas tras re-render.
- **`patchPCycleField()` análogo a `patchPlanner()`** pero sobre `pln_planner_cycles`. **NO actualiza `pln_planners.updated_at`** — decisión deliberada: el polling de concurrencia vigila solo la tabla padre, no los hijos. Esto significa que un docente A editando un ciclo y un docente B editando el header del planeador no se "ven" mutuamente vía polling. Limitación aceptable.
- **`refrescarHeaderPCycle()`** actualiza solo el header (badge #N, status badge, topic, fechas) cuando cambia `topic`, `start_date` o `end_date`, sin destruir el body.
- **Toggle de sumativa:** al desmarcar, PATCH inmediato `summative_assessment = NULL` + `setText('')` en Quill + ocultar editor + cancelación de debounce pendiente. Al marcar, muestra editor vacío sin guardar nada hasta que el usuario tipee. Si vuelve a marcar tras desmarcar, el contenido anterior NO se recupera (comportamiento esperado).
- **Validación cruzada de fechas (asimétrica):** si el usuario cambia `start_date` y queda > `end_date`, arrastra el fin automáticamente (silencioso). Si el usuario cambia `end_date` y queda < `start_date`, rechaza con `alert` y revierte. Heurística inspirada en calendarios de productividad (Google Calendar).

---

### Paso 6.2.G — Bloque 6: Comentarios polimórficos ✅

**Fecha de cierre en DEV:** 28 de mayo de 2026. Pendiente sincronización a PROD.

Implementado en dos sub-bloques. Reusa el modelo de `pln_comments` ya implementado en paso 4.3b.

#### 6.2.G.1 — Hilo del planeador

- `entity_type='planner'`, `entity_id=planner_id`.
- Render con avatar de iniciales, nombre completo, fecha relativa (`formatRelativeDate()`).
- Compositor textarea + botón "Comentar" (deshabilitado mientras esté vacío).
- Responder a un comentario raíz (1 nivel de anidación). Un solo compositor de respuesta abierto a la vez por hilo.
- Soft-delete por el autor: PATCH `comment_status='deleted'`. Placeholder "Comentario eliminado" en gris.
- Eliminar raíz con respuestas preserva las respuestas (patrón Reddit/Twitter).
- Compositores ocultos en modo solo lectura.

**Bug encontrado y corregido durante la sesión:** la primera versión incluía `headers: { 'Prefer': 'return=representation' }` en el POST de creación, lo cual **rompe el wrapper `supabaseRequest()` de SchoolNet** porque sustituye completamente los headers, quitando `apikey` y `Authorization`. Resultado: 401. **Regla confirmada (ya documentada en memoria del proyecto):** *"Never pass `headers` to `supabaseRequest()` — the centralized wrapper in `config.js` injects auth headers."* Aplica también a `Prefer`, no solo a auth.

**Solución aplicada:** POST sin headers explícitos. Tras crear, re-leer el comentario más reciente del autor actual para obtener `comment_id` y `created_at` reales. Filtro de la re-lectura: `entity_type`, `entity_id`, `author_id`, `comment_body`, `parent_comment_id` (o IS NULL), `order=created_at.desc&limit=1`.

#### 6.2.G.2 — Hilo por ciclo del planeador

- `entity_type='planner_cycle'`, `entity_id=cycle_id`.
- Hilo embedido al final del cuerpo de cada ciclo, como quinta sección "Comentarios del ciclo".
- Reusa todas las funciones compartidas: `renderCommentsList`, `renderSingleComment`, `crearComentario`, `eliminarComentario`, `abrirComposerRespuesta`, `setupCommentListeners`, `formatRelativeDate`.
- Solo cambia: contenedor (`pcycle-comments-list-${cid}`), `entity_type`, y `setupPCycleCommentComposer(cycleId)` análoga.

**Bug encontrado y corregido durante la sesión:** los hilos de los ciclos no mostraban los comentarios al cargar la página, pero sí los mostraban tras crear uno nuevo. Causa: `renderPCyclesList()` se llamaba ANTES de `cargarComentarios()`, por lo que cada `renderPCycleCommentsThread(cid)` se ejecutaba con `commentsByEntity` aún vacío. Solución: tras `cargarComentarios()`, iterar `plannerCycles` y llamar `renderPCycleCommentsThread(c.cycle_id)` para refrescar. El compositor ya queda conectado desde `renderPCyclesList()`, no requiere repetición.

**Intento de fix descartado:** se intentó agregar un cache-buster `_cb=Date.now()` a la URL del GET, pensando que era caché del navegador. Resultó en `PGRST100` porque **PostgREST NO ignora parámetros desconocidos**: los interpreta como filtros sobre columnas. Reglas confirmadas:
- No agregar parámetros arbitrarios a URLs de PostgREST.
- El bug del orden de carga era la causa real, no el caché.

**Limitación conocida sobre `pln_comments`:** la tabla no tiene FK sobre `entity_id` (es polimórfica). Si se elimina un ciclo desde la UI, sus comentarios quedan huérfanos en BD. No se ven en la UI porque `cargarComentarios()` solo trae los del planeador + ciclos activos. Misma deuda técnica que en `unit-form.html`. Si más adelante se quiere limpiar, se hace con SQL de mantenimiento o agregando cleanup explícito en `eliminarPCycle()`.

---

## Estado del archivo `planner-form.html` al cierre del paso 6.2.G

**Funcionalmente completo en DEV.** Cubre los 6 bloques del SPEC sección 8.4-8.9:
1. Vinculación con UI (selector + 6 tipos de conexión IB).
2. Marco curricular (11 campos: input text, Quill, ATL multi-select agrupado).
3. Criterios de evaluación (tabla dinámica con atomicidad SQL).
4. Reflexión del trimestre (4 Quill).
5. Ciclos del planeador (CRUD + cuerpo editable + sumativa toggleable + atomicidad SQL).
6. Comentarios polimórficos (sobre el planeador + sobre cada ciclo).

Control de acceso por 4 caminos. Polling de concurrencia activo. Autosave coherente en todos los campos. Indicador visual unificado.

### Pendientes conocidos en `planner-form.html` (no bloquean uso real)

| # | Pendiente | Razón del aplazamiento |
|---|---|---|
| 1 | **Notificaciones por email de comentarios sobre planeador y ciclos** | Mismo destino que paso 4.3c. Se decidirá la política (alcance, formato, opt-out, agregación) en sesión propia. |
| 2 | **Validación funcional del modo solo lectura** | No hay datos para ejercitarlo en DEV hasta que se pueblen `grades.program_id`, `academic_areas.coordinator_worker_id` y existan workers con roles de coordinación. |
| 3 | **Validación de Caminos 2-4 de `canEdit()`** | Mismo motivo que el anterior. |
| 4 | **Limpieza de comentarios huérfanos al eliminar ciclo** | Aceptado como deuda técnica. Comentarios quedan en BD sin entity_id alcanzable, pero no se ven en la UI. Misma situación que en `unit-form.html`. |
| 5 | **Atomicidad SQL retroactiva para `pln_unit_cycles.cycle_number`** | Aplicable cuando `unit-form.html` reciba la deuda técnica documentada en la decisión arquitectónica del 27 de mayo. Función a crear: `pln_create_unit_cycle(p_unit_id uuid)` con misma estructura que las dos funciones nuevas del módulo. |
| 6 | **Polling de concurrencia retroactivo en `unit-form.html`** | Aplicar antes de uso masivo en PROD. Patrón ya validado en `planner-form.html`. |

---

## Decisiones de implementación (28 de mayo de 2026)

### Patrón `patchPlanner()` y wrapper centralizado de PATCH

Introducido en el paso 6.2.C como punto único de PATCH al planeador. Actualiza `lastKnownUpdatedAt` automáticamente tras cada PATCH, para que el polling de concurrencia no se autodispare con ediciones propias. Patrón aplicable retroactivamente a `unit-form.html` cuando se implemente polling allí.

### Helpers de autoguardado consistentes en todo el archivo

Sistema de contador de PATCH pendientes (`pendingPatches`) con `startSaving/doneSaving/errorSaving`. Múltiples PATCH concurrentes no rompen el indicador. Patrón ya probado en `unit-form.html`, replicado en `planner-form.html`.

### Filtro `source === 'user'` en handlers Quill

Indispensable para no disparar autosave durante la hidratación inicial vía `clipboard.dangerouslyPasteHTML`, que emite el evento como `'api'`. Patrón confirmado y replicado en todos los Quill del archivo (Marco curricular, Reflexión del trimestre, cuerpo de ciclos).

### Reglas confirmadas durante la sesión

1. **Nunca pasar `headers` a `supabaseRequest()`** — aplica también a `Prefer`, no solo a `apikey`/`Authorization`. Si se necesita PostgREST con `return=representation`, hacer re-lectura por GET.
2. **PostgREST NO ignora parámetros desconocidos** en URLs. Cualquier parámetro extra se interpreta como filtro sobre columna. No usar cache-busters tipo `_cb=...`.
3. **`FOR UPDATE` no se combina con funciones de agregación** en PostgreSQL. Para locking + agregación: dos statements separados (`PERFORM 1 ... FOR UPDATE` + `SELECT MAX(...)`).
4. **El render de hilos dependientes de datos asíncronos** debe ejecutarse tras la carga, no durante el render del padre. Si se ejecuta durante el render del padre (como pasa con `renderPCyclesList`), refrescar explícitamente después de `cargarComentarios()`.

### Decisión sobre relación polling ↔ tablas hijas

El polling de concurrencia vigila únicamente `pln_planners.updated_at`. Los cambios en tablas hijas (`pln_planner_cycles`, `pln_planner_assessment_criteria`, `pln_planner_atl_skills`, `pln_planner_connections`, `pln_comments`) NO actualizan el `updated_at` del planeador. Esto significa que ediciones simultáneas en distintos componentes del planeador no se "ven" entre sí vía polling. Aceptable para el nivel de concurrencia esperado en un colegio.

Si en el futuro se quiere endurecer, se puede agregar trigger en cada tabla hija para tocar `pln_planners.updated_at`. Por ahora, fuera del alcance.

---

## Pendientes y bloqueos

### 🟢 Listo para sincronizar a PROD

Cuando el usuario decida hacer el PR:

1. **SQL primero en PROD** (mismo SQL aplicado en DEV):
   ```sql
   CREATE OR REPLACE FUNCTION public.pln_create_planner_criterion(p_planner_id uuid) ...;
   CREATE OR REPLACE FUNCTION public.pln_create_planner_cycle(p_planner_id uuid) ...;
   ```
   Si el código llega a PROD antes que las funciones, los botones "Agregar objetivo" y "Agregar ciclo" fallan con 404 en `/rpc/...`.

2. **Después el PR** `developmen → main` con `planner-form.html` modificado.

3. **Validación post-deploy en PROD limitada** porque no hay datos pedagógicos poblados aún (programas en grados, coordinadores). Solo se puede verificar carga sin errores y estructura visual.

### 🟡 Pendientes operativos (no bloqueantes para desarrollo)

1. Asignación manual de los 7 permisos del módulo a roles en PROD vía la UI de SchoolNet.
2. Poblar `grades.program_id` en los 13 grados restantes de PROD.
3. Poblar `academic_areas.coordinator_worker_id` en las 10 áreas restantes de PROD.
4. Catálogo `pln_tilata_attributes`: poblar desde la interfaz de `catalogs.html` cuando la coordinación entregue la lista oficial.
5. Notificaciones por email de comentarios (paso 4.3c) — pendiente decisión de política.

---

## Histórico de hitos cerrados

- **25 de mayo de 2026** — Paso 1.1 cerrado: 9 catálogos creados en DEV y PROD con seeds iniciales (excepto `pln_tilata_attributes`, intencionalmente vacía).
- **25 de mayo de 2026** — Paso 1.2 cerrado: 7 tablas principales creadas en DEV y PROD con 18 FKs correctas.
- **25 de mayo de 2026** — Paso 1.3 cerrado: 13 tablas M:N creadas en DEV y PROD. Total acumulado: 29 tablas del módulo.
- **25 de mayo de 2026** — Paso 1.4 cerrado: 24 índices de performance creados en DEV y PROD.
- **25 de mayo de 2026** — Paso 1.5 cerrado: 8 permisos creados en DEV y PROD. Asignación a roles se realizará manualmente vía UI.
- **25 de mayo de 2026** — 🎯 **Hito mayor: bloque SQL completo del módulo aplicado en DEV y PROD** (29 tablas + 24 índices + 8 permisos).
- **25 de mayo de 2026** — Paso 2 cerrado: módulo registrado en `sidebar.js` y `config.js`. Corrección de `permission_module` de `'Planeación'` a `'planning'`.
- **25 de mayo de 2026** — Paso 2.1 cerrado: eliminado permiso huérfano `'Planeación'`. Módulo queda con 7 permisos funcionales.
- **25 de mayo de 2026** — Paso 3 cerrado: `catalogs.html` desplegado en DEV. Hallazgo: las 29 tablas tenían RLS activado pese a los `ALTER ... DISABLE` originales. Corrección vía DO block (paso 3.1).
- **25 de mayo de 2026** — ⏸️ Paso 4.1 original pausado tras hallazgo: `academic_assignments` ya modela "Unit of Inquiry" como asignatura por curso. Modelo de autor/colaborador validado con coordinación de programa.
- **25 de mayo de 2026** — Respuestas de coordinación: UI por grado, creadores son docentes con "Unit of Inquiry", todos los docentes del grado editan, coordinadores de área y programa también editan.
- **26 de mayo de 2026** — Paso 4.0 cerrado: ampliación de esquema aplicada en DEV y PROD.
- **26 de mayo de 2026** — Pasos 4.0a y 4.0b cerrados: interfaces ampliadas en DEV y PROD.
- **26 de mayo de 2026** — Refinamiento del modelo: incorporación del **director de sección** como sexto editor de UIs.
- **26 de mayo de 2026** — Paso 4.1 cerrado en DEV: 6 caminos de control de acceso, pre-carga de colaboradores, modo solo lectura. Desviación: `my-units.html` (listado de UIs del grado) construido tras detectar bug de UX en el flujo de creación.
- **26 de mayo de 2026** — Bug Quill resuelto: helper `setQuillHTML()` con `clipboard.dangerouslyPasteHTML()`.
- **26 de mayo de 2026** — Activación de auditoría en tablas `pln_*`: 30 triggers + `audit_trigger_function()` actualizada.
- **26 de mayo de 2026** — Deuda técnica detectada en sistema SchoolNet: `audit_log.user_display_name` registra `'DB: postgres'` en la mayoría de registros (`is_local = true` pierde la variable entre fetches HTTP). Reportada al sistema interno de tickets.
- **26 de mayo de 2026** — ✅ Sincronización PROD completa: BD del módulo + URL de permiso + 10 triggers de auditoría + función actualizada.
- **26 de mayo de 2026** — Lección aprendida: cache del sidebar usa `sessionStorage`, no `localStorage`.
- **26 de mayo de 2026** — Aclaración: `academic_years.cycles = 6` se refiere a rotación semanal D1-D6, no a ciclos pedagógicos.
- **27 de mayo de 2026** — Paso 4.2 cerrado en DEV: ciclos de UI con cuerpo editable + áreas + conexiones IB.
- **27 de mayo de 2026** — Paso 4.3a cerrado en DEV: 3 reflexiones finales de cierre de UI.
- **27 de mayo de 2026** — Paso 4.3b cerrado en DEV: comentarios polimórficos en UI y ciclos de UI.
- **27 de mayo de 2026** — Decisión arquitectónica: modelo "planeador-por-grado". UNIQUE constraint cambiado en DEV y PROD. `teacher_id` reinterpretado como "creador histórico" sin migración.
- **27 de mayo de 2026** — Paso 6.1 cerrado en DEV y PROD: `my-planners.html` + sincronización automática de colaboradores en `unit-form.html`.
- **27 de mayo de 2026** — Decisión arquitectónica: mecanismo de polling para concurrencia + atomicidad SQL para creación de hijos.
- **27 de mayo de 2026** — Pasos 6.2.A y 6.2.B cerrados en DEV.
- **28 de mayo de 2026** — Sincronización a PROD: pasos 4.2, 4.3a, 4.3b, 6.2.A, 6.2.B y la deuda de RLS verificada en PROD.
- **28 de mayo de 2026** — Paso 6.2.C cerrado en DEV (Marco curricular completo, 11 campos). Introducidos helpers `patchPlanner()`, `debouncedPatch()`, `flushDebounced()`, `setQuillHTML()`, contador de PATCH. Refactor de Bloque 1 para usar los helpers nuevos.
- **28 de mayo de 2026** — Paso 6.2.D cerrado en DEV (Criterios de evaluación). Primera función SQL atómica del módulo: `pln_create_planner_criterion(uuid)`. Bug corregido: separación de lock y aggregation en plpgsql.
- **28 de mayo de 2026** — Paso 6.2.E cerrado en DEV (Reflexión del trimestre, 4 Quill).
- **28 de mayo de 2026** — Paso 6.2.F cerrado en DEV (Ciclos del planeador completo, 11 campos por ciclo). Segunda función SQL atómica: `pln_create_planner_cycle(uuid)`. Validación cruzada asimétrica de fechas. Toggle de sumativa con cancelación de debounce. Decisión: PATCH de ciclos NO actualiza `pln_planners.updated_at`.
- **28 de mayo de 2026** — Paso 6.2.G cerrado en DEV (Comentarios polimórficos sobre planeador y sobre cada ciclo). Bugs corregidos: 401 por `Prefer` que rompía wrapper, hilos de ciclos no hidratados al cargar. Reglas confirmadas: nunca pasar headers a `supabaseRequest()`, PostgREST no ignora parámetros desconocidos, refresh explícito de hilos tras carga asíncrona.
- **28 de mayo de 2026** — 🎯 **Hito mayor: `planner-form.html` funcionalmente completo en DEV** (6 bloques cubiertos, 4 caminos de acceso, polling de concurrencia, autosave coherente). Pendiente sincronización a PROD junto con las dos funciones SQL nuevas.

---

*Última actualización: 28 de mayo de 2026 — `planner-form.html` funcionalmente completo en DEV. Pendiente sincronización a PROD del archivo + las dos funciones SQL nuevas (`pln_create_planner_criterion`, `pln_create_planner_cycle`). Tras la sincronización, el siguiente paso es decidir entre: (a) abordar la deuda técnica de polling + atomicidad SQL en `unit-form.html` antes de uso masivo; (b) construir las pantallas de coordinación (paso 7 y 9); (c) implementar notificaciones por email (paso 4.3c). Tareas operativas pendientes (dependen de terceros): asignar 7 permisos del módulo a roles en PROD, poblar `grades.program_id` en 13 grados PROD, poblar `academic_areas.coordinator_worker_id` en 10 áreas PROD.*
