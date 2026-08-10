# Levantamiento — Cierre Presupuestal

**Módulo:** Presupuesto
**Fecha:** 10 de agosto de 2026
**Estado:** Borrador para revisión

---

## 1. Problema

SchoolNet no tiene cierre presupuestal. Hoy usa el cierre del **año académico** como sustituto, y eso produce comportamientos incoherentes entre pantallas.

El año académico 2025-2026 fue marcado como cerrado el 27 de julio de 2026. Pero el trabajo presupuestal de ese año continúa: durante agosto se siguen registrando ejecuciones de solicitudes que quedaron pendientes.

Son dos cierres distintos que hoy comparten una sola marca.

---

## 2. Regla institucional

Definida por Desarrollos:

| Concepto | Al cerrar el año |
|---|---|
| Presupuesto asignado (valor aprobado, responsable) | **Congelado** |
| Ejecución (solicitudes, movimientos) | **Abierta durante el traslape** |

El traslape es un periodo corto. Para el ciclo 2025-2026 → 2026-2027:

- **Agosto:** se registran solicitudes de ambos años presupuestales.
- **Desde septiembre:** solo del año vigente.

---

## 3. Estados propuestos

Tres estados presupuestales por año, independientes del estado académico:

**Abierto**
Se asignan y modifican valores aprobados. Se cambian responsables. Se ejecuta. Es el estado normal del año vigente.

**En traslape**
El presupuesto queda congelado: no se modifican valores aprobados ni responsables. La ejecución sigue viva. Es el estado del año anterior durante agosto.

**Cerrado**
Nada se modifica. Solo consulta.

---

## 4. Situación actual por pantalla

| Pantalla | Comportamiento hoy | Correcto |
|---|---|---|
| Autorización de presupuesto | Bloquea si el año académico está cerrado | Casi — debe leer el estado presupuestal, no el académico |
| Resolución de solicitudes | No filtra por año; etiqueta las de otro año | Sí — es el comportamiento que el traslape necesita |
| Aprobación de servicios | Solo muestra sub-ítems del año vigente | No — impide ejecutar contra el año en traslape |
| Inicializar generales | Permite cualquier año, incluidos cerrados; borra asignaciones | No — doble defecto |

---

## 5. Riesgo abierto

La pantalla de inicialización de generales **elimina físicamente** la asignación cuando se deja un sub-ítem sin responsable. No la desactiva: la borra. Sin confirmación previa.

En 2025-2026 hay **245 asignaciones generales**, de las cuales **230 tienen valor aprobado, ejecución registrada o solicitudes asociadas**.

Un clic accidental en el desplegable, con el selector de año en 2025-2026, destruye historia presupuestal de forma irreversible.

Este defecto no depende del modelo de estados y puede corregirse por separado.

---

## 6. Alcance del cambio

**Base de datos**
Columna de estado presupuestal en la tabla de años académicos, con sus restricciones.

**Interfaz nueva**
Pantalla de administración del estado presupuestal por año. Reemplaza la manipulación directa de base de datos.

**Pantallas a ajustar**
Las cuatro de la sección 4, para que consulten el estado presupuestal en lugar del académico.

**Corrección independiente**
Eliminar el borrado destructivo en la inicialización de generales.

---

## 7. Decisiones pendientes

Requieren definición institucional antes de diseñar.

**7.1 Autorización del cambio de estado**
¿Quién puede pasar un año de abierto a traslape, y de traslape a cerrado? ¿Contadora, rectoría, administrador del sistema?

**7.2 Reapertura excepcional**
Si en septiembre aparece una ejecución de 2025-2026 que quedó por fuera, ¿existe reapertura? ¿Con qué autorización? ¿O simplemente no se registra?

**7.3 Registro de autorizaciones**
Si hay reapertura, ¿debe quedar rastro de quién la autorizó y por qué? De esto depende si el módulo necesita bitácora o basta con un botón.

**7.4 Cambio de responsable en traslape**
Confirmado que el presupuesto asignado se congela. ¿Incluye al responsable, o puede cambiarse si la persona sale de la institución durante el traslape?

**7.5 Duración del traslape**
¿Es siempre agosto, o se define año por año? Si es fijo, puede automatizarse; si es variable, requiere acción manual.

---

## 8. Observaciones

**Sobre la marca de año vigente.**
El sistema maneja dos apuntadores separados: año académico vigente y año presupuestal vigente. Son campos distintos y pueden no coincidir. Cualquier pantalla que use el académico para decisiones presupuestales está mal.

**Sobre la identidad del responsable.**
Las asignaciones guardan el identificador del trabajador que ocupa el cargo al momento de crearlas. Si esa persona cambia durante el año, el sucesor no ve el presupuesto. Es deuda de la migración de identidad, ajena a este levantamiento pero relevante para la decisión 7.4.

---

## 9. Secuencia sugerida

1. Corregir el borrado destructivo en inicialización de generales.
2. Resolver las decisiones de la sección 7.
3. Diseñar e implementar el estado presupuestal.
4. Ajustar las cuatro pantallas.

El paso 1 es independiente y puede ejecutarse de inmediato.
