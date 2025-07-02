anioSeleccionado = '';
periodoSeleccionado = '';
grupoSeleccionado = '';
profesorSeleccionado = '';
materiaSeleccionada = '';
horaInicioSeleccionada = '';
horaFinSeleccionada = '';
diaSeleccionado = '';
registroAsistenciaSeleccionado = '';

const contenedorAsistencia = document.querySelector('.contenedor-select[data-type="asistencia"]');
const contenedorAnio = document.querySelector('.contenedor-select[data-type="anio"]');
const contenedorPeriodo = document.querySelector('.contenedor-select[data-type="periodo"]');
const contenedorDia = document.querySelector('.contenedor-select[data-type="dia"]');
const contenedorGrupo = document.querySelector('.contenedor-select[data-type="grupo"]');
const contenedorProfesor = document.querySelector('.contenedor-select[data-type="profesor"]');
const contenedorMateria = document.querySelector('.contenedor-select[data-type="materia"]');
const contenedorHoraInicio = document.querySelector('.contenedor-select[data-type="horaInicio"]');
const contenedorHoraFin = document.querySelector('.contenedor-select[data-type="horaFin"]');



document.addEventListener('DOMContentLoaded', async () => {

    try {
        const response = await fetch('/api/filtros');
        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                `No se encontraron datos para llenar los filtros.`
              );
            console.error("Los datos están vacíos o no tienen la estructura esperada.");
            return;
        }

        llenarSelect('dia', data.dias);
        llenarSelect('grupo', data.grupos);
        llenarSelect('profesor', data.profesores);
        llenarSelect('materia', data.materias);
        llenarSelect('horaInicio', data.horasInicio);
        llenarSelect('horaFin', data.horasFin);
        llenarSelect('anio', data.anios);
        llenarSelect('periodo', data.periodos);

inicializarEventosAsis();
                        inicializarEventosFiltros();
                        



    } catch (error) {
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            `Hubo un problema al cargar los filtros.`
          );
        console.error('Error al cargar los filtros:', error);
    }
});

