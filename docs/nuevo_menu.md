# Reorganización del menú lateral — Propuesta reconciliada a tres niveles

**Sistema:** SchoolNet — Colegio Tilatá
**Componente:** `sidebar.js` (capa de presentación)
**Propósito:** insumo para la conversación con Dirección General. Concilia la propuesta de reorganización pendiente con la propuesta de la Dirección General, sobre el conjunto **real** de módulos del sistema.
**Estado:** taxonomía en discusión. Implementación pausada. Sin cambios en base de datos.
**Fecha:** 8 de julio de 2026

---

## 1. Punto de partida: dos cosas distintas

Hay dos estructuras que conviene no mezclar:

- **La estructura conceptual / documental** de cómo se piensa el trabajo del colegio (ciclos de vida, procesos, familias de funciones). Es válida y útil para hablar del colegio, pero es un mapa mental.
- **El menú lateral del sistema**, que agrupa **módulos reales** ya construidos. Cada módulo corresponde a un `permission_module` con sus propias páginas y permisos. El menú no puede mostrar como "módulo" algo que en el sistema es un *ítem interno* de otro módulo, ni algo que aún no existe.

La propuesta de la Dirección General mezcla ambas: incluye agrupaciones y hojas que en el sistema son ítems de otro módulo (p. ej. "Nómina") o que no existen como funcionalidad (p. ej. "Cafecitos", "Tilataitas"). Este documento separa esas dos capas: toma el **criterio de clasificación** de la Dirección —que aporta mejoras reales— y lo aplica solo sobre los módulos que hoy existen.

---

## 2. Conjunto real de módulos del sistema

Verificado directamente en `sidebar.js` (`SIDEBAR_MODULE_ORDER`). Hay **23 módulos** + Mi Espacio:

Estudiantes Nuevos · Seguimientos · Alertas Tempranas · Comunidad · Talento Humano · Formación · Evaluación de Desempeño · Indicadores · Tilatá te Escucha · Encuestas · Procedimientos · Evaluación Institucional · Gestión de Proyectos y Tareas · Admisiones · Eventos · Servicios · Asistencia · Gestión Ambiental · Proveedores · Presupuesto · Contratos · Conocimiento · Configuración · Seguridad.

Tres módulos más están **construidos o diseñados** pero **aún no registrados en el menú**: **Egresados**, **Planeación** y **Generador de Certificados**. Deben registrarse en `SIDEBAR_MODULE_ORDER` antes o durante la implementación (se marcan con `*` más abajo).

---

## 3. Elementos de la propuesta de Dirección que NO son módulos del sistema

Estos elementos no pueden colocarse tal cual en el menú. No es un rechazo de la idea: es que en el sistema no son módulos.

| Elemento en la propuesta | Qué es realmente en el sistema | Tratamiento |
|---|---|---|
| **Inculturación** | Es el módulo **Estudiantes Nuevos**. Su descripción literal en `config.js` es "Proceso de inculturación para estudiantes nuevos y sus familias". | Es un cambio de nombre. Mapea a Estudiantes Nuevos. |
| **Nómina** | Ítem interno **"Revisión de nómina"** dentro de Talento Humano. | No es módulo. Vive dentro de Talento Humano. |
| **Selección / Retención (Bienestar) / Desvinculación** | No existen como módulos. Son etapas del ciclo laboral, aún no implementadas. | No son módulos. Definir si se crearán a futuro. |
| **Cafecitos / Tilataitas** | No aparecen en ningún archivo del sistema. | No existen. Definir si son módulos futuros o conceptos. |
| **Familias** (como agrupador) | No hay módulo "Familias". El portal de familias vive dentro de `config/families.html`. | No es un módulo de menú por sí mismo. |
| **Evaluaciones** (en Currículo) | No hay un módulo "Evaluaciones" curricular en el menú. Los resultados de evaluación viven en Mi Espacio y en otros módulos. | Aclarar a qué se refiere antes de ubicarlo. |

Además, dos ubicaciones de la propuesta chocan con lo que el sistema hace realmente:

- **Contratos** no son contratos laborales: son **plantillas de contratos recurrentes** (servicios, compras). Por tanto no van bajo Talento Humano.
- **Generador de Certificados** no es financiero: sube una plantilla y genera PDFs de reconocimiento (p. ej. participación en Modelos ONU). No va bajo finanzas.

---

## 4. Mapeo lado a lado (solo módulos reales)

