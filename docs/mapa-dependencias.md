# Bitácora — Mapa de dependencias y contrato de identidad

**Versión:** 2.0
**Fecha:** 2026-08-05
**Estado:** Escáner operativo. Contrato de cargos y roles implementado en DEV y PROD. Migración de presupuestos pendiente.
**Repositorio:** `tilataadmin/sistema_next`

---

## 1. Origen y evolución del trabajo

El objetivo inicial era mapear qué páginas dependen de qué tablas, tras el cierre del año académico 2025-2026 que rompió funcionalidades en módulos que nadie había tocado.

El mapa se construyó y funciona. Pero al analizar sus resultados apareció una causa estructural más profunda que el objetivo original: **la identidad del trabajador estaba partida en dos y el sistema no podía distinguirlas.** Esa se corrigió en esta sesión.

Queda pendiente aplicar la corrección a las tablas de presupuesto, que es donde el problema se manifestó primero.

---

## 2. Lo construido: el mapa de dependencias

### 2.1 Arquitectura

| Pieza | Ubicación | Función |
|---|---|---|
| Escáner | `herramientas/escaner-mapa.js` | Recorre el repositorio y genera los reportes |
| Disparador | `.github/workflows/mapa.yml` | GitHub Actions, corre con cada push a `developmen` |
| Reportes | `mapa/` | Se regeneran solos, nunca se editan a mano |

### 2.2 Salidas

| Archivo | Contenido |
|---|---|
| `INDICE_INVERSO.md` | Por tabla: qué archivos la tocan, con qué operación y en qué líneas |
| `POR_PAGINA.md` | **Por archivo: qué tablas lee, cuáles escribe, qué funciones invoca** |
| `ACOPLAMIENTO.md` | Tablas escritas desde más de un módulo, y tablas con muchos puntos de escritura |
| `CALIDAD.md` | Auditoría del escáner: referencias sin determinar, funciones, nombres descartados |
| `datos.json` | Datos crudos, base para una futura página de consulta en SchoolNet |

**Nota:** `POR_PAGINA.md` ya responde el requerimiento de "saber qué tablas afecta cada archivo de código". Existe y se actualiza solo.

### 2.3 Dimensión medida

| Métrica | Valor |
|---|---|
| Tablas en la base | 424 |
| Llaves foráneas | 780 |
| Archivos con acceso a datos | 331 |
| Funciones de base invocadas desde el frontend | 12 |
| Tablas escritas desde más de un módulo | 26 |

### 2.4 Focos de acoplamiento detectados

| Tabla | Módulos que escriben | Archivos |
|---|---|---:|
| `tasks` | early-alerts, follow-ups, general-tools, hr, procedures | 11 |
| `budget_assignments` | budget, hr, services | 9 |
| `procedure_instances` | admissions, general-tools, procedures | 8 |
| `execution_requests` | budget, services | 7 |
| `alumni` | alumni, config | 7 |

Concentración de dependencias: `workers` en 132 archivos (40% del sistema), `academic_years` en 82.

---

## 3. Lo resuelto: identidad del trabajador

### 3.1 El diagnóstico

`workers.email` tiene restricción de unicidad, por lo que funcionaba como identificador. Pero **unicidad no es estabilidad**: en Tilatá algunos correos pertenecen a la persona (`hmoncada`, profesores, servicios generales) y otros al cargo (`rectoria@`, `dafi@`, `tesoreria@`). Los segundos se reasignan cuando cambia el ocupante, y en ese instante los datos guardados por correo cambian de dueño sin que nadie ejecute nada.

Unas veinte tablas identificaban al trabajador por correo en texto, sin llave foránea. Y esas tablas coinciden con los focos de acoplamiento: `execution_requests`, `budget_requesters`, `task_collaborators`, `task_deliverables`, `task_progress_notes`, `project_participants`, `tte_requests`.

**Corrección de rumbo importante:** la interpretación previa —que `worker_email_legacy` era deuda a eliminar migrando todo a `worker_id`— era equivocada. Migrar sin más habría roto la continuidad institucional: la nueva directora de bachillerato dejaría de ver las partidas de su propio cargo. El correo no era un atajo perezoso, era el sustituto de una entidad faltante.

### 3.2 La distinción que faltaba

Aportada por Desarrollos durante la sesión: **cargo** es la posición contractual de la persona; **rol institucional** es la función que ejerce, sobrevive a quien la ocupa y tiene correo propio.

Una persona puede tener ambos. Ejemplo real: Andrés Eduardo Flórez tiene cargo de Psicólogo y rol institucional de Coordinación SER.

### 3.3 Estructura implementada

**`job_roles`:**
- `role_type` (`'cargo'` | `'rol'`), obligatoria, por defecto `'cargo'`
- `role_email`, opcional y única
- Restricción: solo un `rol` puede tener correo

**`worker_job_roles`:**
- `assignment_id` como nueva llave primaria (reemplaza la pareja `worker_id + job_role_id`, que impedía reocupación)
- `end_date`, nula mientras la ocupación esté vigente
- Restricción de orden de fechas

