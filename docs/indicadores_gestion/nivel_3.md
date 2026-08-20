# Indicadores por área — Nivel 3
## Sistema de indicadores DAFI

**Estado:** documento de trabajo v0.1
**Alcance:** banco depurado de indicadores para las cinco áreas. Definición conceptual; no incluye bandas ni construcción de data.
**Documentos relacionados:** *Indicadores Nivel 1 — DAFI* · *Acuerdo de Desempeño de Área — Nivel 2*

---

## 1. Naturaleza de este documento

Este no es el acuerdo. Es el **insumo para la conversación** con cada jefatura.

Si los indicadores se bajan ya definidos, el acuerdo deja de ser ganar-ganar y se convierte en asignación: la jefatura firma algo que no ayudó a construir, y el instrumento nace con el defecto inverso al de las metas blandas — metas ajenas. Pero llegar con la hoja en blanco tampoco funciona: las áreas tienden a proponer lo que ya miden, o lo que saben que cumplen.

**Uso previsto:** DAFI lleva estos candidatos a la conversación de acuerdo. La jefatura selecciona, propone alternativas y discute bandas. DAFI veta lo blando y exige cobertura de las cinco dimensiones.

### 1.1 Filtros aplicados

Todo indicador de este banco pasó cinco filtros:

1. **Mide resultado, no método** — salvo que el método sea directriz (normativa, autorización, protocolo de seguridad).
2. **El dato existe o hay ruta clara para construirlo**, con fecha comprometida.
3. **No es maquillable sin que otro indicador lo delate.** Sin contra-indicador y fácil de inflar, no entra.
4. **El área tiene palanca real sobre él.** Puede no controlarlo del todo — para eso está la regla 7.3 del Nivel 2 — pero debe poder moverlo.
5. **Alguien haría algo distinto según el resultado.** Si no, es dato de reporte, no indicador.

### 1.2 Técnicas de depuración empleadas

Cada área quedó en **8 indicadores**, el máximo que admite el acuerdo. Para reducir sin perder cobertura se usaron dos mecanismos:

- **Contra-indicador embebido (doble condición).** El indicador está en banda solo si cumple el resultado *y* la condición que impide maquillarlo. Ejemplo: cierre contable en plazo *y* sin reprocesos.
- **Índice por conteo.** Las tareas recurrentes se agrupan en un solo indicador medido por número de estándares fuera de fecha, no por promedio de cumplimiento.

### 1.3 Las cinco dimensiones obligatorias

| # | Dimensión | Pregunta |
|---|---|---|
| **D1** | Cumplimiento de compromisos | ¿Se entregó lo pactado, en tiempo y alcance? |
| **D2** | Ejecución económica | ¿Se ejecutó dentro de lo presupuestado y a qué costo unitario? |
| **D3** | Nivel de servicio | ¿Cómo responde ante su usuario y cumple sus estándares operativos? |
| **D4** | Riesgo y cumplimiento | ¿Están cerradas las obligaciones normativas y contractuales? |
| **D5** | Capacidad y continuidad | ¿Puede seguir operando cuando falta alguien o falla algo? |

---

## 2. Contabilidad

**Frentes:** información financiera y contable · presupuesto · cartera · compras.

**Trampa dominante:** medir cumplimiento de entregas en lugar de calidad y oportunidad de la información para decidir. Es el área más fácil de instrumentar y por eso la más propensa a llenarse de indicadores de proceso.

| Cód. | Indicador | Dim. | Frec. |
|---|---|---|---|
| C1 | Cierre contable oportuno y en firme | D1 | Mensual |
| C2 | Precisión de la proyección de flujo | D2 | Mensual |
| C3 | Cartera vencida y concentración | D3 | Mensual |
| C4 | Ciclo de compra con proceso cumplido | D3 | Mensual |
| C5 | Estándares operativos al día | D3 | Mensual |
| C6 | Obligaciones tributarias y del RTE | D4 | Mensual |
| C7 | Hallazgos de revisoría fiscal y control interno | D4 | Mensual |
| C8 | Dependencia de persona única en procesos críticos | D5 | Trimestral |

### C1 · Cierre contable oportuno y en firme — D1
Días hábiles desde fin de mes hasta cierre en firme.
**Doble condición:** en banda solo si cumple el plazo *y* no genera más de N ajustes sobre períodos ya cerrados. Cerrar rápido cerrando mal no es cumplimiento.
Absorbe el candidato de reprocesos y el de oportunidad de entrega al sistema de indicadores: si el cierre no está en firme, el tablero institucional completo llega tarde.
**Origen de banda:** necesidad institucional — la fecha la define el corte del Nivel 2, no la comodidad del área.

### C2 · Precisión de la proyección de flujo — D2
Desviación **absoluta** entre flujo proyectado y ejecutado, con lectura en promedio móvil. Mide capacidad de anticipación, que es lo que el cargo necesita del área.
En valor absoluto por la misma razón que la desviación presupuestal bruta del Nivel 1: subestimar y sobreestimar no se compensan.

