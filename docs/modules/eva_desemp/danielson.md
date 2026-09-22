# Evaluación de desempeño docente — Rúbrica Danielson
## Documento de referencia de acuerdos

**Proyecto:** SchoolNet (tilata_next) — Colegio Tilatá
**Módulo:** `teacher-eval`
**Fecha:** 22 de septiembre de 2026
**Estado:** Acuerdos funcionales cerrados. Sin cambios de código ni de base de datos todavía.
**Versión:** 2 — incluye la forma de los datos requerida para los resultados gráficos (sección 5), según el documento *Danielson_ejemplos_resultados.pdf*.

---

## 1. Contexto

La rúbrica Danielson (adaptada por el Colegio Tilatá) ya está cargada en SchoolNet y se administra desde `rubric.html`. Su estructura actual en base de datos es:

| Tabla | Contenido |
|---|---|
| `teval_rubric_domains` | Dominios (1 a 4) |
| `teval_rubric_components` | Componentes (1a … 4f), vinculados a un dominio |
| `teval_rubric_levels` | Niveles: Mínimo, Básico, Satisfactorio, Avanzado (`level_order` 1 a 4) |
| `teval_rubric_descriptors` | Un texto por componente y nivel (`UNIQUE (component_id, level_id)`) |

Hoy las viñetas de cada nivel existen solo como texto plano dentro de `descriptor_text`, separadas por el carácter `●`, y se editan en un único `textarea`. La viñeta no es una entidad y no puede ser referenciada.

Estructura de la rúbrica: 4 dominios, 21 componentes, 4 niveles por componente.

---

## 2. Principio general: independencia

La evaluación Danielson es **independiente** de lo que ya existe en el módulo `teacher-eval` (formularios, `teval_periods`, `teval_period_forms`, `teval_sessions`, `teval_responses`). Esos elementos siguen funcionando sin cambios.

Danielson comparte únicamente:
- La rúbrica (`teval_rubric_*`), que se extiende con viñetas (Acuerdo 1).
- El catálogo general del sistema: años académicos (`academic_years`), usuarios, trabajadores y permisos.

---

## 3. Acuerdos

### Acuerdo 1 — Viñetas por nivel

- En cada componente, cada nivel de desempeño contiene **tantas viñetas como se necesiten**, cada una con su propio texto.
- El número de viñetas **no tiene que coincidir entre niveles** (ejemplo: en 1d, Mínimo tiene dos viñetas y Básico una).
- En la autoevaluación y en la revisión **se marcan viñetas, no niveles**.
- Las viñetas son independientes dentro de su nivel. Se descarta el modelo de "criterios alineados entre niveles".

**Implicaciones:**
- La viñeta pasa a ser una entidad propia, hija del descriptor (componente + nivel), con texto, orden y estado.
- Las viñetas existentes se migran partiendo el `descriptor_text` actual por el carácter `●`.
- La interfaz de `rubric.html` permite agregar, editar, reordenar e inactivar viñetas una por una. Deja de existir el `textarea` único.
- **Integridad histórica:** una viñeta que ya tenga marcas no puede borrarse, solo inactivarse. Lo mismo aplica a niveles, componentes y dominios. Los borrados en cascada que hoy hace `rubric.html` deben reemplazarse por inactivación cuando existan evaluaciones asociadas.
- El orden de los niveles (`level_order`) no puede cambiar mientras existan evaluaciones registradas, porque es el valor numérico del nivel (Acuerdo 3).

---

### Acuerdo 2 — Ciclos de evaluación

- Los ciclos Danielson se definen dentro de los años académicos existentes (`academic_years`).
- Cada año académico puede tener **uno o dos ciclos**, nunca más de dos. El número puede variar de un año a otro.
- Los ciclos **no tienen fechas**. Su vigencia depende solo del estado: **abierto** o **cerrado**.
- **Solo puede haber un ciclo abierto en todo el sistema**, sin importar el año académico. Para abrir un ciclo hay que cerrar primero el que esté abierto.
- Los ciclos son una entidad nueva, **independiente de `teval_periods`**.

