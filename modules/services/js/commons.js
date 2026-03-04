// ============================================================
// commons.js — Módulo de Servicios (Salidas) — SchoolNet
// Ubicación: /modules/services/js/commons.js
// Dependencia: debe cargarse DESPUÉS de config.js
// ============================================================

const SvcCommons = (() => {

    // ============================
    // CONSTANTES COMPARTIDAS
    // ============================
    const STATUS_LABELS = {
        scheduled: 'Programación',
        imminent: 'Inminente',
        in_progress: 'En proceso',
        completed: 'Realizada',
        suspended: 'Suspendida',
        cancelled: 'Cancelada'
    };

    const STATUS_ICONS = {
        scheduled: 'bi-calendar-check',
        imminent: 'bi-alarm',
        in_progress: 'bi-play-circle',
        completed: 'bi-check-circle',
        suspended: 'bi-pause-circle',
        cancelled: 'bi-x-circle'
    };

    const MODALITY_LABELS = {
        outbound: 'Solo ida',
        'return': 'Solo regreso',
        round_trip: 'Ida y regreso'
    };

    const APPROVAL_LABELS = {
        pending: 'Pendiente',
        approved: 'Aprobada',
        rejected: 'Rechazada'
    };

    const PERM_RESOLUCION_ID = '5c503ff3-559f-4755-9d47-b63fe7f561a2';

    // ============================
    // UTILIDADES PURAS
    // ============================
    function formatNumber(num) {
        return new Intl.NumberFormat('es-CO').format(Math.round(num));
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDateForDatabase(dateString) {
        if (!dateString) return null;
        if (dateString.includes('T')) return dateString.split('T')[0];
        return dateString;
    }

    function getCurrentDateColombia() {
        const now = new Date();
        const colombiaOffset = -5 * 60;
        const localOffset = now.getTimezoneOffset();
        const colombiaTime = new Date(now.getTime() + (localOffset + colombiaOffset) * 60000);
        return `${colombiaTime.getFullYear()}-${String(colombiaTime.getMonth() + 1).padStart(2, '0')}-${String(colombiaTime.getDate()).padStart(2, '0')}`;
    }

    function formatearHora12(timeStr) {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        let hour = parseInt(h);
        const ampm = hour >= 12 ? 'pm' : 'am';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        return `${hour}:${m} ${ampm}`;
    }

    function calcularEdad(birthday) {
        if (!birthday) return '';
        const birth = new Date(birthday + 'T00:00:00');
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }

    function daysBetween(dateStr1, dateStr2) {
        const d1 = new Date(dateStr1 + 'T00:00:00');
        const d2 = new Date(dateStr2 + 'T00:00:00');
        return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    }

    // ============================
    // SESIÓN Y WORKER ACTUAL
    // ============================
    async function loadCurrentWorker(session) {
        try {
            const userData = await supabaseRequest(
                `/users?select=user_mail&user_id=eq.${session.user.user_id}`
            );
            if (!userData || !userData.length || !userData[0].user_mail) return null;

            const workers = await supabaseRequest(
                `/workers?select=worker_id,worker_first_name,worker_last_name_1,worker_last_name_2,email&email=eq.${userData[0].user_mail}`
            );
            return (workers && workers.length > 0) ? workers[0] : null;
        } catch (e) {
            console.error('Error loading current worker:', e);
            return null;
        }
    }

    // ============================
    // CARGA DE CATÁLOGOS COMUNES
    // ============================
    async function loadApprovers() {
        try {
            const rolePerms = await supabaseRequest(
                `/role_permissions?select=role_id&permission_id=eq.${PERM_RESOLUCION_ID}`
            );
            if (!rolePerms || !rolePerms.length) return [];

            const roleFilter = rolePerms.map(rp => `role_id.eq.${rp.role_id}`).join(',');
            const userRoles = await supabaseRequest(
                `/user_roles?select=user_id&or=(${roleFilter})`
            );
            if (!userRoles || !userRoles.length) return [];

            const userIds = [...new Set(userRoles.map(ur => ur.user_id))];
            const userFilter = userIds.map(id => `user_id.eq.${id}`).join(',');
            const users = await supabaseRequest(
                `/users?select=user_mail&or=(${userFilter})`
            );
            if (!users || !users.length) return [];

            const emails = users.map(u => u.user_mail).filter(Boolean);
            const emailFilter = emails.map(e => `email.eq.${e}`).join(',');
            return await supabaseRequest(
                `/workers?select=worker_id,worker_first_name,worker_last_name_1,worker_last_name_2&or=(${emailFilter})&order=worker_last_name_1,worker_first_name`
            ) || [];
        } catch (e) {
            console.error('Error loading approvers:', e);
            return [];
        }
    }

    async function loadCommonCatalogs() {
        const [destinations, rates, nodes, config, approvers, menus, workers] = await Promise.all([
            supabaseRequest('/svc_transport_destinations?select=destination_id,destination_name,destination_address&is_active=eq.true&order=destination_name'),
            supabaseRequest('/svc_transport_rates_students?select=rate_id,destination_id,min_capacity,max_capacity,rate_value&is_active=eq.true'),
            supabaseRequest('/svc_transport_nodes?select=node_id,node_name,node_description,node_order&is_active=eq.true&order=node_order,node_name'),
            supabaseRequest('/svc_module_config?select=config_key,config_value'),
            loadApprovers(),
            supabaseRequest('/svc_catering_menus?select=menu_id,menu_name,unit_price&is_active=eq.true&order=menu_name'),
            supabaseRequest('/workers?select=worker_id,worker_first_name,worker_last_name_1,worker_last_name_2&worker_status=eq.active&order=worker_last_name_1,worker_first_name')
        ]);

        const moduleConfig = {};
        (config || []).forEach(c => moduleConfig[c.config_key] = c.config_value);

        return {
            destinations: destinations || [],
            rates: rates || [],
            nodes: nodes || [],
            moduleConfig,
            approvers: approvers || [],
            menus: menus || [],
            workers: workers || [],
            emailChef: moduleConfig['email_chef'] || '',
            emailSupervisor: moduleConfig['email_supervisor'] || ''
        };
    }

    // ============================
    // FLATPICKR INITIALIZATION
    // ============================
    function initializeFlatpickr(inputSelector, moduleConfig) {
        const minDays = parseInt(moduleConfig['min_days_advance'] || '7');
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + minDays);

        const fp = flatpickr(inputSelector, {
            locale: 'es',
            dateFormat: 'Y-m-d',
            minDate: minDate,
            altInput: true,
            altFormat: 'j \\de F \\de Y',
            disableMobile: true,
            onReady: function(selectedDates, dateStr, instance) {
                instance.altInput.placeholder = `Mínimo ${minDays} días de antelación`;
            }
        });

        console.log(`✅ Flatpickr inicializado (mínimo ${minDays} días)`);
        return fp;
    }

    // ============================
    // GESTIÓN DE NODOS DE TRANSPORTE
    // ============================

    /**
     * Agrega un nodo a la lista correspondiente.
     * @param {string} role - 'departure' o 'arrival'
     * @param {Array} nodeArray - referencia al array de nodos seleccionados
     * @param {string} selectId - ID del <select> de nodos
     * @param {Array} catalogNodes - catálogo completo de nodos
     * @param {Function} renderCallback - función para re-renderizar después de agregar
     */
    function agregarNodo(role, nodeArray, selectId, catalogNodes, renderCallback) {
        const sel = document.getElementById(selectId);
        const nodeId = sel.value;
        if (!nodeId) return;

        if (nodeArray.find(n => n.node_id === nodeId)) {
            sel.value = '';
            return;
        }

        const node = catalogNodes.find(n => n.node_id === nodeId);
        if (node) {
            nodeArray.push(node);
            if (renderCallback) renderCallback();
        }
        sel.value = '';
    }

    /**
     * Elimina un nodo de la lista.
     * @param {string} nodeId - ID del nodo a eliminar
     * @param {Array} nodeArray - referencia al array (se filtra in-place con splice o se reemplaza)
     * @param {Function} renderCallback - función para re-renderizar
     * @returns {Array} nuevo array filtrado
     */
    function eliminarNodo(nodeId, nodeArray, renderCallback) {
        const filtered = nodeArray.filter(n => n.node_id !== nodeId);
        if (renderCallback) renderCallback();
        return filtered;
    }

    /**
     * Renderiza los badges de nodos en un contenedor.
     * @param {Array} nodes - nodos seleccionados
     * @param {string} containerId - ID del contenedor HTML
     * @param {string} role - 'departure' o 'arrival'
     * @param {Function} onRemove - callback al hacer clic en eliminar: onRemove(nodeId)
     */
    function renderNodos(nodes, containerId, role, onRemove) {
        const cssClass = role === 'arrival' ? 'arrival' : '';
        document.getElementById(containerId).innerHTML = nodes.map(n => `
            <span class="node-badge ${cssClass}">
                <i class="bi bi-geo-alt-fill"></i>${escapeHtml(n.node_name)}
                <span class="remove-node" onclick="${onRemove}('${n.node_id}')">
                    <i class="bi bi-x-circle"></i>
                </span>
            </span>
        `).join('');
    }

    // ============================
    // GESTIÓN DE ADULTOS ACOMPAÑANTES
    // ============================

    /**
     * Filtra workers disponibles y actualiza un <select>.
     * @param {Object} opts
     * @param {string} opts.searchInputId - ID del input de búsqueda
     * @param {string} opts.selectId - ID del <select> a popular
     * @param {Array} opts.selectedIds - IDs ya seleccionados
     * @param {Array} opts.catalogWorkers - catálogo de workers
     */
    function filtrarWorkers(opts) {
        const busqueda = (document.getElementById(opts.searchInputId).value || '').toLowerCase().trim();
        const sel = document.getElementById(opts.selectId);

        const disponibles = opts.catalogWorkers.filter(w => {
            if (opts.selectedIds.includes(w.worker_id)) return false;
            if (!busqueda) return true;
            const nombre = `${w.worker_first_name} ${w.worker_last_name_1} ${w.worker_last_name_2 || ''}`.toLowerCase();
            return nombre.includes(busqueda);
        });

        sel.innerHTML = disponibles.map(w => {
            const name = `${w.worker_last_name_1}${w.worker_last_name_2 ? ' ' + w.worker_last_name_2 : ''}, ${w.worker_first_name}`;
            return `<option value="${w.worker_id}">${name}</option>`;
        }).join('');

        sel.style.display = busqueda && disponibles.length > 0 ? '' : 'none';
    }

    /**
     * Agrega un adulto desde el select al array de seleccionados.
     * @param {Object} opts
     * @param {string} opts.selectId - ID del <select>
     * @param {Array} opts.selectedIds - referencia al array de IDs seleccionados
     * @param {Function} opts.onChanged - callback después de agregar
     * @returns {Array} array actualizado
     */
    function agregarAdulto(opts) {
        const sel = document.getElementById(opts.selectId);
        const workerId = sel.value;
        if (!workerId || opts.selectedIds.includes(workerId)) return opts.selectedIds;

        opts.selectedIds.push(workerId);
        if (opts.onChanged) opts.onChanged();
        return opts.selectedIds;
    }

    /**
     * Remueve un adulto del array.
     * @param {string} workerId
     * @param {Array} selectedIds
     * @param {Function} onChanged
     * @returns {Array} array filtrado
     */
    function removerAdulto(workerId, selectedIds, onChanged) {
        const filtered = selectedIds.filter(id => id !== workerId);
        if (onChanged) onChanged();
        return filtered;
    }

    /**
     * Renderiza los badges de adultos seleccionados.
     * @param {Object} opts
     * @param {Array} opts.selectedIds - IDs seleccionados
     * @param {Array} opts.catalogWorkers - catálogo completo
     * @param {string} opts.badgesContainerId - ID del contenedor de badges
     * @param {string} opts.countBadgeId - ID del badge contador
     * @param {string} opts.onRemoveFn - nombre de la función global para remover (ej: 'removerAdultoDeportivas')
     */
    function renderBadgesAdultos(opts) {
        const container = document.getElementById(opts.badgesContainerId);
        container.innerHTML = opts.selectedIds.map(wId => {
            const w = opts.catalogWorkers.find(cw => cw.worker_id === wId);
            const name = w ? `${w.worker_first_name} ${w.worker_last_name_1}` : 'N/A';
            return `<span class="badge bg-primary p-2">
                <i class="bi bi-person-fill me-1"></i>${escapeHtml(name)}
                <i class="bi bi-x-circle ms-1" style="cursor:pointer" onclick="${opts.onRemoveFn}('${wId}')"></i>
            </span>`;
        }).join('');

        const count = opts.selectedIds.length;
        document.getElementById(opts.countBadgeId).textContent =
            `${count} adulto${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}`;
    }

    // ============================
    // CÁLCULO DE TRANSPORTE (FRONTEND)
    // ============================

    /**
     * Calcula costo de transporte basado en tarifas y participantes.
     * Usado por Deportivas y Representación (Pedagógicas usa RPC backend).
     * @param {Object} opts
     * @param {string} opts.destinationId - UUID del destino
     * @param {number} opts.totalParticipants - estudiantes + adultos
     * @param {string} opts.modality - 'outbound', 'return' o 'round_trip'
     * @param {Array} opts.catalogRates - catálogo de tarifas
     * @returns {Object} { rate, capacity, count, total }
     */
    function calcularCostoTransporte(opts) {
        const { destinationId, totalParticipants, modality, catalogRates } = opts;

        if (!destinationId || totalParticipants === 0) {
            return { rate: 0, capacity: 0, count: 0, total: 0 };
        }

        const destRates = catalogRates
            .filter(r => r.destination_id === destinationId)
            .sort((a, b) => a.min_capacity - b.min_capacity);

        if (destRates.length === 0) {
            return { rate: 0, capacity: 0, count: 0, total: 0 };
        }

        let bestRate = null;
        let vehicleCount = 0;

        for (const rate of destRates) {
            const capacity = rate.max_capacity;
            const needed = Math.ceil(totalParticipants / capacity);
            if (!bestRate || needed * rate.rate_value < vehicleCount * bestRate.rate_value) {
                bestRate = rate;
                vehicleCount = needed;
            }
        }

        if (!bestRate) {
            bestRate = destRates[destRates.length - 1];
            vehicleCount = Math.ceil(totalParticipants / bestRate.max_capacity);
        }

        const multiplier = modality === 'round_trip' ? 2 : 1;
        const totalCost = vehicleCount * bestRate.rate_value * multiplier;

        return {
            rate: bestRate.rate_value,
            capacity: bestRate.max_capacity,
            count: vehicleCount,
            total: totalCost
        };
    }

    // ============================
    // LÓGICA DE CATERING (REFRIGERIOS)
    // ============================

    /**
     * Llena un <select> con los menús de catering.
     * @param {string} selectId - ID del <select>
     * @param {Array} catalogMenus - catálogo de menús
     */
    function populateMenus(selectId, catalogMenus) {
        const sel = document.getElementById(selectId);
        sel.innerHTML = '<option value="">Seleccione un menú</option>';
        catalogMenus.forEach(m => {
            sel.innerHTML += `<option value="${m.menu_id}" data-price="${m.unit_price}">${m.menu_name} — $${formatNumber(m.unit_price)}</option>`;
        });
    }

    /**
     * Calcula y retorna datos de catering.
     * @param {Object} opts
     * @param {string} opts.checkboxId - ID del checkbox "incluir catering"
     * @param {string} opts.menuSelectId - ID del <select> de menús
     * @param {string} opts.quantityInputId - ID del input de cantidad
     * @returns {Object} { included, menuId, menuName, quantity, unitPrice, total }
     */
    function getCateringData(opts) {
        const checked = document.getElementById(opts.checkboxId).checked;
        if (!checked) {
            return { included: false, menuId: null, menuName: '', quantity: 0, unitPrice: 0, total: 0 };
        }

        const menuSel = document.getElementById(opts.menuSelectId);
        const qty = parseInt(document.getElementById(opts.quantityInputId).value) || 0;
        const unitPrice = menuSel.value
            ? parseFloat(menuSel.selectedOptions[0].getAttribute('data-price')) || 0
            : 0;

        return {
            included: true,
            menuId: menuSel.value || null,
            menuName: menuSel.selectedOptions[0]?.text || '',
            quantity: qty,
            unitPrice: unitPrice,
            total: unitPrice * qty
        };
    }

    /**
     * Actualiza la vista previa de costos de catering.
     * @param {Object} opts
     * @param {string} opts.menuSelectId
     * @param {string} opts.quantityInputId
     * @param {string} opts.unitPriceId - ID del elemento para precio unitario
     * @param {string} opts.qtyDisplayId - ID del elemento para mostrar cantidad
     * @param {string} opts.totalId - ID del elemento para total
     * @param {string} opts.previewContainerId - ID del contenedor de preview
     */
    function updateCateringPreview(opts) {
        const menuSel = document.getElementById(opts.menuSelectId);
        const qty = parseInt(document.getElementById(opts.quantityInputId).value) || 0;

        if (!menuSel.value || qty <= 0) {
            document.getElementById(opts.previewContainerId).style.display = 'none';
            return;
        }

        const unitPrice = parseFloat(menuSel.selectedOptions[0].getAttribute('data-price')) || 0;
        const total = unitPrice * qty;

        document.getElementById(opts.unitPriceId).textContent = '$' + formatNumber(unitPrice);
        document.getElementById(opts.qtyDisplayId).textContent = qty + ' porciones';
        document.getElementById(opts.totalId).textContent = '$' + formatNumber(total);
        document.getElementById(opts.previewContainerId).style.display = '';
    }

    // ============================
    // WIZARD UI NAVIGATION
    // ============================

    /**
     * Actualiza la UI del wizard (pasos, conectores, paneles, botones).
     * @param {Object} opts
     * @param {number} opts.currentStep
     * @param {number} opts.totalSteps
     * @param {string} opts.prevBtnId
     * @param {string} opts.nextBtnId
     * @param {string} opts.submitBtnId
     */
    function updateWizardUI(opts) {
        const { currentStep, totalSteps } = opts;

        document.querySelectorAll('.wizard-step').forEach(el => {
            const step = parseInt(el.dataset.step);
            el.classList.remove('active', 'completed');
            if (step === currentStep) el.classList.add('active');
            else if (step < currentStep) el.classList.add('completed');
        });

        document.querySelectorAll('.wizard-connector').forEach((el, i) => {
            el.classList.toggle('active', i + 1 < currentStep);
        });

        document.querySelectorAll('.wizard-panel').forEach((el, i) => {
            el.classList.toggle('active', i + 1 === currentStep);
        });

        document.getElementById(opts.prevBtnId).classList.toggle('d-none', currentStep === 1);
        document.getElementById(opts.nextBtnId).classList.toggle('d-none', currentStep === totalSteps);
        document.getElementById(opts.submitBtnId).classList.toggle('d-none', currentStep !== totalSteps);
    }

    // ============================
    // POPULATE SELECTS COMUNES
    // ============================

    function populateDestinations(selectId, catalogDestinations) {
        const sel = document.getElementById(selectId);
        sel.innerHTML = '<option value="">Seleccionar destino...</option>';
        catalogDestinations.forEach(d => {
            sel.innerHTML += `<option value="${d.destination_id}">${d.destination_name}</option>`;
        });
    }

    function populateNodes(departureSelectId, arrivalSelectId, catalogNodes) {
        const optionsHtml = catalogNodes.map(n =>
            `<option value="${n.node_id}">${n.node_name}</option>`
        ).join('');
        document.getElementById(departureSelectId).innerHTML =
            '<option value="">Agregar nodo de salida...</option>' + optionsHtml;
        document.getElementById(arrivalSelectId).innerHTML =
            '<option value="">Agregar nodo de llegada...</option>' + optionsHtml;
    }

    function populateApprovers(selectId, catalogApprovers) {
        const sel = document.getElementById(selectId);
        sel.innerHTML = '<option value="">Seleccionar quien aprueba...</option>';
        const ordenados = [...catalogApprovers].sort((a, b) =>
            (a.worker_last_name_1 || '').localeCompare(b.worker_last_name_1 || '')
        );
        ordenados.forEach(w => {
            const name = `${w.worker_last_name_1}${w.worker_last_name_2 ? ' ' + w.worker_last_name_2 : ''}, ${w.worker_first_name}`;
            sel.innerHTML += `<option value="${w.worker_id}">${name}</option>`;
        });
    }

    /**
     * Controla visibilidad de secciones de nodos según modalidad.
     * @param {string} modality - 'outbound', 'return' o 'round_trip'
     * @param {Object} ids - { departureSectionId, arrivalSectionId, departureListId, arrivalListId }
     * @returns {Object} { showDeparture, showArrival }
     */
    function updateNodeSectionsVisibility(modality, ids) {
        const showDeparture = modality === 'outbound' || modality === 'round_trip';
        const showArrival = modality === 'return' || modality === 'round_trip';

        document.getElementById(ids.departureSectionId).style.display = showDeparture ? '' : 'none';
        document.getElementById(ids.arrivalSectionId).style.display = showArrival ? '' : 'none';

        if (!showDeparture) document.getElementById(ids.departureListId).innerHTML = '';
        if (!showArrival) document.getElementById(ids.arrivalListId).innerHTML = '';

        return { showDeparture, showArrival };
    }

    // ============================
    // TRANSICIONES AUTOMÁTICAS DE ESTADO
    // ============================

    /**
     * Actualiza el estado de un trip en la BD.
     * @param {string} table - nombre de la tabla (ej: 'svc_sports_trips')
     * @param {string} pkField - nombre del campo PK (ej: 'trip_id')
     * @param {string} tripId - UUID del trip
     * @param {string} newStatus - nuevo estado
     * @param {string|null} reason - razón del cambio (opcional)
     */
    async function updateTripStatus(table, pkField, tripId, newStatus, reason = null) {
        try {
            const body = { trip_status: newStatus };
            if (reason) body.status_reason = reason;
            await supabaseRequest(`/${table}?${pkField}=eq.${tripId}`, {
                method: 'PATCH',
                body: JSON.stringify(body)
            });
        } catch (e) {
            console.error('Error updating status:', e);
        }
    }

    /**
     * Revisa y aplica transiciones automáticas (scheduled→imminent, in_progress→completed).
     * @param {Array} trips - array de trips con trip_date, trip_status y svc_service_requests
     * @param {string} table - nombre de la tabla
     * @param {string} pkField - campo PK
     * @param {Object} moduleConfig - configuración del módulo
     */
    async function checkAutoStatusTransitions(trips, table, pkField, moduleConfig) {
        const today = getCurrentDateColombia();
        const daysImminent = parseInt(moduleConfig['days_before_imminent'] || '3');

        for (const trip of trips) {
            const tripDate = trip.trip_date;
            const daysUntil = daysBetween(today, tripDate);
            const isApproved = trip.svc_service_requests &&
                               trip.svc_service_requests.request_status === 'approved';

            // Scheduled → Imminent
            if (trip.trip_status === 'scheduled' && daysUntil <= daysImminent && daysUntil >= 0 && isApproved) {
                await updateTripStatus(table, pkField, trip[pkField], 'imminent');
                trip.trip_status = 'imminent';
            }

            // In Progress → Completed
            if (trip.trip_status === 'in_progress' && daysUntil < 0) {
                await updateTripStatus(table, pkField, trip[pkField], 'completed');
                trip.trip_status = 'completed';
            }
        }
    }

    // ============================
    // BADGES DE ESTADO Y APROBACIÓN
    // ============================

    /**
     * Genera HTML de badge de estado del trip.
     * @param {string} status - estado del trip
     * @returns {string} HTML del badge
     */
    function statusBadgeHtml(status) {
        const label = STATUS_LABELS[status] || status;
        const icon = STATUS_ICONS[status] || 'bi-circle';
        return `<span class="badge badge-${status}"><i class="bi ${icon} me-1"></i>${label}</span>`;
    }

    /**
     * Genera HTML de badge de aprobación.
     * @param {Object|null} request - objeto svc_service_requests
     * @returns {string} HTML del badge (puede ser vacío)
     */
    function approvalBadgeHtml(request) {
        if (!request) return '';
        const map = {
            pending: { css: 'bg-warning text-dark', icon: 'bi-hourglass-split', title: 'Pendiente de aprobación' },
            rejected: { css: 'bg-danger', icon: 'bi-x-lg', title: 'Rechazada' },
            approved: { css: 'bg-success', icon: 'bi-check-lg', title: 'Aprobada' }
        };
        const cfg = map[request.request_status];
        if (!cfg) return '';
        return `<span class="badge ${cfg.css} ms-1" title="${cfg.title}"><i class="bi ${cfg.icon}"></i></span>`;
    }

    /**
     * Genera la sección HTML de estado de aprobación para el detalle.
     * @param {Object|null} request
     * @returns {string} HTML
     */
    function approvalDetailHtml(request) {
        if (!request) return '';
        const badge = request.request_status === 'approved' ? 'bg-success'
            : request.request_status === 'rejected' ? 'bg-danger'
            : 'bg-warning text-dark';
        return `
            <div class="detail-section">
                <h6><i class="bi bi-check-square me-1"></i>Estado de Aprobación</h6>
                <span class="badge ${badge}">${APPROVAL_LABELS[request.request_status]}</span>
                ${request.rejection_reason ? `<p class="text-danger mt-1 mb-0"><small>${escapeHtml(request.rejection_reason)}</small></p>` : ''}
            </div>`;
    }

    // ============================
    // RESUMEN DE COSTOS (SUMMARY)
    // ============================

    /**
     * Genera HTML del resumen de costos consolidado.
     * @param {number} transportTotal
     * @param {number} cateringTotal
     * @param {number} [entranceTotal=0] - solo para pedagógicas
     * @returns {string} HTML
     */
    function costSummaryHtml(transportTotal, cateringTotal, entranceTotal = 0) {
        const gran = transportTotal + cateringTotal + entranceTotal;
        let cols = `
            <div class="col-md-4"><div class="detail-label">Transporte</div><div class="detail-value">$${formatNumber(transportTotal)}</div></div>
            <div class="col-md-4"><div class="detail-label">Refrigerios</div><div class="detail-value">$${formatNumber(cateringTotal)}</div></div>`;

        if (entranceTotal > 0) {
            cols = `
            <div class="col-md-3"><div class="detail-label">Transporte</div><div class="detail-value">$${formatNumber(transportTotal)}</div></div>
            <div class="col-md-3"><div class="detail-label">Refrigerios</div><div class="detail-value">$${formatNumber(cateringTotal)}</div></div>
            <div class="col-md-3"><div class="detail-label">Entradas</div><div class="detail-value">$${formatNumber(entranceTotal)}</div></div>`;
        }

        const totalCol = entranceTotal > 0 ? 'col-md-3' : 'col-md-4';
        return `
            <div class="cost-summary">
                <div class="row">
                    ${cols}
                    <div class="${totalCol}"><div class="detail-label">TOTAL</div><div class="cost-total">$${formatNumber(gran)}</div></div>
                </div>
            </div>`;
    }

    // ============================
    // NOTIFICACIONES
    // ============================

    /**
     * Envía notificación al aprobador.
     * @param {Object} opts
     * @param {string} opts.approverId - UUID del worker aprobador
     * @param {string} opts.tripName - nombre de la salida
     * @param {string} opts.tripDate - fecha formateada para mostrar
     * @param {string} opts.senderName - nombre del solicitante
     * @param {string} opts.moduleIcon - emoji del módulo (ej: '🏟️', '🎭', '🚌')
     * @param {string} opts.moduleTitle - título (ej: 'Salida Deportiva', 'Salida Pedagógica')
     */
    async function notifyApprover(opts) {
        try {
            const approverData = await supabaseRequest(
                `/workers?select=email,worker_first_name&worker_id=eq.${opts.approverId}`
            );
            if (!approverData || !approverData.length || !approverData[0].email) return;

            const html = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                    <div style="background:#0d6efd;color:white;padding:15px;border-radius:8px 8px 0 0;">
                        <h2 style="margin:0;">${opts.moduleIcon} Nueva Solicitud de ${opts.moduleTitle}</h2>
                    </div>
                    <div style="background:white;padding:20px;border:1px solid #dee2e6;border-radius:0 0 8px 8px;">
                        <p>Hola ${approverData[0].worker_first_name},</p>
                        <p><strong>${escapeHtml(opts.senderName)}</strong> ha solicitado la aprobación de una ${opts.moduleTitle.toLowerCase()}:</p>
                        <table style="width:100%;border-collapse:collapse;margin:15px 0;">
                            <tr><td style="padding:8px;border:1px solid #dee2e6;font-weight:bold;">Salida:</td><td style="padding:8px;border:1px solid #dee2e6;">${escapeHtml(opts.tripName)}</td></tr>
                            <tr><td style="padding:8px;border:1px solid #dee2e6;font-weight:bold;">Fecha:</td><td style="padding:8px;border:1px solid #dee2e6;">${opts.tripDate}</td></tr>
                        </table>
                        <p>Por favor, ingresa a SchoolNet para revisar y aprobar o rechazar esta solicitud.</p>
                    </div>
                    <p style="color:#6c757d;font-size:12px;text-align:center;margin-top:15px;">
                        Correo automático de SchoolNet - No responder
                    </p>
                </div>`;

            await sendNotification(
                approverData[0].email,
                `SchoolNet - Solicitud: ${opts.tripName}`,
                html
            );
        } catch (e) {
            console.error('Error notifying approver:', e);
        }
    }

    /**
     * Envía notificación a destinatarios fijos (chef, supervisora).
     * @param {Object} opts
     * @param {string} opts.tripName
     * @param {string} opts.tripDate
     * @param {string} opts.senderName
     * @param {string} opts.moduleTitle - ej: 'Salida Deportiva'
     * @param {string} opts.emailChef
     * @param {string} opts.emailSupervisor
     * @param {number} opts.plannedStudents
     * @param {number} opts.numAdults
     * @param {Object} [opts.extraRows] - filas adicionales para la tabla { label: value } (ej: equipo, grados)
     */
    async function notifyFixedRecipients(opts) {
        try {
            const buildHTML = (destinatario) => {
                let extraRowsHtml = '';
                if (opts.extraRows) {
                    for (const [label, value] of Object.entries(opts.extraRows)) {
                        extraRowsHtml += `<tr><td style="padding:8px 0;color:#666;font-weight:bold;">${escapeHtml(label)}:</td><td style="padding:8px 0;color:#333;">${escapeHtml(value)}</td></tr>`;
                    }
                }

                return `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f5f5f5;">
                    <div style="background-color:#1b365d;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
                        <h1 style="margin:0;font-size:22px;">Notificación de ${opts.moduleTitle}</h1>
                    </div>
                    <div style="background-color:white;padding:30px;border-radius:0 0 8px 8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        <p style="font-size:16px;color:#333;">Estimado/a <strong>${destinatario}</strong>,</p>
                        <p style="font-size:14px;color:#666;">Se ha registrado una nueva ${opts.moduleTitle.toLowerCase()}:</p>
                        <div style="background-color:#f8f9fa;padding:20px;border-radius:6px;margin:20px 0;">
                            <table style="width:100%;border-collapse:collapse;">
                                <tr><td style="padding:8px 0;color:#666;font-weight:bold;">Salida:</td><td style="padding:8px 0;color:#333;">${escapeHtml(opts.tripName)}</td></tr>
                                ${extraRowsHtml}
                                <tr><td style="padding:8px 0;color:#666;font-weight:bold;">Fecha:</td><td style="padding:8px 0;color:#333;">${opts.tripDate}</td></tr>
                                <tr><td style="padding:8px 0;color:#666;font-weight:bold;">Estudiantes:</td><td style="padding:8px 0;color:#333;">${opts.plannedStudents}</td></tr>
                                <tr><td style="padding:8px 0;color:#666;font-weight:bold;">Adultos:</td><td style="padding:8px 0;color:#333;">${opts.numAdults}</td></tr>
                                <tr><td style="padding:8px 0;color:#666;font-weight:bold;">Solicitado por:</td><td style="padding:8px 0;color:#333;">${escapeHtml(opts.senderName)}</td></tr>
                            </table>
                        </div>
                        <p style="font-size:12px;color:#999;margin-top:30px;padding-top:20px;border-top:1px solid #dee2e6;text-align:center;">
                            Este es un mensaje automático del sistema SchoolNet.<br>Por favor, no responder a este correo.
                        </p>
                    </div>
                </div>`;
            };

            const asunto = `${opts.moduleTitle} programada — ${opts.tripName} — ${opts.tripDate}`;
            const destinatarios = [
                { email: opts.emailChef, label: 'Chef' },
                { email: opts.emailSupervisor, label: 'Supervisora' }
            ];

            for (const dest of destinatarios) {
                if (dest.email) {
                    await sendNotification(dest.email, asunto, buildHTML(dest.label), true);
                    console.log(`✅ Notificación enviada a ${dest.label}: ${dest.email}`);
                } else {
                    console.warn(`⚠️ No hay email configurado para ${dest.label}`);
                }
            }
        } catch (error) {
            console.error('❌ Error enviando notificaciones fijas:', error);
        }
    }

    // ============================
    // GENERACIÓN DE PDF — BASE COMÚN
    // ============================

    /**
     * Carga jsPDF + autoTable dinámicamente si no están disponibles.
     * @returns {Promise<void>}
     */
    async function loadJsPDF() {
        if (window.jspdf) return;
        await new Promise((resolve, reject) => {
            const s1 = document.createElement('script');
            s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s1.onload = () => {
                const s2 = document.createElement('script');
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
                s2.onload = resolve;
                s2.onerror = reject;
                document.head.appendChild(s2);
            };
            s1.onerror = reject;
            document.head.appendChild(s1);
        });
    }

    /**
     * Carga una imagen como base64 con manejo de CORS.
     * @param {string} url
     * @returns {Promise<string|null>} data URL o null
     */
    function cargarImagenBase64(url) {
        return new Promise((resolve) => {
            if (!url) { resolve(null); return; }
            const tryLoad = (useCors) => {
                const img = new Image();
                if (useCors) img.crossOrigin = 'anonymous';
                img.onload = function() {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        canvas.getContext('2d').drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } catch (e) {
                        if (useCors) { tryLoad(false); }
                        else { resolve(null); }
                    }
                };
                img.onerror = () => {
                    if (useCors) { tryLoad(false); }
                    else { resolve(null); }
                };
                img.src = url;
            };
            tryLoad(true);
        });
    }

    /**
     * Carga la configuración del sistema para PDFs (logo, firma, nombre rector, año).
     * @returns {Promise<Object>}
     */
    async function loadPdfSystemConfig() {
        const configArr = await supabaseRequest(
            `/system_config?select=organization_name,logo_url,principal_name,principal_signature_url,academic_year:academic_years!system_config_current_academic_year_fkey(year_name)`
        );
        const config = (configArr && configArr.length > 0) ? configArr[0] : {};
        const [logoBase64, firmaBase64] = await Promise.all([
            cargarImagenBase64(config.logo_url),
            cargarImagenBase64(config.principal_signature_url)
        ]);

        return {
            organizationName: config.organization_name || '',
            principalName: config.principal_name || 'RECTOR',
            yearName: config.academic_year?.year_name || `${new Date().getFullYear()}`,
            logoBase64,
            firmaBase64
        };
    }

    /**
     * Genera el encabezado estándar del PDF.
     * @param {jsPDF} doc
     * @param {Object} sysConfig - de loadPdfSystemConfig()
     * @param {string} pdfTitle - ej: 'SALIDAS DEPORTIVAS'
     * @param {number} margin
     * @param {number} pageWidth
     * @returns {number} nueva posición Y
     */
    function pdfEncabezado(doc, sysConfig, pdfTitle, margin, pageWidth) {
        let y = 15;
        const azulOscuro = [27, 54, 93];

        if (sysConfig.logoBase64) {
            try { doc.addImage(sysConfig.logoBase64, 'PNG', margin, y, 30, 30); } catch (e) {}
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...azulOscuro);
        doc.text(`${pdfTitle} ${sysConfig.yearName}`, pageWidth / 2, y + 12, { align: 'center' });
        return y + 35;
    }

    /**
     * Genera la tabla de información institucional + datos del trip.
     * @param {jsPDF} doc
     * @param {number} y - posición Y actual
     * @param {number} margin
     * @param {number} contentWidth
     * @param {Array} rows - cada fila es un array de celdas: [{ text, width }]
     *                       width es proporcional (0.0 a 1.0)
     * @returns {number} nueva posición Y
     */
    function pdfInfoTable(doc, y, margin, contentWidth, rows) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const rowHeight = 7;

        rows.forEach(row => {
            doc.rect(margin, y, contentWidth, rowHeight);
            let xOffset = margin;
            row.forEach((cell, idx) => {
                const cellWidth = contentWidth * cell.width;
                if (idx > 0) doc.rect(xOffset, y, cellWidth, rowHeight);
                doc.setFont('helvetica', cell.bold ? 'bold' : 'normal');
                doc.text(cell.text || '', xOffset + 2, y + 5);
                xOffset += cellWidth;
            });
            y += rowHeight;
        });

        return y;
    }

    /**
     * Genera tabla de estudiantes en el PDF con autoTable.
     * @param {jsPDF} doc
     * @param {number} y
     * @param {number} margin
     * @param {Array} estudiantes - con datos de students anidados
     * @returns {number} nueva Y después de la tabla
     */
    function pdfTablaEstudiantes(doc, y, margin, estudiantes) {
        const headers = [['No.', 'ESTUDIANTE', 'TIPO DE\nDOCUMENTO', 'DOCUMENTO DE\nIDENTIDAD', 'EDAD', 'EPS', 'GRADO']];
        const grisClaro = [240, 240, 240];
        const negro = [0, 0, 0];

        const rows = estudiantes.map((est, idx) => {
            const s = est.students || est;
            const nombre = `${s.student_last_name_1 || ''}${s.student_last_name_2 ? ' ' + s.student_last_name_2 : ''}, ${s.student_first_name || ''}`;
            const tipoDoc = s.document_type?.document_type_abbr || '';
            const numDoc = s.student_id_document || '';
            const edad = calcularEdad(s.student_birthday);
            const eps = s.eps?.eps_name || '';
            const grado = s.course?.course_name || '';
            return [idx + 1, nombre, tipoDoc, numDoc, edad, eps, grado];
        });

        doc.autoTable({
            startY: y,
            head: headers,
            body: rows,
            theme: 'grid',
            margin: { left: margin, right: margin },
            styles: { fontSize: 7, cellPadding: 1.5, lineColor: [180, 180, 180], lineWidth: 0.2, textColor: negro },
            headStyles: { fillColor: grisClaro, textColor: negro, fontStyle: 'bold', halign: 'center', fontSize: 7 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 55 },
                2: { halign: 'center', cellWidth: 22 },
                3: { halign: 'center', cellWidth: 28 },
                4: { halign: 'center', cellWidth: 12 },
                5: { cellWidth: 30 },
                6: { cellWidth: 29 }
            }
        });

        return doc.lastAutoTable.finalY + 8;
    }

    /**
     * Genera tabla de adultos acompañantes en el PDF.
     * @param {jsPDF} doc
     * @param {number} y
     * @param {number} margin
     * @param {number} pageWidth
     * @param {Array} adultos - con datos de workers anidados
     * @returns {number} nueva Y
     */
    function pdfTablaAdultos(doc, y, margin, pageWidth, adultos) {
        if (y + 40 > 270) { doc.addPage(); y = 15; }

        const negro = [0, 0, 0];
        const grisClaro = [240, 240, 240];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...negro);
        doc.text('ADULTOS ACOMPAÑANTES', pageWidth / 2, y, { align: 'center' });
        y += 5;

        const headers = [['No.', 'NOMBRE', 'TIPO DE\nDOCUMENTO', 'DOCUMENTO DE\nIDENTIDAD', 'CELULAR', 'EPS']];
        const rows = adultos.map((prof, idx) => {
            const w = prof.workers || prof;
            const nombre = `${w.worker_first_name || ''} ${w.worker_last_name_1 || ''}${w.worker_last_name_2 ? ' ' + w.worker_last_name_2 : ''}`;
            const tipoDoc = w.document_type?.document_type_abbr || 'c.c.';
            const numDoc = w.worker_id_doc || '';
            const celular = w.worker_phone || '';
            const eps = w.eps?.eps_name || '';
            return [idx + 1, nombre, tipoDoc, numDoc, celular, eps];
        });

        doc.autoTable({
            startY: y,
            head: headers,
            body: rows,
            theme: 'grid',
            margin: { left: margin, right: margin },
            styles: { fontSize: 7, cellPadding: 1.5, lineColor: [180, 180, 180], lineWidth: 0.2, textColor: negro },
            headStyles: { fillColor: grisClaro, textColor: negro, fontStyle: 'bold', halign: 'center', fontSize: 7 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 50 },
                2: { halign: 'center', cellWidth: 22 },
                3: { halign: 'center', cellWidth: 35 },
                4: { halign: 'center', cellWidth: 25 },
                5: { cellWidth: 44 }
            }
        });

        return doc.lastAutoTable.finalY + 15;
    }

    /**
     * Genera firma del rector + pie de página en todas las páginas.
     * @param {jsPDF} doc
     * @param {number} y
     * @param {number} margin
     * @param {number} pageWidth
     * @param {Object} sysConfig
     */
    function pdfFirmaYPie(doc, y, margin, pageWidth, sysConfig) {
        if (y + 45 > 270) { doc.addPage(); y = 15; }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Aprobó:', margin, y);
        y += 5;

        if (sysConfig.firmaBase64) {
            try { doc.addImage(sysConfig.firmaBase64, 'PNG', margin, y, 40, 20); } catch (e) {}
        }
        y += 22;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(sysConfig.principalName.toUpperCase(), margin, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('RECTOR', margin, y);

        if (sysConfig.logoBase64) {
            try { doc.addImage(sysConfig.logoBase64, 'PNG', pageWidth / 2 - 10, y - 22, 20, 20); } catch (e) {}
        }

        // Pie de página en todas las páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Documento generado por SchoolNet — Colegio Tilatá — Página ${i} de ${totalPages}`,
                pageWidth / 2, 275, { align: 'center' }
            );
        }
    }

    // ============================
    // HELPER: NOMBRE COMPLETO DE WORKER
    // ============================
    function workerFullName(worker) {
        if (!worker) return 'N/A';
        return `${worker.worker_first_name} ${worker.worker_last_name_1}${worker.worker_last_name_2 ? ' ' + worker.worker_last_name_2 : ''}`;
    }

    // ============================
    // EXPORT PÚBLICO
    // ============================
    return {
        // Constantes
        STATUS_LABELS,
        STATUS_ICONS,
        MODALITY_LABELS,
        APPROVAL_LABELS,
        PERM_RESOLUCION_ID,

        // Utilidades
        formatNumber,
        formatDateDisplay,
        escapeHtml,
        formatDateForDatabase,
        getCurrentDateColombia,
        formatearHora12,
        calcularEdad,
        daysBetween,
        workerFullName,

        // Sesión
        loadCurrentWorker,

        // Catálogos
        loadApprovers,
        loadCommonCatalogs,

        // Flatpickr
        initializeFlatpickr,

        // Nodos
        agregarNodo,
        eliminarNodo,
        renderNodos,

        // Adultos
        filtrarWorkers,
        agregarAdulto,
        removerAdulto,
        renderBadgesAdultos,

        // Transporte
        calcularCostoTransporte,

        // Catering
        populateMenus,
        getCateringData,
        updateCateringPreview,

        // Wizard
        updateWizardUI,

        // Populate selects
        populateDestinations,
        populateNodes,
        populateApprovers,
        updateNodeSectionsVisibility,

        // Estados
        updateTripStatus,
        checkAutoStatusTransitions,
        statusBadgeHtml,
        approvalBadgeHtml,
        approvalDetailHtml,
        costSummaryHtml,

        // Notificaciones
        notifyApprover,
        notifyFixedRecipients,

        // PDF
        loadJsPDF,
        cargarImagenBase64,
        loadPdfSystemConfig,
        pdfEncabezado,
        pdfInfoTable,
        pdfTablaEstudiantes,
        pdfTablaAdultos,
        pdfFirmaYPie
    };

})();
