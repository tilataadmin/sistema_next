// api/cron/auto-absences.js
// Cron automático: genera ausencias no justificadas para workers sin asistencia ni solicitud en D-2

// ==========================================
// CONFIGURACIÓN
// ==========================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_API = `${SUPABASE_URL}/rest/v1`;

const NOTIFICATION_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyHG4_9ckpJ2A1O-wok0djm7QMq8UtBz-yKXNFQvNvqkEv_A3pniY_bnCOF6KrM8I8P/exec';
const AUSENCIA_NO_JUSTIFICADA_ID = '87f7e853-c38b-46e8-86a1-2c3b3d509b9d';
const UMBRAL_MINIMO_HORAS = 0.5;

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

function restarDias(fechaStr, dias) {
    const fecha = new Date(fechaStr + 'T12:00:00-05:00');
    fecha.setDate(fecha.getDate() - dias);
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function esDiaLaboral(fechaStr) {
    const fecha = new Date(fechaStr + 'T12:00:00-05:00');
    const dia = fecha.getDay();
    return dia !== 0 && dia !== 6;
}

function calcularHorasJornada(startTime, endTime) {
    const start = new Date('2000-01-01T' + startTime);
    const end = new Date('2000-01-01T' + endTime);
    return (end - start) / (1000 * 60 * 60) - 1; // -1hr almuerzo
}

function calcularHorasAsistencia(registros, jornadaStart, jornadaEnd) {
    if (!registros || registros.length === 0) return 0;

    const entradas = registros
        .filter(r => r.registro_tipo === 'entrada')
        .map(r => r.attendance_time)
        .sort();
    const salidas = registros
        .filter(r => r.registro_tipo === 'salida')
        .map(r => r.attendance_time)
        .sort()
        .reverse();

    if (entradas.length === 0) return 0;

    const primeraEntrada = entradas[0];
    const ultimaSalida = salidas.length > 0 ? salidas[0] : jornadaEnd;

    const start = new Date('2000-01-01T' + primeraEntrada);
    const end = new Date('2000-01-01T' + ultimaSalida);
    let horas = (end - start) / (1000 * 60 * 60);

    // Descontar almuerzo si cubre jornada completa
    const jornadaHorasBrutas = calcularHorasJornada(jornadaStart, jornadaEnd) + 1;
    if (horas >= jornadaHorasBrutas) {
        horas -= 1;
    }

    return Math.max(0, horas);
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

async function supabasePost(endpoint, data) {
    const res = await fetch(`${SUPABASE_API}${endpoint}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`POST ${endpoint} → ${res.status}: ${await res.text()}`);
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
async function procesarAusenciasAutomaticas() {
    const hoy = getFechaColombia();
    const fechaObjetivo = restarDias(hoy, 2); // D-2
    console.log(`📅 Procesando ausencias automáticas para: ${fechaObjetivo}`);

    // Verificar que sea día laboral
    if (!esDiaLaboral(fechaObjetivo)) {
        console.log('⏭️ Día no laboral (fin de semana), omitiendo');
        return { processed: 0, created: 0, skipped: 0, errors: 0 };
    }

    // Verificar contra hr_non_work_days
    const diasNoLaborables = await supabaseGet(
        `/hr_non_work_days?select=start_date,end_date&start_date=lte.${fechaObjetivo}&end_date=gte.${fechaObjetivo}`
    );
    if (diasNoLaborables.length > 0) {
        console.log('⏭️ Día no laborable (festivo/receso), omitiendo');
        return { processed: 0, created: 0, skipped: 0, errors: 0 };
    }

    // Cargar configuración HR
    const hrConfigs = await supabaseGet('/hr_config?select=workday_start_time,workday_end_time&limit=1');
    if (!hrConfigs || hrConfigs.length === 0) {
        throw new Error('No se encontró configuración HR');
    }
    const hrConfig = hrConfigs[0];
    const jornadaStart = hrConfig.workday_start_time || '07:00:00';
    const jornadaEnd = hrConfig.workday_end_time || '15:00:00';
    const horasJornada = calcularHorasJornada(jornadaStart, jornadaEnd);
    console.log(`⏰ Jornada: ${jornadaStart} - ${jornadaEnd} = ${horasJornada}hrs efectivas`);

    // Cargar todos los workers activos
    const workers = await supabaseGet(
        '/workers?select=worker_id,worker_id_doc,worker_first_name,worker_last_name_1,worker_last_name_2,email&worker_status=eq.active'
    );
    console.log(`👥 Workers activos: ${workers.length}`);

    // Cargar TODAS las asistencias del día objetivo (una sola consulta)
    const asistencias = await supabaseGet(
        `/attendance?select=person_id_document,attendance_time,registro_tipo&person_type=eq.worker&attendance_date=eq.${fechaObjetivo}`
    );
    // Crear mapa: documento → registros
    const mapaAsistencia = {};
    asistencias.forEach(a => {
        if (!mapaAsistencia[a.person_id_document]) {
            mapaAsistencia[a.person_id_document] = [];
        }
        mapaAsistencia[a.person_id_document].push(a);
    });

    // Cargar TODAS las ausencias aprobadas que cubran el día objetivo (una sola consulta)
    const ausencias = await supabaseGet(
        `/hr_absence_requests?select=worker_id,total_hours,total_days,is_full_day,start_date,end_date,start_time,end_time,daily_recurring_hours&status=eq.approved&start_date=lte.${fechaObjetivo}&end_date=gte.${fechaObjetivo}`
    );
    // Crear mapa: worker_id → ausencias
    const mapaAusencias = {};
    ausencias.forEach(a => {
        if (!mapaAusencias[a.worker_id]) {
            mapaAusencias[a.worker_id] = [];
        }
        mapaAusencias[a.worker_id].push(a);
    });

    // Cargar solicitudes automáticas ya creadas para ese día (idempotencia)
    const yaCreadas = await supabaseGet(
        `/hr_absence_requests?select=worker_id&category_id=eq.${AUSENCIA_NO_JUSTIFICADA_ID}&start_date=eq.${fechaObjetivo}&auto_generated=eq.true`
    );
    const workerIdsYaCreados = new Set(yaCreadas.map(r => r.worker_id));

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const worker of workers) {
        try {
            // Idempotencia: ya tiene ausencia automática ese día
            if (workerIdsYaCreados.has(worker.worker_id)) {
                skipped++;
                continue;
            }

            // Calcular horas cubiertas por ausencias aprobadas
            const ausenciasWorker = mapaAusencias[worker.worker_id] || [];
            let horasAusencia = 0;
            let tieneAusenciaDiaCompleto = false;

            for (const aus of ausenciasWorker) {
                if (aus.is_full_day) {
                    tieneAusenciaDiaCompleto = true;
                    break;
                }
                if (aus.daily_recurring_hours) {
                    horasAusencia += parseFloat(aus.daily_recurring_hours);
                } else if (aus.start_time && aus.end_time) {
                    const s = new Date('2000-01-01T' + aus.start_time);
                    const e = new Date('2000-01-01T' + aus.end_time);
                    horasAusencia += (e - s) / (1000 * 60 * 60);
                } else {
                    horasAusencia += parseFloat(aus.total_hours || 0);
                }
            }

            // Si tiene ausencia de día completo, está cubierto
            if (tieneAusenciaDiaCompleto) {
                skipped++;
                continue;
            }

            // Calcular horas de asistencia
            const registros = mapaAsistencia[worker.worker_id_doc] || [];
            const horasAsistencia = calcularHorasAsistencia(registros, jornadaStart, jornadaEnd);

            // Calcular déficit
            const horasCubiertas = horasAusencia + horasAsistencia;
            const deficit = horasJornada - horasCubiertas;

            // Si déficit es menor al umbral, no generar
            if (deficit < UMBRAL_MINIMO_HORAS) {
                skipped++;
                continue;
            }

            // Calcular días equivalentes
            const diasDeficit = deficit / horasJornada;

            console.log(`⚠️ ${worker.worker_last_name_1} ${worker.worker_first_name}: déficit ${deficit.toFixed(2)}hrs (asistencia: ${horasAsistencia.toFixed(2)}, ausencia: ${horasAusencia.toFixed(2)})`);

            // Crear solicitud de ausencia no justificada
            const solicitud = {
                worker_id: worker.worker_id,
                category_id: AUSENCIA_NO_JUSTIFICADA_ID,
                start_date: fechaObjetivo,
                end_date: fechaObjetivo,
                total_days: parseFloat(diasDeficit.toFixed(2)),
                total_hours: parseFloat(deficit.toFixed(2)),
                is_full_day: deficit >= horasJornada - UMBRAL_MINIMO_HORAS,
                status: 'approved',
                auto_generated: true,
                description: `Ausencia generada automáticamente. Sin registro de asistencia ni solicitud de ausencia que cubra la jornada completa del ${fechaObjetivo}.`
            };

            // Si fue parcial, registrar las horas de inicio/fin faltantes
            if (!solicitud.is_full_day) {
                solicitud.description = `Ausencia parcial generada automáticamente. Déficit de ${deficit.toFixed(2)} horas el ${fechaObjetivo}. Asistencia registrada: ${horasAsistencia.toFixed(2)}hrs, ausencia aprobada: ${horasAusencia.toFixed(2)}hrs.`;
            }

            const resultado = await supabasePost('/hr_absence_requests', solicitud);

            // Enviar notificaciones
            if (resultado && resultado.length > 0) {
                await notificarAusenciaAutomatica(worker, fechaObjetivo, deficit, solicitud.is_full_day);
                created++;
            }

        } catch (error) {
            console.error(`❌ Error procesando worker ${worker.worker_id}: ${error.message}`);
            errors++;
        }
    }

    const resumen = { processed: workers.length, created, skipped, errors };
    console.log(`✅ Resultado: ${JSON.stringify(resumen)}`);
    return resumen;
}
// ==========================================
// NOTIFICACIONES
// ==========================================
async function notificarAusenciaAutomatica(worker, fecha, horasDeficit, esDiaCompleto) {
    try {
        const emailsSet = new Set();

        // 1. Jefes del trabajador
        const managers = await supabaseGet(
            `/worker_managers?select=manager_id&worker_id=eq.${worker.worker_id}&assignment_status=eq.active`
        );
        if (managers.length > 0) {
            const managerIds = managers.map(m => m.manager_id).join(',');
            const managersData = await supabaseGet(
                `/workers?select=email&worker_id=in.(${managerIds})`
            );
            managersData.forEach(m => { if (m.email) emailsSet.add(m.email); });
        }

        // 2. Email de TH desde hr_config
        const hrConfigs = await supabaseGet('/hr_config?select=hr_manager_email&limit=1');
        if (hrConfigs.length > 0 && hrConfigs[0].hr_manager_email) {
            emailsSet.add(hrConfigs[0].hr_manager_email);
        }

        const emails = Array.from(emailsSet).filter(e => e);
        if (emails.length === 0) {
            console.log(`⚠️ Sin destinatarios para ${worker.worker_last_name_1}`);
            return;
        }

        const nombreCompleto = `${worker.worker_first_name} ${worker.worker_last_name_1} ${worker.worker_last_name_2 || ''}`.trim();
        const tipoAusencia = esDiaCompleto ? 'Día completo' : `${horasDeficit.toFixed(2)} horas`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 20px;">
                    <h2 style="color: #842029; margin: 0 0 10px 0;">⚠️ Ausencia No Justificada</h2>
                    <p style="margin: 0; color: #842029;">Generada automáticamente por SchoolNet</p>
                </div>
                <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
                    <p><strong>Trabajador:</strong> ${nombreCompleto}</p>
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p><strong>Tipo:</strong> ${tipoAusencia}</p>
                    <p style="color: #6c757d; font-size: 0.9rem;">
                        Este registro se generó automáticamente porque no se encontró registro de asistencia
                        ni solicitud de ausencia aprobada que cubra la jornada del día indicado.
                    </p>
                </div>
                <p style="color: #6c757d; font-size: 0.8rem; margin-top: 15px;">
                    Por favor, no responder a este mensaje.<br>
                    Colegio Tilata - SchoolNet
                </p>
            </div>
        `;

        await enviarNotificacion(
            emails.join(','),
            `Ausencia no justificada - ${nombreCompleto} - ${fecha}`,
            htmlContent
        );

        console.log(`📧 Notificación enviada a ${emails.length} destinatario(s) por ${nombreCompleto}`);

    } catch (error) {
        console.error(`❌ Error notificando ausencia de ${worker.worker_last_name_1}: ${error.message}`);
    }
}

// ==========================================
// HANDLER DEL ENDPOINT
// ==========================================
export default async function handler(req, res) {
    // Verificar que sea invocación del cron de Vercel
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    try {
        console.log('🚀 Inicio del cron de ausencias automáticas');
        const resultado = await procesarAusenciasAutomaticas();
        console.log('🏁 Cron finalizado');

        return res.status(200).json({
            success: true,
            fecha_procesada: restarDias(getFechaColombia(), 2),
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
