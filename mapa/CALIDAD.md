# Calidad del análisis — límites y ruido de esta corrida

> Generado automáticamente el 2026-08-27 18:18 UTC. **No editar a mano.**

## Referencias sin operación determinada

**310 referencias** provienen de consultas armadas en variables. El escáner sabe qué tabla se toca, pero no si se lee o se escribe. Por eso las cifras de escritura son un piso, no un total.

| Archivo | Referencias dudosas |
|---|---:|
| `modules/suppliers/register.html` | 14 |
| `modules/follow-ups/general-queries.html` | 12 |
| `api/cron/auto-absences.js` | 10 |
| `modules/budget/budget-queries.html` | 10 |
| `modules/procedures/execute-form.html` | 9 |
| `modules/procedures/execute-public.html` | 9 |
| `modules/procedures/execute.html` | 9 |
| `modules/training/path-queries.html` | 9 |
| `modules/indicators/improvement-dashboard.html` | 7 |
| `modules/training/reports.html` | 7 |
| `modules/budget/category-detail.html` | 6 |
| `modules/general-tools/attendance-reports.html` | 6 |
| `modules/indicators/correlations.html` | 6 |
| `modules/indicators/improvement.html` | 6 |
| `modules/institutional-eval/index.html` | 6 |
| `modules/institutional-eval/structure.html` | 6 |
| `modules/teacher-eval/index.html` | 6 |
| `modules/budget/initialize-budget-general.html` | 5 |
| `modules/follow-ups/manage-eae-issues.html` | 5 |
| `modules/suppliers/index.html` | 5 |
| `modules/surveys/index.html` | 5 |
| `modules/training/index.html` | 5 |
| `modules/tte/index.html` | 5 |
| `modules/budget/budget-overview.html` | 4 |
| `modules/budget/budget-transfer.html` | 4 |
| `modules/config/index.html` | 4 |
| `modules/config/students.html` | 4 |
| `modules/early-alerts/manage-alerts.html` | 4 |
| `modules/hr/index.html` | 4 |
| `modules/indicators/dashboard.html` | 4 |

## Funciones de base de datos invocadas

**14 funciones**. Se listan aparte porque se invocan igual que una escritura pero muchas solo leen.

| Función | Archivos |
|---|---:|
| get_workers_with_permission | 3 |
| pln_create_planner_cycle | 2 |
| fn_extracurricular_enroll | 1 |
| pln_create_planner_criterion | 1 |
| pln_create_unit_cycle | 1 |
| list_trip_authorizations | 1 |
| transition_trip_statuses | 1 |
| calculate_transport_cost | 1 |
| update_pedagogical_trip | 1 |
| create_pedagogical_trip | 1 |
| execute_trip_banderazo | 1 |
| suspend_trip | 1 |
| get_pedagogical_trip_students | 1 |
| get_trip_authorization_panel | 1 |

## Nombres descartados por no parecer tablas

Columnas, restricciones y palabras sueltas que el escáner filtró. Si alguno de estos es una tabla real, hay que ajustar el filtro.

| Nombre | Veces |
|---|---:|
| responsible_worker_id | 7 |
| worker_id | 4 |
| budget_assignments_worker_id_fkey | 2 |
| manager_id | 2 |
| published_by | 2 |
| current_budget_year_id | 1 |
| coordinator_worker_id | 1 |
