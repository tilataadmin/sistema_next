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
    } else if (hostname.includes('presucorti.colegiotilata.edu.co')) {
        return 'presucorti';
    } else if (hostname.includes('schoolnet.colegiotilata.edu.co')) {
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
    },
    // 🆕 NUEVO AMBIENTE - PRESUCORTI
    presucorti: {
        name: 'PresuCorti',
        supabase: {
            url: 'https://uxzhkyhgsgvqksmdwbim.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4emhreWhnc2d2cWtzbWR3YmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjkzMDAsImV4cCI6MjA4NTEwNTMwMH0.BesT3KJvyAEQHQLryx959k2dE63NjJsGdiETRleECVM'
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
// SISTEMA DE VERSIONAMIENTO POR PÁGINA
// ==========================================

/**
 * Renderiza un badge discreto con la versión de la página individual
 * Lee el meta tag: <meta name="page-version" content="YY.MM.DD.HH.MM">
 * Si no existe el meta tag, no muestra nada (retrocompatible)
 */
function renderPageVersion() {
    // Buscar el meta tag de versión
    const versionMeta = document.querySelector('meta[name="page-version"]');
    
    if (!versionMeta) return; // Si no tiene versión, no mostrar nada (retrocompatible)
    
    const version = versionMeta.content;
    const envLabel = CURRENT_ENVIRONMENT === 'development' ? ' [DEV]' : '';
    
    // Crear badge discreto en esquina inferior derecha
    const badge = document.createElement('div');
    badge.id = 'page-version-badge';
    badge.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 10px;
        font-family: 'Courier New', monospace;
        z-index: 9999;
        backdrop-filter: blur(5px);
        cursor: help;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    
    badge.textContent = `v${version}${envLabel}`;
    badge.title = `Última modificación: ${version}\nAmbiente: ${CURRENT_ENVIRONMENT}`;
    
    // Hover effect
    badge.addEventListener('mouseenter', () => {
        badge.style.background = 'rgba(0, 0, 0, 0.9)';
        badge.style.transform = 'scale(1.05)';
    });
    
    badge.addEventListener('mouseleave', () => {
        badge.style.background = 'rgba(0, 0, 0, 0.7)';
        badge.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(badge);
    console.log(`📌 Versión de página: v${version}`);
}

// Auto-ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderPageVersion);
} else {
    renderPageVersion();
}

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

// ==========================================
// CONFIGURACIÓN DE PHIDIAS - Cache local
// ==========================================

let PHIDIAS_CONFIG = {
    baseUrl: null,
    token: null,
    tokenExpiry: null,
    loaded: false
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
    : CURRENT_ENVIRONMENT === 'presucorti'
        ? 'https://presucorti.colegiotilata.edu.co'
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
        },
        {
            id: 'events',
            name: 'Eventos',
            description: 'Gestión de eventos institucionales con inscripciones, asistencia y grupos',
            icon: 'bi-calendar-event',
            path: '/modules/events/',
            status: 'active'
        },
        {
            id: 'services',
            name: 'Servicios',
            description: 'Gestión de servicios institucionales, transporte, eventos y salidas',
            icon: 'bi-bus-front',
            path: '/modules/services/',
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

// ==========================================
// FUNCIONES DE INTEGRACIÓN CON PHIDIAS
// ==========================================

/**
 * Carga la configuración de PHIDIAS desde system_config
 * @returns {Promise<Object>} - Configuración de PHIDIAS
 */
async function loadPhidiasConfig() {
    try {
        if (PHIDIAS_CONFIG.loaded && isPhidiasTokenValid()) {
            return PHIDIAS_CONFIG;
        }
        
        console.log('🔄 Cargando configuración de PHIDIAS...');
        
        const configData = await supabaseRequest(
            '/system_config?select=phidias_base_url,phidias_token,phidias_token_expiry&limit=1'
        );
        
        if (configData && configData.length > 0) {
            PHIDIAS_CONFIG.baseUrl = configData[0].phidias_base_url;
            PHIDIAS_CONFIG.token = configData[0].phidias_token;
            PHIDIAS_CONFIG.tokenExpiry = configData[0].phidias_token_expiry;
            PHIDIAS_CONFIG.loaded = true;
            
            console.log('✅ Configuración de PHIDIAS cargada');
            return PHIDIAS_CONFIG;
        } else {
            console.warn('⚠️ No se encontró configuración de PHIDIAS');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error cargando configuración de PHIDIAS:', error);
        return null;
    }
}

/**
 * Verifica si el token de PHIDIAS está vigente
 * @returns {boolean}
 */
function isPhidiasTokenValid() {
    if (!PHIDIAS_CONFIG.token || !PHIDIAS_CONFIG.tokenExpiry) {
        return false;
    }
    
    const today = new Date();
    const expiry = new Date(PHIDIAS_CONFIG.tokenExpiry);
    today.setHours(0, 0, 0, 0);
    
    return today <= expiry;
}

/**
 * Realiza una petición a la API de PHIDIAS
 * @param {string} endpoint - Endpoint (ej: '/course/consolidate')
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Object>}
 */
async function phidiasRequest(endpoint, options = {}) {
    try {
        if (!PHIDIAS_CONFIG.loaded) {
            await loadPhidiasConfig();
        }
        
        if (!PHIDIAS_CONFIG.baseUrl || !PHIDIAS_CONFIG.token) {
            throw new Error('Configuración de PHIDIAS no disponible.');
        }
        
        if (!isPhidiasTokenValid()) {
            throw new Error('Token de PHIDIAS expirado. Contacte al administrador.');
        }
        
        const url = `${PHIDIAS_CONFIG.baseUrl}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${PHIDIAS_CONFIG.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        console.log(`📡 PHIDIAS: ${config.method} ${endpoint}`);
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PHIDIAS HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`✅ PHIDIAS: ${Array.isArray(data) ? data.length + ' registros' : 'OK'}`);
        
        return data;
        
    } catch (error) {
        console.error('❌ PHIDIAS Error:', error);
        throw error;
    }
}

/**
 * Convierte timestamp Unix a formato YYYY-MM-DD
 * @param {number} timestamp - Timestamp en segundos
 * @returns {string|null}
 */
function phidiasTimestampToDate(timestamp) {
    if (!timestamp || timestamp === 0) return null;
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

/**
 * Obtiene la carpeta del módulo basándose en el nombre
 * @param {string} moduleName - Nombre del módulo (ej: "Seguridad")
 * @returns {string|null} - Carpeta del módulo (ej: "security") o null
 */
function getModuleFolder(moduleName) {
    const module = APP_CONFIG.modules.find(m => m.name === moduleName);
    
    if (module && module.path) {
        // Extraer solo el nombre de la carpeta desde el path
        // '/modules/security/' → 'security'
        const folderMatch = module.path.match(/\/modules\/([^\/]+)\//);
        return folderMatch ? folderMatch[1] : null;
    }
    
    return null;
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
        await loadAndApplyBrandColors();
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
// CARGAR Y APLICAR COLORES CORPORATIVOS
// ==========================================

/**
 * Carga los colores corporativos desde system_config y los aplica al sistema
 */
async function loadAndApplyBrandColors() {
    try {
        console.log('🎨 Cargando colores corporativos...');
        
        const configData = await supabaseRequest('/system_config?select=primary_color_hex,secondary_color_hex,tertiary_color_hex&limit=1');
        
        if (configData && configData.length > 0) {
            const colors = configData[0];
            
            // Aplicar colores como variables CSS globales
            const root = document.documentElement;
            
            if (colors.primary_color_hex) {
                root.style.setProperty('--system-primary-color', colors.primary_color_hex);
                console.log('✅ Color primario aplicado:', colors.primary_color_hex);
            }
            
            if (colors.secondary_color_hex) {
                root.style.setProperty('--system-secondary-color', colors.secondary_color_hex);
                console.log('✅ Color secundario aplicado:', colors.secondary_color_hex);
            }
            
            if (colors.tertiary_color_hex) {
                root.style.setProperty('--system-tertiary-color', colors.tertiary_color_hex);
                console.log('✅ Color terciario aplicado:', colors.tertiary_color_hex);
            }
            
            // Actualizar el navbar si existe
            updateNavbarColors(colors.primary_color_hex);
            
            // Guardar colores en APP_CONFIG para uso global
            APP_CONFIG.brandColors = {
                primary: colors.primary_color_hex || '#1B365D',
                secondary: colors.secondary_color_hex || '#667eea',
                tertiary: colors.tertiary_color_hex || '#f59e0b'
            };
            
            console.log('🎨 Colores corporativos aplicados correctamente');
            return colors;
        } else {
            console.warn('⚠️ No se encontró configuración de colores, usando colores por defecto');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error cargando colores corporativos:', error);
        return null;
    }
}

/**
 * Actualiza los colores del navbar con el color primario
 */
function updateNavbarColors(primaryColor) {
    if (!primaryColor) return;
    
    const navbar = document.getElementById('schoolnet-user-navbar');
    if (navbar) {
        navbar.style.background = primaryColor;
        console.log('✅ Color del navbar actualizado');
    }
}

// ==========================================
// SISTEMA DE VALIDACIÓN DE PERMISOS POR URL
// Actualizado: Nov 2025 - Sin hardcode
// ==========================================

/**
 * Valida si el usuario actual tiene acceso a la página
 * @param {string} requiredPermission - Nombre exacto del permiso requerido (OBLIGATORIO)
 * @returns {boolean} - true si tiene acceso, false si no
 */
async function validatePageAccess(requiredPermission) {
    try {
        console.log('🔐 Validando acceso a página...');
        
        // 1. Verificar sesión activa
        const session = getStoredSession();
        if (!session || !session.user) {
            console.log('❌ No hay sesión activa');
            redirectToLogin();
            return false;
        }
        
        // 2. Validar que se especificó un permiso
        if (!requiredPermission) {
            console.error('❌ validatePageAccess() requiere permiso explícito');
            showAccessDenied('Permiso no especificado para esta página');
            return false;
        }
        
        // 3. Verificar permiso específico (incluye verificación de super admin)
        const hasPermission = await checkUserPermission(session.user.user_id, requiredPermission);
        
        if (hasPermission) {
            console.log(`✅ Usuario tiene acceso: ${requiredPermission}`);
            return true;
        } else {
            console.log(`❌ Usuario NO tiene acceso: ${requiredPermission}`);
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
    // Ya no usa URL_PERMISSIONS hardcoded
    // Las páginas deben pasar el permiso explícitamente
    console.log('⚠️ detectRequiredPermission() deprecado - pasar permiso explícitamente');
    return null;
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
// GESTIÓN DE PERMISOS DE MÓDULOS
// ==========================================

/**
 * Carga los permisos de un módulo desde la base de datos
 * @param {string} moduleId - ID del módulo (debe coincidir con permission_module en BD)
 * @returns {Promise<Array<string>>} - Array con los nombres de los permisos del módulo
 * @example
 * const permisos = await cargarPermisosDeModulo('Admisiones');
 * // Retorna: ['Aspirantes', 'Dashboard', 'Reportes', ...]
 */
async function cargarPermisosDeModulo(moduleId) {
    try {
        if (!moduleId || moduleId.trim() === '') {
            // Módulo sin restricción (acceso universal)
            console.log('⚪ Módulo sin restricciones de permisos');
            return [];
        }
        
        console.log(`📦 Cargando permisos del módulo: ${moduleId}...`);
        
        const permisos = await supabaseRequest(
            `/permissions?select=permission_name&permission_module=eq.${moduleId}&permission_status=eq.active`
        );
        
        const permisosArray = permisos.map(p => p.permission_name);
        
        console.log(`✅ ${permisosArray.length} permisos cargados para: ${moduleId}`);
        
        return permisosArray;
        
    } catch (error) {
        console.error(`❌ Error cargando permisos del módulo ${moduleId}:`, error);
        return [];
    }
}

/**
 * Verifica si el usuario tiene acceso a un módulo
 * @param {string} userId - ID del usuario
 * @param {Array<string>} modulePermissions - Array de permisos del módulo
 * @returns {Promise<boolean>} - true si tiene acceso, false si no
 */
async function checkModuleAccess(userId, modulePermissions) {
    try {
        if (!userId) {
            console.log('❌ No hay usuario especificado');
            return false;
        }
        
        // Verificar si es super admin
        const isSuperAdmin = await checkUserIsSuperAdmin(userId);
        if (isSuperAdmin) {
            console.log('✅ Acceso permitido - es Super Admin');
            return true;
        }
        
        // Si no hay permisos configurados, acceso universal
        if (!modulePermissions || modulePermissions.length === 0) {
            console.log('✅ Módulo sin restricciones de permisos');
            return true;
        }
        
        // Verificar si tiene al menos uno de los permisos del módulo
        for (const permission of modulePermissions) {
            const hasPermission = await checkUserPermission(userId, permission);
            if (hasPermission) {
                console.log(`✅ Acceso permitido con permiso: ${permission}`);
                return true;
            }
        }
        
        console.log('❌ Sin permisos para este módulo');
        return false;
        
    } catch (error) {
        console.error('❌ Error verificando acceso al módulo:', error);
        return false;
    }
}

/**
 * Verifica si usuario es Super Admin
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
async function checkUserIsSuperAdmin(userId) {
    try {
        const userData = await supabaseRequest(`/user_roles?select=roles(is_super_admin)&user_id=eq.${userId}`);
        return userData.some(ur => ur.roles?.is_super_admin === true);
    } catch (error) {
        console.error('❌ Error verificando super admin:', error);
        return false;
    }
}

/**
 * Obtiene todos los permisos de un usuario
 * @param {string} userId - ID del usuario
 * @param {Array<string>} modulePermissions - Permisos del módulo actual (opcional)
 * @returns {Promise<Array<string>>} - Array de permisos del usuario
 */
async function obtenerTodosLosPermisosUsuario(userId, modulePermissions = []) {
    try {
        // Verificar si es super admin primero
        const isSuperAdmin = await checkUserIsSuperAdmin(userId);
        if (isSuperAdmin) {
            // Super admin tiene todos los permisos del módulo
            return modulePermissions;
        }
        
        // Obtener todos los permisos del usuario
        const data = await supabaseRequest(
            `/users?select=user_roles!user_roles_user_id_fkey(role_id,roles(role_permissions(permissions(permission_name))))&user_id=eq.${userId}`
        );
        
        if (!data || data.length === 0) {
            return [];
        }
        
        // Extraer todos los permisos en un array
        const permissions = [];
        data[0].user_roles?.forEach(userRole => {
            userRole.roles?.role_permissions?.forEach(rolePermission => {
                const permName = rolePermission.permissions?.permission_name;
                if (permName && !permissions.includes(permName)) {
                    permissions.push(permName);
                }
            });
        });
        
        return permissions;
        
    } catch (error) {
        console.error('❌ Error obteniendo permisos:', error);
        return [];
    }
}

console.log('✅ Sistema de gestión de permisos de módulos cargado');

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
window.loadAndApplyBrandColors = loadAndApplyBrandColors;
window.updateNavbarColors = updateNavbarColors;
// PHIDIAS Integration
window.PHIDIAS_CONFIG = PHIDIAS_CONFIG;
window.loadPhidiasConfig = loadPhidiasConfig;
window.isPhidiasTokenValid = isPhidiasTokenValid;
window.phidiasRequest = phidiasRequest;
window.phidiasTimestampToDate = phidiasTimestampToDate;

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
        background: var(--system-primary-color, #1B365D);
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
    
    #schoolnet-user-navbar .manual-button {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        font-size: 0.9rem;
        text-decoration: none;
    }
    
    #schoolnet-user-navbar .manual-button:hover {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        transform: translateY(-1px);
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

// Función para detectar la URL del manual según la página actual
function getManualUrl() {
    const currentPath = window.location.pathname;
    
    // Si ya estamos en el manual, quedarse ahí
    if (currentPath.includes('/manual/')) {
        return currentPath;
    }
    
    // Para páginas en /modules/, construir ruta paralela en /manual/
    if (currentPath.includes('/modules/')) {
        // Ejemplo: /modules/security/users.html -> /manual/security/users.html
        const manualPath = currentPath.replace('/modules/', '/manual/');
        return manualPath;
    }
    
    // Si estamos en el dashboard principal o login, ir al manual general
    if (currentPath.endsWith('/dashboard.html') || currentPath === '/dashboard.html' || 
        currentPath.includes('login.html') || currentPath === '/') {
        return '/manual/index.html';
    }
    
    // Para cualquier otra página, manual general
    return '/manual/index.html';
}

// HTML del navbar
function createNavbarHTML() {
    const session = getStoredSession();
    const userName = session?.user?.user_display_name || session?.user?.user_name || 'Usuario';
    
    // Detectar ruta al manual automáticamente
    const manualUrl = getManualUrl();
    
    return `
        <nav id="schoolnet-user-navbar">
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center">
                    <a href="/dashboard.html" class="navbar-brand">
                        <i class="bi bi-mortarboard-fill"></i>
                        ${APP_CONFIG.name}
                    </a>
                    
                    <div class="d-flex align-items-center gap-3">
                        <!-- Botón de Manual -->
                            <a href="${manualUrl}" class="manual-button" id="manual-button">
                            <i class="bi bi-book"></i>
                            <span class="d-none d-md-inline">Manual</span>
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

// ==========================================
// FUNCIONES PARA FORMATEAR WORKERS
// ==========================================

/**
 * Formatea el nombre completo de un worker
 * @param {Object} worker - Objeto worker con first_name, last_name_1, last_name_2
 * @returns {string} - Nombre formateado: "Apellido1 Apellido2 Nombres"
 */
function formatWorkerName(worker) {
    if (!worker) return '';
    
    const lastName1 = worker.worker_last_name_1 || '';
    const lastName2 = worker.worker_last_name_2 || '';
    const firstName = worker.worker_first_name || '';
    
    // Si hay segundo apellido: "García Rodríguez Juan Carlos"
    // Si no hay segundo apellido: "García Juan Carlos"
    if (lastName2.trim()) {
        return `${lastName1} ${lastName2} ${firstName}`.trim();
    } else {
        return `${lastName1} ${firstName}`.trim();
    }
}

/**
 * Ordena un array de workers por apellido1, apellido2, nombres
 * @param {Array} workers - Array de objetos worker
 * @returns {Array} - Array ordenado
 */
function sortWorkersByName(workers) {
    if (!Array.isArray(workers)) return [];
    
    return workers.sort((a, b) => {
        // Ordenar por apellido1
        const compareLastName1 = (a.worker_last_name_1 || '').localeCompare(b.worker_last_name_1 || '');
        if (compareLastName1 !== 0) return compareLastName1;
        
        // Si apellido1 es igual, ordenar por apellido2
        const compareLastName2 = (a.worker_last_name_2 || '').localeCompare(b.worker_last_name_2 || '');
        if (compareLastName2 !== 0) return compareLastName2;
        
        // Si apellido1 y apellido2 son iguales, ordenar por nombres
        return (a.worker_first_name || '').localeCompare(b.worker_first_name || '');
    });
}

console.log('✅ Sistema de navbar y cambio de contraseña cargado');
