document.addEventListener('DOMContentLoaded', async () => {
    try {
        const idContenedor = await obtenerIdContenedor();
        if (!idContenedor) {
            console.error('No se encontró un período activo.');
            return;
        }

        // Cargar grupos y días
        const respuestaDatos = await fetch('/obtener-datos-horarios');
        const datos = await respuestaDatos.json();
        llenarSelect('grupo', datos.grupos, 'id_grupo', 'nom_grupo');
        llenarSelect('dia', datos.dias, 'dia', 'dia');

        // Agregar evento al botón de búsqueda
        document.getElementById('btnBuscar').addEventListener('click', () => filtrarHorarios(idContenedor));
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
});

function llenarSelect(idSelect, datos, idColumna, nombreColumna) {
    const select = document.getElementById(idSelect);
    if (!select) return;

    select.innerHTML = `<option value="" disabled selected>Seleccione ${nombreColumna}</option>`;
    datos.forEach(dato => {
        const option = document.createElement('option');
        option.value = dato[idColumna];
        option.textContent = dato[nombreColumna];
        select.appendChild(option);
    });
}

async function obtenerIdContenedor() {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;
    const periodo = mes >= 1 && mes <= 6 ? 1 : 2;

    try {
        const respuesta = await fetch(`/obtener-periodo/${anio}/${periodo}`);
        const datos = await respuesta.json();

        if (datos.error) {
            console.error(datos.error);
            return null;
        }

        return datos.idContenedor;
    } catch (error) {
        console.error('Error al obtener id_contenedor:', error);
        return null;
    }
}

async function filtrarHorarios(idContenedor) {
    const idGrupo = document.getElementById('grupo').value;
    const dia = document.getElementById('dia').value;

    if (!idGrupo || !dia) {
        alert("Por favor, seleccione un grupo y un día antes de buscar.");
        return;
    }

    try {
        const respuesta = await fetch(`/obtener-horarios/${encodeURIComponent(dia)}/${idGrupo}/${idContenedor}`);
        const horarios = await respuesta.json();

        if (!Array.isArray(horarios)) {
            throw new Error("La respuesta del servidor no es un array.");
        }

        const contenedorHorarios = document.getElementById('contenedorHorarios');
        contenedorHorarios.innerHTML = '';

        horarios.forEach(horario => {
            const fila = document.createElement('div');
            fila.classList.add('horario-item');
            fila.innerHTML = `
                <p><strong>Día:</strong> ${horario.dia_horario}</p>
                <p><strong>Hora:</strong> ${horario.hora_inicio} - ${horario.hora_final}</p>
                <p><strong>Salón:</strong> ${horario.id_salon}</p>
                <p><strong>Materia:</strong> ${horario.nom_materia}</p>
                <p><strong>Profesor:</strong> ${horario.nombre_completo}</p>
                <button onclick="editarHorario(${horario.id_horario}, '${horario.id_salon}', '${horario.nom_materia}', '${horario.nombre_completo}')">Editar</button>
            `;
            contenedorHorarios.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar horarios:', error);
    }
}

async function obtenerOpcionesHorarios() {
    try {
        const respuesta = await fetch('/obtener-datos-horarios');
        const datos = await respuesta.json();

        llenarSelect('salon', datos.salones, 'id_salon', 'id_salon');
        llenarSelect('materia', datos.materias, 'id_materia', 'nom_materia');
        llenarSelect('persona', datos.profesores, 'id_persona', 'nombre_completo');
    } catch (error) {
        console.error('Error al obtener opciones de horarios:', error);
    }
}

async function editarHorario(idHorario, idSalon, nomMateria, nombreProfesor) {
    console.log("Editando horario con ID:", idHorario);

    await obtenerOpcionesHorarios(); // Asegurar que los selects tienen opciones antes de asignar valores

    const idHorarioInput = document.getElementById('idHorario');
    const salonSelect = document.getElementById('salon');
    const materiaSelect = document.getElementById('materia');
    const personaSelect = document.getElementById('persona');

    if (!idHorarioInput || !salonSelect || !materiaSelect || !personaSelect) {
        console.error("Uno o más elementos del formulario de edición no existen.");
        return;
    }

    idHorarioInput.value = idHorario;
    salonSelect.value = idSalon;
    materiaSelect.value = nomMateria;
    personaSelect.value = nombreProfesor;

    salonSelect.disabled = false;
    materiaSelect.disabled = false;
    personaSelect.disabled = false;

    document.getElementById('formularioEdicion').style.display = 'block';
}

let alerta = document.querySelector('.alerta');

function createToast(type, icon, title, text) {
    let newToast = document.createElement('div');
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


document.getElementById('btnGuardar').addEventListener('click', async (e) => {
    e.preventDefault();

    const idHorario = document.getElementById('idHorario').value;
    const idSalon = document.getElementById('salon').value;
    const idMateria = document.getElementById('materia').value;
    const idPersona = document.getElementById('persona').value;

    if (!idHorario || !idSalon || !idMateria || !idPersona) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Advertencia', 'No se han seleccionado cambios.');
        return;
    }

    try {
        const respuesta = await fetch(`/editar-horario/${idHorario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_salon: idSalon,
                id_materia: idMateria,
                id_persona: idPersona
            })
        }).then(response => {
            if (response.ok) {
                createToast('Correcto', 'fa-solid fa-circle-check', 'Actualización exitosa', 
                    `Se actualizó correctamente el horario ID: ${idHorario}`);
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 
                    `Hubo un problema al actualizar el horario ID: ${idHorario}`);
            }
        })
        .catch(() => {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 
                `Error de conexión al intentar actualizar el horario ID: ${idHorario}`);
        });

        const resultado = await respuesta.json();

        if (resultado.error) {
            throw new Error(resultado.error);
        }
    } catch (error) {
        console.error('Error al actualizar horario:', error);
    }
});
