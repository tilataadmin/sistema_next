# Bitácora — Depuración y mejora de Rigoberto

**Fecha:** 24 de julio de 2026
**Sistema:** SchoolNet — Colegio Tilatá
**Repos afectados:** `tilata-ia` (backend IA, `api/chat.js`), `sistema_next` (frontend, `ai-widget.js`)
**Entorno:** Todos los cambios aplicados directamente en PRODUCCIÓN (Rigoberto no tiene entorno DEV separado).
**Estado al cierre:** Todos los problemas principales resueltos y verificados. Pendientes menores listados al final.

---

## 1. Resumen ejecutivo

La sesión comenzó por un problema de visualización del widget en móviles y derivó en el descubrimiento de una cadena de fallos en el sistema RAG de Rigoberto que causaban que respondiera "no tengo ese documento" sobre documentos que sí estaban cargados y vectorizados. Se diagnosticaron y descartaron cuatro hipótesis antes de encontrar la causa real (dilución del embedding en preguntas multi-tema). En el camino se corrigieron además el truncamiento de respuestas, un índice vectorial mal dimensionado, la telemetría de tokens, el orden del historial conversacional y el comportamiento de Rigoberto ante la falta de respaldo documental.

---

## 2. Problemas resueltos y verificados

### 2.1 Widget no responsive en móviles
**Síntoma:** el panel de Rigoberto se veía demasiado largo en móviles y el campo de texto quedaba fuera de la pantalla; no se veía lo que se escribía.
**Causas (tres, acumuladas) en `ai-widget.js`:**
- `.rigo-messages` con `flex: 1` sin `min-height: 0` — impedía que el área de mensajes se encogiera y empujaba el input fuera de pantalla.
- `height: 100vh` — en móviles incluye la barra del navegador, dejando el input por debajo del borde visible.
- `.rigo-input` con `font-size: 14px` — iOS hace zoom automático al enfocar inputs con fuente menor a 16px.
**Corrección:** `min-height: 0` y `flex: 1 1 auto` en mensajes; `height: 100dvh` con respaldo `100vh`; media query móvil con panel a ancho completo, `font-size: 16px` en el input y `env(safe-area-inset-bottom)`.
**Verificado:** funciona en Android e iOS.

### 2.2 Truncamiento de respuestas largas
**Síntoma:** respuestas largas se cortaban a media frase (ej. terminaban en `2. **Criterios`).
**Causa:** la rama `directResponse` reutilizaba la respuesta de la Fase 1, cuyo `max_tokens` estaba en 1024. La densidad del español con markdown (~3,3 caracteres/token) hacía que ~3.400 caracteres agotaran el tope.
**Corrección:** claves `max_tokens_phase1` (4096) y `max_tokens_phase2` (8192) en `ai_config`, leídas por el código con respaldo fijo.
**Verificado:** respuestas largas completas.

### 2.3 Índice vectorial mal dimensionado (recall degradado)
**Síntoma:** documentos correctamente cargados y vectorizados no se recuperaban nunca. Los mismos 3-4 documentos aparecían en todas las búsquedas.
**Causa:** el índice `ai_document_chunks_embedding_idx` era `ivfflat` con `lists=10` y `probes=1` (valor por defecto). Con 1.377 chunks repartidos en 10 listas, cada búsqueda examinaba solo ~138 (≈10% del corpus) y descartaba el resto sin medirlo. Los documentos recientes caían en listas no exploradas.
**Corrección:** `DROP INDEX ai_document_chunks_embedding_idx`. Con 1.377 vectores (~5,6 MB), la búsqueda secuencial exacta es instantánea y da recall 100%. El índice aproximado no aportaba velocidad a esta escala y degradaba el recall.
**Nota a futuro:** si el corpus crece a decenas de miles de chunks, recrear un índice — preferir `hnsw` sobre `ivfflat`, con `lists`/parámetros calculados sobre el tamaño real.
**Verificado:** el `DROP INDEX` por sí solo no cambió el resultado del caso multi-tema (la causa era otra — ver 2.4), pero dejó la búsqueda exacta y eliminó una variable del diagnóstico.

