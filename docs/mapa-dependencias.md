# Bitácora — Mapa de dependencias de SchoolNet

**Versión:** 1.0
**Fecha:** 2026-08-04
**Estado:** Escáner funcionando en `developmen`. Interpretación de hallazgos pendiente.
**Repositorio:** `tilataadmin/sistema_next`, rama `developmen`

---

## 1. Problema que originó el trabajo

Tras el cierre del año académico 2025-2026 y la introducción de la distinción entre **año académico** y **año presupuestal**, varias funcionalidades se rompieron en módulos que nadie había tocado. La causa de fondo no fue el cambio en sí, sino que **no existía forma de saber qué páginas dependían de qué tablas**.

SchoolNet ha crecido sin un registro de esas dependencias. Con 424 tablas y 331 archivos con acceso a datos, ningún cambio estructural se puede evaluar de antemano.

**Objetivo:** mapear las dependencias existentes y establecer una metodología para mantener el mapa vivo a medida que el sistema crece.

---

## 2. Dimensión medida

| Métrica | Valor |
|---|---|
| Tablas en la base de datos | 424 |
| Llaves foráneas declaradas | 780 |
| Prefijos de dominio | ~39 (mayores: `svc_` 56, `pln_` 52, `aap_` 30) |
| Archivos con acceso a datos | 331 |
| Funciones de base de datos invocadas desde el frontend | 12 |

---

## 3. Diagnóstico previo al escáner

Hallazgo obtenido leyendo el esquema y `config.js`, antes de construir nada:

- `academic_years` es referenciada por **35 llaves foráneas**.
- El **año presupuestal no es una entidad separada**: es `system_config.current_budget_year_id`, un uuid que apunta a `academic_years(year_id)`. Una sola tabla sirve dos conceptos semánticos distintos.
- **`config.js` no contiene ninguna función que resuelva "el año actual".** No hay una sola mención a `is_current` ni a `current_budget_year_id`. Cada página resuelve la pregunta por su cuenta.

**Conclusión:** la ruptura del cierre anual fue un problema de semántica dispersa, no solo de falta de mapa. El mapa da el radio de impacto; prevenir la ruptura requiere además centralizar la resolución de los conceptos transversales.

---

## 4. Lo que se construyó

### 4.1 Arquitectura elegida

Dos piezas separadas:

| Pieza | Qué es | Ubicación |
|---|---|---|
| **Escáner** | Script Node que recorre el repositorio y genera los reportes | `herramientas/escaner-mapa.js` |
| **Disparador** | Workflow de GitHub Actions que lo ejecuta automáticamente | `.github/workflows/mapa.yml` |

**Por qué GitHub Actions:** no existe entorno local de desarrollo (solo editor web de GitHub). Actions ejecuta el escáner en la nube con cada push a `developmen` y commitea los reportes de vuelta. El mapa nunca se mantiene a mano, por lo tanto no se desactualiza.

### 4.2 Salidas generadas (carpeta `mapa/`)

| Archivo | Contenido |
|---|---|
| `INDICE_INVERSO.md` | Por cada tabla: qué archivos la tocan, con qué operación y en qué líneas. **Es el reporte de impacto.** |
| `POR_PAGINA.md` | Por cada archivo: qué tablas lee, cuáles escribe, cuáles quedan sin determinar, qué funciones invoca |
| `ACOPLAMIENTO.md` | Tablas escritas desde más de un módulo, y tablas con muchos puntos de escritura |
| `CALIDAD.md` | Auditoría del propio escáner: referencias sin determinar, funciones detectadas, nombres descartados |
| `datos.json` | Datos crudos, para construir consultas o una página en SchoolNet más adelante |

### 4.3 Alcance del escáner

**Sí detecta:** consultas PostgREST directas con su verbo HTTP, relaciones embebidas dentro de `select=` (incluida la sintaxis de alias y de desambiguación por `!constraint`), llamadas a funciones `/rpc/`, y consultas armadas en variables (identifica la tabla, no la operación).

**No detecta:** lógica dentro de funciones y triggers de Postgres; accesos desde el repositorio `tilata-ia` (Rigoberto); accesos desde los Google Apps Script; el valor de variables construidas dinámicamente.

---

## 5. Correcciones aplicadas durante la sesión

El escáner pasó por tres rondas. Todas las fallas fueron de diseño del escáner, no del código de SchoolNet.

