document.addEventListener("DOMContentLoaded", async () => {

    try {
        const response = await fetch('/api/filtros');
        const data = await response.json();
        
        console.log("Datos recibidos:", data);

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

        llenarSelect('salon', data.salones);
        llenarSelect('grupo', data.grupos);
        llenarSelect('profesor', data.profesores);
        llenarSelect('materia', data.materias);
        llenarSelect('horaInicio', data.horasInicio);
        llenarSelect('horaFin', data.horasFin);

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

// ✅ Función para llenar selects
function llenarSelect(id, datos) {
    const select = document.getElementById(id);
    if (!select) {
        console.error(`No se encontró el select con ID: ${id}`);
        return;
    }

    // Aquí cambiamos el texto que aparece en la opción por defecto
    let label = '';
    switch (id) {
        case 'salon':
            label = 'Seleccione un SALÓN';
            break;
        case 'grupo':
            label = 'Seleccione un GRUPO';
            break;
        case 'profesor':
            label = 'Seleccione un PROFESOR';
            break;
        case 'materia':
            label = 'Seleccione una MATERIA';
            break;
        case 'horaInicio':
            label = 'Seleccione la HORA INICIO';
            break;
        case 'horaFin':
            label = 'Seleccione la HORA FIN';
            break;
        default:
            label = 'Seleccione una opción';
    }

    // Agregamos la opción por defecto con el texto correcto
    select.innerHTML = `<option value="">${label}</option>`;

    // Llenamos el select con las opciones recibidas
    datos.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
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
    document.querySelector('select[name="turno"]').addEventListener('change', function() {
      const turnoSeleccionado = this.value;
      filtrarPorTurno(turnoSeleccionado);
    });
    
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

    document.getElementById("filterBtn").replaceWith(document.getElementById("filterBtn").cloneNode(true));
    document.getElementById("filterBtn").addEventListener("click", filtrarHorarios);

    const filtros = [
      "salon",
      "grupo",
      "profesor",
      "materia",
      "horaInicio",
      "horaFin",
    ];
  
    filtros.forEach((id) => {
      const select = document.getElementById(id);
      select.addEventListener("change", () => {
        if (select.value !== "") {
          select.classList.add("filtro-activo");
        } else {
          select.classList.remove("filtro-activo");
        }
      });
    });
  
    
    async function filtrarHorarios() {

      const turno = document.querySelector('select[name="turno"]').value;
  if (!turno) {
    createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Atención', 'Debes seleccionar un turno primero');
    return;
  }

        const salon = document.getElementById("salon").value.trim();
        const grupo = document.getElementById("grupo").value;
        const profesor = document.getElementById("profesor").value;
        const materia = document.getElementById("materia").value;
        const horaInicio = document.getElementById("horaInicio").value;
        const horaFin = document.getElementById("horaFin").value;
    
        try {
            const response = await fetch("/api/horarios");
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const horarios = await response.json();
    
            const horariosSemestre2 = horarios.filter(
                (horario) => horario.sem_grupo === 2
            );
    
            const horariosFiltrados = todosLosHorarios.filter((horario) => {
              return (
                horario.sem_grupo === 2 &&
                horario.id_turno == turno &&
                    (!salon || String(horario.id_salon).trim() === String(salon).trim()) &&
                    (!grupo || horario.nom_grupo === grupo) &&
                    (!profesor || horario.nombre_persona === profesor) &&
                    (!materia || horario.nom_materia === materia) &&
                    (!horaInicio || horario.hora_inicio === horaInicio) &&
                    (!horaFin || horario.hora_final === horaFin)
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
                return;  // 👈 Evita ejecutar más código
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
    
    try {
        // Enviar solicitud al servidor para generar OTP
        const response = await fetch('/generate-falta-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                validacion_falta: true,
                id_horario: id_horario
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                data.message || "Error al generar código de verificación."
            );
            closeOTPModal();
        } else {
            createToast(
                "Correcto",
                "fa-solid fa-circle-check",
                "Código enviado",
                "Se ha enviado un código de verificación a tu correo."
            );
        }
    } catch (error) {
        console.error('Error al solicitar OTP:', error);
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            "Hubo un problema al solicitar el código de verificación."
        );
        closeOTPModal();
    }
}

// Función para verificar el OTP con el servidor
async function verifyOTP() {
    // Construir el código ingresado
    let enteredOTP = '';
    document.querySelectorAll('.otp-input').forEach(input => {
        enteredOTP += input.value;
    });
    
    if (enteredOTP.length !== 6) {
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            "El código debe tener 6 dígitos."
        );
        return { success: false };
    }
    
    try {
        const response = await fetch('/verify-falta-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                otpCode: enteredOTP
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                data.message || "El código OTP ingresado no es válido."
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