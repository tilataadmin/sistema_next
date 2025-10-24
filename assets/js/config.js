/*
====================================
SCHOOLNET - CONFIGURACIÓN MULTI-AMBIENTE
Variables de entorno para desarrollo y producción
Actualizado: Septiembre 2025
====================================
*/

// ==========================================
// DETECCIÓN AUTOMÁTICA DE AMBIENTE
// ==========================================

function detectEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('vercel.app') || hostname.includes('localhost')) {
        return 'development';
    } else if (hostname.includes('colegiotilata.edu.co')) {
        return 'production';
    }
    
    // Fallback a desarrollo
    return 'development';
}

// ==========================================
// CONFIGURACIONES POR AMBIENTE
// ==========================================

const ENVIRONMENT_CONFIGS = {
    development: {
        name: 'Desarrollo',
        supabase: {
            url: 'https://spjzvpcsgbewxupjvmfm.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanp2cGNzZ2Jld3h1cGp2bWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk4MDEsImV4cCI6MjA3MjU4NTgwMX0.6n_rvGalz_IT2vQ1Q4fPGS0D-ijYBUmdkL3PmbyNRck'
        },
        features: {
            debugMode: true,
            rlsEnabled: false,
            testData: true,
            logging: 'verbose'
        }
    },
    production: {
        name: 'Producción',
        supabase: {
            url: 'https://mrtuerkncqodhakuwjob.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydHVlcmtuY3FvZGhha3V3am9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjYyNjUsImV4cCI6MjA3MzM0MjI2NX0.BVTBqvTDMpzWSo5jDaiRRYP_oUMf2o3tl5yNwEfBYVk'
        },
        features: {
            debugMode: false,
            rlsEnabled: true,
            testData: false,
            logging: 'minimal'
        }
    }
};

// Detectar ambiente actual
const CURRENT_ENVIRONMENT = detectEnvironment();
const ENV_CONFIG = ENVIRONMENT_CONFIGS[CURRENT_ENVIRONMENT];

// Log del ambiente detectado
console.log(`🌍 Ambiente detectado: ${CURRENT_ENVIRONMENT.toUpperCase()} (${ENV_CONFIG.name})`);
console.log(`🔧 Debug Mode: ${ENV_CONFIG.features.debugMode}`);
console.log(`🔒 RLS Enabled: ${ENV_CONFIG.features.rlsEnabled}`);

// ==========================================
// CONFIGURACIÓN DE SUPABASE UNIFICADA
// ==========================================

const SUPABASE_CONFIG = {
    url: ENV_CONFIG.supabase.url,
    anonKey: ENV_CONFIG.supabase.anonKey,
    get apiUrl() {
        return `${this.url}/rest/v1`;
    },
    environment: CURRENT_ENVIRONMENT
};

// Validar configuración
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error(`❌ Error: Variables de entorno de Supabase no configuradas para ${CURRENT_ENVIRONMENT}`);
    throw new Error(`Configuración de Supabase incompleta para ${CURRENT_ENVIRONMENT}`);
}

// ==========================================
// CONFIGURACIÓN DE LA APLICACIÓN - ACTUALIZADA
// ==========================================

const APP_CONFIG = {
    // Información básica del sistema
    name: 'SchoolNet',
    fullName: 'Sistema de Gestión Educativa SchoolNet',
    version: '1.0.0',
    description: 'Plataforma integral para la gestión de instituciones educativas',
    
    // Información de la institución
    institution: {
        name: 'Colegio Tilata',
        domain: 'colegiotilata.edu.co',
        logo: '/assets/images/logo.png'
    },
    
    // Configuración por ambiente
    environment: CURRENT_ENVIRONMENT,
    features: ENV_CONFIG.features,
    
    // URLs por ambiente
    baseUrl: CURRENT_ENVIRONMENT === 'production' 
        ? 'https://schoolnet.colegiotilata.edu.co' 
        : 'https://sistema-next.vercel.app',
    
    // Módulos del sistema
    modules: [
        {
            id: 'security',
            name: 'Seguridad',
            description: 'Gestión de usuarios, roles y permisos',
            icon: 'bi-shield-lock',
            path: '/modules/security/',
            status: 'active'
        },
        {
            id: 'config',
            name: 'Configuración',
            description: 'Configuración general del sistema',
            icon: 'bi-gear',
            path: '/modules/config/',
            status: 'active'
        },
        {
            id: 'hr',
            name: 'Talento Humano',
            description: 'Gestión organizacional y personal',
            icon: 'bi-people',
            path: '/modules/hr/',
            status: 'active'
        },
        {
            id: 'indicators',
            name: 'Indicadores',
            description: 'Dashboard y métricas del sistema',
            icon: 'bi-graph-up',
            path: '/modules/indicators/',
            status: 'active'
        },
        {
            id: 'budget',
            name: 'Presupuesto',
            description: 'Gestión presupuestal y financiera',
            icon: 'bi-calculator',
            path: '/modules/budget/',
            status: 'planned'
        },

        {
            id: 'new-students',
            name: 'Gestión de Estudiantes Nuevos',
            description: 'Proceso de inculturación para estudiantes nuevos y sus familias',
            icon: 'bi-person-plus',
            path: '/modules/new-students/',
            status: 'active'
        },

        {
            id: 'follow-ups',
            name: 'Seguimientos',
            description: 'Gestión de seguimientos académicos y disciplinarios',
            icon: 'bi-clipboard-check',
            path: '/modules/follow-ups/',
            status: 'planned'
        },

        {
            id: 'early-alerts',
            name: 'Alertas Tempranas',
            description: 'Sistema de alertas tempranas familiares',
            icon: 'bi-exclamation-triangle',
            path: '/modules/early-alerts/',
            status: 'active'
        },

        {
            id: 'admissions',
            name: 'Admisiones',
            description: 'Gestión de aspirantes y proceso de admisión',
            icon: 'bi-person-plus-fill',
            path: '/modules/admissions/',
            status: 'active'
        },
        {
            id: 'tte',
            name: 'Tilatá te Escucha',
            description: 'Sistema de gestión de PQR y comunicación institucional',
            icon: 'bi-chat-heart',
            path: '/modules/tte/',
            status: 'active'
        },
        {
            id: 'surveys',
            name: 'Encuestas',
            description: 'Sistema de encuestas dinámicas con análisis avanzado',
            icon: 'bi-clipboard-data',
            path: '/modules/surveys/',
            status: 'active'
        },
        {
            id: 'general-tools',
            name: 'Herramientas Generales',
            description: 'Gestión de tareas y herramientas transversales del sistema',
            icon: 'bi-tools',
            path: '/modules/general-tools/',
            status: 'active'
        },
        // 🆕 NUEVO MÓDULO - GESTIÓN AMBIENTAL
        {
            id: 'environmental',
            name: 'Gestión Ambiental',
            description: 'Gestión de arbolización, manejo hídrico y sostenibilidad',
            icon: 'bi-tree',
            path: '/modules/environmental/',
            status: 'active'
        },
        {
            id: 'training',
            name: 'Formación',
            description: 'Gestión de rutas de formación y desarrollo profesional',
            icon: 'bi-mortarboard',
            path: '/modules/training/',
            status: 'active'
        },
        {
            id: 'procedures',
            name: 'Procedimientos',
            description: 'Gestión de procedimientos institucionales con flujos definidos',
            icon: 'bi-diagram-3',
            path: '/modules/procedures/',
            status: 'active'
        }
    ],
    
    // Configuración de UI
    ui: {
        theme: 'minimal',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        
        // Textos dinámicos para títulos y headers
        titles: {
            login: 'Iniciar Sesión',
            dashboard: 'Panel de Control',
            createUser: 'Crear Usuario',
            userManagement: 'Gestión de Usuarios',
            roleManagement: 'Gestión de Roles',
            permissionManagement: 'Gestión de Permisos',
            roleAssignment: 'Asignar Roles',
            permissionAssignment: 'Configurar Permisos'
        },
        
        // Mensajes del sistema
        messages: {
            welcome: '¡Bienvenido al sistema!',
            accessDenied: 'Acceso denegado',
            loading: 'Cargando...',
            noData: 'No hay datos disponibles',
            error: 'Ha ocurrido un error',
            success: 'Operación exitosa'
        }
    },
    
    // Configuración de notificaciones
    notifications: {
        autoHide: true,
        duration: 5000,
        position: 'top-right'
    }
};

