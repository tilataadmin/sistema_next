# Levantamiento: Ajuste de consumos reales en servicios con afectación presupuestal

**Proyecto:** SchoolNet (Colegio Tilatá)
**Módulo:** Servicios (`services`)
**Fecha:** 23 de septiembre de 2026
**Estado:** Levantamiento aprobado en sus decisiones principales; quedan pendientes señalados en la sección 9.

---

## 1. Problema

En las salidas pedagógicas, las salidas deportivas, las salidas de representación, los eventos internos y las atenciones a familias de admisiones se solicita una cantidad de refrigerios (y, en pedagógicas, de entradas). Esa cantidad se carga al presupuesto en el momento de la aprobación. Con frecuencia la cantidad que realmente se entrega o se consume es distinta, y muchas veces eso solo se sabe el día del servicio.

Hoy no hay forma de corregirlo. Una vez aprobado el servicio, la edición queda bloqueada y el presupuesto conserva el valor solicitado, no el real.

El objetivo es que personas autorizadas puedan registrar la cantidad real y que el presupuesto se ajuste automáticamente por la diferencia, hacia abajo o hacia arriba.

---

## 2. Situación actual (hallazgos del código)

### 2.1 Afectación presupuestal de salidas y eventos

La afectación ocurre en un solo punto: `approvals.html`, función `confirmarAprobacionConPresupuesto()`.

1. El aprobador elige uno de sus propios `budget_assignments` del año presupuestal activo (`system_config.current_budget_year_id`).
2. Se crea **un único** registro en `execution_requests` por servicio, con `request_status = 'approved'`. El registro queda enlazado al servicio mediante `service_request_id` → `svc_service_requests.request_id`.
3. Se incrementa `budget_assignments.executed_value` en el costo del servicio. El cálculo se hace en el navegador: lee el valor en caché y le suma el costo.
4. `svc_service_requests.request_status` pasa a `approved`.

El valor cargado lo calcula `calcularCostoServicio()` y depende del tipo de servicio:

| Tipo | Valor cargado al presupuesto |
|---|---|
| `pedagogical_trip` | `total_transport_value + total_catering_value + total_entrance_value` |
| `sports_trip` | `total_transport_value + total_catering_value` |
| `rep_trip` | `total_transport_value + total_catering_value` |
| `internal_event` | suma de `svc_internal_event_catering.total_value` + suma de `svc_internal_event_services.cost_value` **registrados al momento de aprobar** |

Después de la aprobación ningún módulo permite editar el servicio (`request_status === 'approved'` bloquea la edición).

### 2.2 Afectación presupuestal de admisiones

`admissions-family.html` funciona de otra manera. Al crear la solicitud genera su propio `execution_requests`, también en estado `approved`, sobre el ítem configurado en `svc_module_config.admissions_family_budget_item_id`, e incrementa `executed_value`. El vínculo con el presupuesto queda en `svc_admissions_family_services.execution_request_id`.

Esta página ya permite ajustar cantidades al "Marcar como Entregada", pero tiene dos debilidades:

- **Sobrescribe** `snack_quantity`, `lunch_quantity` y `total_value`, de modo que la cantidad solicitada originalmente se pierde.
- Ejecuta el ajuste con tres PATCH independientes desde el navegador (servicio, `execution_requests`, `budget_assignments`) y calcula `executed_value` a partir de una caché local.

Solo puede marcar la entrega quien esté configurado en `svc_service_type_notifications` con `service_type = 'admissions_family'`.

### 2.3 Dónde está almacenado cada concepto ajustable

| Servicio | Refrigerios | Entradas |
|---|---|---|
| Pedagógica | Tabla de líneas `svc_pedagogical_trip_catering` (hasta 2 líneas, `display_order` 1–2). También existen columnas planas en `svc_pedagogical_trips` (`catering_menu_id`, `catering_quantity`, `frozen_catering_unit_price`, `total_catering_value`) | Columnas en `svc_pedagogical_trips`: `entrance_value_students`, `entrance_value_adults` (valores unitarios) y `total_entrance_value`. **No se guarda la cantidad**: el total se calcula como `entrance_value_students × planned_students + entrance_value_adults × num_adults` |
| Deportiva | Columnas planas en `svc_sports_trips` (un solo menú) | No aplica |
| Representación | Columnas planas en `svc_rep_trips` (un solo menú) | No aplica |
| Evento interno | Tabla de líneas `svc_internal_event_catering`, por `target_group` (`students`/`adults`) y `menu_id` | No aplica |
| Admisiones | `svc_admissions_family_services`: `snack_quantity`/`snack_unit_price` y `lunch_quantity`/`lunch_unit_price` | No aplica |

