// api/cron/probation-report.js
// Cron mensual: reporta a Talento Humano los trabajadores con periodo de prueba próximo a vencer

// ==========================================
// CONFIGURACIÓN
// ==========================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_API = `${SUPABASE_URL}/rest/v1`;

const NOTIFICATION_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyHG4_9ckpJ2A1O-wok0djm7QMq8UtBz-yKXNFQvNvqkEv_A3pniY_bnCOF6KrM8I8P/exec';
const EMAIL_TALENTO_HUMANO = 'ctalentohumano@colegiotilata.edu.co';
const DIAS_VENTANA = 45;

// ==========================================
// UTILIDADES DE FECHA (COLOMBIA UTC-5)
// ==========================================
function getFechaColombia() {
    const now = new Date();
    const col = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const y = col.getFullYear();
    const m = String(col.getMonth() + 1).padStart(2, '0');
    const d = String(col.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function sumarDias(fechaStr, dias) {
    const fecha = new Date(fechaStr + 'T12:00:00-05:00');
    fecha.setDate(fecha.getDate() + dias);
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function diasEntre(fechaInicio, fechaFin) {
    const a = new Date(fechaInicio + 'T12:00:00-05:00');
    const b = new Date(fechaFin + 'T12:00:00-05:00');
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function nombreMes(fechaStr) {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date(fechaStr + 'T12:00:00-05:00');
    return meses[fecha.getMonth()];
}

function mesYAnio(fechaStr) {
    const fecha = new Date(fechaStr + 'T12:00:00-05:00');
    const mes = nombreMes(fechaStr);
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${fecha.getFullYear()}`;
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr + 'T12:00:00-05:00');
    const d = String(fecha.getDate()).padStart(2, '0');
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const y = fecha.getFullYear();
    return `${d}/${m}/${y}`;
}

function mismoMes(fechaA, fechaB) {
    const a = new Date(fechaA + 'T12:00:00-05:00');
    const b = new Date(fechaB + 'T12:00:00-05:00');
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// ==========================================
// FUNCIONES DE API
// ==========================================
async function supabaseGet(endpoint) {
    const res = await fetch(`${SUPABASE_API}${endpoint}`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) throw new Error(`GET ${endpoint} → ${res.status}: ${await res.text()}`);
    return res.json();
}

async function enviarNotificacion(to, subject, htmlContent) {
    try {
        const params = new URLSearchParams();
        params.append('to', to);
        params.append('subject', subject);
        params.append('htmlBody', htmlContent);

        const res = await fetch(NOTIFICATION_ENDPOINT, {
            method: 'POST',
            body: params
        });
        const result = await res.json();
        return result.success || false;
    } catch (error) {
        console.error('Error enviando notificación:', error.message);
        return false;
    }
}

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================
async function generarReportePeriodoPrueba() {
    const hoy = getFechaColombia();
    const fechaLimite = sumarDias(hoy, DIAS_VENTANA);
    console.log(`📅 Reporte periodo de prueba — hoy: ${hoy}, ventana hasta: ${fechaLimite}`);

    // 1. Cargar trabajadores activos con periodo de prueba en la ventana o ya vencido
    // Ventana: probation_end_date <= fechaLimite (incluye vencidos y próximos a vencer)
    const trabajadores = await supabaseGet(
        `/workers?select=worker_id,worker_id_doc,worker_first_name,worker_last_name_1,worker_last_name_2,worker_entry_date,probation_end_date,organizational_subarea_id,organizational_area_id` +
        `&worker_status=eq.active` +
        `&probation_end_date=not.is.null` +
        `&probation_end_date=lte.${fechaLimite}` +
        `&order=probation_end_date.asc`
    );

    console.log(`👥 Trabajadores con periodo de prueba en ventana: ${trabajadores.length}`);

    if (trabajadores.length === 0) {
        console.log('ℹ️ No hay trabajadores con periodo de prueba próximo a vencer');
        return { total: 0, vencidos: 0, vence_este_mes: 0, vence_proximo_mes: 0, email_enviado: false };
    }

    // 2. Cargar nombres de subáreas y áreas para mostrar el cargo
    const subareaIds = [...new Set(trabajadores.map(t => t.organizational_subarea_id).filter(Boolean))];
    const areaIds = [...new Set(trabajadores.map(t => t.organizational_area_id).filter(Boolean))];

    const subareasMap = {};
    if (subareaIds.length > 0) {
        const subareas = await supabaseGet(
            `/organizational_subareas?select=organizational_subarea_id,subarea_name&organizational_subarea_id=in.(${subareaIds.join(',')})`
        );
        subareas.forEach(s => { subareasMap[s.organizational_subarea_id] = s.subarea_name; });
    }

    const areasMap = {};
    if (areaIds.length > 0) {
        const areas = await supabaseGet(
            `/organizational_areas?select=organizational_area_id,area_name&organizational_area_id=in.(${areaIds.join(',')})`
        );
        areas.forEach(a => { areasMap[a.organizational_area_id] = a.area_name; });
    }

    // 3. Clasificar por grupos
    const vencidos = [];
    const venceEsteMes = [];
    const venceProximoMes = [];

    for (const t of trabajadores) {
        const dias = diasEntre(hoy, t.probation_end_date);
        const cargo = subareasMap[t.organizational_subarea_id]
                    || areasMap[t.organizational_area_id]
                    || 'Sin definir';

        const item = {
            nombre: `${t.worker_first_name} ${t.worker_last_name_1}${t.worker_last_name_2 ? ' ' + t.worker_last_name_2 : ''}`.trim(),
            cedula: t.worker_id_doc,
            cargo: cargo,
            fecha_ingreso: t.worker_entry_date,
            fecha_fin_prueba: t.probation_end_date,
            dias_restantes: dias
        };

        if (dias < 0) {
            vencidos.push(item);
        } else if (mismoMes(hoy, t.probation_end_date)) {
            venceEsteMes.push(item);
        } else {
            venceProximoMes.push(item);
        }
    }

    console.log(`📊 Vencidos: ${vencidos.length}, Este mes: ${venceEsteMes.length}, Próximo mes: ${venceProximoMes.length}`);

    // 4. Construir email HTML
    const htmlContent = construirEmailHTML(hoy, vencidos, venceEsteMes, venceProximoMes);
    const asunto = `Reporte mensual de periodos de prueba - ${mesYAnio(hoy)}`;

    // 5. Enviar correo
    const enviado = await enviarNotificacion(EMAIL_TALENTO_HUMANO, asunto, htmlContent);
    console.log(`📧 Email enviado a ${EMAIL_TALENTO_HUMANO}: ${enviado ? 'OK' : 'FALLÓ'}`);

    return {
        total: trabajadores.length,
        vencidos: vencidos.length,
        vence_este_mes: venceEsteMes.length,
        vence_proximo_mes: venceProximoMes.length,
        email_enviado: enviado
    };
}

// ==========================================
// CONSTRUCCIÓN DEL EMAIL HTML
// ==========================================
function filaTrabajador(t) {
    const colorDias = t.dias_restantes < 0 ? '#dc3545' : (t.dias_restantes <= 15 ? '#fd7e14' : '#212529');
    const textoDias = t.dias_restantes < 0
        ? `Vencido hace ${Math.abs(t.dias_restantes)} día(s)`
        : `${t.dias_restantes} día(s)`;

    return `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${t.nombre}</td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${t.cedula}</td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${t.cargo}</td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${formatearFecha(t.fecha_ingreso)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>${formatearFecha(t.fecha_fin_prueba)}</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: ${colorDias};"><strong>${textoDias}</strong></td>
        </tr>
    `;
}

function tablaGrupo(titulo, color, trabajadores) {
    if (trabajadores.length === 0) return '';

    const filas = trabajadores.map(filaTrabajador).join('');

    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 5px;">
                ${titulo} (${trabajadores.length})
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Trabajador</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Cédula</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Cargo</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Ingreso</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Fin periodo</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Estado</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </div>
    `;
}

function construirEmailHTML(hoy, vencidos, venceEsteMes, venceProximoMes) {
    const totalRegistros = vencidos.length + venceEsteMes.length + venceProximoMes.length;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #212529;">
            <div style="background-color: #cfe2ff; border-left: 4px solid #0d6efd; padding: 15px; margin-bottom: 20px;">
                <h2 style="color: #084298; margin: 0 0 10px 0;">📋 Reporte mensual de periodos de prueba</h2>
                <p style="margin: 0; color: #084298;">${mesYAnio(hoy)} — generado el ${formatearFecha(hoy)}</p>
            </div>

            <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;">
                    Este reporte incluye los trabajadores activos cuyo periodo de prueba está próximo a vencer
                    (próximos ${DIAS_VENTANA} días) o ya venció sin acción registrada en el sistema.
                </p>
                <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">
                    Total de trabajadores en este reporte: <strong>${totalRegistros}</strong>
                </p>
            </div>

            ${tablaGrupo('🔴 Vencidos sin acción registrada', '#dc3545', vencidos)}
            ${tablaGrupo('🟠 Vence este mes', '#fd7e14', venceEsteMes)}
            ${tablaGrupo('🟢 Vence el próximo mes', '#198754', venceProximoMes)}

            <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                <p style="margin: 0; color: #6c757d; font-size: 0.85rem;">
                    Si requiere actualizar la fecha de fin del periodo de prueba de algún trabajador,
                    puede hacerlo en SchoolNet → Talento Humano → Trabajadores → editar trabajador → pestaña Información Personal.
                </p>
            </div>

            <p style="color: #6c757d; font-size: 0.8rem; margin-top: 15px; text-align: center;">
                Reporte automático generado por SchoolNet — Colegio Tilatá<br>
                Por favor, no responder a este mensaje.
            </p>
        </div>
    `;
}

// ==========================================
// HANDLER DEL ENDPOINT
// ==========================================
module.exports = async function handler(req, res) {
    // Verificar que sea invocación del cron de Vercel
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    try {
        console.log('🚀 Inicio del cron de reporte de periodos de prueba');
        const resultado = await generarReportePeriodoPrueba();
        console.log('🏁 Cron finalizado');

        return res.status(200).json({
            success: true,
            fecha: getFechaColombia(),
            ...resultado
        });

    } catch (error) {
        console.error('❌ Error fatal en cron:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