### C3 · Cartera vencida y concentración — D3
Cartera vencida a más de 60 días / facturación del período, reportada **por antigüedad y por concentración**.
Nunca como promedio: el mismo monto en 60 familias o en 3 son situaciones opuestas que exigen acciones distintas.
Absorbe efectividad de gestión de cobro como desagregación de lectura. Se lee junto con el contra-indicador de retención del Nivel 1.

### C4 · Ciclo de compra con proceso cumplido — D3
Tiempo desde requisición aprobada hasta recepción a satisfacción.
**Doble condición:** en banda solo si el ciclo cumple plazo *y* el 100% de las compras pasó por cotización y autorización correspondiente. Acelerar saltándose el control no es desempeño.
El componente de proceso es de origen **Obligación**: incumplimiento es Crítico automático.

### C5 · Estándares operativos al día — D3
Índice de cumplimiento de tareas recurrentes: conciliaciones bancarias, facturación en fecha, legalización de anticipos, pago a proveedores en condiciones pactadas.
**Medición por conteo**, no por promedio: número de estándares fuera de fecha al corte. Un solo estándar incumplido de forma recurrente en dos cortes pasa a Alerta aunque el resto esté al día.
Absorbe oportunidad de pago a proveedores — un área que mejora la caja pagando tarde traslada el costo al proveedor y termina en peores condiciones comerciales.

### C6 · Obligaciones tributarias y del RTE — D4
Cumplimiento en plazo de declaraciones, pagos y requisitos de permanencia del Régimen Tributario Especial de la ESAL.
**Origen: Obligación. Sin banda intermedia** — cumplimiento total o Crítico.

### C7 · Hallazgos de revisoría fiscal y control interno — D4
Conteo de hallazgos abiertos y vencidos, por severidad, con antigüedad y **número de reprogramaciones**.
Absorbe ajustes de auditoría (son hallazgos con otro nombre) y **autorizaciones excepcionales** — operaciones ejecutadas fuera del flujo normal de autorización, que es donde se vería la presión desviándose tras la eliminación de traslados presupuestales.
Los plazos de cierre de hallazgos críticos y altos no los fija quien debe cumplirlos.

### C8 · Dependencia de persona única en procesos críticos — D5
Número de procesos críticos con un solo ejecutor capaz. La ausencia del contador en cierre o en un vencimiento tributario detiene la función.
Absorbe documentación de procesos como **medio de verificación**: un proceso se cuenta cubierto solo si existe documentación vigente *y* un segundo ejecutor lo ha ejecutado efectivamente, no si solo está escrito.

### Descartados y por qué

| Candidato | Razón |
|---|---|
| Desviación presupuestal bruta | El área la calcula y reporta; no responde por ella. Quien gasta es cada área. Hacerla indicador suyo la vuelve juez y parte |
| Costo de la función administrativa | Orden de magnitud útil, mala meta de gestión. Recortar contabilidad es economía falsa |
| Continuidad del sistema contable / respaldos | Dueño técnico es Tecnología (TI2). Contabilidad aporta el requerimiento de recuperación |
| Utilidad de la información para decidir | Conceptualmente el mejor indicador del área. Requiere instrumento inexistente. **Diferido a segundo período** |

---

## 3. Relacionamiento

**Frentes:** admisiones · comunicaciones · relaciones con la comunidad.

**Trampa dominante:** medir actividad — publicaciones, alcance, seguidores, eventos realizados — en lugar de conversión y costo. El análisis del embudo ya mostró que las métricas agregadas de canal se veían bien mientras la conversión fallaba en etapas específicas.

| Cód. | Indicador | Dim. | Frec. |
|---|---|---|---|
| R1 | Cobertura de cupos por grado | D1 | Mensual en temporada |
| R2 | Conversión por etapa del embudo | D1 | Mensual en temporada |
| R3 | Costo de adquisición por matrícula, por canal | D2 | Mensual en temporada |
| R4 | Pipeline temprano de preescolar | D1 | Trimestral |
| R5 | Renovación gestionada y captura de motivo de salida | D3 | En corte de renovación |
| R6 | Nivel de servicio y estándares operativos | D3 | Mensual |
| R7 | Protección de datos y veracidad de la información publicada | D4 | Mensual |
| R8 | Continuidad de activos digitales y dependencia de persona única | D5 | Trimestral |

### R1 · Cobertura de cupos por grado — D1
Matrícula lograda / meta por grado, con **conteo de grados fuera de banda**. Nunca como promedio: el 85% agregado actual oculta 83 cupos vacíos y 5 sobrecupos simultáneos.
La meta no es "llenar todo": es el techo del escalón vigente en cada grado sin cruzarlo. Alimenta el indicador 5a del Nivel 1.
**Banda bloqueada** por la decisión #4 del Nivel 1 (capacidad instalada oficial), que corresponde a Dirección General y Rectoría.

