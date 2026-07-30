/*
====================================
SCHOOLNET - CALENDARIO ESCOLAR
Reglas del calendario que no viven en ninguna tabla y por lo tanto
hay que calcular: festivos nacionales colombianos y semanas de receso.

Las semanas de receso no se guardan en hr_non_work_days a propósito.
Esa tabla es de talento humano y su day_type solo admite holiday,
paid_break, unpaid_break y virtual_day: vocabulario de nómina.
Registrar el receso ahí obligaría a declararlo pagado o no pagado
—decisión directiva que varía cada año— para representar un hecho del
calendario estudiantil que no varía: los estudiantes no asisten.

Compartido por generar-dias-tilata.html y extracurricular-engine.js.
Sin este archivo cada uno tendría su propia copia de la regla, y una
reforma al Decreto 1373 obligaría a acordarse de los dos.

Versión: 26.7.30.1
====================================
*/

// ==========================================
// UTILIDADES DE FECHA
// Se construyen fechas locales sin hora para evitar corrimientos por zona.
// ==========================================

function calAddDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

function calFmtDate(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
}

// Ley Emiliani: si no cae lunes, se traslada al lunes siguiente
function calToNextMonday(d) {
    const r = new Date(d);
    const dow = r.getDay(); // 0=Dom..6=Sáb, 1=Lun
    const add = (dow === 1) ? 0 : ((8 - dow) % 7);
    r.setDate(r.getDate() + add);
    return r;
}

// Algoritmo de Meeus/Jones/Butcher para el domingo de Pascua
function calComputeEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=marzo, 4=abril
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

// ==========================================
// SEMANAS DE RECESO
// Semana Santa (lunes a viernes de la semana de Pascua) y semana de receso
// de octubre (lunes a viernes de la semana anterior al festivo de Día de la
// Raza, Decreto 1373 de 2007). La semana completa queda sin clases, aunque
// solo alguno de sus días sea festivo nacional.
// ==========================================

function calSemanasDeReceso(anioCalendario) {
    const easter = calComputeEaster(anioCalendario);
    const diaDeLaRaza = calToNextMonday(new Date(anioCalendario, 9, 12));
    return [
        { nombre: 'Semana Santa',     inicio: calAddDays(easter, -6),      fin: calAddDays(easter, -2) },
        { nombre: 'Semana de receso', inicio: calAddDays(diaDeLaRaza, -7), fin: calAddDays(diaDeLaRaza, -3) }
    ];
}

// Une las semanas de receso de un rango de años calendario.
// Un año académico de agosto a junio cruza dos años calendario, igual que
// una temporada que empiece en un año y termine en el siguiente.
function calRecesosEntreAnios(anioInicio, anioFin) {
    const desde = Math.min(anioInicio, anioFin);
    const hasta = Math.max(anioInicio, anioFin);
    let todos = [];
    for (let y = desde; y <= hasta; y++) {
        todos = todos.concat(calSemanasDeReceso(y));
    }
    return todos;
}

// Expande esas semanas a un mapa 'YYYY-MM-DD' -> nombre del receso,
// que es la forma en que lo consumen los motores de conteo.
function calMapaFechasReceso(anioInicio, anioFin) {
    const mapa = {};
    calRecesosEntreAnios(anioInicio, anioFin).forEach(b => {
        let d = new Date(b.inicio);
        while (d <= b.fin) {
            mapa[calFmtDate(d)] = b.nombre;
            d = calAddDays(d, 1);
        }
    });
    return mapa;
}
