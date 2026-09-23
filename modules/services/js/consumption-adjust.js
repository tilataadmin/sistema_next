/**
 * ============================================================
 * SchoolNet — Ajuste de consumos reales en servicios
 * Archivo: js/consumption-adjust.js
 * ------------------------------------------------------------
 * Módulo compartido por:
 *   pedagogical-trips.html, sports-trips.html, rep-trips.html,
 *   internal-events.html, admissions-family.html
 *
 * Depende de config.js: supabaseRequest, checkUserPermission,
 * showMessage, sendNotification. Requiere Bootstrap 5.
 *
 * Backend:
 *   RPC  public.adjust_service_consumption(...)
 *   RPC  public.svc_adjustment_deadline(p_service_date)
 *   Tabla svc_consumption_adjustments (bitácora)
 * ============================================================
 */
(function () {
    'use strict';

    const PERMISSION_NAME = 'Ajustar consumos de servicios';
    const MODAL_ID = 'modalAjusteConsumo';

    const CONCEPT_LABELS = {
        catering: 'Refrigerio',
        entrance_students: 'Entradas estudiantes',
        entrance_adults: 'Entradas adultos',
        snack: 'Refrigerios',
        lunch: 'Almuerzos'
    };

    const SERVICE_LABELS = {
        pedagogical_trip: 'Salida pedagógica',
        sports_trip: 'Salida deportiva',
        rep_trip: 'Salida de representación',
        internal_event: 'Evento interno',
        admissions_family: 'Atención familias admisiones'
    };

    let _permissionCache = {};      // userId -> boolean
    let _deadlineCache = {};        // 'YYYY-MM-DD' -> 'YYYY-MM-DD'
    let _state = null;              // estado del modal abierto

    // ==================== Utilidades ====================

    function formatCOP(value) {
        const n = Math.round(Number(value) || 0);
        const sign = n < 0 ? '-' : '';
        return sign + '$' + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function formatSignedCOP(value) {
        const n = Math.round(Number(value) || 0);
        if (n > 0) return '+' + formatCOP(n);
        return formatCOP(n);
    }

    // 'YYYY-MM-DD' -> 'DD/MM/YYYY' sin pasar por Date (evita desfase UTC)
    function formatDate(isoDate) {
        if (!isoDate) return '';
        const [y, m, d] = String(isoDate).substring(0, 10).split('-');
        return `${d}/${m}/${y}`;
    }

    function escapeHtml(text) {
        return String(text ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Fecha de hoy en Bogotá como 'YYYY-MM-DD'
    function todayBogota() {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date());
    }

    // ==================== Permiso y ventana ====================

    async function hasPermission(userId) {
        if (!userId) return false;
        if (_permissionCache[userId] !== undefined) return _permissionCache[userId];
        try {
            _permissionCache[userId] = await checkUserPermission(userId, PERMISSION_NAME);
        } catch (e) {
            console.warn('⚠️ ConsumptionAdjust: error verificando permiso', e);
            _permissionCache[userId] = false;
        }
        return _permissionCache[userId];
    }

    async function getDeadline(serviceDate) {
        if (!serviceDate) return null;
        const key = String(serviceDate).substring(0, 10);
        if (_deadlineCache[key]) return _deadlineCache[key];
        const result = await supabaseRequest('/rpc/svc_adjustment_deadline', {
            method: 'POST',
            body: JSON.stringify({ p_service_date: key })
        });
        const deadline = typeof result === 'string' ? result : (Array.isArray(result) ? result[0] : null);
        if (deadline) _deadlineCache[key] = String(deadline).substring(0, 10);
        return _deadlineCache[key] || null;
    }

    /**
     * Determina si se puede mostrar el botón de ajuste.
     * La validación definitiva la hace la RPC; esto solo controla la interfaz.
     * @param {Object} p
     * @param {string} p.userId
     * @param {string} p.serviceDate  'YYYY-MM-DD'
     * @param {boolean} p.isApproved  solicitud aprobada (admisiones: true)
     * @param {boolean} p.isClosedStatus  suspendido / cancelado
     * @returns {Promise<{allowed:boolean, deadline:string|null}>}
     */
    async function canAdjust({ userId, serviceDate, isApproved, isClosedStatus }) {
        if (!isApproved || isClosedStatus) return { allowed: false, deadline: null };
        if (!(await hasPermission(userId))) return { allowed: false, deadline: null };
        let deadline = null;
        try {
            deadline = await getDeadline(serviceDate);
        } catch (e) {
            console.warn('⚠️ ConsumptionAdjust: error obteniendo fecha límite', e);
            return { allowed: false, deadline: null };
        }
        return { allowed: !!deadline && todayBogota() <= deadline, deadline };
    }

    // ==================== Modal ====================

    function ensureModal() {
        if (document.getElementById(MODAL_ID)) return;
        const html = `
        <div class="modal fade" id="${MODAL_ID}" tabindex="-1" data-bs-backdrop="static" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-sliders me-2"></i>Ajustar consumo real</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="${MODAL_ID}_alert"></div>
                        <div class="mb-2">
                            <div class="fw-bold" id="${MODAL_ID}_title"></div>
                            <div class="small text-muted" id="${MODAL_ID}_subtitle"></div>
                        </div>
                        <div class="alert alert-info py-2 small mb-3">
                            <i class="bi bi-info-circle me-1"></i>
                            Registre la cantidad realmente entregada o consumida. La diferencia se aplica automáticamente al presupuesto con el precio unitario congelado de la solicitud.
                        </div>
                        <div class="table-responsive">
                            <table class="table table-sm align-middle mb-3">
                                <thead class="table-light">
                                    <tr>
                                        <th>Concepto</th>
                                        <th class="text-end">Precio unit.</th>
                                        <th class="text-center">Solicitado</th>
                                        <th class="text-center">Vigente</th>
                                        <th class="text-center" style="width: 110px;">Real</th>
                                        <th class="text-end">Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody id="${MODAL_ID}_rows"></tbody>
                            </table>
                        </div>
                        <div class="card bg-light mb-3">
                            <div class="card-body py-2">
                                <div class="d-flex justify-content-between"><span>Valor vigente de los conceptos:</span><span id="${MODAL_ID}_current">$0</span></div>
                                <div class="d-flex justify-content-between mt-1"><span>Valor ajustado:</span><strong id="${MODAL_ID}_adjusted">$0</strong></div>
                                <div class="d-flex justify-content-between mt-1"><span>Diferencia presupuestal:</span><strong id="${MODAL_ID}_delta">$0</strong></div>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label" for="${MODAL_ID}_reason">Motivo del ajuste <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="${MODAL_ID}_reason" rows="2" maxlength="500" placeholder="Ej.: se enviaron menos refrigerios porque faltaron estudiantes"></textarea>
                        </div>
                        <div class="small text-muted" id="${MODAL_ID}_deadline"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="${MODAL_ID}_save">
                            <i class="bi bi-check-circle me-1"></i>Guardar ajuste
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);

        document.getElementById(`${MODAL_ID}_save`).addEventListener('click', save);
        document.getElementById(MODAL_ID).addEventListener('hidden.bs.modal', () => {
            const st = _state;
            _state = null;
            if (st && typeof st.onClosed === 'function') {
                try { st.onClosed({ saved: st.saved, result: st.result }); } catch (e) { console.error(e); }
            }
        });
    }

    function showModalAlert(message, type = 'danger') {
        const el = document.getElementById(`${MODAL_ID}_alert`);
        el.innerHTML = message
            ? `<div class="alert alert-${type} py-2 small mb-3"><i class="bi bi-exclamation-triangle me-1"></i>${escapeHtml(message)}</div>`
            : '';
    }

    /**
     * Abre el modal de ajuste.
     * @param {Object} opts
     * @param {string} opts.serviceType  pedagogical_trip | sports_trip | rep_trip | internal_event | admissions_family
     * @param {string} opts.serviceId
     * @param {string} opts.userId
     * @param {string} opts.title        texto descriptivo del servicio
     * @param {string} [opts.subtitle]
     * @param {string} [opts.deadline]   'YYYY-MM-DD'
     * @param {Array}  opts.concepts     [{ concept, lineId?, label, unitPrice, requested, current, suggested? }]
     * @param {Function} [opts.onClosed] ({saved, result}) => void
     */
    function open(opts) {
        ensureModal();

        _state = {
            serviceType: opts.serviceType,
            serviceId: opts.serviceId,
            userId: opts.userId,
            title: opts.title || '',
            concepts: (opts.concepts || []).map(c => ({
                concept: c.concept,
                lineId: c.lineId || null,
                label: c.label || CONCEPT_LABELS[c.concept] || c.concept,
                unitPrice: Number(c.unitPrice) || 0,
                requested: Number(c.requested) || 0,
                current: Number(c.current) || 0,
                initial: (c.suggested !== undefined && c.suggested !== null) ? Number(c.suggested) : (Number(c.current) || 0)
            })),
            onClosed: opts.onClosed,
            saved: false,
            result: null
        };

        document.getElementById(`${MODAL_ID}_title`).textContent = opts.title || '';
        document.getElementById(`${MODAL_ID}_subtitle`).textContent = opts.subtitle || '';
        document.getElementById(`${MODAL_ID}_reason`).value = '';
        document.getElementById(`${MODAL_ID}_deadline`).innerHTML = opts.deadline
            ? `<i class="bi bi-calendar-event me-1"></i>Se puede ajustar hasta el <strong>${formatDate(opts.deadline)}</strong>.`
            : '';
        showModalAlert('');

        const tbody = document.getElementById(`${MODAL_ID}_rows`);
        tbody.innerHTML = _state.concepts.map((c, i) => `
            <tr>
                <td>${escapeHtml(c.label)}</td>
                <td class="text-end">${formatCOP(c.unitPrice)}</td>
                <td class="text-center">${c.requested}</td>
                <td class="text-center">${c.current}</td>
                <td class="text-center">
                    <input type="number" class="form-control form-control-sm text-center" min="0" step="1"
                           data-idx="${i}" value="${c.initial}">
                </td>
                <td class="text-end" id="${MODAL_ID}_d${i}">$0</td>
            </tr>`).join('');

        tbody.querySelectorAll('input[data-idx]').forEach(inp => inp.addEventListener('input', recalc));
        recalc();

        const saveBtn = document.getElementById(`${MODAL_ID}_save`);
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Guardar ajuste';

        bootstrap.Modal.getOrCreateInstance(document.getElementById(MODAL_ID)).show();
    }

    function readQuantities() {
        const out = [];
        document.querySelectorAll(`#${MODAL_ID}_rows input[data-idx]`).forEach(inp => {
            const i = parseInt(inp.dataset.idx, 10);
            const raw = inp.value.trim();
            const q = raw === '' ? NaN : Number(raw);
            out[i] = q;
        });
        return out;
    }

    function recalc() {
        if (!_state) return;
        const qs = readQuantities();
        let currentTotal = 0, adjustedTotal = 0;
        _state.concepts.forEach((c, i) => {
            const q = Number.isInteger(qs[i]) && qs[i] >= 0 ? qs[i] : c.current;
            const d = (q - c.current) * c.unitPrice;
            currentTotal += c.current * c.unitPrice;
            adjustedTotal += q * c.unitPrice;
            const cell = document.getElementById(`${MODAL_ID}_d${i}`);
            cell.textContent = formatSignedCOP(d);
            cell.className = 'text-end ' + (d > 0 ? 'text-danger fw-bold' : d < 0 ? 'text-success fw-bold' : 'text-muted');
        });
        const delta = adjustedTotal - currentTotal;
        document.getElementById(`${MODAL_ID}_current`).textContent = formatCOP(currentTotal);
        document.getElementById(`${MODAL_ID}_adjusted`).textContent = formatCOP(adjustedTotal);
        const dEl = document.getElementById(`${MODAL_ID}_delta`);
        dEl.textContent = formatSignedCOP(delta);
        dEl.className = delta > 0 ? 'text-danger' : delta < 0 ? 'text-success' : '';
    }

    async function save() {
        if (!_state) return;
        showModalAlert('');

        const qs = readQuantities();
        for (let i = 0; i < _state.concepts.length; i++) {
            if (!Number.isInteger(qs[i]) || qs[i] < 0) {
                showModalAlert(`La cantidad de "${_state.concepts[i].label}" debe ser un número entero mayor o igual a 0.`);
                return;
            }
        }

        const changed = _state.concepts.some((c, i) => qs[i] !== c.current);
        if (!changed) {
            showModalAlert('No hay cambios frente a las cantidades vigentes.', 'warning');
            return;
        }

        const reason = document.getElementById(`${MODAL_ID}_reason`).value.trim();
        if (!reason) {
            showModalAlert('El motivo del ajuste es obligatorio.');
            document.getElementById(`${MODAL_ID}_reason`).focus();
            return;
        }

        const items = _state.concepts.map((c, i) => {
            const item = { concept: c.concept, quantity: qs[i] };
            if (c.lineId) item.line_id = c.lineId;
            return item;
        });

        const saveBtn = document.getElementById(`${MODAL_ID}_save`);
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

        try {
            const result = await supabaseRequest('/rpc/adjust_service_consumption', {
                method: 'POST',
                body: JSON.stringify({
                    p_service_type: _state.serviceType,
                    p_service_id: _state.serviceId,
                    p_items: items,
                    p_reason: reason,
                    p_user_id: _state.userId
                })
            });

            if (!result || !result.success) {
                throw new Error(result?.error || 'No se recibió respuesta del servidor');
            }

            _state.saved = true;
            _state.result = result;

            await notifyIfNeeded(_state, result, reason);

            const st = _state;
            bootstrap.Modal.getInstance(document.getElementById(MODAL_ID))?.hide();

            if (!result.has_budget) {
                showMessage('Consumo ajustado. El servicio no tiene solicitud presupuestal asociada, por lo que el presupuesto no cambió.', 'warning');
            } else if (result.delta_total === 0) {
                showMessage('Consumo ajustado sin diferencia presupuestal.', 'success');
            } else {
                const txt = result.delta_total > 0 ? 'ampliado' : 'reversado';
                showMessage(`Consumo ajustado. Presupuesto ${txt} en ${formatCOP(Math.abs(result.delta_total))}.`, 'success');
            }
            if (result.overrun) {
                showMessage('El ajuste generó sobreejecución en el rubro. Se notificó al administrador presupuestal.', 'warning');
            }
            return st;

        } catch (error) {
            console.error('❌ ConsumptionAdjust: error guardando ajuste', error);
            showModalAlert('No se pudo guardar el ajuste: ' + error.message);
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Guardar ajuste';
        }
    }

    // ==================== Notificaciones ====================

    async function notifyIfNeeded(st, result, reason) {
        const statusChanged = result.has_budget && result.delta_total !== 0 && result.execution_status && result.execution_status !== 'approved';
        if (!result.overrun && !statusChanged) return;

        try {
            const cfg = await supabaseRequest('/system_config?select=budget_admin_email&limit=1');
            const to = cfg?.[0]?.budget_admin_email;
            if (!to) {
                console.warn('⚠️ ConsumptionAdjust: no hay budget_admin_email configurado');
                return;
            }

            const motivos = [];
            if (result.overrun) motivos.push('El ajuste generó <strong>sobreejecución</strong> en el rubro.');
            if (statusChanged) motivos.push(`La solicitud presupuestal ya estaba en estado <strong>${escapeHtml(result.execution_status)}</strong> cuando se ajustó.`);

            const tipo = SERVICE_LABELS[st.serviceType] || st.serviceType;
            const subject = `SchoolNet - Ajuste de consumo con efecto presupuestal: ${tipo}`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                        <h2 style="color: #856404; margin: 0 0 10px 0; font-size: 20px;">Ajuste de consumo para revisión</h2>
                        <p style="margin: 0; color: #856404;">SchoolNet - Sistema de Gestión Educativa</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
                        ${motivos.map(m => `<p style="margin: 0 0 10px 0;">${m}</p>`).join('')}
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <tr><td style="padding: 6px 0; color: #666;">Servicio</td><td style="padding: 6px 0;">${escapeHtml(tipo)} — ${escapeHtml(st.title)}</td></tr>
                            <tr><td style="padding: 6px 0; color: #666;">Diferencia aplicada</td><td style="padding: 6px 0;"><strong>${formatSignedCOP(result.delta_total)}</strong></td></tr>
                            <tr><td style="padding: 6px 0; color: #666;">Ejecutado del rubro</td><td style="padding: 6px 0;">${formatCOP(result.executed_value)}</td></tr>
                            <tr><td style="padding: 6px 0; color: #666;">Aprobado del rubro</td><td style="padding: 6px 0;">${formatCOP(result.approved_value)}</td></tr>
                            <tr><td style="padding: 6px 0; color: #666;">Motivo</td><td style="padding: 6px 0;">${escapeHtml(reason)}</td></tr>
                        </table>
                    </div>
                </div>`;

            await sendNotification(to, subject, html);
        } catch (e) {
            console.warn('⚠️ ConsumptionAdjust: no se pudo enviar la notificación', e);
        }
    }

    // ==================== Historial ====================

    /**
     * Devuelve HTML con el historial de ajustes del servicio ('' si no hay).
     */
    async function renderHistory(serviceType, serviceId) {
        try {
            const rows = await supabaseRequest(
                '/svc_consumption_adjustments?select=adjustment_group_id,adjusted_at,concept,previous_quantity,new_quantity,value_delta,adjustment_reason,' +
                'menu:svc_catering_menus(menu_name),user:users!svc_consumption_adjustments_adjusted_by_fkey(user_display_name,user_name)' +
                `&service_type=eq.${serviceType}&service_id=eq.${serviceId}&order=adjusted_at.desc`
            );
            if (!rows || rows.length === 0) return '';

            // Agrupar por acto de ajuste
            const groups = [];
            const byId = {};
            rows.forEach(r => {
                if (!byId[r.adjustment_group_id]) {
                    byId[r.adjustment_group_id] = {
                        at: r.adjusted_at,
                        user: r.user?.user_display_name || r.user?.user_name || '—',
                        reason: r.adjustment_reason,
                        lines: [],
                        delta: 0
                    };
                    groups.push(byId[r.adjustment_group_id]);
                }
                const g = byId[r.adjustment_group_id];
                const label = (CONCEPT_LABELS[r.concept] || r.concept) + (r.menu?.menu_name ? ` (${r.menu.menu_name})` : '');
                g.lines.push(`${escapeHtml(label)}: ${r.previous_quantity} → ${r.new_quantity}`);
                g.delta += Number(r.value_delta) || 0;
            });

            const fmtDT = (iso) => new Intl.DateTimeFormat('es-CO', {
                timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }).format(new Date(iso));

            return `
                <div class="col-12 mt-4"><h6 class="border-bottom pb-2"><i class="bi bi-clock-history me-2"></i>Ajustes de consumo</h6></div>
                <div class="col-12">
                    <div class="table-responsive">
                        <table class="table table-sm small mb-0">
                            <thead class="table-light"><tr><th>Fecha</th><th>Usuario</th><th>Cambios</th><th class="text-end">Diferencia</th><th>Motivo</th></tr></thead>
                            <tbody>
                                ${groups.map(g => `
                                    <tr>
                                        <td class="text-nowrap">${fmtDT(g.at)}</td>
                                        <td>${escapeHtml(g.user)}</td>
                                        <td>${g.lines.join('<br>')}</td>
                                        <td class="text-end text-nowrap ${g.delta > 0 ? 'text-danger' : g.delta < 0 ? 'text-success' : ''}">${formatSignedCOP(g.delta)}</td>
                                        <td>${escapeHtml(g.reason)}</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
        } catch (e) {
            console.warn('⚠️ ConsumptionAdjust: no se pudo cargar el historial', e);
            return '';
        }
    }

    // ==================== API pública ====================

    window.ConsumptionAdjust = {
        PERMISSION_NAME,
        CONCEPT_LABELS,
        canAdjust,
        getDeadline,
        hasPermission,
        open,
        renderHistory,
        formatCOP,
        formatSignedCOP,
        formatDate
    };
})();