### R2 · Conversión por etapa del embudo — D1
Tasa de paso entre etapas — contacto → visita → inicio de proceso → matrícula — **desagregada por etapa y por grupo de edad objetivo**.
Las fallas se concentraron en las etapas de compromiso y en el grupo de edad más joven, algo invisible en la tasa global. La banda se fija por etapa, no sobre la conversión total.
**Doble condición con R1:** conversión excelente sobre base insuficiente no es buen desempeño.

### R3 · Costo de adquisición por matrícula, por canal — D2
Inversión del canal / matrículas atribuidas al canal. **Por canal, nunca agregado**: el hallazgo central del análisis fue que redes sociales consume la mayor parte del presupuesto y aporta una fracción menor de matrículas a costo mucho más alto.
**Contra-indicador embebido:** el costo puede "mejorar" recortando inversión y viviendo de demanda inercial. En banda solo si el costo cumple *y* el volumen de matrículas no cae.
**Limitación conocida:** la atribución de último toque subestima los canales de descubrimiento. El rediseño de la captura de origen queda como mejora del instrumento.

### R4 · Pipeline temprano de preescolar — D1
Aspirantes en proceso para los grados de entrada, con anticipación de al menos un ciclo.
Con Pre Jardín en 11 y Jardín en 23 frente a cursos de primaria de 44, la base de cohortes es más angosta que el cuerpo: la ocupación de dentro de cinco años ya está en buena medida determinada. **Es el único indicador del área que da señal con años de anticipación**; R1 lo detecta cuando ya no hay margen de reacción.

### R5 · Renovación gestionada y captura de motivo de salida — D3
Dos componentes en una banda: proporción de familias no renovantes con **motivo registrado y categorizado** según las cuatro categorías del indicador 6 del Nivel 1, y cumplimiento del proceso de renovación en calendario.
El área **no responde por la retención** — su causa raíz es mayormente académica y de convivencia — pero **sí responde por el proceso y por el dato**. Sin captura sistemática del motivo en el momento de la salida, el indicador 6 del Nivel 1 es inconstruible.
La entrevista de salida debe aplicarla alguien distinto de quien pudo haber originado la salida.

### R6 · Nivel de servicio y estándares operativos — D3
Índice por conteo: tiempo de respuesta a aspirante desde primer contacto y desde solicitud de información; calendario institucional publicado en fecha; canales oficiales actualizados; respuesta a familias actuales dentro de plazo; información de matrícula y costos vigente y correcta.

### R7 · Protección de datos y veracidad de la información publicada — D4
**Origen: Obligación. Sin banda intermedia.**
Cumplimiento del régimen de datos personales (Ley 1581/2012) en captación, formularios, bases de aspirantes y campañas: autorización, finalidad, tratamiento y conservación. Correspondencia entre lo publicado y lo aprobado en materia de costos educativos, autoevaluación y licencia de funcionamiento.
Es la exposición legal real del área y habitualmente no aparece en tableros de mercadeo.

### R8 · Continuidad de activos digitales y dependencia de persona única — D5
Procesos y activos críticos con un solo ejecutor o custodio: sitio web, CRM o base de aspirantes, cuentas institucionales, dominios, piezas y material de marca.
Cubierto solo si existe documentación vigente **y** un segundo responsable con acceso y capacidad demostrada.

### Descartados y por qué

| Candidato | Razón |
|---|---|
| Alcance, seguidores, interacciones, publicaciones, eventos | Actividad, no resultado. Viven en el reporte operativo, no en el acuerdo |
| Número de leads o contactos | Volumen sin calidad, maquillable de forma trivial. Ya contenido como denominador en R2 |
| Reputación o posicionamiento de marca | Sin instrumento; medición improvisada sería débil |
| Satisfacción de familias actuales | Conceptualmente el mejor indicador del frente comunidad. Requiere instrumento propio — no la encuesta de clima, que es de personal. **Diferido a segundo período** |
| Retención de estudiantes | Es indicador de Nivel 1. Aquí entra solo el proceso y el dato, vía R5 |

---

## 4. Talento Humano

**Frentes:** nómina · evaluación de desempeño · contratación · bienestar.

**Trampa dominante:** medir cobertura de procesos — capacitaciones dictadas, evaluaciones aplicadas, actividades de bienestar realizadas — en lugar de efecto. **Riesgo mayor:** que el área no tenga indicador de cumplimiento laboral duro, que es donde está la exposición real.

| Cód. | Indicador | Dim. | Frec. |
|---|---|---|---|
| T1 | Nómina correcta y oportuna | D1 | Mensual |
| T2 | Cobertura de planta y tiempo de cobertura de vacantes | D1 | Mensual |
| T3 | Rotación con clasificación de causa | D1 | Mensual acumulado |
| T4 | Ejecución de la nómina contra presupuesto | D2 | Mensual |
| T5 | Cumplimiento del ciclo de gestión del desempeño | D3 | Por ciclo |
| T6 | Estándares operativos y nivel de servicio interno | D3 | Mensual |
| T7 | Cumplimiento laboral y de SST | D4 | Mensual |
| T8 | Riesgo de continuidad del talento | D5 | Trimestral |

