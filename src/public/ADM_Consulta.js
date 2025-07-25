anioSeleccionado = '';
periodoSeleccionado = '';
grupoSeleccionado = '';
profesorSeleccionado = '';
materiaSeleccionada = '';
horaInicioSeleccionada = '';
horaFinSeleccionada = '';
diaSeleccionado = '';
registroAsistenciaSeleccionado = '';



function showLoading(show) {
  if (show) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    overlay.id = 'loading-overlay';
    document.body.appendChild(overlay);
  } else {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
  }
}


// Agregar evento para el input de fecha
const fechaInput = document.getElementById("fecha");
if (fechaInput) {
    fechaInput.addEventListener('change', function() {
        console.log("Fecha seleccionada:", this.value);
        filtrarHorarios();
    });
}

    
   async function filtrarHorarios() {
    showLoading(true);
    
    try {
        // Verificar que tenemos datos en caché
        if (!window.horariosCache) {
            await fetchConsulta();
            return;
        }
        
        const fechaInput = document.getElementById("fecha")?.value;
        
        // Filtrar sobre los datos en caché
        let horariosFiltrados = window.horariosCache.filter(item => {
            if (fechaInput && item.fecha_asistencia !== fechaInput) return false;
            if (grupoSeleccionado && item.grupo !== grupoSeleccionado) return false;
            if (diaSeleccionado && item.dia_horario !== diaSeleccionado) return false;
            if (profesorSeleccionado && item.persona !== profesorSeleccionado) return false;
            if (materiaSeleccionada && item.materia !== materiaSeleccionada) return false;
            if (horaInicioSeleccionada && item.hora_inicio !== horaInicioSeleccionada) return false;
            if (horaFinSeleccionada && item.hora_final !== horaFinSeleccionada) return false;
            if (anioSeleccionado && String(item.anio) !== anioSeleccionado) return false;
            if (periodoSeleccionado && (item.periodo) !== periodoSeleccionado) return false;
            if (registroAsistenciaSeleccionado === "asis" && item.asistencia !== 1) return false;
            if (registroAsistenciaSeleccionado === "ret" && item.retardo !== 1) return false;
            if (registroAsistenciaSeleccionado === "falt" && item.falta !== 1) return false;
            
            return true;
        });

        // Ordenar y limitar
        horariosFiltrados = horariosFiltrados
            .sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia))
            .slice(0, 50);
        
        if (horariosFiltrados.length === 0) {
            mostrarMensajeNoDatos();
        } else {
            mostrar(horariosFiltrados);
        }
    } catch (error) {
        console.error("Error al filtrar:", error);
        mostrarMensajeError(error);
    } finally {
        showLoading(false);
    }
}

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
        if (tipo === 'periodo') {
        datos.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.texto; // Mostrar el texto descriptivo
            li.setAttribute('data-value', item.valor); // Guardar el valor numérico
            li.onclick = function() {
                seleccionarOpcionFiltro(this, tipo);
            };
            opciones.appendChild(li);
        });
    } else {
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

            console.log(`Filtro ${tipo} seleccionado:`, opcion.dataset.value);

            filtrarHorarios();
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
    const defaultText = `Filtre por ${tipo === 'anio' ? 'AÑO' : 
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

   window.horariosCache = null;

async function fetchConsulta() {
    showLoading(true);
    
    try {
        if (!window.horariosCache) {
            const response = await fetch('/api/consulta');
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const result = await response.json();
            if (!result?.success) throw new Error(result.message || 'Estructura inválida');
            
            // Guardar en caché los datos originales
            window.horariosCache = result.data;
            
            // Ordenar y limitar los datos iniciales
            const datosIniciales = result.data
                .sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia))
                .slice(0, 50);
                
            mostrar(datosIniciales);
        } else {
            // Si ya tenemos caché, mostrar los 50 más recientes
            const datosIniciales = window.horariosCache
                .sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia))
                .slice(0, 50);
                
            mostrar(datosIniciales);
        }
    } catch (error) {
        console.error('Error en fetchConsulta:', error);
        mostrarMensajeError(error);
    } finally {
        showLoading(false);
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
                            <span><b>Día</b></span>
							<span><b>Fecha</b></span>
							<span><b>Estado</b></span>
						</div>
						<div class="horario-content">
							<span data-label="Grupo">${item.grupo}</span>
							<span data-label="Profesor">${item.persona}</span>
							<span data-label="Materia">${item.materia}</span>
							<span data-label="Hora">${item.hora_inicio} - ${item.hora_final}</span>
                            <span data-label="Día">${item.dia_horario}</span>
							<span data-label="Fecha">${item.fecha_asistencia}</span>
						
                
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
            const defaultText = `Filtre por ${tipo === 'anio' ? 'AÑO' : 
                               tipo === 'periodo' ? 'PERIODO' :
                               tipo === 'dia' ? 'DÍA' :
                               tipo === 'grupo' ? 'GRUPO' :
                               tipo === 'profesor' ? 'PROFESOR' :
                               tipo === 'materia' ? 'MATERIA' :
                               tipo === 'horaInicio' ? 'HORA INICIO' : 
                                 tipo === 'horaFin' ? 'HORA FIN' :
                                 tipo === 'asistencia' ? 'ASISTENCIA' : ''
                               }`;
            
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

