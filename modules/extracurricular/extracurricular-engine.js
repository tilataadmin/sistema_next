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

    // Las semanas de receso no están en ninguna tabla: se calculan.
    // Se derivan de los años calendario que cruza la temporada, no del año
    // académico, para no depender de columnas que esta función no recibe.
    const recesos = calMapaFechasReceso(
        parseInt(startISO.slice(0, 4), 10),
        parseInt(endISO.slice(0, 4), 10)
    );

    while (cur <= fin) {
        const dow = ecDiaSemana(cur);
        if (resultado[dow]) {
            const iso = ecISO(cur);
            const exc = insumos.excluidas[iso]
                || (recesos[iso] ? { tipo: 'break', descripcion: recesos[iso] } : null);
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

// ==========================================
// MOTOR DE PRECIOS
//
// Reglas (ver especificación v1.2, sección 6):
//   aporte = valor × multiplicador ÷ divisor
//   multiplicador = sesiones de la actividad si time_base='session'; 1 si 'season'
//   divisor:
//     allocation_base='per_student'                  -> 1
//     allocation_base='prorated' y scope='activity'  -> mínimo de la actividad
//     allocation_base='prorated' y scope='season'    -> suma de los mínimos
//
// La combinación scope='season' + time_base='session' está prohibida
// por restricción de base, así que time_base='session' implica scope='activity'.
// ==========================================

// Unidad de redondeo del precio final, en pesos.
// Decisión institucional: los precios se publican en miles, redondeando hacia arriba.
const EC_UNIDAD_REDONDEO = 1000;

// Redondea hacia arriba al múltiplo de EC_UNIDAD_REDONDEO.
function ecRedondear(valor) {
    return Math.ceil(valor / EC_UNIDAD_REDONDEO) * EC_UNIDAD_REDONDEO;
}

// ¿Este concepto aplica a esta actividad?
// applies_to_modality nulo significa "aplica a todas".
function ecConceptoAplica(concepto, actividad) {
    if (!concepto.is_active) return false;
    if (!concepto.applies_to_modality) return true;
    return concepto.applies_to_modality === actividad.modality;
}

// Sesiones de una actividad = suma de las sesiones de los días que ocupa.
function ecSesionesActividad(actividad, sesionesPorDia) {
    let total = 0;
    for (const d of actividad.dias) {
        const s = sesionesPorDia[d];
        if (s === null || s === undefined) return null; // día sin calcular
        total += s;
    }
    return total;
}

/*
  Calcula el precio de todas las actividades de una temporada.

  actividades: [{ activity_id, activity_name, modality, min_students, dias: [1,4] }]
  conceptos:   filas de svc_extracurricular_cost_concepts
  costosPropios: [{ activity_id, concept_id, concept_value }]
  sesionesPorDia: { 1: 18, 3: 19, 4: 17 }

  Devuelve el desglose completo, no solo el total, para que la pantalla
  pueda mostrar el mismo cuadro del anexo de la especificación.
*/
function ecCalcularPrecios(actividades, conceptos, costosPropios, sesionesPorDia) {
    const errores = [];

    // Índice de valores propios: 'activity_id|concept_id' -> valor
    const propios = {};
    (costosPropios || []).forEach(c => {
        propios[`${c.activity_id}|${c.concept_id}`] = parseFloat(c.concept_value);
    });

    // Divisor de los conceptos de ámbito temporada
    const sumaMinimos = actividades.reduce((acc, a) => acc + (a.min_students || 0), 0);
    if (sumaMinimos <= 0) {
        errores.push('La suma de los mínimos es cero. No se puede repartir ningún concepto de temporada.');
    }

    const resultado = actividades.map(act => {
        const detalle = { ...act, sesiones: null, conceptos: [], precio: null, errores: [] };

        const sesiones = ecSesionesActividad(act, sesionesPorDia);
        if (sesiones === null) {
            detalle.errores.push('Hay días sin sesiones calculadas.');
            return detalle;
        }
        detalle.sesiones = sesiones;

        if (!act.min_students || act.min_students <= 0) {
            detalle.errores.push('El cupo mínimo debe ser mayor que cero.');
            return detalle;
        }

        let precio = 0;

        conceptos.forEach(con => {
            if (!ecConceptoAplica(con, act)) return;

            const clave = `${act.activity_id}|${con.concept_id}`;
            const tienePropio = Object.prototype.hasOwnProperty.call(propios, clave);
            const valor = tienePropio
                ? propios[clave]
                : (con.default_value === null || con.default_value === undefined ? null : parseFloat(con.default_value));

            if (valor === null || isNaN(valor)) {
                detalle.errores.push(`El concepto "${con.concept_name}" no tiene valor propio ni valor por defecto.`);
                return;
            }

            const multiplicador = (con.time_base === 'session') ? sesiones : 1;

            let divisor;
            if (con.allocation_base === 'per_student') {
                divisor = 1;
            } else if (con.scope === 'activity') {
                divisor = act.min_students;
            } else {
                divisor = sumaMinimos;
            }

            if (!divisor || divisor <= 0) {
                detalle.errores.push(`El concepto "${con.concept_name}" tiene divisor cero.`);
                return;
            }

            // Los aportes se redondean solo al peso, para mostrarlos sin decimales.
            // El redondeo a miles se aplica al total, no a cada línea.
            const aporte = Math.round(valor * multiplicador / divisor);
            precio += aporte;

            detalle.conceptos.push({
                concept_id: con.concept_id,
                concept_name: con.concept_name,
                scope: con.scope,
                time_base: con.time_base,
                allocation_base: con.allocation_base,
                origen: tienePropio ? 'propio' : 'defecto',
                valor: valor,
                multiplicador: multiplicador,
                divisor: divisor,
                aporte: aporte
            });
        });

        if (detalle.errores.length === 0) {
            detalle.precioSinRedondear = precio;
            detalle.precio = ecRedondear(precio);
            detalle.ajusteRedondeo = detalle.precio - precio;
        } else {
            detalle.precioSinRedondear = null;
            detalle.precio = null;
            detalle.ajusteRedondeo = null;
        }
        return detalle;
    });

    return { sumaMinimos, actividades: resultado, errores };
}

// Las tres opciones que ve la familia (especificación 6.7).
//
// Los tres valores son ajustables a mano. El quinto parámetro es opcional:
// sin él la función se comporta exactamente como antes.
//
//   ajustes = { none, linked, unlinked }   null o ausente = usar el cálculo
//
// El total sin transporte es la base de los otros dos: si se ajusta, los dos
// con transporte se recalculan sobre él. Así, redondear el precio base no
// obliga a volver a digitar los otros dos. Ajustar uno de los de transporte
// lo fija en ese valor y deja de seguir a la base.
function ecOpcionesTarifa(precio, sesiones, tarifaVinculada, tarifaNoVinculada, ajustes) {
    const aj = ajustes || {};

    // Cadena vacía, null, undefined y basura se tratan igual: no hay ajuste.
    const num = v => {
        if (v === null || v === undefined || v === '') return null;
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
    };

    const ajNone     = num(aj.none);
    const ajLinked   = num(aj.linked);
    const ajUnlinked = num(aj.unlinked);

    const baseEfectiva = ajNone !== null ? ajNone : precio;

    // Lo que cobra el operador. No se deforma nunca: es el número que se
    // concilia contra su factura.
    const transporteVinculada   = Math.round(sesiones * tarifaVinculada);
    const transporteNoVinculada = Math.round(sesiones * tarifaNoVinculada);

    const sugLinked   = baseEfectiva + transporteVinculada;
    const sugUnlinked = baseEfectiva + transporteNoVinculada;

    const efLinked   = ajLinked   !== null ? ajLinked   : sugLinked;
    const efUnlinked = ajUnlinked !== null ? ajUnlinked : sugUnlinked;

    return {
        // Valores efectivos: los que se publican y los que ve la familia.
        sinTransporte: baseEfectiva,
        conTransporteVinculada: efLinked,
        conTransporteNoVinculada: efUnlinked,

        // Lo que propone el sistema en el estado actual.
        sugerido: { none: precio, linked: sugLinked, unlinked: sugUnlinked },

        // Qué campos vienen de una decisión humana.
        ajustado: {
            none:     ajNone     !== null,
            linked:   ajLinked   !== null,
            unlinked: ajUnlinked !== null
        },

        // Costo real del transporte, para conciliar con el operador.
        transporteOperador: { linked: transporteVinculada, unlinked: transporteNoVinculada },

        // Diferencia entre lo que se cobra y lo que sugería el sistema.
        // Positivo = recargo. Negativo = subsidio.
        subsidio: {
            none:     baseEfectiva - precio,
            linked:   efLinked   - sugLinked,
            unlinked: efUnlinked - sugUnlinked
        }
    };
}

// ==========================================
// AUTOPRUEBA — reproduce el anexo de la especificación v1.2
// Ejecutar en la consola del navegador: ecAutoprueba()
// No toca la base de datos.
// ==========================================

function ecAutoprueba() {
    const sesionesPorDia = { 1: 18, 3: 19, 4: 17 };

    const conceptos = [
        { concept_id: 'c1', concept_name: 'Honorarios instructor', scope: 'activity', time_base: 'session', allocation_base: 'prorated', default_value: 180000, applies_to_modality: 'instructor', is_active: true },
        { concept_id: 'c2', concept_name: 'Refrigerio instructor', scope: 'activity', time_base: 'session', allocation_base: 'prorated', default_value: 12000, applies_to_modality: 'instructor', is_active: true },
        { concept_id: 'c3', concept_name: 'Coordinador', scope: 'season', time_base: 'season', allocation_base: 'prorated', default_value: 3000000, applies_to_modality: null, is_active: true },
        { concept_id: 'c4', concept_name: 'Recordatorios', scope: 'season', time_base: 'season', allocation_base: 'per_student', default_value: 35000, applies_to_modality: null, is_active: true },
        { concept_id: 'c5', concept_name: 'Tarifa del tercero', scope: 'activity', time_base: 'season', allocation_base: 'per_student', default_value: null, applies_to_modality: 'partner', is_active: true }
    ];

    const actividades = [
        { activity_id: 'a1', activity_name: 'Ajedrez', modality: 'instructor', min_students: 10, dias: [1, 4] },
        { activity_id: 'a2', activity_name: 'Cerámica', modality: 'partner', min_students: 10, dias: [3] }
    ];
    // Diez actividades de relleno para llegar a la suma de mínimos = 120 del anexo
    for (let i = 3; i <= 12; i++) {
        actividades.push({ activity_id: 'a' + i, activity_name: 'Relleno ' + i, modality: 'instructor', min_students: 10, dias: [1] });
    }

    const costosPropios = [
        { activity_id: 'a2', concept_id: 'c5', concept_value: 240000 }
    ];

    const r = ecCalcularPrecios(actividades, conceptos, costosPropios, sesionesPorDia);
    const ajedrez = r.actividades.find(a => a.activity_id === 'a1');
    const ceramica = r.actividades.find(a => a.activity_id === 'a2');

    const opAjedrez = ecOpcionesTarifa(ajedrez.precio, ajedrez.sesiones, 15650, 19000);
    const opCeramica = ecOpcionesTarifa(ceramica.precio, ceramica.sesiones, 15650, 19000);

    const casos = [
        ['Suma de los mínimos', r.sumaMinimos, 120],
        ['Ajedrez — sesiones', ajedrez.sesiones, 35],
        ['Ajedrez — precio', ajedrez.precio, 732000],
        ['Ajedrez — con transporte vinculada', opAjedrez.conTransporteVinculada, 1279750],
        ['Ajedrez — con transporte no vinculada', opAjedrez.conTransporteNoVinculada, 1397000],
        ['Cerámica — sesiones', ceramica.sesiones, 19],
        ['Cerámica — precio', ceramica.precio, 300000],
        ['Cerámica — con transporte vinculada', opCeramica.conTransporteVinculada, 597350],
        ['Cerámica — con transporte no vinculada', opCeramica.conTransporteNoVinculada, 661000],
        ['Cerámica — conceptos aplicados', ceramica.conceptos.length, 3]
    ];

    // Ajuste manual de los tres totales.
    const opSin  = ecOpcionesTarifa(ajedrez.precio, ajedrez.sesiones, 15650, 19000);
    const opBase = ecOpcionesTarifa(ajedrez.precio, ajedrez.sesiones, 15650, 19000, { none: 750000 });
    const opTres = ecOpcionesTarifa(ajedrez.precio, ajedrez.sesiones, 15650, 19000,
                                    { none: 750000, linked: 1250000, unlinked: 1380000 });

    casos.push(['Ajuste — sin ajustes se comporta igual', opSin.conTransporteVinculada, 1279750]);
    casos.push(['Ajuste — sin ajustes no marca nada',
                opSin.ajustado.none || opSin.ajustado.linked || opSin.ajustado.unlinked, false]);
    casos.push(['Ajuste — la base arrastra a la vinculada', opBase.conTransporteVinculada, 1297750]);
    casos.push(['Ajuste — la base arrastra a la no vinculada', opBase.conTransporteNoVinculada, 1415000]);
    casos.push(['Ajuste — la base queda marcada', opBase.ajustado.none, true]);
    casos.push(['Ajuste — los tres digitados mandan', opTres.conTransporteNoVinculada, 1380000]);
    casos.push(['Ajuste — subsidio a la ruta vinculada', opTres.subsidio.linked, -47750]);
    casos.push(['Ajuste — recargo al sin transporte', opTres.subsidio.none, 18000]);
    casos.push(['Ajuste — costo real del operador no se deforma',
                opTres.transporteOperador.linked, 547750]);

    // Escenario adicional: mínimo que no divide exacto, para verificar el redondeo.
    // Honorarios:    180000 × 18 ÷ 7 = 462857,14 -> 462857
    // Coordinador:   3000000 ÷ 7     = 428571,43 -> 428571
    // Recordatorios:                                 35000
    // Suma de aportes = 926428  ->  hacia arriba a miles = 927000  (ajuste 572)
    // Honorarios: 180000 × 18 ÷ 13 = 249230,77 -> 249000
    // Coordinador: 3000000 ÷ 13 = 230769,23 -> 231000
    // Recordatorios: 35000 -> 35000    Total esperado: 515000
    const rRed = ecCalcularPrecios(
        [{ activity_id: 'x1', activity_name: 'Impar', modality: 'instructor', min_students: 7, dias: [1] }],
        conceptos.filter(c => c.concept_id !== 'c2'),
        [],
        sesionesPorDia
    );
    const impar = rRed.actividades[0];
    casos.push(['Redondeo — suma de aportes', impar.precioSinRedondear, 926428]);
    casos.push(['Redondeo — precio publicado', impar.precio, 927000]);
    casos.push(['Redondeo — múltiplo de mil', impar.precio % 1000, 0]);
    casos.push(['Redondeo — ajuste mostrado', impar.ajusteRedondeo, 572]);

    let fallos = 0;
    console.log('%c AUTOPRUEBA DEL MOTOR DE PRECIOS ', 'background:#993556;color:#fff;font-weight:bold');
    casos.forEach(([nombre, obtenido, esperado]) => {
        const ok = obtenido === esperado;
        if (!ok) fallos++;
        console.log(`${ok ? '✅' : '❌'} ${nombre}: ${obtenido}${ok ? '' : ' (esperado ' + esperado + ')'}`);
    });

    console.table(ajedrez.conceptos.map(c => ({
        Concepto: c.concept_name, Valor: c.valor, Mult: c.multiplicador, Div: c.divisor, Aporte: c.aporte
    })));

    console.log(fallos === 0 ? '%c TODAS LAS PRUEBAS PASARON ' : `%c ${fallos} PRUEBA(S) FALLARON `,
        fallos === 0 ? 'background:#1D9E75;color:#fff' : 'background:#E24B4A;color:#fff');
    return fallos === 0;
}

console.log('✅ Motor de extracurriculares cargado');