### T1 · Nómina correcta y oportuna — D1
**Doble condición:** pago en fecha *y* número de reclamaciones o correcciones posteriores bajo umbral. Pagar a tiempo con errores no es cumplimiento.
Con $12.248M anuales de nómina, un error sistemático es material.

### T2 · Cobertura de planta y tiempo de cobertura de vacantes — D1
Vacantes sobre planta aprobada y días desde la vacancia hasta la incorporación efectiva, **desagregado entre cargos docentes y no docentes**: una vacante docente prolongada afecta la operación escolar directamente; una administrativa no.
**Contra-indicador embebido:** en banda solo si el tiempo cumple *y* la vinculación pasó por el proceso completo de selección.

### T3 · Rotación con clasificación de causa — D1
Rotación anualizada separando **salida voluntaria**, no renovación por decisión del colegio y terminación por causa. Solo la primera mide lo que el indicador pretende.
Desagregada por sección y antigüedad. **La rotación docente en mitad de año escolar merece umbral más estricto**: es la que golpea la continuidad pedagógica.

### T4 · Ejecución de la nómina contra presupuesto — D2
Desviación bruta del gasto de personal, incluyendo horas extra, reemplazos, provisiones y liquidaciones.
Es el indicador de mayor impacto económico del área: la nómina es 59,5% de los ingresos netos y dos tercios del gasto total; un punto porcentual son ~$206M.
**Registro obligatorio de origen** con la clasificación del indicador 4 del Nivel 1: error de estimación / choque externo / decisión no autorizada.

### T5 · Cumplimiento del ciclo de gestión del desempeño — D3
Indicador de proceso aceptado con justificación explícita: el efecto de la evaluación no es medible en un ciclo, y el proceso es una directriz institucional ligada al modelo de liderazgo.
Se mide **cierre completo del ciclo** — evaluación aplicada, retroalimentación documentada y plan de desarrollo acordado — no aplicación del instrumento. Una evaluación sin conversación de retroalimentación no cuenta: es la diferencia entre cumplir el formato y ejercer accountability.
Se coordina con el módulo de evaluación de liderazgo previsto en Schoolnet.

### T6 · Estándares operativos y nivel de servicio interno — D3
Índice por conteo: certificados laborales en plazo, afiliaciones y novedades reportadas en término, tiempo de respuesta a solicitudes del personal.
**Contratos firmados antes del inicio de labores** recibe tratamiento de obligación, no de estándar: es incumplimiento laboral, no demora administrativa.

### T7 · Cumplimiento laboral y de SST — D4
**Origen: Obligación. Sin banda intermedia.**
Aportes a seguridad social y parafiscales en término, contratación formalizada, jornada y descansos conforme al Código Sustantivo del Trabajo, SG-SST vigente con plan de trabajo ejecutado, COPASST y comité de convivencia constituidos y operando, exámenes ocupacionales al día, reporte de accidentalidad.
Es la exposición real del portafolio y la que más frecuentemente falta en tableros de gestión humana.

### T8 · Riesgo de continuidad del talento — D5
Cargos críticos sin sucesor identificado ni capacidad de reemplazo interno, y concentración de conocimiento en persona única para procesos críticos del área — mismo criterio de verificación que C8, R8 y TI8.

### Descartados y por qué

| Candidato | Razón |
|---|---|
| Capacitaciones dictadas, horas de formación | Actividad. El indicador válido sería aplicación al puesto, sin instrumento hoy |
| Actividades de bienestar realizadas | Actividad pura. El resultado de bienestar es clima, con instrumento y periodicidad propios |
| Resultado de la encuesta de clima | Instrumento anual con lógica propia; su resultado depende de las cinco áreas y de lo académico. Convertirlo en indicador del área crea presión sobre la aplicación del instrumento |
| Ausentismo | Se solapa con SST en T7 y continuidad en T8. Entra como desagregación de lectura |

---

## 5. Tecnología

**Frentes:** redes · software · equipos · conectividad.

**Trampa dominante:** el tablero de mesa de ayuda — tickets cerrados, tiempos de respuesta, satisfacción con el soporte. Mide el frente más visible y el menos crítico. **Un área de TI con soporte impecable y respaldos no probados está en Crítico, no en verde.**

**Particularidad:** es la única área cuyo mal desempeño puede detener la operación escolar el mismo día, y es proveedora interna de las otras cuatro.

