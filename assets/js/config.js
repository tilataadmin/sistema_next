/*
====================================
SCHOOLNET - CONFIGURACIÓN GLOBAL
Variables de entorno y configuración
Actualizado: Septiembre 2025
====================================
*/

// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================

// Función para obtener variables de entorno (versión navegador)
function getEnvVar(name, fallback = null) {
    // En el navegador, usar directamente los valores fallback
    // Las variables de entorno de Vercel se inyectan en build time
    const env = {
        SUPABASE_URL: 'https://spjzvpcsgbewxupjvmfm.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanp2cGNzZ2Jld3h1cGp2bWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk4MDEsImV4cCI6MjA3MjU4NTgwMX0.6n_rvGalz_IT2vQ1Q4fPGS0D-ijYBUmdkL3PmbyNRck'
    };
    
    return env[name] || fallback;
}

// Configuración de Supabase
const SUPABASE_CONFIG = {
    url: getEnvVar('SUPABASE_URL'),
    anonKey: getEnvVar('SUPABASE_ANON_KEY'),
    get apiUrl() {
        return `${this.url}/rest/v1`;
    }
};

// Validar configuración
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error('❌ Error: Variables de entorno de Supabase no configuradas');
    throw new Error('Configuración de Supabase incompleta');
}

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
    
    return { ...defaultHeaders, ...options };
}

// ==========================================
// CONFIGURACIÓN DE LA APLICACIÓN - ACTUALIZADA
// ==========================================

const APP_CONFIG = {
    // Información básica del sistema - ACTUALIZADA
    name: 'SchoolNet',
    fullName: 'Sistema de Gestión Educativa SchoolNet',
    version: '1.0.0',
    description: 'Plataforma integral para la gestión de instituciones educativas',
    
    // Información de la institución - NUEVO
    institution: {
        name: 'Colegio Tilata',
        domain: 'colegiotilata.edu.co',
        logo: '/assets/images/logo.png' // Para cuando tengas logo
    },
    
    environment: getEnvVar('NODE_ENV', 'development'),
    
    // Módulos actualizados con más detalle
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
        
        // Textos dinámicos para títulos y headers - NUEVO
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
        
        // Mensajes del sistema - NUEVO
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
// FUNCIONES DE UTILIDAD EXISTENTES
// ==========================================

// Función para hacer requests a Supabase
async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_CONFIG.apiUrl}${endpoint}`;
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

// Función para mostrar mensajes
function showMessage(message, type = 'info', containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`⚠️ Container ${containerId} no encontrado para mostrar mensaje`);
        return;
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
            ${message}
            <button type="button" class="btn-close" onclick="closeAlert('${alertId}')"></button>
        </div>
    `;
    
    container.innerHTML = alertHtml;
    
    // Auto-cerrar si está configurado
    if (APP_CONFIG.notifications.autoHide) {
        setTimeout(() => closeAlert(alertId), APP_CONFIG.notifications.duration);
    }
}

// Función para cerrar alertas
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

// Función para formatear fechas
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

// Función para validar formularios
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

// ==========================================
// FUNCIONES NUEVAS PARA BRANDING AUTOMÁTICO
// ==========================================

// Función para actualizar títulos de página automáticamente
function updatePageTitle(pageKey, moduleName = '') {
    const baseTitle = APP_CONFIG.ui.titles[pageKey] || 'Página';
    const fullTitle = moduleName ? 
        `${baseTitle} - ${moduleName} - ${APP_CONFIG.name}` : 
        `${baseTitle} - ${APP_CONFIG.name}`;
    
    document.title = fullTitle;
}

// Función para actualizar headers automáticamente
function updatePageHeader(headerSelector = '.header h4', pageKey = null) {
    const headerElement = document.querySelector(headerSelector);
    if (headerElement && !pageKey) {
        // Solo cambiar "Sistema NEXT" por "SchoolNet" si no se especifica pageKey
        headerElement.textContent = headerElement.textContent.replace(/Sistema NEXT/g, APP_CONFIG.name);
    } else if (headerElement && pageKey) {
        headerElement.textContent = APP_CONFIG.name;
    }
}

// Función para actualizar footers automáticamente
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

// Función para aplicar branding automáticamente
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
    
    if (textNodes.length > 0) {
        console.log(`✅ Branding aplicado automáticamente: ${textNodes.length} textos actualizados`);
    }
}

// Función para inicializar la página automáticamente
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
// INICIALIZACIÓN - ACTUALIZADA
// ==========================================

// Log de inicialización - ACTUALIZADO
console.log(`🏫 ${APP_CONFIG.name} inicializado`);
console.log(`📊 Entorno: ${APP_CONFIG.environment}`);
console.log(`🔗 Supabase URL: ${SUPABASE_CONFIG.url}`);
console.log(`🎨 Tema: ${APP_CONFIG.ui.theme}`);

// Auto-inicializar branding - NUEVO
initializePage();

// Verificar conectividad con Supabase al cargar
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Test de conectividad simple
        await supabaseRequest('/users?select=user_id&limit=1');
        console.log('✅ Conexión con Supabase establecida');
    } catch (error) {
        console.error('❌ Error de conexión con Supabase:', error);
        showMessage('Error de conexión con la base de datos. Verifica tu configuración.', 'danger');
    }
});

// ==========================================
// EXPORTAR CONFIGURACIÓN GLOBAL - ACTUALIZADA
// ==========================================

// Hacer disponibles las configuraciones globalmente
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.supabaseRequest = supabaseRequest;
window.getHeaders = getHeaders;
window.showMessage = showMessage;
window.closeAlert = closeAlert;
window.formatDate = formatDate;
window.validateForm = validateForm;

// Nuevas funciones disponibles globalmente
window.updatePageTitle = updatePageTitle;
window.updatePageHeader = updatePageHeader;
window.updatePageFooter = updatePageFooter;
window.initializePage = initializePage;
window.applyBrandingAutomatically = applyBrandingAutomatically;
