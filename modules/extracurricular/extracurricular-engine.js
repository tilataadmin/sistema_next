/*
====================================
SCHOOLNET - MOTOR DE EXTRACURRICULARES
Cálculo de sesiones y precios.
Compartido por seasons.html y activities.html.
Requiere: config.js cargado previamente
Versión: 26.7.29.1
====================================
*/

// ==========================================
// UTILIDADES DE FECHA
// Se trabaja con cadenas 'YYYY-MM-DD' y se construyen
// objetos Date al mediodía para evitar corrimientos por zona horaria.
// ==========================================

function ecFecha(iso) {
    return new Date(iso + 'T12:00:00');
}

function ecISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Devuelve 1=lunes ... 7=domingo (JS usa 0=domingo)
function ecDiaSemana(d) {
    const j = d.getDay();
    return j === 0 ? 7 : j;
}

const EC_DIAS_NOMBRE = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };

// ==========================================
// INSUMOS DE CALENDARIO
// Trae jornadas pedagógicas y días no laborables del año académico,
// y los expande a un mapa de fecha -> motivo de exclusión.
// ==========================================

async function ecObtenerInsumosCalendario(academicYearId) {
    const anios = await supabaseRequest(
        `/academic_years?select=year_id,year_name,start_of_classes,end_of_classes&year_id=eq.${academicYearId}`
    );
    if (!anios || anios.length === 0) {
        throw new Error('No se encontró el año académico de la temporada');
    }
    const anio = anios[0];

    const jornadas = await supabaseRequest(
        `/pedagogical_days?select=pedagogical_day,description&year_id=eq.${academicYearId}`
    );

    // hr_non_work_days se vincula por cadena, no por llave foránea (deuda conocida)
    const noLaborables = await supabaseRequest(
        `/hr_non_work_days?select=start_date,end_date,day_type,description&academic_year=eq.${encodeURIComponent(anio.year_name)}`
    );

    // Mapa fecha -> { tipo, descripcion }
    const excluidas = {};

    (jornadas || []).forEach(j => {
        excluidas[j.pedagogical_day] = {
            tipo: 'pedagogical_day',
            descripcion: j.description || 'Jornada pedagógica'
        };
    });

    (noLaborables || []).forEach(r => {
        // Cada fila es un rango; se expande día a día
        const cur = ecFecha(r.start_date);
        const fin = ecFecha(r.end_date);
        while (cur <= fin) {
            const iso = ecISO(cur);
            // Las jornadas pedagógicas ya registradas no se sobrescriben
            if (!excluidas[iso]) {
                excluidas[iso] = {
                    tipo: r.day_type,
                    descripcion: r.description || r.day_type
                };
            }
            cur.setDate(cur.getDate() + 1);
        }
    });

    return {
        yearName: anio.year_name,
        startOfClasses: anio.start_of_classes,
        endOfClasses: anio.end_of_classes,
        excluidas: excluidas
    };
}

// ==========================================
// CÁLCULO DE SESIONES
// Cuenta los días lectivos de cada día de la semana habilitado,
// dentro del rango de la temporada.
// ==========================================

function ecCalcularSesiones(startISO, endISO, diasHabilitados, insumos) {
    const resultado = {};
    diasHabilitados.forEach(d => {
        resultado[d] = { sesiones: 0, excluidos: [] };
    });

    const cur = ecFecha(startISO);
    const fin = ecFecha(endISO);

    while (cur <= fin) {
        const dow = ecDiaSemana(cur);
        if (resultado[dow]) {
            const iso = ecISO(cur);
            const exc = insumos.excluidas[iso];
            if (exc) {
                resultado[dow].excluidos.push({ fecha: iso, tipo: exc.tipo, descripcion: exc.descripcion });
            } else {
                resultado[dow].sesiones++;
            }
        }
        cur.setDate(cur.getDate() + 1);
    }

    return resultado;
}

// ==========================================
// ADVERTENCIAS DE CALENDARIO
// No bloquean; se muestran al coordinador para que decida.
// ==========================================

function ecAdvertenciasCalendario(startISO, endISO, insumos) {
    const avisos = [];
    if (insumos.startOfClasses && startISO < insumos.startOfClasses) {
        avisos.push('La temporada empieza antes del inicio de clases del año académico.');
    }
    if (insumos.endOfClasses && endISO > insumos.endOfClasses) {
        avisos.push('La temporada termina después del fin de clases del año académico.');
    }
    if (Object.keys(insumos.excluidas).length === 0) {
        avisos.push('No hay jornadas pedagógicas ni días no laborables registrados para este año académico. Verifique el calendario antes de congelar.');
    }
    return avisos;
}

console.log('✅ Motor de extracurriculares cargado');
