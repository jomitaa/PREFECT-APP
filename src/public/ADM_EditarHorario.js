let horarioOriginal = {};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const idContenedor = await obtenerIdContenedor();
        if (!idContenedor) {
            console.error('No se encontró un período activo.');
            return;
        }

        const respuestaDatos = await fetch('/obtener-datos-horarios');
        const datos = await respuestaDatos.json();
        llenarSelect('grupo', datos.grupos, 'id_grupo', 'nom_grupo');
        llenarSelect('dia', datos.dias, 'dia', 'dia');

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
    const contenedorHorarios = document.getElementById('horario');

    contenedorHorarios.innerHTML = '';
    contenedorHorarios.style.display = 'none';

    if (!idGrupo || !dia) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Advertencia', 'Por favor, selecciona grupo y día.');
        return;
    }

    try {
        const respuesta = await fetch(`/obtener-horarios/${encodeURIComponent(dia)}/${idGrupo}/${idContenedor}`);
        const horarios = await respuesta.json();

        if (!Array.isArray(horarios) || horarios.length === 0) {
            createToast('info', 'fa-solid fa-circle-info', 'Sin resultados', 'No se encontraron horarios para el grupo y día seleccionados.');
            return;
        }

        horarios.forEach(horario => {
            const card = document.createElement('div');
            card.classList.add('horario-card');
            card.innerHTML = `
                <div class="horario-header">
                    <span><b>Grupo</b></span>
                    <span><b>Salón</b></span>
                    <span><b>Profesor</b></span>
                    <span><b>Materia</b></span>
                    <span><b>Hora</b></span>
                    <span><b>Día</b></span>
                    <span><b>Editar horario</b></span>
                </div>
                <div class="horario-content">
                    <span>${horario.nom_grupo}</span>
                    <span>${horario.id_salon}</span>
                    <span>${horario.nombre_completo}</span>
                    <span>${horario.nom_materia}</span>
                    <span>${horario.hora_inicio} - ${horario.hora_final}</span>
                    <span>${horario.dia_horario}</span>
                    <button class="btn-editar" onclick="editarHorario(
                        ${horario.id_horario},
                        '${horario.id_grupo}',
                        '${horario.dia_horario}',
                        '${horario.id_salon}',
                        '${horario.id_materia}',
                        '${horario.id_persona}',
                        '${horario.nom_materia}',
                        '${horario.nombre_completo}',
                        '${horario.hora_inicio}',
                        '${horario.hora_final}',
                        '${horario.nom_grupo}'
                    )">Editar</button>

                </div>
            `;
            contenedorHorarios.appendChild(card);
        });

        contenedorHorarios.style.display = 'block';
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Hubo un error al obtener los horarios.');
    }
}

async function obtenerOpcionesHorarios() {
    try {
        const respuesta = await fetch('/obtener-datos-horarios');
        const datos = await respuesta.json();
        llenarSelect('grupo', datos.grupos, 'id_grupo', 'nom_grupo');
        llenarSelect('dia', datos.dias, 'dia', 'dia');
        llenarSelect('salon', datos.salones, 'id_salon', 'id_salon');
        llenarSelect('materia', datos.materias, 'id_materia', 'nom_materia');
        llenarSelect('persona', datos.profesores, 'id_persona', 'nombre_completo');
    } catch (error) {
        console.error('Error al obtener opciones de horarios:', error);
    }
}

async function editarHorario(idHorario, idGrupo, dia, idSalon, idMateria, idPersona, nomMateria, nombreProfesor, horaInicio, horaFinal, nomGrupo) {
    document.getElementById('idHorario').value = idHorario;

    document.getElementById('formularioEdicion').classList.remove('hidden');
    document.getElementById('formularioEdicion').classList.add('visible');

    document.getElementById('grupoLabel').innerText = nomGrupo || 'No definido';
    document.getElementById('diaLabel').innerText = dia || 'No definido';
    document.getElementById('horaEdicion').value = `${horaInicio || 'No definido'} - ${horaFinal || 'No definido'}`;

    await obtenerOpcionesHorarios();

    // Desactivar los selects de grupo y día para que no se puedan editar
    const grupoEdicion = document.getElementById('grupoEdicion');
    const diaEdicion = document.getElementById('diaEdicion');
    if (grupoEdicion) grupoEdicion.disabled = true;
    if (diaEdicion) diaEdicion.disabled = true;

    const salon = document.getElementById('salon');
    const materia = document.getElementById('materia');
    const persona = document.getElementById('persona');

    salon.value = idSalon || '';
    materia.value = idMateria || '';
    persona.value = idPersona || '';

    horarioOriginal = {
        idSalon,
        idMateria,
        idPersona
    };

    console.log(`📝 Editando horario:
      Grupo: ${nomGrupo} (${idGrupo}),
      Día: ${dia},
      Hora: ${horaInicio} - ${horaFinal},
      Salón: ${idSalon},
      Materia: ${nomMateria} (ID: ${idMateria}),
      Profesor: ${nombreProfesor} (ID: ${idPersona})`);
}

function createToast(type, icon, title, text) {
    const alerta = document.querySelector('.alerta');
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div class="toast ${type}">
            <div class="icono">
                <i class="${icon}"></i>
            </div>
            <div class="content">
                <div class="title">${title}</div>
                <span>${text}</span>
            </div>
            <i class="close fa-solid fa-xmark" onclick="this.parentElement.remove()"></i>
        </div>`;
    alerta.appendChild(toast);
    toast.timeOut = setTimeout(() => toast.remove(), 5000);
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

    if (
        horarioOriginal.idSalon == idSalon &&
        horarioOriginal.idMateria == idMateria &&
        horarioOriginal.idPersona == idPersona
    ) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Sin cambios', 'No se ha modificado ningún valor.');
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
        });

        if (respuesta.ok) {
            createToast('correcto', 'fa-solid fa-circle-check', 'Actualizado', 'Horario actualizado correctamente.');
        document.getElementById('formularioEdicion').classList.add('hidden');
        document.getElementById('formularioEdicion').classList.remove('visible');
        } else {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No se pudo actualizar el horario.');
        }
    } catch (error) {
        console.error('Error al actualizar horario:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Hubo un problema de conexión.');
    }
});