| Cód. | Indicador | Dim. | Frec. |
|---|---|---|---|
| TI1 | Disponibilidad de servicios críticos en jornada escolar | D1 | Mensual |
| TI2 | Respaldo y recuperación probados | D5 | Trimestral |
| TI3 | Mantenimiento preventivo y ciclo de vida del parque | D1 | Mensual |
| TI4 | Ejecución presupuestal y costo de servicios recurrentes | D2 | Mensual |
| TI5 | Nivel de servicio y estándares operativos | D3 | Mensual |
| TI6 | Seguridad y protección de datos | D4 | Mensual |
| TI7 | Gestión de proveedores y contratos tecnológicos | D3 | Mensual |
| TI8 | Dependencia de persona única y documentación de arquitectura | D5 | Trimestral |

### TI1 · Disponibilidad de servicios críticos en jornada escolar — D1
Disponibilidad de conectividad, plataformas académicas, Google Workspace y sistemas administrativos, medida **en horario de operación escolar**, no en 24/7: una caída a las 3 a.m. y una a las 10 a.m. no son el mismo evento.
Métrica en **usuario-jornada afectada**, con la misma unidad del indicador 8 del Nivel 1.

### TI2 · Respaldo y recuperación probados — D5
**El indicador más importante del área y el que casi nunca existe.**
No se mide que el respaldo esté configurado ni que corra: se mide **restauración efectivamente ejecutada y verificada** en el período, por sistema crítico, con tiempo de recuperación real contra el comprometido.
Un respaldo nunca restaurado no cuenta como respaldo.
**Origen:** necesidad institucional, no capacidad demostrada.

### TI3 · Mantenimiento preventivo y ciclo de vida del parque — D1
Cobertura de preventivo ejecutado contra programado, y proporción del parque fuera de su ciclo de vida definido.
El segundo componente anticipa el gasto: un parque envejecido produce fallas crecientes y presión de reposición no presupuestada. Conecta con el indicador 9 del Nivel 1 — el equipo de cómputo también es activo que se consume y se repone.

### TI4 · Ejecución presupuestal y costo de servicios recurrentes — D2
Desviación bruta con lectura separada de gasto recurrente (licencias, conectividad, nube) e inversión (equipos, infraestructura).
Componente específico: **licencias contratadas contra licencias efectivamente en uso**. Es el desperdicio típico del área y crece silenciosamente año a año.

### TI5 · Nivel de servicio y estándares operativos — D3
Tiempo de resolución **por severidad** — no promedio general, que oculta los incidentes graves detrás del volumen de solicitudes triviales — más índice por conteo de estándares: inventario de equipos actualizado, altas y bajas de usuarios ejecutadas el mismo día del ingreso o retiro, actualizaciones de seguridad aplicadas en ventana definida, monitoreo activo de servicios críticos.
**Altas y bajas:** una cuenta activa de una persona que ya salió es un hallazgo de seguridad y de datos personales, no una demora administrativa. Se coordina con T6.

### TI6 · Seguridad y protección de datos — D4
**Origen: Obligación. Sin banda intermedia.**
Cumplimiento del régimen de datos personales en los sistemas que custodian información de estudiantes, familias y personal: control de accesos, cifrado, registro de bases de datos, tratamiento por terceros y encargados, conservación. Incluye incidentes de seguridad y accesos indebidos.
**Un incidente con datos de menores de edad es Crítico automático y de reporte inmediato, sin importar magnitud.**

### TI7 · Gestión de proveedores y contratos tecnológicos — D3
Cumplimiento de niveles de servicio contratados por el proveedor, **y** gestión del contrato: vigencias controladas, renovaciones anticipadas, verificación de facturación contra consumo real, cláusulas de tratamiento de datos vigentes.
Sin el segundo componente, la jefatura queda como espectadora de su propio indicador.

### TI8 · Dependencia de persona única y documentación de arquitectura — D5
Sistemas críticos con un solo administrador o custodio de credenciales, y vigencia de la documentación de configuración y arquitectura.
En esta área el riesgo es más agudo que en las demás: la concentración incluye credenciales de administración y su pérdida puede ser irreversible.

### Descartados y por qué

| Candidato | Razón |
|---|---|
| Tickets cerrados, volumen de solicitudes | Actividad. Puede subir por deterioro del servicio |
| Satisfacción con el soporte | Mide el frente menos crítico. Entra como desagregación de TI5 |
| Proyectos tecnológicos entregados | Se solapa con D1. Entran como hitos dentro de TI3 o TI4 |
| Ancho de banda o capacidad instalada | Es medio, no resultado. El resultado es disponibilidad (TI1) |

---

## 6. Servicios Generales

**Frentes:** operador externo de transporte · aseo · mantenimiento · infraestructura · cafetería · tienda · seguridad.

**Tres particularidades que definen el diseño:**

1. **Casi todo lo ejecuta un tercero.** La jefatura gestiona contratos, no ejecuta servicios — salvo cafetería, de operación directa.
2. **Es el área con mayor exposición a la integridad física** de estudiantes y personal.
3. **Arrastra un pasivo estructural:** las ~12 estructuras de madera de más de 20 años del Plan Decenal.