// ==========================================
// HEADERS PARA API REQUESTS
// ==========================================

function getHeaders(options = {}) {
    const defaultHeaders = {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
    
    // Agregar headers específicos de ambiente
    if (ENV_CONFIG.features.debugMode) {
        defaultHeaders['X-Debug-Mode'] = 'true';
    }
    
    return { ...defaultHeaders, ...options };
}

// ==========================================
// FUNCIONES DE UTILIDAD ACTUALIZADAS
// ==========================================

// Función para hacer requests a Supabase con logging condicional
// Función mejorada para hacer requests a Supabase
async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_CONFIG.apiUrl}${endpoint}`;
    
    // Establecer usuario en sesión si existe
    await setCurrentUserInSession();
    
    const config = {
        headers: getHeaders(options.headers),
        ...options
    };
    
    try {
        console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${response.status} - ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`✅ API Response: ${data.length || 'OK'}`);
        
        return data;
        
    } catch (error) {
        console.error('❌ Request failed:', error);
        throw error;
    }
}

// Función para consultar logs de auditoría
async function getAuditLogs(filters = {}) {
    const { table, user, operation, startDate, endDate, limit = 50 } = filters;
    
    let query = '/audit_log?select=*,users(user_display_name)&order=changed_at.desc';
    
    if (table) query += `&table_name=eq.${table}`;
    if (user) query += `&changed_by=eq.${user}`;
    if (operation) query += `&operation=eq.${operation}`;
    if (startDate) query += `&changed_at=gte.${startDate}T00:00:00`;
    if (endDate) query += `&changed_at=lte.${endDate}T23:59:59`;
    if (limit) query += `&limit=${limit}`;
    
    return await supabaseRequest(query);
}

// Función para mostrar mensajes con indicador de ambiente
function showMessage(message, type = 'info', containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`⚠️ Container ${containerId} no encontrado para mostrar mensaje`);
        return;
    }
    
    // Agregar indicador de ambiente en desarrollo
    let environmentBadge = '';
    if (CURRENT_ENVIRONMENT === 'development' && ENV_CONFIG.features.debugMode) {
        environmentBadge = '<span class="badge bg-warning text-dark me-2">DEV</span>';
    }
    
    const alertId = 'alert_' + Date.now();
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-triangle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
            <i class="bi bi-${icons[type] || 'info-circle'} me-2"></i>
            ${environmentBadge}${message}
            <button type="button" class="btn-close" onclick="closeAlert('${alertId}')"></button>
        </div>
    `;
    
    container.innerHTML = alertHtml;
    
    // Auto-cerrar si está configurado
    if (APP_CONFIG.notifications.autoHide) {
        setTimeout(() => closeAlert(alertId), APP_CONFIG.notifications.duration);
    }
}

// Resto de funciones existentes (sin cambios)
function closeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.classList.remove('show');
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 150);
    }
}

function formatDate(date, format = APP_CONFIG.ui.dateFormat) {
    if (!date) return '-';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        default:
            return d.toLocaleDateString();
    }
}

function validateForm(formId, rules = {}) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const errors = [];
    
    // Validaciones básicas de HTML5
    if (!form.checkValidity()) {
        isValid = false;
        errors.push('Por favor completa todos los campos requeridos');
    }
    
    // Validaciones personalizadas
    Object.entries(rules).forEach(([fieldId, rule]) => {
        const field = document.getElementById(fieldId);
        if (field && rule.validate && !rule.validate(field.value)) {
            isValid = false;
            errors.push(rule.message || `Error en campo ${fieldId}`);
        }
    });
    
    if (!isValid && errors.length > 0) {
        showMessage(errors[0], 'danger');
    }
    
    return isValid;
}

function getModuleFolder(moduleName) {
    const moduleMap = {
        'Seguridad': 'security',
        'Configuración': 'config',
        'Talento Humano': 'hr',
        'Indicadores': 'indicators',
        'Presupuesto': 'budget',
        'Gestión de Estudiantes Nuevos': 'new-students',
        'Seguimientos': 'follow-ups',
        'Alertas Tempranas': 'early-alerts',
        'Admisiones': 'admissions',
        'Tilatá te Escucha': 'tte',
        'Encuestas': 'surveys',
        'Herramientas Generales': 'general-tools',
        'Gestión Ambiental': 'environmental',
        'Formación': 'training',
        'Procedimientos': 'procedures'
    };
    
    return moduleMap[moduleName] || moduleName.toLowerCase();
}


// Función para generar breadcrumbs consistentes
function generateBreadcrumbs(moduleName, pageName) {
    return `
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="/dashboard.html">
                        <i class="bi bi-house me-1"></i>Dashboard
                    </a>
                </li>
                <li class="breadcrumb-item">
                    <a href="/modules/${getModuleFolder(moduleName)}/index.html">
                        ${moduleName}
                    </a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                    ${pageName}
                </li>
            </ol>
        </nav>
    `;
}

// En config.js - Función para obtener URLs de fotos
async function getPhotoUrl(type, identifier) {
  try {
    // Obtener URL base de fotos desde system_config
    const configData = await supabaseRequest('/system_config?select=photos_url&limit=1');
    const baseUrl = configData.length > 0 ? configData[0].photos_url : '';
    
    if (!baseUrl || !identifier) {
      return null;
    }
    
    // Construir URL según el tipo
    return `${baseUrl}${identifier}.jpg`;
    
  } catch (error) {
    console.error('Error obteniendo URL de foto:', error);
    return null;
  }
}

