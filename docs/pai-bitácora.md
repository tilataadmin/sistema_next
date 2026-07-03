# Bitácora — Extensión Planeación PAI (MYP)
**SchoolNet — Colegio Tilatá**
**Corte:** cierre de sesión, pendiente retomar
**Documento de referencia:** `Módulo_Planeación_Extensión_PAI_Referencia_Desarrollo v1.1`, sección 10 (secuencia de implementación)

---

## 1. Estado de la secuencia (sección 10 del documento)

### Bloque 1 — SQL de esquema: ✅ CERRADO (DEV y PROD)

| Paso | Contenido | Estado |
|---|---|---|
| 1 | `program_scope` en `pln_ib_atl_skills` (default `'PEP'`) | ✅ DEV y PROD. Verificado: 162 filas `'PEP'` (5/13/52/92), sin cambios en árbol existente. |
| 2 | Seed marco MYP en `pln_ib_atl_skills` (`program_scope='PAI'`) | ✅ DEV y PROD. 163 filas nuevas (5/10/123/25 por nivel). Sin huérfanos, sin `code` duplicado. Ver sección 3 (decisiones de modelado) para la resolución del grupo V. |
| 3 | `pln_myp_grade_year` (mapeo grado → Año PAI) | ✅ DEV y PROD. 4 filas: Sexto→2, Séptimo→3, Octavo→4, Noveno→5. |
| 4 | `pln_myp_concept_strategies` (6 estrategias) + `pln_planner_myp_concept_strategies` (puente) | ✅ DEV y PROD. |
| 5 | `pln_planner_myp` (cuerpo 1:1 del planeador PAI) | ✅ DEV y PROD. 25 columnas verificadas. |
| 6 | `pln_myp_assessment_criteria` (rejilla A–D) | ✅ DEV y PROD. 12 columnas verificadas. |
| 7 | `pln_planner_learner_profile` + `pln_planner_tilata_attributes` (puentes de atributos) | ✅ DEV y PROD. |

**Gap operativo cerrado en el camino:** el grado **Noveno** tenía `grades.program_id = NULL` en ambos ambientes (Sexto/Séptimo/Octavo sí lo tenían). Se corrigió con `UPDATE grades SET program_id = 'fc926be6-8aac-4e98-b8b7-02ab2be885a1' WHERE grade_id = 'b7a9ae5e-5632-4658-bfd1-bcf1b3a0d23b'` en DEV y PROD. Verificado.

### Bloque 2 — Permisos y sidebar: ✅ CERRADO

| Paso 8 | Contenido | Estado |
|---|---|---|
| Permiso `Mis planeadores PAI` | `permission_module='planning'`, `url_path='/modules/planning/my-myp-planners.html'`, `permission_type='read'` | ✅ Creado en DEV (`77c3dfab-...`) y PROD (`d54457ef-...`). |
| Asignación a roles | — | Gestionada directamente por Desarrollos vía interfaz (no vía SQL). |
| `sidebar.js` — `MODULE_ITEM_ORDER.planning` | Agregar `'Mis planeadores PAI'` después de `'Mis planeadores trimestrales PD'` | ✅ Instrucción de edición entregada. Confirmar que se aplicó en el archivo real del repo. |

### Bloque 3 — UI: ⬜ EN CURSO

| Paso | Archivo | Estado |
|---|---|---|
| 9 | `my-myp-planners.html` (listado + creación) | ✅ Código entregado completo. **⚠️ PENDIENTE DE CONFIRMACIÓN: no se ha verificado en DEV que el `POST` a `pln_planners` + `pln_planner_myp` funcione correctamente.** Esto es lo primero a probar al retomar. |
| 10 | `myp-planner-form.html` (formulario completo) | ✅ Código entregado completo. **⚠️ PENDIENTE DE PRUEBA end-to-end** — depende de que el paso 9 funcione primero. Dos decisiones de diseño tomadas sin confirmación explícita del usuario, quedan para revisar (ver sección 4). |
| 11 | `catalogs.html`: filtro PEP + pestaña ATL PAI + corrección texto "5/13/52/92" | ⬜ No iniciado. |

### Bloque 4 — Integración con coordinación: ⬜ NO INICIADO
Paso 12: branch por programa en `units.html`, `planners.html`, `coordinator-area.html`, `coordinator-program.html`, `coordinator-section.html` para abrir `myp-planner-form.html`.

### Bloque 5 — Manuales: ⬜ NO INICIADO
Paso 13.

---

## 2. Bug transversal corregido en el módulo de planeación (fuera del alcance original de PAI, pero bloqueaba producción)

**Problema encontrado:** `validatePageAccessAny()` no existe en `config.js` (verificado con grep dos veces). Estaba invocada en **7 archivos** del módulo, lo que significa que esas páginas fallaban con `ReferenceError` antes de renderizar nada:

- `my-dp-planners.html`
- `planner-form.html`
- `dp-planner-form.html`
- `my-dp-outlines.html`
- `dp-outline-form.html`
- `my-units.html`
- `unit-form.html`

Adicionalmente, **5 de esos 7** tenían el nombre de permiso `'Coordinar planeación de área'` (no existe) en vez de `'Coordinar planeación de asignatura'` (nombre real, confirmado contra la tabla `permissions`).

