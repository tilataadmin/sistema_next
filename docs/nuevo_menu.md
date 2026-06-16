# Propuesta de reorganización del menú lateral (sidebar)

**Sistema:** SchoolNet — Colegio Tilatá
**Componente:** `sidebar.js`
**Estado:** Taxonomía y mecanismo cerrados. Implementación **pausada** (en validación con usuarios). Ver Anexos A y B para retomar el código en otro chat.
**Última actualización:** 10 de junio de 2026

---

## 1. Problema

El menú lateral presenta hoy **28 entradas de primer nivel** (Mi Espacio + 27 módulos) en una lista plana. Aunque el acordeón cierra un módulo al abrir otro, la sola lista de encabezados de módulo obliga a un desplazamiento largo y dificulta encontrar las opciones.

El dolor no está en los ítems internos de cada módulo, sino en la cantidad de módulos apilados sin agrupación.

## 2. Objetivo

Introducir una capa de **categorías** que reduzca el primer nivel de ~28 entradas a **8** (Mi Espacio + 7 categorías), mejorando la ubicación de las opciones sin alterar los módulos ni sus permisos.

## 3. Distribución actual (peso por módulo)

Conteo de permisos activos por módulo, como referencia del peso de cada uno:

| Módulo | Ítems |
|---|---|
| Presupuesto | 25 |
| Servicios | 19 |
| Formación | 18 |
| Talento Humano | 17 |
| Admisiones | 17 |
| Gestión Ambiental | 15 |
| Seguimientos | 14 |
| Configuración | 13 |
| Seguridad | 12 |
| Indicadores | 11 |
| Evaluación de Desempeño | 10 |
| Encuestas | 10 |
| Planeación | 10 |
| Egresados | 8 |
| Procedimientos | 7 |
| Estudiantes Nuevos | 6 |
| Proveedores | 5 |
| Gestión de Proyectos y Tareas | 5 |
| Evaluación Institucional | 5 |
| Eventos | 5 |
| Alertas Tempranas | 5 |
| Tilatá te Escucha | 4 |
| Asistencia | 4 |
| Contratos | 3 |
| Conocimiento | 2 |
| Personas | 2 |
| Generador de Certificados | 1 |

(Mi Espacio agrupa además ~16 ítems curados que viven físicamente en otros módulos.)

## 4. Taxonomía propuesta (final)

**Mi Espacio** se mantiene fijo en la parte superior, fuera de toda categoría.

Los 27 módulos restantes se agrupan en 7 categorías:

### 1. Comunidad estudiantil
Estudiantes, familias y personas vinculadas al colegio.
- Admisiones (17)
- Seguimientos (14)
- Egresados (8)
- Estudiantes Nuevos (6)
- Alertas Tempranas (5)
- Personas (2)

### 2. Talento y desarrollo
Gestión de las personas internas del colegio.
- Formación (18)
- Talento Humano (17)
- Evaluación de Desempeño (10)

### 3. Académico
Lo pedagógico y curricular.
- Planeación (10)

> Categoría hoy pequeña, pensada para crecer con los módulos de planeación PAI (MYP) y PD (DP) en el horizonte.

### 4. Gestión institucional
Instrumentos transversales con los que la institución se mide, se escucha, se evalúa y se ajusta a sí misma.
- Indicadores (11)
- Encuestas (10)
- Procedimientos (7)
- Evaluación Institucional (5)
- Gestión de Proyectos y Tareas (5)
- Tilatá te Escucha (4)

### 5. Operaciones y servicios
- Servicios (19)
- Gestión Ambiental (15)
- Eventos (5)
- Asistencia (4)

### 6. Administración y finanzas
- Presupuesto (25)
- Proveedores (5)
- Contratos (3)
- Generador de Certificados (1)

### 7. Sistema
Administración de la plataforma.
- Configuración (13)
- Seguridad (12)
- Conocimiento (2)

**Balance:** entre 1 y 6 módulos por categoría, sin ningún grupo desbordado.

## 5. Decisiones tomadas

- **Nombre de la categoría 4: "Gestión institucional".** Se descartó "Calidad y mejora" por no corresponder al lenguaje del colegio; y "Sistema de gestión" por demasiado genérico. El calificador "institucional" la distingue: agrupa herramientas que actúan sobre la institución como un todo, no sobre un dominio específico.
- **Asistencia → Operaciones y servicios** (en lugar de Académico).
- **Gestión de Proyectos y Tareas → Gestión institucional.** El módulo concentra vistas de supervisión (tableros, "ver todas las tareas/proyectos"); la parte personal ya vive en Mi Espacio ("Gestionar tareas" y el acceso universal a "Proyectos"). Por eso no se traslada a Mi Espacio.
- **Tilatá te Escucha → Gestión institucional.** Misma lógica: la parte personal ("Responder solicitudes TTE") ya está en Mi Espacio; el módulo guarda la administración del canal (categorías, prioridades, gestión, dashboard), que es un instrumento transversal para escuchar a toda la comunidad.
- **Mecanismo de presentación: Opción B (categorías colapsables).** Ver sección 6.
- **Estructura de carpetas en GitHub: solo para páginas nuevas.** Se reorganizará el árbol físico de forma gradual y únicamente al crear páginas nuevas. Las páginas existentes **no se mueven** (ver sección 8 y nota de complejidad).