En todos los casos el precio unitario queda congelado al crear la solicitud (`frozen_unit_price`, `frozen_catering_unit_price`, `snack_unit_price`, `lunch_unit_price`). El ajuste usa siempre ese precio congelado, no el precio vigente del menú.

---

## 3. Decisiones tomadas

| # | Decisión | Origen |
|---|---|---|
| D1 | Un único permiso funcional para ajustar los cinco tipos de servicio | Institucional |
| D2 | El ajuste se permite hasta 3 días hábiles después de la fecha del servicio | Institucional |
| D3 | Se permite ajustar hacia abajo y hacia arriba | Institucional |
| D4 | El ajuste se permite sin importar el estado contable del `execution_request` (`approved`, `executed`, `pre-closed`, `closed`) | Institucional |
| D5 | Conceptos ajustables: refrigerios en los cinco servicios, entradas (estudiantes y adultos) en pedagógicas, y almuerzos en admisiones | Institucional; los almuerzos se incluyen porque el modal actual de admisiones ya los ajusta |
| D6 | La cantidad solicitada nunca se sobrescribe. La cantidad real se guarda aparte | Técnica |
| D7 | El ajuste es un **delta** sobre el `execution_request` existente, no un recálculo del total del servicio | Técnica |
| D8 | El assignment afectado es el que quedó guardado en `execution_requests.assignment_id`, no el del usuario que ajusta | Técnica |
| D9 | El ajuste se ejecuta en una función RPC transaccional, no con PATCH encadenados desde el navegador | Técnica |
| D10 | Cada ajuste queda en una bitácora común a los cinco servicios | Técnica |
| D11 | El modal "Marcar como Entregada" de admisiones se conserva para quienes hoy lo usan, pero pasa a usar la misma RPC y la misma bitácora | Técnica, sujeta a confirmación (ver P4) |

### 3.1 Justificación de D7

En eventos internos, el valor aprobado incluye solo los costos de áreas de apoyo registrados hasta el momento de la aprobación. Si al ajustar refrigerios se recalculara el total completo del servicio, se cargarían también al presupuesto los costos de apoyo registrados después, y ese sería un efecto no buscado. Por eso el delta se calcula únicamente sobre los conceptos ajustados:

```
delta = Σ (cantidad_real − cantidad_vigente) × precio_unitario_congelado
```

Aquí `cantidad_vigente` es la cantidad real registrada en el ajuste anterior o, si no hubo ajuste previo, la cantidad solicitada. Así, los ajustes sucesivos se acumulan correctamente.

### 3.2 Justificación de D9

`budget_assignments.executed_value` no tiene trigger de protección. Si se ajusta con varias peticiones independientes, cualquier fallo intermedio o dos ajustes simultáneos dejan el valor desincronizado. La RPC actualiza el campo en SQL (`executed_value = executed_value + delta`) dentro de una sola transacción.

---

## 4. Ventana de ajuste

**Inicio:** cuando el servicio queda aprobado.
- Salidas y eventos: `svc_service_requests.request_status = 'approved'`.
- Admisiones: desde la creación, porque la solicitud nace aprobada presupuestalmente.

Antes de la aprobación no existe `execution_request`, y el solicitante puede editar el servicio normalmente.

**Fin:** 3 días hábiles después de la fecha del servicio, incluido ese tercer día completo.

| Servicio | Fecha de referencia |
|---|---|
| Pedagógica, deportiva, representación | `trip_date` |
| Evento interno | `event_date` |
| Admisiones | `service_date` |

