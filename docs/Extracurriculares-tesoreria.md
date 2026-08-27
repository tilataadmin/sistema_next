# Bitácora — Consulta de Tesorería (Extracurriculares)

**Fecha:** 27 de agosto de 2026
**Página:** `/modules/extracurricular/treasury.html`
**Permiso:** `Consulta de Tesorería de extracurriculares` (ya existía en ambos ambientes)
**Estado:** construida y verificada en producción con datos reales. Falta probar la exportación.

---

## 1. Qué resuelve

Es el paso 8 del flujo operativo del módulo: la entrega a Tesorería. La pantalla muestra las
inscripciones de una temporada con el valor a facturar de cada una y exporta un archivo de
Excel que Tesorería digita en Phidias.

**La generación de cobros en Phidias es manual.** Se descartó la integración por API: SchoolNet
entrega el dato, una persona lo carga. Esa decisión eliminó del alcance el mapeo de pagador,
la trazabilidad de sincronización y la infraestructura de logs que habría exigido escribir en
Phidias.

---

## 2. El hallazgo que cambió el diseño

`fn_extracurricular_enroll` **no compone el total: lo elige.**

```sql
v_total := CASE p_transport_option
  WHEN 'linked'   THEN v_activity.frozen_price_linked
  WHEN 'unlinked' THEN v_activity.frozen_price_unlinked
  ELSE v_activity.frozen_price END;
```

Cada inscripción guarda los tres totales congelados y el cobro es una selección de columna.
No hay aritmética que reproducir en la pantalla, así que no existe el riesgo de una tercera
implementación divergente de la misma cuenta.

**Dos consecuencias:**

- **`frozen_activity_price` tiene un nombre engañoso.** No es "el precio de la actividad": es
  el total de la opción sin transporte. El nombre quedó de antes del modelo de tres precios.
  En pantalla se rotula como total, nunca como componente.
- **Las tarifas del operador no van en la factura.** `frozen_transport_rate_linked` y
  `frozen_transport_rate_unlinked` registran lo que cobra el proveedor, para conciliar su
  factura. No aparecen en ninguna vista de Tesorería; si aparecieran, alguien las sumaría.

---

## 3. Cambios de esquema aplicados

Los tres en DEV y PROD, verificados.

| Cambio | Tabla | Razón |
|---|---|---|
| `ADD COLUMN delivered_by uuid` + FK a `users` | `svc_extracurricular_cycles` | Constancia de quién entregó, simétrico con `published_by` |
| `SET NOT NULL` en `frozen_price_linked` | `svc_extracurricular_enrollments` | Cero nulos en ambos ambientes; el total no puede quedar sin origen |
| `SET NOT NULL` en `frozen_price_unlinked` | `svc_extracurricular_enrollments` | Igual |

> **`svc_extracurricular_activities` NO se tocó.** Ahí esas dos columnas también son nulables,
> pero el nulo es legítimo: una actividad en `draft` no tiene precios congelados hasta que se
> publica la temporada. Ponerles `NOT NULL` rompería la creación de actividades.

---

## 4. Reglas de la pantalla

**Qué opción de transporte manda.** `COALESCE(validated_transport_option, transport_option)`.
La familia declara al inscribirse; `validated_transport_option` solo se llena si el colegio
verifica con el operador y encuentra que lo declarado no corresponde. Es una corrección
eventual, no un paso obligatorio, así que **nada bloquea la exportación** por falta de
validación. Cuando las dos existen y difieren, la fila se marca en amarillo con un ícono.

**Qué inscripciones se cobran.** Solo `enrollment_status = 'active'`. Las retiradas antes de
cualquier entrega simplemente no se facturan.

**Qué temporadas se ven.** `published`, `enrollment_closed`, `delivered` y `closed`.

**`published` entra como vista provisional.** Fue una desviación del diseño original, tomada
porque la única temporada con datos estaba abierta y la regla estricta habría dejado la
pantalla vacía hasta el 11 de septiembre, sin posibilidad de probarla antes de la fecha en
que se necesita. Lleva cinta amarilla y el botón de exportar deshabilitado. Verificado: el
botón no responde al clic.