| Cód. | Indicador | Dim. | Frec. |
|---|---|---|---|
| SG1 | Continuidad de servicios esenciales | D5 | Por evento / mensual |
| SG2 | Gestión de contratos con operadores | D3 | Mensual |
| SG3 | Cumplimiento normativo de instalaciones y contratistas | D4 | Mensual |
| SG4 | Mantenimiento preventivo y estado de la planta física | D1 | Mensual |
| SG5 | Mantenimiento diferido valorizado y avance del Plan Decenal | D1 / D2 | Trimestral |
| SG6 | Ejecución presupuestal y costo unitario de servicios | D2 | Mensual |
| SG7 | Estándares operativos y nivel de servicio interno | D3 | Mensual |
| SG8 | Cobertura y sostenibilidad del servicio de alimentación | D2 / D3 | Mensual |

### SG1 · Continuidad de servicios esenciales — D5
Interrupciones y degradaciones en transporte, alimentación, agua, energía y uso de instalaciones, en **estudiante-jornada afectada**, con la clasificación de dos ejes del indicador 8 del Nivel 1: **origen** (interno / externo / proveedor) y **desempeño de la respuesta** (previsto y contenido / previsto y no contenido / no previsto).
**El indicador de gestión es el segundo eje.** En La Calera, con dependencia de vía de acceso y clima de montaña, buena parte de las interrupciones será de origen externo. La causa es externa; la preparación no.
Incluye conteo de **cuasi-incidentes reportados**, que se premia explícitamente: más reportes es mejor desempeño.

### SG2 · Gestión de contratos con operadores — D3
**El indicador que impide que la jefatura sea espectadora de su propio tablero.** Dos componentes en una banda:
- **Desempeño del proveedor:** cumplimiento de niveles de servicio contratados, por operador.
- **Gestión del contrato:** verificación documentada del servicio recibido, facturación conciliada contra servicio prestado, vigencias y pólizas controladas, incumplimientos formalmente notificados y con seguimiento.

Un operador incumpliendo sin notificación formal es falla de gestión aunque la falla original sea del tercero.

### SG3 · Cumplimiento normativo de instalaciones y contratistas — D4
**Origen: Obligación. Sin banda intermedia.** Dos bloques de verificación reportados por separado, con un solo estado.

**Instalaciones y condiciones de operación:** instalaciones eléctricas (RETIE), protección contra rayos (NTC 4552), manipulación de alimentos (Resolución 2674/2013) en cafetería y tienda, rutas de evacuación, extintores y señalización, gestión de residuos, simulacros ejecutados con hallazgos documentados y cerrados — no simulacros como conteo.

**Obligaciones del contratista:** seguridad social de su personal, licencias y habilitaciones, seguros vigentes y — en transporte — revisión técnico-mecánica, licencias de conductores, condiciones del parque automotor y **verificación de antecedentes del personal con contacto con estudiantes**, de severidad máxima.

> La tercerización no traslada la obligación: el incumplimiento del operador sigue siendo exposición del colegio.

### SG4 · Mantenimiento preventivo y estado de la planta física — D1
Cobertura de preventivo ejecutado contra programado por tipo de activo, y **relación preventivo / correctivo**.
La relación es el indicador de tendencia real: un área que solo apaga incendios la tiene invertida y va a producir eventos de SG1 de forma creciente. Un correctivo alto no es mala gestión del mes: es evidencia de mantenimiento diferido acumulado de años anteriores.

### SG5 · Mantenimiento diferido valorizado y avance del Plan Decenal — D1 / D2
**El indicador que hace visible el pasivo estructural.**
Costo estimado de las intervenciones identificadas como necesarias y no ejecutadas, acumulado y por severidad; y avance de hitos del Plan Decenal **contra línea base, no contra cronograma reprogramado**.
Alimenta la métrica de mantenimiento diferido del indicador 9b del Nivel 1 y convierte el inventario de 33 ítems en cifra presentable al Consejo. El estudio de resistencia sísmica de las estructuras antiguas entra como hito, no como indicador aparte.

### SG6 · Ejecución presupuestal y costo unitario de servicios — D2
Desviación bruta con clasificación de origen, y costo unitario de los servicios: costo por estudiante transportado, **costo por ración**, costo de aseo por metro cuadrado.
El costo unitario permite evaluar renovaciones de contrato con criterio, no solo por precio total. En operación directa de cafetería, las sustituciones de ingredientes decididas fuera del proceso presupuestal golpean el margen propio, no el de un tercero.

### SG7 · Estándares operativos y nivel de servicio interno — D3
Índice por conteo: apertura y cierre de sedes, aseo por espacio y frecuencia, disponibilidad de espacios solicitados, tiempo de atención a solicitudes de mantenimiento por severidad, control de acceso y registro de visitantes.
Es el área donde las tensiones de accountability por tareas recurrentes son más probables: trabajo permanente, poco visible, que nadie considera logro y cuya falla se reporta tarde.

