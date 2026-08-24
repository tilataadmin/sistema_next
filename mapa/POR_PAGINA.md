# Mapa por página — qué tablas toca cada archivo

> Generado automáticamente el 2026-08-24 19:05 UTC. **No editar a mano.**

**331 archivos** con acceso a datos.

### `api/cron/auto-absences.js`

- **Módulo:** api
- **Lee (0):** —
- **Escribe (0):** —
- **Sin determinar (6):** attendance, hr_absence_requests, hr_config, hr_non_work_days, worker_managers, workers

### `api/cron/probation-report.js`

- **Módulo:** api
- **Lee (0):** —
- **Escribe (0):** —
- **Sin determinar (1):** workers

### `assets/js/config.js`

- **Módulo:** (núcleo)
- **Lee (6):** permissions, role_permissions, roles, system_config, user_roles, users
- **Escribe (1):** **users**
- **Sin determinar (2):** audit_log, users

### `assets/js/sidebar.js`

- **Módulo:** (núcleo)
- **Lee (5):** permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (1):** system_announcements

### `dashboard.html`

- **Módulo:** (raíz)
- **Lee (17):** budget_assignments, courses, execution_requests, grades, hr_absence_authorizations, sections, stm_prom_topics, students, support_tickets, svc_service_requests, system_config, tasks, tte_categories, tte_request_fragments, tte_requests, user_dashboard_shortcuts, workers
- **Escribe (0):** —
- **Sin determinar (1):** stm_students_topics

### `diagnostico_permisos_training.html`

- **Módulo:** (raíz)
- **Lee (5):** permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —

### `login.html`

- **Módulo:** (raíz)
- **Lee (4):** permissions, system_config, user_roles, users
- **Escribe (1):** **users**
- **Sin determinar (1):** users

### `manual/my-ticket.html`

- **Módulo:** manual
- **Lee (3):** support_tickets, ticket_history, users
- **Escribe (2):** **support_tickets**, **ticket_history**

### `manual/report-ticket.html`

- **Módulo:** manual
- **Lee (3):** permissions, ticket_categories, ticket_priority_options
- **Escribe (2):** **support_tickets**, **ticket_history**

### `modules/adjust-balances.html`

- **Módulo:** (modules sin carpeta)
- **Lee (4):** hr_absence_categories, hr_absence_requests, hr_balance_adjustments, workers
- **Escribe (1):** **hr_balance_adjustments**

### `modules/admissions/admissions-reports.html`

- **Módulo:** admissions
- **Lee (5):** aap_applicants, aap_contact_sources, aap_financial_reviews, academic_years, grades
- **Escribe (0):** —

### `modules/admissions/applicant-detail.html`

- **Módulo:** admissions
- **Lee (12):** aap_applicant_documents, aap_applicant_steps, aap_applicants, aap_contact_sources, aap_fairs, aap_financial_reviews, aap_kindergartens, aap_loss_reasons, aap_referral_types, aap_required_document_grades, academic_years, grades
- **Escribe (3):** **aap_applicant_sources**, **aap_applicant_steps**, **aap_applicants**

### `modules/admissions/applicant-documents.html`

- **Módulo:** admissions
- **Lee (3):** aap_applicant_documents, aap_applicants, aap_required_documents
- **Escribe (0):** —

### `modules/admissions/applicant-financial.html`

- **Módulo:** admissions
- **Lee (3):** aap_applicants, aap_financial_agreements, aap_financial_reviews
- **Escribe (2):** **aap_financial_agreements**, **aap_financial_reviews**

### `modules/admissions/applicants.html`

- **Módulo:** admissions
- **Lee (4):** aap_applicants, aap_contact_sources, academic_years, grades
- **Escribe (1):** **aap_applicants**

### `modules/admissions/contact-sources.html`

- **Módulo:** admissions
- **Lee (1):** aap_contact_sources
- **Escribe (1):** **aap_contact_sources**

### `modules/admissions/dashboard.html`

- **Módulo:** admissions
- **Lee (2):** aap_applicants, aap_financial_reviews
- **Escribe (0):** —

### `modules/admissions/documents-catalog.html`

- **Módulo:** admissions
- **Lee (2):** grades, workers
- **Escribe (2):** **aap_required_document_grades**, **aap_required_documents**
- **Sin determinar (1):** aap_required_documents

### `modules/admissions/email-templates.html`

- **Módulo:** admissions
- **Lee (1):** aap_email_templates
- **Escribe (1):** **aap_email_templates**

### `modules/admissions/experiences.html`

- **Módulo:** admissions
- **Lee (5):** aap_applicant_experiences, aap_applicants, aap_experience_events, aap_experience_types, workers
- **Escribe (3):** **aap_applicant_experiences**, **aap_experience_events**, **aap_experience_types**

### `modules/admissions/fairs.html`

- **Módulo:** admissions
- **Lee (2):** aap_applicants, aap_fairs
- **Escribe (1):** **aap_fairs**

### `modules/admissions/form.html`

- **Módulo:** admissions
- **Lee (11):** aap_applicant_experiences, aap_applicant_steps, aap_applicants, aap_contact_sources, aap_email_templates, aap_experience_events, aap_form_available_years, aap_module_config, aap_process_steps, aap_referral_types, grades
- **Escribe (4):** **aap_applicant_experiences**, **aap_applicant_sources**, **aap_applicant_steps**, **aap_applicants**

### `modules/admissions/grade-age-ranges.html`

- **Módulo:** admissions
- **Lee (2):** grades, sections
- **Escribe (1):** **grades**

### `modules/admissions/kindergarten-actions.html`

- **Módulo:** admissions
- **Lee (3):** aap_kindergartens, kindergarten_actions, users
- **Escribe (1):** **kindergarten_actions**

### `modules/admissions/kindergartens.html`

- **Módulo:** admissions
- **Lee (1):** aap_kindergartens
- **Escribe (1):** **aap_kindergartens**

### `modules/admissions/loss-reasons.html`

- **Módulo:** admissions
- **Lee (1):** aap_loss_reasons
- **Escribe (1):** **aap_loss_reasons**

### `modules/admissions/module-config.html`

- **Módulo:** admissions
- **Lee (5):** aap_form_available_years, aap_module_config, academic_years, forms, roles
- **Escribe (2):** **aap_form_available_years**, **aap_module_config**

### `modules/admissions/referral-types.html`

- **Módulo:** admissions
- **Lee (1):** aap_referral_types
- **Escribe (1):** **aap_referral_types**

### `modules/admissions/step4-form.html`

- **Módulo:** admissions
- **Lee (9):** aap_applicant_documents, aap_applicant_steps, aap_applicants, aap_email_templates, aap_module_config, aap_process_steps, aap_required_documents, form_fields, form_responses
- **Escribe (4):** **aap_applicant_steps**, **aap_applicants**, **form_responses**, **procedure_instances**

### `modules/admissions/upload-campaigns.html`

- **Módulo:** admissions
- **Lee (2):** marketing_campaigns, marketing_contacts
- **Escribe (3):** **marketing_campaigns**, **marketing_contact_campaigns**, **marketing_contacts**

### `modules/alumni/auditoria-consentimiento.html`

- **Módulo:** alumni
- **Lee (0):** —
- **Escribe (1):** **alumni_export_log**
- **Sin determinar (1):** alumni_consent_log

### `modules/alumni/directorio.html`

- **Módulo:** alumni
- **Lee (4):** alumni, alumni_field_definitions, alumni_field_groups, genders
- **Escribe (1):** **alumni**
- **Sin determinar (1):** alumni

### `modules/alumni/gestionar-campos.html`

- **Módulo:** alumni
- **Lee (3):** alumni, alumni_field_definitions, alumni_field_groups
- **Escribe (2):** **alumni_field_definitions**, **alumni_field_groups**

### `modules/alumni/importar-archivo.html`

- **Módulo:** alumni
- **Lee (2):** alumni, genders
- **Escribe (1):** **alumni**

### `modules/alumni/publico/acceder.html`

- **Módulo:** alumni
- **Lee (2):** alumni, alumni_magic_links
- **Escribe (2):** **alumni**, **alumni_magic_links**

### `modules/alumni/publico/aviso-privacidad.html`

- **Módulo:** alumni
- **Lee (1):** system_config
- **Escribe (0):** —

### `modules/alumni/publico/identificacion.html`

- **Módulo:** alumni
- **Lee (1):** alumni
- **Escribe (1):** **alumni_magic_links**

### `modules/alumni/publico/perfil.html`

- **Módulo:** alumni
- **Lee (3):** alumni, alumni_field_definitions, alumni_field_groups
- **Escribe (3):** **alumni**, **alumni_consent_log**, **alumni_magic_links**

### `modules/alumni/publico/verificar-email.html`

- **Módulo:** alumni
- **Lee (1):** alumni
- **Escribe (2):** **alumni**, **alumni_magic_links**

### `modules/alumni/reportes.html`

- **Módulo:** alumni
- **Lee (3):** alumni_field_definitions, alumni_field_groups, genders
- **Escribe (1):** **alumni_export_log**
- **Sin determinar (1):** alumni

### `modules/budget/assign-requesters.html`

- **Módulo:** budget
- **Lee (2):** academic_years, roles
- **Escribe (1):** **budget_requesters**
- **Sin determinar (2):** system_config, user_roles

### `modules/budget/associate-invoices.html`

- **Módulo:** budget
- **Lee (8):** budget_assignments, budget_items, budget_payments, execution_requests, sup_suppliers, suppliers, system_config, workers
- **Escribe (3):** **budget_assignments**, **budget_payments**, **execution_requests**

### `modules/budget/budget-authorization.html`

- **Módulo:** budget
- **Lee (3):** academic_years, budget_categories, system_config
- **Escribe (0):** —
- **Sin determinar (2):** budget_assignments, budget_items

### `modules/budget/budget-categories.html`

- **Módulo:** budget
- **Lee (1):** budget_categories
- **Escribe (1):** **budget_categories**
- **Sin determinar (1):** budget_categories

### `modules/budget/budget-items.html`

- **Módulo:** budget
- **Lee (4):** budget_categories, budget_items, chart_of_accounts, tax_types
- **Escribe (1):** **budget_items**
- **Sin determinar (1):** budget_items

### `modules/budget/budget-overview.html`

- **Módulo:** budget
- **Lee (8):** budget_assignments, budget_items, budget_transfers, execution_requests, sup_suppliers, suppliers, system_config, workers
- **Escribe (0):** —
- **Sin determinar (4):** academic_years, budget_assignments, budget_payments, execution_requests

### `modules/budget/budget-queries.html`

- **Módulo:** budget
- **Lee (8):** academic_years, budget_assignments, budget_categories, budget_items, execution_requests, sup_suppliers, suppliers, workers
- **Escribe (0):** —
- **Sin determinar (8):** academic_years, budget_assignments, budget_categories, budget_items, budget_payments, execution_requests, system_config, workers

### `modules/budget/budget-request.html`

- **Módulo:** budget
- **Lee (4):** academic_years, budget_items, system_config, workers
- **Escribe (0):** —
- **Sin determinar (1):** budget_assignments

### `modules/budget/budget-transfer.html`

- **Módulo:** budget
- **Lee (3):** budget_assignments, system_config, workers
- **Escribe (1):** **budget_transfers**
- **Sin determinar (2):** budget_assignments, budget_items

