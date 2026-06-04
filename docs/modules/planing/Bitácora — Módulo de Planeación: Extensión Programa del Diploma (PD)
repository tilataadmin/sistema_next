# Bitácora — Módulo de Planeación: Extensión Programa del Diploma (PD)

**Proyecto:** SchoolNet — Colegio Tilatá  
**Rama activa:** `developmen` → `main`  
**Entornos:** DEV `spjzvpcsgbewxupjvmfm` · PROD `mrtuerkncqodhakuwjob`  
**Estado:** ✅ DESARROLLO COMPLETO  
**Fecha de cierre:** 4 de junio de 2026

---

## Resumen ejecutivo

La extensión PD del módulo de planeación está **funcionalmente completa en desarrollo**. Cubre los dos nuevos tipos de documento del Programa del Diploma (esquema bi-anual y planeador trimestral), la integración con todas las vistas de coordinación existentes, y la documentación de usuario para las 4 pantallas nuevas.

**Pendiente único de desarrollo:** PR `developmen` → `main` (7 archivos).  
**Pendientes restantes:** operativos en PROD, a cargo de terceros.

---

## 1. Resumen del alcance

| Documento | Tabla principal | Identidad única | Naturaleza |
|---|---|---|---|
| Esquema bi-anual | `pln_dp_outlines` | `(subject_id, level)` | Vivo — sin año académico |
| Planeador trimestral PD | `pln_planners` + `pln_planner_dp` | `(subject_id, grade_id, trimester, academic_year_id, level)` | Por año académico |

El esquema bi-anual cubre los dos años del programa (Año 1 = 10°, Año 2 = 11°) para una asignatura y nivel (SL/HL). El planeador trimestral es el documento operativo de cada trimestre.

---

## 2. Decisiones de diseño registradas

| ID | Decisión |
|---|---|
| D3 | SL/HL es discriminador de identidad — genera planeadores separados |
| D4 | El esquema bi-anual es un documento vivo: una sola versión por `(subject_id, level)` |
| D6 | Cronograma en planeador PD = ciclos → sesiones (`pln_planner_sessions`) |
| D7 | PD no usa rúbrica 2–5; la evaluación es descriptiva (formativa/sumativa) |
| D8 | Componentes sumativos con peso en `pln_planner_dp_components` |
| D10 | Visibilidad de reflexión a familias: boolean en `programs.share_reflection_with_families` |
| D11 | Esquema del curso = tabla estructurada en `pln_dp_outline_topics` (6 celdas: año 1 y 2 × trimestre 1–3) |
| D13 | Formularios PD en archivos dedicados (`dp-outline-form.html`, `dp-planner-form.html`) |
| D14 | "Plan lector" parametrizado con `academic_subjects.has_plan_lector boolean` |
| D15 | Bloque "Habilidades de autogestión" = campo narrativo separado en el esquema bi-anual (`self_management_skills`) |
| D16 | Bloque ACCIÓN del planeador agrupa todo lo que el IB define bajo "Enseñanza y aprendizaje a través de la indagación" en un solo colapsable; "Proceso de aprendizaje" es bloque independiente |
| D17 | Ramificación en vistas de coordinación por `level IS NOT NULL`: planeadores PD → `dp-planner-form.html`; demás → `planner-form.html` |

---

## 3. Estado de implementación

| Bloque | Descripción | Estado |
|---|---|---|
| 1 | Base de datos | ✅ DEV + PROD |
| 2 | Permisos y sidebar | ✅ DEV + PROD |
| 3 | UI esquema bi-anual | ✅ Archivos entregados |
| 4 | UI planeador trimestral PD | ✅ Archivos entregados |
| 5 | Integración con coordinación | ✅ Archivos entregados |
| 6 | PR a main | ⏳ Pendiente (7 archivos) |
| 7 | Manuales de usuario | ✅ Archivos entregados |

---

### Bloque 1 — Base de datos ✅

**5 tablas nuevas, RLS deshabilitado en todas:**
- `pln_dp_outlines` — encabezado del esquema bi-anual
- `pln_dp_outline_topics` — 6 celdas del Esquema del curso
- `pln_planner_dp` — cuerpo extendido 1:1 del planeador PD
- `pln_planner_sessions` — sesiones del cronograma por ciclo
- `pln_planner_dp_components` — componentes sumativos con peso

**Alteraciones a tablas existentes:**
- `pln_planners`: columnas `level`, `dp_outline_id`; UNIQUE → `uq_pln_planners_identity`
- `programs`: columna `share_reflection_with_families boolean DEFAULT false`
- `pln_comments`: CHECK ampliado para `entity_type = 'dp_outline'`
- `academic_subjects`: columna `has_plan_lector boolean NOT NULL DEFAULT false`
- `pln_dp_outlines`: columna `self_management_skills text`

**Auditoría:** 5 bloques ELSIF nuevos en `audit_trigger_function()`. Total `pln_*`: 25 triggers.  
**Función atómica:** `pln_create_planner_session(p_cycle_id)`.

---

### Bloque 2 — Permisos y sidebar ✅