function llenarSelect(tipo, datos) {
            const contenedor = document.querySelector(`.contenedor-select[data-type="${tipo}"]`);
            if (!contenedor) {
                console.error(`No se encontró el select con tipo: ${tipo}`);
                return;
            }
        
            const opciones = contenedor.querySelector('.opciones');
            opciones.innerHTML = '';

             
        const limpiarLi = document.createElement('li');
        limpiarLi.className = 'limpiar-seleccion';
        limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
        limpiarLi.onclick = function() {
            limpiarFiltro(tipo, contenedor);
        };
        opciones.appendChild(limpiarLi);
    
        
            datos.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                li.setAttribute('data-value', item);
                li.onclick = function() {
                    seleccionarOpcionFiltro(this, tipo);
                };
                opciones.appendChild(li);
            });
        }

         function seleccionarAsistencia(opcion) {
            // Animación
            opcion.style.transform = 'scale(0.98)';
            setTimeout(() => opcion.style.transform = '', 150);
            
            // Actualizar variable y UI
            registroAsistenciaSeleccionado = opcion.dataset.value;
            contenedorAsistencia.querySelector('.boton-select span').textContent = opcion.textContent;
            
            // Marcar como seleccionado
            contenedorAsistencia.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            opcion.classList.add('seleccionado');
            
            // Cerrar select
            cerrarSelect(contenedorAsistencia);
            
        }

        function seleccionarOpcionFiltro(opcion, tipo) {
            // Animación
            opcion.style.transform = 'scale(0.98)';
            setTimeout(() => opcion.style.transform = '', 150);
            
            // Actualizar variable correspondiente
            switch(tipo) {
                case 'anio': anioSeleccionado = opcion.dataset.value; break;
                case 'periodo': periodoSeleccionado = opcion.dataset.value; break;
                case 'dia': diaSeleccionado = opcion.dataset.value; break;
                case 'grupo': grupoSeleccionado = opcion.dataset.value; break;
                case 'profesor': profesorSeleccionado = opcion.dataset.value; break;
                case 'materia': materiaSeleccionada = opcion.dataset.value; break;
                case 'horaInicio': horaInicioSeleccionada = opcion.dataset.value; break;
                case 'horaFin': horaFinSeleccionada = opcion.dataset.value; break;
            }
            
            // Actualizar UI
            const contenedor = opcion.closest('.contenedor-select');
            contenedor.querySelector('.boton-select span').textContent = opcion.textContent;
            
            // Marcar como seleccionado
            contenedor.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            opcion.classList.add('seleccionado');
            contenedor.classList.add('filtro-activo');
            
            // Cerrar select
            cerrarSelect(contenedor);
        }

        function limpiarFiltro(tipo, contenedor) {
    if (!contenedor) return;
    
    // Limpiar la variable correspondiente
    switch(tipo) {
        case 'anio': anioSeleccionado = ''; break;
        case 'periodo': periodoSeleccionado = ''; break;
        case 'dia': diaSeleccionado = ''; break;
        case 'grupo': grupoSeleccionado = ''; break;
        case 'profesor': profesorSeleccionado = ''; break;
        case 'materia': materiaSeleccionada = ''; break;
        case 'horaInicio': horaInicioSeleccionada = ''; break;
        case 'horaFin': horaFinSeleccionada = ''; break;
        case 'asistencia': registroAsistenciaSeleccionado = ''; break;
    }
    
    // Actualizar UI
    const defaultText = `Seleccione ${tipo === 'anio' ? 'AÑO' : 
                       tipo === 'periodo' ? 'PERIODO' :
                       tipo === 'dia' ? 'DÍA' :
                       tipo === 'grupo' ? 'GRUPO' :
                       tipo === 'profesor' ? 'PROFESOR' :
                       tipo === 'materia' ? 'MATERIA' :
                       tipo === 'asistencia' ? 'ASISTENCIA' :
                       tipo === 'horaInicio' ? 'HORA INICIO' : 'HORA FIN'}`;
    
    const span = contenedor.querySelector('.boton-select span');
    if (span) span.textContent = defaultText;
    
    // Limpiar selección visual
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    contenedor.classList.remove('filtro-activo');
    
    // Cerrar el select
    cerrarSelect(contenedor);
    
    // Volver a filtrar
    filtrarHorarios();
}

