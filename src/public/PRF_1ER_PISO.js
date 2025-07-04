 let turnoSeleccionado = null;
let salonSeleccionado = 'todas';
let grupoSeleccionado = 'todas';
let profesorSeleccionado = 'todas';
let materiaSeleccionada = 'todas';
let horaInicioSeleccionada = 'todas';
let horaFinSeleccionada = 'todas';
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
            
            // Actualizar variable y UI
            turnoSeleccionado = opcion.dataset.value;
            contenedorTurno.querySelector('.boton-select span').textContent = opcion.textContent;
            
            // Marcar como seleccionado
            contenedorTurno.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            opcion.classList.add('seleccionado');
            
            // Cerrar select
            cerrarSelect(contenedorTurno);
            
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
    const tipo = checkbox.dataset.tipo;

    console.log(
        `Checkbox con id_horario: ${id_horario} y tipo: ${tipo} ha sido activado.`
    );

    // Manejo de bloqueo de checkboxes
    if (checkbox.checked) {
        // Si es una falta, abrimos el modal de OTP
        if (tipo === 'falta') {
            openOTPModal(checkbox);
            return; // No bloqueamos otros checkboxes todavía
        }
        
        // Bloquear todos los checkboxes de la misma fila
        document.querySelectorAll(`input[data-id="${id_horario}"]`).forEach((cb) => {
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
            document.querySelectorAll(`input[data-id="${id_horario}"]`).forEach((cb) => {
                cb.disabled = false;
            });
        }
    }
}

  const limpiarCheckboxes = () => {
    const lastReset = localStorage.getItem("lastReset");
    const today = new Date().toLocaleDateString();
    if (lastReset !== today) {
      localStorage.clear();
      localStorage.setItem("lastReset", today);
    }
  };

  limpiarCheckboxes(); // Limpia las checkboxes al cargar la página

async function checkAndSubmit(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll(".checkbox");
    
    for (const checkbox of checkboxes) {
        const id_horario = checkbox.dataset.id;
        const tipo = checkbox.dataset.tipo;
        
        // Solo procesamos si no es una falta y está marcado
        if (checkbox.checked && tipo !== 'falta' && !localStorage.getItem(`checkbox_${id_horario}`)) {
            try {
                // Enviar datos al servidor
                const response = await fetch("/actualizarDatos", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        validacion_asistencia: document.getElementById(`validacion_asistencia_${id_horario}`).checked,
                        validacion_retardo: document.getElementById(`validacion_retardo_${id_horario}`).checked,
                        validacion_falta: false, // Las faltas se manejan aparte
                        id_horario: id_horario
                    }),
                });
                
                if (response.ok) {
                    // Guardar en localStorage para no enviarlo de nuevo
                    localStorage.setItem(`checkbox_${id_horario}`, "true");
                    checkbox.disabled = true;
                    
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
            } catch (error) {
                console.error("Error al enviar los datos:", error);
            }
        }
    }
}

  // Cargar estado de los checkboxes al iniciar la página
function inicializarCheckboxes() {
    const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach((checkbox) => {
        const id_horario = checkbox.dataset.id;
        const isChecked = localStorage.getItem(`checkbox_${id_horario}`) === "true";
        
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
        
        // Si un checkbox está marcado, deshabilitar los otros de la misma fila
        if (isChecked) {
            document.querySelectorAll(`input[data-id="${id_horario}"]`).forEach((cb) => {
                if (cb !== checkbox) {
                    cb.disabled = true;
                }
            });
        }
    });

    const submitButton = document.getElementById("btnEnviar");
    if (submitButton) {
        submitButton.addEventListener("click", checkAndSubmit);
    }
}

  window.onload = function () {
    inicializarCheckboxes();
  };

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

let todosLosHorarios = [];

async function fetchHorarios() {
  try {
    const response = await fetch("/api/horarios");
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);
    
    todosLosHorarios = await response.json();
    
    // Escuchamos cambios en el select de turno
   
    
  } catch (error) {
    console.error("Error al obtener los horarios:", error);
    contenedor.innerHTML = '<div class="error-message">Error al cargar los horarios</div>';
  }
}