### 2.4 Dilución del embedding en preguntas multi-tema (CAUSA RAÍZ del problema de recuperación)
**Síntoma:** preguntas que mezclaban varios temas (ej. planeación PEP + rúbrica Danielson + política de integridad académica) recuperaban solo el tema dominante; los demás documentos quedaban fuera aunque estuvieran cargados.
**Diagnóstico:** un solo embedding de una pregunta con 3+ temas produce un vector promedio que cae cerca del centro de gravedad del tema dominante (normalmente el de mayor presencia documental — hay ~90 manuales de módulos frente a pocas políticas). Los temas minoritarios quedan fuera del radio de búsqueda. Subir `match_count` de 10 a 20 no ayudó: los slots extra se llenaban del mismo tema dominante.
**Confirmación:** con preguntas enfocadas en un solo tema, cada documento se recuperaba perfectamente (Danielson, PIAR, integridad académica). El problema aparecía solo al combinar temas.
**Corrección:** descomposición en subconsultas (`decomposeQuery` + `retrieveChunks` en `api/chat.js`). Antes del RAG, una llamada a Haiku descompone la pregunta en 1-4 subconsultas temáticas (JSON). Se genera un embedding por subconsulta (vía `generateEmbeddingsBatch`, una sola llamada a Voyage), se busca con cada una repartiendo `match_count`, y se fusionan los resultados deduplicando por `chunk_id` y conservando la mayor similitud. Ante cualquier fallo, cae al comportamiento anterior (un embedding de la pregunta completa).
**Verificado:** la pregunta de cuatro temas recuperó los cuatro documentos correctos.

### 2.5 Nombre de documento con acentos en forma descompuesta (NFD)
**Síntoma:** consultas SQL/PostgREST con `=` sobre `document_name` devolvían cero filas para "Política de integridad académica 2023 2024" pese a existir. Llevó a un diagnóstico erróneo inicial ("el documento no tiene chunks").
**Causa:** los acentos del nombre estaban almacenados en forma Unicode descompuesta (NFD: `i` + tilde combinante) en lugar de compuesta (NFC). Se ven idénticos en pantalla, pero para el operador `=` son cadenas distintas. Probable origen: archivo nombrado en macOS.
**Corrección:** `UPDATE ai_documents SET document_name = normalize(document_name, NFC) WHERE document_name <> normalize(document_name, NFC);` — afectó solo ese documento. No toca chunks ni embeddings.
**Aprendizaje general:** para verificaciones sobre `document_name`, usar `ILIKE '%...%'` en lugar de `=`. Cualquier `.eq()` de PostgREST puede fallar en silencio ante nombres en NFD.
**Verificado:** `coincide_exacto = true` tras la corrección.

### 2.6 Regla de no invención de contenido
**Decisión institucional tomada:** si Rigoberto no encuentra respaldo documental, no debe inventar; debe comunicarlo con claridad.
**Problema previo:** la regla anterior ("responde ÚNICAMENTE con base en la información proporcionada") fallaba con marcos educativos conocidos (Danielson, Bloom). Para el modelo, explicarlos no se "sentía" como inventar, porque son conocimiento público legítimo. El riesgo real no es equivocarse, sino acertar en lo general y fallar en lo específico de Tilatá, sin que el lector note la diferencia. Además, la advertencia se colocaba al final de la respuesta, donde el truncamiento la ocultaba.
**Corrección:** reescritura del bloque de reglas en `buildSystemPrompt`, con tres elementos clave: (1) el conocimiento general NO es fuente válida, con mención explícita a marcos/metodologías educativas; (2) la advertencia va AL PRINCIPIO de la respuesta, nunca al final; (3) recibir fragmentos no equivale a tener respaldo (pueden ser irrelevantes por el umbral permisivo).
**Verificado:** ante una pregunta sobre taxonomía de Bloom (no documentada), Rigoberto abrió advirtiendo, respondió solo lo documentado y no explicó Bloom pese a conocerlo.