// Funciones específicas para facilidad de uso
async function getStudentPhotoUrl(student_code) {
  return await getPhotoUrl('student', student_code);
}

async function getWorkerPhotoUrl(worker_id_doc) {
  return await getPhotoUrl('worker', worker_id_doc);
}



// Funciones de branding (sin cambios)
function updatePageTitle(pageKey, moduleName = '') {
    const baseTitle = APP_CONFIG.ui.titles[pageKey] || 'Página';
    const environmentSuffix = CURRENT_ENVIRONMENT === 'development' ? ' [DEV]' : '';
    const fullTitle = moduleName ? 
        `${baseTitle} - ${moduleName} - ${APP_CONFIG.name}${environmentSuffix}` : 
        `${baseTitle} - ${APP_CONFIG.name}${environmentSuffix}`;
    
    document.title = fullTitle;
}

function updatePageHeader(headerSelector = '.header h4', pageKey = null) {
    const headerElement = document.querySelector(headerSelector);
    if (headerElement && !pageKey) {
        headerElement.textContent = headerElement.textContent.replace(/Sistema NEXT/g, APP_CONFIG.name);
    } else if (headerElement && pageKey) {
        headerElement.textContent = APP_CONFIG.name;
    }
}

function updatePageFooter(footerSelector = '.system-footer p') {
    const footerElement = document.querySelector(footerSelector);
    if (footerElement) {
        const currentText = footerElement.textContent;
        const newText = currentText
            .replace(/Sistema NEXT/g, APP_CONFIG.name)
            .replace(/NEXT/g, APP_CONFIG.name);
        footerElement.textContent = newText;
    }
}

function applyBrandingAutomatically() {
    // Buscar y reemplazar todos los "Sistema NEXT" en el DOM
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.textContent.includes('Sistema NEXT') || 
            node.textContent.includes('NEXT - ') ||
            node.textContent.includes('NEXT v')) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        textNode.textContent = textNode.textContent
            .replace(/Sistema NEXT/g, APP_CONFIG.name)
            .replace(/Sistema de Gestión Empresarial NEXT/g, APP_CONFIG.fullName)
            .replace(/NEXT - /g, `${APP_CONFIG.name} - `)
            .replace(/ - Sistema NEXT/g, ` - ${APP_CONFIG.name}`)
            .replace(/NEXT v/g, `${APP_CONFIG.name} v`);
    });
    
    if (textNodes.length > 0 && ENV_CONFIG.features.logging === 'verbose') {
        console.log(`✅ Branding aplicado automáticamente: ${textNodes.length} textos actualizados`);
    }
}

function initializePage(pageKey = null, moduleName = '') {
    // Actualizar título
    if (pageKey) {
        updatePageTitle(pageKey, moduleName);
    }
    
    // Aplicar branding automáticamente cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBrandingAutomatically);
    } else {
        applyBrandingAutomatically();
    }
}

// ==========================================
// INICIALIZACIÓN MULTI-AMBIENTE
// ==========================================

// Log de inicialización actualizado
console.log(`🏫 ${APP_CONFIG.name} inicializado en ambiente: ${CURRENT_ENVIRONMENT.toUpperCase()}`);
console.log(`🔗 Supabase URL: ${SUPABASE_CONFIG.url}`);
console.log(`🎨 Features habilitadas:`, ENV_CONFIG.features);

// Auto-inicializar branding
initializePage();

// Verificar conectividad con Supabase al cargar
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Test de conectividad simple
        await supabaseRequest('/users?select=user_id&limit=1');
        console.log(`✅ Conexión con Supabase ${CURRENT_ENVIRONMENT} establecida`);
    } catch (error) {
        console.error(`❌ Error de conexión con Supabase ${CURRENT_ENVIRONMENT}:`, error);
        showMessage(`Error de conexión con la base de datos ${CURRENT_ENVIRONMENT}. Verifica tu configuración.`, 'danger');
    }
});

// Función para establecer usuario en sesión de PostgreSQL
async function setCurrentUserInSession() {
    const session = getStoredSession();
    if (session && session.user && session.user.user_id) {
        try {
            await fetch(`${SUPABASE_CONFIG.apiUrl}/rpc/set_current_user`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ user_uuid: session.user.user_id })
            });
        } catch (error) {
            // Silencioso - no interrumpir el flujo si falla
        }
    }
}

// Función para establecer usuario en sesión de PostgreSQL
async function setCurrentUserInSession() {
    const session = getStoredSession();
    if (session && session.user && session.user.user_id) {
        try {
            await fetch(`${SUPABASE_CONFIG.apiUrl}/rpc/set_current_user`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ user_uuid: session.user.user_id })
            });
        } catch (error) {
            // Silencioso - no interrumpir el flujo si falla
        }
    }
}

// Función auxiliar para obtener sesión almacenada
function getStoredSession() {
    try {
        const sessionData = localStorage.getItem('nextSystemSession') || sessionStorage.getItem('nextSystemSession');
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
        return null;
    }
}

// ==========================================
// SISTEMA DE VALIDACIÓN DE PERMISOS POR URL
// ==========================================