**Corrección aplicada:** reemplazar `validatePageAccessAny([...])` por `checkModuleAccess(session.user.user_id, [...])` (función que sí existe en `config.js`, línea ~1265), reordenando para obtener la sesión antes de la validación, y agregando `showAccessDenied(...)` porque `checkModuleAccess` solo devuelve booleano.

**Estado: ✅ Confirmado por el usuario ("Listo. Gracias.") — corregido en los 7 archivos.**

Los dos archivos nuevos del PAI (`my-myp-planners.html`, `myp-planner-form.html`) se construyeron directamente con `checkModuleAccess`, sin el bug.

---

## 3. Decisión de modelado cerrada: Grupo V (Reflexión) del árbol ATL

El documento de referencia (sección 8) solo documentaba una excepción de profundidad en el árbol MYP: el grupo **IV (Afectivas)**, con nivel intermedio. Al revisar el `PAI.pdf` (Apéndice 1) se encontró que el grupo **V (Reflexión)** tiene la misma estructura anidada (3 encabezados "Consideran... y se preguntan:" con 3 preguntas cada uno, más 7 viñetas sueltas).

**Decisión tomada (con el usuario, turno explícito):** tratar V igual que IV — Opción B. Los 3 encabezados se modelan como nodos intermedios de nivel 3, sus 9 preguntas como nivel 4, y las 7 viñetas sueltas quedan como hojas directas de nivel 3. Total grupo V: 19 filas (3 intermedios + 7 hojas directas + 9 hojas nivel 4).

**Pendiente sin resolver:** el documento de referencia v1.1 tiene una omisión real en la sección 8 (dice "excepción de profundidad: las Afectivas (IV)" y debería decir "Afectivas (IV) y Reflexión (V)"). Se ofreció corregir el documento como parte del entregable final del módulo; no se ha hecho aún.

**Convención de `category` confirmada con el usuario** (vía `SELECT DISTINCT category, level` en DEV): en el árbol PEP existente, `category` es el nombre de la categoría de nivel 1, propagado sin cambios a todos los niveles hijos de esa rama. Se aplicó la misma convención al seed del marco MYP.

---

## 4. Decisiones de `myp-planner-form.html` sin confirmar explícitamente por el usuario

1. **`patchPlannerMYP()` hace un `PATCH` vacío adicional a `pln_planners`** (`patchPlanner({})`) al final de cada guardado del cuerpo MYP, solo para refrescar `updated_at` del padre y que el polling de concurrencia (que vigila `pln_planners.updated_at`, no `pln_planner_myp`) no dispare falso-positivo por los propios cambios del usuario. Alternativa si se considera innecesario: actualizar `lastKnownUpdatedAt` solo en el cliente sin tocar la BD.

2. **Los 4 criterios A–D se crean automáticamente** (`POST` a `pln_myp_assessment_criteria`) la primera vez que se abre un planeador que aún no los tiene, en vez de tener un botón "agregar criterio" como en la rejilla dinámica del PEP — porque la rejilla PAI es fija (siempre A, B, C, D), no de longitud variable.

**Ambas decisiones necesitan revisión del usuario cuando se retome.**

---

## 5. Cómo retomar mañana — orden recomendado

1. **Probar el paso 9** (`my-myp-planners.html`) en DEV con un docente que tenga asignación académica en un grado PAI (Sexto a Noveno):
   - El selector de Asignatura solo debe mostrar materias con asignación en grados PAI.
   - La validación de duplicado (mismo subject+grade+trimestre+año) debe funcionar.
   - Al crear, debe insertar en `pln_planners` (`level=NULL`, `dp_outline_id=NULL`, `unit_id=NULL`) y en `pln_planner_myp` (fila vacía), y redirigir a `myp-planner-form.html?planner_id=<uuid>`.
2. **Si el paso 9 funciona:** abrir el planeador recién creado en `myp-planner-form.html` (paso 10) y probar cada bloque (Encabezado, Indagación, Acción, Criterios, Cronograma, Reflexión, Comentarios). Revisar en particular las dos decisiones de la sección 4.
3. **Si algo falla en el paso 9 o el paso 10:** reportar el error exacto (mensaje de consola, respuesta de Supabase) antes de seguir — no avanzar al paso 11 sobre una base sin verificar.
4. **Una vez cerrado el paso 10:** seguir con el paso 11 (`catalogs.html` — pestaña ATL PAI + corrección del texto desactualizado "3 niveles 5/13/21" que hoy dice algo incorrecto, debe decir 4 niveles 5/13/52/92).

---

## 6. Referencias rápidas (para no tener que volver a buscarlas)

- **`pln_ib_atl_skills.category`:** NOT NULL, sin default. Convención: nombre de la categoría de nivel 1, propagada a hijos.
- **Programa PAI:** `program_id = 'fc926be6-8aac-4e98-b8b7-02ab2be885a1'`, `program_name = 'PAI - Programa de años intermedios'`.
- **Grados PAI y su Año PAI:** Sexto=2, Séptimo=3, Octavo=4, Noveno=5 (tabla `pln_myp_grade_year`).
- **`checkModuleAccess(userId, permisos[])`** es la función correcta para validación multi-permiso (no `validatePageAccessAny`, que no existe).
- **Permiso real de coordinación de área:** `'Coordinar planeación de asignatura'` (no "de área").
- **Archivo de permisos real del módulo planning:** 10 permisos activos + 1 inactivo (`DUPLICADO_ELIMINAR`, ignorable).
