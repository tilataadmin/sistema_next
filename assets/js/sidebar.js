/*
====================================
SCHOOLNET - SIDEBAR DE NAVEGACIÓN
Componente auto-inyectable
Requiere: config.js cargado previamente
====================================
*/

// ==========================================
// 1. CONFIGURACIÓN DE MÓDULOS
// ==========================================

const SIDEBAR_MODULE_ORDER = [
    { id: 'my-space', name: 'Mi Espacio', icon: 'bi-house-heart', color: '#1B365D' },
    // Estudiantes y familias
    { id: 'new-students', name: 'Estudiantes Nuevos', icon: 'bi-person-plus', color: '#1D9E75' },
    { id: 'follow-ups', name: 'Seguimientos', icon: 'bi-clipboard-check', color: '#BA7517' },
    { id: 'early-alerts', name: 'Alertas Tempranas', icon: 'bi-exclamation-triangle', color: '#E24B4A' },
    { id: 'community', name: 'Comunidad', icon: 'bi-people', color: '#1D9E75' },
    // Personas y desarrollo
    { id: 'hr', name: 'Talento Humano', icon: 'bi-person-badge', color: '#D85A30' },
    { id: 'training', name: 'Formación', icon: 'bi-mortarboard', color: '#BA7517' },
    { id: 'teacher-eval', name: 'Evaluación de Desempeño', icon: 'bi-clipboard2-pulse', color: '#993556' },
    // Sistema de gestión
    { id: 'indicators', name: 'Indicadores', icon: 'bi-graph-up', color: '#1D9E75' },
    { id: 'tte', name: 'Tilatá te Escucha', icon: 'bi-chat-heart', color: '#7F77DD' },
    { id: 'surveys', name: 'Encuestas', icon: 'bi-clipboard-data', color: '#639922' },
    { id: 'procedures', name: 'Procedimientos', icon: 'bi-diagram-3', color: '#534AB7' },
    { id: 'institutional-eval', name: 'Evaluación Institucional', icon: 'bi-building-check', color: '#0F6E56' },
    { id: 'project-management', name: 'Gestión de Proyectos y Tareas', icon: 'bi-kanban', color: '#5F5E5A' },
    // Operación y servicios
    { id: 'admissions', name: 'Admisiones', icon: 'bi-person-plus-fill', color: '#D4537E' },
    { id: 'events', name: 'Eventos', icon: 'bi-calendar-event', color: '#D85A30' },
    { id: 'services', name: 'Servicios', icon: 'bi-bus-front', color: '#378ADD' },
    { id: 'attendance', name: 'Asistencia', icon: 'bi-check2-square', color: '#185FA5' },
    { id: 'environmental', name: 'Gestión Ambiental', icon: 'bi-tree', color: '#1D9E75' },
    { id: 'suppliers', name: 'Proveedores', icon: 'bi-building', color: '#888780' },
    { id: 'budget', name: 'Presupuesto', icon: 'bi-calculator', color: '#378ADD' },
    { id: 'contracts', name: 'Contratos', icon: 'bi-file-earmark-text', color: '#854F0B' },
    { id: 'knowledge', name: 'Conocimiento', icon: 'bi-lightbulb', color: '#534AB7' },
    // Administración del sistema
    { id: 'config', name: 'Configuración', icon: 'bi-gear', color: '#7F77DD' },
    { id: 'security', name: 'Seguridad', icon: 'bi-shield-lock', color: '#E24B4A' }
];

const MY_SPACE_SUBSECTIONS = [
    { label: 'Personal', items: ['Ver mi perfil', 'Agendar recurrencias en días Tilatá'] },
    { label: 'Mis pendientes', items: ['Gestionar tareas', 'Ver mis solicitudes', 'Ejecutar procedimientos', 'Ejecutar formularios'] },
    { label: 'Mis ausencias y TTE', items: ['Solicitar ausencias', 'Responder solicitudes TTE'] },
    { label: 'Mi formación y evaluación', items: ['Ver mi ruta de formación', 'Ver mi dashboard de formación', 'Mis resultados de evaluación', 'Mis resultados de liderazgo', 'Responder evaluación de liderazgo', 'Plan de mejora de liderazgo'] },
    { label: 'Soporte', items: ['Mis Tickets'] }
];