**Datos del ciclo relevantes para los resultados:**
- Número del ciclo dentro del año (1 o 2). El orden cronológico de los ciclos se obtiene de `academic_years.year_order` (o `start_year`) más el número del ciclo.
- Copia (*snapshot*) de los rangos de nivel usados en el ciclo (ver Acuerdo 3 y sección 5.3).

**Advertencia de nombres:** `academic_years` ya tiene una columna `cycles` (junto con `days_per_cycle`) que corresponde a los ciclos del horario escolar, no a los ciclos de evaluación. Las tablas y campos nuevos deben usar un nombre que no se confunda con ese concepto (por ejemplo, un prefijo propio de Danielson).

**Consecuencia de diseño:** las pantallas del profesor y del directivo trabajan siempre sobre el único ciclo abierto, sin pedir que se seleccione uno. Si hace falta completar algo de un ciclo anterior, ese ciclo se reabre temporalmente.

---

### Acuerdo 3 — Autoevaluación docente y valoración por componente

**Proceso:**
- Cada profesor hace una **autoevaluación completa** de todos los dominios y componentes.
- En cada componente marca las viñetas que describen su práctica actual. Puede marcar viñetas de uno o de varios niveles, en cualquier combinación.
- **Completitud:** para enviar la autoevaluación, cada componente debe tener **al menos una viñeta marcada**.

**Regla de cálculo: promedio ponderado por cobertura de nivel.**

Valor de cada nivel = `level_order` (Mínimo 1, Básico 2, Satisfactorio 3, Avanzado 4).

1. Para cada nivel se calcula la cobertura: `viñetas marcadas del nivel / viñetas activas del nivel`.
2. Valoración del componente = `Σ (valor del nivel × cobertura) / Σ (cobertura)`.

Esta regla evita que un nivel con más viñetas pese más que otro con menos.

| Ejemplo (4 niveles, 2 viñetas cada uno) | Coberturas | Valoración |
|---|---|---|
| A: las 2 de Mínimo y las 2 de Básico | 1, 1, 0, 0 | (1 + 2) / 2 = **1,50** |
| B: 1 viñeta de cada nivel | 0,5 en cada nivel | (0,5 + 1 + 1,5 + 2) / 2 = **2,50** |

**Formato del resultado:**
- Se guarda el **valor numérico con dos decimales**.
- El nivel con nombre se **deriva** mediante rangos configurables (no fijos en el código). Rangos iniciales, que equivalen a redondear al nivel más cercano:

| Rango | Nivel |
|---|---|
| 1,00 – 1,49 | Mínimo |
| 1,50 – 2,49 | Básico |
| 2,50 – 3,49 | Satisfactorio |
| 3,50 – 4,00 | Avanzado |

- La valoración **se congela al enviar**. Los cambios posteriores en la rúbrica no alteran resultados de ciclos anteriores.
- Al cerrar un ciclo, los rangos vigentes se **copian al ciclo**. Así, si el colegio cambia los rangos más adelante, los niveles de ciclos anteriores se siguen derivando con los rangos que aplicaban en su momento. Mientras el ciclo está abierto se usan los rangos vigentes.

**Semántica del nivel Mínimo:**
- La instrucción al profesor será "marque las viñetas que **describen su práctica actual**", en lugar de "que tiene desarrolladas". Así, marcar viñetas de Mínimo no resulta contradictorio.
- El sistema **no bloquea** ninguna combinación.
- Si en un componente las viñetas marcadas quedan en niveles separados por dos o más posiciones (por ejemplo, Mínimo y Satisfactorio), se muestra un **aviso no bloqueante** para que el profesor revise y confirme.
- La dispersión se puede calcular a partir de las marcas y sirve como insumo para la reunión con el directivo. No requiere un campo adicional.

---

### Acuerdo 4 — Asignación de directivo revisor

