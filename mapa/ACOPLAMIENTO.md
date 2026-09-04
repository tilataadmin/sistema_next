# Acoplamiento — tablas escritas desde más de un módulo

> Generado automáticamente el 2026-09-04 13:32 UTC. **No editar a mano.**

Cada fila es un punto donde un cambio de estructura puede romper código de otro módulo.
Solo se cuentan escrituras confirmadas. Las funciones de base de datos quedan excluidas.

**26 tablas** con escritura compartida.

| Tabla | Módulos que escriben | Archivos |
|---|---|---:|
| tasks | early-alerts, follow-ups, general-tools, hr, procedures | 11 |
| users | (núcleo), (raíz), hr, security | 4 |
| budget_assignments | budget, hr, services | 9 |
| procedure_instances | admissions, general-tools, procedures | 8 |
| alumni | alumni, config | 7 |
| execution_requests | budget, services | 7 |
| hr_balance_adjustments | (modules sin carpeta), hr | 6 |
| stm_students_topics | follow-ups, new-students | 6 |
| worker_training_paths | hr, training | 6 |
| form_responses | admissions, procedures | 5 |
| students | config, security | 4 |
| stm_docs | follow-ups, new-students | 4 |
| ticket_history | manual, security | 3 |
| support_tickets | manual, security | 3 |
| projects | general-tools, hr | 3 |
| procedure_instance_steps | general-tools, procedures | 3 |
| user_roles | hr, security | 3 |
| tte_requests | (raíz), tte | 3 |
| grades | admissions, config | 2 |
| hr_non_work_days | general-tools, hr | 2 |
| project_participants | general-tools, hr | 2 |
| task_collaborators | general-tools, hr | 2 |
| workers | hr, security | 2 |
| variables | hr, indicators | 2 |
| indicators | hr, indicators | 2 |
| survey_masters | hr, surveys | 2 |

---

## Tablas con muchos puntos de escritura

Cuatro o más archivos que las modifican, sin importar el módulo. Cada archivo es una regla de negocio que puede contradecir a las otras.

| Tabla | Archivos que escriben | Módulos |
|---|---:|---|
| tasks | 11 | early-alerts, follow-ups, general-tools, hr, procedures |
| budget_assignments | 9 | budget, hr, services |
| procedure_instances | 8 | admissions, general-tools, procedures |
| alumni | 7 | alumni, config |
| execution_requests | 7 | budget, services |
| hr_balance_adjustments | 6 | (modules sin carpeta), hr |
| stm_students_topics | 6 | follow-ups, new-students |
| worker_training_paths | 6 | hr, training |
| pln_comments | 6 | planning |
| pln_planners | 6 | planning |
| form_responses | 5 | admissions, procedures |
| users | 4 | (núcleo), (raíz), hr, security |
| aap_applicants | 4 | admissions |
| alumni_magic_links | 4 | alumni |
| academic_years | 4 | config |
| students | 4 | config, security |
| env_water_alerts | 4 | environmental |
| stm_docs | 4 | follow-ups, new-students |
| svc_service_requests | 4 | services |