### SG8 · Cobertura y sostenibilidad del servicio de alimentación — D2 / D3
**La cafetería es de operación directa**, se cobra de 1° a 11° y en preescolar está incorporada en la pensión. Por tanto el costo fijo ya está incurrido y **cada usuario adicional aporta casi íntegro al margen** — misma lógica del cupo vacío del indicador 5a.

Tres componentes en una banda:
- **Cobertura:** usuarios inscritos / matrícula de 1° a 11°, desagregada por sección. Primaria y bachillerato tienen decisores distintos — en primaria decide la familia, en bachillerato pesa el estudiante. Cobertura actual aproximada: **60%**.
- **Asistencia efectiva sobre inscritos**, como control de merma: se factura al inscrito y se produce según lo esperado; la diferencia es costo sin contraprestación.
- **Punto de equilibrio del servicio:** cobertura mínima a la que el servicio cubre su costo fijo. Es el dato que convierte el indicador en decisión y hoy no está calculado.

**Doble condición:** en banda solo si la cobertura cumple *y* el cumplimiento de la política nutricional se mantiene. Crecer degradando el estándar no es desempeño.
Se lee con el costo por ración de SG6: si la cobertura sube y el costo por ración no baja, el beneficio no llegó a la institución.

**Captura de causa de no uso.** Un indicador de cobertura sin causa repite el error del indicador 6 del Nivel 1: mide cuando la decisión ya se tomó. Si el motivo no se registra en su momento, ningún análisis posterior lo recupera.