- El grupo de directivos está conformado por Dirección General, Rectoría, las 3 Direcciones de Sección, Dirección de SER y Dirección de Desarrollo Profesional.
- Cada profesor tiene asignado **un solo directivo** que revisa su autoevaluación y le da realimentación.
- Existe una **interfaz de asignación** profesor → directivo.
- Al asignar, se guarda una copia de la **sección del profesor en ese ciclo** (`workers.section_id` puede cambiar de un año a otro). Las vistas grupales por sección usan esa copia, no la sección actual.
- La asignación se hace **por ciclo**. Al crear un ciclo se pueden **copiar las asignaciones del ciclo anterior** y ajustarlas. Cada ciclo conserva su propio registro de quién revisó a quién.
- **Reasignación:**
  - Libre mientras la revisión no haya comenzado.
  - Si la revisión ya comenzó, se permite con confirmación explícita y queda registro de quién hizo el cambio y cuándo.

**Pendiente de definir al programar:** cómo se identifica a directivos y profesores. Las alternativas son tomarlos de `job_roles` / `worker_job_roles` (cargos) o mantener una lista propia de Danielson.

---

### Acuerdo 5 — Revisión conjunta (realimentación)

- La revisión se hace en una **reunión conjunta** entre el directivo y el profesor.
- Parte de las viñetas que marcó el profesor. En la reunión se pueden **marcar viñetas nuevas y desmarcar** las que había marcado el profesor.
- Se aplica la misma regla de cálculo del Acuerdo 3.
- **El sistema guarda dos versiones**, cada una con su valoración congelada:
  1. **Autoevaluación:** tal como la envió el profesor.
  2. **Revisada:** resultado de la reunión conjunta.
- La revisión **no sobrescribe** la autoevaluación. La comparación entre la percepción del profesor y el resultado acordado es uno de los datos centrales del proceso.

---

### Acuerdo 6 — Resultados agregados

**Principio técnico:** se guarda solo lo que no se puede recalcular.
- **Se guarda y se congela:** la valoración de cada componente, en sus dos versiones (autoevaluación y revisada).
- **Se calcula al consultar:** los agregados por dominio y el global. No se guardan, así que un cambio futuro en la forma de agregar no exige migrar datos.

**Reglas:**
- **Dominio:** promedio simple de las valoraciones de sus componentes.
- **Global:** promedio de los cuatro promedios de dominio. Cada dominio pesa lo mismo, independientemente de su número de componentes (el dominio 4 tiene seis y los demás cinco).
- Se promedia sobre valores con decimales, sin redondear antes. El nivel con nombre se deriva al final con los rangos del Acuerdo 3.
- No se implementa ponderación por dominio. Como el global es un promedio de dominios, agregar pesos más adelante sería un cambio menor.

**Presentación:** lo principal es el perfil por componente y por dominio, con autoevaluación frente a revisada. El resultado global es un dato secundario.

---

### Acuerdo 7 — Plan de mejora

Criterio: "tan simple como sea posible, pero no tanto".

**Estructura:**
- **Un plan por profesor por ciclo**, registrado por el directivo durante o después de la reunión conjunta.
- **Entre una y tres metas** por plan.
- Cada meta contiene:

| Elemento | Obligatorio | Descripción |
|---|---|---|
| Componente de la rúbrica | Sí (uno) | Le da trazabilidad a la meta entre ciclos |
| Descripción de la meta | Sí | Texto libre |
| Acciones concretas | Sí | Qué hará el profesor y qué apoyo recibe del colegio |
| Fecha de seguimiento | No | Referencia para que la meta no se quede en el papel |

**Apoyo del sistema:** al crear una meta, el sistema **sugiere** (sin asignar) los componentes con la valoración revisada más baja. El directivo puede escoger cualquier otro.