function inicializarEventosAsis() {
    if (!contenedorAsistencia) {
        console.error('Contenedor de asistencia no encontrado');
        return;
    }

    const botonSelect = contenedorAsistencia.querySelector('.boton-select');
    const opcionesContainer = contenedorAsistencia.querySelector('.opciones'); // Cambiado de 'opciones' a 'opcionesContainer'
    
    if (!botonSelect || !opcionesContainer) {
        console.error('Elementos no encontrados en contenedorAsistencia', {
            botonSelect: !!botonSelect,
            opcionesContainer: !!opcionesContainer
        });
        return;
    }

     const limpiarLi = document.createElement('li');
        limpiarLi.className = 'limpiar-seleccion';
        limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
        limpiarLi.onclick = function() {
            limpiarFiltro('asistencia', contenedorAsistencia);
        };
        
    opcionesContainer.insertBefore(limpiarLi, opcionesContainer.firstChild);
    

    // 1. Configurar evento de apertura/cierre
    botonSelect.addEventListener('click', function(e) {
        e.stopPropagation();
        contenedorAsistencia.classList.toggle('activo');
    });

      

    // 2. Configurar eventos para las opciones existentes
    const opciones = opcionesContainer.querySelectorAll('li:not(.limpiar-seleccion)');
    opciones.forEach(opcion => {
        opcion.addEventListener('click', function() {
            registroAsistenciaSeleccionado = this.getAttribute('data-value');
            botonSelect.querySelector('span').textContent = this.textContent;
            
            // Marcar como seleccionado
            opciones.forEach(li => li.classList.remove('seleccionado'));
            this.classList.add('seleccionado');
            
            cerrarSelect(contenedorAsistencia);
            filtrarHorarios();
        });
    });

   

    console.log('Eventos de asistencia inicializados correctamente');
}
function inicializarEventosFiltros() {
            const contenedores = [
                contenedorAnio, contenedorPeriodo, contenedorDia, contenedorGrupo, contenedorProfesor, 
                contenedorMateria, contenedorHoraInicio, contenedorHoraFin
            ];
        
            contenedores.forEach(contenedor => {
                if (!contenedor) return;
        
                const botonSelect = contenedor.querySelector('.boton-select');
                const inputBusqueda = contenedor.querySelector('.buscador input');
                const opciones = contenedor.querySelector('.opciones');
                const tipo = contenedor.dataset.type;
        
                // Abrir/cerrar select
                botonSelect.addEventListener('click', (e) => {
                    e.stopPropagation();
                    contenedor.classList.toggle('activo');
                    
                    if (contenedor.classList.contains('activo') && inputBusqueda) {
                        inputBusqueda.focus();
                    }
                });
        
                // Búsqueda
                if (inputBusqueda) {
                    inputBusqueda.addEventListener('input', () => {
                        const busqueda = inputBusqueda.value.toLowerCase();
                        const items = opciones.querySelectorAll('li');
                        
                        items.forEach(item => {
                            const texto = item.textContent.toLowerCase();
                            item.style.display = texto.includes(busqueda) ? 'flex' : 'none';
                        });
                    });
                }
        
                // Limpiar selección (doble clic)
               
            });
        
            
            // Cerrar selects al hacer clic fuera
           document.addEventListener('click', (e) => {
    contenedores.forEach(contenedor => {
        if (contenedor && !contenedor.contains(e.target)) {
            cerrarSelect(contenedor);
        }
    });
});
            
            
            // Evento para filtrar
        }
        
        // Función para cerrar select
        function cerrarSelect(contenedor) {
            if (!contenedor) return;
            
            const contenidoSelect = contenedor.querySelector('.contenido-select');
            if (!contenidoSelect) return;
            
            contenidoSelect.style.opacity = '0';
            contenidoSelect.style.transform = 'translateY(-15px)';
            
            setTimeout(() => {
                contenedor.classList.remove("activo");
                contenidoSelect.style.opacity = '';
                contenidoSelect.style.transform = '';
            }, 300);
        }

// Evento para abrir el select

let alerta = document.querySelector(".alerta");

function createToast(type, icon, title, text) {
    let newToast = document.createElement("div");
    newToast.innerHTML = `
        <div class="toast ${type}">
            <div class="icono">
                <i class="${icon}"></i>
            </div>
            <div class="content">
                <div class="title">${title}</div>
                <span>${text}</span>
            </div>
            <i style="cursor: pointer;" class="close fa-solid fa-xmark"
               onclick="(this.parentElement).remove()"></i>
        </div>`;

    alerta.appendChild(newToast);
    newToast.timeOut = setTimeout(() => newToast.remove(), 5000);
}