const SIDEBAR_CACHE_KEY = 'schoolnet_sidebar_permissions';
const SIDEBAR_STATE_KEY = 'schoolnet_sidebar_state';

// ==========================================
// 2. CARGA Y CACHE DE PERMISOS
// ==========================================

async function loadSidebarPermissions() {
    const session = getStoredSession();
    if (!session || !session.user) return null;

    const cached = sessionStorage.getItem(SIDEBAR_CACHE_KEY);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (parsed.userId === session.user.user_id && parsed.data) {
                console.log('📂 Sidebar: permisos cargados desde cache');
                return parsed.data;
            }
        } catch (e) { /* cache corrupto, recargar */ }
    }

    console.log('📡 Sidebar: cargando permisos desde BD...');
    try {
        const isSuperAdmin = await checkUserIsSuperAdmin(session.user.user_id);

        // Traer todos los permisos activos con su módulo y URL
        const allPermissions = await supabaseRequest(
            '/permissions?select=permission_name,permission_module,url_path,is_universal&permission_status=eq.active'
        );

        let userPermissionNames = [];

        if (isSuperAdmin) {
            userPermissionNames = allPermissions.map(p => p.permission_name);
        } else {
            // Permisos por roles
            const userData = await supabaseRequest(
                `/users?select=user_roles!user_roles_user_id_fkey(role_id,roles(role_permissions(permissions(permission_name))))&user_id=eq.${session.user.user_id}`
            );
            if (userData && userData.length > 0) {
                userData[0].user_roles?.forEach(ur => {
                    ur.roles?.role_permissions?.forEach(rp => {
                        const name = rp.permissions?.permission_name;
                        if (name && !userPermissionNames.includes(name)) {
                            userPermissionNames.push(name);
                        }
                    });
                });
            }
            // Agregar universales
            allPermissions.forEach(p => {
                if (p.is_universal && !userPermissionNames.includes(p.permission_name)) {
                    userPermissionNames.push(p.permission_name);
                }
            });
        }

        // Agrupar por módulo
        const moduleMap = {};
        allPermissions.forEach(p => {
            if (!userPermissionNames.includes(p.permission_name)) return;
            const mod = p.permission_module;
            if (!moduleMap[mod]) moduleMap[mod] = [];
            moduleMap[mod].push({
                name: p.permission_name,
                url: p.url_path || null,
                universal: p.is_universal || false
            });
        });

        const result = { isSuperAdmin, modules: moduleMap };

        sessionStorage.setItem(SIDEBAR_CACHE_KEY, JSON.stringify({
            userId: session.user.user_id,
            data: result
        }));

        console.log('✅ Sidebar: permisos cargados y cacheados');
        return result;

    } catch (error) {
        console.error('❌ Sidebar: error cargando permisos:', error);
        return null;
    }
}

function clearSidebarCache() {
    sessionStorage.removeItem(SIDEBAR_CACHE_KEY);
}

// ==========================================
// 3. ESTILOS DEL SIDEBAR
// ==========================================