// Mapeo de URLs a permisos requeridos
const URL_PERMISSIONS = {
    // Módulo Seguridad
    '/modules/security/users.html': 'Gestión de usuarios',
    '/modules/security/roles.html': 'Gestión de roles', 
    '/modules/security/permissions.html': 'Gestión de permisos',
    '/modules/security/user-roles.html': 'Asignar roles',
    '/modules/security/role-permissions.html': 'Configurar permisos',
    '/modules/security/audit-log.html': 'Logs de auditoría',
    
    // Módulo Configuración
    '/modules/config/config.html': 'Configuración general',
    '/modules/config/academic-years.html': 'Años académicos',
    '/modules/config/sections.html': 'Gestionar secciones',
    '/modules/config/grades.html': 'Gestionar grados',
    '/modules/config/courses.html': 'Gestionar cursos',
    '/modules/config/academic-areas.html': 'Gestionar áreas académicas',
    '/modules/config/programs.html': 'Gestionar programas',
    '/modules/config/families.html': 'Gestionar familias',
    '/modules/config/students.html': 'Gestionar estudiantes',
    
    // Módulo Indicadores
    '/modules/indicators/variables.html': 'Variables',
    '/modules/indicators/segments.html': 'Segmentaciones',
    '/modules/indicators/data-entry.html': 'Captura de datos',
    '/modules/indicators/variable-assignments.html': 'Asignar variables a usuarios',
    '/modules/indicators/indicators.html': 'Indicadores',
    '/modules/indicators/dashboard-config.html': 'Configurar mi dashboard',  // NUEVO
    '/modules/indicators/dashboard.html': 'Ver mi dashboard',                // NUEVO
        
    // Módulo Talento Humano
    '/modules/hr/divisions.html': 'Divisiones',
    '/modules/hr/cost-centers.html': 'Centros de costos',
    '/modules/hr/organizational-areas.html': 'Secciones / Áreas',
    '/modules/hr/subareas.html': 'Subáreas',
    '/modules/hr/job-roles.html': 'Roles y cargos',
    '/modules/hr/workers.html': 'Gestionar trabajadores',
    '/modules/hr/payroll-review.html': 'Revisión de nómina',

    // Módulo Presupuesto - Administración
    '/modules/budget/chart-of-accounts.html': 'Gestionar PUC',
    '/modules/budget/upload-combo.html': 'Subir el combo',
    '/modules/budget/tax-types.html': 'Gestionar IVA asociado',
    '/modules/budget/budget-categories.html': 'Gestionar rubros',
    '/modules/budget/budget-items.html': 'Gestionar subítems',
    '/modules/budget/suppliers.html': 'Gestionar proveedores',
    '/modules/budget/initialize-budget-year.html': 'Inicializar año presupuestal',
    '/modules/budget/initialize-budget-general.html': 'Inicializar año presupuestal - Generales',
    '/modules/budget/budget-authorization.html': 'Autorización de presupuesto',
    '/modules/budget/associate-invoices.html': 'Asociar facturas',
    '/modules/budget/report-design.html': 'Diseño de informes',
    '/modules/budget/assignments-report.html': 'Informe de asignaciones',
    '/modules/budget/accounting-crosscheck.html': 'Cruce contable',

    // Módulo Presupuesto - Usuarios
    '/modules/budget/budget-request.html': 'Petición de presupuesto',
    '/modules/budget/assign-requesters.html': 'Designar solicitantes',
    '/modules/budget/execution-request.html': 'Solicitud de ejecución',
    '/modules/budget/closure-request.html': 'Solicitud de cierre',
    '/modules/budget/request-resolution.html': 'Resolución de solicitudes',
    '/modules/budget/close-overruns.html': 'Cerrar requerimientos sobreejecutados',
    '/modules/budget/budget-transfer.html': 'Iniciar traslado presupuestal',
    '/modules/budget/close-transfer.html': 'Cerrar traslado presupuestal',
    '/modules/budget/category-detail.html': 'Vista detallada por rubro',
    '/modules/budget/budget-overview.html': 'Vista particular del presupuesto',
    '/modules/budget/budget-queries.html': 'Consultas de presupuesto',

    // Módulo Gestión de estudiantes nuevos
    '/modules/new-students/activities.html': 'Actividades',
    '/modules/new-students/actors.html': 'Actores', 
    '/modules/new-students/new-students-report.html': 'Reporte de estudiantes nuevos',
    '/modules/new-students/register-activities.html': 'Registrar actividades',
    '/modules/new-students/registration-queries.html': 'Consulta de registro',
    '/modules/new-students/students-dashboard.html': 'Tablero de control',
        
    // Módulo Seguimientos
    '/modules/follow-ups/categories.html': 'Gestionar categorías',
    '/modules/follow-ups/user-course-assignments.html': 'Asignar usuarios a cursos',
    '/modules/follow-ups/individual-issues.html': 'Registrar asuntos individuales',
    '/modules/follow-ups/eae-issues.html': 'Registrar asuntos EAE',
    '/modules/follow-ups/review-individual-issues.html': 'Revisar asuntos individuales',
    '/modules/follow-ups/manage-eae-issues.html': 'Gestionar asuntos EAE',
    '/modules/follow-ups/course-follow-ups.html': 'Seguimientos por cursos',
    '/modules/follow-ups/group-issues.html': 'Registrar asuntos grupales',
    '/modules/follow-ups/manage-group-issues.html': 'Gestionar asuntos grupales',
    '/modules/follow-ups/manage-unescalated-issues.html': 'Gestionar asuntos no escalados',
    '/modules/follow-ups/tasks.html': 'Gestionar tareas',
    '/modules/follow-ups/course-follow-up-queries.html': 'Consultas a seguimientos por cursos',
    '/modules/follow-ups/general-queries.html': 'Consultas',
    '/modules/follow-ups/confidential-notes.html': 'Notas confidenciales',
    '/modules/follow-ups/query-confidential-notes.html': 'Consultar notas confidenciales',

    // Módulo Alertas Tempranas
    '/modules/early-alerts/alert-types.html': 'Causas de alertas tempranas',
    '/modules/early-alerts/register-alerts.html': 'Registro de alertas',
    '/modules/early-alerts/manage-alerts.html': 'Gestión de alertas tempranas',
    '/modules/early-alerts/alerts-dashboard.html': 'Tablero de control de alertas tempranas',
        
    // Módulo Admisiones (Atraer y Atrapar)
    '/modules/admissions/kindergartens.html': 'Jardines infantiles',
    '/modules/admissions/process-states.html': 'Estados del proceso',
    '/modules/admissions/loss-reasons.html': 'Razones de pérdida',
    '/modules/admissions/process-steps.html': 'Pasos del proceso',
    '/modules/admissions/fairs.html': 'Ferias de preescolares',
    '/modules/admissions/grade-age-ranges.html': 'Nacimiento - grados',
    '/modules/admissions/contact-sources.html': 'Fuentes de contacto',
    '/modules/admissions/referral-types.html': 'Tipos de referidos',
    '/modules/admissions/form-config.html': 'Configuración del formulario',
    '/modules/admissions/upload-campaigns.html': 'Subir archivos de campañas',  // NUEVO
    '/modules/admissions/applicants.html': 'Aspirantes',
    '/modules/admissions/applicant-detail.html': 'Ficha individual del aspirante',
    '/modules/admissions/applicant-steps.html': 'Gestión de pasos por aspirante',
    '/modules/admissions/applicant-process.html': 'Vista de seguimiento del proceso',
    '/modules/admissions/dashboard.html': 'Dashboard',
    '/modules/admissions/reports.html': 'Reportes',    
    
    // Módulo Tilatá te Escucha (TTE)
    '/modules/tte/categories.html': 'Gestionar categorías TTE',
    '/modules/tte/priorities.html': 'Gestionar prioridades TTE',
    '/modules/tte/manage-requests.html': 'Gestionar solicitudes TTE',
    '/modules/tte/respond-requests.html': 'Responder solicitudes TTE',
    '/modules/tte/dashboard.html': 'Dashboard TTE',

    // Módulo Encuestas (surveys)
    '/modules/surveys/scales.html': 'Gestionar escalas',
    '/modules/surveys/masters.html': 'Crear encuestas',
    '/modules/surveys/master-segments.html': 'Asociar segmentaciones',
    '/modules/surveys/sections.html': 'Gestionar secciones de encuestas',
    '/modules/surveys/questions.html': 'Gestionar preguntas',
    '/modules/surveys/applications.html': 'Gestionar aplicaciones',
    '/modules/surveys/results.html': 'Ver resultados',
    '/modules/surveys/comparison.html': 'Comparar aplicaciones',
    '/modules/surveys/dashboard.html': 'Dashboard de encuestas',

    // Módulo Herramientas Generales
    '/modules/general-tools/tasks.html': 'Gestionar tareas',
    '/modules/general-tools/dashboard.html': 'Dashboard de tareas',
    '/modules/general-tools/community-query.html': 'Consulta de la comunidad',
    '/modules/general-tools/family-activities.html': 'Asistencia de familias',
    '/modules/general-tools/contract-categories.html': 'Gestionar categorías de contratos',
    '/modules/general-tools/contract-templates.html': 'Gestionar plantillas de contratos',
    '/modules/general-tools/contracts-dashboard.html': 'Ver dashboard de contratos',
    '/modules/general-tools/lists.html': 'Listas',

    // Módulo Gestión Ambiental (environmental)
    '/modules/environmental/species.html': 'Gestionar especies de árboles',
    '/modules/environmental/species-documentation.html': 'Documentación de especies',
    '/modules/environmental/tree-inventory.html': 'Gestionar inventario de árboles',
    '/modules/environmental/register-tree-care.html': 'Registrar cuidados de árboles',
    '/modules/environmental/tree-care-history.html': 'Historial de cuidados',
    '/modules/environmental/tree-map.html': 'Mapa de árboles',
    '/modules/environmental/reports.html': 'Reportes de arbolización',
    // Módulo Gestión Ambiental - Manejo Hídrico
    '/modules/environmental/water-meters.html': 'Gestionar medidores de agua',
    '/modules/environmental/daily-water-readings.html': 'Registrar lecturas diarias de agua',
    '/modules/environmental/monthly-water-readings.html': 'Registrar lecturas mensuales de agua',
    '/modules/environmental/edit-daily-readings.html': 'Editar lecturas históricas de agua', 
    '/modules/environmental/water-alerts.html': 'Gestionar alertas hídricas',
    '/modules/environmental/extraordinary-water-readings.html': 'Registrar mediciones extraordinarias',
    '/modules/environmental/water-balance-dashboard.html': 'Dashboard de balance hídrico',
    '/modules/environmental/water-reports.html': 'Reportes de agua',

     // Módulo Formación (training)
    '/modules/training/generate-paths.html': 'Generar rutas de formación',
    '/modules/training/axes.html': 'Gestionar ejes formativos',
    '/modules/training/skills.html': 'Gestionar habilidades',
    '/modules/training/modalities.html': 'Gestionar modalidades',
    '/modules/training/requisition-sources.html': 'Gestionar fuentes de requisición',
    '/modules/training/facilitators.html': 'Gestionar facilitadores',
    '/modules/training/modules.html': 'Gestionar unidades formativas',
    '/modules/training/module-skills.html': 'Asociar habilidades a unidades',
    '/modules/training/module-facilitators.html': 'Asociar facilitadores a unidades',
    '/modules/training/module-roles.html': 'Asociar unidades a roles',
    '/modules/training/module-references.html': 'Gestionar referencias de unidades',
    '/modules/training/waive-modules.html': 'Eximir cumplimiento de unidades',
    '/modules/training/register-completion.html': 'Registrar cumplimiento de unidades',
    '/modules/training/manage-deadlines.html': 'Gestionar fechas tentativas',
    '/modules/training/dashboard.html': 'Dashboard global de formación',
    '/modules/training/reports.html': 'Reportes de formación',
    '/modules/training/path-queries.html': 'Consultas de rutas',
    '/modules/training/my-path.html': 'Ver mi ruta de formación',
    '/modules/training/request-modules.html': 'Solicitar unidades por interés',
    '/modules/training/my-dashboard.html': 'Ver mi dashboard de formación',

    // Módulo Procedimientos (procedures)
    '/modules/procedures/index.html': 'Acceso al módulo de procedimientos',
    '/modules/procedures/forms.html': 'Gestionar formularios',
    '/modules/procedures/procedures.html': 'Gestionar procedimientos',
    '/modules/procedures/execute.html': 'Ejecutar procedimientos',
    '/modules/procedures/my-requests.html': 'Ver mis solicitudes',
    '/modules/procedures/records.html': 'Consultar todos los registros',
    '/modules/procedures/dashboard.html': 'Ver dashboard de procedimientos',
    '/modules/procedures/reports.html': 'Ver reportes de procedimientos'

    
  };

