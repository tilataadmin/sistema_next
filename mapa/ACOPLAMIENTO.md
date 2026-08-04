# Acoplamiento — tablas escritas desde más de un módulo

> Generado automáticamente el 2026-08-04 19:50 UTC. **No editar a mano.**

Cada fila es un punto donde un cambio de estructura puede romper código de otro equipo o módulo.

**27 tablas** con escritura compartida.

| Tabla | Módulos que escriben | Archivos |
|---|---|---:|
| tasks | early-alerts, follow-ups, general-tools, hr, procedures | 11 |
| users | (raíz), assets, hr, security | 4 |
| budget_assignments | budget, hr, services | 9 |
| procedure_instances | admissions, general-tools, procedures | 8 |
| alumni | alumni, config | 7 |
| execution_requests | budget, services | 7 |
| hr_balance_adjustments | adjust-balances.html, hr | 6 |
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
| get_workers_with_permission | services, suppliers | 3 |
| tte_requests | (raíz), tte | 3 |
| grades | admissions, config | 2 |
| hr_non_work_days | general-tools, hr | 2 |
| project_participants | general-tools, hr | 2 |
| task_collaborators | general-tools, hr | 2 |
| workers | hr, security | 2 |
| variables | hr, indicators | 2 |
| indicators | hr, indicators | 2 |
| survey_masters | hr, surveys | 2 |
