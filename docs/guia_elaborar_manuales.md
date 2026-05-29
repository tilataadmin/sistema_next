**Características:**
- Siempre la misma ruta, sin importar desde dónde se llame
- NO cambia según el módulo o página
- El botón flotante de "Reportar Bug" siempre apunta aquí

---

## 📄 PLANTILLA BASE

### Ubicación del template

**Archivo:** `/mnt/project/manual_template.html`

### Marcadores a personalizar

El template contiene marcadores entre corchetes `[MARCADOR]` que deben reemplazarse:

```html
[NOMBRE_MODULO]        → Ej: "Seguimientos", "Seguridad", "Recursos Humanos"
[DESCRIPCION_MODULO]   → Ej: "Consultar Notas Confidenciales", "Gestión de Usuarios"
[MODULO_PATH]          → Ej: "follow-ups", "security", "hr"
[PAGINA_PATH]          → Ej: "index.html", "create-note.html"
[NOMBRE_PAGINA]        → Ej: "Índice del Módulo", "Crear Nota Confidencial"
```

### Elementos obligatorios del template

**1. Meta versión:**
```html
<meta name="page-version" content="26.05.29.18.30">
```
Actualizar con la fecha de creación en formato `AA.MM.DD.HH.MM`

**2. Título dinámico:**
```html
<title>Manual - [NOMBRE_MODULO] - [NOMBRE_PAGINA] - SchoolNet</title>
```

**3. Botón "Volver al Módulo":**
```html
<a href="../../modules/[MODULO_PATH]/[PAGINA_PATH]" class="btn btn-outline-primary">
    <i class="bi bi-arrow-left me-1"></i>Volver al Módulo
</a>
```

**4. Botón flotante para reporte de bugs (única vía de reporte):**
```html
<!-- Botón flotante (único punto de reporte en el manual) -->
<a href="../report-bug.html" class="btn btn-danger btn-lg floating-bug-button">
    <i class="bi bi-bug-fill me-2"></i>Reportar Bug
</a>
```

> **⚠️ Nota de actualización (versión 26.05.29):** La tarjeta inferior de reporte de bugs (`.bug-report-card`) fue retirada del template. El único punto de contacto para reportar bugs desde un manual es el botón flotante. **No agregar la tarjeta en manuales nuevos.** Si encuentras un manual viejo que la incluya, retírala al actualizarlo.

**5. Configuración de página (JavaScript):**
```javascript
const PAGE_CONFIG = {
    moduleName: '[NOMBRE_MODULO]',
    modulePath: '[MODULO_PATH]',
    pageTitle: '[NOMBRE_PAGINA]',
    pagePath: '[PAGINA_PATH]',
    moduleDescription: '[DESCRIPCION_MODULO]'
};
```

---

## 🔄 PROCESO PASO A PASO

### Paso 1: Identificar la página a documentar

**Pregúntate:**
- ¿En qué módulo está? → Define `[MODULO_PATH]`
- ¿Qué hace? → Define `[NOMBRE_MODULO]` y `[DESCRIPCION_MODULO]`
- ¿Cuál es el nombre del archivo? → Define `[PAGINA_PATH]`

**Ejemplo:**
- Página funcional: `/modules/follow-ups/query-confidential-notes.html`
- Módulo: "Seguimientos"
- Carpeta: "follow-ups"
- Función: "Consultar Notas Confidenciales"

### Paso 2: Copiar el template

```bash
# Copiar template
cp /mnt/project/manual_template.html /manual/[modulo]/[pagina].html

# Ejemplo real:
cp manual_template.html manual/follow-ups/query-confidential-notes.html
```

### Paso 3: Reemplazar marcadores básicos

Buscar y reemplazar todos los `[MARCADORES]` con valores reales:

```html
<!-- ANTES -->
<title>Manual - [NOMBRE_MODULO] - SchoolNet</title>

<!-- DESPUÉS -->
<title>Manual - Seguimientos - Consultar Notas Confidenciales - SchoolNet</title>
```

**Reemplazos completos:**