// Función principal de validación
async function validatePageAccess(requiredPermission = null) {
    try {
        console.log('🔐 Validando acceso a página...');
        
        // 1. Verificar sesión activa
        const session = getStoredSession();
        if (!session || !session.user) {
            console.log('❌ No hay sesión activa');
            redirectToLogin();
            return false;
        }
        
        // 2. Auto-detectar permiso requerido si no se especifica
        if (!requiredPermission) {
            requiredPermission = detectRequiredPermission();
        }
        
        // 3. Si no se requiere permiso específico, permitir acceso
        if (!requiredPermission) {
            console.log('✅ Página sin restricciones de permisos');
            return true;
        }
        
        // 4. Verificar permiso específico (incluye verificación de super admin)
        const hasPermission = await checkUserPermission(session.user.user_id, requiredPermission);
        
        if (hasPermission) {
            console.log(`✅ Usuario tiene acceso requerido`);
            return true;
        } else {
            console.log(`❌ Usuario NO tiene acceso requerido`);
            showAccessDenied(requiredPermission);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error validando acceso:', error);
        showAccessDenied('Error de validación');
        return false;
    }
}

// Auto-detectar permiso basado en URL actual
function detectRequiredPermission() {
    const currentPath = window.location.pathname;
    const permission = URL_PERMISSIONS[currentPath];
    
    if (permission) {
        console.log(`🔍 Permiso requerido detectado: ${permission}`);
    } else {
        console.log(`🔍 No se detectó permiso específico para: ${currentPath}`);
    }
    
    return permission;
}

// Verificar si usuario tiene permiso específico
// ==========================================
// VERIFICAR SI USUARIO TIENE PERMISO ESPECÍFICO - CORREGIDO
// ==========================================
async function checkUserPermission(userId, permissionName) {
    try {
        // Primero verificar si es super admin usando la relación correcta
        const superAdminQuery = `/users?select=user_roles!user_roles_user_id_fkey(role_id,roles(is_super_admin))&user_id=eq.${userId}`;
        const userData = await supabaseRequest(superAdminQuery);
        
        if (!userData || userData.length === 0) {
            return false;
        }
        
        // Verificar si tiene rol de super admin
        const isSuperAdmin = userData[0].user_roles?.some(userRole => 
            userRole.roles?.is_super_admin === true
        );
        
        if (isSuperAdmin) {
            console.log('✅ Usuario es super admin - acceso total permitido');
            return true;
        }
        
        // Si no es super admin, verificar permiso específico
        const permissionQuery = `/users?select=user_roles!user_roles_user_id_fkey(role_id,roles(role_permissions(permissions(permission_name))))&user_id=eq.${userId}`;
        const permissionData = await supabaseRequest(permissionQuery);
        
        if (!permissionData || permissionData.length === 0) {
            return false;
        }
        
        // Extraer todos los permisos del usuario
        const userPermissions = [];
        permissionData[0].user_roles?.forEach(userRole => {
            userRole.roles?.role_permissions?.forEach(rolePermission => {
                const permName = rolePermission.permissions?.permission_name;
                if (permName) {
                    userPermissions.push(permName);
                }
            });
        });
        
        return userPermissions.includes(permissionName);
        
    } catch (error) {
        console.error('❌ Error verificando permisos:', error);
        return false;
    }
}
// Mostrar página de acceso denegado
function showAccessDenied(requiredPermission) {
    document.body.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card border-danger">
                        <div class="card-header bg-danger text-white">
                            <h5 class="mb-0">
                                <i class="bi bi-shield-exclamation me-2"></i>
                                Acceso Denegado
                            </h5>
                        </div>
                        <div class="card-body text-center">
                            <i class="bi bi-lock-fill text-danger" style="font-size: 3rem;"></i>
                            <h6 class="mt-3">No tienes permisos para acceder a esta página</h6>
                            <p class="text-muted">Permiso requerido: <code>${requiredPermission}</code></p>
                            <p class="text-muted">Contacta al administrador del sistema si necesitas acceso.</p>
                            <div class="mt-4">
                                <a href="/dashboard.html" class="btn btn-primary me-2">
                                    <i class="bi bi-house me-1"></i>Ir al Dashboard
                                </a>
                                <button onclick="history.back()" class="btn btn-outline-secondary">
                                    <i class="bi bi-arrow-left me-1"></i>Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Redireccionar a login
function redirectToLogin() {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
}

// ==========================================
// SISTEMA DE NOTIFICACIONES - SchoolNet
// ==========================================

// URL del Google Apps Script para envío de emails
// REEMPLAZAR 'TU_SCRIPT_ID' con el ID real del script desplegado
const NOTIFICATION_CONFIG = {
    endpoint: 'https://script.google.com/macros/s/AKfycbzhfLGSk8WYPRTDxMTNwj3IPE_gfhUbkmhnaKT8k-hf2pjjdD1570oncw1t8XLb-yIC/exec',
    enabled: true,
    timeout: 10000, // 10 segundos timeout
    retries: 2
};

/**
 * Función principal para enviar notificaciones por email
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del email
 * @param {string} htmlContent - Contenido HTML del email
 * @param {boolean} silent - Si true, no muestra mensajes de error en UI
 * @returns {Promise<boolean>} - true si se envió exitosamente
 */
    async function sendNotification(to, subject, htmlContent, silent = true) {
        if (!NOTIFICATION_CONFIG.enabled) {
            console.log('Notificaciones deshabilitadas');
            return false;
        }
    
        if (!to || !subject || !htmlContent) {
            console.error('Faltan parámetros requeridos para notificación');
            return false;
        }
    
        let attempts = 0;
        const maxAttempts = NOTIFICATION_CONFIG.retries + 1;
    
        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`Enviando notificación (intento ${attempts}/${maxAttempts}) a:`, to);
    
                // CAMBIO CRÍTICO: Usar FormData en lugar de JSON
                const formData = new FormData();
                formData.append('to', to);
                formData.append('subject', subject);
                formData.append('htmlBody', htmlContent);
    
                const response = await fetch(NOTIFICATION_CONFIG.endpoint, {
                    method: 'POST',
                    body: formData  // Sin Content-Type header para FormData
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
    
                const result = await response.json();
    
                if (result.success) {
                    console.log('Notificación enviada exitosamente a:', to);
                    return true;
                } else {
                    throw new Error(result.error || 'Error desconocido en el envío');
                }
    
            } catch (error) {
                console.error(`Error en intento ${attempts}:`, error.message);
    
                if (attempts >= maxAttempts) {
                    if (!silent) {
                        showMessage(`Error enviando notificación: ${error.message}`, 'warning');
                    }
                    return false;
                }
    
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }
    
        return false;
    }


/**
 * Plantilla para notificación de sobreejecución presupuestal
 * @param {string} requestDetails - Detalles del requerimiento
 * @param {number} valorInicial - Valor inicial autorizado
 * @param {number} valorFinal - Valor final ejecutado
 * @param {number} tolerance - Porcentaje de tolerancia configurado
 * @returns {string} HTML formateado para el email
 */
function getOverrunNotificationTemplate(requestDetails, valorInicial, valorFinal, tolerance) {
    const valorInicialFormateado = formatearMoneda(valorInicial);
    const valorFinalFormateado = formatearMoneda(valorFinal);
    const diferencia = valorFinal - valorInicial;
    const diferenciaFormateada = formatearMoneda(diferencia);
    const porcentajeSobreejecucion = ((diferencia / valorInicial) * 100).toFixed(1);

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                <h2 style="color: #856404; margin-top: 0; margin-bottom: 10px;">⚠️ Notificación de Sobreejecución Presupuestal</h2>
                <p style="margin: 0; color: #856404; font-weight: 500;">SchoolNet - Sistema de Gestión Educativa</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin-top: 0;">Saludos,</p>
                <p>La solicitud de <strong>"${escapeHtml(requestDetails)}"</strong> ha sido ejecutada con una diferencia significativa respecto al valor inicial autorizado.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #dee2e6;">
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Concepto</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Valor</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">Valor inicial autorizado:</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-family: monospace;">${valorInicialFormateado}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">Valor final ejecutado:</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-family: monospace;">${valorFinalFormateado}</td>
                    </tr>
                    <tr style="background-color: #fff3cd;">
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Sobreejecución:</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-family: monospace; color: #856404; font-weight: bold;">${diferenciaFormateada} (+${porcentajeSobreejecucion}%)</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">Tolerancia configurada:</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-family: monospace;">${tolerance}%</td>
                    </tr>
                </table>
                
                <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #0c5460;"><strong>Acción requerida:</strong> Recuerda revisar y autorizar esta diferencia en el sistema SchoolNet.</p>
                </div>
                
                <p style="margin-bottom: 0;">Este requerimiento ha sido marcado como <strong>"pre-cerrado"</strong> hasta que se autorice la sobreejecución.</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px; margin: 0; text-align: center;">
                Este correo es generado automáticamente por SchoolNet. Por favor, no responder a este mensaje.<br>
                Colegio Tilata - Sistema de Gestión Educativa
            </p>
        </div>
    `;
}

/**
 * Función específica para notificar sobreejecución presupuestal
 * @param {string} workerEmail - Email del trabajador responsable
 * @param {string} requestDetails - Detalles del requerimiento
 * @param {number} valorInicial - Valor inicial autorizado
 * @param {number} valorFinal - Valor final ejecutado
 * @param {number} tolerance - Porcentaje de tolerancia
 * @returns {Promise<boolean>} - true si se envió exitosamente
 */
async function notifyBudgetOverrun(workerEmail, requestDetails, valorInicial, valorFinal, tolerance = 10) {
    const subject = 'SchoolNet - Notificación de sobreejecución presupuestal';
    const htmlContent = getOverrunNotificationTemplate(requestDetails, valorInicial, valorFinal, tolerance);
    
    return await sendNotification(workerEmail, subject, htmlContent, true);
}

/**
 * Configurar endpoint de notificaciones
 * @param {string} scriptId - ID del Google Apps Script desplegado
 */
function configureNotifications(scriptId) {
    NOTIFICATION_CONFIG.endpoint = `https://script.google.com/macros/s/AKfycbzhfLGSk8WYPRTDxMTNwj3IPE_gfhUbkmhnaKT8k-hf2pjjdD1570oncw1t8XLb-yIC/exec`;
    console.log('Endpoint de notificaciones configurado:', NOTIFICATION_CONFIG.endpoint);
}

/**
 * Habilitar/deshabilitar notificaciones
 * @param {boolean} enabled - true para habilitar, false para deshabilitar
 */
function toggleNotifications(enabled) {
    NOTIFICATION_CONFIG.enabled = enabled;
    console.log('Notificaciones', enabled ? 'habilitadas' : 'deshabilitadas');
}

console.log('🟢 HOLA MUNDO desde config.js - Archivo cargado correctamente');

// Hacer funciones disponibles globalmente
window.sendNotification = sendNotification;
window.notifyBudgetOverrun = notifyBudgetOverrun;
window.configureNotifications = configureNotifications;
window.toggleNotifications = toggleNotifications;
// Hacer función disponible globalmente
window.validatePageAccess = validatePageAccess;

// ==========================================
// EXPORTAR CONFIGURACIÓN GLOBAL
// ==========================================

// Hacer disponibles las configuraciones globalmente
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.CURRENT_ENVIRONMENT = CURRENT_ENVIRONMENT;
window.ENV_CONFIG = ENV_CONFIG;
window.supabaseRequest = supabaseRequest;
window.getHeaders = getHeaders;
window.showMessage = showMessage;
window.closeAlert = closeAlert;
window.formatDate = formatDate;
window.validateForm = validateForm;
window.updatePageTitle = updatePageTitle;
window.updatePageHeader = updatePageHeader;
window.updatePageFooter = updatePageFooter;
window.initializePage = initializePage;
window.applyBrandingAutomatically = applyBrandingAutomatically;window.generateBreadcrumbs = generateBreadcrumbs;
window.getModuleFolder = getModuleFolder;
window.getAuditLogs = getAuditLogs;

// ==========================================
// SISTEMA DE NAVBAR DE USUARIO Y CAMBIO DE CONTRASEÑA
// Auto-inyectable en todas las páginas
// ==========================================

// Estilos para el navbar
const navbarStyles = `
<style id="schoolnet-navbar-styles">
    #schoolnet-user-navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1040;
        background: #1B365D;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 0.75rem 0;
    }
    
    #schoolnet-user-navbar .navbar-brand {
        color: white;
        font-weight: 600;
        font-size: 1.25rem;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    #schoolnet-user-navbar .navbar-brand:hover {
        color: #f8f9fa;
    }
    
    #schoolnet-user-navbar .user-menu {
        position: relative;
    }
    
    #schoolnet-user-navbar .user-button {
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 25px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        font-size: 0.9rem;
    }
    
    #schoolnet-user-navbar .user-button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-1px);
    }
    
    #schoolnet-user-navbar .dropdown-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 200px;
        display: none;
        padding: 0.5rem 0;
    }
    
    #schoolnet-user-navbar .dropdown-menu.show {
        display: block;
    }
    
    #schoolnet-user-navbar .dropdown-item {
        padding: 0.75rem 1.25rem;
        color: #495057;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-size: 0.9rem;
    }
    
    #schoolnet-user-navbar .dropdown-item:hover {
        background: #f8f9fa;
        color: #667eea;
    }
    
    #schoolnet-user-navbar .dropdown-divider {
        height: 1px;
        background: #e9ecef;
        margin: 0.5rem 0;
    }
    
    /* Ajustar contenido para compensar navbar fijo */
    body {
        padding-top: 70px;
    }
    
    /* Estilos para el modal de cambio de contraseña */
    #change-password-modal .modal-header {
        background: #1B365D;
        color: white;
    }
    
    #change-password-modal .modal-header .btn-close {
        filter: brightness(0) invert(1);
    }
    
    #change-password-modal .form-label {
        font-weight: 500;
        color: #495057;
    }
    
    #change-password-modal .password-strength {
        margin-top: 0.5rem;
        font-size: 0.875rem;
    }
    
    #change-password-modal .strength-bar {
        height: 4px;
        border-radius: 2px;
        background: #e9ecef;
        margin-top: 0.25rem;
        overflow: hidden;
    }
    
    #change-password-modal .strength-fill {
        height: 100%;
        transition: all 0.3s;
        width: 0%;
    }
    
    #change-password-modal .strength-weak .strength-fill {
        width: 33%;
        background: #dc3545;
    }
    
    #change-password-modal .strength-medium .strength-fill {
        width: 66%;
        background: #ffc107;
    }
    
    #change-password-modal .strength-strong .strength-fill {
        width: 100%;
        background: #28a745;
    }
</style>
`;

// HTML del navbar
function createNavbarHTML() {
    const session = getStoredSession();
    const userName = session?.user?.user_display_name || session?.user?.user_name || 'Usuario';
    
    return `
        <nav id="schoolnet-user-navbar">
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center">
                    <a href="/dashboard.html" class="navbar-brand">
                        <i class="bi bi-mortarboard-fill"></i>
                        ${APP_CONFIG.name}
                    </a>
                    
                    <div class="user-menu">
                        <button class="user-button" id="user-menu-button" type="button">
                            <i class="bi bi-person-circle"></i>
                            <span>${userName}</span>
                            <i class="bi bi-chevron-down" style="font-size: 0.75rem;"></i>
                        </button>
                        
                        <div class="dropdown-menu" id="user-dropdown-menu">
                            <button class="dropdown-item" id="change-password-btn">
                                <i class="bi bi-key"></i>
                                Cambiar Contraseña
                            </button>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item" id="logout-btn">
                                <i class="bi bi-box-arrow-right"></i>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// HTML del modal de cambio de contraseña
function createChangePasswordModalHTML() {
    return `
        <div class="modal fade" id="change-password-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-key me-2"></i>
                            Cambiar Contraseña
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="change-password-form">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="current-password" class="form-label">
                                    Contraseña Actual <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input 
                                        type="password" 
                                        class="form-control" 
                                        id="current-password" 
                                        required
                                        autocomplete="current-password"
                                    >
                                    <button class="btn btn-outline-secondary" type="button" id="toggle-current">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="new-password" class="form-label">
                                    Nueva Contraseña <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input 
                                        type="password" 
                                        class="form-control" 
                                        id="new-password" 
                                        required
                                        minlength="6"
                                        autocomplete="new-password"
                                    >
                                    <button class="btn btn-outline-secondary" type="button" id="toggle-new">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                </div>
                                <div class="password-strength" id="password-strength">
                                    <small class="text-muted">Mínimo 6 caracteres</small>
                                    <div class="strength-bar">
                                        <div class="strength-fill"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="confirm-password" class="form-label">
                                    Confirmar Nueva Contraseña <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input 
                                        type="password" 
                                        class="form-control" 
                                        id="confirm-password" 
                                        required
                                        autocomplete="new-password"
                                    >
                                    <button class="btn btn-outline-secondary" type="button" id="toggle-confirm">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                </div>
                                <small class="text-danger d-none" id="password-match-error">
                                    Las contraseñas no coinciden
                                </small>
                            </div>
                            
                            <div class="alert alert-info mb-0">
                                <i class="bi bi-info-circle me-2"></i>
                                <small>La contraseña debe tener al menos 6 caracteres. Se recomienda usar mayúsculas, minúsculas y números.</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-check-circle me-1"></i>
                                Cambiar Contraseña
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Función para inyectar el navbar automáticamente
function injectUserNavbar() {
    // Solo inyectar si hay sesión activa
    const session = getStoredSession();
    if (!session || !session.user) {
        return;
    }
    
    // Verificar que no esté en login.html
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    // Inyectar estilos
    if (!document.getElementById('schoolnet-navbar-styles')) {
        document.head.insertAdjacentHTML('beforeend', navbarStyles);
    }
    
    // Inyectar navbar
    if (!document.getElementById('schoolnet-user-navbar')) {
        document.body.insertAdjacentHTML('afterbegin', createNavbarHTML());
    }
    
    // Inyectar modal
    if (!document.getElementById('change-password-modal')) {
        document.body.insertAdjacentHTML('beforeend', createChangePasswordModalHTML());
    }
    
    // Configurar event listeners
    setupNavbarEventListeners();
    setupChangePasswordModal();
    
    console.log('✅ Navbar de usuario inyectado correctamente');
}

// Configurar event listeners del navbar
function setupNavbarEventListeners() {
    const menuButton = document.getElementById('user-menu-button');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (!menuButton || !dropdownMenu) return;
    
    // Toggle del menú
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    // Abrir modal de cambio de contraseña
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
            const modal = new bootstrap.Modal(document.getElementById('change-password-modal'));
            modal.show();
        });
    }
    
    // Cerrar sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('nextSystemSession');
                sessionStorage.removeItem('nextSystemSession');
                window.location.href = '/login.html';
            }
        });
    }
}

