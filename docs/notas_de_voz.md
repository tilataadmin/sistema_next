# Módulo de Notas de Voz (voz → resumen con Rigoberto) — Especificación de construcción

**Sistema:** SchoolNet — Colegio Tilatá
**Repos:** `tilataadmin/sistema_next` (frontend) · `tilata-ia` (backend IA / Rigoberto)
**Estado:** Diseño cerrado. Listo para construir.
**Modo de desarrollo previsto:** Claude (Sonnet), paso a paso.
**Última actualización:** 10 de junio de 2026

---

## 0. Cómo usar este documento (para el asistente de desarrollo)

Este documento es la fuente de verdad para implementar el módulo. Antes de generar código, ten presente el contexto y las reglas de la sección 1. Trabaja así:

- **Un paso a la vez.** Entrega un cambio (o grupo pequeño), espera confirmación de que funciona, y sigue. No entregues múltiples pasos juntos.
- **SQL primero, luego frontend.** Aplica cambios de base de datos antes que los de interfaz. **DEV primero, luego PROD.**
- **Ediciones buscables.** Entrega código como find-and-replace exacto y localizable con Ctrl+F (el equipo edita por el editor web de GitHub; no hay entorno Node local).
- **Verifica contra la BD** los nombres de tablas/campos existentes antes de usarlos; no los inventes.
- **Comunicación** en español neutral, directa, sin halagos. Preguntas en prosa (sin widgets de opción múltiple).

---

## 1. Contexto y reglas del proyecto (guardrails)

**Stack:** Vanilla JS + Bootstrap 5.3 + Bootstrap Icons + Supabase/PostgREST + Vercel. IA: Rigoberto en `tilata-ia` (Claude API + Voyage embeddings, config dinámica en `ai_config`).

**Entornos Supabase:**
- DEV: proyecto `spjzvpcsgbewxupjvmfm` / `sistema-next.vercel.app`
- PROD: proyecto `mrtuerkncqodhakuwjob` / `schoolnet.colegiotilata.edu.co`

**Reglas que NO se rompen:**
- `supabaseRequest(endpoint, { method, body })`: **siempre** objeto de opciones; **nunca** pasar `headers` explícitos (rompe la inyección de auth desde `config.js`).
- **RLS está deshabilitada en la plataforma.** Toda tabla nueva creada por SQL debe incluir `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` explícito.
- SQL multi-sentencia **no** corre confiable en el editor de Supabase: ejecutar cada sentencia por separado.
- PostgREST no ignora parámetros desconocidos: **sin** cache-busters (`_cb=...`).
- UI **sin gradientes**: solo colores sólidos.
- La key de OpenAI vive **solo** en `tilata-ia` (variable de entorno); nunca en el frontend.

---

## 2. Objetivo

Un único módulo (en **Mi Espacio**) donde cualquier usuario dicta notas por voz, les pone título y etiquetas, y se guarda **solo el resumen** generado por Rigoberto. Sin guardar audio ni transcripción. El resumen se puede copiar y descargar, y el dueño puede compartir su vista con otros usuarios.

---

## 3. Concepto y flujo de usuario

1. Entra al módulo "Notas de voz" (Mi Espacio).
2. **Nueva nota** → activa micrófono (permiso del navegador). Indicador de "grabando"; puede pausar/continuar.
3. Pone **título** y, opcional, **etiquetas**.
4. Al detener: el audio se transcribe (Whisper vía `tilata-ia`) y Rigoberto genera el **resumen**.
5. El resumen aparece **editable** (revisión rápida para corregir nombres).
6. **Guardar** → se almacena solo el resumen + metadatos. Audio y transcripción se descartan.
7. Listado: cada nota permite **copiar**, **descargar**, **editar**, **compartir** (dueño) y **eliminar**. Filtro por título y etiqueta.

Fallbacks: sin micrófono / permiso denegado / sin soporte / sin red → permitir escribir el resumen a mano; nunca bloquear.

---

## 4. Transcripción y resumen (camino técnico)

- **Transcripción:** Whisper enrutado por `tilata-ia` (key server-side). Web Speech API queda descartado: es solo Chrome, de una sola toma y menos preciso; no sirve para reuniones.
- **Audio largo:** grabar con `MediaRecorder` en opus mono a bitrate bajo (mantiene una hora muy por debajo del tope ~25 MB de Whisper). Para grabaciones muy largas, trocear el audio y concatenar transcripciones antes de resumir.
- **Resumen:** la transcripción (transitoria) se pasa por Claude con una instrucción de resumen. Idealmente la instrucción se guarda en `ai_config` para ajustarla sin desplegar.
- **Privacidad:** ni Web Speech es "en el dispositivo" (Chrome envía audio a Google). Aquí no se guarda audio ni transcripción; solo el resumen.