| Marcador | Ejemplo de reemplazo |
|----------|---------------------|
| `[NOMBRE_MODULO]` | Seguimientos |
| `[DESCRIPCION_MODULO]` | Consultar Notas Confidenciales |
| `[MODULO_PATH]` | follow-ups |
| `[PAGINA_PATH]` | query-confidential-notes.html |
| `[NOMBRE_PAGINA]` | Consultar Notas Confidenciales |

### Paso 4: Eliminar tarjeta de construcción

Si el manual está completo, eliminar este bloque:

```html
<!-- ELIMINAR ESTE BLOQUE COMPLETO -->
<div class="construction-card">
    <i class="bi bi-tools construction-icon"></i>
    <h4 class="mb-2">📖 Estamos trabajando en esta sección</h4>
    <p class="mb-0">
        El manual para esta página está en construcción...
    </p>
</div>
<!-- FIN DEL BLOQUE A ELIMINAR -->
```

Si el manual está en progreso, mantener la tarjeta hasta completarlo.

### Paso 5: Escribir el contenido del manual

Agregar el contenido después de la tarjeta `.info-card` y antes del cierre del `<div class="col-lg-8 mx-auto">`.

> **Nota:** En versiones anteriores del template el contenido se ubicaba "antes de la tarjeta `.bug-report-card`". Desde la versión 26.05.29 esa tarjeta ya no existe, así que la referencia es el cierre de la columna principal.

**Estructura recomendada:**

```html
<!-- AQUÍ COMIENZA EL CONTENIDO DEL MANUAL -->

<section>
    <h2 class="section-title">
        <i class="bi bi-info-circle me-2"></i>
        ¿Qué es [Nombre de la Función]?
    </h2>
    <!-- Explicación general -->
</section>

<section>
    <h2 class="section-title">
        <i class="bi bi-star me-2"></i>
        Características principales
    </h2>
    <!-- Lista de características -->
</section>

<section>
    <h2 class="section-title">
        <i class="bi bi-clipboard-check me-2"></i>
        Antes de comenzar
    </h2>
    <!-- Requisitos previos -->
</section>

<section>
    <h2 class="section-title">
        <i class="bi bi-list-ol me-2"></i>
        Guía paso a paso
    </h2>
    <!-- Pasos detallados -->
</section>

<section>
    <h2 class="section-title">
        <i class="bi bi-question-circle me-2"></i>
        Solución de problemas comunes
    </h2>
    <!-- Troubleshooting -->
</section>

<section>
    <h2 class="section-title">
        <i class="bi bi-award me-2"></i>
        Buenas prácticas
    </h2>
    <!-- Recomendaciones -->
</section>

<section>
    <h2 class="section-title">
        <i class="bi bi-chat-dots me-2"></i>
        Preguntas frecuentes
    </h2>
    <!-- FAQ -->
</section>

<!-- AQUÍ TERMINA EL CONTENIDO DEL MANUAL -->
```

### Paso 6: Verificar enlaces y rutas

**Revisar:**
- ✅ Enlace "Volver al Módulo" apunta correctamente a la página funcional
- ✅ El botón flotante "Reportar Bug" apunta a `../report-bug.html`
- ✅ El manual NO contiene la tarjeta `.bug-report-card` (deprecada en 26.05.29)
- ✅ Ruta de `config.js` es `../../assets/js/config.js`
- ✅ PAGE_CONFIG tiene todos los valores correctos

### Paso 7: Probar el manual

**Checklist de prueba:**
- [ ] El manual se visualiza correctamente en el navegador
- [ ] Los colores corporativos se aplican correctamente
- [ ] El botón "Volver al Módulo" funciona
- [ ] El botón flotante "Reportar Bug" funciona
- [ ] El contenido es claro y comprensible
- [ ] No hay información técnica (código, nombres de tablas, etc.)
- [ ] Las imágenes (si hay) se cargan correctamente

---

## 🎨 ELEMENTOS DEL MANUAL

### Secciones principales

#### 1. ¿Qué es [Nombre de la Función]?

**Propósito:** Explicar de forma general qué hace la función.

**Contenido:**
- Descripción en lenguaje sencillo
- Para qué sirve
- Quién puede usarla
- Contexto de uso