| # | Defecto | Efecto | Estado |
|---|---|---|---|
| 1 | Funciones `/rpc/` contadas como escrituras | `get_workers_with_permission` aparecía como tabla acoplada | Corregido — van a listado aparte |
| 2 | El verbo HTTP se deducía por cercanía en el texto | Escrituras atribuidas al archivo equivocado; sospecha de sobrecarga falsa sobre `hr` | Corregido — balanceo de paréntesis |
| 3 | Nombres de columna tratados como tablas | `responsible_worker_id` aparecía en el índice | Corregido — filtro por sufijos, con excepción para `student_status` |
| 4 | Opciones pasadas en variable (`opts`) se asumían como `GET` | Borrados reportados como lecturas | Corregido — se marcan como indeterminadas |
| 5 | Llamadas de varias líneas contadas dos veces | 1270 referencias dudosas infladas artificialmente | Corregido — se registran tramos consumidos |

---

## 6. Hallazgos que han sobrevivido a todas las correcciones

### 6.1 Concentración de dependencias (lectura + escritura)

| Tabla | Archivos que la tocan | Observación |
|---|---:|---|
| `workers` | 132 | **40% del sistema.** La tabla más crítica, por encima de estudiantes y años |
| `academic_years` | 82 | 1 de cada 4 páginas. Este era el radio de impacto del cierre anual |
| `grades` | 67 | |
| `courses` | 64 | |
| `users` | 56 | |
| `system_config` | 54 | |
| `students` | 48 | |

La criticidad de `workers` conecta directamente con la deuda conocida de `worker_email_legacy`: cualquier ambigüedad sobre la identidad de un trabajador se propaga por dos quintas partes del sistema.

### 6.2 Acoplamiento entre módulos — los focos

| Tabla | Módulos que escriben | Archivos |
|---|---|---:|
| `tasks` | early-alerts, follow-ups, general-tools, hr, procedures | 11 |
| `budget_assignments` | budget, **hr**, **services** | 9 |
| `procedure_instances` | admissions, general-tools, procedures | 8 |
| `execution_requests` | budget, **services** | 7 |
| `alumni` | alumni, config | 7 |
| `stm_students_topics` | follow-ups, new-students | 6 |
| `worker_training_paths` | hr, training | 6 |

**`budget_assignments` y `execution_requests` son la explicación directa de la ruptura del cierre anual.** Las tablas centrales del presupuesto no las modifica solo el módulo de presupuesto: también las modifican recursos humanos y servicios, desde código escrito sin conocimiento de la distinción académico/presupuestal.

**`tasks` es el caso más disperso del sistema:** once archivos en cinco módulos crean o modifican tareas. Once reglas de negocio conviviendo sin conocerse entre sí.

### 6.3 Dato tranquilizador

`academic_years` tiene solo **4 archivos que la escriben, todos en `config`**. La escritura está bien concentrada. El problema nunca fue quién la modifica, sino los 82 archivos que la leen asumiendo semánticas distintas.

### 6.4 Anomalías estructurales detectadas

- Existe al menos un archivo suelto directamente en `modules/`, fuera de cualquier módulo, que escribe en `hr_balance_adjustments`.
- Hay archivos en la raíz del repositorio que escriben en `users` y `tte_requests`.
- La carpeta `manual/` (documentación de usuario) contiene código funcional que escribe en `support_tickets` y `ticket_history`.
- El módulo `general-tools` sigue vivo y escribiendo en tablas de `hr` y `procedures`, pese a que el documento de reestructuración lo daba por eliminado. Los permisos se movieron; los archivos no.

### 6.5 Funciones de base de datos (dependencia oculta)

Doce funciones invocadas desde el frontend. Su lógica interna es invisible para el escáner:

`get_workers_with_permission` (3 archivos) · `pln_create_planner_cycle` (2) · `fn_extracurricular_enroll` · `pln_create_planner_criterion` · `pln_create_unit_cycle` · `transition_trip_statuses` · `calculate_transport_cost` · `update_pedagogical_trip` · `create_pedagogical_trip` · `execute_trip_banderazo` · `suspend_trip` · `get_pedagogical_trip_students`

---

## 7. Limitaciones conocidas del mapa actual

1. **Las cifras de escritura son un piso, no un total.** Cuando la consulta se arma en una variable, el escáner identifica la tabla pero no la operación. El reporte `CALIDAD.md` cuantifica cuántos casos son y en qué archivos.
2. **No hay contraste contra el catálogo de la base de datos.** Por lo tanto todavía no se pueden producir dos reportes valiosos:
   - **Tablas huérfanas:** existen en Supabase, ningún archivo las usa. Candidatas a depuración.
   - **Tablas fantasma:** el código las invoca, no existen en la base. Bugs latentes.
3. **Cobertura limitada al repositorio principal.** Quedan fuera `tilata-ia` (Rigoberto) y los Google Apps Script.
4. **La lógica dentro de funciones y triggers de Postgres no se analiza.**