### 2.7 Regla de no invención de cargos y dependencias
**Problema:** aun con la regla de no invención de contenido, Rigoberto inventaba nombres de cargos y dependencias en las sugerencias de "consulta con...", tratándolas como cortesía y no como afirmación factual. Expandió la sigla EAE de dos formas distintas en respuestas diferentes ("equipo de apoyo pedagógico" vs "Equipo de Apoyo Escolar"), señal de reconstrucción.
**Corrección (dos partes):**
- Bloque "## Referencias a personas, cargos y dependencias" en `buildSystemPrompt`: prohíbe inventar/reconstruir nombres de cargos, dependencias, comités o siglas; aplica también a las derivaciones ("consulta con..."); prohíbe expandir siglas cuyo significado no esté en los fragmentos.
- Documento de estructura organizacional cargado como fuente canónica (ver 2.8).
**Verificado:** ante "¿con quién hablo si mi hijo de tercero tiene una dificultad de aprendizaje?", Rigoberto nombró correctamente "Equipo de Apoyo Escolar (EAE)", atribuyó su liderazgo a la persona correcta y derivó también a la Dirección de Primaria resolviendo que tercero es primaria. Cero invención.

### 2.8 Documento de estructura organizacional
**Creado:** `ESTRUCTURA_ORGANIZACIONAL_TILATA_v1.0.md`, cargado en la base de conocimiento (4 fragmentos, estado `ready`).
**Criterio de redacción:** cada sección repite su contexto (no usa "él"/"esta dirección") porque los chunks se recuperan aislados y deben entenderse solos. Incluye advertencias de no confusión entre "Tecnología Académica" (formativo) y "Tecnología Administrativa" (administrativo); tabla de siglas oficiales con instrucción de no expandirlas de otra forma; sección de personas con doble cargo; y sus propios pendientes marcados dentro del documento (con instrucción de no dar información sobre ellos).
**Pendiente de completar (v2):** significado de la sigla SER, nombres de los cuatro psicólogos del equipo SER, denominación oficial y responsable del equipo Desarrollos, cargos de gestores/asistentes/profesionales, otros cargos con atención al público, y el mapa de "a quién acudir para qué".

### 2.9 Historial conversacional invertido
**Síntoma:** en conversaciones de más de 10 mensajes, Rigoberto perdía el contexto reciente y podía pedir aclaración sobre algo ya escrito.
**Causa:** la consulta de historial ordenaba `ascending: true` con `.limit(10)`, devolviendo los 10 mensajes MÁS ANTIGUOS de la sesión — nunca los recientes, ni siquiera la pregunta actual.
**Corrección:** ordenar `ascending: false`, `.limit(historyLimit)`, luego `.reverse()`. Nueva función `sanitizeHistory` que descarta mensajes vacíos y recorta el inicio hasta el primer mensaje de rol `user` (la API de Anthropic exige que la conversación empiece con `user`). Clave `history_limit` en `ai_config`.
**Verificado:** con 16 mensajes previos, una pregunta de seguimiento ("¿y eso cómo se aplica en bachillerato?") se resolvió correctamente contra el turno anterior.

### 2.10 El RAG no contextualizaba las preguntas de seguimiento
**Síntoma:** en preguntas de seguimiento con referencias implícitas ("y eso cómo se aplica en bachillerato"), la búsqueda vectorial operaba sobre una frase que por sí sola no significa nada, recuperando documentos irrelevantes.
**Causa:** `decomposeQuery` recibía solo la pregunta actual, sin historial.
**Corrección:** nueva función `getRecentContext` que lee los últimos 4 mensajes de la sesión (antes de guardar la pregunta actual). `decomposeQuery` ahora recibe ese contexto y resuelve las referencias implícitas antes de descomponer, reemplazando "eso" por el tema concreto. El umbral de 80 caracteres para saltar la descomposición ahora se ignora si hay contexto previo (las preguntas de seguimiento son cortas y son las que más lo necesitan).
**Verificado:** funcionó junto con 2.9.