const SIDEBAR_STYLES = `
<style id="schoolnet-sidebar-styles">
    :root {
        --sidebar-width: 270px;
        --navbar-height: 56px;
    }

    #sn-sidebar {
        position: fixed;
        top: var(--navbar-height);
        left: 0;
        bottom: 0;
        width: var(--sidebar-width);
        background: var(--system-primary-color, #1B365D);
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1030;
        transition: transform 0.25s ease;
        border-right: 1px solid rgba(255,255,255,0.08);
    }

    #sn-sidebar.sn-collapsed {
        transform: translateX(calc(-1 * var(--sidebar-width)));
    }

    #sn-sidebar-backdrop {
        display: none;
        position: fixed;
        top: var(--navbar-height);
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        z-index: 1029;
    }

    body.sn-sidebar-open {
        padding-left: var(--sidebar-width);
        transition: padding-left 0.25s ease;
    }

    body.sn-sidebar-closed {
        padding-left: 0;
        transition: padding-left 0.25s ease;
    }

    /* Módulos */
    .sn-mod { border-bottom: 1px solid rgba(255,255,255,0.06); }

    .sn-mod-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 14px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: rgba(255,255,255,0.8);
        transition: background 0.15s;
        user-select: none;
    }

    .sn-mod-header:hover {
        background: rgba(255,255,255,0.08);
        color: #fff;
    }

    .sn-mod-header.sn-active {
        background: rgba(255,255,255,0.12);
        color: #fff;
    }

    .sn-mod-icon {
        width: 26px;
        height: 26px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #fff;
        flex-shrink: 0;
    }

    .sn-mod-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .sn-mod-arrow {
        font-size: 9px;
        color: rgba(255,255,255,0.4);
        transition: transform 0.2s;
        flex-shrink: 0;
    }

    .sn-mod-header.sn-active .sn-mod-arrow {
        transform: rotate(90deg);
    }

    /* Items */
    .sn-mod-items {
        display: none;
        padding: 0 0 6px;
        background: rgba(0,0,0,0.15);
    }

    .sn-mod-items.sn-show { display: block; }

    .sn-mod-item {
        display: block;
        padding: 6px 14px 6px 50px;
        font-size: 12px;
        color: rgba(255,255,255,0.6);
        cursor: pointer;
        transition: background 0.1s, color 0.1s;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .sn-mod-item:hover {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.9);
    }

    .sn-mod-item.sn-current {
        color: #fff;
        font-weight: 500;
        background: rgba(255,255,255,0.15);
        border-left: 3px solid #fff;
        padding-left: 47px;
    }

    /* Subsecciones de Mi Espacio */
    .sn-subsection-label {
        padding: 8px 14px 3px 50px;
        font-size: 10px;
        font-weight: 500;
        color: rgba(255,255,255,0.35);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Botón toggle en navbar */
    .sn-toggle-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        line-height: 1;
        display: flex;
        align-items: center;
    }

    .sn-toggle-btn:hover {
        background: rgba(255,255,255,0.15);
    }

    /* Scrollbar del sidebar */
    #sn-sidebar::-webkit-scrollbar { width: 4px; }
    #sn-sidebar::-webkit-scrollbar-track { background: transparent; }
    #sn-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
    #sn-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

    /* Mobile */
    @media (max-width: 991px) {
        body.sn-sidebar-open { padding-left: 0; }

        #sn-sidebar { transform: translateX(calc(-1 * var(--sidebar-width))); }
        #sn-sidebar.sn-mobile-open { transform: translateX(0); }
        #sn-sidebar.sn-collapsed { transform: translateX(calc(-1 * var(--sidebar-width))); }

        #sn-sidebar-backdrop.sn-show { display: block; }
    }
</style>
`;

// ==========================================
// 4. RENDERIZADO DEL SIDEBAR
// ==========================================