| `permission_name` | `url_path` |
|---|---|
| Crear planeador bianual PD | `/modules/planning/my-dp-outlines.html` |
| Gestionar planeadores bianuales PD | `/modules/planning/dp-outlines.html` |
| Crear planeador trimestral PD | `/modules/planning/my-dp-planners.html` |

Total permisos de planeación: 10. `sidebar.js` actualizado y en `main`.

---

### Bloque 3 — UI esquema bi-anual ✅

**`areas-subjects.html`** — 6 cambios para soportar `has_plan_lector`.

**`my-dp-outlines.html`** — listado + creación. Formulario: asignatura + nivel. Validación de existencia. POST a `pln_dp_outlines` + 6 filas `pln_dp_outline_topics`. Redirige a `dp-outline-form.html`.

**`dp-outline-form.html`** (v26.6.4.3) — 11 bloques colapsables: Identificación, Plan lector (condicional), Esquema del curso (6 celdas), Evaluación IB, TdC, ATL, Habilidades de autogestión, Mentalidad internacional, Perfil IB, Recursos, Comentarios. Control de acceso 4 caminos. Polling 15 s. Autosave debounce.

---

### Bloque 4 — UI planeador trimestral PD ✅

**`my-dp-planners.html`** — listado + creación. Selector año + nivel. POST `pln_planners` + `pln_planner_dp` + vinculación automática al bi-anual.

**`dp-planner-form.html`** (v26.6.4.4) — 7 bloques: Identificación, Indagación, ACCIÓN, Proceso de aprendizaje, Cronograma (ciclos → sesiones), Reflexión, Comentarios. ATL multiselect. Componentes sumativos add/delete/peso. `patchPlanner()` + `patchPlannerDP()`. Control de acceso 4 caminos. Polling 15 s.

---

### Bloque 5 — Integración con coordinación ✅

Helper `openPlannerForm(plannerId, level)` agregado a 3 archivos:

```javascript
function openPlannerForm(plannerId, level) {
    const formPath = level ? 'dp-planner-form.html' : 'planner-form.html';
    window.location.href = `${formPath}?planner_id=${plannerId}`;
}
```

| Archivo | Cambios aplicados |
|---|---|
| `planners.html` | `level` en SELECT, `data-planner-level` en `<tr>`, click y botón "Abrir" usan `openPlannerForm()` |
| `coordinator-area.html` | Igual + `level` en health card items, `renderHealthCard` usa `openPlannerForm()` |
| `coordinator-program.html` | Idéntico a `coordinator-area.html` |

---

### Bloque 6 — PR a main ⏳

7 archivos en `developmen` pendientes de PR → `main`:

**Nuevos:** `my-dp-outlines.html`, `dp-outline-form.html`, `my-dp-planners.html`, `dp-planner-form.html`  
**Modificados:** `planners.html`, `coordinator-area.html`, `coordinator-program.html`

---

### Bloque 7 — Manuales de usuario ✅

| Destino | Pantalla |
|---|---|
| `/manual/planning/my-dp-outlines.html` | Mis esquemas bi-anuales PD |
| `/manual/planning/dp-outline-form.html` | Esquema bi-anual PD |
| `/manual/planning/my-dp-planners.html` | Mis planeadores trimestrales PD |
| `/manual/planning/dp-planner-form.html` | Planeador trimestral PD |

---

## 4. Pendientes operativos (requieren terceros)

- [ ] Asignar los 3 permisos PD a los roles correspondientes en PROD
- [ ] Poblar `grades.program_id` para 10° y 11° en PROD
- [ ] Poblar `academic_areas.coordinator_worker_id` para las áreas PD en PROD
- [ ] Verificar `programs.program_director_email` del programa PD en PROD

---

## 5. Deuda técnica registrada para versiones futuras

- `pln_create_planner_session`: atomicidad de `day_number` verificada en función; se recomienda prueba de carga antes de uso masivo
- `dp-outlines.html` — pantalla de gestión de bi-anuales para coordinadores (equivalente a `units.html`); permiso "Gestionar planeadores bianuales PD" ya existe, pantalla pendiente de implementar
- Notificaciones por email de comentarios PD — diferido hasta calibrar política con uso real
- Reflexión: campo `share_reflection_with_families` en `programs` existe en BD; UI de toggle pendiente de implementar en coordinación

---

## 6. Arquitectura de rutas

```
Menú lateral
├── Crear planeador bianual PD       → my-dp-outlines.html
│       └── [crear / click fila]    → dp-outline-form.html?outline_id=...
├── Gestionar planeadores bianuales PD → dp-outlines.html  [pendiente]
└── Crear planeador trimestral PD    → my-dp-planners.html
        └── [crear / click fila]    → dp-planner-form.html?planner_id=...

Coordinación
├── planners.html          → level → dp-planner-form.html
├── coordinator-area.html  → level → dp-planner-form.html
└── coordinator-program.html → level → dp-planner-form.html
```

---

*Bitácora cerrada por Desarrollos / Claude · 4 de junio de 2026 · SchoolNet v26.6.4*
