# Grabación de Audio + Transcripción + Rigoberto — Documento de Diseño Conceptual

**Estado:** Idea explorada, no implementada  
**Fecha de exploración:** 05/06/2026  
**Aplicable a:** SchoolNet (cualquier página con campo de texto)

---

## 1. Resumen

Se exploró la viabilidad de integrar grabación de voz en páginas de SchoolNet, transcripción automática del audio, y procesamiento del texto resultante por Rigoberto (asistente IA interno), con posibilidad de guardar el resultado en la base de datos.

---

## 2. Stack tecnológico definido

| Componente | Tecnología | Justificación |
|---|---|---|
| Grabación y transcripción | Web Speech API (nativa del navegador) | Gratuita, sin backend, suficiente para casos simples |
| Procesamiento del texto | Rigoberto vía `tilata-ia` | Ya existe la infraestructura |
| Almacenamiento del resultado | Supabase / PostgREST | Stack estándar de SchoolNet |

### Descartado
- **Whisper (OpenAI)**: mayor precisión, pero requiere exponer API key o pasar por backend. Reservado para casos donde la precisión sea crítica o se necesite guardar el archivo de audio.
- **Archivo de audio en Supabase Storage**: no necesario si solo se requiere el texto.

---

## 3. Flujo técnico

```
Usuario habla
    ↓
Web Speech API transcribe en tiempo real (solo Chrome)
    ↓
Texto resultante → campo de texto de la página
    ↓
Texto enviado a Rigoberto con instrucción específica
    ↓
Rigoberto devuelve texto procesado
    ↓
Texto guardado en tabla/campo definido por la página
```

Desde la perspectiva de Rigoberto no hay diferencia — recibe texto como siempre. El cambio es solo en el frontend: un botón de micrófono que alimenta el campo de texto con la transcripción.

---

## 4. Limitaciones de Web Speech API

- Solo funciona en **Chrome** (y Edge basado en Chromium).
- Requiere **conexión a internet** activa.
- No guarda el archivo de audio — solo produce texto.
- Precisión menor que Whisper, especialmente con terminología técnica o nombres propios.
- Requiere permiso explícito del micrófono por parte del usuario.

---

## 5. Implementación técnica

### 5.1 Cambio en `ai-widget.js`
Agregar botón de micrófono al widget de Rigoberto. Al activarse, la Web Speech API alimenta el campo de texto como si el usuario hubiera escrito.

```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'es-CO';
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // Insertar transcript en el campo de texto de Rigoberto
    document.getElementById('rigoberto-input').value = transcript;
};

recognition.start();
```

### 5.2 Funcionalidad de guardado (específica por página)
No es genérica. Cada implementación requiere definir:
- **Página** donde se integra
- **Tabla y campo** de destino en la BD
- **Instrucción a Rigoberto** (estructurar, resumir, clasificar, o transcribir limpio)

---

## 6. Casos de uso potenciales

| Caso de uso | Página probable | Tabla destino | Instrucción a Rigoberto |
|---|---|---|---|
| Observación de estudiante dictada | Seguimientos / Alertas tempranas | `follow_up_notes` o equivalente | Estructurar en formato de observación pedagógica |
| Nota de reunión | Por definir | Por definir | Resumir y extraer acuerdos |
| Comentario de planeación | `planner-form.html` | `pln_comments` | Transcribir limpio o estructurar |
| Registro de novedad de TH | Por definir | Por definir | Clasificar y estructurar |

---

## 7. Pasos para implementar (cuando se retome)

1. Definir caso de uso concreto y página destino.
2. Definir tabla y campo de BD donde se guarda el resultado.
3. Definir instrucción exacta que se le dará a Rigoberto.
4. Agregar botón de micrófono en la página (cambio localizado en el frontend).
5. Conectar transcripción → Rigoberto → guardado en BD.
6. Prueba con usuario real en Chrome.

---

## 8. Decisiones pendientes

- Confirmar si el caso de uso requiere guardar el **audio original** (si es así, evaluar Whisper + Supabase Storage).
- Definir qué pasa si el usuario usa un navegador diferente a Chrome (mostrar mensaje, deshabilitar botón, o fallback a escritura manual).
- Decidir si la funcionalidad va en el widget de Rigoberto (global) o es específica de una página.