function buildSidebarHTML(permData) {
    const currentPath = window.location.pathname;
    let html = '';
    let currentModuleId = null;

    // Detectar módulo activo por URL
    SIDEBAR_MODULE_ORDER.forEach(mod => {
        const modPerms = permData.modules[mod.id];
        if (!modPerms || modPerms.length === 0) return;
        modPerms.forEach(p => {
            if (p.url && currentPath.endsWith(p.url) || currentPath.includes(p.url)) {
                currentModuleId = mod.id;
            }
        });
    });

   
    // Recuperar estado del módulo expandido
    const savedOpen = sessionStorage.getItem('sn_open_module');
    const openModuleId = currentModuleId || savedOpen || null;

    SIDEBAR_MODULE_ORDER.forEach(mod => {
        const modPerms = permData.modules[mod.id];
        if (!modPerms || modPerms.length === 0) return;

        const isOpen = (openModuleId === mod.id);

        html += `<div class="sn-mod">`;
        html += `<div class="sn-mod-header ${isOpen ? 'sn-active' : ''}" data-module="${mod.id}">`;
        html += `<span class="sn-mod-icon" style="background:${mod.color}"><i class="bi ${mod.icon}" style="font-size:12px"></i></span>`;
        html += `<span class="sn-mod-name">${mod.name}</span>`;
        html += `<span class="sn-mod-arrow">▶</span>`;
        html += `</div>`;

        html += `<div class="sn-mod-items ${isOpen ? 'sn-show' : ''}">`;

        if (mod.id === 'my-space') {
            MY_SPACE_SUBSECTIONS.forEach(sub => {
                const subPerms = modPerms.filter(p => sub.items.includes(p.name));
                if (subPerms.length === 0) return;

                html += `<div class="sn-subsection-label">${sub.label}</div>`;
                subPerms.forEach(p => {
                    if (!p.url) return;
                    const isCurrent = currentPath.endsWith(p.url);
                    const href = p.url;
                    html += `<a href="${href}" class="sn-mod-item ${isCurrent ? 'sn-current' : ''}">${p.name}</a>`;
                });
            });
        } else {
            modPerms.forEach(p => {
                if (!p.url) return;
                const isCurrent = currentPath.endsWith(p.url);
                const href = p.url;
                html += `<a href="${href}" class="sn-mod-item ${isCurrent ? 'sn-current' : ''}">${p.name}</a>`;
            });
        }

        html += `</div></div>`;
    });

    return html;
}

// ==========================================
// 5. INYECCIÓN Y EVENT HANDLERS
// ==========================================

async function injectSidebar() {
    const session = getStoredSession();
    if (!session || !session.user) return;
    if (window.location.pathname.includes('login.html')) return;
    if (document.getElementById('sn-sidebar')) return;

    // Inyectar estilos
    if (!document.getElementById('schoolnet-sidebar-styles')) {
        document.head.insertAdjacentHTML('beforeend', SIDEBAR_STYLES);
    }

    // Cargar permisos
    const permData = await loadSidebarPermissions();
    if (!permData) return;

    // Crear sidebar
    const sidebarHTML = buildSidebarHTML(permData);
    const sidebarEl = document.createElement('div');
    sidebarEl.id = 'sn-sidebar';
    sidebarEl.innerHTML = sidebarHTML;

    // Crear backdrop para móvil
    const backdrop = document.createElement('div');
    backdrop.id = 'sn-sidebar-backdrop';

    document.body.appendChild(sidebarEl);
    document.body.appendChild(backdrop);

    // Inyectar botón toggle en el navbar
    injectToggleButton();

    // Restaurar estado (abierto/cerrado)
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    const isMobile = window.innerWidth < 992;

    if (isMobile) {
        sidebarEl.classList.add('sn-collapsed');
        document.body.classList.add('sn-sidebar-closed');
    } else if (savedState === 'closed') {
        sidebarEl.classList.add('sn-collapsed');
        document.body.classList.add('sn-sidebar-closed');
    } else {
        document.body.classList.add('sn-sidebar-open');
    }

    // Event listeners
    setupSidebarEvents(sidebarEl, backdrop);

    // Actualizar breadcrumbs con nombres de módulos correctos
    updateBreadcrumb(permData);

    // Mostrar popup de novedades (solo la primera vez)
    showChangelogPopup();

    console.log('✅ Sidebar inyectado correctamente');
}