### 2.11 Telemetría de tokens muerta y streaming simulado (rama `directResponse`)
**Síntoma:** todos los mensajes del asistente registraban `tokens_input: 0` y `tokens_output: 0`. El tablero de "Uso" (vista `ai_usage_monthly`) subestimaba el costo real de forma sistemática, porque `directResponse` era el camino principal del tráfico.
**Causa:** la rama `directResponse` reusaba el texto de la Fase 1, guardaba los tokens hardcodeados en cero, y simulaba streaming troceando el texto en pedazos de 20 caracteres después de que ya estaba generado (toda la latencia por delante, luego el texto de golpe).
**Corrección (arreglo de fondo, no parche):** se eliminó la rama `directResponse`. Ahora la Fase 1 solo DECIDE si hace falta consultar la base de datos; la respuesta al usuario sale SIEMPRE por la Fase 2, con streaming real y captura de `usage` (`message.usage.input_tokens/output_tokens`). Esto arregló de una vez el streaming simulado, la telemetría y la duplicación de lógica.
**Verificado:** una pregunta de documentación (el caso que antes caía en `directResponse`) registró `tokens_input: 18713`, `tokens_output: 343` — valores reales.

### 2.12 Fase 1 convertida en decisión barata
**Motivación:** tras 2.11, la Fase 1 seguía recibiendo el system prompt completo (~18.700 tokens) y generando una respuesta completa que se descartaba, para luego regenerarla en Fase 2. Se pagaba ~37.000 tokens de entrada para una respuesta que necesitaba ~18.700.
**Corrección:** la Fase 1 ahora usa `decompositionModel` (Haiku, no Sonnet), `max_tokens: 512`, y un prompt mínimo (`buildPhase1DecisionPrompt`) cuyo único trabajo es responder `SIN_DATOS` o emitir un bloque `postrest_query`. No redacta respuestas.
**Verificado:** pregunta de documentación (política de lengua) → responde bien desde documentos; pregunta de datos (indicadores) → Haiku genera la consulta, se ejecuta, devuelve el número correcto (10 indicadores). La cadena de datos sigue intacta con el modelo barato decidiendo.
**Riesgo a vigilar:** Haiku es menos preciso que Sonnet decidiendo. Vigilar las próximas respuestas de datos por si algún caso límite deja de consultar cuando debía. Reversión: volver `model` y `systemPrompt` en esa llamada.

---

## 3. Configuración final en `ai_config`

| Clave | Valor | Nota |
|---|---|---|
| `similarity_threshold` | 0.2 | Permisivo (deliberado). Deja pasar ruido; ver pendiente 4.3 |
| `match_count` | 20 | Repartido entre subconsultas |
| `max_tokens_phase1` | 4096 | Respaldo; Fase 1 ahora usa 512 fijo en código |
| `max_tokens_phase2` | 8192 | Respuesta con streaming |
| `decomposition_model` | claude-haiku-4-5-20251001 | Usado en descomposición Y decisión de Fase 1 |
| `history_limit` | 10 | Mensajes recientes de contexto conversacional |

---

## 4. Pendientes (ninguno urgente salvo 4.5)

### 4.1 `renderMarkdown` no maneja `---`
El renderizador de markdown del widget (`ai-widget.js`) no convierte la regla horizontal `---`; se muestra literal. Cosmético.

### 4.2 Reparto dinámico de slots en `retrieveChunks`
Con `match_count` fijo en 20 repartido entre subconsultas, preguntas de 4-5 temas dejan pocos slots por tema y los temas de menor presencia documental se pierden. Mejora propuesta: asignar un mínimo garantizado por tema (ej. 6) y dejar que el total crezca con el número de subconsultas. Mitiga la necesidad de que el usuario fragmente sus preguntas.

