 let turnoSeleccionado = null;
let salonSeleccionado = 'todas';
let grupoSeleccionado = 'todas';
let profesorSeleccionado = 'todas';
let materiaSeleccionada = 'todas';
let horaInicioSeleccionada = 'todas';
let horaFinSeleccionada = 'todas';

const mesActual = new Date().getMonth() + 1; // +1 para que sea 1-12

// Determinar el semestre (4 para agosto-enero, 5 para febrero-julio)
const semestre = (mesActual >= 8 || mesActual <= 1) ? 5 : 6;


async function filtrarHorarios() {

    const turno = turnoSeleccionado; 
  if (!turno) {
    createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Atención', 'Debes seleccionar un turno primero');
    return;
  }


  
    try {
      const response = await fetch("/api/horarios");
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      const horarios = await response.json();

      const horariosSemestre2 = horarios.filter(
        (horario) => horario.sem_grupo === semestre
      );

      console.log("turnoSeleccionado:", turnoSeleccionado);
      console.log("salonSeleccionado:", salonSeleccionado);
      console.log("grupoSeleccionado:", grupoSeleccionado);
      console.log("profesorSeleccionado:", profesorSeleccionado);
      console.log("materiaSeleccionada:", materiaSeleccionada);
      console.log("horaInicioSeleccionada:", horaInicioSeleccionada);
      console.log("horaFinSeleccionada:", horaFinSeleccionada);
      const horariosFiltrados = todosLosHorarios.filter(horario => {
                return (
                    horario.sem_grupo === semestre &&
                    horario.id_turno == turnoSeleccionado &&
                    (salonSeleccionado === 'todas' || String(horario.id_salon).trim() === String(salonSeleccionado).trim()) &&
                    (grupoSeleccionado === 'todas'  || horario.nom_grupo === grupoSeleccionado) &&
                    (profesorSeleccionado === 'todas'  || horario.nombre_persona === profesorSeleccionado) &&
                    (materiaSeleccionada === 'todas' || horario.nom_materia === materiaSeleccionada) &&
                    (horaInicioSeleccionada === 'todas'  || horario.hora_inicio === horaInicioSeleccionada) &&
                    (horaFinSeleccionada === 'todas' || horario.hora_final === horaFinSeleccionada)
                );
            });
        

      if (horariosFiltrados.length === 0) {
        console.log(
          "No se encontraron horarios que coincidan con los filtros."
        );
        createToast(
          "advertencia",
          "fa-solid fa-triangle-exclamation",
          "Información ",
          "No se encontraron horarios que coincidan con los filtros seleccionados."
        );
        return; // 👈 Evita ejecutar más código
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
        // Selectores
        const contenedorTurno = document.querySelector('.contenedor-select');
        const contenedorSalon = document.querySelector('.contenedor-select[data-type="salon"]');
        const contenedorGrupo = document.querySelector('.contenedor-select[data-type="grupo"]');
        const contenedorProfesor = document.querySelector('.contenedor-select[data-type="profesor"]');
        const contenedorMateria = document.querySelector('.contenedor-select[data-type="materia"]');
        const contenedorHoraInicio = document.querySelector('.contenedor-select[data-type="horaInicio"]');
        const contenedorHoraFin = document.querySelector('.contenedor-select[data-type="horaFin"]');
        const horarioContainer = document.getElementById('horario');
        const filterBtn = document.getElementById('filterBtn');

        
        // Inicialización al cargar la página
        document.addEventListener("DOMContentLoaded", async () => {
            try {

              document.querySelectorAll('.contenedor-select:not([data-type="turno"])').forEach(select => {
            select.style.display = 'none';
        });
            

                const response = await fetch("/api/filtros");
                const data = await response.json();
        
                if (!data || Object.keys(data).length === 0) {
                    mostrarError("No se encontraron datos para llenar los filtros.");
                    return;
                }
        
                // Llenar los selects con datos
                llenarSelect("salon", data.salones);
                llenarSelect("grupo", data.grupos);
                llenarSelect("profesor", data.profesores);
                llenarSelect("materia", data.materias);
                llenarSelect("horaInicio", data.horasInicio);
                llenarSelect("horaFin", data.horasFin);
        
                // Inicializar eventos
                inicializarEventosTurno();
                inicializarEventosFiltros();
                
                // Cargar horarios
                await fetchHorarios();
                
            } catch (error) {
                mostrarError("Hubo un problema al cargar los filtros.");
                console.error("Error:", error);
            }
        });
        
        // Función para llenar selects
        function llenarSelect(tipo, datos) {
            const contenedor = document.querySelector(`.contenedor-select[data-type="${tipo}"]`);
            if (!contenedor) {
                console.error(`No se encontró el select con tipo: ${tipo}`);
                return;
            }
        
            const opciones = contenedor.querySelector('.opciones');
            opciones.innerHTML = '';

              if (tipo !== 'turno') {
        const limpiarLi = document.createElement('li');
        limpiarLi.className = 'limpiar-seleccion';
        limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
        limpiarLi.onclick = function() {
            limpiarFiltro(tipo, contenedor);
        };
        opciones.appendChild(limpiarLi);
    }
        
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
        
        // Función para seleccionar turno
        function seleccionarTurno(opcion) {
            // Animación
            opcion.style.transform = 'scale(0.98)';
            setTimeout(() => opcion.style.transform = '', 150);
            
            turnoSeleccionado = opcion.dataset.value;
            contenedorTurno.querySelector('.boton-select span').textContent = opcion.textContent;
            
            // Marcar como seleccionado
            contenedorTurno.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            opcion.classList.add('seleccionado');
            
            // Cerrar select
            cerrarSelect(contenedorTurno);

            document.querySelectorAll('.contenedor-select:not([data-type="turno"])').forEach(select => {
        select.style.display = 'block';
    });
    
    // Mostrar el contenedor de horarios
            
            // Filtrar horarios
            filtrarPorTurno(turnoSeleccionado);
        }
        
        // Función para seleccionar opción en filtros
        function seleccionarOpcionFiltro(opcion, tipo) {
            // Animación
            opcion.style.transform = 'scale(0.98)';
            setTimeout(() => opcion.style.transform = '', 150);
            
            // Actualizar variable correspondiente
            switch(tipo) {
                case 'salon': salonSeleccionado = opcion.dataset.value; break;
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

              if (turnoSeleccionado) {
        filtrarHorarios();
    }
        }
        
        // Función para inicializar eventos del select de turno
       function inicializarEventosTurno() {
    const botonSelect = contenedorTurno.querySelector('.boton-select');
    const contenidoSelect = contenedorTurno.querySelector('.contenido-select');
    
    // Evento para abrir/cerrar el select
    botonSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        contenedorTurno.classList.toggle("activo");
    });
    
    // Asegúrate que las opciones tienen el evento onclick correcto
    const opcionesTurno = contenedorTurno.querySelectorAll('.opciones li');
    opcionesTurno.forEach(opcion => {
        opcion.onclick = function() {
            seleccionarTurno(this);
        };
    });
}
        function limpiarFiltro(tipo, contenedor) {
    const defaultText = `Seleccione ${tipo === 'salon' ? 'un SALÓN' : 
                      tipo === 'grupo' ? 'un GRUPO' : 
                      tipo === 'profesor' ? 'un PROFESOR' : 
                      tipo === 'materia' ? 'una MATERIA' : 
                      tipo === 'horaInicio' ? 'HORA INICIO' : 'HORA FIN'}`;
    
    // Actualizar UI
    contenedor.querySelector('.boton-select span').textContent = defaultText;
    
    // Limpiar variable
    switch(tipo) {
        case 'salon': salonSeleccionado = 'todas'; break;
        case 'grupo': grupoSeleccionado = 'todas'; break;
        case 'profesor': profesorSeleccionado = 'todas'; break;
        case 'materia': materiaSeleccionada = 'todas'; break;
        case 'horaInicio': horaInicioSeleccionada = 'todas'; break;
        case 'horaFin': horaFinSeleccionada = 'todas'; break;
    }

    // Limpiar selección visual
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    contenedor.classList.remove('filtro-activo');
    
    // Cerrar el select
    cerrarSelect(contenedor);
    
    // Opcional: volver a filtrar automáticamente
    if (turnoSeleccionado) {
        filtrarHorarios();
    }
}
        // Función para inicializar eventos de los filtros
        function inicializarEventosFiltros() {
            const contenedores = [
                contenedorSalon, contenedorGrupo, contenedorProfesor, 
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
                [contenedorTurno, ...contenedores].forEach(contenedor => {
                    if (!contenedor.contains(e.target)) {
                        cerrarSelect(contenedor);
                    }
                });
            });
            
            // Evento para filtrar
            filterBtn.addEventListener('click', filtrarHorarios);
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

function checkboxesHandler(event) {
  const checkbox = event.target;
  const id_horario = checkbox.dataset.id;

  console.log(`Checkbox con id_horario: ${id_horario} ha sido activado.`);

  // Manejo de bloqueo de checkboxes
  if (checkbox.checked) {
    // Bloquear todos los checkboxes de la misma fila
    document
      .querySelectorAll(`input[data-id="${id_horario}"]`)
      .forEach((cb) => {
        if (cb !== checkbox) {
          cb.disabled = true;
        }
      });
  } else {
    // Desbloquear todos los checkboxes de la misma fila si ninguno está marcado
    const anyChecked = Array.from(
      document.querySelectorAll(`input[data-id="${id_horario}"]`)
    ).some((cb) => cb.checked);

    if (!anyChecked) {
      document
        .querySelectorAll(`input[data-id="${id_horario}"]`)
        .forEach((cb) => {
          cb.disabled = false;
        });
    }
  }
}

function checkAndSubmit(event) {
  event.preventDefault(); // Evitar el envío del formulario

  const isAdmin = true; // Aquí debes determinar si el usuario es un admin
  const url = isAdmin ? "/actualizarDatosAdmin" : "/actualizarDatos";

  const checkboxes = document.querySelectorAll(".checkbox");
  let cambiosRealizados = false; // Para verificar si al menos un checkbox fue seleccionado

  checkboxes.forEach((checkbox) => {
    const id_horario = checkbox.dataset.id;

    if (checkbox.checked) {
      cambiosRealizados = true;

      const validacion_asistencia = document.getElementById(
        `validacion_asistencia_${id_horario}`
      ).checked;
      const validacion_retardo = document.getElementById(
        `validacion_retardo_${id_horario}`
      ).checked;
      const validacion_falta = document.getElementById(
        `validacion_falta_${id_horario}`
      ).checked;

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validacion_asistencia,
          validacion_retardo,
          validacion_falta,
          id_horario,
        }),
      })
        .then((response) => {
          if (response.ok) {
            createToast(
              "Correcto",
              "fa-solid fa-circle-check",
              "Actualización exitosa",
              `Se actualizó correctamente el horario ID: ${id_horario}`
            );
          } else {
            createToast(
              "error",
              "fa-solid fa-circle-exclamation",
              "Error",
              `Hubo un problema al actualizar el horario ID: ${id_horario}`
            );
          }
        })
        .catch(() => {
          createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            `Error de conexión al intentar actualizar el horario ID: ${id_horario}`
          );
        });
    }
  });

  if (!cambiosRealizados) {
    createToast(
      "advertencia",
      "fa-solid fa-triangle-exclamation",
      "Advertencia",
      "No se han seleccionado cambios."
    );
  }
}