Con eso, la pregunta "quién ocupaba este rol en tal fecha" tiene respuesta. Antes la ocupación solo tenía presente.

### 3.4 Datos cargados en PRODUCCIÓN

- 71 registros en `job_roles`: 63 activos (28 cargos, 35 roles), 8 inactivos
- 34 roles institucionales con correo, 2 sin correo (Cortilatá y ECOS)
- "Ingeniero" separado en "Ingeniero de redes y equipos" e "Ingeniero de software", con John Adalberto Torres y Mary Andrea Acero reasignados
- "Psicólogo- Coordinador SER" separado en cargo "Psicóloga" + rol "Coordinación SER"
- Ocupación de Paulo Andrés López en "Dirección de escuela alta" cerrada el 2026-06-30
- 8 roles obsoletos desactivados, conservando su historia

### 3.5 Bug crítico encontrado y corregido

`modules/hr/workers.html`, función `saveWorkerRoles`, ejecutaba:

```
DELETE /worker_job_roles?worker_id=eq.${workerId}
```

Sin filtro por estado. Borraba **todas** las filas de roles del trabajador, incluidas las históricas, y reinsertaba solo las vigentes. Era inofensivo mientras no hubiera historia; desde la carga de datos habría destruido cada registro histórico al primer guardado.

Reemplazado por reconciliación por diferencia: cierra con `end_date` los roles retirados, actualiza los que continúan conservando su fecha original, e inserta solo los nuevos.

**Este bug se encontró gracias al mapa.** Sin el índice inverso no se habría revisado ese archivo.

Desplegado a `main` vía PR #931 (13 commits, 10 archivos, sin reversiones).

---

## 4. Pendiente inmediato: migración de presupuestos

Es el paso que cierra el círculo y el de mayor riesgo. Toca datos presupuestales reales y afecta a nueve archivos que escriben en `budget_assignments`.

Tablas a migrar, para que apunten al rol en lugar del correo suelto:

- [ ] `budget_assignments` (`worker_email_legacy`) — incluye resolver el caso Diana Sandoval / Natalia De Toro, assignment `3a5ea917`
- [ ] `execution_requests` (`worker_email`)
- [ ] `budget_requesters` (`worker_email`, hoy con FK a `workers(email)` con propagación automática — hay que quitarla)
- [ ] `task_collaborators`, `task_deliverables`, `task_progress_notes`
- [ ] `project_participants`
- [ ] `tte_requests` (`requester_email`)
- [ ] `ie_process_workers`, `ie_component_ratings`, `new_student_actors`, `promotion_topics`, `ticket_categories`, `svc_trip_authorizations`

**Método sugerido:** cruzar los correos guardados contra `job_roles.role_email`. Los que coincidan pertenecen a un rol institucional y se migran al rol. Los que coincidan con `workers.email` de una persona sin rol institucional se migran a `worker_id`. Los que no coincidan con nada son datos huérfanos que hay que revisar uno por uno.

---

## 5. Verificaciones pendientes de la sesión

- [ ] **Probar `workers.html` en producción.** El código nuevo está desplegado pero nadie lo ha ejercido. Editar un trabajador de prueba, quitarle y ponerle un rol, y confirmar que la historia se conserva.
- [ ] **Correr el escáner.** El mapa no refleja el `workers.html` corregido.
- [ ] **Revisar filtros por `role_status`.** Cinco archivos leen `job_roles` para armar listas: `lists.html`, `community-query.html`, `manage-absences.html`, `generate-paths.html`, `module-roles.html`. Si filtran por activo, los 8 roles desactivados desaparecen de sus menús. Verificar especialmente formación, donde los módulos se asignan por rol: si un módulo estaba asignado a "Ingeniero", alguien puede quedarse sin ruta.
- [ ] **Estado de Paulo Andrés en `workers`.** Su rol quedó cerrado, pero su ficha puede seguir marcada como activa. Consulta quedó sin ejecutar.

---

## 6. Decisiones institucionales pendientes

- [ ] **Nomenclatura de género en los cargos.** Varios están en femenino ("Coordinadora de Lenguas", "Supervisora de servicios generales", "Generadora de Contenido", "Diseñadora Grafica", "Psicóloga"). Si el rol sobrevive a quien lo ocupa, el nombre no debería depender de la persona. Propuesta de Desarrollos: usar la forma "Coordinación de..." en lugar de coordinador/coordinadora. **Sin definir.** Tiene consecuencia práctica: Andrés Eduardo Flórez quedó asignado al cargo "Psicóloga".
- [ ] **Correos personales en roles institucionales.** Tres roles tienen hoy correo de persona y deberían tener genérico: Dirección de desarrollo profesional (`ediaz@` → `desarrolloprofesional@`), Coordinación E.A.E. (`avargas@` → `eae@`), Coordinación CAS (`cpatino@` → `cas@`). Se cargó el correo actual a propósito, para que el cruce con los datos históricos funcione. **Una vez migrado todo al rol, cambiar el correo es trivial y no rompe nada.**
- [ ] Clasificar Fonoaudiología, Terapia ocupacional, Analista contable, Analista de talento humano y Técnico ambiental: son una persona cada uno pero no tienen correo institucional. Sin correo no hay continuidad que preservar, así que quedaron como cargos.
- [ ] Corregir tildes: "Fonoaudiologa", "Diseñadora Grafica", "Director de Seccion Bachillerato". Se pospuso a propósito para no tocar los nombres dos veces, ya que coinciden con los del problema de género.
- [ ] Rol "Director ejecutivo de Cortilatá" quedó sin correo, por ser entidad distinta y sin acceso a SchoolNet.