### `modules/budget/category-detail.html`

- **Módulo:** budget
- **Lee (6):** budget_assignments, budget_items, budget_transfers, suppliers, system_config, workers
- **Escribe (0):** —
- **Sin determinar (6):** academic_years, budget_assignments, budget_categories, budget_items, budget_payments, execution_requests

### `modules/budget/chart-of-accounts.html`

- **Módulo:** budget
- **Lee (1):** chart_of_accounts
- **Escribe (1):** **chart_of_accounts**
- **Sin determinar (1):** chart_of_accounts

### `modules/budget/close-overruns.html`

- **Módulo:** budget
- **Lee (4):** budget_assignments, budget_items, system_config, workers
- **Escribe (1):** **execution_requests**
- **Sin determinar (1):** execution_requests

### `modules/budget/close-transfer.html`

- **Módulo:** budget
- **Lee (1):** system_config
- **Escribe (2):** **budget_assignments**, **budget_transfers**
- **Sin determinar (2):** budget_assignments, budget_transfers

### `modules/budget/execution-request.html`

- **Módulo:** budget
- **Lee (0):** —
- **Escribe (2):** **execution_requests**, **recurrence_groups**

### `modules/budget/index.html`

- **Módulo:** budget
- **Lee (6):** budget_assignments, permissions, role_permissions, roles, system_config, user_roles
- **Escribe (0):** —

### `modules/budget/initialize-budget-general.html`

- **Módulo:** budget
- **Lee (3):** academic_years, budget_categories, workers
- **Escribe (1):** **budget_assignments**
- **Sin determinar (2):** budget_assignments, budget_items

### `modules/budget/initialize-budget-year.html`

- **Módulo:** budget
- **Lee (8):** academic_areas, academic_years, budget_assignments, budget_items, grades, programs, sections, workers
- **Escribe (1):** **budget_assignments**

### `modules/budget/report-design.html`

- **Módulo:** budget
- **Lee (7):** academic_years, budget_assignments, budget_categories, budget_items, budget_report_lines, budget_report_sections, budget_reports
- **Escribe (3):** **budget_report_lines**, **budget_report_sections**, **budget_reports**

### `modules/budget/report-view.html`

- **Módulo:** budget
- **Lee (7):** academic_years, budget_assignments, budget_categories, budget_items, budget_report_lines, budget_report_sections, budget_reports
- **Escribe (0):** —

### `modules/budget/request-resolution.html`

- **Módulo:** budget
- **Lee (2):** academic_years, system_config
- **Escribe (2):** **budget_assignments**, **execution_requests**

### `modules/budget/suppliers.html`

- **Módulo:** budget
- **Lee (1):** suppliers
- **Escribe (1):** **suppliers**
- **Sin determinar (1):** suppliers

### `modules/budget/tax-types.html`

- **Módulo:** budget
- **Lee (2):** chart_of_accounts, tax_types
- **Escribe (1):** **tax_types**

### `modules/budget/upload-combo.html`

- **Módulo:** budget
- **Lee (4):** budget_categories, budget_items, chart_of_accounts, tax_types
- **Escribe (4):** **budget_categories**, **budget_items**, **chart_of_accounts**, **tax_types**

### `modules/config/academic-areas.html`

- **Módulo:** config
- **Lee (6):** academic_areas, academic_subject_grades, academic_subjects, grades, sections, workers
- **Escribe (3):** **academic_areas**, **academic_subject_grades**, **academic_subjects**

### `modules/config/academic-assignments.html`

- **Módulo:** config
- **Lee (9):** academic_areas, academic_subject_grades, academic_subjects, academic_years, courses, grades, sections, worker_job_roles, workers
- **Escribe (2):** **academic_assignments**, **academic_subject_grades**

### `modules/config/annual-fees.html`

- **Módulo:** config
- **Lee (4):** academic_years, annual_tuition_fees, grades, sections
- **Escribe (1):** **annual_tuition_fees**

### `modules/config/config.html`

- **Módulo:** config
- **Lee (3):** academic_years, system_config, workers
- **Escribe (2):** **academic_years**, **system_config**

### `modules/config/courses.html`

- **Módulo:** config
- **Lee (3):** courses, grades, workers
- **Escribe (1):** **courses**

### `modules/config/enrollment-movements.html`

- **Módulo:** config
- **Lee (4):** academic_year_grade_stats, academic_years, student_entries, student_withdrawals
- **Escribe (0):** —

### `modules/config/eps.html`

- **Módulo:** config
- **Lee (2):** students, workers
- **Escribe (1):** **eps_entities**
- **Sin determinar (1):** eps_entities

### `modules/config/families.html`

- **Módulo:** config
- **Lee (4):** families, family_members, student_status, students
- **Escribe (2):** **families**, **family_members**
- **Sin determinar (1):** families

### `modules/config/grades.html`

- **Módulo:** config
- **Lee (4):** courses, grades, programs, sections
- **Escribe (1):** **grades**

### `modules/config/index.html`

- **Módulo:** config
- **Lee (5):** academic_years, roles, student_status, students, user_roles
- **Escribe (0):** —
- **Sin determinar (4):** academic_areas, courses, grades, sections

### `modules/config/load-test.html`

- **Módulo:** config
- **Lee (2):** test_students, test_subjects
- **Escribe (0):** —
- **Sin determinar (2):** test_grades, test_students

### `modules/config/programs.html`

- **Módulo:** config
- **Lee (2):** programs, workers
- **Escribe (1):** **programs**

### `modules/config/sections.html`

- **Módulo:** config
- **Lee (2):** sections, workers
- **Escribe (1):** **sections**

### `modules/config/students.html`

- **Módulo:** config
- **Lee (9):** academic_years, courses, document_types, eps_entities, families, genders, grades, student_status, students
- **Escribe (3):** **families**, **student_withdrawals**, **students**
- **Sin determinar (1):** students

### `modules/config/year-closure-reversal.html`

- **Módulo:** config
- **Lee (4):** academic_year_closures, alumni, student_status, students
- **Escribe (5):** **academic_year_closures**, **academic_years**, **alumni**, **students**, **system_config**

### `modules/config/year-closure.html`

- **Módulo:** config
- **Lee (8):** academic_assignments, academic_years, alumni, courses, grades, student_status, students, svc_student_year_services
- **Escribe (8):** **academic_assignments**, **academic_year_closures**, **academic_year_grade_stats**, **academic_years**, **alumni**, **courses**, **students**, **system_config**

### `modules/config/years.html`

- **Módulo:** config
- **Lee (3):** academic_year_closures, academic_year_trimesters, academic_years
- **Escribe (2):** **academic_year_trimesters**, **academic_years**

### `modules/early-alerts/alert-types.html`

- **Módulo:** early-alerts
- **Lee (1):** early_alert_causes
- **Escribe (1):** **early_alert_causes**

### `modules/early-alerts/assigned-actions.html`

- **Módulo:** early-alerts
- **Lee (2):** families, students
- **Escribe (1):** **tasks**
- **Sin determinar (3):** early_alert_logs, tasks, workers

### `modules/early-alerts/dashboard.html`

- **Módulo:** early-alerts
- **Lee (11):** courses, early_alert_causes, early_alert_logs, families, grades, roles, sections, students, tasks, user_roles, workers
- **Escribe (0):** —

### `modules/early-alerts/index.html`

- **Módulo:** early-alerts
- **Lee (10):** courses, early_alert_logs, grades, permissions, role_permissions, roles, sections, students, user_roles, users
- **Escribe (0):** —

### `modules/early-alerts/manage-alerts.html`

- **Módulo:** early-alerts
- **Lee (10):** courses, early_alert_causes, early_alert_logs, early_alert_notes, families, grades, sections, students, system_config, workers
- **Escribe (3):** **early_alert_logs**, **early_alert_notes**, **tasks**
- **Sin determinar (2):** early_alert_logs, tasks

### `modules/early-alerts/register-alerts.html`

- **Módulo:** early-alerts
- **Lee (8):** courses, early_alert_causes, early_alert_logs, families, grades, students, system_config, workers
- **Escribe (1):** **early_alert_logs**

### `modules/environmental/daily-water-readings.html`

- **Módulo:** environmental
- **Lee (3):** env_water_meters, env_water_readings_daily, system_config
- **Escribe (2):** **env_water_alerts**, **env_water_readings_daily**

### `modules/environmental/edit-daily-readings.html`

- **Módulo:** environmental
- **Lee (5):** env_water_alerts, env_water_meters, env_water_readings_daily, env_water_readings_extraordinary, system_config
- **Escribe (3):** **audit_log**, **env_water_alerts**, **env_water_readings_daily**
- **Sin determinar (1):** env_water_readings_daily

### `modules/environmental/extraordinary-water-readings.html`

- **Módulo:** environmental
- **Lee (4):** env_water_alerts, env_water_meters, env_water_readings_extraordinary, users
- **Escribe (2):** **env_water_alerts**, **env_water_readings_extraordinary**
- **Sin determinar (1):** env_water_readings_extraordinary

### `modules/environmental/import-inventory.html`

- **Módulo:** environmental
- **Lee (1):** env_tree_species
- **Escribe (1):** **env_tree_inventory**

### `modules/environmental/import-species.html`

- **Módulo:** environmental
- **Lee (1):** env_tree_species
- **Escribe (1):** **env_tree_species**

### `modules/environmental/index.html`

- **Módulo:** environmental
- **Lee (6):** env_tree_care_log, permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (1):** env_tree_inventory

### `modules/environmental/monthly-water-readings.html`

- **Módulo:** environmental
- **Lee (4):** env_water_meters, env_water_readings_daily, env_water_readings_monthly, system_config
- **Escribe (1):** **env_water_readings_monthly**

### `modules/environmental/register-tree-care.html`

- **Módulo:** environmental
- **Lee (3):** env_tree_care_log, env_tree_inventory, env_tree_species
- **Escribe (1):** **env_tree_care_log**

### `modules/environmental/reports.html`

- **Módulo:** environmental
- **Lee (3):** academic_years, env_tree_inventory, env_tree_species
- **Escribe (0):** —
- **Sin determinar (1):** env_tree_care_log

### `modules/environmental/species-documentation.html`

- **Módulo:** environmental
- **Lee (2):** env_species_documentation, env_tree_species
- **Escribe (1):** **env_species_documentation**

### `modules/environmental/species.html`

- **Módulo:** environmental
- **Lee (1):** env_tree_species
- **Escribe (1):** **env_tree_species**

### `modules/environmental/tree-care-history.html`

- **Módulo:** environmental
- **Lee (3):** env_tree_care_log, env_tree_inventory, env_tree_species
- **Escribe (1):** **env_tree_care_log**

### `modules/environmental/tree-inventory.html`

- **Módulo:** environmental
- **Lee (2):** env_tree_inventory, env_tree_species
- **Escribe (1):** **env_tree_inventory**

### `modules/environmental/tree-map.html`

- **Módulo:** environmental
- **Lee (3):** env_tree_inventory, env_tree_species, system_config
- **Escribe (0):** —

### `modules/environmental/water-alerts.html`