// Configurar modal de cambio de contraseña
function setupChangePasswordModal() {
    const form = document.getElementById('change-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const strengthContainer = document.getElementById('password-strength');
    const matchError = document.getElementById('password-match-error');
    
    if (!form) return;
    
    // Toggles para mostrar/ocultar contraseñas
    setupPasswordToggles();
    
    // Medidor de fortaleza de contraseña
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', () => {
            const strength = calculatePasswordStrength(newPasswordInput.value);
            updatePasswordStrength(strength);
        });
    }
    
    // Validar que las contraseñas coincidan
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value && newPasswordInput.value !== confirmPasswordInput.value) {
                matchError.classList.remove('d-none');
                confirmPasswordInput.classList.add('is-invalid');
            } else {
                matchError.classList.add('d-none');
                confirmPasswordInput.classList.remove('is-invalid');
            }
        });
    }
    
    // Submit del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleChangePassword(form);
    });
}

// Configurar botones de mostrar/ocultar contraseña
function setupPasswordToggles() {
    const toggles = [
        { btn: 'toggle-current', input: 'current-password' },
        { btn: 'toggle-new', input: 'new-password' },
        { btn: 'toggle-confirm', input: 'confirm-password' }
    ];
    
    toggles.forEach(({ btn, input }) => {
        const button = document.getElementById(btn);
        const inputField = document.getElementById(input);
        
        if (button && inputField) {
            button.addEventListener('click', () => {
                const type = inputField.type === 'password' ? 'text' : 'password';
                inputField.type = type;
                const icon = button.querySelector('i');
                icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
            });
        }
    });
}

