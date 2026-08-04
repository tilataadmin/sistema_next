# Bitácora — Saneamiento de `family_members` y carga desde PHIDIAS

**Fecha:** 4 de agosto de 2026
**Ambiente intervenido:** **PROD** (`mrtuerkncqodhakuwjob`, us-east-2)
**Módulo afectado:** Familias (`modules/config/families.html`) — insumo para el Portal de Familias
**Estado final:** ✅ Cerrado. 309 de 309 familias con estudiantes activos tienen familiares con correo.

---

## 1. Origen y objetivo

El Portal de Familias autentica por **correo del familiar** (OTP): `family_members.email → families → students`. Una familia sin familiar con correo es una familia que **no puede entrar al portal**, sin importar que el resto del sistema funcione.

Objetivo de la sesión: verificar si todas las familias con estudiantes activos tenían familiares con correo registrado, y cerrar los huecos encontrados.

---

## 2. Modelo de datos (recordatorio, verificado contra `DataBase`)

Tres precisiones que determinan cómo se arma cualquier consulta sobre esta cadena:

- `students.family_id` es **integer** y referencia `families.family_code` — **no** el uuid `families.family_id`. Es la trampa recurrente del esquema.
- `family_members.family_id` sí es el **uuid** de `families`. Por eso toda consulta estudiante ↔ familiar debe pasar por `families` como puente (traducción código → uuid).
- "Estudiante activo" se resuelve por `students.status_id → student_status.status_code = 1`.

Además: el filtro `member_status = 'active'` debe ir en el **`ON` del LEFT JOIN**, nunca en el `WHERE`. Si va en el `WHERE`, las familias sin ningún familiar activo desaparecen del resultado — que es justo el caso que se quiere detectar.

---

## 3. Diagnóstico inicial

Resultado del resumen sobre PROD:

| Métrica | Valor |
|---|---|
| Familias con estudiantes activos | 309 |
| Sin familiares | **28** |
| Ningún correo (teniendo familiares) | 0 |
| Correo parcial | 0 |
| Completas | 281 |

**Lectura:** el problema no era de calidad del dato sino de cobertura. Todo familiar que existía tenía correo; simplemente había 28 familias (9 %) sin ninguna fila en `family_members`.

El desglose por causa confirmó que las 28 eran de tipo **"nunca se cargaron"** (`filas_totales = 0`), no familias con familiares desactivados. Coincide con lo documentado en la bitácora del Portal: Bloque A (26 códigos del CSV inexistentes en `families`) + Bloque C (8 registros con contacto faltante).

---

## 4. Solución: exportación de PHIDIAS

En vez de esperar la respuesta de IT o digitar 56 familiares a mano en el modal, se usó una **exportación directa de PHIDIAS**.

### 4.1 La llave del cruce

> **`family_code` = los primeros 6 dígitos del código de estudiante de PHIDIAS.**

El código de estudiante de PHIDIAS tiene 7 dígitos: 6 de familia + 1 de consecutivo del hijo. Ej.: `1061481` → familia `106148`, hijo 1.

### 4.2 Forma del archivo

El archivo exportado tiene extensión `.xls` pero **es HTML**, no un binario de Excel. Se parsea con `pandas.read_html()`, no con `read_excel()`.

Viene **fragmentado en 25 tablas** (una por sección/curso), no en una sola. Hay que concatenarlas: `pd.concat(pd.read_html(archivo))`. Total: 405 estudiantes / 310 familias.

### 4.3 Estructura de columnas

17 columnas: `Sección`, `Estudiante`, `Apellido 1`, `Apellido 2`, `Código`, y luego **tres bloques de cuatro** columnas cada uno (relación, apellido, email, nombre):

| Bloque | Encabezado | Registros con dato |
|---|---|---|
| 1 | Padre | 400 |
| 2 | Padre (segundo cupo) | **4** |
| 3 | Madre | 404 |

Las celdas vacías traen el literal `"No hay datos"`, no `NULL` ni cadena vacía.

### 4.4 ⚠️ El bloque 2 contiene razones sociales