### 4.1 Contrato del endpoint en `tilata-ia`
Un endpoint que recibe el audio y devuelve el resumen (la transcripción es interna y no se persiste):

```
POST /voice-note/process
  Body: multipart/form-data
    - audio: archivo (opus/webm)
    - lang:  string (default "es-CO")
    - title: string (opcional, da contexto al resumen)
  Respuesta: { "summary": "<texto>" }   // 'transcript' puede devolverse para depurar, el frontend lo descarta
  Errores: { "error": "<mensaje>" } con código HTTP apropiado
```

- La key de OpenAI y la de Claude viven en variables de entorno de `tilata-ia`.
- Internamente: Whisper (transcribe) → Claude (resume con la instrucción de `ai_config`).

---

## 5. Modelo de datos

**Ejecutar cada sentencia por separado. DEV primero, luego PROD.**

### 5.1 `vn_notes`
```sql
CREATE TABLE public.vn_notes (
  note_id       uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  title         text NOT NULL,
  summary       text NOT NULL,
  tags          text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vn_notes_pkey PRIMARY KEY (note_id),
  CONSTRAINT vn_notes_owner_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(user_id)
);
```
```sql
ALTER TABLE public.vn_notes DISABLE ROW LEVEL SECURITY;
```

### 5.2 `vn_note_shares`
```sql
CREATE TABLE public.vn_note_shares (
  share_id            uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id             uuid NOT NULL,
  shared_with_user_id uuid NOT NULL,
  granted_by          uuid NOT NULL,
  granted_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vn_note_shares_pkey PRIMARY KEY (share_id),
  CONSTRAINT vn_note_shares_note_fkey FOREIGN KEY (note_id) REFERENCES public.vn_notes(note_id) ON DELETE CASCADE,
  CONSTRAINT vn_note_shares_user_fkey FOREIGN KEY (shared_with_user_id) REFERENCES public.users(user_id),
  CONSTRAINT vn_note_shares_grantor_fkey FOREIGN KEY (granted_by) REFERENCES public.users(user_id),
  CONSTRAINT vn_note_shares_unique UNIQUE (note_id, shared_with_user_id)
);
```
```sql
ALTER TABLE public.vn_note_shares DISABLE ROW LEVEL SECURITY;
```

`ON DELETE CASCADE`: al borrar una nota se eliminan sus comparticiones. El dueño se toma de `session.user.user_id`.

---

## 6. Patrones de consulta (PostgREST)

El wrapper `supabaseRequest` inyecta auth/headers; abajo solo se indica endpoint y body.

**Mis notas (dueño):**
```
GET /vn_notes?owner_user_id=eq.<me>&order=created_at.desc
```

**Notas compartidas conmigo** (segunda consulta; se fusiona en JS con la anterior):
```
GET /vn_note_shares?shared_with_user_id=eq.<me>&select=note_id,vn_notes(note_id,owner_user_id,title,summary,tags,created_at)
```

**Filtrar por etiqueta** (contención sobre `text[]`):
```
GET /vn_notes?owner_user_id=eq.<me>&tags=cs.{<etiqueta>}
```

**Crear nota:**
```
POST /vn_notes
body: { owner_user_id, title, summary, tags }
```

**Editar nota (dueño):**
```
PATCH /vn_notes?note_id=eq.<id>
body: { title, summary, tags, updated_at }
```

**Eliminar nota (dueño):**
```
DELETE /vn_notes?note_id=eq.<id>
```

**Compartir / dejar de compartir (dueño):**
```
POST   /vn_note_shares   body: { note_id, shared_with_user_id, granted_by }
DELETE /vn_note_shares?note_id=eq.<id>&shared_with_user_id=eq.<uid>
```

**Control de acceso (en la app, porque RLS está deshabilitada):** un usuario ve una nota si es el `owner_user_id` o si existe una fila en `vn_note_shares` con `shared_with_user_id = <me>`. Editar/compartir/eliminar: solo el dueño. Validar siempre en la consulta, nunca confiar en RLS.

---

## 7. Integración con el menú (Mi Espacio)

Mi Espacio no se renderiza por orden de módulo, sino por **subsecciones que hacen match por nombre de permiso** (`MY_SPACE_SUBSECTIONS` en `sidebar.js`). Por eso, para que el ítem aparezca se requieren **tres** cosas, no solo el permiso:

1. **Permiso en `permissions`** (generar un uuid nuevo):
```sql
INSERT INTO public.permissions
  (permission_id, permission_name, permission_description, permission_module,
   permission_type, permission_status, url_path, is_universal)
VALUES
  (gen_random_uuid(), 'Notas de voz', 'Tomar notas de voz y guardar su resumen',
   'my-space', 'write', 'active', '/modules/general-tools/voice-notes.html', true);
```
   - `permission_module = 'my-space'`, `is_universal = true`, `url_path` **no nulo** (si es nulo, el sidebar lo descarta).

2. **Agregar el nombre exacto a una subsección de `MY_SPACE_SUBSECTIONS`** en `sidebar.js` (p. ej. en "Personal" o "Mis pendientes"). Si el nombre no aparece en ninguna subsección, el ítem **no se renderiza** aunque el permiso exista.

3. **`validatePageAccess('Notas de voz')`** al inicio de la página.

**Después de insertar el permiso, limpiar la cache del sidebar** (`sessionStorage` clave `schoolnet_sidebar_permissions`) para que el ítem aparezca; si no, sigue mostrando los permisos cacheados.

La página vive en `/modules/general-tools/voice-notes.html` (convención: las herramientas personales viven en `general-tools/`).

---

## 8. Acciones de la interfaz

- **Copiar** el resumen al portapapeles.
- **Descargar** el resumen (`.txt` o `.md`).
- **Editar** título, etiquetas y resumen.
- **Compartir / dejar de compartir** (solo dueño; selector de usuarios).
- **Eliminar** (solo dueño).
- **Filtrar** listado por título y etiqueta.

---

## 9. Roadmap por fases (con criterios de aceptación)

**Fase 1 — Base de datos.**
Crear `vn_notes` y `vn_note_shares` (cada sentencia aparte, con `DISABLE RLS`). DEV primero.
*Aceptación:* las dos tablas existen en DEV con RLS deshabilitada; FKs a `users(user_id)` válidas.

**Fase 2 — Endpoint `/voice-note/process` en `tilata-ia`.**
Recibe audio, transcribe con Whisper, resume con Claude, devuelve `{ summary }`. Keys en variables de entorno.
*Aceptación:* enviando un audio de prueba, devuelve un resumen coherente en español; sin exponer keys.

**Fase 3 — Página y captura.**
`voice-notes.html`: grabación (`MediaRecorder` opus mono), título, etiquetas, llamada al endpoint, resumen en campo **editable**.
*Aceptación:* grabar → ver resumen editable; fallbacks (sin mic/soporte) muestran escritura manual.

**Fase 4 — Guardado y listado.**
Guardar (`POST /vn_notes`) y listar notas propias + compartidas, con copiar, descargar, editar, eliminar, filtro por título/etiqueta.
*Aceptación:* una nota guardada aparece en el listado; copiar/descargar funcionan; editar/eliminar solo para el dueño.

**Fase 5 — Compartición.**
Gestión de `vn_note_shares` desde la nota; consulta combinada de acceso.
*Aceptación:* el usuario A comparte con B; B ve la nota en su listado; B no puede editar ni eliminar.

**Fase 6 — Permiso y menú.**
Insertar el permiso, agregar el nombre a `MY_SPACE_SUBSECTIONS`, `validatePageAccess`, limpiar cache del sidebar.
*Aceptación:* el ítem "Notas de voz" aparece en Mi Espacio para cualquier usuario y abre la página.

**Fase 7 — PROD.**
Replicar tablas y permiso en PROD; merge del frontend; verificación final.
*Aceptación:* funciona en `schoolnet.colegiotilata.edu.co`.

---

## 10. Decisiones

**Tomadas:** Whisper vía `tilata-ia`; sin Web Speech; no se guarda audio ni transcripción (solo resumen); tablas `vn_notes`/`vn_note_shares` con RLS deshabilitada y acceso por capa de aplicación; revisión editable antes de guardar; etiquetas `text[]`; copiar + descargar; **ubicación en Mi Espacio**, permiso universal, página en `general-tools/voice-notes.html`.

**A confirmar (producto):** nombre definitivo ("Notas de voz" sugerido); si Rigoberto sugiere un título cuando se deja en blanco (opcional).

---

## 11. Prefijo y convenciones de tablas

Prefijo `vn_` (voice notes), coherente con `pln_`, `sup_`, `teval_`, `ie_`. Filtrado por etiqueta con el operador de contención `cs` sobre `text[]`. Dueño desde `session.user.user_id` (no por email). `updated_at` se setea en cada `PATCH` desde el frontend.