// Calcular fortaleza de contraseña
function calculatePasswordStrength(password) {
    if (!password) return 'none';
    if (password.length < 6) return 'weak';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'medium';
    return 'strong';
}

// Actualizar visualización de fortaleza
function updatePasswordStrength(strength) {
    const container = document.getElementById('password-strength');
    if (!container) return;
    
    const strengthBar = container.querySelector('.strength-bar');
    const text = container.querySelector('small');
    
    container.className = 'password-strength';
    
    switch (strength) {
        case 'weak':
            container.classList.add('strength-weak');
            text.textContent = 'Contraseña débil';
            text.className = 'text-danger';
            break;
        case 'medium':
            container.classList.add('strength-medium');
            text.textContent = 'Contraseña moderada';
            text.className = 'text-warning';
            break;
        case 'strong':
            container.classList.add('strength-strong');
            text.textContent = 'Contraseña fuerte';
            text.className = 'text-success';
            break;
        default:
            text.textContent = 'Mínimo 6 caracteres';
            text.className = 'text-muted';
    }
}

// Manejar cambio de contraseña
async function handleChangePassword(form) {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validaciones
    if (newPassword !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'danger');
        return;
    }
    
    if (currentPassword === newPassword) {
        showMessage('La nueva contraseña debe ser diferente a la actual', 'warning');
        return;
    }
    
    try {
        // Deshabilitar botón
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Cambiando...';
        
        const session = getStoredSession();
        if (!session || !session.user) {
            throw new Error('Sesión no válida');
        }
        
        // Verificar contraseña actual
        const loginData = await supabaseRequest('/users?select=user_password&user_id=eq.' + session.user.user_id);
        
        if (!loginData || loginData.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        
        if (loginData[0].user_password !== currentPassword) {
            throw new Error('La contraseña actual es incorrecta');
        }
        
        // Actualizar contraseña
        await supabaseRequest('/users?user_id=eq.' + session.user.user_id, {
            method: 'PATCH',
            body: JSON.stringify({ user_password: newPassword })
        });
        
        showMessage('Contraseña cambiada exitosamente', 'success');
        
        // Cerrar modal y limpiar formulario
        const modal = bootstrap.Modal.getInstance(document.getElementById('change-password-modal'));
        modal.hide();
        form.reset();
        
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        showMessage('Error: ' + error.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Cambiar Contraseña';
    }
}

// Auto-inyectar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUserNavbar);
} else {
    injectUserNavbar();
}

console.log('✅ Sistema de navbar y cambio de contraseña cargado');
