document.addEventListener('DOMContentLoaded', async () => {
    try {
        const respuesta = await fetch('/obtener-datos-horarios');
        const datos = await respuesta.json();

        llenarSelect('grupo', datos.grupos, 'id_grupo', 'nom_grupo');
        llenarSelect('dia', datos.dias, 'dia', 'dia');
        llenarSelect('hora_inicio', datos.hora_inicio, 'hora_inicio', 'hora_inicio');
        llenarSelect('hora_final', datos.hora_final, 'hora_final', 'hora_final');
        llenarSelect('salon', datos.salones, 'id_salon', 'id_salon');
        llenarSelect('materia', datos.materias, 'id_materia', 'nom_materia');
        llenarSelect('persona', datos.profesores, 'id_persona', 'nombre_completo');

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
});

function llenarSelect(idSelect, datos, idColumna, nombreColumna) {
    // Seleccionamos todos los select con el name dado
    const selects = document.querySelectorAll(`select[name="${idSelect}"]`);
    
    // Asegurarse de que hemos encontrado al menos un select
    if (selects.length === 0) return;

    // Recorremos todos los selects encontrados
    selects.forEach(select => {
        // Limpiar las opciones previas
        select.innerHTML = `<option disabled selected>${formatearTexto(nombreColumna)}</option>`;

        // Añadir nuevas opciones
        datos.forEach(dato => {
            const option = document.createElement('option');
            option.value = dato[idColumna];
            option.textContent = dato[nombreColumna];
            select.appendChild(option);
        });
    });
}

function formatearTexto(texto) {
    return texto.replace(/_/g, ' ').replace(/\b\w/g, letra => letra.toUpperCase());
}

/*
async function obtenerIdContenedor() {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;
    const periodo = mes >= 1 && mes <= 6 ? 1 : 2; // 1er semestre (Ene-Jun), 2do semestre (Jul-Dic)

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
*/

// Evento para enviar el formulario
document.getElementById('btnEnviar').addEventListener('click', async (e) => {
    e.preventDefault(); // Evita recargar la página

    // Crear un objeto para almacenar los valores de todos los campos
    const datosHorario = {
        dia_horario: null, // Cambio aquí: solo un valor único
        hora_inicio: [],
        hora_final: [],
        id_salon: [],
        id_grupo: null,  // Cambio aquí: solo un valor único
        id_materia: [],
        id_persona: []
    };

    // Obtener el valor del primer select para "dia_horario" y "id_grupo" (solo un valor único)
    const diaSelect = document.querySelector('select[name="dia"]');
    if (diaSelect && diaSelect.value) {
        datosHorario.dia_horario = diaSelect.value;  // Solo un valor de "dia"
    }

    const grupoSelect = document.querySelector('select[name="grupo"]');
    if (grupoSelect && grupoSelect.value) {
        datosHorario.id_grupo = grupoSelect.value;  // Solo un valor de "grupo"
    }

    // Recorrer los demás select y obtener sus valores
    document.querySelectorAll('select[name="hora_inicio"]').forEach(select => {
        if (select.value) datosHorario.hora_inicio.push(select.value);
    });
    document.querySelectorAll('select[name="hora_final"]').forEach(select => {
        if (select.value) datosHorario.hora_final.push(select.value);
    });
    document.querySelectorAll('select[name="salon"]').forEach(select => {
        if (select.value) datosHorario.id_salon.push(select.value);
    });
    document.querySelectorAll('select[name="materia"]').forEach(select => {
        if (select.value) datosHorario.id_materia.push(select.value);
    });
    document.querySelectorAll('select[name="persona"]').forEach(select => {
        if (select.value) datosHorario.id_persona.push(select.value);
    });

    // Verificar que todos los campos tengan valores
    if (!datosHorario.dia_horario || 
        datosHorario.hora_inicio.length === 0 || 
        datosHorario.hora_final.length === 0 || 
        datosHorario.id_salon.length === 0 || 
        !datosHorario.id_grupo || 
        datosHorario.id_materia.length === 0 || 
        datosHorario.id_persona.length === 0) {
        
        alert('Por favor, complete todos los campos.');
        return;
    }

    // Enviar los datos al servidor
    try {
        const respuesta = await fetch('/agregar-horario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosHorario)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            alert('Horario agregado correctamente.');
            location.reload(); // Recargar la página para actualizar los datos
        } else {
            alert('Error al agregar horario.');
        }
    } catch (error) {
        console.error('Error al enviar horario:', error);
    }
});