function inicializarCheckboxes() {
  const checkboxes = document.querySelectorAll(".checkbox");
  checkboxes.forEach((checkbox) => {
    // Siempre habilitar checkboxes para el administrador
    checkbox.disabled = false;

    // Agregar el manejador de eventos para los checkboxes
    checkbox.addEventListener("change", checkboxesHandler);
  });

  const submitButton = document.getElementById("btnEnviar");
  submitButton.addEventListener("click", checkAndSubmit);
}

inicializarCheckboxes();

//--------------------------------------------------------------- FIN CODIGO CHECKBOX --------------------------

//--------------------------------------------------------------- CODIGO HORARIO --------------------------

const contenedor = document.getElementById("horario");

contenedor.innerHTML = `
  <div class="no-horarios-message">
    <i class="fas fa-clock"></i>
    <p>Primero seleccione un Turno</p>
  </div>
`;

// Agregamos estilos CSS (puedes ponerlos en tu archivo CSS)
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

let todosLosHorarios = []; // Variable global para almacenar todos los horarios

async function fetchHorarios() {
  try {

     let url = "/api/horarios";
    if (turnoSeleccionado) {
      url += `?turno=${turnoSeleccionado}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);
    
    todosLosHorarios = await response.json();
    
 
    
  } catch (error) {
    console.error("Error al obtener los horarios:", error);
    contenedor.innerHTML = '<div class="error-message">Error al cargar los horarios</div>';
  }
}

function filtrarPorTurno(turnoId) {
  // Filtramos por semestre 2 Y por turno
  const horariosFiltrados = todosLosHorarios.filter(horario => 
    horario.sem_grupo === semestre && horario.id_turno == turnoId
  );

  if (horariosFiltrados.length === 0) {
    contenedor.innerHTML = `
      <div class="no-horarios-message">
        <i class="fas fa-clock"></i>
        <p>No hay horarios para este turno</p>
      </div>
    `;
  } else {
    mostrar(horariosFiltrados);
  }
}

function mostrar(horarios) {
  if (!horarios || horarios.length === 0) {
    contenedor.innerHTML = `
      <div class="no-horarios-message">
        <i class="fas fa-clock"></i>
        <p>No hay horarios para mostrar</p>
      </div>
    `;
    return;
  }

  let resultados = '';


  const horariosSemestre2 = horarios.filter(
    (horario) => horario.sem_grupo === semestre
  );

  horariosSemestre2.forEach((horario) => {
    resultados += `
              <div class="horario-card">
                  <div class="horario-header">
                          <span><b>Salón</b></span>
                          <span><b>Grupo</b></span>
                          <span><b>Profesor</b></span>
                          <span><b>Materia</b></span>
                          <span><b>Hora</b></span>
                          <span><b>Acciones</b></span>
                      </div>
                      <div class="horario-content">
                          <span>${horario.id_salon}</span>
                          <span>${horario.nom_grupo}</span>
                          <span>${horario.nombre_persona}</span>
                          <span>${horario.nom_materia}</span>
                          <span>${horario.hora_inicio} - ${horario.hora_final}</span>
                          <div class="acciones">
                           <form onsubmit="checkAndSubmit(event)" class="acciones">
                              <label class="container">
                                  <input type="checkbox" class="checkbox" id="validacion_asistencia_${horario.id_horario}" data-tipo="asistencia" data-id="${horario.id_horario}">
                                  <div class="checkmark"></div>
                                  Asis.
                              </label>
  
                              <label class="container">
                                  <input type="checkbox" class="checkbox" id="validacion_retardo_${horario.id_horario}" data-tipo="retardo" data-id="${horario.id_horario}">
                                  <div class="checkmark"></div>
                                  Retardo
                              </label>
  
                              <label class="container">
                                  <input type="checkbox" class="checkbox" id="validacion_falta_${horario.id_horario}" data-tipo="falta" data-id="${horario.id_horario}">
                                  <div class="checkmark"></div>
                                  Falta
                              </label>
                              <input type="hidden" class="checkbox" id="id_horario_${horario.id_horario}" value="${horario.id_horario}">
                          </form>
  
                          </div>
                      </div>
                  </div>
  
              `;
  });

  contenedor.innerHTML = resultados;



  

  const checkboxes = document.querySelectorAll(".checkbox");
  checkboxes.forEach((checkbox, index) => {
    const id_horario = checkbox.dataset.id;
    

    checkbox.addEventListener("change", checkboxesHandler);
  });

  const submitButton = document.getElementById("btnEnviar");
  submitButton.addEventListener("click", checkAndSubmit);
}

fetchHorarios();

//------------------------------------------------------------ FIN CODIGO HORARIO -----------------------------------

