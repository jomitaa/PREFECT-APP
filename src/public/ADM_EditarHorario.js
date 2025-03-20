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

        // Evento para filtrar horarios por grupo y día
        document.getElementById('grupo').addEventListener('change', () => filtrarHorarios(idContenedor));
        document.getElementById('dia').addEventListener('change', () => filtrarHorarios(idContenedor));
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

    console.log("Día seleccionado:", dia);
    console.log("Grupo seleccionado:", idGrupo);

    if (!idGrupo || !dia || dia === "Seleccione dia" || idGrupo === "Seleccione grupo") {
        console.warn('Grupo o día no seleccionado correctamente');
        alert("Por favor, seleccione un grupo y un día antes de continuar.");
        return;
    }

    try {
        const respuesta = await fetch(`/obtener-horarios/${encodeURIComponent(dia)}/${idGrupo}/${idContenedor}`);
        const textoRespuesta = await respuesta.text();
        console.log("Respuesta del servidor (texto):", textoRespuesta);

        const horarios = JSON.parse(textoRespuesta);
        console.log("Horarios obtenidos:", horarios);

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
                <button onclick="editarHorario(${horario.id_horario}, '${horario.dia_horario}')">Editar</button>
            `;
            contenedorHorarios.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar horarios:', error);
    }
}

function editarHorario(idHorario, diaHorario) {
    document.getElementById('idHorario').value = idHorario;
    document.getElementById('dia').value = diaHorario;
    document.getElementById('formularioEdicion').style.display = 'block';
}

document.getElementById('btnGuardar').addEventListener('click', async (e) => {
    e.preventDefault();

    const idHorario = document.getElementById('idHorario').value;
    const dia = document.getElementById('dia').value;
    const idSalon = document.getElementById('salon').value;
    const idMateria = document.getElementById('materia').value;
    const idPersona = document.getElementById('persona').value;

    if (!idHorario || !dia || !idSalon || !idMateria || !idPersona) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    try {
        const respuesta = await fetch(`/editar-horario/${idHorario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dia_horario: dia,
                id_salon: idSalon,
                id_materia: idMateria,
                id_persona: idPersona
            })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            alert('Horario actualizado correctamente.');
            location.reload();
        } else {
            alert('Error al actualizar horario.');
        }
    } catch (error) {
        console.error('Error al actualizar horario:', error);
    }
});
