# Calidad del análisis — límites y ruido de esta corrida

> Generado automáticamente el 2026-08-04 20:02 UTC. **No editar a mano.**

## Referencias sin operación determinada

**1270 referencias** provienen de consultas armadas en variables. El escáner sabe qué tabla se toca, pero no si se lee o se escribe. Por eso las cifras de escritura son un piso, no un total.

| Archivo | Referencias dudosas |
|---|---:|
| `modules/general-tools/tasks.html` | 39 |
| `modules/hr/request-absence.html` | 32 |
| `modules/hr/workers.html` | 28 |
| `modules/planning/interdisc-unit-form.html` | 28 |
| `modules/hr/clearances.html` | 24 |
| `modules/planning/planner-form.html` | 21 |
| `modules/general-tools/lists.html` | 20 |
| `modules/indicators/dashboard-edit.html` | 17 |
| `modules/planning/unit-form.html` | 17 |
| `modules/events/events-detail.html` | 16 |
| `dashboard.html` | 15 |
| `modules/config/year-closure.html` | 15 |
| `modules/hr/absence-reports.html` | 15 |
| `modules/hr/hr-dashboard.html` | 14 |
| `modules/institutional-eval/evaluate.html` | 14 |
| `modules/procedures/execute.html` | 14 |
| `modules/suppliers/register.html` | 14 |
| `modules/hr/authorize-absences.html` | 13 |
| `modules/indicators/dashboard.html` | 13 |
| `modules/procedures/execute-public.html` | 13 |
| `modules/teacher-eval/forms.html` | 13 |
| `modules/extracurricular/activities.html` | 12 |
| `modules/extracurricular/seasons.html` | 12 |
| `modules/follow-ups/general-queries.html` | 12 |
| `modules/institutional-eval/structure.html` | 12 |
| `modules/procedures/execute-form.html` | 12 |
| `modules/profile/mi-perfil.html` | 12 |
| `modules/services/rep-trips.html` | 12 |
| `modules/admissions/form.html` | 11 |
| `modules/admissions/step4-form.html` | 11 |

## Funciones de base de datos invocadas

**12 funciones**. Se listan aparte porque se invocan igual que una escritura pero muchas solo leen.

| Función | Archivos |
|---|---:|
| get_workers_with_permission | 3 |
| pln_create_planner_cycle | 2 |
| fn_extracurricular_enroll | 1 |
| pln_create_planner_criterion | 1 |
| pln_create_unit_cycle | 1 |
| transition_trip_statuses | 1 |
| calculate_transport_cost | 1 |
| update_pedagogical_trip | 1 |
| create_pedagogical_trip | 1 |
| execute_trip_banderazo | 1 |
| suspend_trip | 1 |
| get_pedagogical_trip_students | 1 |

## Nombres descartados por no parecer tablas

Columnas, restricciones y palabras sueltas que el escáner filtró. Si alguno de estos es una tabla real, hay que ajustar el filtro.

| Nombre | Veces |
|---|---:|
| responsible_worker_id | 14 |
| worker_id | 8 |
| published_by | 4 |
| budget_assignments_worker_id_fkey | 3 |
| coordinator_worker_id | 2 |
| manager_id | 2 |
| current_budget_year_id | 1 |