**Cálculo de días hábiles:** se excluyen sábados, domingos y los días cubiertos por rangos de `hr_non_work_days` con `day_type` en `holiday`, `paid_break` o `unpaid_break`. `virtual_day` cuenta como día hábil. La fecha actual se toma en hora de Bogotá dentro de la base de datos (`(now() AT TIME ZONE 'America/Bogota')::date`).

Ejemplo: servicio el viernes, sin festivos cercanos → se puede ajustar hasta el miércoles siguiente inclusive.

**Estados excluidos:**
- Salidas: `trip_status` en `suspended` o `cancelled`.
- Eventos: `event_status` en `suspended` o `cancelled`.
- Admisiones: `service_status = 'cancelled'`.

La reversión total por suspensión o cancelación queda fuera de este alcance (ver sección 10).

La ventana se valida en la RPC, no solo en la interfaz.

---

## 5. Modelo de datos propuesto

Los nombres son propuestos. Se confirman en el momento de escribir cada sentencia SQL, contra un `DataBase` actualizado.

### 5.1 Columnas nuevas de cantidad real

En todas las columnas nuevas, `NULL` significa "sin ajuste": rige la cantidad solicitada. El valor real puede ser 0, porque puede ocurrir que no se entregue nada.

| Tabla | Columnas nuevas |
|---|---|
| `svc_pedagogical_trip_catering` | `delivered_quantity integer`, `delivered_total_value numeric` |
| `svc_internal_event_catering` | `delivered_quantity integer`, `delivered_total_value numeric` |
| `svc_sports_trips` | `catering_delivered_quantity integer`, `total_catering_delivered_value numeric` |
| `svc_rep_trips` | `catering_delivered_quantity integer`, `total_catering_delivered_value numeric` |
| `svc_pedagogical_trips` | `entrance_delivered_students integer`, `entrance_delivered_adults integer`, `total_entrance_delivered_value numeric`; posiblemente `total_catering_delivered_value numeric` (ver P2) |
| `svc_admissions_family_services` | `delivered_snack_quantity integer`, `delivered_lunch_quantity integer`, `delivered_total_value numeric` |

Todas llevan `CHECK (col IS NULL OR col >= 0)`.

La restricción existente `quantity > 0` en las tablas de líneas se mantiene, porque aplica a la cantidad solicitada.

### 5.2 Bitácora común

Tabla nueva `svc_consumption_adjustments`, con una fila por concepto ajustado:

| Columna | Tipo | Descripción |
|---|---|---|
| `adjustment_id` | uuid PK | |
| `adjustment_group_id` | uuid NOT NULL | Agrupa las filas de un mismo acto de ajuste (un guardado del modal) |
| `service_type` | varchar NOT NULL | `pedagogical_trip`, `sports_trip`, `rep_trip`, `internal_event`, `admissions_family` |
| `service_id` | uuid NOT NULL | `trip_id`, `event_id` o `service_id`, según el tipo |
| `concept` | varchar NOT NULL | `catering`, `entrance_students`, `entrance_adults`, `snack`, `lunch` |
| `catering_line_id` | uuid NULL | `id` de la línea en `svc_pedagogical_trip_catering` o `svc_internal_event_catering` |
| `menu_id` | uuid NULL | FK a `svc_catering_menus` |
| `unit_price` | numeric NOT NULL | Precio congelado usado |
| `requested_quantity` | integer NOT NULL | Cantidad solicitada original, como referencia |
| `previous_quantity` | integer NOT NULL | Cantidad vigente antes de este ajuste |
| `new_quantity` | integer NOT NULL | Cantidad registrada en este ajuste |
| `value_delta` | numeric NOT NULL | `(new − previous) × unit_price` |
| `execution_request_id` | uuid NULL | FK a `execution_requests`; NULL si el servicio no tiene afectación presupuestal |
| `assignment_id` | uuid NULL | FK a `budget_assignments` |
| `execution_status_at_adjustment` | varchar NULL | Estado del `execution_request` en el momento del ajuste (para trazabilidad de D4) |
| `adjustment_reason` | text NOT NULL | Motivo, obligatorio |
| `adjusted_by` | uuid NOT NULL | FK a `users` |
| `adjusted_at` | timestamptz DEFAULT now() | |

Lleva `CHECK` sobre `service_type` y `concept`, y `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`.