- **Módulo:** environmental
- **Lee (2):** env_water_alert_history, users
- **Escribe (2):** **env_water_alert_history**, **env_water_alerts**
- **Sin determinar (1):** env_water_alerts

### `modules/environmental/water-balance-dashboard.html`

- **Módulo:** environmental
- **Lee (7):** env_water_alerts, env_water_meters, env_water_readings_daily, student_status, students, system_config, workers
- **Escribe (0):** —

### `modules/environmental/water-meters.html`

- **Módulo:** environmental
- **Lee (3):** env_water_meters, env_water_readings_extraordinary, env_water_readings_monthly
- **Escribe (1):** **env_water_meters**
- **Sin determinar (1):** env_water_meters

### `modules/environmental/water-reports.html`

- **Módulo:** environmental
- **Lee (9):** env_water_alert_history, env_water_alerts, env_water_meters, env_water_readings_daily, env_water_readings_extraordinary, env_water_readings_monthly, student_status, students, workers
- **Escribe (0):** —
- **Sin determinar (1):** env_water_alerts

### `modules/events/event-public-attendance.html`

- **Módulo:** events
- **Lee (3):** event_attendance, event_registrations, events
- **Escribe (1):** **event_attendance**

### `modules/events/event-public-register.html`

- **Módulo:** events
- **Lee (6):** event_groups, event_institutions, event_registrations, event_slots, events, institutions
- **Escribe (2):** **event_group_enrollments**, **event_registrations**

### `modules/events/event-public-workshops.html`

- **Módulo:** events
- **Lee (4):** event_group_enrollments, event_groups, event_registrations, event_slots
- **Escribe (1):** **event_group_enrollments**
- **Sin determinar (1):** event_registrations

### `modules/events/events-dashboard.html`

- **Módulo:** events
- **Lee (3):** event_attendance, event_registrations, events
- **Escribe (0):** —

### `modules/events/events-detail.html`

- **Módulo:** events
- **Lee (8):** event_attendance, event_group_enrollments, event_groups, event_institutions, event_registrations, event_slots, events, institutions
- **Escribe (3):** **event_groups**, **event_registrations**, **event_slots**

### `modules/events/events-institutions.html`

- **Módulo:** events
- **Lee (1):** institutions
- **Escribe (1):** **institutions**

### `modules/events/events-manage.html`

- **Módulo:** events
- **Lee (5):** event_attendance, event_institutions, event_registrations, events, institutions
- **Escribe (2):** **event_institutions**, **events**

### `modules/events/events-settings.html`

- **Módulo:** events
- **Lee (2):** event_registrations, events
- **Escribe (0):** —

### `modules/events/index.html`

- **Módulo:** events
- **Lee (2):** roles, user_roles
- **Escribe (0):** —

### `modules/extracurricular/activities.html`

- **Módulo:** extracurricular
- **Lee (10):** academic_years, grades, svc_extracurricular_activities, svc_extracurricular_activity_costs, svc_extracurricular_activity_days, svc_extracurricular_activity_grades, svc_extracurricular_cost_concepts, svc_extracurricular_cycle_days, svc_extracurricular_cycles, svc_extracurricular_enrollments
- **Escribe (4):** **svc_extracurricular_activities**, **svc_extracurricular_activity_costs**, **svc_extracurricular_activity_days**, **svc_extracurricular_activity_grades**

### `modules/extracurricular/attendance.html`

- **Módulo:** extracurricular
- **Lee (8):** academic_years, attendance, svc_extracurricular_activities, svc_extracurricular_activity_days, svc_extracurricular_attendance, svc_extracurricular_cycle_days, svc_extracurricular_cycles, svc_extracurricular_enrollments
- **Escribe (1):** **svc_extracurricular_attendance**

### `modules/extracurricular/cost-concepts.html`

- **Módulo:** extracurricular
- **Lee (5):** academic_years, svc_extracurricular_activities, svc_extracurricular_activity_costs, svc_extracurricular_cost_concepts, svc_extracurricular_cycles
- **Escribe (1):** **svc_extracurricular_cost_concepts**

### `modules/extracurricular/enrollments.html`

- **Módulo:** extracurricular
- **Lee (11):** academic_years, courses, student_status, students, svc_extracurricular_activities, svc_extracurricular_activity_days, svc_extracurricular_activity_grades, svc_extracurricular_cycle_days, svc_extracurricular_cycles, svc_extracurricular_enrollment_days, svc_extracurricular_enrollments
- **Escribe (1):** **svc_extracurricular_enrollments**
- **Funciones (1):** fn_extracurricular_enroll

### `modules/extracurricular/extracurricular-engine.js`

- **Módulo:** extracurricular
- **Lee (3):** academic_years, hr_non_work_days, pedagogical_days
- **Escribe (0):** —

### `modules/extracurricular/seasons.html`

- **Módulo:** extracurricular
- **Lee (9):** academic_years, svc_extracurricular_activities, svc_extracurricular_activity_costs, svc_extracurricular_activity_days, svc_extracurricular_cost_concepts, svc_extracurricular_cycle_days, svc_extracurricular_cycles, svc_extracurricular_enrollments, svc_transport_rates_extracurricular
- **Escribe (4):** **svc_extracurricular_activities**, **svc_extracurricular_cost_concepts**, **svc_extracurricular_cycle_days**, **svc_extracurricular_cycles**

### `modules/follow-ups/categories.html`

- **Módulo:** follow-ups
- **Lee (1):** stm_category
- **Escribe (1):** **stm_category**

### `modules/follow-ups/confidential-notes.html`

- **Módulo:** follow-ups
- **Lee (5):** courses, grades, sections, stm_confidential_notes, students
- **Escribe (1):** **stm_confidential_notes**

### `modules/follow-ups/course-follow-up-queries.html`

- **Módulo:** follow-ups
- **Lee (14):** courses, grades, organizational_divisions, sections, stm_category, stm_docs, stm_eae_topics, stm_students_topics, stm_students_topics_categories, student_status, students, tasks, worker_courses, workers
- **Escribe (0):** —

### `modules/follow-ups/course-follow-ups.html`

- **Módulo:** follow-ups
- **Lee (11):** courses, grades, sections, stm_category, stm_docs, stm_strategies, stm_students_topics, stm_students_topics_categories, students, tasks, workers
- **Escribe (3):** **stm_docs**, **stm_strategies**, **tasks**

### `modules/follow-ups/eae-issues.html`

- **Módulo:** follow-ups
- **Lee (7):** courses, grades, sections, stm_category, stm_students_topics, stm_students_topics_categories, students
- **Escribe (2):** **stm_students_topics**, **stm_students_topics_categories**

### `modules/follow-ups/general-queries.html`

- **Módulo:** follow-ups
- **Lee (14):** academic_years, courses, grades, stm_category, stm_docs, stm_prom_topics, stm_prom_topics_categories, stm_students_topics, stm_students_topics_categories, student_status, students, system_config, tasks, workers
- **Escribe (0):** —
- **Sin determinar (6):** stm_prom_topics, stm_prom_topics_categories, stm_students_topics, stm_students_topics_categories, students, tasks

### `modules/follow-ups/group-issues.html`

- **Módulo:** follow-ups
- **Lee (7):** courses, grades, sections, stm_category, stm_prom_topics, stm_prom_topics_categories, workers
- **Escribe (2):** **stm_prom_topics**, **stm_prom_topics_categories**

### `modules/follow-ups/index.html`

- **Módulo:** follow-ups
- **Lee (10):** courses, grades, permissions, role_permissions, roles, sections, stm_prom_topics, stm_students_topics, user_roles, users
- **Escribe (0):** —

### `modules/follow-ups/individual-issues.html`

- **Módulo:** follow-ups
- **Lee (7):** courses, grades, sections, stm_category, stm_students_topics, stm_students_topics_categories, students
- **Escribe (2):** **stm_students_topics**, **stm_students_topics_categories**

### `modules/follow-ups/manage-eae-issues.html`

- **Módulo:** follow-ups
- **Lee (2):** system_config, workers
- **Escribe (2):** **stm_docs**, **stm_students_topics**
- **Sin determinar (2):** stm_students_topics, students

### `modules/follow-ups/manage-group-issues.html`

- **Módulo:** follow-ups
- **Lee (8):** courses, grades, sections, stm_category, stm_docs, stm_prom_topics_categories, tasks, workers
- **Escribe (3):** **stm_docs**, **stm_prom_topics**, **tasks**
- **Sin determinar (2):** stm_prom_topics, workers

### `modules/follow-ups/manage-unescalated-issues.html`

- **Módulo:** follow-ups
- **Lee (1):** system_config
- **Escribe (1):** **stm_students_topics**

### `modules/follow-ups/query-confidential-notes.html`

- **Módulo:** follow-ups
- **Lee (4):** roles, students, system_config, user_roles
- **Escribe (0):** —
- **Sin determinar (1):** stm_confidential_notes

### `modules/follow-ups/review-individual-issues.html`

- **Módulo:** follow-ups
- **Lee (1):** system_config
- **Escribe (1):** **stm_students_topics**

### `modules/follow-ups/tasks.html`

- **Módulo:** follow-ups
- **Lee (1):** students
- **Escribe (1):** **tasks**
- **Sin determinar (2):** tasks, workers

### `modules/follow-ups/user-course-assignments.html`

- **Módulo:** follow-ups
- **Lee (6):** cost_centers, courses, grades, sections, worker_courses, workers
- **Escribe (1):** **worker_courses**

### `modules/general-tools/ai-admin.html`

- **Módulo:** general-tools
- **Lee (3):** ai_config, ai_documents, ai_usage_monthly
- **Escribe (0):** —

### `modules/general-tools/attendance-reports.html`

- **Módulo:** general-tools
- **Lee (10):** attendance, courses, hr_absence_categories, hr_non_work_days, organizational_areas, organizational_divisions, student_status, students, system_config, workers
- **Escribe (0):** —
- **Sin determinar (3):** attendance, students, workers

### `modules/general-tools/attendance.html`

- **Módulo:** general-tools
- **Lee (6):** attendance, students, users, visitor_attendance, visitors, workers
- **Escribe (5):** **attendance**, **facial_recognition_logs**, **phidias_sync_logs**, **visitor_attendance**, **visitors**
- **Sin determinar (1):** phidias_sync_logs

### `modules/general-tools/community-query.html`

- **Módulo:** general-tools
- **Lee (25):** academic_years, cost_centers, courses, families, genders, grades, job_roles, organizational_areas, organizational_divisions, organizational_subareas, sections, student_status, students, svc_access_types, svc_rep_group_members, svc_rep_groups, svc_sports_categories, svc_sports_disciplines, svc_sports_team_members, svc_sports_teams, svc_student_year_services, system_config, worker_job_roles, worker_managers, workers
- **Escribe (0):** —

### `modules/general-tools/contract-categories.html`

- **Módulo:** general-tools
- **Lee (3):** contract_categories, generated_contracts, users
- **Escribe (1):** **contract_categories**

### `modules/general-tools/contract-templates.html`

- **Módulo:** general-tools
- **Lee (4):** contract_categories, contract_templates, generated_contracts, users
- **Escribe (2):** **contract_templates**, **generated_contracts**

### `modules/general-tools/contracts-dashboard.html`

- **Módulo:** general-tools
- **Lee (4):** contract_categories, contract_templates, generated_contracts, users
- **Escribe (0):** —
- **Sin determinar (1):** generated_contracts

