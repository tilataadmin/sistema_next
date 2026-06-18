# Bitácora — Estadísticas de matrícula por grado y flujo de movimientos

**Módulo:** Cierre de año académico / Servicios estudiantiles
**Plataforma:** SchoolNet — Colegio Tilatá
**Estado:** Diseño acordado. Tabla base creada en DEV. Lógica de poblado y flujo pendientes.
**Propósito de este documento:** traspaso de contexto para retomar el trabajo en una sesión futura.

---

## 1. Qué se hizo en la sesión que originó este documento

Tres frentes, en orden cronológico:

### 1.1 Migración de servicios estudiantiles a tabla por año académico
Los cuatro campos de servicio (`morning_access_type_id`, `afternoon_access_type_id`, `uses_cafeteria_service`, `uses_snack_service`) vivían directamente en `students` (mutables, sin histórico). Se migraron a la tabla nueva **`svc_student_year_services`** (una fila por estudiante por año académico), que pasa a ser fuente de verdad. El histórico se preserva solo porque cada fila queda etiquetada por año.

- Tabla creada y migración de datos ejecutada y verificada en **DEV y PROD** (439 filas en cada entorno).
- Código repuntado en `student-services.html`, `consultar-personas.html` y `modules/services/js/commons.js` (este último era un consumidor oculto: la función `pdfTablaEstudiantes` que genera la columna "SERVICIOS" en los PDF de las tres salidas — pedagógicas, deportivas, representación).
- **Pendiente de confirmar:** el `DROP` de las cuatro columnas en `students`. La sentencia está lista; ejecutar **solo después** de verificar que el PDF sigue mostrando bien la columna SERVICIOS, primero en DEV y luego en PROD. No usar `CASCADE`; si Postgres reporta dependencia, detenerse.

```sql
-- Ejecutar por entorno separado (DEV primero), tras verificar el PDF
ALTER TABLE public.students
  DROP COLUMN morning_access_type_id,
  DROP COLUMN afternoon_access_type_id,
  DROP COLUMN uses_cafeteria_service,
  DROP COLUMN uses_snack_service;
```

### 1.2 Corrección de bug en el cierre
`year-closure.html`, función `renderizarResultadoPaso1()`: la variable `tieneIssuesUndecimo` estaba declarada dos veces con `const` en el mismo ámbito → `SyntaxError` en parseo → tumbaba todo el wizard del cierre. Se eliminó la segunda declaración. **Resuelto.**

### 1.3 Tabla base de estadísticas por grado
Se creó **`academic_year_grade_stats`** en **DEV únicamente** (vacía, verificada). **No está en PROD.** El poblado **no está cableado** todavía. Ver §6.1.

---

## 2. El problema de fondo

El detonante: ver que un servicio (ej. cafetería) subió de 300 a 302 usuarios no dice nada sin el denominador. Si el colegio pasó de 445 a 500 estudiantes, esa "subida" es en realidad una caída en proporción. Se necesita el **universo**: total de estudiantes por **grado** (no por curso) por año, para leer proporciones y tendencias.

Tres sutilezas que definen toda la solución:

1. **El grado de un año pasado no se puede reconstruir desde el registro actual del estudiante.** Tras una promoción, `course_id` cambia. Cualquier estadística histórica por grado debe salir de un dato **congelado en el momento del cierre**, nunca de un join en vivo.
2. **Dos fotos dan el cambio neto, no los flujos brutos.** Si un grado gana 3 y pierde 3, dos censos (inicial y final) muestran "sin cambio". Separar *nuevos* de *retiros* exige registrar **eventos** de entrada y salida, no solo los extremos.
3. **El momento de la medición define qué significa el número.** Matrícula al inicio, máxima/acumulada, o al cierre son métricas distintas y válidas, pero hay que elegir una y ser consistente.

---

## 3. Definición acordada de `total_students`

`total_students` por grado/año = **matrícula al cierre, incluyendo a los que se retiran en el cierre.**