`service_id` no puede tener FK porque apunta a tablas distintas según el tipo. La integridad la garantiza la RPC.

### 5.3 Valor efectivo

Las pantallas y los reportes usan como valor efectivo `COALESCE(valor_real, valor_solicitado)` por concepto. Los valores solicitados no se modifican nunca.

---

## 6. Lógica del ajuste (RPC)

### 6.1 Funciones

- **Función de fecha límite.** Recibe una fecha y devuelve el tercer día hábil siguiente, según la sección 4.
- **Función de ajuste.** Una sola función para los cinco tipos. Parámetros conceptuales: tipo de servicio, id del servicio, lista de conceptos con la nueva cantidad (y el id de línea cuando aplique), motivo y `user_id`.

### 6.2 Secuencia (una transacción)

1. Validar que el usuario tenga el permiso (D1), consultando `user_roles`/`role_permissions` o equivalente. Se confirma contra el esquema al escribir la función.
2. Cargar el servicio y validar: existe, no está suspendido ni cancelado, está aprobado (salvo admisiones) y la fecha actual está dentro de la ventana.
3. Validar que las cantidades nuevas sean ≥ 0 y que el motivo no esté vacío.
4. Para cada concepto, calcular la cantidad vigente, la cantidad nueva, el precio congelado y el delta.
5. Si el delta total es 0, no se hace nada y se devuelve un aviso.
6. Actualizar las columnas de cantidad y valor real.
7. Localizar el `execution_request`:
   - salidas y eventos: por `service_request_id = svc_*.request_id`;
   - admisiones: por `svc_admissions_family_services.execution_request_id`.
   - Si hay más de uno, abortar con error.
   - Si no hay ninguno, continuar sin afectación presupuestal y marcarlo en la respuesta.
8. Actualizar `execution_requests`: `requested_value = requested_value + round(delta)`, añadir una nota al final de `request_details` (fecha, delta, usuario) y actualizar `updated_at`.
9. Actualizar `budget_assignments` del `assignment_id` del `execution_request`: `executed_value = executed_value + round(delta)` y `updated_at`.
10. Insertar las filas de bitácora con un `adjustment_group_id` común.
11. Devolver: éxito, delta total, nuevo `executed_value`, `approved_value`, si hubo sobreejecución y si el `execution_request` estaba fuera de `approved`.

`execution_requests.requested_value` y `budget_assignments.executed_value` son enteros (`integer` y `bigint`). El delta se redondea una sola vez, sobre el total del acto de ajuste.

### 6.3 Notificaciones

Después del ajuste, desde el navegador y con `sendNotification()`:

- **Sobreejecución:** si un ajuste hacia arriba deja `executed_value > approved_value`, se notifica al administrador presupuestal (`system_config.budget_admin_email`), igual que en `approvals.html`.
- **Estado contable avanzado:** si el `execution_request` ya no estaba en `approved`, se notifica al administrador presupuestal para que revise el efecto contable. Ver P3.

---

## 7. Permiso

| Campo | Valor |
|---|---|
| `permission_name` | `Ajustar consumos de servicios` |
| `permission_module` | `services` |
| `permission_type` | `write` |
| `url_path` | `NULL` (permiso funcional, no aparece en el menú) |
| `is_universal` | `false` |

Después de asignarlo hay que limpiar `sessionStorage.schoolnet_sidebar_permissions` en los usuarios afectados.

---

## 8. Interfaz

### 8.1 Salidas y eventos (`pedagogical-trips.html`, `sports-trips.html`, `rep-trips.html`, `internal-events.html`)

- En el detalle del servicio aparece el botón **"Ajustar consumo"** solo si se cumplen tres condiciones: el usuario tiene el permiso, el servicio está aprobado y no está suspendido ni cancelado, y la fecha actual está dentro de la ventana. La fecha límite visible se obtiene de la misma función de la base de datos, para evitar diferencias de zona horaria.
- **Modal**, con una fila por concepto ajustable:
  - Concepto (menú / entradas estudiantes / entradas adultos), precio unitario congelado, cantidad solicitada, cantidad vigente y campo de cantidad real.
  - Resumen: valor vigente, valor ajustado y diferencia presupuestal (con signo y color).
  - Motivo obligatorio.
  - En pedagógicas, el campo de entradas de estudiantes se precarga con `actual_students` cuando existe (registrado en el banderazo).
  - Se muestra la fecha límite del ajuste.