**Ejemplo:**
```html
<section>
    <h2 class="section-title">
        <i class="bi bi-info-circle me-2"></i>
        ¿Qué es Consultar Notas Confidenciales?
    </h2>
    
    <div class="step-card">
        <p class="lead">
            Esta función permite <strong>buscar y visualizar notas confidenciales</strong> 
            registradas sobre estudiantes. Las notas confidenciales son observaciones 
            sensibles que requieren <strong>máxima confidencialidad</strong>.
        </p>
        
        <p>
            A diferencia de los seguimientos regulares, estas notas NO se comparten 
            con el equipo docente general.
        </p>
    </div>
</section>
```

#### 2. Características principales

**Propósito:** Listar las funcionalidades clave de forma resumida.

**Contenido:**
- Lista de características principales
- Capacidades del sistema
- Limitaciones importantes

**Ejemplo:**
```html
<section>
    <h2 class="section-title">
        <i class="bi bi-star me-2"></i>
        Características principales
    </h2>
    
    <div class="step-card">
        <ul class="feature-list">
            <li><strong>Solo lectura:</strong> Función exclusiva para consulta</li>
            <li><strong>Búsqueda por nombre:</strong> Encuentra estudiantes específicos</li>
            <li><strong>Filtro por fechas:</strong> Rango "desde" y "hasta"</li>
            <li><strong>Control de permisos por rol:</strong> Automático según autorización</li>
        </ul>
    </div>
</section>
```

#### 3. Antes de comenzar

**Propósito:** Informar requisitos previos y consideraciones importantes.

**Contenido:**
- Permisos necesarios
- Conocimientos previos
- Advertencias importantes
- Preparación requerida

**Ejemplo:**
```html
<section>
    <h2 class="section-title">
        <i class="bi bi-clipboard-check me-2"></i>
        Antes de comenzar
    </h2>
    
    <div class="step-card">
        <h5>Requisitos previos:</h5>
        <ul>
            <li>Tener el permiso "Consultar notas confidenciales" asignado</li>
            <li>Pertenecer a uno de los roles autorizados</li>
            <li>Comprender la responsabilidad de confidencialidad</li>
        </ul>

        <div class="warning-box">
            <strong><i class="bi bi-exclamation-triangle me-2"></i>Advertencia:</strong>
            Esta función maneja información confidencial. Usar solo cuando sea necesario.
        </div>
    </div>
</section>
```

#### 4. Guía paso a paso

**Propósito:** Explicar detalladamente cómo usar la función.

**Contenido:**
- Pasos numerados
- Capturas o descripciones de la interfaz
- Ejemplos prácticos
- Qué esperar en cada paso

**Estructura:**
```html
<section>
    <h2 class="section-title">
        <i class="bi bi-list-ol me-2"></i>
        Guía paso a paso
    </h2>

    <!-- Paso 1 -->
    <div class="step-card">
        <h4>
            <span class="step-number">1</span>
            [Título del paso]
        </h4>
        
        <p>[Explicación del paso]</p>

        <p><strong>Para realizar esta acción:</strong></p>
        <ol>
            <li>Primer paso específico</li>
            <li>Segundo paso específico</li>
            <li>Tercer paso específico</li>
        </ol>

        <div class="info-box">
            <strong><i class="bi bi-info-circle me-2"></i>Nota:</strong>
            Información adicional importante sobre este paso.
        </div>
    </div>

    <!-- Paso 2 -->
    <div class="step-card">
        <h4>
            <span class="step-number">2</span>
            [Título del siguiente paso]
        </h4>
        <!-- ... -->
    </div>
</section>
```

#### 5. Solución de problemas comunes

**Propósito:** Anticipar y resolver problemas frecuentes.

**Contenido:**
- Problemas comunes
- Causas probables
- Soluciones paso a paso
- Cuándo pedir ayuda

**Ejemplo:**
```html
<section>
    <h2 class="section-title">
        <i class="bi bi-question-circle me-2"></i>
        Solución de problemas comunes
    </h2>

    <div class="step-card">
        <h5>No veo ninguna nota al buscar</h5>
        <ul>
            <li>Verifica que hayas hecho clic en el botón "Buscar"</li>
            <li>Si no tienes rol especial, solo verás tus propias notas</li>
            <li>Confirma que existan notas que coincidan con tus criterios</li>
            <li>Revisa los filtros de fecha (pueden ser muy restrictivos)</li>
        </ul>

        <h5 class="mt-3">La búsqueda es muy lenta</h5>
        <ul>
            <li>Esto puede ocurrir si hay muchas notas en el sistema</li>
            <li>Verás un indicador de carga mientras busca</li>
            <li>Usa filtros de fecha para reducir el volumen de búsqueda</li>
        </ul>
    </div>
</section>
```

