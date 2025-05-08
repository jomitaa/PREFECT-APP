document.addEventListener('DOMContentLoaded', async () => {
    try {
        const respuesta = await fetch('/obtener-datos-horarios');
        const datos = await respuesta.json();

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

function obtenerHorasPorTurno(turnoId) {
    return {
        vespertino: { inicio: 13, fin: 21 }, // 13:00 - 21:00
        matutino: { inicio: 7, fin: 15 }      // 7:00 - 14:00
    }[turnoId === "2" ? "vespertino" : "matutino"];
}

let todosLosGrupos = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const respuesta = await fetch('/obtener-datos-horarios');
        const datos = await respuesta.json();
        
        // Guardar grupos originales
        todosLosGrupos = datos.grupos;
        
       
        
        // Escuchar cambios en el turno
        document.getElementById('selectTurno').addEventListener('change', function() {
            const turnoId = this.value;
            const grupoSelect = document.getElementById('selectGrupo');
            
            // Habilitar el select de grupo
            grupoSelect.disabled = false;
            
            // Filtrar y llenar grupos
            filtrarGruposPorTurno(turnoId);

            actualizarHorasSegunTurno(turnoId);
        });

    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
});

function filtrarGruposPorTurno(turnoId) {
    const grupoSelect = document.getElementById('selectGrupo');
    
    // Limpiar y establecer mensaje inicial
    grupoSelect.innerHTML = '<option disabled selected>Seleccione un grupo</option>';
    
    // Filtrar grupos
    const gruposFiltrados = todosLosGrupos.filter(grupo => grupo.id_turno == turnoId);
    
    // Llenar opciones
    gruposFiltrados.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.id_grupo;
        option.textContent = grupo.nom_grupo;
        grupoSelect.appendChild(option);
    });
}

function actualizarHorasSegunTurno(turnoId) {
    const { inicio, fin } = obtenerHorasPorTurno(turnoId);
    const cards = document.querySelectorAll('.horario-card');

    cards.forEach((card, index) => {
        const horaInicioSpan = card.querySelector('span[name="hora_inicio"]');
        const horaFinalSpan = card.querySelector('span[name="hora_final"]');
        
        // Calculamos las horas (ej: 13 + 0 = 13:00, 13 + 1 = 14:00, etc.)
        const horaActual = inicio + index;
        
        // Si excede el límite del turno, ocultamos la card
        if (horaActual >= fin) {
            card.style.display = 'none';
            return;
        }
        
        // Mostrar la card si estaba oculta
        card.style.display = '';
        
        // Formatear a HH:00:00
        horaInicioSpan.textContent = `${horaActual}:00:00`;
        horaFinalSpan.textContent = `${horaActual + 1}:00:00`;
    });
}


// Evento para enviar el formulario
document.getElementById('btnEnviar').addEventListener('click', async (e) => {
    e.preventDefault();

    // 1. Validar campos generales (Día y Grupo)
    const dia = document.querySelector('select[name="dia"]').value;
    const grupo = document.querySelector('select[name="grupo"]').value;

    if (!dia || !grupo) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Advertencia', 'Selecciona el Día y el Grupo antes de continuar.');
        return;
    }

    // 2. Recopilar datos de cards VÁLIDAS (con valores numéricos)
    const datosHorario = {
        dia_horario: dia,
        id_grupo: grupo,
        hora_inicio: [],
        hora_final: [],
        id_salon: [],
        id_materia: [],
        id_persona: []
    };

    let cardsValidas = 0;
    const cards = document.querySelectorAll('.horario-card');

    cards.forEach(card => {
        const salon = card.querySelector('select[name="salon"]').value;
        const materia = card.querySelector('select[name="materia"]').value;
        const profesor = card.querySelector('select[name="persona"]').value;
        const horaInicio = card.querySelector('span[name="hora_inicio"]').textContent.trim();
        const horaFinal = card.querySelector('span[name="hora_final"]').textContent.trim();

        // Verificar si los valores son numéricos (y no placeholders)
        const esValido = 
            !isNaN(salon) && salon !== "" && 
            !isNaN(materia) && materia !== "" && 
            !isNaN(profesor) && profesor !== "";

        if (esValido) {
            datosHorario.hora_inicio.push(horaInicio);
            datosHorario.hora_final.push(horaFinal);
            datosHorario.id_salon.push(parseInt(salon));
            datosHorario.id_materia.push(parseInt(materia));
            datosHorario.id_persona.push(parseInt(profesor));
            cardsValidas++;
        }
    });

    // 3. Validar al menos 1 card válida
    if (cardsValidas === 0) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Advertencia', 'Completa al menos un bloque de horario con valores válidos.');
        return;
    }

    // 4. Enviar al servidor
    try {
        const respuesta = await fetch('/agregar-horario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosHorario)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', 'Horario guardado correctamente.');
            setTimeout(() => location.reload(), 1500);
        } else {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', resultado.message || 'Error al guardar el horario.');
        }
    } catch (error) {
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error de conexión con el servidor.');
        console.error('Error:', error);
    }
});