---

## 7. Objetivo nuevo: documentación del sistema

Planteado por Desarrollos al cierre de esta sesión. Se trabajará por partes.

### 7.1 El problema

La documentación de módulos es inconsistente. No existe un registro confiable de qué hace cada módulo, qué funcionalidades incluye y en qué estado está cada una.

### 7.2 Lo que ya existe y sirve de base

`mapa/POR_PAGINA.md` responde, para cada archivo, qué tablas lee y cuáles escribe. Eso es el esqueleto factual. Lo que falta es la capa semántica: **qué hace** ese archivo, no solo qué toca.

### 7.3 Objetivos, del más concreto al más ambicioso

- [ ] **Ficha por archivo.** Qué hace, quién lo usa, qué tablas toca (ya lo da el escáner), qué funcionalidades ofrece. Generable en buena parte desde el código.
- [ ] **Ficha por módulo.** Qué resuelve el módulo, qué páginas lo componen, qué flujos soporta, qué estado tiene cada funcionalidad.
- [ ] **Resumen macro del sistema.** Qué es SchoolNet, qué dominios cubre, cómo se relacionan entre sí, dónde están las fronteras.

### 7.4 Enfoque propuesto

Igual que con el mapa: **generar lo que se pueda generar, escribir a mano solo lo que no se puede deducir.**

Una parte de la ficha por archivo es derivable del código: nombre, módulo, tablas, funciones invocadas, formularios que contiene, permisos que exige. Otra parte requiere criterio humano: para qué sirve, quién lo usa, qué se rompe si falla.

Empezar por un módulo piloto, validar el formato, y solo después escalar. Escribir 331 fichas con un formato equivocado sería peor que no tenerlas.

**Orden sugerido:** después de cerrar la migración de presupuestos. Documentar un sistema mientras se le cambia la estructura debajo produce documentación obsoleta al nacer.

---

## 8. Deuda estructural anotada (no urgente)

- [ ] **La rama `developmen` está 921 commits detrás de `main`.** Cada PR desde ella tiene riesgo de reversión. Hasta ahora GitHub ha resuelto bien las combinaciones, pero no está garantizado. Merece una sesión propia.
- [ ] Archivos sueltos en `modules/` sin pertenecer a ningún módulo, escribiendo en `hr_balance_adjustments`.
- [ ] Archivos en la raíz del repositorio escribiendo en `users` y `tte_requests`.
- [ ] La carpeta `manual/` contiene código funcional que escribe en `support_tickets` y `ticket_history`.
- [ ] El módulo `general-tools` sigue vivo y escribiendo en tablas de `hr` y `procedures`, pese a estar dado por eliminado en el documento de reestructuración. Los permisos se movieron; los archivos no.
- [ ] **Unificar perfiles de seguridad con cargos.** Planteado por Desarrollos: los perfiles de permisos y los cargos probablemente deberían ser lo mismo. La decisión tomada sobre `job_roles` condiciona esa unificación, sin cerrarle la puerta.
- [ ] Conectar el catálogo de la base al escáner, para detectar tablas huérfanas y tablas fantasma. El endpoint `/rest/v1/` ya no acepta la clave pública; el camino es una función de solo lectura invocable por `/rpc/`.
- [ ] Las 12 funciones de base de datos invocadas desde el frontend son dependencias ocultas: el escáner las detecta pero no ve qué tablas tocan por dentro.

---

## 9. Principios que gobiernan este trabajo

**El mapa se genera, no se escribe.** Un documento mantenido a mano se desactualiza en semanas y entonces es peor que no tenerlo, porque genera confianza falsa.

**Diagnosticar antes de escribir.** Toda modificación va precedida de una consulta de verificación, y toda consulta declara en qué ambiente corre.

**Los cambios estructurales se replican; los de datos no.** DEV y PROD tienen la misma estructura por definición. Los datos son distintos y las decisiones se toman sobre los reales.

**La historia no se borra, se cierra.** Una ocupación que termina lleva fecha de fin y estado inactivo. Nunca DELETE.

**Un cambio a la vez, con verificación.** Un bloque de diez sentencias que falla en la séptima deja la base en un estado que hay que diagnosticar hacia atrás.

---

## 10. Para retomar en una sesión nueva

> Continúo el trabajo de ordenamiento estructural de SchoolNet. Adjunto la bitácora v2.0. Ya está el escáner de dependencias corriendo por GitHub Actions, y el contrato de cargos y roles implementado en DEV y PROD. Quiero seguir con [la migración de presupuestos / las verificaciones pendientes de la sección 5 / el piloto de documentación de módulos].

---

**Fin del documento — Bitácora v2.0**