#### 6. Buenas prácticas

**Propósito:** Orientar sobre el uso correcto y eficiente.

**Contenido:**
- Recomendaciones de uso
- Consejos de eficiencia
- Qué hacer y qué evitar
- Mejores formas de aprovechar la función

**Ejemplo:**
```html
<section>
    <h2 class="section-title">
        <i class="bi bi-award me-2"></i>
        Buenas prácticas
    </h2>

    <div class="step-card">
        <ul class="feature-list">
            <li>Accede solo cuando tengas necesidad profesional específica</li>
            <li>Usa búsquedas específicas en lugar de generales</li>
            <li>Limpia los resultados después de cada consulta</li>
            <li>Cierra sesión si te alejas del computador</li>
        </ul>

        <div class="success-box mt-3">
            <strong><i class="bi bi-lightbulb me-2"></i>Consejo profesional:</strong>
            Mantén un registro de tus consultas para documentación interna.
        </div>
    </div>
</section>
```

#### 7. Preguntas frecuentes

**Propósito:** Responder dudas comunes de los usuarios.

**Contenido:**
- Preguntas reales de usuarios
- Respuestas claras y directas
- Referencias a otras secciones si es necesario

**Ejemplo:**
```html
<section>
    <h2 class="section-title">
        <i class="bi bi-chat-dots me-2"></i>
        Preguntas frecuentes
    </h2>

    <div class="step-card">
        <h5>¿Puedo crear nuevas notas desde esta función?</h5>
        <p>
            No. Esta es una función de SOLO CONSULTA. Para crear notas 
            debes usar la función específica de creación en el módulo.
        </p>

        <h5 class="mt-3">¿Cómo sé si puedo ver todas las notas?</h5>
        <p>
            El sistema determina esto automáticamente según tu rol. 
            Si tienes roles especiales, verás todas las notas. 
            Si no, solo las tuyas.
        </p>
    </div>
</section>
```

### Cajas de información

El template incluye 4 tipos de cajas para destacar información:

#### 1. Info Box (Información general)

```html
<div class="info-box">
    <strong><i class="bi bi-info-circle me-2"></i>Nota:</strong>
    Información adicional útil sobre este tema.
</div>
```

**Uso:** Información complementaria, notas aclaratorias, detalles adicionales.

#### 2. Success Box (Información positiva)

```html
<div class="success-box">
    <strong><i class="bi bi-lightbulb me-2"></i>Consejo:</strong>
    Buena práctica o sugerencia para mejorar el uso.
</div>
```

**Uso:** Consejos, buenas prácticas, recomendaciones, ejemplos exitosos.

#### 3. Warning Box (Advertencias)

```html
<div class="warning-box">
    <strong><i class="bi bi-exclamation-triangle me-2"></i>Advertencia:</strong>
    Información importante que el usuario debe tener en cuenta.
</div>
```

**Uso:** Advertencias moderadas, precauciones, limitaciones importantes.

#### 4. Danger Box (Información crítica)

```html
<div class="danger-box">
    <strong><i class="bi bi-shield-exclamation me-2"></i>CRÍTICO:</strong>
    Información de máxima importancia que NO debe ignorarse.
</div>
```

**Uso:** Advertencias críticas, prohibiciones, riesgos de seguridad, información legal.

### Iconos de Bootstrap

Usar iconos consistentes para cada tipo de sección:

| Sección | Icono | Código |
|---------|-------|--------|
| ¿Qué es? | ℹ️ | `bi-info-circle` |
| Características | ⭐ | `bi-star` |
| Antes de comenzar | 📋 | `bi-clipboard-check` |
| Guía paso a paso | 📝 | `bi-list-ol` |
| Solución de problemas | ❓ | `bi-question-circle` |
| Buenas prácticas | 🏆 | `bi-award` |
| Preguntas frecuentes | 💬 | `bi-chat-dots` |