### `modules/general-tools/dashboard.html`

- **Módulo:** general-tools
- **Lee (3):** academic_years, indicator_categories, students
- **Escribe (0):** —
- **Sin determinar (1):** tasks

### `modules/general-tools/family-activities.html`

- **Módulo:** general-tools
- **Lee (9):** academic_years, courses, familia_actividad_actividades, familia_actividad_asistencias, familia_actividad_cursos, familia_actividad_envios, grades, sections, system_config
- **Escribe (2):** **familia_actividad_actividades**, **familia_actividad_cursos**

### `modules/general-tools/family-attendance-reports.html`

- **Módulo:** general-tools
- **Lee (12):** academic_years, courses, familia_actividad_actividades, familia_actividad_asistencias, familia_actividad_cursos, families, grades, sections, student_status, students, system_config, users
- **Escribe (0):** —

### `modules/general-tools/family-attendance.html`

- **Módulo:** general-tools
- **Lee (11):** courses, familia_actividad_actividades, familia_actividad_cursos, familia_actividad_envios, familia_actividad_plantillas, grades, sections, student_status, students, system_config, user_roles
- **Escribe (4):** **familia_actividad_asistencias**, **familia_actividad_asistencias_familiares**, **familia_actividad_cursos**, **familia_actividad_envios**

### `modules/general-tools/family-messages.html`

- **Módulo:** general-tools
- **Lee (2):** familia_actividad_plantillas, system_config
- **Escribe (1):** **familia_actividad_plantillas**

### `modules/general-tools/generar-dias-tilata.html`

- **Módulo:** general-tools
- **Lee (4):** academic_years, hr_non_work_days, pedagogical_days, system_config
- **Escribe (1):** **hr_non_work_days**

### `modules/general-tools/index.html`

- **Módulo:** general-tools
- **Lee (5):** permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —

### `modules/general-tools/library.html`

- **Módulo:** general-tools
- **Lee (3):** library_categories, library_document_versions, library_documents
- **Escribe (3):** **library_categories**, **library_document_versions**, **library_documents**

### `modules/general-tools/lists.html`

- **Módulo:** general-tools
- **Lee (13):** cost_centers, courses, families, genders, job_roles, organizational_areas, organizational_divisions, organizational_subareas, sections, student_status, students, system_config, worker_job_roles
- **Escribe (0):** —
- **Sin determinar (1):** workers

### `modules/general-tools/pedagogical-days.html`

- **Módulo:** general-tools
- **Lee (3):** academic_years, pedagogical_days, system_config
- **Escribe (1):** **pedagogical_days**

### `modules/general-tools/project-detail.html`

- **Módulo:** general-tools
- **Lee (7):** project_documents, project_milestones, project_minutes, project_participants, projects, tasks, workers
- **Escribe (5):** **project_documents**, **project_milestones**, **project_minutes**, **project_participants**, **projects**

### `modules/general-tools/projects-dashboard.html`

- **Módulo:** general-tools
- **Lee (3):** project_milestones, projects, tasks
- **Escribe (0):** —

### `modules/general-tools/projects.html`

- **Módulo:** general-tools
- **Lee (5):** project_milestones, project_participants, projects, tasks, workers
- **Escribe (1):** **projects**

### `modules/general-tools/registro-facial.html`

- **Módulo:** general-tools
- **Lee (3):** facial_recognition_settings, students, workers
- **Escribe (1):** **facial_recognition_training**

### `modules/general-tools/tasks.html`

- **Módulo:** general-tools
- **Lee (16):** courses, form_fields, indicator_categories, procedure_instance_steps, procedure_instances, procedure_step_branches, procedure_step_parallel_assignments, procedure_steps, procedures, project_milestones, task_collaborators, task_deliverables, task_documents, task_progress_notes, tasks, workers
- **Escribe (7):** **procedure_instance_steps**, **procedure_instances**, **task_collaborators**, **task_deliverables**, **task_documents**, **task_progress_notes**, **tasks**
- **Sin determinar (1):** tasks

### `modules/hr/absence-categories.html`

- **Módulo:** hr
- **Lee (1):** hr_absence_categories
- **Escribe (1):** **hr_absence_categories**

### `modules/hr/absence-config.html`

- **Módulo:** hr
- **Lee (4):** hr_clearance_admins, hr_clearance_areas, hr_config, workers
- **Escribe (4):** **hr_balance_adjustments**, **hr_clearance_admins**, **hr_clearance_areas**, **hr_config**
- **Sin determinar (1):** hr_config

### `modules/hr/absence-reports.html`

- **Módulo:** hr
- **Lee (8):** attendance, hr_absence_categories, hr_absence_requests, hr_balance_adjustments, hr_config, hr_non_work_days, sections, workers
- **Escribe (0):** —
- **Sin determinar (1):** hr_absence_requests

### `modules/hr/adjust-balances.html`

- **Módulo:** hr
- **Lee (6):** academic_years, hr_absence_categories, hr_absence_requests, hr_balance_adjustments, users, workers
- **Escribe (1):** **hr_balance_adjustments**
- **Sin determinar (1):** hr_absence_requests

### `modules/hr/authorize-absences.html`

- **Módulo:** hr
- **Lee (6):** hr_absence_attachments, hr_absence_authorizations, hr_absence_requests, hr_config, worker_managers, workers
- **Escribe (3):** **hr_absence_authorizations**, **hr_absence_requests**, **hr_balance_adjustments**

### `modules/hr/certificates-config.html`

- **Módulo:** hr
- **Lee (3):** certificate_signer, certificate_template, contract_types
- **Escribe (3):** **certificate_signer**, **certificate_template**, **contract_types**

### `modules/hr/clearances.html`

- **Módulo:** hr
- **Lee (10):** hr_clearance_admins, hr_clearance_areas, hr_clearance_items, hr_clearance_processes, hr_clearance_worker_closures, hr_config, sections, system_config, worker_managers, workers
- **Escribe (3):** **hr_clearance_items**, **hr_clearance_processes**, **hr_clearance_worker_closures**

### `modules/hr/cost-centers.html`

- **Módulo:** hr
- **Lee (2):** cost_centers, organizational_divisions
- **Escribe (1):** **cost_centers**

### `modules/hr/divisions.html`

- **Módulo:** hr
- **Lee (2):** organizational_divisions, workers
- **Escribe (1):** **organizational_divisions**

### `modules/hr/hr-dashboard.html`

- **Módulo:** hr
- **Lee (8):** attendance, hr_absence_categories, hr_absence_requests, hr_balance_adjustments, hr_config, hr_non_work_days, sections, workers
- **Escribe (0):** —

### `modules/hr/index.html`

- **Módulo:** hr
- **Lee (10):** cost_centers, organizational_areas, organizational_subareas, permissions, role_permissions, roles, user_roles, users, worker_job_roles, workers
- **Escribe (0):** —
- **Sin determinar (3):** job_roles, users, workers

### `modules/hr/job-roles.html`

- **Módulo:** hr
- **Lee (1):** job_roles
- **Escribe (1):** **job_roles**

### `modules/hr/manage-absences.html`

- **Módulo:** hr
- **Lee (14):** cost_centers, hr_absence_attachments, hr_absence_authorizations, hr_absence_categories, hr_absence_requests, hr_balance_adjustments, hr_config, job_roles, organizational_areas, organizational_divisions, sections, worker_job_roles, worker_managers, workers
- **Escribe (3):** **hr_absence_attachments**, **hr_absence_authorizations**, **hr_absence_requests**

### `modules/hr/organizational-areas.html`

- **Módulo:** hr
- **Lee (3):** cost_centers, organizational_areas, organizational_divisions
- **Escribe (1):** **organizational_areas**

### `modules/hr/request-absence.html`

- **Módulo:** hr
- **Lee (13):** academic_years, hr_absence_attachments, hr_absence_authorizations, hr_absence_categories, hr_absence_requests, hr_balance_adjustments, hr_config, hr_non_work_days, organizational_areas, organizational_divisions, worker_job_roles, worker_managers, workers
- **Escribe (3):** **hr_absence_attachments**, **hr_absence_authorizations**, **hr_absence_requests**
- **Sin determinar (1):** hr_absence_requests

### `modules/hr/subareas.html`

- **Módulo:** hr
- **Lee (4):** cost_centers, organizational_areas, organizational_divisions, workers
- **Escribe (1):** **organizational_subareas**
- **Sin determinar (1):** organizational_subareas

### `modules/hr/work-calendar.html`

- **Módulo:** hr
- **Lee (4):** academic_years, hr_non_work_days, system_config, workers
- **Escribe (2):** **hr_balance_adjustments**, **hr_non_work_days**

### `modules/hr/workers.html`

- **Módulo:** hr
- **Lee (30):** academic_years, budget_assignments, contract_types, cost_centers, document_types, eps_entities, genders, hr_config, indicators, job_roles, organizational_areas, organizational_divisions, organizational_subareas, project_participants, projects, roles, sections, survey_masters, system_config, task_collaborators, tasks, training_module_roles, users, variables, worker_contracts, worker_job_roles, worker_managers, worker_salaries, worker_training_paths, workers
- **Escribe (17):** **budget_assignments**, **hr_balance_adjustments**, **indicators**, **project_participants**, **projects**, **survey_masters**, **task_collaborators**, **tasks**, **user_roles**, **users**, **variables**, **worker_contracts**, **worker_job_roles**, **worker_managers**, **worker_salaries**, **worker_training_paths**, **workers**

### `modules/indicators/benchmarks.html`

- **Módulo:** indicators
- **Lee (2):** benchmarks, indicator_benchmarks
- **Escribe (1):** **benchmarks**

### `modules/indicators/categories.html`

- **Módulo:** indicators
- **Lee (1):** indicator_categories
- **Escribe (1):** **indicator_categories**

### `modules/indicators/correlations.html`

- **Módulo:** indicators
- **Lee (2):** indicators, kpi_relationship_suggestions
- **Escribe (1):** **kpi_relationship_suggestions**
- **Sin determinar (4):** indicators, kpi_relationship_suggestions, variable_values, variables

### `modules/indicators/dashboard-config.html`

- **Módulo:** indicators
- **Lee (4):** dashboard_invitations, dashboards, users, workers
- **Escribe (1):** **dashboards**

### `modules/indicators/dashboard-edit.html`

- **Módulo:** indicators
- **Lee (10):** dashboard_indicators, dashboard_invitations, dashboard_variables, dashboards, indicator_categories, indicator_category_assignments, indicators, users, variables, workers
- **Escribe (4):** **dashboard_indicators**, **dashboard_invitations**, **dashboard_variables**, **dashboards**

### `modules/indicators/dashboard.html`

- **Módulo:** indicators
- **Lee (12):** academic_years, dashboard_indicators, dashboard_invitations, dashboard_variables, dashboards, indicator_goals, indicators, system_config, users, variable_values, variables, workers
- **Escribe (0):** —
- **Sin determinar (2):** variable_goals, variable_values

### `modules/indicators/data-entry.html`

- **Módulo:** indicators
- **Lee (5):** academic_years, segment_options, segments, variable_segments, variables
- **Escribe (1):** **variable_values**
- **Sin determinar (1):** variable_values