**La entrega se registra al exportar.** Un solo acto en vez de dos. Escribe `delivered_at` y
`delivered_by`, y si la temporada estaba en `enrollment_closed` avanza el estado a
`delivered`. Si ya estaba entregada o cerrada, solo actualiza la fecha.

**El archivo se genera antes de registrar la entrega.** Si la descarga falla, no queda una
entrega marcada que nadie recibió.

**Columnas del Excel:** código de estudiante, código de familia, estudiante, curso, actividad,
días, transporte, valor a cobrar. Una sola columna de dinero, sin descomponer el transporte.

> **Por qué una sola columna.** Los tres precios se editan de forma independiente para permitir
> subsidio cruzado, así que la diferencia entre el total con ruta y el total sin ruta no es un
> costo de transporte: es lo que el colegio decidió cobrar de más, y puede ser cero. Separarla
> sería inventar un dato.

**Novedades posteriores a la entrega.** Pestaña propia, visible solo cuando existe
`delivered_at`. Compara `created_at` y `withdrawn_at` contra esa fecha. Los retiros van a nota
crédito en Phidias, las altas a cobro adicional. Sin esa marca, Tesorería no tendría cómo
distinguir lo nuevo de lo ya facturado.

---

## 5. Verificación en producción

Temporada `2026-2027 I`, estado `published`, 27 de agosto de 2026.

| Cifra | Valor |
|---|---|
| Estudiantes | 117 |
| Inscripciones activas | 135 |
| Actividades con inscritos | 24 |
| Total provisional | $115.001.600 |
| Retiros previos a la entrega | 2 (no se cobran) |
| Validaciones de transporte hechas | 0 |

Reparto de transporte: 72 sin transporte, 61 ruta vinculada, 2 ruta no vinculada. Cuadra con
la vista por actividad (Fútbol: 12 + 5 + 0 = 17 inscritos).

Los tres anidamientos de PostgREST se probaron en consola antes de escribir la página:
`students → courses`, el salto a actividades por la llave compuesta
(`!svc_extracurricular_enrollments_activity_fkey`) y la lectura inversa de
`svc_extracurricular_enrollment_days`. Los tres resuelven. `students` y la actividad vuelven
como objeto; los días, como arreglo.

---

## 6. Qué falta

| # | Pendiente | De quién |
|---|---|---|
| 1 | Probar la exportación. Requiere una temporada en `enrollment_closed`; se puede simular en DEV moviendo el estado y devolviéndolo | Desarrollo |
| 2 | Confirmar con Tesorería que el orden de columnas del Excel es el que digita en Phidias | Coordinación / Tesorería |
| 3 | Manual de la página | Desarrollo |

---

## 7. Alerta operativa, ajena a la pantalla

**24 actividades para 135 inscripciones da 5,6 estudiantes en promedio, contra mínimos de 10.**
Cuando cierren inscripciones, la vista por actividad va a marcar en rojo buena parte del
catálogo. Eso dispara el paso 7 del flujo —cierre de actividades sin mínimo y reubicaciones—
que ocurre **antes** de la entrega a Tesorería y es trabajo humano de coordinación.

Conviene avisarlo con tiempo: la ventana cierra el 11 de septiembre y facturar antes de
reubicar obliga a una nota crédito por cada movimiento posterior.

---

## 8. Aprendizajes

- **Leer la función antes de diseñar la pantalla.** El export de `DataBase.md` solo trae tablas;
  la aritmética del cobro vivía en `pg_get_functiondef` y resultó ser una selección, no una suma.
  Media hora de lectura ahorró una reimplementación equivocada.
- **`DataBase.md` estaba desactualizado.** No tenía `frozen_price_linked` ni
  `frozen_price_unlinked`, que son justamente las columnas de las que sale el valor a cobrar.
  Se re-exportó antes de escribir código.
- **Probar la consulta en consola antes de envolverla en HTML.** Los anidamientos de PostgREST
  son donde se rompen las cosas, y descubrirlo dentro de 600 líneas de página cuesta mucho más.
- **Un nombre de columna heredado puede inducir un error de negocio.** `frozen_activity_price`
  suena a componente y es un total.
- **Los datos reales cambian decisiones de diseño.** La regla de mostrar solo temporadas cerradas
  era correcta en abstracto y habría dejado la pantalla sin poder probarse.