**Cierre y continuidad:**
- El profesor da **acuse** del plan (constancia de conocimiento, no aprobación).
- Cada meta queda en estado **pendiente** hasta el ciclo siguiente.
- Al comenzar la revisión conjunta del ciclo siguiente, el sistema muestra las metas del plan anterior. El directivo marca cada una como **cumplida**, **parcialmente cumplida** o **no cumplida**, con un comentario breve. Junto a cada meta se muestran la valoración anterior y la actual del componente.

**Fuera de alcance (por ahora):** subtareas, porcentajes de avance, seguimientos intermedios múltiples, adjuntos o evidencias, flujos de aprobación con varios actores y notificaciones automáticas.

**Opción a decidir en la implementación:** permitir marcar en cada meta una o dos **viñetas objetivo** (por ejemplo, la viñeta de Satisfactorio que el profesor busca alcanzar). El costo es bajo porque las viñetas ya serán entidades, pero agrega un paso en la reunión.

---

## 4. Flujo resumido de un ciclo

1. Se crea el ciclo dentro del año académico (máximo dos por año) y se abre. Solo puede haber uno abierto en el sistema.
2. Se asigna un directivo a cada profesor (o se copian las asignaciones del ciclo anterior).
3. Cada profesor diligencia y envía su autoevaluación completa (al menos una viñeta por componente). Se congela la versión de autoevaluación.
4. Directivo y profesor hacen la reunión conjunta:
   - Se revisan las metas del plan del ciclo anterior, si existe.
   - Se ajustan las viñetas (marcar o desmarcar). Se congela la versión revisada.
   - Se construye el plan de mejora (1 a 3 metas).
5. El profesor da acuse del plan.
6. Se cierra el ciclo.

---

## 5. Forma de los datos para los resultados

Esta sección define qué datos se deben guardar y cómo se derivan los resultados mostrados en *Danielson_ejemplos_resultados.pdf* (ejemplos 1 a 15). Los nombres de entidades son **lógicos**: los nombres definitivos de tablas y campos se fijan al programar, verificándolos contra `Data_Base`.

### 5.1 Principio

Todos los gráficos se obtienen de un conjunto pequeño de datos guardados. Ningún gráfico requiere guardar agregados: dominios, global, promedios de grupo, distribuciones y brechas se calculan al consultar (Acuerdo 6).

### 5.2 Datos que se guardan (modelo lógico)

| Entidad | Granularidad | Datos principales | Ejemplos que la usan |
|---|---|---|---|
| **Viñeta** | Una por viñeta | Descriptor (→ componente + nivel), texto, orden, estado | 5 |
| **Ciclo** | Uno por ciclo | Año académico, número (1 o 2), estado, apertura y cierre (quién, cuándo), copia de rangos de nivel | Todos (filtro y orden) |
| **Evaluación del profesor en el ciclo** | Una por profesor por ciclo | Ciclo, profesor, directivo asignado, **sección del profesor (copia)**, estado, fechas de envío y de revisión, acuse del plan | Todos |
| **Registro de reasignaciones** | Uno por cambio | Evaluación, directivo anterior, directivo nuevo, quién, cuándo | — (trazabilidad) |
| **Marca de viñeta** | Una por viñeta marcada y versión | Evaluación, viñeta, versión (`autoevaluacion` / `revisada`) | 5 |
| **Resultado por componente** | Uno por componente y versión | Evaluación, componente, versión, valor numérico (2 decimales), congelado | 1 a 4, 6 a 14 |
| **Meta del plan de mejora** | Una por meta (1 a 3 por evaluación) | Evaluación (ciclo del plan), componente, descripción, acciones, fecha de seguimiento (opcional), [viñetas objetivo, opcional], estado, comentario de cierre, ciclo en que se evaluó, quién y cuándo | 7, 8, 15 |
| **Configuración** | Única | Rangos de nivel vigentes, tamaño mínimo de grupo para vistas por sección | 1, 3, 9, 10, 13 |

**Estados de la evaluación del profesor** (necesarios para filtrar los resultados): `pendiente` → `autoevaluacion_enviada` → `en_revision` → `revisada`. El acuse del plan se registra aparte (fecha), no como estado.