### `modules/indicators/improvement-dashboard.html`

- **Módulo:** indicators
- **Lee (4):** indicator_goals, indicators, kpi_improvement_plans, users
- **Escribe (0):** —
- **Sin determinar (5):** indicators, kpi_improvement_plans, kpi_indicator_analysis_notes, kpi_plan_updates, tasks

### `modules/indicators/improvement.html`

- **Módulo:** indicators
- **Lee (2):** indicator_goals, users
- **Escribe (3):** **kpi_improvement_plans**, **kpi_indicator_analysis_notes**, **kpi_plan_updates**
- **Sin determinar (6):** indicator_goals, indicators, kpi_improvement_plans, kpi_indicator_analysis_notes, kpi_plan_updates, tasks

### `modules/indicators/index.html`

- **Módulo:** indicators
- **Lee (8):** academic_years, permissions, role_permissions, roles, user_roles, users, variable_values, variables
- **Escribe (0):** —

### `modules/indicators/indicators.html`

- **Módulo:** indicators
- **Lee (9):** academic_years, indicator_benchmarks, indicator_categories, indicator_category_assignments, indicator_goals, indicators, users, variables, workers
- **Escribe (3):** **indicator_category_assignments**, **indicator_goals**, **indicators**

### `modules/indicators/segments.html`

- **Módulo:** indicators
- **Lee (2):** segment_options, segments
- **Escribe (2):** **segment_options**, **segments**

### `modules/indicators/variable-assignments.html`

- **Módulo:** indicators
- **Lee (3):** users, variable_permissions, variables
- **Escribe (1):** **variable_permissions**

### `modules/indicators/variables.html`

- **Módulo:** indicators
- **Lee (10):** indicator_categories, indicators, segment_options, segments, survey_masters, survey_sections, users, variable_segments, variable_values, variables
- **Escribe (4):** **query_validations**, **variable_permissions**, **variable_segments**, **variables**

### `modules/institutional-eval/evaluate.html`

- **Módulo:** institutional-eval
- **Lee (11):** academic_years, ie_component_ratings, ie_components, ie_evaluations, ie_expected_results, ie_management_areas, ie_process_results, ie_process_workers, ie_processes, ie_rubrics, system_config
- **Escribe (2):** **ie_component_ratings**, **ie_process_results**

### `modules/institutional-eval/evaluations.html`

- **Módulo:** institutional-eval
- **Lee (6):** academic_years, ie_evaluations, ie_management_areas, ie_process_workers, ie_processes, workers
- **Escribe (2):** **ie_evaluations**, **ie_process_workers**

### `modules/institutional-eval/improvement.html`

- **Módulo:** institutional-eval
- **Lee (9):** academic_years, ie_component_ratings, ie_components, ie_evaluations, ie_improvement_links, ie_management_areas, ie_processes, project_milestones, projects
- **Escribe (1):** **ie_improvement_links**

### `modules/institutional-eval/index.html`

- **Módulo:** institutional-eval
- **Lee (6):** academic_years, permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (5):** ie_components, ie_evaluations, ie_improvement_links, ie_management_areas, users

### `modules/institutional-eval/results.html`

- **Módulo:** institutional-eval
- **Lee (6):** academic_years, ie_component_ratings, ie_components, ie_evaluations, ie_management_areas, ie_processes
- **Escribe (0):** —

### `modules/institutional-eval/structure.html`

- **Módulo:** institutional-eval
- **Lee (6):** ie_components, ie_expected_results, ie_management_areas, ie_processes, ie_rubrics, ie_sources
- **Escribe (6):** **ie_components**, **ie_expected_results**, **ie_management_areas**, **ie_processes**, **ie_rubrics**, **ie_sources**
- **Sin determinar (5):** ie_components, ie_expected_results, ie_management_areas, ie_processes, ie_sources

### `modules/new-students/activities.html`

- **Módulo:** new-students
- **Lee (1):** new_student_activities
- **Escribe (1):** **new_student_activities**

### `modules/new-students/actors.html`

- **Módulo:** new-students
- **Lee (2):** new_student_actors, workers
- **Escribe (1):** **new_student_actors**

### `modules/new-students/index.html`

- **Módulo:** new-students
- **Lee (9):** courses, grades, new_students, permissions, role_permissions, roles, sections, user_roles, users
- **Escribe (0):** —

### `modules/new-students/new-students-report.html`

- **Módulo:** new-students
- **Lee (6):** academic_years, courses, grades, new_student_actors, student_status, students
- **Escribe (1):** **student_entries**
- **Sin determinar (2):** new_students, students

### `modules/new-students/register-activities.html`

- **Módulo:** new-students
- **Lee (7):** courses, grades, new_student_activities, new_students, sections, students, workers
- **Escribe (3):** **new_student_activity_records**, **stm_docs**, **stm_students_topics**

### `modules/new-students/registration-queries.html`

- **Módulo:** new-students
- **Lee (6):** courses, new_student_activities, new_student_activity_records, new_students, students, workers
- **Escribe (0):** —

### `modules/new-students/students-dashboard.html`

- **Módulo:** new-students
- **Lee (6):** courses, new_student_activities, new_student_activity_records, new_students, students, workers
- **Escribe (0):** —
- **Sin determinar (1):** new_students

### `modules/planning/catalogs.html`

- **Módulo:** planning
- **Lee (10):** pln_action_scope, pln_action_types, pln_connection_types, pln_ib_atl_skills, pln_ib_key_concepts, pln_ib_learner_profile, pln_ib_themes, pln_inquiry_stages, pln_myp_concept_strategies, pln_tilata_attributes
- **Escribe (10):** **pln_action_scope**, **pln_action_types**, **pln_connection_types**, **pln_ib_atl_skills**, **pln_ib_key_concepts**, **pln_ib_learner_profile**, **pln_ib_themes**, **pln_inquiry_stages**, **pln_myp_concept_strategies**, **pln_tilata_attributes**

### `modules/planning/coordinator-area.html`

- **Módulo:** planning
- **Lee (12):** academic_areas, academic_years, pln_connection_types, pln_dp_outlines, pln_ib_atl_skills, pln_ib_key_concepts, pln_ib_themes, pln_planners, pln_units, programs, users, workers
- **Escribe (0):** —

### `modules/planning/coordinator-program.html`

- **Módulo:** planning
- **Lee (11):** academic_years, grades, pln_connection_types, pln_dp_outlines, pln_ib_atl_skills, pln_ib_key_concepts, pln_ib_themes, pln_units, programs, users, workers
- **Escribe (0):** —

### `modules/planning/coordinator-section.html`

- **Módulo:** planning
- **Lee (11):** academic_years, grades, pln_connection_types, pln_dp_outlines, pln_ib_atl_skills, pln_ib_key_concepts, pln_ib_themes, programs, sections, users, workers
- **Escribe (0):** —

### `modules/planning/dp-outline-form.html`

- **Módulo:** planning
- **Lee (9):** academic_areas, academic_assignments, academic_subjects, pln_comments, pln_dp_outline_topics, pln_dp_outlines, programs, sections, workers
- **Escribe (3):** **pln_comments**, **pln_dp_outline_topics**, **pln_dp_outlines**

### `modules/planning/dp-planner-form.html`

- **Módulo:** planning
- **Lee (15):** academic_areas, academic_subjects, academic_years, courses, grades, pln_comments, pln_ib_atl_skills, pln_planner_atl_skills, pln_planner_cycles, pln_planner_dp, pln_planner_dp_components, pln_planners, programs, sections, workers
- **Escribe (6):** **pln_comments**, **pln_planner_atl_skills**, **pln_planner_cycles**, **pln_planner_dp**, **pln_planner_dp_components**, **pln_planners**
- **Funciones (1):** pln_create_planner_cycle

### `modules/planning/interdisc-unit-form.html`

- **Módulo:** planning
- **Lee (24):** academic_areas, academic_subjects, academic_year_trimesters, academic_years, courses, grades, pln_comments, pln_ib_atl_skills, pln_ib_learner_profile, pln_interdisc_unit_atl_skills, pln_interdisc_unit_body, pln_interdisc_unit_concept_strategies, pln_interdisc_unit_criteria, pln_interdisc_unit_cycles, pln_interdisc_unit_disciplines, pln_interdisc_unit_learner_profile, pln_interdisc_unit_sessions, pln_interdisc_unit_tilata_attributes, pln_interdisc_units, pln_myp_concept_strategies, pln_tilata_attributes, programs, sections, workers
- **Escribe (9):** **pln_comments**, **pln_interdisc_unit_atl_skills**, **pln_interdisc_unit_body**, **pln_interdisc_unit_concept_strategies**, **pln_interdisc_unit_criteria**, **pln_interdisc_unit_cycles**, **pln_interdisc_unit_disciplines**, **pln_interdisc_unit_sessions**, **pln_interdisc_units**

### `modules/planning/my-dp-outlines.html`

- **Módulo:** planning
- **Lee (4):** academic_subjects, pln_dp_outlines, programs, workers
- **Escribe (2):** **pln_dp_outline_topics**, **pln_dp_outlines**

### `modules/planning/my-dp-planners.html`

- **Módulo:** planning
- **Lee (9):** academic_assignments, academic_subjects, academic_years, courses, grades, pln_dp_outlines, pln_planners, programs, workers
- **Escribe (2):** **pln_planner_dp**, **pln_planners**

### `modules/planning/my-interdisc-units.html`

- **Módulo:** planning
- **Lee (7):** academic_assignments, academic_subjects, academic_years, grades, pln_interdisc_units, programs, workers
- **Escribe (2):** **pln_interdisc_unit_body**, **pln_interdisc_units**

### `modules/planning/my-myp-planners.html`

- **Módulo:** planning
- **Lee (8):** academic_assignments, academic_subjects, academic_years, courses, grades, pln_planners, programs, workers
- **Escribe (2):** **pln_planner_myp**, **pln_planners**

### `modules/planning/my-planners.html`

- **Módulo:** planning
- **Lee (8):** academic_assignments, academic_subjects, academic_years, courses, grades, pln_planners, programs, workers
- **Escribe (1):** **pln_planners**

### `modules/planning/my-units.html`

- **Módulo:** planning
- **Lee (12):** academic_areas, academic_assignments, academic_subjects, academic_years, courses, grades, pln_ib_themes, pln_unit_collaborators, pln_units, programs, sections, workers
- **Escribe (3):** **pln_unit_collaborators**, **pln_unit_grades**, **pln_units**

### `modules/planning/myp-planner-form.html`

- **Módulo:** planning
- **Lee (23):** academic_areas, academic_subjects, academic_year_trimesters, academic_years, courses, grades, pln_comments, pln_ib_atl_skills, pln_ib_learner_profile, pln_myp_assessment_criteria, pln_myp_concept_strategies, pln_myp_grade_year, pln_planner_atl_skills, pln_planner_cycles, pln_planner_learner_profile, pln_planner_myp, pln_planner_myp_concept_strategies, pln_planner_tilata_attributes, pln_planners, pln_tilata_attributes, programs, sections, workers
- **Escribe (7):** **pln_comments**, **pln_myp_assessment_criteria**, **pln_planner_atl_skills**, **pln_planner_cycles**, **pln_planner_myp**, **pln_planner_myp_concept_strategies**, **pln_planners**

