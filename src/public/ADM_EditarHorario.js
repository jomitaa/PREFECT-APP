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
	const contenedorHorarios = document.getElementById('horario');

	contenedorHorarios.innerHTML = ''; // Limpiar anteriores
	contenedorHorarios.style.display = 'none'; // Ocultar antes de buscar

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
                    <span><b>Salon</b></span>
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
					<button class="btn-editar" onclick="editarHorario(${horario.id_horario}, '${horario.id_salon}', '${horario.nom_grupo}', '${horario.dia_horario}', '${horario.nom_materia}', '${horario.nombre_completo}')">Editar</button>
				</div>
			`;
			contenedorHorarios.appendChild(card);
		});

		contenedorHorarios.style.display = 'block'; // Mostrar resultados
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

async function editarHorario(idHorario, idGrupo, dia, idSalon, nomMateria, nombreProfesor) {
    console.log("Editando horario con ID:", idHorario);

  // Cambiar la clase para hacer visible el formulario
  document.getElementById('formularioEdicion').classList.remove('hidden');
  document.getElementById('formularioEdicion').classList.add('visible');

    await obtenerOpcionesHorarios(); // Asegurar que los selects tienen opciones antes de asignar valores


    const idGrupoInput = document.getElementById('grupo');
    const diaInput = document.getElementById('dia');
    const salonSelect = document.getElementById('salon');
    const materiaSelect = document.getElementById('materia');
    const personaSelect = document.getElementById('persona');

    // Verificar que los elementos existen
    console.log('ID Horario:', idHorarioInput);
  console.log('Grupo:', document.getElementById('grupo'));
  console.log('Día:', document.getElementById('dia'));
  console.log('Salón:', document.getElementById('salon'));
  console.log('Materia:', document.getElementById('materia'));
  console.log('Profesor:', document.getElementById('persona'));

    if ( !salonSelect || !materiaSelect || !personaSelect) {
        console.error("Uno o más elementos del formulario de edición no existen.");
        return;
    }


    idGrupoInput.value = idGrupo;
    diaInput.value = dia;
    salonSelect.value = idSalon;
    materiaSelect.value = nomMateria;
    personaSelect.value = nombreProfesor;

    idGrupoInput.disabled = true;
    diaInput.disabled = true;
    salonSelect.disabled = false;
    materiaSelect.disabled = false;
    personaSelect.disabled = false;

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
    const idGrupo = document.getElementById('grupo').value;
    const dia = document.getElementById('dia').value;
    const idSalon = document.getElementById('salon').value;
    const idMateria = document.getElementById('materia').value;
    const idPersona = document.getElementById('persona').value;

    if (!idHorario || !idGrupo || !dia || !idSalon || !idMateria || !idPersona) {
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