Implicaciones:
- Las estadísticas se calculan sobre **todos los estudiantes activos al cierre**, **antes** de aplicar cambios de estado/promociones. El orden importa: *stats primero, mutaciones después*. Así un estudiante que se retira en el cierre todavía cuenta en su grado ese año, y solo después se le cambia el estado.
- Los **retiros de mitad de año** quedan **fuera** de esta métrica por diseño (ya estaban inactivos antes del cierre). Es una limitación aceptada, abordable luego con un censo de matrícula inicial.

---

## 4. Realidad de datos hoy (qué se puede y qué no)

| Número | ¿Disponible hoy? | Notas |
|---|---|---|
| Matrícula **final** por grado | Sí | Capturable en el cierre. Además, el `snapshot_data` del cierre ya guarda conteo por curso con su grado, así que la serie de matrícula final por grado **arranca con el cierre de este año, gratis**. |
| Matrícula **inicial** por grado | No | No hay foto del inicio del año. Requiere un censo al arrancar. |
| **Nuevos** durante el año | Parcial | Existe `student_entry_date` en `students`, pero el grado al ingreso no se guarda históricamente y una re-entrada colapsa a una sola fecha. Aproximación, no dato fino. |
| **Retiros** durante el año | No | Hueco grande: al retirar solo se cambia el estado; no se registra ni fecha ni grado al irse. **No reconstruible.** Es el dato que más duele perder. |

`student_status` confirmado con columnas `status_code` / `status_description`. El cierre solo conoce explícitamente **Activo (código 1)** y **Egresado (código 2)**. Si existe un estado "Retirado"/"Inactivo" hay que confirmarlo con un `SELECT` al catálogo.

---

## 5. Plan por fases (acordado)

### Fase 0 — Ahora
Correr el cierre **como está diseñado**. No meterle lógica de flujo bajo presión de tiempo a un wizard ya probado e irreversible.

### Fase 1 — Inicio del próximo año académico
1. **Capturar la matrícula inicial (censo).** Es el punto de partida sin el cual el flujo no se puede cuadrar. El momento limpio es al **arrancar** el año, antes de que entren/salgan estudiantes. La foto post-cierre (todos promovidos en sus grados nuevos) **es** la matrícula inicial del próximo año.
2. **Diseñar la bitácora de movimientos una sola vez** (esquema del evento) antes de cablear cualquier escritor. Ver §6.2.
3. **Construir el flujo de ingreso/retiro en cualquier momento**, priorizando el **retiro** (capturar fecha + grado al retirar), que es el dato irrecuperable. El ingreso ya está medio cubierto por `student_entry_date`.

### Fase 2 — Próximo cierre
Integrar y arreglar toda la lógica. El cierre pasa a ser **consumidor y escritor** de la bitácora: la promoción y la graduación también son eventos de movimiento. Ahí se reconcilia `inicial + ingresos − retiros = final`.

---

## 6. Bosquejo técnico de la solución

### 6.1 `academic_year_grade_stats` (ya creada en DEV)

Snapshot final por grado + conteos de servicio. Una fila por grado por año. Se congelan `grade_name` y `grade_order` para que el histórico sobreviva a renombres/reordenamientos de grados.

```sql
CREATE TABLE public.academic_year_grade_stats (
  stat_id uuid NOT NULL DEFAULT gen_random_uuid(),
  year_id uuid NOT NULL,
  grade_id uuid NOT NULL,
  grade_name character varying NOT NULL,
  grade_order integer,
  total_students integer NOT NULL DEFAULT 0,
  cafeteria_count integer NOT NULL DEFAULT 0,
  snack_count integer NOT NULL DEFAULT 0,
  morning_access_count integer NOT NULL DEFAULT 0,
  afternoon_access_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_year_grade_stats_pkey PRIMARY KEY (stat_id),
  CONSTRAINT academic_year_grade_stats_year_fkey FOREIGN KEY (year_id) REFERENCES public.academic_years(year_id),
  CONSTRAINT academic_year_grade_stats_grade_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(grade_id),
  CONSTRAINT academic_year_grade_stats_unique UNIQUE (year_id, grade_id)
);
-- DISABLE RLS ya ejecutado en DEV.
```