De los 4 registros del segundo cupo de "Padre", **dos son empresas de facturación**, no personas:

- `, GEOPARK AMERICAS SAS` — `scastaneda@geo-park.com` (familias 105785 Castañeda Palacio)
- `, RANDOM MONKEY SAS` — `facturas@randommonkey.io` (familia 105960 Marín Arcia)

Se reconocen por el patrón **apellido vacío antes de la coma** (`, RAZÓN SOCIAL`). PHIDIAS usa ese cupo como contacto de facturación, no como acudiente.

**Cargar ese bloque a ciegas metería empresas como familiares del portal.** El script de esta sesión leyó únicamente los bloques 1 y 3, y las dos familias afectadas no estaban entre las 28 pendientes. Se verificó también que no existen razones sociales entre los 574 familiares de la carga original (consulta con regex sobre sufijos societarios, coma inicial y mayúsculas completas: 0 filas).

---

## 5. Ejecución

### 5.1 Validaciones previas a insertar

Sobre las 56 filas candidatas (28 familias × Padre + Madre):

- Cobertura: **28 de 28** familias pendientes presentes en la exportación.
- Nombre y correo completos en las cuatro columnas relevantes: **0 vacíos**.
- Correos con formato inválido: **0**.
- Correos repetidos entre sí: **0**.
- Cadenas en NFD (Unicode descompuesto): **0**.
- Apóstrofes que requirieran escape SQL: **0**.
- Razones sociales, nombres sin coma o en mayúsculas: **0**.

### 5.2 Script

`INSERT ... SELECT` con CTE `VALUES`, unido a `families` por `family_code` (nunca por uuid literal, para que sea **ambiente-agnóstico**), y con guarda `NOT EXISTS` sobre `family_id + lower(trim(email))` para ser **idempotente**.

Valores fijos: `phone = NULL`, `is_primary = false`, `member_status = 'active'`, `display_order` = 1 (Padre) / 2 (Madre). `relationship` = `'Padre'` / `'Madre'` literal, consistente con la carga original.

**Resultado: 56 filas insertadas.**

### 5.3 Verificación posterior

| Métrica | Valor |
|---|---|
| Familias con estudiantes activos | 309 |
| Sin familiares | **0** |
| Correo incompleto | **0** |
| Completas | **309** |

---

## 6. Efecto sobre pendientes previos del Portal de Familias

- **Bloque A** (26 códigos del CSV que no existían en `families`) — ✅ **cerrado**. Las familias sí existían en `families`; lo que faltaba eran sus `family_members`. PHIDIAS los aportó.
- **Bloque C** (8 registros con datos de contacto faltantes) — ✅ **cerrado**.
- **Bloque B** (familia 106000, Peláez Vergara, con padres distintos entre "hermanos") — ⚠️ **datos cargados, decisión pendiente**. La familia quedó con Padre y Madre según PHIDIAS, pero la pregunta institucional de si se trata de una o dos familias sigue abierta y corresponde a IT / Secretaría Académica.

**La "segunda tanda" de carga de `family_members` que esperaba respuesta de IT queda sin objeto.** No hay que esperar a IT para poblar la tabla.

---

## 7. Hallazgos que requieren decisión externa

### 7.1 Familia 106156 — correo de la madre presuntamente errado 🔴

| Rol | Nombre | Correo |
|---|---|---|
| Padre | González Rodríguez, Sergio Andrés | `sergioan.gonzalez@uexternado.edu.co` |
| Madre | Salazar Moreno, Maria Camila | `sergioan@gonzalezreyabogados.com` |

El correo de la madre lleva el prefijo `sergioan` y el dominio del bufete del padre. Casi con certeza es el correo de él, duplicado en el campo de ella.

**Riesgo concreto:** si la madre solicita acceso al Portal, el código OTP le llega al padre. No es un bloqueo (la familia entra igual), pero es un dato errado en el origen.

**Acción:** confirmar con Admisiones o directamente con la familia. Se corrige desde el modal de `families.html` o con un `UPDATE` puntual.

### 7.2 Correos de dominio corporativo (informativo, sin acción inmediata)