### `modules/planning/planner-form.html`

- **Módulo:** planning
- **Lee (17):** academic_areas, academic_subjects, academic_years, courses, grades, pln_comments, pln_connection_types, pln_ib_atl_skills, pln_planner_assessment_criteria, pln_planner_atl_skills, pln_planner_connections, pln_planner_cycles, pln_planners, pln_unit_grades, programs, sections, workers
- **Escribe (6):** **pln_comments**, **pln_planner_assessment_criteria**, **pln_planner_atl_skills**, **pln_planner_connections**, **pln_planner_cycles**, **pln_planners**
- **Funciones (2):** pln_create_planner_criterion, pln_create_planner_cycle

### `modules/planning/planners.html`

- **Módulo:** planning
- **Lee (8):** academic_areas, academic_subjects, academic_years, grades, pln_planners, programs, sections, workers
- **Escribe (0):** —

### `modules/planning/unit-form.html`

- **Módulo:** planning
- **Lee (30):** academic_areas, academic_assignments, academic_subjects, academic_years, courses, grades, pln_action_scope, pln_action_types, pln_connection_types, pln_ib_atl_skills, pln_ib_key_concepts, pln_ib_learner_profile, pln_ib_themes, pln_inquiry_stages, pln_tilata_attributes, pln_unit_action_scope, pln_unit_action_types, pln_unit_atl_skills, pln_unit_collaborators, pln_unit_cycles, pln_unit_grades, pln_unit_key_concepts, pln_unit_learner_profile, pln_unit_subject_connections, pln_unit_subjects, pln_unit_tilata_attributes, pln_units, programs, sections, workers
- **Escribe (9):** **pln_comments**, **pln_unit_collaborators**, **pln_unit_cycle_connections**, **pln_unit_cycle_subjects**, **pln_unit_cycles**, **pln_unit_grades**, **pln_unit_subject_connections**, **pln_unit_subjects**, **pln_units**
- **Funciones (1):** pln_create_unit_cycle

### `modules/planning/units.html`

- **Módulo:** planning
- **Lee (8):** academic_areas, academic_subjects, academic_years, grades, pln_units, programs, sections, workers
- **Escribe (0):** —

### `modules/procedures/dashboard.html`

- **Módulo:** procedures
- **Lee (3):** procedure_instances, procedure_steps, procedures
- **Escribe (0):** —
- **Sin determinar (2):** procedure_instances, tasks

### `modules/procedures/execute-form-public.html`

- **Módulo:** procedures
- **Lee (5):** field_option_catalog, form_fields, forms, procedures, system_config
- **Escribe (2):** **form_responses**, **procedure_instances**

### `modules/procedures/execute-form.html`

- **Módulo:** procedures
- **Lee (4):** field_option_catalog, form_fields, forms, procedures
- **Escribe (2):** **form_responses**, **procedure_instances**
- **Sin determinar (9):** academic_areas, courses, families, genders, grades, job_roles, sections, students, workers

### `modules/procedures/execute-public.html`

- **Módulo:** procedures
- **Lee (7):** field_option_catalog, form_fields, forms, procedure_step_parallel_assignments, procedure_steps, procedures, system_config
- **Escribe (4):** **form_responses**, **procedure_instance_steps**, **procedure_instances**, **tasks**
- **Sin determinar (9):** academic_areas, courses, families, genders, grades, job_roles, sections, students, workers

### `modules/procedures/execute.html`

- **Módulo:** procedures
- **Lee (6):** field_option_catalog, form_fields, forms, procedure_step_parallel_assignments, procedure_steps, procedures
- **Escribe (4):** **form_responses**, **procedure_instance_steps**, **procedure_instances**, **tasks**
- **Sin determinar (9):** academic_areas, courses, families, genders, grades, job_roles, sections, students, workers

### `modules/procedures/forms.html`

- **Módulo:** procedures
- **Lee (7):** field_option_catalog, form_access_workers, form_fields, form_responses, forms, procedures, workers
- **Escribe (4):** **field_option_catalog**, **form_access_workers**, **form_fields**, **forms**

### `modules/procedures/index.html`

- **Módulo:** procedures
- **Lee (5):** permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —

### `modules/procedures/my-requests.html`

- **Módulo:** procedures
- **Lee (8):** field_option_catalog, form_fields, form_responses, procedure_instance_steps, procedure_instances, procedure_steps, procedures, tasks
- **Escribe (2):** **procedure_instances**, **tasks**

### `modules/procedures/procedures.html`

- **Módulo:** procedures
- **Lee (8):** form_fields, forms, procedure_instance_steps, procedure_instances, procedure_step_branches, procedure_step_parallel_assignments, procedure_steps, workers
- **Escribe (4):** **procedure_step_branches**, **procedure_step_parallel_assignments**, **procedure_steps**, **procedures**
- **Sin determinar (1):** procedures

### `modules/procedures/query-submissions.html`

- **Módulo:** procedures
- **Lee (7):** field_option_catalog, form_access_workers, form_fields, form_responses, forms, procedures, workers
- **Escribe (0):** —
- **Sin determinar (1):** procedure_instances

### `modules/procedures/records.html`

- **Módulo:** procedures
- **Lee (8):** field_option_catalog, form_fields, form_responses, procedure_instance_steps, procedure_instances, procedure_steps, procedures, tasks
- **Escribe (2):** **procedure_instances**, **tasks**

### `modules/procedures/track-public.html`

- **Módulo:** procedures
- **Lee (5):** procedure_instance_steps, procedure_instances, procedure_steps, procedures, system_config
- **Escribe (0):** —

### `modules/profile/mi-perfil.html`

- **Módulo:** profile
- **Lee (22):** academic_years, certificate_signer, certificate_template, contract_types, cost_centers, document_types, genders, hr_non_work_days, job_roles, organizational_areas, organizational_divisions, pedagogical_days, system_config, tilata_recurring_events, tilata_recurring_invitees, tilata_recurring_occurrences, user_dashboard_shortcuts, worker_certificates_log, worker_contracts, worker_job_roles, worker_salaries, workers
- **Escribe (5):** **tilata_recurring_events**, **tilata_recurring_invitees**, **tilata_recurring_occurrences**, **user_dashboard_shortcuts**, **worker_certificates_log**
- **Sin determinar (3):** worker_job_roles, worker_managers, workers

### `modules/profile/mis-tickets.html`

- **Módulo:** profile
- **Lee (1):** support_tickets
- **Escribe (0):** —

### `modules/security/announcements.html`

- **Módulo:** security
- **Lee (1):** system_announcements
- **Escribe (1):** **system_announcements**

### `modules/security/audit-log.html`

- **Módulo:** security
- **Lee (2):** audit_log, users
- **Escribe (0):** —

### `modules/security/id-cards.html`

- **Módulo:** security
- **Lee (3):** student_status, students, workers
- **Escribe (2):** **students**, **workers**
- **Sin determinar (2):** students, workers

### `modules/security/index.html`

- **Módulo:** security
- **Lee (6):** academic_years, permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (4):** permissions, roles, user_roles, users

### `modules/security/permissions.html`

- **Módulo:** security
- **Lee (2):** permissions, role_permissions
- **Escribe (1):** **permissions**

### `modules/security/role-permissions.html`

- **Módulo:** security
- **Lee (3):** permissions, role_permissions, roles
- **Escribe (1):** **role_permissions**

### `modules/security/roles.html`

- **Módulo:** security
- **Lee (1):** roles
- **Escribe (1):** **roles**

### `modules/security/security-overview.html`

- **Módulo:** security
- **Lee (5):** permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —

### `modules/security/ticket-categories.html`

- **Módulo:** security
- **Lee (3):** ticket_categories, ticket_priority_options, workers
- **Escribe (2):** **ticket_categories**, **ticket_priority_options**

### `modules/security/ticket-management.html`

- **Módulo:** security
- **Lee (8):** permissions, role_permissions, support_tickets, ticket_categories, ticket_history, ticket_priority_options, user_roles, users
- **Escribe (2):** **support_tickets**, **ticket_history**

### `modules/security/user-roles.html`

- **Módulo:** security
- **Lee (10):** cost_centers, job_roles, organizational_areas, organizational_divisions, organizational_subareas, roles, user_roles, users, worker_job_roles, workers
- **Escribe (1):** **user_roles**

### `modules/security/users.html`

- **Módulo:** security
- **Lee (3):** roles, user_roles, users
- **Escribe (2):** **user_roles**, **users**

### `modules/services/admissions-family.html`

- **Módulo:** services
- **Lee (10):** budget_assignments, permissions, role_permissions, roles, svc_module_config, svc_service_type_notifications, system_config, user_roles, users, workers
- **Escribe (3):** **budget_assignments**, **execution_requests**, **svc_admissions_family_services**
- **Sin determinar (2):** svc_admissions_family_services, users

### `modules/services/approvals.html`

- **Módulo:** services
- **Lee (27):** budget_assignments, budget_categories, budget_items, grades, svc_catering_menus, svc_internal_event_catering, svc_internal_event_services, svc_internal_event_support_staff, svc_internal_events, svc_module_config, svc_pedagogical_trip_grades, svc_pedagogical_trips, svc_rep_groups, svc_rep_trip_adults, svc_rep_trips, svc_service_type_notifications, svc_sports_categories, svc_sports_disciplines, svc_sports_teams, svc_sports_trip_adults, svc_sports_trips, svc_support_areas, svc_transport_destinations, svc_transport_nodes, svc_trip_transport_nodes, system_config, workers
- **Escribe (3):** **budget_assignments**, **execution_requests**, **svc_service_requests**
- **Sin determinar (1):** svc_service_requests

### `modules/services/config.html`

- **Módulo:** services
- **Lee (13):** svc_access_types, svc_catering_menus, svc_maintenance_notifications, svc_maintenance_priorities, svc_maintenance_spaces, svc_module_config, svc_service_type_notifications, svc_support_areas, svc_transport_destinations, svc_transport_nodes, svc_transport_rates_extracurricular, svc_transport_rates_students, workers
- **Escribe (12):** **svc_access_types**, **svc_catering_menus**, **svc_maintenance_notifications**, **svc_maintenance_priorities**, **svc_maintenance_spaces**, **svc_module_config**, **svc_service_type_notifications**, **svc_support_areas**, **svc_transport_destinations**, **svc_transport_nodes**, **svc_transport_rates_extracurricular**, **svc_transport_rates_students**

### `modules/services/event-costs.html`

- **Módulo:** services
- **Lee (2):** svc_support_areas, workers
- **Escribe (1):** **svc_internal_event_services**

### `modules/services/index.html`

- **Módulo:** services
- **Lee (14):** academic_years, permissions, role_permissions, roles, svc_internal_event_services, svc_internal_events, svc_maintenance_requests, svc_pedagogical_trips, svc_service_requests, svc_sports_trips, svc_support_areas, user_roles, users, workers
- **Escribe (0):** —
- **Sin determinar (1):** users

### `modules/services/internal-events.html`

- **Módulo:** services
- **Lee (10):** svc_catering_menus, svc_internal_event_catering, svc_internal_event_services, svc_internal_events, svc_module_config, svc_service_requests, svc_service_type_notifications, svc_support_areas, users, workers
- **Escribe (4):** **svc_internal_event_catering**, **svc_internal_event_services**, **svc_internal_events**, **svc_service_requests**
- **Sin determinar (1):** svc_internal_events
- **Funciones (1):** get_workers_with_permission