**Estados de la meta:** `pendiente` (al crearla) → `cumplida` / `parcialmente_cumplida` / `no_cumplida` (al evaluarla en el ciclo siguiente).

### 5.3 Copias (*snapshots*) necesarias y por qué

| Dato copiado | Motivo | Ejemplos afectados |
|---|---|---|
| Valor de cada componente, por versión | La rúbrica puede cambiar (viñetas nuevas o inactivas); el valor histórico no debe moverse | Todos |
| Sección del profesor en el ciclo | El profesor puede cambiar de sección entre años; las comparaciones por sección deben reflejar dónde estaba | 10, 11 |
| Rangos de nivel del ciclo (al cerrar) | Si el colegio cambia los rangos, los niveles de ciclos anteriores no deben cambiar | 1, 3, 9, 13 |

Además, la **identidad del componente** debe ser estable entre ciclos: se usa `component_id`, y un `component_code` (por ejemplo "3d") no se reutiliza para un componente con otro contenido. Sin esto no son posibles las vistas de evolución (6, 7, 8).

### 5.4 Cálculos por ejemplo

Notación: *R(v)* = resultados por componente de la versión *v* (autoevaluación o revisada); *prom. dominio* = promedio simple de los componentes del dominio; *global* = promedio de los cuatro promedios de dominio; *nivel(x)* = nivel según los rangos del ciclo.

| # | Vista | Entrada | Cálculo |
|---|---|---|---|
| 1 | Perfil por dominio | R(auto) y R(revisada) de un profesor en un ciclo | Prom. dominio por versión; global por versión |
| 2 | Radar | Igual que 1 | Igual que 1 |
| 3 | Mapa de 21 componentes | R(auto) y R(revisada) de un profesor en un ciclo | nivel(x) por casilla; marca si \|auto − revisada\| ≥ 0,5 |
| 4 | Brecha de percepción | Igual que 3 | auto − revisada por componente; las 3 mayores |
| 5 | Distribución de viñetas | Marcas (versión autoevaluación) del profesor, unidas a viñeta → descriptor → componente (dominio) y nivel | Conteo por dominio × nivel; % por dominio |
| 6 | Evolución por dominio | R(revisada) del profesor en todos sus ciclos, en orden cronológico | Prom. dominio y global por ciclo |
| 7 | Evolución por componente | R(revisada) del profesor por ciclo + componentes que han sido meta en sus planes | Serie por componente; resaltar componentes con meta |
| 8 | Seguimiento de metas | Metas del plan del ciclo anterior + R(revisada) de ese ciclo y del actual | Para cada meta: valor en el ciclo del plan vs. valor en el ciclo actual del mismo componente; estado de la meta |
| 9 | Niveles por componente (grupo) | R(revisada) de todas las evaluaciones `revisada` del ciclo | nivel(x) por profesor y componente; % de profesores por nivel en cada componente |
| 10 | Mapa por sección | R(revisada) del ciclo + sección copiada | Promedio por sección × componente y fila del colegio; ocultar secciones con menos profesores que el mínimo configurado |
| 11 | Auto vs. revisada por profesor | R(auto) y R(revisada) de todas las evaluaciones `revisada` del ciclo + sección copiada | Global por versión y profesor; marcar brecha > 0,5 |
| 12 | Dispersión por dominio | R(revisada) del ciclo | Prom. dominio por profesor; mediana y cuartiles (se pueden calcular en el cliente) |
| 13 | Evolución de niveles (grupo) | R(revisada) de todos los ciclos | Global revisado por profesor y ciclo → nivel(x) con los rangos de cada ciclo → % por nivel |
| 14 | Evolución por dominio y brecha (grupo) | R(auto) y R(revisada) de todos los ciclos | Promedio de los prom. dominio de los profesores por ciclo; brecha = promedio de (global auto − global revisada) por ciclo |
| 15 | Cumplimiento de metas | Metas agrupadas por ciclo del plan, ya evaluadas | % por estado |