**Referencia completa:** [Bootstrap Icons](https://icons.getbootstrap.com/)

---

## ✅ BUENAS PRÁCTICAS

### Lenguaje y tono

1. **Usar lenguaje sencillo:**
   - ❌ "La función ejecuta una query filtrada por el user_id"
   - ✅ "La función muestra solo tus notas personales"

2. **Evitar jerga técnica:**
   - ❌ "Verifica el endpoint en la consola del navegador"
   - ✅ "Si algo no funciona, contacta al soporte técnico"

3. **Ser directo y concreto:**
   - ❌ "Probablemente necesitarás hacer clic en algún botón"
   - ✅ "Haz clic en el botón azul 'Buscar'"

4. **Usar segunda persona:**
   - ❌ "El usuario debe seleccionar una fecha"
   - ✅ "Selecciona la fecha en el campo 'Desde'"

5. **Anticipar preguntas:**
   - Incluir "¿Por qué?" y "¿Para qué?" en las explicaciones
   - Explicar el contexto antes del procedimiento

### Estructura del contenido

1. **Ir de lo general a lo específico:**
   - Primero: Qué es y para qué sirve
   - Luego: Cómo usarlo paso a paso
   - Finalmente: Problemas y preguntas

2. **Usar listas numeradas para procesos:**
```html
   <ol>
       <li>Primer paso</li>
       <li>Segundo paso</li>
       <li>Tercer paso</li>
   </ol>
```

3. **Usar listas con viñetas para características:**
```html
   <ul class="feature-list">
       <li>Primera característica</li>
       <li>Segunda característica</li>
   </ul>
```

4. **Agrupar información relacionada:**
   - Usar `<div class="step-card">` para cada tema o paso
   - Usar cajas de información para destacar puntos importantes

### Formato visual

1. **Usar negritas para términos importantes:**
```html
   La función permite <strong>buscar y visualizar notas</strong>.
```

2. **Usar cursivas para énfasis suave:**
```html
   Recuerda que <em>solo</em> verás tus propias notas.
```

3. **Resaltar acciones con código inline (opcional):**
```html
   Haz clic en el botón <code>Buscar</code>.
```

4. **Espaciar el contenido:**
   - Usar párrafos cortos (3-4 líneas máximo)
   - Dejar espacio entre secciones
   - No amontonar información

### Ejemplos prácticos

**Incluir siempre ejemplos:**

```html
<div class="success-box">
    <strong><i class="bi bi-lightbulb me-2"></i>Ejemplo:</strong>
    Si buscas "García", el sistema encontrará: María García, Pedro García López, etc.
</div>
```

**Tipos de ejemplos útiles:**
- Búsquedas de ejemplo
- Casos de uso reales
- Resultados esperados
- Errores comunes y cómo evitarlos

### Información prohibida

**NUNCA incluir en los manuales:**

❌ Código fuente o fragmentos de código  
❌ Nombres de tablas de base de datos  
❌ Nombres de campos de base de datos  
❌ Queries SQL  
❌ URLs de APIs o endpoints  
❌ Información técnica de configuración  
❌ Contraseñas o credenciales (obvio, pero importante)  
❌ Información confidencial de la institución  

**Excepción:** URLs públicas del sistema para navegación entre páginas.

### Mantener actualizado

1. **Versionar el manual:**
```html
   <meta name="page-version" content="26.05.29.18.30">
```
   Actualizar con cada cambio significativo.

2. **Documentar cambios importantes:**
   Si la función cambia drásticamente, agregar una nota al inicio:
```html
   <div class="info-box">
       <strong><i class="bi bi-clock-history me-2"></i>Actualización:</strong>
       Esta función se actualizó el [fecha]. Los cambios principales son...
   </div>
```

3. **Revisar periódicamente:**
   - Verificar que los pasos sigan siendo correctos
   - Actualizar ejemplos si cambia la interfaz
   - Agregar nuevos problemas comunes detectados

---

## 📚 EJEMPLOS COMPLETOS

### Ejemplo 1: Manual de función de consulta

**Página funcional:** `/modules/follow-ups/query-confidential-notes.html`  
**Manual:** `/manual/follow-ups/query-confidential-notes.html`

**Características:**
- Función de solo lectura
- Requiere permisos especiales
- Tiene filtros de búsqueda
- Maneja información sensible

**Estructura del manual:**

1. ✅ ¿Qué es? → Explicar que es una función de consulta confidencial
2. ✅ Características → Listar capacidades de búsqueda y filtrado
3. ✅ Antes de comenzar → Advertencias de confidencialidad y permisos
4. ✅ Guía paso a paso → 6 pasos detallados desde entender permisos hasta limpiar búsqueda
5. ✅ Solución de problemas → 8 problemas comunes con soluciones
6. ✅ Buenas prácticas → Énfasis en confidencialidad y seguridad
7. ✅ Preguntas frecuentes → 12 preguntas reales anticipadas

**Elementos destacados:**
- 4 tipos de cajas de información usadas apropiadamente
- Múltiples ejemplos prácticos
- Advertencias críticas bien marcadas
- Lenguaje claro y directo

**Ver manual completo:** Adjunto en el contexto como ejemplo de referencia.

### Ejemplo 2: Manual de índice de módulo

**Página funcional:** `/modules/security/index.html`  
**Manual:** `/manual/security/index.html`

**Características:**
- Página de inicio del módulo
- Presenta todas las funciones disponibles
- Muestra métricas del módulo
- Control de acceso por roles

**Estructura del manual:**

1. ✅ ¿Qué es el módulo? → Presentación general del módulo
2. ✅ Funciones disponibles → Lista de todas las funciones del módulo
3. ✅ Métricas del módulo → Explicar qué muestran los números
4. ✅ Navegación → Cómo moverse entre funciones
5. ✅ Permisos y acceso → Quién puede ver qué
6. ✅ Preguntas frecuentes → Dudas sobre el módulo en general

**Diferencias con manual de función:**
- Más general, menos paso a paso
- Enfocado en presentar todo el módulo
- Enlaces a manuales específicos de cada función

---

## ✔️ CHECKLIST DE REVISIÓN

### Antes de publicar el manual

**Contenido:**
- [ ] El título refleja correctamente la función
- [ ] La descripción general es clara y comprensible
- [ ] Todos los pasos están en orden lógico
- [ ] Los ejemplos son relevantes y claros
- [ ] No hay información técnica (código, tablas, etc.)
- [ ] El lenguaje es apropiado para usuario final
- [ ] Se anticipan problemas comunes
- [ ] Hay preguntas frecuentes útiles

**Estructura:**
- [ ] Se usó el template correcto
- [ ] Todos los `[MARCADORES]` fueron reemplazados
- [ ] La estructura de carpetas es correcta (`/manual/[modulo]/[pagina].html`)
- [ ] Los nombres de archivos coinciden con el código funcional
- [ ] Se eliminó la tarjeta de construcción (si aplica)

**Enlaces:**
- [ ] El botón "Volver al Módulo" funciona correctamente
- [ ] Apunta a la página funcional correcta en `/modules/`
- [ ] El botón flotante "Reportar Bug" apunta a `../report-bug.html`
- [ ] El manual NO incluye la tarjeta `.bug-report-card` (deprecada desde 26.05.29)
- [ ] Todos los enlaces internos funcionan

**JavaScript:**
- [ ] PAGE_CONFIG tiene todos los valores correctos
- [ ] `moduleName` está bien escrito
- [ ] `modulePath` coincide con la carpeta real
- [ ] `pageTitle` es descriptivo
- [ ] `pagePath` es el nombre correcto del archivo
- [ ] `moduleDescription` es clara

**Estilos y formato:**
- [ ] Los colores corporativos se aplican correctamente
- [ ] Las cajas de información usan los tipos correctos
- [ ] Los iconos son apropiados para cada sección
- [ ] El espaciado es adecuado
- [ ] No hay texto amontonado

**Pruebas funcionales:**
- [ ] El manual se visualiza correctamente en Chrome
- [ ] El manual se visualiza correctamente en Firefox
- [ ] El manual es responsive (se ve bien en móvil)
- [ ] Los botones son clicables
- [ ] No hay errores en la consola del navegador
- [ ] La carga es rápida

**Calidad del contenido:**
- [ ] El manual responde: "¿Qué es?"
- [ ] El manual responde: "¿Para qué sirve?"
- [ ] El manual responde: "¿Cómo se usa?"
- [ ] El manual responde: "¿Qué hacer si hay problemas?"
- [ ] El usuario puede completar la tarea siguiendo el manual
- [ ] No quedan dudas obvias sin responder

**Revisión final:**
- [ ] Ortografía y gramática correctas
- [ ] Coherencia en el uso de términos
- [ ] Tono consistente en todo el documento
- [ ] Formato consistente en todo el documento
- [ ] Se puede entender sin conocimientos técnicos
- [ ] El manual está completo y listo para publicar

---

## 🎯 RESUMEN RÁPIDO

### Para crear un manual nuevo:

1. **Identificar:** ¿Qué página voy a documentar?
2. **Copiar:** El template `manual_template.html`
3. **Ubicar:** En la ruta correcta `/manual/[modulo]/[pagina].html`
4. **Reemplazar:** Todos los `[MARCADORES]` con valores reales
5. **Escribir:** El contenido siguiendo la estructura estándar
6. **Revisar:** Usando el checklist completo
7. **Probar:** En el navegador antes de publicar
8. **Publicar:** Una vez validado todo

### Recordar siempre:

✅ **Lenguaje sencillo:** Sin jerga técnica  
✅ **Usuario final:** Docentes, administrativos, no programadores  
✅ **Estructura paralela:** Misma organización que el código funcional  
✅ **Consistencia:** Seguir el template y los ejemplos  
✅ **Reportar bugs:** Solo botón flotante apuntando a `/manual/report-bug.html` (sin tarjeta inferior)  

### Enlaces importantes:

- **Template base:** `/mnt/project/manual_template.html`
- **Ejemplo completo:** Manual de "Consultar Notas Confidenciales" (adjunto)
- **Manual de referencia v4.1:** Manual de "Plan de Mejoramiento" del módulo Autoevaluación Institucional
- **Configuración:** `/mnt/project/config.js`
- **Documentación técnica:** Solo para referencia del desarrollador, NO incluir en manuales

---

## 📞 SOPORTE

Si tienes dudas sobre cómo elaborar un manual:

1. **Revisa esta guía:** La mayoría de preguntas están respondidas aquí
2. **Consulta el ejemplo:** El manual de "Consultar Notas Confidenciales" es referencia completa
3. **Verifica el template:** Asegúrate de usar la versión correcta (≥ 26.05.29)
4. **Contacta al equipo:** Si algo no está claro, pregunta antes de publicar

---

## 📝 HISTORIAL DE CAMBIOS

### Versión 4.1 — 29 de mayo de 2026

**Cambios respecto a v4.0:**

- **Retirada de la tarjeta `.bug-report-card`** del template. El único punto de reporte de bugs en los manuales es ahora el botón flotante. Razón: redundancia visual con el botón flotante que ya está presente en todas las páginas.
- **Actualizada la sección "Elementos obligatorios del template"** (punto 4): solo el botón flotante, con nota de deprecación de la tarjeta.
- **Actualizado el Paso 5 de "Proceso paso a paso":** la referencia al límite inferior del contenido cambió de "antes de la tarjeta `.bug-report-card`" a "antes del cierre del `col-lg-8`".
- **Actualizado el checklist de revisión:** se reemplazó el ítem genérico de "Reportar Bug" por dos ítems específicos (botón flotante + verificación de que no esté la tarjeta).
- **Corrección de codificación:** se corrigieron caracteres latinos que aparecían como secuencias de bytes (mojibake) por mal manejo previo de UTF-8.
- **Versión del template asociada:** `26.05.29.18.30`.

### Versión 4.0 — Noviembre 2025

Versión original de la guía.

---

**=====================================================**  
**FIN DE LA GUÍA DE ELABORACIÓN DE MANUALES v4.1**  
**Documento creado: Noviembre 2025**  
**Última actualización: 29 de mayo de 2026**  
**Próxima revisión: Según necesidad**  
**=====================================================**