### `modules/services/js/commons.js`

- **Módulo:** services
- **Lee (12):** academic_years, attendance, role_permissions, svc_catering_menus, svc_module_config, svc_transport_destinations, svc_transport_nodes, svc_transport_rates_students, system_config, user_roles, users, workers
- **Escribe (0):** —

### `modules/services/maintenance-management.html`

- **Módulo:** services
- **Lee (7):** svc_maintenance_history, svc_maintenance_photos, svc_maintenance_priorities, svc_maintenance_requests, svc_maintenance_spaces, users, workers
- **Escribe (3):** **svc_maintenance_history**, **svc_maintenance_photos**, **svc_maintenance_requests**

### `modules/services/maintenance-request.html`

- **Módulo:** services
- **Lee (5):** svc_maintenance_notifications, svc_maintenance_priorities, svc_maintenance_spaces, users, workers
- **Escribe (3):** **svc_maintenance_history**, **svc_maintenance_photos**, **svc_maintenance_requests**

### `modules/services/my-maintenance-requests.html`

- **Módulo:** services
- **Lee (7):** svc_maintenance_history, svc_maintenance_photos, svc_maintenance_priorities, svc_maintenance_requests, svc_maintenance_spaces, users, workers
- **Escribe (0):** —

### `modules/services/pedagogical-trips.html`

- **Módulo:** services
- **Lee (14):** grades, sections, svc_catering_menus, svc_pedagogical_trip_adults, svc_pedagogical_trip_attendance, svc_pedagogical_trip_catering, svc_pedagogical_trip_grades, svc_pedagogical_trips, svc_service_requests, svc_service_type_notifications, svc_transport_destinations, svc_transport_nodes, svc_trip_transport_nodes, workers
- **Escribe (1):** **svc_pedagogical_trips**
- **Sin determinar (1):** svc_pedagogical_trips
- **Funciones (8):** calculate_transport_cost, create_pedagogical_trip, execute_trip_banderazo, get_pedagogical_trip_students, get_workers_with_permission, suspend_trip, transition_trip_statuses, update_pedagogical_trip

### `modules/services/rep-groups.html`

- **Módulo:** services
- **Lee (7):** courses, grades, student_status, students, svc_rep_group_members, svc_rep_groups, workers
- **Escribe (2):** **svc_rep_group_members**, **svc_rep_groups**

### `modules/services/rep-trips.html`

- **Módulo:** services
- **Lee (13):** courses, students, svc_rep_group_members, svc_rep_groups, svc_rep_trip_adults, svc_rep_trip_attendance, svc_rep_trips, svc_service_requests, svc_service_type_notifications, svc_transport_destinations, svc_transport_nodes, svc_trip_transport_nodes, workers
- **Escribe (5):** **svc_rep_trip_adults**, **svc_rep_trip_attendance**, **svc_rep_trips**, **svc_service_requests**, **svc_trip_transport_nodes**

### `modules/services/reports.html`

- **Módulo:** services
- **Lee (11):** svc_extracurricular_daily_records, svc_extracurricular_vehicle_configs, svc_internal_event_catering, svc_internal_event_services, svc_pedagogical_trips, svc_rep_trips, svc_sports_trips, svc_staff_transport_daily_records, svc_staff_transport_routes, svc_transport_destinations, workers
- **Escribe (0):** —
- **Sin determinar (2):** svc_internal_events, svc_service_requests

### `modules/services/sports-teams.html`

- **Módulo:** services
- **Lee (8):** courses, grades, student_status, students, svc_sports_categories, svc_sports_disciplines, svc_sports_team_members, svc_sports_teams
- **Escribe (4):** **svc_sports_categories**, **svc_sports_disciplines**, **svc_sports_team_members**, **svc_sports_teams**

### `modules/services/sports-trips.html`

- **Módulo:** services
- **Lee (15):** courses, students, svc_service_requests, svc_service_type_notifications, svc_sports_categories, svc_sports_disciplines, svc_sports_team_members, svc_sports_teams, svc_sports_trip_adults, svc_sports_trip_attendance, svc_sports_trips, svc_transport_destinations, svc_transport_nodes, svc_trip_transport_nodes, workers
- **Escribe (5):** **svc_service_requests**, **svc_sports_trip_adults**, **svc_sports_trip_attendance**, **svc_sports_trips**, **svc_trip_transport_nodes**

### `modules/services/staff-transport.html`

- **Módulo:** services
- **Lee (2):** svc_staff_transport_daily_records, svc_staff_transport_routes
- **Escribe (2):** **svc_staff_transport_daily_records**, **svc_staff_transport_routes**

### `modules/services/student-services.html`

- **Módulo:** services
- **Lee (7):** academic_years, courses, grades, student_status, students, svc_access_types, svc_student_year_services
- **Escribe (1):** **svc_student_year_services**

### `modules/services/svc-meal-tickets.html`

- **Módulo:** services
- **Lee (7):** budget_assignments, budget_items, budget_requesters, svc_module_config, svc_service_type_notifications, system_config, workers
- **Escribe (2):** **budget_assignments**, **execution_requests**
- **Sin determinar (1):** execution_requests

### `modules/suppliers/catalogs.html`

- **Módulo:** suppliers
- **Lee (4):** sup_banks, sup_ciiu_activities, sup_departments, sup_municipalities
- **Escribe (4):** **sup_banks**, **sup_ciiu_activities**, **sup_departments**, **sup_municipalities**
- **Sin determinar (1):** sup_municipalities

### `modules/suppliers/config.html`

- **Módulo:** suppliers
- **Lee (3):** sup_attachment_types, sup_tax_conditions, sup_tax_regimes
- **Escribe (3):** **sup_attachment_types**, **sup_tax_conditions**, **sup_tax_regimes**

### `modules/suppliers/dashboard.html`

- **Módulo:** suppliers
- **Lee (1):** sup_suppliers
- **Escribe (0):** —

### `modules/suppliers/index.html`

- **Módulo:** suppliers
- **Lee (6):** academic_years, permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (3):** sup_legal_documents, sup_suppliers, users

### `modules/suppliers/legal-documents.html`

- **Módulo:** suppliers
- **Lee (2):** sup_legal_document_versions, sup_legal_documents
- **Escribe (2):** **sup_legal_document_versions**, **sup_legal_documents**

### `modules/suppliers/manage.html`

- **Módulo:** suppliers
- **Lee (11):** sup_attachment_types, sup_legal_document_versions, sup_legal_documents, sup_supplier_attachments, sup_supplier_legal_acceptances, sup_supplier_notifications, sup_supplier_tax_conditions, sup_suppliers, sup_tax_conditions, users, workers
- **Escribe (2):** **sup_supplier_notifications**, **sup_suppliers**

### `modules/suppliers/my-suppliers.html`

- **Módulo:** suppliers
- **Lee (9):** sup_attachment_types, sup_legal_document_versions, sup_legal_documents, sup_supplier_attachments, sup_supplier_legal_acceptances, sup_supplier_tax_conditions, sup_suppliers, sup_tax_conditions, workers
- **Escribe (0):** —

### `modules/suppliers/portal.html`

- **Módulo:** suppliers
- **Lee (12):** sup_attachment_types, sup_banks, sup_ciiu_activities, sup_departments, sup_municipalities, sup_otp_codes, sup_supplier_attachments, sup_supplier_tax_conditions, sup_suppliers, sup_tax_conditions, sup_tax_regimes, system_config
- **Escribe (4):** **sup_otp_codes**, **sup_supplier_attachments**, **sup_supplier_tax_conditions**, **sup_suppliers**
- **Funciones (1):** get_workers_with_permission

### `modules/suppliers/register.html`

- **Módulo:** suppliers
- **Lee (1):** system_config
- **Escribe (0):** —
- **Sin determinar (14):** sup_attachment_types, sup_banks, sup_ciiu_activities, sup_departments, sup_legal_document_versions, sup_legal_documents, sup_municipalities, sup_supplier_attachments, sup_supplier_legal_acceptances, sup_supplier_tax_conditions, sup_suppliers, sup_tax_conditions, sup_tax_regimes, system_config

### `modules/surveys/applications.html`

- **Módulo:** surveys
- **Lee (3):** survey_applications, survey_masters, survey_respondent_profile
- **Escribe (1):** **survey_applications**
- **Sin determinar (1):** survey_applications

### `modules/surveys/comparison.html`

- **Módulo:** surveys
- **Lee (6):** survey_applications, survey_masters, survey_questions, survey_respondent_profile, survey_scales, survey_sections
- **Escribe (0):** —
- **Sin determinar (1):** survey_responses

### `modules/surveys/dashboard.html`

- **Módulo:** surveys
- **Lee (9):** academic_years, student_status, students, survey_applications, survey_masters, survey_respondent_profile, survey_responses, users, workers
- **Escribe (0):** —

### `modules/surveys/index.html`

- **Módulo:** surveys
- **Lee (5):** permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (5):** survey_applications, survey_masters, survey_respondent_profile, survey_scales, users

### `modules/surveys/master-segments.html`

- **Módulo:** surveys
- **Lee (4):** segment_options, segments, survey_master_segments, survey_masters
- **Escribe (1):** **survey_master_segments**

### `modules/surveys/masters.html`

- **Módulo:** surveys
- **Lee (2):** survey_applications, users
- **Escribe (1):** **survey_masters**
- **Sin determinar (1):** survey_masters

### `modules/surveys/micro-survey-kiosk.html`

- **Módulo:** surveys
- **Lee (0):** —
- **Escribe (0):** —
- **Sin determinar (2):** micro_survey_responses, micro_surveys

### `modules/surveys/micro-surveys.html`

- **Módulo:** surveys
- **Lee (3):** micro_survey_responses, micro_surveys, users
- **Escribe (1):** **micro_surveys**
- **Sin determinar (1):** micro_survey_responses

### `modules/surveys/questions.html`

- **Módulo:** surveys
- **Lee (5):** survey_masters, survey_questions, survey_responses, survey_scales, survey_sections
- **Escribe (1):** **survey_questions**

### `modules/surveys/respond.html`

- **Módulo:** surveys
- **Lee (9):** segment_options, segments, survey_applications, survey_master_segments, survey_masters, survey_questions, survey_scale_options, survey_scales, survey_sections
- **Escribe (2):** **survey_respondent_profile**, **survey_responses**

### `modules/surveys/results.html`

- **Módulo:** surveys
- **Lee (13):** courses, segment_options, segments, survey_applications, survey_master_segments, survey_masters, survey_questions, survey_respondent_profile, survey_responses, survey_scale_options, survey_scales, survey_sections, users
- **Escribe (0):** —

### `modules/surveys/scales.html`

- **Módulo:** surveys
- **Lee (2):** survey_scale_options, survey_scales
- **Escribe (2):** **survey_scale_options**, **survey_scales**

### `modules/surveys/sections.html`

- **Módulo:** surveys
- **Lee (4):** survey_masters, survey_questions, survey_scales, survey_sections
- **Escribe (1):** **survey_sections**

### `modules/teacher-eval/config.html`