- **Detalle y listados:** cuando hay ajuste, el costo muestra el valor solicitado y el valor real. El historial de ajustes se consulta desde la bitácora.

### 8.2 Aprobaciones (`approvals.html`)

No cambia el flujo de aprobación. En el detalle de un servicio aprobado se muestra el valor real si hubo ajuste.

### 8.3 Admisiones (`admissions-family.html`)

- **"Marcar como Entregada"** se conserva para los usuarios configurados en `svc_service_type_notifications`. Pasa a llamar a la RPC, escribe en las columnas `delivered_*` sin sobrescribir las solicitadas y deja registro en la bitácora. El motivo es obligatorio solo si hay diferencia.
- **"Ajustar consumo"** después de la entrega, para quien tenga el permiso, dentro de la ventana de 3 días hábiles contados desde `service_date`.
- El registro de cancelación actual (reversión completa) no cambia en este alcance.

---

## 9. Pendientes

| # | Pendiente | Tipo | Bloquea |
|---|---|---|---|
| P1 | Confirmar si `hr_non_work_days` tiene cargados los festivos nacionales de Colombia o solo los institucionales | Institucional / datos | La función de fecha límite |
| P2 | Verificar cuál es la fuente autoritativa de refrigerios en pedagógicas (columnas planas o `svc_pedagogical_trip_catering`), revisando `create_pedagogical_trip` y `update_pedagogical_trip` con `pg_get_functiondef` | Técnico | Las columnas de 5.1 para pedagógicas y la RPC |
| P3 | Confirmar si el administrador presupuestal debe ser notificado de todos los ajustes o solo de sobreejecuciones y de ajustes sobre `execution_request` fuera de `approved` | Institucional | Paso de notificaciones |
| P4 | Confirmar que en admisiones los usuarios configurados sigan ajustando al entregar sin necesitar el permiso nuevo | Institucional | Interfaz de admisiones |
| P5 | Verificar el nombre exacto de las tablas de asignación de permisos a roles, para la validación en la RPC | Técnico | La RPC |

---

## 10. Hallazgos relacionados fuera de alcance

Tienen la misma naturaleza (el valor real difiere del cargado), pero no se resuelven aquí. La bitácora y la RPC quedan diseñadas para poder cubrirlos más adelante.

1. **Suspensión o cancelación después de aprobar.** En el código revisado no se reversa el `execution_request` cuando una salida o evento aprobado se suspende o cancela. Falta confirmar si `suspend_trip` lo hace.
2. **Costos de apoyo tardíos en eventos internos.** Los `svc_internal_event_services.cost_value` registrados después de la aprobación no llegan al presupuesto.
3. **Cantidades históricas de admisiones.** Las solicitudes ya entregadas perdieron la cantidad solicitada original. No se puede reconstruir.
4. **Inconsistencia en `approvals.html`.** El `execution_request` se crea con `worker_id` del solicitante y `worker_email` del aprobador. Es una deuda menor asociada a la migración de identidad de trabajadores.

---

## 11. Plan de implementación (DEV primero)

Un paso a la vez, con confirmación entre pasos.

1. Resolver P1, P2 y P5.
2. Crear el permiso.
3. Crear la tabla de bitácora.
4. Añadir las columnas de cantidad real, tabla por tabla.
5. Crear la función de fecha límite y probarla con fechas conocidas.
6. Crear la RPC de ajuste y probarla con servicios reales de DEV, verificando `executed_value` antes y después.
7. Interfaz en `sports-trips.html` (el caso más simple: un solo menú plano).
8. Interfaz en `rep-trips.html`.
9. Interfaz en `internal-events.html` (líneas por grupo).
10. Interfaz en `pedagogical-trips.html` (líneas + entradas).
11. Migración del modal de entrega y del ajuste posterior en `admissions-family.html`.
12. Visualización del valor real en `approvals.html`.
13. Replicación en PROD, con respaldo `bkp_...` de `budget_assignments` y `execution_requests` antes del primer ajuste real.
