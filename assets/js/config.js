/*
====================================
SISTEMA NEXT - CONFIGURACIÓN GLOBAL
Variables de entorno y configuración
Creado: Septiembre 2025
====================================
*/

// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================

// Función para obtener variables de entorno
function getEnvVar(name, fallback = null) {
    // En el navegador, las variables de entorno de Vercel no están disponibles directamente
    // Por lo que usamos un objeto de configuración que se reemplaza en build time
    const env = {
        SUPABASE_URL: process?.env?.SUPABASE_URL || 'https://spjzvpcsgbewxupjvmfm.supabase.co',
        SUPABASE_ANON_KEY: process?.env?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanp2cGNzZ2Jld3h1cGp2bWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk4MDEsImV4cCI6MjA3MjU4NTgwMX0.6n_rvGalz_IT2vQ1Q4fPGS0D-ijYBUmdkL3PmbyNRck'
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
// CONFIGURACIÓN DE LA APLICACIÓN
// ==========================================

const APP_CONFIG = {
    name: 'Sistema NEXT',
    version: '1.0.0',
    environment: getEnvVar('NODE_ENV', 'development'),
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
            id: 'indicators',
            name: 'Indicadores',
            description: 'Dashboard y métricas del sistema',
            icon: 'bi-graph-up',
            path: '/modules/indicators/',
            status: 'planned'
        }
    ],
    
    // Configuración de UI
    ui: {
        theme: 'minimal',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
    },
    
    // Configuración de notificaciones
    notifications: {
        autoHide: true,
        duration: 5000,
        position: 'top-right'
    }
};

// ==========================================
// FUNCIONES DE UTILIDAD
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
// INICIALIZACIÓN
// ==========================================

// Log de inicialización
console.log('🚀 Sistema NEXT inicializado');
console.log(`📊 Entorno: ${APP_CONFIG.environment}`);
console.log(`🔗 Supabase URL: ${SUPABASE_CONFIG.url}`);
console.log(`🎨 Tema: ${APP_CONFIG.ui.theme}`);

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
// EXPORTAR CONFIGURACIÓN GLOBAL
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