- **Módulo:** teacher-eval
- **Lee (1):** teval_config
- **Escribe (1):** **teval_config**

### `modules/teacher-eval/evaluate.html`

- **Módulo:** teacher-eval
- **Lee (18):** academic_assignments, academic_subject_grades, academic_subjects, academic_years, courses, grades, students, survey_scale_options, teval_config, teval_form_questions, teval_form_school_sections, teval_form_sections, teval_forms, teval_period_forms, teval_periods, teval_sessions, teval_verification_codes, workers
- **Escribe (3):** **teval_responses**, **teval_sessions**, **teval_verification_codes**

### `modules/teacher-eval/forms.html`

- **Módulo:** teacher-eval
- **Lee (6):** sections, survey_scales, teval_form_questions, teval_form_school_sections, teval_form_sections, teval_forms
- **Escribe (5):** **teval_form_questions**, **teval_form_school_sections**, **teval_form_sections**, **teval_forms**, **teval_period_forms**

### `modules/teacher-eval/index.html`

- **Módulo:** teacher-eval
- **Lee (6):** academic_years, permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (4):** teval_forms, teval_periods, teval_responses, users

### `modules/teacher-eval/leadership-catalogs.html`

- **Módulo:** teacher-eval
- **Lee (7):** leadership_attributes, leadership_behaviors, leadership_dimensions, leadership_grades, leadership_interest_groups, leadership_question_groups, leadership_questions
- **Escribe (6):** **leadership_attributes**, **leadership_behaviors**, **leadership_dimensions**, **leadership_grades**, **leadership_question_groups**, **leadership_questions**

### `modules/teacher-eval/leadership-cycles.html`

- **Módulo:** teacher-eval
- **Lee (6):** leadership_cycle_evaluatees, leadership_cycles, leadership_dimensions, leadership_grades, leadership_interest_groups, workers
- **Escribe (3):** **leadership_cycle_evaluatees**, **leadership_cycle_evaluators**, **leadership_cycles**

### `modules/teacher-eval/leadership-my-results.html`

- **Módulo:** teacher-eval
- **Lee (8):** leadership_attributes, leadership_cycle_evaluatees, leadership_cycle_evaluators, leadership_cycles, leadership_dimensions, leadership_interest_groups, worker_managers, workers
- **Escribe (0):** —

### `modules/teacher-eval/leadership-observations.html`

- **Módulo:** teacher-eval
- **Lee (4):** leadership_attributes, leadership_dimensions, leadership_observations, workers
- **Escribe (1):** **leadership_observations**
- **Sin determinar (1):** leadership_observations

### `modules/teacher-eval/leadership-plan.html`

- **Módulo:** teacher-eval
- **Lee (10):** leadership_attributes, leadership_cycle_evaluatees, leadership_cycle_evaluators, leadership_cycles, leadership_dimensions, leadership_improvement_actions, leadership_improvement_plans, leadership_observations, worker_managers, workers
- **Escribe (2):** **leadership_improvement_actions**, **leadership_improvement_plans**

### `modules/teacher-eval/leadership-reports.html`

- **Módulo:** teacher-eval
- **Lee (8):** leadership_attributes, leadership_cycle_evaluatees, leadership_cycle_evaluators, leadership_cycles, leadership_dimensions, leadership_grades, leadership_interest_groups, workers
- **Escribe (0):** —
- **Sin determinar (1):** leadership_observations

### `modules/teacher-eval/leadership-survey.html`

- **Módulo:** teacher-eval
- **Lee (12):** leadership_attributes, leadership_behaviors, leadership_cycle_evaluatees, leadership_cycle_evaluators, leadership_cycles, leadership_dimensions, leadership_grades, leadership_interest_groups, leadership_observations, leadership_question_groups, leadership_responses, workers
- **Escribe (2):** **leadership_cycle_evaluators**, **leadership_responses**
- **Sin determinar (1):** leadership_questions

### `modules/teacher-eval/monitor.html`

- **Módulo:** teacher-eval
- **Lee (10):** academic_years, courses, grades, sections, students, teval_form_school_sections, teval_forms, teval_period_forms, teval_periods, teval_sessions
- **Escribe (0):** —

### `modules/teacher-eval/my-results.html`

- **Módulo:** teacher-eval
- **Lee (11):** academic_years, courses, grades, sections, students, teval_form_questions, teval_form_sections, teval_periods, teval_responses, teval_sessions, workers
- **Escribe (0):** —

### `modules/teacher-eval/periods.html`

- **Módulo:** teacher-eval
- **Lee (6):** academic_years, sections, teval_form_school_sections, teval_forms, teval_period_forms, teval_periods
- **Escribe (2):** **teval_period_forms**, **teval_periods**

### `modules/teacher-eval/results.html`

- **Módulo:** teacher-eval
- **Lee (11):** academic_years, courses, grades, sections, students, teval_form_questions, teval_form_sections, teval_periods, teval_responses, teval_sessions, workers
- **Escribe (0):** —
- **Sin determinar (1):** teval_sessions

### `modules/teacher-eval/rubric.html`

- **Módulo:** teacher-eval
- **Lee (4):** teval_rubric_components, teval_rubric_descriptors, teval_rubric_domains, teval_rubric_levels
- **Escribe (4):** **teval_rubric_components**, **teval_rubric_descriptors**, **teval_rubric_domains**, **teval_rubric_levels**

### `modules/training/axes.html`

- **Módulo:** training
- **Lee (2):** training_axes, training_modules
- **Escribe (1):** **training_axes**

### `modules/training/dashboard.html`

- **Módulo:** training
- **Lee (1):** worker_training_paths
- **Escribe (0):** —

### `modules/training/facilitators.html`

- **Módulo:** training
- **Lee (3):** training_facilitators, training_module_facilitators, workers
- **Escribe (1):** **training_facilitators**

### `modules/training/generate-paths.html`

- **Módulo:** training
- **Lee (5):** job_roles, training_module_roles, worker_job_roles, worker_training_paths, workers
- **Escribe (1):** **worker_training_paths**

### `modules/training/index.html`

- **Módulo:** training
- **Lee (6):** academic_years, permissions, role_permissions, roles, user_roles, worker_training_paths
- **Escribe (0):** —
- **Sin determinar (4):** training_facilitators, training_modules, users, worker_training_paths

### `modules/training/manage-deadlines.html`

- **Módulo:** training
- **Lee (6):** job_roles, training_module_roles, training_modules, worker_job_roles, worker_training_paths, workers
- **Escribe (1):** **worker_training_paths**

### `modules/training/modalities.html`

- **Módulo:** training
- **Lee (2):** training_modalities, training_modules
- **Escribe (1):** **training_modalities**

### `modules/training/module-facilitators.html`

- **Módulo:** training
- **Lee (3):** training_facilitators, training_module_facilitators, training_modules
- **Escribe (1):** **training_module_facilitators**

### `modules/training/module-references.html`

- **Módulo:** training
- **Lee (2):** training_module_references, training_modules
- **Escribe (1):** **training_module_references**

### `modules/training/module-roles.html`

- **Módulo:** training
- **Lee (3):** job_roles, training_module_roles, training_modules
- **Escribe (1):** **training_module_roles**

### `modules/training/module-skills.html`

- **Módulo:** training
- **Lee (3):** training_module_skills, training_modules, training_skills
- **Escribe (1):** **training_module_skills**

### `modules/training/modules.html`

- **Módulo:** training
- **Lee (8):** training_axes, training_modalities, training_module_facilitators, training_module_roles, training_module_skills, training_modules, training_requisition_sources, worker_training_paths
- **Escribe (1):** **training_modules**

### `modules/training/my-dashboard.html`

- **Módulo:** training
- **Lee (6):** organizational_areas, training_axes, training_modalities, training_modules, worker_training_paths, workers
- **Escribe (0):** —

### `modules/training/my-path.html`

- **Módulo:** training
- **Lee (13):** job_roles, training_axes, training_facilitators, training_modalities, training_module_facilitators, training_module_references, training_module_roles, training_module_skills, training_modules, training_skills, worker_job_roles, worker_training_paths, workers
- **Escribe (0):** —

### `modules/training/path-queries.html`

- **Módulo:** training
- **Lee (7):** organizational_areas, training_axes, training_facilitators, training_modalities, training_modules, worker_training_paths, workers
- **Escribe (1):** **query_logs**
- **Sin determinar (3):** training_module_facilitators, worker_training_paths, workers

### `modules/training/register-completion.html`

- **Módulo:** training
- **Lee (6):** job_roles, training_module_roles, training_modules, worker_job_roles, worker_training_paths, workers
- **Escribe (1):** **worker_training_paths**

### `modules/training/reports.html`

- **Módulo:** training
- **Lee (9):** organizational_areas, organizational_divisions, training_axes, training_facilitators, training_modalities, training_module_facilitators, training_modules, worker_training_paths, workers
- **Escribe (0):** —
- **Sin determinar (2):** worker_training_paths, workers

### `modules/training/request-modules.html`

- **Módulo:** training
- **Lee (9):** training_axes, training_facilitators, training_modalities, training_module_facilitators, training_module_skills, training_modules, training_skills, worker_training_paths, workers
- **Escribe (1):** **worker_training_paths**

### `modules/training/requisition-sources.html`

- **Módulo:** training
- **Lee (2):** training_modules, training_requisition_sources
- **Escribe (1):** **training_requisition_sources**

### `modules/training/skills.html`

- **Módulo:** training
- **Lee (2):** training_module_skills, training_skills
- **Escribe (1):** **training_skills**

### `modules/training/waive-modules.html`

- **Módulo:** training
- **Lee (6):** job_roles, training_module_roles, training_modules, worker_job_roles, worker_training_paths, workers
- **Escribe (1):** **worker_training_paths**

### `modules/tte/categories.html`

- **Módulo:** tte
- **Lee (4):** tte_categories, tte_request_fragments, tte_requests, workers
- **Escribe (1):** **tte_categories**

### `modules/tte/dashboard.html`

- **Módulo:** tte
- **Lee (4):** academic_years, tte_categories, tte_priorities, tte_requests
- **Escribe (0):** —
- **Sin determinar (2):** tte_request_fragments, tte_requests

### `modules/tte/index.html`

- **Módulo:** tte
- **Lee (6):** academic_years, permissions, role_permissions, roles, user_roles, users
- **Escribe (0):** —
- **Sin determinar (2):** tte_requests, user_roles

### `modules/tte/manage-requests.html`

- **Módulo:** tte
- **Lee (9):** courses, grades, sections, tte_categories, tte_priorities, tte_request_comments, tte_request_fragments, tte_requests, workers
- **Escribe (3):** **tte_request_comments**, **tte_request_fragments**, **tte_requests**

### `modules/tte/priorities.html`

- **Módulo:** tte
- **Lee (1):** tte_priorities
- **Escribe (1):** **tte_priorities**

### `modules/tte/respond-requests.html`

- **Módulo:** tte
- **Lee (6):** courses, grades, sections, tte_categories, tte_request_comments, workers
- **Escribe (3):** **tte_request_comments**, **tte_request_fragments**, **tte_requests**

### `tilata-te-escucha.html`

- **Módulo:** (raíz)
- **Lee (4):** courses, grades, sections, system_config
- **Escribe (1):** **tte_requests**