function injectToggleButton() {
    const navbar = document.getElementById('schoolnet-user-navbar');
    if (!navbar) return;

    const brandEl = navbar.querySelector('.navbar-brand');
    if (!brandEl) return;

    // Verificar que no exista ya
    if (document.getElementById('sn-toggle-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'sn-toggle-btn';
    btn.className = 'sn-toggle-btn';
    btn.innerHTML = '<i class="bi bi-list"></i>';
    btn.title = 'Menú lateral';

    brandEl.parentNode.insertBefore(btn, brandEl);
}

function setupSidebarEvents(sidebarEl, backdrop) {
    // Toggle button
    const toggleBtn = document.getElementById('sn-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => toggleSidebar(sidebarEl, backdrop));
    }

    // Module headers (expand/collapse)
    sidebarEl.querySelectorAll('.sn-mod-header').forEach(header => {
        header.addEventListener('click', () => {
            const moduleId = header.dataset.module;
            const items = header.nextElementSibling;
            const wasActive = header.classList.contains('sn-active');

            // Cerrar todos
            sidebarEl.querySelectorAll('.sn-mod-header').forEach(h => h.classList.remove('sn-active'));
            sidebarEl.querySelectorAll('.sn-mod-items').forEach(i => i.classList.remove('sn-show'));

            // Abrir el clickeado (si no estaba abierto)
            if (!wasActive) {
                header.classList.add('sn-active');
                items.classList.add('sn-show');
                sessionStorage.setItem('sn_open_module', moduleId);
            } else {
                sessionStorage.removeItem('sn_open_module');
            }
        });
    });

    // En móvil, cerrar sidebar al hacer click en un item
    sidebarEl.querySelectorAll('.sn-mod-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                closeSidebarMobile(sidebarEl, backdrop);
            }
        });
    });

    // Backdrop click
    backdrop.addEventListener('click', () => {
        closeSidebarMobile(sidebarEl, backdrop);
    });

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth < 992;
            if (isMobile) {
                document.body.classList.remove('sn-sidebar-open');
                document.body.classList.add('sn-sidebar-closed');
                sidebarEl.classList.remove('sn-mobile-open');
                backdrop.classList.remove('sn-show');
            }
        }, 150);
    });
}

function toggleSidebar(sidebarEl, backdrop) {
    const isMobile = window.innerWidth < 992;

    if (isMobile) {
        const isOpen = sidebarEl.classList.contains('sn-mobile-open');
        if (isOpen) {
            closeSidebarMobile(sidebarEl, backdrop);
        } else {
            sidebarEl.classList.add('sn-mobile-open');
            sidebarEl.classList.remove('sn-collapsed');
            backdrop.classList.add('sn-show');
        }
    } else {
        const isCollapsed = sidebarEl.classList.contains('sn-collapsed');
        if (isCollapsed) {
            sidebarEl.classList.remove('sn-collapsed');
            document.body.classList.remove('sn-sidebar-closed');
            document.body.classList.add('sn-sidebar-open');
            localStorage.setItem(SIDEBAR_STATE_KEY, 'open');
        } else {
            sidebarEl.classList.add('sn-collapsed');
            document.body.classList.remove('sn-sidebar-open');
            document.body.classList.add('sn-sidebar-closed');
            localStorage.setItem(SIDEBAR_STATE_KEY, 'closed');
        }
    }
}

function closeSidebarMobile(sidebarEl, backdrop) {
    sidebarEl.classList.remove('sn-mobile-open');
    backdrop.classList.remove('sn-show');
}

// ==========================================
// 6. INVALIDACIÓN DE CACHE
// ==========================================

// Limpiar cache al cerrar sesión (parchear logout existente)
const _originalLogout = window.logoutUser || null;
window.logoutUser = function() {
    clearSidebarCache();
    if (_originalLogout) _originalLogout();
};

// ==========================================
// 7. AUTO-INYECCIÓN
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(injectSidebar, 50);
    });
} else {
    setTimeout(injectSidebar, 50);
}

// Exponer funciones globalmente
window.clearSidebarCache = clearSidebarCache;
window.injectSidebar = injectSidebar;

// ==========================================
// 8. ACTUALIZACIÓN AUTOMÁTICA DE BREADCRUMBS
// ==========================================

function updateBreadcrumb(permData) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    const currentPath = window.location.pathname;
    let currentModule = null;

    // Buscar a qué módulo pertenece la página actual
    for (const mod of SIDEBAR_MODULE_ORDER) {
        const modPerms = permData.modules[mod.id];
        if (!modPerms) continue;
        for (const p of modPerms) {
            if (p.url && currentPath.endsWith(p.url)) {
                currentModule = mod;
                break;
            }
        }
        if (currentModule) break;
    }

    if (!currentModule) return;

    // Buscar el segundo breadcrumb-item (el del módulo)
    const items = breadcrumb.querySelectorAll('.breadcrumb-item');
    if (items.length < 2) return;

    const moduleItem = items[1];

    // Si es un enlace, reemplazar con el nombre correcto
    const link = moduleItem.querySelector('a');
    if (link) {
        link.textContent = currentModule.name;
        link.href = '/dashboard.html';
    } else if (!moduleItem.classList.contains('active')) {
        moduleItem.textContent = currentModule.name;
    }
}