### 5.5 Reglas de inclusión

- **Vistas grupales y de evolución:** solo incluyen evaluaciones en estado `revisada`. Una autoevaluación enviada pero no revisada solo aparece en las vistas individuales del ciclo actual.
- **Profesores sin evaluación en un ciclo:** la serie queda con un hueco (no se interpola ni se asume cero).
- **Componentes inactivados:** no aparecen en ciclos posteriores a su inactivación; en las vistas de evolución se muestran hasta el último ciclo en que existieron.
- **Cobertura de nivel:** se calcula con las viñetas activas al momento de congelar. Como el valor queda congelado, inactivar viñetas después no altera resultados.
- **Tamaño mínimo de grupo:** las vistas por sección (10 y, si se filtra por sección, 9, 11 y 12) no muestran promedios de grupos con menos profesores que el mínimo configurado, para evitar identificar a alguien.
- **Metas:** una meta en estado `pendiente` no entra en el ejemplo 15.

### 5.6 Fuente de datos para las consultas

Se sugiere una **fuente única y plana** para todas las vistas, con una fila por *ciclo × profesor × componente × versión*:

`ciclo, orden_ciclo, año_académico, profesor, sección_copiada, directivo, dominio (id, orden), componente (id, código, orden), versión, valor`

Todas las vistas 1 a 4 y 6 a 14 se construyen filtrando y agrupando esta fuente. Las vistas 5 (marcas) y 8 y 15 (metas) usan además las marcas y las metas.

**Volumen y límite de filas:** con unos 50 profesores, un ciclo produce del orden de 50 × 21 × 2 ≈ 2.100 filas, y varios ciclos multiplican esa cifra. Supera el límite por defecto de filas por respuesta de la API de Supabase (1.000). Para las vistas grupales conviene una función RPC que devuelva los datos ya agregados (por componente, dominio o profesor), o bien paginar. Las vistas individuales (≈ 42 filas por ciclo) no tienen este problema.

---

## 6. Pendientes

| Tema | Estado |
|---|---|
| Observaciones de clase (quién observa, cuántas, qué se registra, alcance, relación con la revisión) | Sin acuerdos. Fuera del alcance actual |
| Identificación de directivos y profesores (`job_roles` / `worker_job_roles` o lista propia) | Se define al iniciar la programación |
| Viñetas objetivo en las metas del plan de mejora | Se decide en la implementación |
| Permisos del módulo para las nuevas funciones (administración de ciclos, asignación, autoevaluación, revisión, plan de mejora, reportes) | Se define al iniciar la programación |
| Permisos de visualización: quién ve vistas individuales de otros profesores y quién ve vistas grupales | Se define junto con los permisos del módulo |
| Tamaño mínimo de grupo para mostrar promedios por sección | Valor por definir (configurable) |
| Vistas de la primera versión (sugeridas: ejemplos 1, 3, 8, 9 y 11) | Se confirma al iniciar la programación |

---

## 7. Reglas de integridad a respetar en la implementación

- No borrar físicamente viñetas, niveles, componentes ni dominios que tengan evaluaciones asociadas. Se inactivan.
- No modificar `level_order` si existen evaluaciones registradas.
- Las valoraciones por componente se congelan al enviar la autoevaluación y al cerrar la revisión.
- Los agregados (dominio y global) nunca se guardan; se calculan al consultar.
- La sección del profesor y los rangos de nivel se copian al ciclo; las vistas históricas usan esas copias.
- `component_id` es la identidad estable del componente; no reutilizar un `component_code` para otro contenido.
- Las vistas grupales y de evolución solo usan evaluaciones en estado `revisada`.
- Solo un ciclo abierto en todo el sistema; máximo dos ciclos por año académico.
- Antes de programar, verificar nombres de tablas y campos en `Data_Base` y las librerías de `config.js`. No inventar nombres.