### 4.3 Ruido de recuperación (`similarity_threshold`)
Con umbral 0.2, entran fragmentos irrelevantes cuando una subconsulta tiene pocos vecinos genuinos. Claude los filtra bien en la práctica, pero para reducir tokens y ruido, subir a 0.35-0.40. Medir después de acumular más casos; no tocar junto con otros cambios para poder aislar el efecto.

### 4.4 Telemetría de llamadas auxiliares
El tablero solo cuenta tokens de Fase 2. Las llamadas a Haiku (descomposición y decisión de Fase 1) son reales y cuestan, pero no se registran en `ai_chat_messages`, así que son invisibles en el tablero. El grueso del gasto (Fase 2 con Sonnet) sí se cuenta, pero para un costeo exacto faltaría registrar las auxiliares. La vista `ai_usage_monthly` calcula costo con tarifa Sonnet (3.0 in / 15.0 out por millón); no contempla tarifa Haiku.

### 4.5 SEGURIDAD — credenciales expuestas en el frontend (PRIORITARIO)
En el HTML del tab de administración del Asistente IA (`assistant-ia.html` o equivalente):
- `INGEST_SECRET = 'tilata-ia-secret-2026-xyz'` está hardcodeado y visible en el inspector del navegador. Cualquiera con acceso al archivo puede llamar al endpoint de ingesta de manuales.
- `guardarIdentidad` escribe en `ai_config` con la `anonKey` por PATCH directo. Con RLS deshabilitada en la plataforma, cualquiera podría reescribir la identidad de Rigoberto.
Es el pendiente de mayor riesgo real. Requiere mover estas operaciones detrás de un endpoint autenticado en `tilata-ia` en lugar de exponerlas en el frontend.

### 4.6 Completar el documento de estructura organizacional
Ver lista en 2.8. Requiere información institucional (sigla SER, psicólogos, Desarrollos, mapa de asuntos frecuentes).

### 4.7 Código muerto menor
En `guardarIdentidad`, la línea `const supabaseUrl = window.SUPABASE_URL || ...` se calcula y nunca se usa. Cosmético.

---

## 5. Aprendizajes reutilizables (aplicables al módulo de Notas de Voz, que usa la misma infraestructura)

- **`ivfflat` a baja escala degrada el recall sin aportar velocidad.** Con miles (no decenas de miles) de vectores, la búsqueda secuencial exacta es instantánea y da recall 100%. Preferir `hnsw` si algún día hace falta índice.
- **Un solo embedding no representa bien una pregunta multi-tema.** La descomposición en subconsultas es la solución estándar. Ya implementada y reutilizable.
- **Acentos en NFD rompen comparaciones con `=`.** Normalizar a NFC al ingerir; usar `ILIKE` para verificar. Frecuente en archivos nombrados en macOS.
- **PDF es el formato frágil de la cadena de ingesta.** `.docx` y `.md` se extraen de forma confiable (verificado: un `.docx` de 7.170 palabras se extrajo perfecto; un PDF llegó a fallar). Preferir `.md`/`.docx` para documentos institucionales.
- **Práctica de uso confirmada:** preguntas de pocos temas (frontera práctica ~3) recuperan mejor que preguntas que amontonan muchos. Es buena práctica de uso, pero no debería ser la solución permanente — ver 4.2.
- **Rigoberto no tiene entorno DEV separado.** `ai-widget.js` apunta a `https://tilata-ia.vercel.app/api` con constante fija (sin `detectEnvironment()`); el backend lee un único `SUPABASE_URL`. Todo cambio se prueba en producción. Argumento a favor de separar entornos antes de construir Notas de Voz.

---

**Fin de la bitácora — 24 de julio de 2026.**