## 6. Mecanismo de presentación (decidido: Opción B)

- **Opción B — Categorías colapsables (elegida):** tres niveles (categoría → módulo → ítem), colapsadas por defecto salvo la categoría del módulo activo, recordando el estado en `sessionStorage`. Pasa de 28 entradas a 8 en el primer nivel; costo: un nivel más de clic.
- **Opción A — Separadores visuales (descartada):** etiqueta de categoría no clicleable entre grupos. Segmenta pero no acorta la lista.

## 7. Principio de nomenclatura

Los nombres de categoría **no deben repetir nombres de módulo existentes**, para evitar choques de significado. En particular se evitan "Seguimiento" (choca con el módulo Seguimientos), "Planeación" y "Evaluación" a secas.

**Verificación:** ninguna de las 7 categorías colisiona funcionalmente con un nombre de módulo. Existe una superposición solo cosmética entre la categoría "Operaciones y servicios" y el módulo "Servicios"; se acepta, ya que el código agrupa por identificadores y las cadenas son distintas.

## 8. Alcance técnico (qué NO se toca)

Las categorías son **solo una capa de presentación** en `sidebar.js` (un campo `category` por encima de `SIDEBAR_MODULE_ORDER`). No se modifican:

- la estructura de carpetas en GitHub de las páginas existentes (`/modules/...`),
- los `url_path` de los permisos,
- los permisos ni el campo `permission_module`.

El código ya está desacoplado: la carpeta `general-tools/` aloja archivos de varios módulos lógicos (tareas, proyectos, contratos, asistencia, asistente IA, biblioteca) y `profile/` existe aparte. La agrupación del menú se decide por `permission_module` y ahora por categoría, nunca por la ruta del archivo. Por lo tanto, la reorganización del menú no implica cambios en GitHub.

**Relación URL ↔ archivo (contexto importante):**
- La URL de cada página se guarda en `permissions.url_path` y el sidebar la lee de la BD en tiempo de ejecución (`url: p.url_path`). **No** está hardcodeada en `sidebar.js`.
- Crear una página nueva: basta registrar su `url_path` en `permissions`.
- Mover una página existente es costoso: además de `url_path`, hay que ajustar las **rutas relativas internas** del archivo (`../../assets/...`, `config.js`, `sidebar.js`, `dashboard.html`) si cambia la profundidad de carpeta, y corregir cualquier **enlace o redirección** que otras páginas le hagan (esos viven en código, no en la BD). No hay redirección automática. Por eso se decidió aplicar la nueva estructura de carpetas **solo a páginas nuevas**.
- El control de acceso (`validatePageAccess()`) verifica por **nombre** de permiso, no por URL; mover un archivo no rompe el acceso mientras el nombre no cambie.

## 9. Próximos pasos (implementación)

Implementación en `sidebar.js`, sin cambios en base de datos, en tres pasos pequeños con confirmación entre cada uno (entrega vía editor web de GitHub, find-and-replace exacto):

1. **Datos:** definir `SIDEBAR_CATEGORY_ORDER` y agregar el campo `category` a cada módulo de `SIDEBAR_MODULE_ORDER`, reordenándolo por categoría. Cambio inerte (la lista plana solo cambia de orden).
2. **CSS:** estilos del encabezado de categoría y la sangría del tercer nivel.
3. **Render + eventos:** reescribir `buildSidebarHTML` para dibujar la capa de categorías y actualizar `setupSidebarEvents` para colapsar/expandir, recordando el estado en `sessionStorage`.

El detalle concreto para ejecutar está en los Anexos A y B.

---

## Anexo A — Diseño de datos (acordado)

### A.1. Categorías de primer nivel
Mi Espacio queda fijo arriba, sin categoría (`category: null`). Las 7 categorías, en orden, con su id e ícono Bootstrap Icons:

| id | Nombre visible | Ícono |
|---|---|---|
| `community-students` | Comunidad estudiantil | `bi-people` |
| `talent` | Talento y desarrollo | `bi-briefcase` |
| `academic` | Académico | `bi-book` |
| `institutional` | Gestión institucional | `bi-bullseye` |
| `operations` | Operaciones y servicios | `bi-truck` |
| `admin-finance` | Administración y finanzas | `bi-cash-coin` |
| `system` | Sistema | `bi-sliders` |

### A.2. Asignación módulo → categoría (y orden dentro de cada una)
Se conservan íconos y colores actuales de cada módulo; solo se agrega `category` y se reordena el arreglo para agruparlos.