Seis de las 56 filas usan dominio corporativo. Todas son cuentas personales de trabajo, no buzones institucionales. La única que merece seguimiento es **106142** (Berridi Rovira, Florencia Paula — `fpberridi@colegiotilata.edu.co`): es funcionaria del colegio, y ese correo deja de existir el día que se retire.

---

## 8. Pendientes derivados

| # | Pendiente | Responsable | Prioridad |
|---|---|---|---|
| 1 | Confirmar correo real de Maria Camila Salazar (familia 106156) | Admisiones / Desarrollos | Media |
| 2 | Cargar **teléfonos** de las 28 familias nuevas (`phone = NULL`) — requiere una exportación de PHIDIAS que incluya celular | Desarrollos | Media |
| 3 | **Replicar la carga a DEV** — DEV quedó desactualizado respecto a PROD en estas 28 familias | Desarrollos | Media |
| 4 | Limpiar el correo de prueba `hgmoncadal@gmail.com` en `family_members` de DEV (familia 105695) y las filas `TEST_DIAGNOSTICO` de `portal_access_codes` | Desarrollos | Baja |
| 5 | Decisión institucional sobre la familia 106000 (Bloque B) | IT / Secretaría Académica | Baja |
| 6 | Agregar validación de formato de correo en el modal de `families.html` (hoy acepta cualquier cadena, incluso sin `@`) | Desarrollos | Baja |

---

## 9. Comportamiento del botón "Actualizar" de `families.html`

Documentado en esta sesión porque condiciona cualquier corrección manual futura. `guardarFamilia()` hace dos cosas:

1. **`PATCH` a `families`** filtrado por `family_id`: actualiza `family_name`, `family_status`, `updated_at`. No toca `family_code` ni `student_count`. Bloquea el paso a `inactive` si la familia tiene estudiantes activos.
2. **`guardarFamiliares(familyId)`** — sincronización completa del bloque contra lo que hay en pantalla:
   - **`DELETE` físico** de los familiares que estaban al abrir el modal y ya no aparecen en el formulario. ⚠️ **No es borrado lógico**: no pasa a `member_status = 'inactive'`, borra la fila.
   - **`PATCH`** de los que traen `family_member_id`.
   - **`POST` en lote** de las filas nuevas, con `member_status = 'active'`.

Detalles relevantes:

- El modal **solo carga familiares con `member_status = 'active'`**. Si una familia tuviera inactivos, no se ven en pantalla y quedan intactos (no los borra el `DELETE`, porque no están en `familiaresOriginales`).
- Las filas completamente vacías se ignoran.
- Garantiza un único `is_primary` por familia.
- Es **manual y de a una familia**. No hay carga masiva ni integración con PHIDIAS en esta página.

---

## 10. Aprendizajes de la sesión

1. **PHIDIAS es la fuente de verdad para acudientes.** Más completa y actualizada que el `BD_Estudiantes.csv` original. Ante cualquier hueco de contacto, exportar de PHIDIAS antes de escalar a IT.
2. **`family_code` = primeros 6 dígitos del código de estudiante de PHIDIAS.** Llave de cruce reutilizable.
3. **El `.xls` de PHIDIAS es HTML**, y viene fragmentado en una tabla por sección. `pd.concat(pd.read_html(...))`.
4. **El segundo cupo de "Padre" en PHIDIAS mezcla acudientes con entidades de facturación.** Nunca cargarlo sin filtrar por el patrón `, RAZÓN SOCIAL`.
5. **Celdas vacías = `"No hay datos"`**, no `NULL`. Filtrar por ese literal.
6. **Diagnosticar antes de corregir, y separar causas.** El primer resumen decía "28 sin familiares"; solo el segundo query distinguió "nunca se cargaron" de "todos inactivos". Son problemas distintos con soluciones distintas.
7. **Cargas idempotentes y ambiente-agnósticas:** `INSERT ... SELECT` unido por `family_code` + guarda `NOT EXISTS`. Nunca uuid literales, nunca `INSERT ... VALUES` directo.
