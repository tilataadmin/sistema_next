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

// Función auxiliar para obtener sesión almacenada
function getStoredSession() {
    try {
        const sessionData = localStorage.getItem('schoolnetSession') || sessionStorage.getItem('schoolnetSession');
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
        return null;
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
// ==========================================
// SISTEMA DE VALIDACIÓN DE PERMISOS POR URL
// ==========================================

// Mapeo de URLs a permisos requeridos
// Mapeo de URLs a permisos requeridos
const URL_PERMISSIONS = {
    // Módulo Seguridad
    '/modules/security/users.html': 'Gestión de usuarios',
    '/modules/security/roles.html': 'Gestión de roles', 
    '/modules/security/permissions.html': 'Gestión de permisos',
    '/modules/security/user-roles.html': 'Asignar roles',
    '/modules/security/role-permissions.html': 'Configurar permisos',
    
    // Módulo Configuración
    '/modules/config/config.html': 'Configuración general',
    '/modules/config/academic-years.html': 'Años académicos',
    '/modules/config/sections.html': 'Gestionar secciones',
    '/modules/config/grades.html': 'Gestionar grados',
    '/modules/config/courses.html': 'Gestionar cursos',
    '/modules/config/academic-areas.html': 'Gestionar áreas académicas',
    '/modules/config/programs.html': 'Gestionar programas',
    
    // Módulo Indicadores
    '/modules/indicators/variables.html': 'Variables',
    '/modules/indicators/segments.html': 'Segmentaciones',
    '/modules/indicators/data-entry.html': 'Captura de datos',
    '/modules/indicators/variable-assignments.html': 'Asignar variables a usuarios',
    '/modules/indicators/indicators.html': 'Indicadores',
    
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
    '/modules/budget/budget-queries.html': 'Consultas de presupuesto'
};

// Función principal de validación
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
// Verificar si usuario tiene permiso específico
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
window.applyBrandingAutomatically = applyBrandingAutomatically;