const style = document.createElement('style');
style.textContent = `
  .no-horarios-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #666;
    font-size: 1.2rem;
  }
  .no-horarios-message i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #aaa;
  }
`;
document.head.appendChild(style);

    //--------------------------------------------------------------- CODIGO CONSULTA --------------------------
    const contenedor = document.getElementById("horario");
    contenedor.innerHTML = `
  
`;

    // Función para obtener los datos de la consulta
    async function fetchConsulta() {
        try {
            const response = await fetch('/api/consulta');
            const contentType = response.headers.get('content-type');
            
            // Verificar si la respuesta es JSON válido
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta no es JSON válido');
            }
    
            const result = await response.json();
            
            // Verificar estructura de respuesta
            if (!result || typeof result !== 'object') {
                throw new Error('Estructura de respuesta inválida');
            }
    
            // Manejar errores del servidor
            if (!result.success) {
                throw new Error(result.message || 'Error en el servidor');
            }
    
            // Caso sin datos
            if (result.count === 0 || !result.data || result.data.length === 0) {
                mostrarMensajeNoDatos(result.message || 'No hay registros disponibles');
                return;
            }
    
            // Caso con datos válidos
            mostrar(result.data);
            
        } catch (error) {
            console.error('Error en fetchConsulta:', error);
            mostrarMensajeError(error);
            
        }
    }
    
    // Nueva función para mostrar mensaje de "no hay datos"
    function mostrarMensajeNoDatos() {
        contenedor.innerHTML = `
            <div class="no-horarios-message">
                <i class="fas fa-database"></i>
                <p>No se encontraron registros de asistencia</p>
            </div>
        `;
        createToast(
            "advertencia",
            "fa-solid fa-triangle-exclamation",
            "Información",
            "No hay registros de asistencia para mostrar."
        );
    }
    
    // Nueva función para mostrar mensaje de error
    function mostrarMensajeError() {
        contenedor.innerHTML = `
            <div class="no-horarios-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los datos</p>
            </div>
        `;
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            "Hubo un problema al cargar los datos."
        );
    }

    // Función para mostrar los datos de la consulta en la tabla
    function mostrar(consulta) {
        console.log("Mostrando usuarios:", consulta); // Verifica los datos recibidos del servidor
        let resultados = '';

        // Filtrar los datos según algún criterio si es necesario
        // const consultaFiltrada = consulta.filter(item => item.algunCriterio);

        consulta.forEach(item => {
            resultados += `
                
                <div class="horario-card">
						<div class="horario-header">
							<span><b>Grupo</b></span>
							<span><b>Profesor</b></span>
							<span><b>Materia</b></span>
							<span><b>Hora</b></span>
                            <span><b>Fecha</b></span>
							<span><b>Fecha</b></span>
							<span><b>Estado</b></span>
						</div>
						<div class="horario-content">
							<span>${item.grupo}</span>
							<span>${item.persona}</span>
							<span>${item.materia}</span>
							<span>${item.hora_inicio} - ${item.hora_final}</span>
                            <span>${item.dia_horario}</span>
							<span>${item.fecha_asistencia}</span>
						
                
            `;

             // Añadir la columna de asistencia solo si es 1
             if (item.asistencia === 1) {
                resultados += `<span class="asis">Asistencia</span>`;
            }

            // Añadir la columna de falta solo si es 1
            if (item.falta === 1) {
                resultados += `<span class="falta">Falta</span>`;
            }

            // Añadir la columna de retardo solo si es 1
            if (item.retardo === 1) {
                resultados += `<span class="ret">Retardo</span>`;
            }

            resultados += `</div>
					</div>`;

        });

        // Mostrar los resultados en el contenedor
        contenedor.innerHTML = resultados;


        document.getElementById("filterBtn").replaceWith(document.getElementById("filterBtn").cloneNode(true));
    document.getElementById("filterBtn").addEventListener("click", filtrarHorarios);

    
    
    async function filtrarHorarios() {
        const fecha = document.getElementById("fecha").value;
      
        const anioFiltro = contenedorAnio ? Number(contenedorAnio) : null;
        const periodoFiltro = contenedorPeriodo ? Number(contenedorPeriodo) : null;
    
    
        try {
            const response = await fetch("/api/consulta");
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const resultado = await response.json();
        
            // Verificar si la respuesta tiene la estructura esperada
            if (!resultado.success || !Array.isArray(resultado.data)) {
                throw new Error('Estructura de datos inválida');
            }
    
            const consulta = resultado.data; // Accedemos al array dentro de data
            
            
    
            const horariosFiltrados = consulta.filter(consulta => {

                const fechaAsistencia = consulta.fecha_asistencia; 

                const [year, month, day] = fecha.split("-"); 
                const fechaUsuario = `${day}/${month}/${year.slice(-2)}`;


                console.log("Fecha de asistencia:", fechaAsistencia);
                console.log("Fecha convertida:", fechaUsuario);

                const estadoAsistencia = consulta.asistencia; // 1 si tiene asistencia
                const estadoRetardo = consulta.retardo; // 1 si tiene retardo
                const estadoFalta = consulta.falta; // 1 si tiene falta

                const filtroAsistencia = registroAsistenciaSeleccionado === "asis" ? estadoAsistencia === 1 :
                                     registroAsistenciaSeleccionado === "ret" ? estadoRetardo === 1 :
                                     registroAsistenciaSeleccionado === "falt" ? estadoFalta === 1 :
                                     true;

                return (
                    (grupoSeleccionado === '' || consulta.grupo === grupoSeleccionado) &&
                    (diaSeleccionado === '' || consulta.dia_horario === diaSeleccionado) &&
                    (profesorSeleccionado === '' || consulta.persona === profesorSeleccionado) &&
                    (!fecha || fechaAsistencia === fechaUsuario) && // Comparación de fechas sin la hora
                    (materiaSeleccionada === '' || consulta.materia === materiaSeleccionada) &&
                    (horaInicioSeleccionada === '' || consulta.hora_inicio === horaInicioSeleccionada) &&
                    (horaFinSeleccionada === '' || consulta.hora_final === horaFinSeleccionada) &&
                    (!anioFiltro || Number(consulta.anio) === anioFiltro) &&
                    (!periodoFiltro || Number(consulta.periodo) === periodoFiltro) &&
                    filtroAsistencia
                );
            });
    
            if (horariosFiltrados.length === 0) {
                console.log("No se encontraron horarios que coincidan con los filtros.");
                createToast(
                    "advertencia",
                    "fa-solid fa-triangle-exclamation",
                    "Aguas",
                    "No se encontraron horarios que coincidan con los filtros seleccionados."
                );
                return; 
            }
    
            mostrar(horariosFiltrados);
        } catch (error) {
            console.error("Error al obtener los horarios:", error);
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                "Hubo un problema al cargar los horarios."
            );
            document.getElementById("horario").innerHTML =
                '<tr><td colspan="6">Error al cargar los horarios</td></tr>';
        }


        }

   document.getElementById("resetFiltersButton").addEventListener("click", function() {
    // Limpiar variables
    anioSeleccionado = '';
    periodoSeleccionado = '';
    grupoSeleccionado = '';
    profesorSeleccionado = '';
    materiaSeleccionada = '';
    horaInicioSeleccionada = '';
    horaFinSeleccionada = '';
    diaSeleccionado = '';
    registroAsistenciaSeleccionado = '';
    
    // Limpiar UI de todos los filtros
    const tipos = ['anio', 'periodo', 'dia', 'grupo', 'profesor', 'materia', 'horaInicio', 'horaFin'];
    tipos.forEach(tipo => {
        const contenedor = document.querySelector(`.contenedor-select[data-type="${tipo}"]`);
        if (contenedor) {
            const defaultText = `Seleccione ${tipo === 'anio' ? 'AÑO' : 
                               tipo === 'periodo' ? 'PERIODO' :
                               tipo === 'dia' ? 'DÍA' :
                               tipo === 'grupo' ? 'GRUPO' :
                               tipo === 'profesor' ? 'PROFESOR' :
                               tipo === 'materia' ? 'MATERIA' :
                               tipo === 'horaInicio' ? 'HORA INICIO' : 'HORA FIN'}`;
            
            const span = contenedor.querySelector('.boton-select span');
            if (span) span.textContent = defaultText;
            
            contenedor.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            contenedor.classList.remove('filtro-activo');
        }
    });
    
    // Limpiar fecha si existe
    const fechaInput = document.getElementById("fecha");
    if (fechaInput) fechaInput.value = '';
    
    // Volver a filtrar
    filtrarHorarios();
});
    

    }
    
    

    fetchConsulta();

    //------------------------------------------------------------ FIN CODIGO CONSULTA -----------------------------------