| Orden | Módulo (id) | category |
|---|---|---|
| — | `my-space` | `null` (fijo arriba) |
| 1 | `admissions` | `community-students` |
| 2 | `follow-ups` | `community-students` |
| 3 | `alumni` | `community-students` |
| 4 | `new-students` | `community-students` |
| 5 | `early-alerts` | `community-students` |
| 6 | `community` | `community-students` |
| 7 | `training` | `talent` |
| 8 | `hr` | `talent` |
| 9 | `teacher-eval` | `talent` |
| 10 | `planning` | `academic` |
| 11 | `indicators` | `institutional` |
| 12 | `surveys` | `institutional` |
| 13 | `procedures` | `institutional` |
| 14 | `institutional-eval` | `institutional` |
| 15 | `project-management` | `institutional` |
| 16 | `tte` | `institutional` |
| 17 | `services` | `operations` |
| 18 | `environmental` | `operations` |
| 19 | `events` | `operations` |
| 20 | `attendance` | `operations` |
| 21 | `budget` | `admin-finance` |
| 22 | `suppliers` | `admin-finance` |
| 23 | `contracts` | `admin-finance` |
| 24 | `certificates` | `admin-finance` |
| 25 | `config` | `system` |
| 26 | `security` | `system` |
| 27 | `knowledge` | `system` |

---

## Anexo B — Notas de implementación para retomar

### B.1. Invariantes (no cambian)
- El enlace de cada ítem viene de `permissions.url_path`, leído en `loadSidebarPermissions()`. No hardcodear URLs.
- El orden y la agrupación de **ítems dentro de un módulo** siguen dependiendo de los **nombres** de permiso en `MODULE_ITEM_ORDER` y `MY_SPACE_SUBSECTIONS`. No se tocan en esta reorganización.
- Sin cambios en BD, ni en `url_path`, ni en `permission_module`, ni en permisos.
- Mi Espacio mantiene su render especial por subsecciones (`MY_SPACE_SUBSECTIONS`) y queda **fijo arriba**, fuera de las categorías.

### B.2. Paso 1 — Datos
- Agregar la constante `SIDEBAR_CATEGORY_ORDER` (Anexo A.1) justo antes de `SIDEBAR_MODULE_ORDER`.
- Reescribir `SIDEBAR_MODULE_ORDER` con el campo `category` y el orden de A.2, conservando `icon` y `color` actuales de cada módulo.
- Es inerte: `buildSidebarHTML` aún no usa `category`, así que tras desplegar se ve la misma lista plana en el nuevo orden, sin errores.

### B.3. Paso 2 — CSS
- Clases nuevas para el nivel de categoría, p. ej. `.sn-cat`, `.sn-cat-header`, `.sn-cat-items`, con su estado `.sn-show`/`.sn-active` análogo al de módulos.
- Ajustar sangría: con la categoría como nuevo nivel 1, los encabezados de módulo pasan a nivel 2 y los ítems a nivel 3. Revisar los paddings izquierdos actuales (`.sn-mod-item` usa `padding-left: 50px`; `.sn-mod-item.sn-current` usa `47px`) para que la jerarquía se lea bien con un nivel más.
- Ícono de categoría: en blanco/translúcido, sin chip de color (el chip de color se reserva para módulos, para distinguir niveles).

### B.4. Paso 3 — Render + eventos
- `buildSidebarHTML`:
  - Renderizar primero Mi Espacio (como hoy).
  - Luego iterar `SIDEBAR_CATEGORY_ORDER`; por cada categoría con al menos un módulo visible, dibujar un encabezado de categoría colapsable que contenga sus módulos (cada módulo conserva su propio acordeón de ítems).
  - Default de expansión: categorías colapsadas salvo la que contiene la página activa. Ya existe la detección `currentModuleId` por URL; derivar de ahí la categoría activa y abrirla (y dentro, abrir el módulo activo como hoy).
- `setupSidebarEvents`:
  - Añadir manejo de clic en `.sn-cat-header` (expandir/colapsar). Decidir si el primer nivel es acordeón estricto (una categoría abierta a la vez) o permite varias; recomendado: acordeón estricto, coherente con el comportamiento actual de módulos.
  - Persistir la categoría abierta en `sessionStorage` con una clave nueva, p. ej. `sn_open_category` (análoga a la actual `sn_open_module`).
  - Conservar el comportamiento de módulos e ítems (incluido el cierre en móvil al hacer clic en un ítem).
- Cache: la clave `schoolnet_sidebar_permissions` (sessionStorage) cachea **permisos**, no el orden ni las categorías; como este cambio es solo de código, basta recargar tras desplegar. No requiere limpiar cache.

### B.5. Estilo de trabajo para retomar
Entregar los cambios uno a uno (un paso, esperar confirmación de que funciona, luego el siguiente), como find-and-replace exacto y buscable con Ctrl+F sobre `sidebar.js`. Sin widgets de opción múltiple; dudas en prosa.