Ordenado por la versión reconciliada. `Doc original` = propuesta pendiente de 7 categorías. `Dirección` = propuesta de Dirección General, ya mapeada a módulos reales.

| Módulo real | Doc original | Dirección General | Versión 3 niveles |
|---|---|---|---|
| Admisiones | Comunidad estudiantil | I · Estudiantes nuevos | **1. Estudiantes y familias** |
| Estudiantes Nuevos | Comunidad estudiantil | I · Estudiantes nuevos (Inculturación) | **1. Estudiantes y familias** |
| Alertas Tempranas | Comunidad estudiantil | I · Estudiantes antiguos | **1. Estudiantes y familias** |
| Seguimientos | Comunidad estudiantil | I · Estudiantes antiguos | **1. Estudiantes y familias** |
| Egresados `*` | Comunidad estudiantil | I · Egresados | **1. Estudiantes y familias** |
| Comunidad | Comunidad estudiantil | I · Familias (implícito) | **1. Estudiantes y familias** |
| Tilatá te Escucha | Gestión institucional | I · Familias | **1. Estudiantes y familias** *(abierto)* |
| Talento Humano | Talento y desarrollo | II · Talento Humano | **2. Talento y desarrollo** |
| Formación | Talento y desarrollo | II · Desarrollo Profesional | **2. Talento y desarrollo** |
| Evaluación de Desempeño | Talento y desarrollo | II · Evaluación de Desempeño | **2. Talento y desarrollo** |
| Planeación `*` | Académico | III · Planeaciones | **3. Currículo** |
| Indicadores | Gestión institucional | IV · Sistema de evaluación | **4. Medición y evaluación institucional** |
| Encuestas | Gestión institucional | IV · Sistema de evaluación | **4. Medición y evaluación institucional** |
| Evaluación Institucional | Gestión institucional | IV · Sistema de evaluación | **4. Medición y evaluación institucional** |
| Procedimientos | Gestión institucional | IV · Procesos | **5. Procesos y operación** |
| Gestión de Proyectos y Tareas | Gestión institucional | IV · Procesos · Proyectos y tareas | **5. Procesos y operación** |
| Eventos | Operaciones y servicios | IV · Procesos · Proyectos y tareas · Eventos | **5. Procesos y operación** |
| Servicios | Operaciones y servicios | IV · Procesos · Servicios | **5. Procesos y operación** |
| Gestión Ambiental | Operaciones y servicios | IV · Procesos · … · Gestión Social y Ambiental | **5. Procesos y operación** |
| Asistencia | Operaciones y servicios | (no ubicado) | **5. Procesos y operación** |
| Presupuesto | Administración y finanzas | (no comentado) | **6. Finanzas** |
| Proveedores | Administración y finanzas | (no comentado) | **6. Finanzas** |
| Generador de Certificados `*` | Administración y finanzas | (no comentado) | **7. Herramientas** *(abierto)* |
| Contratos | Administración y finanzas | II · Contratos | **7. Herramientas** |
| Conocimiento | Sistema | (no comentado) | **7. Herramientas** *(abierto)* |
| Configuración | Sistema | (no comentado) | **8. Sistema** |
| Seguridad | Sistema | (no comentado) | **8. Sistema** |

`*` No están hoy en `SIDEBAR_MODULE_ORDER`; requieren registrarse.

---

## 5. Qué aporta la propuesta de Dirección (y se conserva)

Depurada de lo que no es del sistema, la propuesta de Dirección aporta tres criterios mejores que el documento original, y se incorporan:

1. **"Currículo"** como etiqueta, en lugar de "Académico". Más claro y alineado con el lenguaje IB.
2. **Separar la medición** de los procesos: agrupar Indicadores + Encuestas + Evaluación Institucional como un "sistema de evaluación" coherente. El documento original los diluía en una única "Gestión institucional" que además cargaba procedimientos, proyectos y TTE.
3. **Encuadre por ciclo de vida estudiantil** (nuevos → antiguos → egresados), que ordena con claridad la categoría de estudiantes.

Lo que **no** se adopta, y por qué:

- **La profundidad de cuatro niveles.** La rama más profunda de la propuesta (Gestión → Procesos → Proyectos y tareas → Eventos) exige cinco toques para abrir una página. El menú lateral es una herramienta de acceso frecuente, no un organigrama; cada nivel extra es un acordeón más donde perderse. Su intención se conserva **promoviendo los sub-grupos a categorías de primer nivel** (por eso "Medición" y "Procesos" son categorías, no sub-niveles), sin sumar profundidad.
- **La subordinación Eventos ⊂ Proyectos y tareas.** En el sistema son dos módulos **hermanos**, no uno dentro del otro. En la versión reconciliada quedan al mismo nivel.

---

## 6. Propuesta final a tres niveles

Tres niveles interactivos: **categoría → módulo → ítem**. Mi Espacio queda fijo arriba, fuera de categorías, con su render actual por subsecciones.

**Mi Espacio** *(fijo)*

**1. Estudiantes y familias** — Admisiones · Estudiantes Nuevos · Alertas Tempranas · Seguimientos · Egresados `*` · Comunidad · Tilatá te Escucha *(ubicación abierta)*

**2. Talento y desarrollo** — Talento Humano · Formación · Evaluación de Desempeño

**3. Currículo** — Planeación `*`

**4. Medición y evaluación institucional** — Indicadores · Encuestas · Evaluación Institucional

**5. Procesos y operación** — Procedimientos · Gestión de Proyectos y Tareas · Eventos · Servicios · Gestión Ambiental · Asistencia

**6. Finanzas** — Presupuesto · Proveedores

**7. Herramientas** — Generador de Certificados `*` · Contratos · Conocimiento

**8. Sistema** — Configuración · Seguridad

**Resultado:** el primer nivel baja de ~28 entradas a **9** (Mi Espacio + 8 categorías). Ninguna categoría supera 7 módulos. Nada se anida más allá de categoría → módulo → ítem.

---

## 7. Principios aplicados

- **Máximo tres niveles interactivos.** Cuando una categoría se recarga, se **parte en dos categorías**, no se anida un nivel más.
- **Los encabezados de agrupación no son destinos.** "Procesos", "Medición", etc. son rótulos; no necesitan ser un nivel de acordeón clicleable.
- **Sin colisión de nombres.** El nombre de categoría no repite un nombre de módulo. Por eso la categoría 2 se llama "Talento y desarrollo" y no "Talento Humano" (que es el módulo).
- **Solo capa de presentación.** No se tocan permisos, `permission_module`, `url_path` ni la estructura de carpetas de páginas existentes. El menú agrupa por identificadores, no por ruta de archivo.

---

## 8. Decisiones abiertas (para resolver en la conversación)

1. **Herramientas como categoría propia vs. dentro de Sistema.** Certificados, Contratos (plantillas) y Conocimiento son utilidades transversales sin dominio natural. Como categoría "Herramientas" quedan honestas pero es un grupo pequeño; dentro de "Sistema" evita crear categoría, pero mezcla funciones de usuario final con administración de plataforma.
2. **Certificados por uso.** Si los reconocimientos son casi siempre para estudiantes, Certificados podría ir a "Estudiantes y familias"; entonces Contratos quedaría como única utilidad suelta.
3. **Tilatá te Escucha.** Ubicado en "Estudiantes y familias" siguiendo el criterio de Dirección (canal de escucha a la comunidad), pero es transversal —también aplica a personal— y podría vivir en la categoría de medición/escucha institucional. Es el único módulo cuya casa es genuinamente discutible.

---

## 9. Elementos a definir a futuro (no bloquean el menú)

Conceptos de la propuesta de Dirección que hoy no existen como funcionalidad. Si se desea que aparezcan en el menú, primero deben construirse como módulos:

- **Cafecitos**, **Tilataitas** (área de vinculación con familias).
- Etapas del ciclo laboral como módulos propios: **Selección**, **Retención (Bienestar)**, **Desvinculación** (hoy, parcialmente, dentro de Talento Humano).
- **Evaluaciones** curricular, si se refiere a algo distinto de los resultados de evaluación que ya existen.

---

## 10. Alcance técnico (qué NO se toca)

- Sin cambios en base de datos, permisos, `permission_module` ni `url_path`.
- Sin mover páginas existentes en GitHub (la nueva estructura de carpetas aplica solo a páginas nuevas).
- La única precondición: registrar en `SIDEBAR_MODULE_ORDER` los módulos ya construidos que aún no están en el menú (Egresados, Planeación, Generador de Certificados).
- Implementación en tres pasos con confirmación entre cada uno: (1) datos —categorías y campo `category`—, (2) CSS del nivel de categoría, (3) render + eventos con estado en `sessionStorage`.