function filtrarPorTurno(turnoId) {
  // Filtramos por semestre 2 Y por turno
  const horariosFiltrados = todosLosHorarios.filter(horario => 
    horario.sem_grupo === 2 && horario.id_turno == turnoId
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
      (horario) => horario.sem_grupo === 2
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
                                <input type="checkbox" class="checkbox" id="validacion_falta_${horario.id_horario}" data-tipo="falta" data-id="${horario.id_horario}" data-id-grupo="${horario.id_grupo}">
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

    document.getElementById("filterBtn").replaceWith(document.getElementById("filterBtn").cloneNode(true));
    document.getElementById("filterBtn").addEventListener("click", filtrarHorarios);

   
    
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
        (horario) => horario.sem_grupo === 2
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
                    horario.sem_grupo === 2 &&
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
          "Aguas",
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
    

    window.onload();

    

    const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach((checkbox, index) => {
      const id_horario = checkbox.dataset.id;
      if (localStorage.getItem(`checkbox_${id_horario}`) === "true") {
        checkbox.checked = true;
        checkbox.disabled = true;
      }

      // Agregar el manejador de eventos para los checkboxes
      checkbox.addEventListener("change", checkboxesHandler);
    });

    const submitButton = document.getElementById("btnEnviar");
    submitButton.addEventListener("click", checkAndSubmit);
  }

  fetchHorarios();

  //------------------------------------------------------------ FIN CODIGO HORARIO -----------------------------------


  // Obtener el modal
const otpModal = document.getElementById('otpModal');
const closeModal = document.querySelector('.btn-cancelar');

// Función para abrir el modal
// Función para abrir el modal y solicitar OTP al servidor
async function openOTPModal(checkbox) {

    console.log("Datos del checkbox al abrir modal:", {
        id: checkbox.dataset.id,
        idGrupo: checkbox.dataset.idGrupo,
        id_grupo: checkbox.dataset.id_grupo,
        getAttribute: checkbox.getAttribute('data-id-grupo'),
        outerHTML: checkbox.outerHTML
    });

    const id_horario = checkbox.dataset.id;
    
    // Mostrar el modal
    otpModal.style.display = 'block';
    otpModal.currentCheckbox = checkbox;
    
    // Limpiar los inputs del OTP
    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
    });
    
    // Enfocar el primer input
    document.querySelector('.otp-input[data-index="0"]').focus();
    
    
}



async function verifyOTP() {
let codigo_jefe = '';
    document.querySelectorAll('.otp-input').forEach(input => {
        codigo_jefe += input.value;
    });
    
    if (codigo_jefe.length !== 6) {
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            "El código debe tener 6 dígitos."
        );
        return { success: false };
    }
    
    try {
         const checkbox = otpModal.currentCheckbox;
    const id_grupo = checkbox.getAttribute('data-id-grupo') || 
                        checkbox.dataset.idGrupo || 
                        checkbox.dataset.id_grupo;
        
        const id_horario = checkbox.dataset.id;

        if (!id_grupo || id_grupo === 'undefined') {
            console.error("No se pudo obtener id_grupo del checkbox:", checkbox);
            throw new Error("No se pudo identificar el grupo para esta falta");
        }



        const response = await fetch('/verificar-codigo-jefe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo_jefe: codigo_jefe,
                id_grupo: id_grupo ,
                id_horario: id_horario,
                validacion_falta: document.getElementById(`validacion_falta_${id_horario}`).checked,

            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                data.message || "El código ingresado no es válido."
            );
        }
        
        return data;
    } catch (error) {
        console.error('Error al verificar OTP:', error);
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            "Hubo un problema al verificar el código."
        );
        return { success: false };
    }
}

// Modificar el evento del botón Confirmar
document.getElementById('confirmarFalta').addEventListener('click', async function() {
    const verificationResult = await verifyOTP();
    
    if (verificationResult.success) {
        const checkbox = otpModal.currentCheckbox;
        const id_horario = checkbox.dataset.id;
        
        // Marcar el checkbox como seleccionado y deshabilitado
        checkbox.checked = true;
        checkbox.disabled = true;
        
        // Bloquear todos los checkboxes de esta fila
        document.querySelectorAll(`input[data-id="${id_horario}"]`).forEach((cb) => {
            if (cb !== checkbox) {
                cb.disabled = true;
            }
        });
        
        // Guardar en localStorage para persistencia
        localStorage.setItem(`checkbox_${id_horario}`, "true");
        
        // Cerrar el modal
        closeOTPModal();
        
        // Mostrar mensaje de éxito
        createToast(
            "Correcto",
            "fa-solid fa-circle-check",
            "Falta confirmada",
            "La falta ha sido registrada correctamente."
        );
        
        // Forzar la actualización del estado en el frontend
        inicializarCheckboxes();
    } else {
        // Si el OTP es incorrecto, desmarcar el checkbox
        if (otpModal.currentCheckbox) {
            otpModal.currentCheckbox.checked = false;
        }
    }
});

function closeOTPModal() {
    otpModal.style.display = 'none';
    // Solo desmarcar si no se confirmó exitosamente
    if (otpModal.currentCheckbox && !otpModal.currentCheckbox.disabled) {
        otpModal.currentCheckbox.checked = false;
    }
}

// Evento para cerrar al hacer clic en la X
closeModal.addEventListener('click', closeOTPModal);

// Evento para cerrar al hacer clic fuera del modal
window.addEventListener('click', (event) => {
    if (event.target === otpModal) {
        closeOTPModal();
    }
});

// Manejar la entrada del OTP
document.querySelectorAll('.otp-input').forEach(input => {
    input.addEventListener('input', function() {
        const index = parseInt(this.dataset.index);
        
        // Si se ingresó un carácter, pasar al siguiente input
        if (this.value.length === 1 && index < 5) {
            document.querySelector(`.otp-input[data-index="${index + 1}"]`).focus();
        }
    });
    
    // Manejar la tecla de retroceso
    input.addEventListener('keydown', function(e) {
        const index = parseInt(this.dataset.index);
        
        if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
            document.querySelector(`.otp-input[data-index="${index - 1}"]`).focus();
        }
    });
});