// ==========================================
// 9. POPUP DE NOVEDADES (temporal)
// ==========================================

function showChangelogPopup() {
    const CHANGELOG_VERSION = '2026-04-14';
    const CHANGELOG_KEY = 'schoolnet_changelog_seen';

    const seen = localStorage.getItem(CHANGELOG_KEY);
    if (seen === CHANGELOG_VERSION) return;

    const session = getStoredSession();
    if (!session || !session.user) return;
    if (window.location.pathname.includes('login.html')) return;

    setTimeout(() => {
        const overlay = document.createElement('div');
        overlay.id = 'sn-changelog-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;';

        overlay.innerHTML = `
            <div style="background:white;border-radius:12px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
                <div style="background:var(--system-primary-color,#1B365D);color:white;padding:1.25rem 1.5rem;border-radius:12px 12px 0 0;">
                    <h5 style="margin:0;font-size:1.1rem;">
                        <i class="bi bi-stars me-2"></i>Novedades en SchoolNet
                    </h5>
                </div>
                <div style="padding:1.5rem;">
                    <p style="color:#495057;font-size:0.9rem;margin-bottom:1rem;">Hemos reorganizado la navegación para que sea más fácil encontrar lo que necesitas.</p>

                    <div style="margin-bottom:1rem;">
                        <div style="display:flex;align-items:start;gap:0.75rem;margin-bottom:0.75rem;">
                            <span style="background:#E6F1FB;color:#185FA5;border-radius:8px;padding:6px 8px;font-size:1rem;flex-shrink:0;"><i class="bi bi-layout-sidebar"></i></span>
                            <div>
                                <strong style="font-size:0.85rem;">Menú lateral</strong>
                                <p style="font-size:0.8rem;color:#6c757d;margin:2px 0 0;">Ahora tienes un menú en el costado izquierdo con acceso directo a todas las funciones. Usa el botón <strong>☰</strong> para abrirlo o cerrarlo.</p>
                            </div>
                        </div>

                        <div style="display:flex;align-items:start;gap:0.75rem;margin-bottom:0.75rem;">
                            <span style="background:#EAF3DE;color:#3B6D11;border-radius:8px;padding:6px 8px;font-size:1rem;flex-shrink:0;"><i class="bi bi-house-heart"></i></span>
                            <div>
                                <strong style="font-size:0.85rem;">Mi Espacio</strong>
                                <p style="font-size:0.8rem;color:#6c757d;margin:2px 0 0;">Tu página de inicio ahora muestra tus tareas, procedimientos y accesos rápidos personalizados.</p>
                            </div>
                        </div>

                        <div style="display:flex;align-items:start;gap:0.75rem;">
                            <span style="background:#FAEEDA;color:#854F0B;border-radius:8px;padding:6px 8px;font-size:1rem;flex-shrink:0;"><i class="bi bi-unlock"></i></span>
                            <div>
                                <strong style="font-size:0.85rem;">Acceso simplificado</strong>
                                <p style="font-size:0.8rem;color:#6c757d;margin:2px 0 0;">Funciones como tareas, ausencias, formación y tickets ahora están disponibles para todos sin necesidad de permisos especiales.</p>
                            </div>
                        </div>
                    </div>

                    <button id="sn-changelog-close" style="width:100%;padding:0.6rem;border:none;background:var(--system-primary-color,#1B365D);color:white;border-radius:8px;font-size:0.9rem;cursor:pointer;font-weight:500;">
                        Entendido
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('sn-changelog-close').addEventListener('click', () => {
            overlay.remove();
            localStorage.setItem(CHANGELOG_KEY, CHANGELOG_VERSION);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                localStorage.setItem(CHANGELOG_KEY, CHANGELOG_VERSION);
            }
        });

    }, 1000);
}


console.log('✅ Módulo sidebar.js cargado');