**Pendientes asociados a esta tabla:**
- **Poblado dentro del cierre** (`ejecutarCierreFinal` en `year-closure.html`): agrupar por grado desde `wizardData.studentsToProcess` + `wizardData.coursesMapping` (mapeo **congelado**, no `course_id` en vivo); traer `svc_student_year_services` del año que se cierra para los conteos de servicio; insertar filas. **Calcular antes de aplicar promociones/cambios de estado.** Usar la unicidad `(year_id, grade_id)` para hacerlo re-ejecutable.
- **Limpieza en la reversa** (`year-closure-reversal.html`): borrar las filas de stats de ese año, igual que se deshace lo demás. Si no, una reversa deja stats huérfanos.
- **Backfill** desde `snapshot_data` de cierres pasados (opcional, al final).
- **Crear la tabla en PROD** solo cuando el poblado esté probado en DEV.

### 6.2 Bitácora de movimientos de matrícula (propuesta, NO construida)

Tabla chica que registra cada evento de entrada/salida/movimiento, con grado y fecha congelados. Es la base que permite los flujos brutos. **Esquema tentativo, a afinar antes de construir:**

```sql
-- PROPUESTA — no ejecutar aún
CREATE TABLE public.student_enrollment_movements (
  movement_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id integer NOT NULL,
  academic_year_id uuid NOT NULL,
  grade_id uuid,
  grade_name character varying,        -- congelado
  grade_order integer,                 -- congelado
  event_type character varying NOT NULL, -- 'ingreso' | 'retiro' | 'promocion' | 'graduacion'
  event_date date NOT NULL,
  source character varying,            -- 'admisiones' | 'gestion_estudiantes' | 'cierre'
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_enrollment_movements_pkey PRIMARY KEY (movement_id)
  -- FKs a students / academic_years / grades por definir
);
-- Requiere ALTER TABLE ... DISABLE ROW LEVEL SECURITY al crearla.
```

**Escritores (cablear de a poco, en este orden sugerido):**
1. Retiro en gestión de estudiantes (dato irrecuperable → primero).
2. Ingreso en admisiones.
3. El cierre (promoción / graduación / retiro-en-cierre).

### 6.3 Matrícula inicial
Decisión pendiente sobre **dónde vive**: puede ser un censo dedicado al arrancar el año, o una variante/columna en `academic_year_grade_stats`. Definir en Fase 1.

---

## 7. Decisiones pendientes (abiertas)

1. **Ambición del modelo:** ¿saldo (dos censos) o flujo (bitácora de movimientos)? — Inclinación actual: **flujo**, porque interesa la dinámica (cuánta gente entra y sale de cada grado), no solo el saldo.
2. **Retiro en el cierre:** ¿se agrega una tercera salida "retira" en el Paso 2 del cierre (además de promueve/repite), para el caso del que termina el año pero no vuelve? Hoy el Paso 2 solo distingue promueve/repite, y "repite" deja al estudiante **activo en su curso actual** — lo cual es incorrecto para un retiro.
3. **Dónde vive la matrícula inicial** (§6.3).
4. **Estado "Retirado":** confirmar con `SELECT` si existe en `student_status`.
5. **`total_students`:** ya definido (§3). No reabrir salvo cambio de criterio.

---

## 8. Convenciones técnicas relevantes (recordatorios)

- **RLS:** desactivado en toda la plataforma. Toda tabla nueva requiere `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` explícito (Supabase lo activa por defecto).
- **SQL en Supabase:** una sentencia por ejecución; el editor no corre multi-statement de forma confiable.
- **`supabaseRequest`:** siempre objeto de opciones (`{ method, body }`), nunca argumentos posicionales, nunca pasar `headers` (rompe la inyección de la API key desde `config.js`).
- **Etiquetas congeladas:** denormalizar `grade_name`/`grade_order` (y similares) en tablas de histórico para que sobrevivan a cambios de catálogo.
- **DEV-first:** todo cambio en DEV, verificado con `SELECT`, luego replicado a PROD.
- **Orden en el cierre:** calcular estadísticas **antes** de mutar estados/promociones.
- **Año vigente:** resolver en runtime vía `/academic_years?select=year_id&is_current=eq.true&limit=1`. El cierre marca el nuevo año `is_current=true`.
- **Rama:** editar la versión de `main` (la rama `developmen` aparecía muy atrasada respecto a `main`).