> **Advertencia sobre la banda.** La cobertura puede subir por decisión normativa — restringir loncheras — y no por gestión del servicio. El alcance de la política de alimentación en ese punto está pendiente (decisión #11). La banda debe fijarse después de esa decisión, o el indicador arranca el primer ciclo en observación sin banda.

**Tienda escolar: excluida deliberadamente.** Un indicador de crecimiento de usuarios en la tienda sería un incentivo institucional a aumentar el consumo de menores en un punto de venta, en tensión con la política de alimentación y con el espíritu de la Ley 1355/2009. Si la jefatura lo propone, se veta.

### Descartados y por qué

| Candidato | Razón |
|---|---|
| Satisfacción con el transporte | Sin instrumento propio hoy. Entra como desagregación de SG2 cuando exista medición |
| Consumo de servicios públicos | Depende del clima, la ocupación y el calendario más que de la gestión. Entra como desagregación de SG6 |
| Política de alimentación y sustitución de plásticos | Proyectos institucionales con gobierno propio. Sus obligaciones normativas ya están en SG3 |
| Número de mantenimientos realizados | Actividad. El resultado es estado de la planta y continuidad (SG4, SG1) |

---

## 7. Fronteras entre áreas

Varios asuntos tienen componentes en más de un área. Sin frontera explícita, o quedan huérfanos o se duplican.

| Asunto | Dueño del resultado | Aporte de la otra área | Consolidación |
|---|---|---|---|
| **Continuidad de sistemas y respaldos** | Tecnología (TI2) | Cada área dueña del dato define su tiempo de recuperación comprometido | Nivel 1 · Ind. 8 |
| **Protección de datos personales** | Fragmentado: captación (R7), custodia técnica (TI6), datos de personal (T7) | Ninguna cubre el total | Nivel 1 · Ind. 7 |
| **Altas y bajas de usuarios** | Tecnología ejecuta (TI5) | Talento Humano notifica la novedad en término (T6) | Un retiro no notificado es falla de T6, no de TI5 |
| **Proveedores y contratos** | Servicios Generales (SG2) para operadores de servicio; Tecnología (TI7) para proveedores tecnológicos | Contabilidad aporta proceso de compra y pago (C4, C5) | — |
| **Nómina** | Talento Humano produce y responde (T1, T4) | Contabilidad registra, provisiona y paga (C1, C5) | Nivel 1 · Ind. 2 |
| **Cafetería** | Servicios Generales opera (SG8, SG6) | Contabilidad factura y gestiona cartera (C3) | Nivel 1 · Ind. 1, 3 |
| **Mantenimiento diferido y Plan Decenal** | Servicios Generales (SG5) | DAFI consolida y decide priorización | Nivel 1 · Ind. 9b |
| **Retención de estudiantes** | Nivel 1 · Ind. 6, causa raíz mayormente académica | Relacionamiento responde por proceso y captura del dato (R5); Contabilidad por el componente de cartera (C3) | Nivel 1 · Ind. 6 |
| **Ocupación** | Nivel 1 · Ind. 5a | Relacionamiento tiene la palanca (R1, R2, R4); la capacidad instalada la define Rectoría | Nivel 1 · Ind. 5a |

**Regla general para fronteras:** cuando un resultado depende de dos áreas, se asigna a la que tiene la palanca principal, y la otra recibe un indicador del **insumo que debe entregar**, no del resultado compartido. Duplicar el resultado en ambas diluye la responsabilidad.

---

## 8. Trazabilidad Nivel 3 → Nivel 1

| Indicador Nivel 1 | Alimentado por |
|---|---|
| 1 · Margen operacional | C1, C2, T4, TI4, SG6, SG8 |
| 2 · Cobertura de nómina | T1, T4, T2 |
| 3 · Costo por estudiante vs. tarifa | T4, SG6, TI4, C2 |
| 4 · Desviación presupuestal bruta | C1 (medición), T4, TI4, SG6 (ejecución por área) |
| 5a · Ocupación | R1, R2 |
| 5b · Holgura sobre punto de equilibrio | R1, R4 |
| 6 · Retención | R5 (proceso y dato), C3 (componente cartera), T3 (rotación docente como causa indirecta) |
| 7 · Hallazgos de cumplimiento | C6, C7, R7, T7, TI6, SG3 |
| 8 · Continuidad operacional | SG1, TI1, TI2 |
| 9a · Ratio de reposición | SG5, TI3 |
| 9b · Ejecución del plan de inversión | SG5, TI3, TI4 |

**Verificación de cobertura:** los once indicadores del Nivel 1 tienen al menos una fuente en el Nivel 3. Ningún indicador del Nivel 3 queda huérfano de propósito institucional.

---

## 9. Pendientes consolidados

### 9.1 Bloqueados por decisión de terceros

| Pendiente | Indicador | Responsable |
|---|---|---|
| Capacidad instalada oficial por curso | R1, R2 | Dirección General / Rectoría |
| Alcance de la política de alimentación sobre loncheras | SG8 | Consejo Directivo / Rectoría |

### 9.2 Entregables habilitantes de cada jefatura

| Entregable | Área | Habilita |
|---|---|---|
| Inventario de procesos críticos | Contabilidad | C8 |
| Lista de estándares operativos | Contabilidad | C5 |
| Instrumento de captura de motivo de salida | Relacionamiento | R5 |
| Inventario de activos digitales y custodios | Relacionamiento | R8 |
| Definición de cargos críticos | Talento Humano | T8 |
| **Inventario de sistemas críticos con clasificación de criticidad** | Tecnología | TI1, TI2, TI8 |
| Definición de ciclo de vida por tipo de equipo | Tecnología | TI3 |
| Programa de mantenimiento preventivo por tipo de activo | Servicios Generales | SG4 |
| Criterio de severidad para solicitudes de mantenimiento | Servicios Generales | SG7 |
| Inventario valorizado de mantenimiento diferido | Servicios Generales | SG5 |

### 9.3 Pendientes de mayor riesgo

| # | Pendiente | Por qué es crítico |
|---|---|---|
| 1 | **Niveles de servicio contratados explícitos y medibles por operador** (SG2) | Si los contratos vigentes no los tienen, el indicador no es construible. El pendiente real es una revisión contractual, no una decisión de medición |
| 2 | **Inventario de sistemas críticos** (TI1, TI2, TI8) | Prerrequisito de tres indicadores. Es lo primero que debe producir el área |
| 3 | **Costeo del inventario de mantenimiento diferido** (SG5) | Depende de las cotizaciones pendientes del hito H2 del Plan Decenal |
| 4 | **Ajuste del formulario de admisión** (R4) | El formulario actual confunde aspirantes de año en curso con años futuros; puede requerir rediseño antes de ser medible |
| 5 | **Cálculo del punto de equilibrio del servicio de alimentación** (SG8) | Sin él, la cobertura es un dato sin criterio de decisión |

### 9.4 Diferidos al segundo período

| Indicador | Área | Razón |
|---|---|---|
| Utilidad de la información para decidir | Contabilidad | Sin instrumento; encuesta interna sería débil en primer ciclo |
| Satisfacción de familias actuales | Relacionamiento | Requiere instrumento propio, distinto de la encuesta de clima |
| Aplicación al puesto de la formación recibida | Talento Humano | Sin instrumento |
| Satisfacción con transporte y con soporte técnico | Servicios Generales / Tecnología | Sin medición sistemática |

---

## 10. Expectativa de arranque

Las cinco áreas no partirán del mismo punto. El número de indicadores en estado **"En construcción"** es en sí mismo la métrica de la deuda de instrumentación:

| Área | Expectativa de arranque |
|---|---|
| **Contabilidad** | Instrumentación alta. Probablemente solo C8 en construcción |
| **Talento Humano** | Instrumentación media. T8 en construcción; T3 posiblemente sin banda por falta de histórico |
| **Relacionamiento** | Dos o tres en construcción: R4, R5, R8 |
| **Tecnología** | TI2 y TI8 en construcción. **TI6, por ser de origen Obligación, no admite estado "En construcción" indefinido**: si el dato no existe, la verificación debe hacerse, no esperarse |
| **Servicios Generales** | Deuda más profunda. Varios indicadores dependen de documentos contractuales y de costeo inexistentes |

Esto no es fracaso del marco ni de las jefaturas: es diagnóstico. El plan de implementación es necesariamente más largo que la definición.