---

## 8. Pendientes

### 8.1 Cerrar el escáner

- [ ] Verificar la corrida #3 (estaba en cola al terminar la sesión) y revisar `ACOPLAMIENTO.md` con las cifras ya limpias.
- [ ] Confirmar que `CALIDAD.md` no reporta nombres descartados que sean tablas reales.

### 8.2 Conectar el catálogo de la base de datos

El endpoint `/rest/v1/` de Supabase **ya no funciona con la clave pública** — devuelve `Invalid API key. Only the service_role API key can be used for this endpoint`. Comprobado en DEV el 2026-08-04.

**Decisión tomada:** no usar la clave `service_role` en GitHub. Da control total sobre la base para una tarea que solo requiere lectura de nombres.

**Camino elegido:** crear en Supabase una función de solo lectura que devuelva la lista de tablas y columnas, invocable con la clave pública vía `/rpc/`. Ejecutar en DEV y en PROD.

**Decisión de diseño:** el escáner contrastará contra **DEV y PROD simultáneamente**, etiquetando cada hallazgo. Esto evita falsas alarmas por tablas que solo existen en DEV, y produce gratis un reporte de diferencias de esquema entre ambos ambientes.

- [ ] Escribir y ejecutar la función de catálogo en DEV.
- [ ] Replicar en PROD.
- [ ] Ampliar el escáner para consumirla y generar los reportes de tablas huérfanas y fantasma.

### 8.3 Contratos de dominio (capa humana)

**Principio acordado:** la lista de conceptos a documentar **sale de los datos del escáner, no de intuición.** Las tablas con mayor concentración de dependencias y mayor acoplamiento son las que necesitan contrato.

Cada contrato debe responder: cuál es la fuente de verdad, qué función lo resuelve, qué tablas lo materializan, y qué le pasa en el cierre anual.

Candidatos que la evidencia ya señala:

- [ ] **Identidad del trabajador** (`workers`, 132 archivos) — incluye resolver la deuda de `worker_email_legacy` vs. `worker_id`
- [ ] **Año académico vs. año presupuestal** (`academic_years`, 82 archivos, 35 FK)
- [ ] **Tarea** (`tasks`, 5 módulos escribiendo)
- [ ] **Asignación presupuestal** (`budget_assignments` + `execution_requests`, escritas desde budget, hr y services)

### 8.4 Centralización en `config.js`

- [ ] Crear resolvedores canónicos del año (académico y presupuestal) en `config.js`, y migrar las páginas a usarlos. Este es el cambio que habría evitado la ruptura del cierre anual.

### 8.5 Metodología permanente

- [ ] Incorporar al documento `GUIA_CREAR_NUEVOS_MODULOS.md` un paso obligatorio: declarar a qué conceptos transversales se conecta cada módulo nuevo.
- [ ] Instalar el hábito de consultar `INDICE_INVERSO.md` antes de modificar cualquier tabla del núcleo.
- [ ] Evaluar si el workflow debe fallar el build cuando detecte tablas fantasma (convertir el mapa en control de calidad, no solo documentación).
- [ ] Evaluar una página en SchoolNet que consuma `datos.json` para consultar el mapa cómodamente.

### 8.6 Depuración estructural (menor prioridad)

- [ ] Reubicar el archivo suelto en `modules/` dentro de su módulo.
- [ ] Revisar los archivos de raíz que escriben en `users` y `tte_requests`.
- [ ] Sacar el código funcional de la carpeta `manual/`.
- [ ] Completar la eliminación de `general-tools`: mover los archivos, no solo los permisos.

---

## 9. Estado de los archivos

| Archivo | Rama | Estado |
|---|---|---|
| `herramientas/escaner-mapa.js` | `developmen` | v3 subida, corrida #3 en cola al cierre de sesión |
| `.github/workflows/mapa.yml` | `developmen` | Funcionando, sin cambios previstos |
| `mapa/*` | `developmen` | Regenerados automáticamente en cada push |

**Nada de esto se ha llevado a `main`.** El workflow solo se dispara en `developmen`.

---

## 10. Para retomar en una sesión nueva

> Estoy trabajando en el mapa de dependencias tabla-página de SchoolNet. Ya está funcionando el escáner (`herramientas/escaner-mapa.js`) disparado por GitHub Actions (`.github/workflows/mapa.yml`) en la rama `developmen`, que genera los reportes en la carpeta `mapa/`. Adjunto la bitácora v1.0 y los reportes actuales. Quiero continuar con [conectar el catálogo de la base / escribir los contratos de dominio / centralizar la resolución del año].

---

**Fin del documento — Bitácora v1.0**
