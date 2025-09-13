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
async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_CONFIG.apiUrl}${endpoint}`;
    const config = {
        headers: getHeaders(options.headers),
        ...options
    };
    
    try {
        if (ENV_CONFIG.features.logging === 'verbose') {
            console.log(`📡 [${CURRENT_ENVIRONMENT.toUpperCase()}] API Request: ${options.method || 'GET'} ${endpoint}`);
        }
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [${CURRENT_ENVIRONMENT.toUpperCase()}] API Error: ${response.status} - ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (ENV_CONFIG.features.logging === 'verbose') {
            console.log(`✅ [${CURRENT_ENVIRONMENT.toUpperCase()}] API Response: ${data.length || 'OK'}`);
        }
        
        return data;
        
    } catch (error) {
        console.error(`❌ [${CURRENT_ENVIRONMENT.toUpperCase()}] Request failed:`, error);
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
