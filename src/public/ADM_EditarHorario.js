// Variables globales
let horarioOriginal = {};
let idContenedor = null;
let Grupo_seleccionado = null;
let Dia_seleccionado = null;
let Salon_filtro = null;
let Materia_filtro = null;
let Profesor_filtro = null;
let todosLosHorarios = []; // Almacenará todos los horarios obtenidos

let grupo_modal = null;
let dia_modal = null;
let salon_modal = null;
let materia_modal = null;
let profesor_modal = null;
let horaInicio_modal = null;



// Elementos del DOM
const contenedorGrupo = document.querySelector('.contenedor-select[data-type="grupo"]');
const contenedorDia = document.querySelector('.contenedor-select[data-type="dia"]');
const contenedorSalonFiltro = document.querySelector('.contenedor-select[data-type="salon"]');
const contenedorMateriaFiltro = document.querySelector('.contenedor-select[data-type="materia"]');
const contenedorProfesorFiltro = document.querySelector('.contenedor-select[data-type="profesor"]');
const contenedorHorarios = document.getElementById('horario');
const filtrosAdicionales = document.querySelector('.filtros-adicionales');
const formularioEdicion = document.getElementById('formularioEdicion');
const contenedorGrupoEdicion = document.querySelector('.contenedor-select[data-type="grupo-edicion"]');
const contenedorDiaEdicion = document.querySelector('.contenedor-select[data-type="dia-edicion"]');
const contenedorSalonEdicion = document.querySelector('.contenedor-select[data-type="salon-edicion"]');
const contenedorMateriaEdicion = document.querySelector('.contenedor-select[data-type="materia-edicion"]');
const contenedorProfesorEdicion = document.querySelector('.contenedor-select[data-type="profesor-edicion"]');
const contenedorHoraInicioEdicion = document.querySelector('.contenedor-select[data-type="horaInicio-edicion"]');
const modalEditarHorario = document.getElementById('modal-editar-horario');


// Variables globales para edición de horario
let horarioSeleccionado = {
    id: '',
    grupo: '',
    dia: '',
    salon: '',
    materia: '',
    profesor: '',
    hora_inicio: '',
    hora_final: '',
    nom_grupo: '',
    nom_materia: '',
    nom_profesor: ''
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener el idContenedor del período activo
        idContenedor = await obtenerIdContenedor();
        if (!idContenedor) {
            console.error('No se encontró un período activo.');
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No hay un período académico activo');
            return;
        }

        // Cargar datos iniciales para grupos y días
        const respuestaDatos = await fetch('/obtener-datos-horarios');
        const datos = await respuestaDatos.json();
        
        // Llenar selects con el nuevo sistema
        llenarSelect(contenedorGrupo, datos.grupos, 'id_grupo', 'nom_grupo');
        llenarSelect(contenedorDia, datos.dias, 'dia_horario', 'dia_horario');
        
        
        // Inicializar eventos
        inicializarEventosSelects();

        
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error al cargar datos iniciales');
    }
});

// Función para llenar selects personalizados
function llenarSelect(contenedor, datos, valorKey, textoKey) {
    if (!contenedor) return;
    
    const opciones = contenedor.querySelector('.opciones');
    opciones.innerHTML = '';
    
    // Agregar opción para limpiar selección
    const limpiarLi = document.createElement('li');
    limpiarLi.className = 'limpiar-seleccion';
    limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
    limpiarLi.onclick = function() {
        limpiarSeleccion(contenedor);
    };
    opciones.appendChild(limpiarLi);
    
    // Agregar opciones
    datos.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item[textoKey];
        li.setAttribute('data-value', item[valorKey]);
        li.onclick = function() {
            seleccionarOpcion(this, contenedor);
        };
        opciones.appendChild(li);
    });
}

// Función para seleccionar una opción
function seleccionarOpcion(opcion, contenedor) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    
    // Actualizar UI
    contenedor.querySelector('.boton-select span').textContent = opcion.textContent;
    
    // Marcar como seleccionado
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    opcion.classList.add('seleccionado');
    contenedor.classList.add('filtro-activo');
    
    // Actualizar variable correspondiente
    const tipo = contenedor.dataset.type;
    switch(tipo) {
        case 'grupo': Grupo_seleccionado = opcion.dataset.value; break;
        case 'dia': Dia_seleccionado = opcion.dataset.value; break;
        case 'salon': Salon_filtro = opcion.dataset.value; break;
        case 'materia': Materia_filtro = opcion.dataset.value; break;
        case 'profesor': Profesor_filtro = opcion.dataset.value; break;
    }
    
    // Cerrar select
    cerrarSelect(contenedor);
    
    // Si tenemos grupo y día, buscar horarios
    if (Grupo_seleccionado && Dia_seleccionado) {
        buscarHorarios();
    }
}

// Función para limpiar selección
function limpiarSeleccion(contenedor) {
    const tipo = contenedor.dataset.type;
    const defaultText = getDefaultTextForFilter(tipo);
    
    // Actualizar UI
    contenedor.querySelector('.boton-select span').textContent = defaultText;
    
    // Limpiar variable
    switch(tipo) {
        case 'grupo': Grupo_seleccionado = null; break;
        case 'dia': Dia_seleccionado = null; break;
        case 'salon': Salon_filtro = null; break;
        case 'materia': Materia_filtro = null; break;
        case 'profesor': Profesor_filtro = null; break;
    }
    
    // Limpiar selección visual
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    contenedor.classList.remove('filtro-activo');
    
    // Cerrar el select
    cerrarSelect(contenedor);
    
    // Si tenemos horarios cargados, volver a filtrar
    if (todosLosHorarios.length > 0) {
        filtrarYMostrarHorarios();
    }
}

function getDefaultTextForFilter(tipo) {
    const map = {
        'grupo': 'Seleccione un GRUPO',
        'dia': 'Seleccione un DÍA',
        'salon': 'Filtrar por Salón',
        'materia': 'Filtrar por Materia',
        'profesor': 'Filtrar por Profesor',
        'salon-edicion': 'Seleccione salón',
        'materia-edicion': 'Seleccione materia',
        'profesor-edicion': 'Seleccione profesor'
    };
    return map[tipo] || 'Seleccione una opción';
}

// Función para inicializar eventos de los selects
function inicializarEventosSelects() {
    document.querySelectorAll('.contenedor-select').forEach(contenedor => {
        const botonSelect = contenedor.querySelector('.boton-select');
        const inputBusqueda = contenedor.querySelector('.buscador input');
        const opciones = contenedor.querySelector('.opciones');
        
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
                const items = opciones.querySelectorAll('li:not(.limpiar-seleccion)');
                
                items.forEach(item => {
                    const texto = item.textContent.toLowerCase();
                    item.style.display = texto.includes(busqueda) ? 'flex' : 'none';
                });
            });
        }
    });
    
    // Cerrar selects al hacer clic fuera
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.contenedor-select').forEach(contenedor => {
            if (!contenedor.contains(e.target)) {
                cerrarSelect(contenedor);
            }
        });
    });
}

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

// Función principal para buscar horarios
async function buscarHorarios() {
    try {
        const respuesta = await fetch(`/obtener-horarios/${encodeURIComponent(Dia_seleccionado)}/${Grupo_seleccionado}/${idContenedor}`);
        const horarios = await respuesta.json();

        if (!Array.isArray(horarios) || horarios.length === 0) {
            mostrarMensajeSinResultados('No se encontraron horarios para el grupo y día seleccionados');
            filtrosAdicionales.style.display = 'none';
            return;
        }

        // Guardar todos los horarios para filtrar localmente
        todosLosHorarios = horarios;
        
        // Mostrar filtros adicionales
        mostrarFiltrosAdicionales(horarios);
        
        // Filtrar y mostrar horarios
        filtrarYMostrarHorarios();
        
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Hubo un error al obtener los horarios.');
        mostrarMensajeSinResultados('Error al cargar horarios');
    }
}

// Función para filtrar y mostrar horarios
function filtrarYMostrarHorarios() {
    if (!todosLosHorarios || todosLosHorarios.length === 0) return;
    
    const horariosFiltrados = todosLosHorarios.filter(horario => {
        const cumpleSalon = !Salon_filtro || horario.id_salon === Number(Salon_filtro);
        const cumpleMateria = !Materia_filtro || horario.nom_materia === Materia_filtro;
        const cumpleProfesor = !Profesor_filtro || horario.nombre_completo === Profesor_filtro;
        
        return cumpleSalon && cumpleMateria && cumpleProfesor;
    });
    
    mostrarHorarios(horariosFiltrados);
}

// Función para mostrar mensaje cuando no hay resultados
function mostrarMensajeSinResultados(mensaje) {
    contenedorHorarios.innerHTML = `
        <div class="no-horarios-message">
            <i class="fas fa-info-circle"></i>
            <p>${mensaje}</p>
        </div>
    `;
    contenedorHorarios.style.display = 'block';
}

// Función para mostrar filtros adicionales
function mostrarFiltrosAdicionales(horarios) {
    filtrosAdicionales.style.display = 'flex';
    
    // Extraer valores únicos para los filtros
    const salones = [...new Set(horarios.map(h => h.id_salon))];
    const materias = [...new Set(horarios.map(h => h.nom_materia))];
    const profesores = [...new Set(horarios.map(h => h.nombre_completo))];
    
    // Llenar los selects de filtros
    llenarSelectFiltro(contenedorSalonFiltro, salones);
    llenarSelectFiltro(contenedorMateriaFiltro, materias);
    llenarSelectFiltro(contenedorProfesorFiltro, profesores);
}

function llenarSelectFiltro(contenedor, datos) {
    if (!contenedor) return;
    
    const opciones = contenedor.querySelector('.opciones');
    opciones.innerHTML = '';
    
    // Agregar opción para limpiar filtro
    const limpiarLi = document.createElement('li');
    limpiarLi.className = 'limpiar-seleccion';
    limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
    limpiarLi.onclick = function() {
        limpiarSeleccion(contenedor);
    };
    opciones.appendChild(limpiarLi);
    
    // Agregar opciones
    datos.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.setAttribute('data-value', item);
        li.onclick = function() {
            seleccionarOpcion(this, contenedor);
        };
        opciones.appendChild(li);
    });
}

// Función para mostrar horarios en el contenedor
function mostrarHorarios(horarios) {
    contenedorHorarios.innerHTML = '';
    
    if (!horarios || horarios.length === 0) {
        mostrarMensajeSinResultados('No hay horarios que coincidan con los filtros');
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
                <span><b>Acciones</b></span>
            </div>
            <div class="horario-content">
                <span>${horario.nom_grupo}</span>
                <span>${horario.id_salon}</span>
                <span>${horario.nombre_completo}</span>
                <span>${horario.nom_materia}</span>
                <span>${horario.hora_inicio} - ${horario.hora_final}</span>
                <span>${horario.dia_horario}</span>
                <div class="acciones">
                    <button class="btn-editar" onclick="abrirModalEditarHorario(
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
                    )">
                        <i class="fa-solid fa-pencil"></i>
                        Editar
                    </button>
                </div>
            </div>
        `;
        contenedorHorarios.appendChild(card);
    });
    
    contenedorHorarios.style.display = 'block';
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


// Función para abrir el modal con los datos del horario (versión corregida)
async function abrirModalEditarHorario(id_horario, id_grupo, dia_horario, id_salon, id_materia, id_persona, nom_materia, nombre_completo, hora_inicio, hora_final, nom_grupo) {
    try {

        console.log('Abriendo modal de edición para el horario:', {
            id_horario, id_grupo, dia_horario, id_salon,
            id_materia, id_persona, nom_materia, nombre_completo,
            hora_inicio, hora_final, nom_grupo
        });
        // Guardar datos del horario seleccionado
        horarioSeleccionado = {
            id: id_horario,
            grupo: id_grupo,
            dia: dia_horario,
            salon: id_salon,
            materia: id_materia,
            profesor: id_persona,
            hora_inicio: hora_inicio,
            hora_final: hora_final,
            nom_grupo: nom_grupo,
            nom_materia: nom_materia,
            nom_profesor: nombre_completo
        };

        // Obtener datos para los selects del modal
        const respuesta = await fetch('/obtener-datos-horarios');
        const datos = await respuesta.json();

        // Llenar los selects del modal
        llenarSelectModal(contenedorGrupoEdicion, datos.grupos, 'id_grupo', 'nom_grupo');
        llenarSelectModal(contenedorDiaEdicion, datos.dias, 'dia_horario', 'dia_horario');
        llenarSelectModal(contenedorSalonEdicion, datos.salones, 'id_salon', 'nom_salon');
        llenarSelectModal(contenedorMateriaEdicion, datos.materias, 'id_materia', 'nom_materia');
        llenarSelectModal(contenedorProfesorEdicion, datos.profesores, 'id_persona', 'nombre_completo');
        llenarSelectModal(contenedorHoraInicioEdicion, datos.horas, 'hora_inicio', 'hora_inicio');

        // Seleccionar los valores actuales en los selects
        
        seleccionarValoresActuales();
        // Mostrar el modal
        modalEditarHorario.classList.add('modal--show');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error al abrir modal de edición:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No se pudo cargar los datos para editar');
    }
}

// Función para seleccionar los valores actuales en los selects del modal
function seleccionarValoresActuales() {
    // Seleccionar grupo
    setTimeout(() => {
        const opcionGrupo = contenedorGrupoEdicion.querySelector(`li[data-value="${horarioSeleccionado.grupo}"]`);
        if (opcionGrupo) {
            opcionGrupo.click();
        } else {
            contenedorGrupoEdicion.querySelector('.boton-select span').textContent = horarioSeleccionado.nom_grupo;
        }
    }, 100);

    // Seleccionar día
    setTimeout(() => {
        const opcionDia = contenedorDiaEdicion.querySelector(`li[data-value="${horarioSeleccionado.dia}"]`);
        if (opcionDia) {
            opcionDia.click();
        } else {
            contenedorDiaEdicion.querySelector('.boton-select span').textContent = horarioSeleccionado.dia;
        }
    }, 100);

    // Seleccionar salón
    setTimeout(() => {
        const opcionSalon = contenedorSalonEdicion.querySelector(`li[data-value="${horarioSeleccionado.salon}"]`);
        if (opcionSalon) {
            opcionSalon.click();
        } else {
            contenedorSalonEdicion.querySelector('.boton-select span').textContent = horarioSeleccionado.salon;
        }
    }, 100);

    // Seleccionar materia
    setTimeout(() => {
        const opcionMateria = contenedorMateriaEdicion.querySelector(`li[data-value="${horarioSeleccionado.materia}"]`);
        if (opcionMateria) {
            opcionMateria.click();
        } else {
            contenedorMateriaEdicion.querySelector('.boton-select span').textContent = horarioSeleccionado.nom_materia;
        }
    }, 100);

    // Seleccionar profesor
    setTimeout(() => {
        const opcionProfesor = contenedorProfesorEdicion.querySelector(`li[data-value="${horarioSeleccionado.profesor}"]`);
        if (opcionProfesor) {
            opcionProfesor.click();
        } else {
            contenedorProfesorEdicion.querySelector('.boton-select span').textContent = horarioSeleccionado.nom_profesor;
        }
    }, 100);
    // Seleccionar hora de inicio
    setTimeout(() => {
        const opcionHoraInicio = contenedorHoraInicioEdicion.querySelector(`li[data-value="${horarioSeleccionado.hora_inicio}"]`);
        if (opcionHoraInicio) {
            opcionHoraInicio.click();
        } else {
            contenedorHoraInicioEdicion.querySelector('.boton-select span').textContent = horarioSeleccionado.hora_inicio;
        }
    }, 100);
}

// Función para llenar selects personalizados (versión mejorada)
function llenarSelectModal(contenedor, datos, valorKey, textoKey) {
    if (!contenedor) return;
    
    const opciones = contenedor.querySelector('.opciones');
    const botonSelect = contenedor.querySelector('.boton-select span');
    opciones.innerHTML = '';
    
    // Agregar opción para limpiar selección
    const limpiarLi = document.createElement('li');
    limpiarLi.className = 'limpiar-seleccion';
    limpiarLi.innerHTML = ' Limpiar selección';
    limpiarLi.onclick = function() {
        limpiarSeleccion(contenedor);
    };
    opciones.appendChild(limpiarLi);
    
    // Agregar opciones
    datos.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item[textoKey];
        li.setAttribute('data-value', item[valorKey]);
        li.onclick = function() {
            seleccionarOpcionModal(this, contenedor);
        };
        opciones.appendChild(li);
    });
}

// Función para seleccionar una opción en el modal
function seleccionarOpcionModal(opcion, contenedor) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    // Actualizar UI
    contenedor.querySelector('.boton-select span').textContent = opcion.textContent;
    // Marcar como seleccionado
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    opcion.classList.add('seleccionado');
    contenedor.classList.add('filtro-activo');
    // Actualizar variable correspondiente
    const tipo = contenedor.dataset.type;
    switch(tipo) {
        case 'grupo-edicion': grupo_modal = opcion.dataset.value; break;
        case 'dia-edicion': dia_modal = opcion.dataset.value; break;
        case 'salon-edicion': salon_modal = opcion.dataset.value; break;
        case 'materia-edicion': materia_modal = opcion.dataset.value; break;
        case 'profesor-edicion': profesor_modal = opcion.dataset.value; break;
        case 'horaInicio-edicion': horaInicio_modal = opcion.dataset.value; break;
    }
    // Cerrar select
    cerrarSelect(contenedor);
    // Si tenemos grupo y día, buscar horarios
   
}

// Función para limpiar selección
function limpiarSeleccionModal(contenedor) {
    const tipo = contenedor.dataset.type;

    const defaultText = getDefaultTextForFilterModal(tipo);
    
    // Actualizar UI
    contenedor.querySelector('.boton-select span').textContent = defaultText;
    
    // Limpiar variable
    switch(tipo) {
        case 'grupo': grupo_modal = nom_grupo; break;
        case 'dia': dia_modal = dia_modal; break;
        case 'salon': salon_modal = id_salon; break;
        case 'materia': materia_modal = nom_materia; break;
        case 'profesor': profesor_modal = nombre_completo; break;
        case 'horaInicio': horaInicio_modal = hora_inicio; break;
    }
    
    // Limpiar selección visual
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    contenedor.classList.remove('filtro-activo');
    
    // Cerrar el select
    cerrarSelect(contenedor);
    
    // Si tenemos horarios cargados, volver a filtrar
  
}


// Función para inicializar eventos de los selects
function inicializarEventosSelectsModal() {
    document.querySelectorAll('.contenedor-select').forEach(contenedor => {
        const botonSelect = contenedor.querySelector('.boton-select');
        const inputBusqueda = contenedor.querySelector('.buscador input');
        const opciones = contenedor.querySelector('.opciones');
        
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
                const items = opciones.querySelectorAll('li:not(.limpiar-seleccion)');
                
                items.forEach(item => {
                    const texto = item.textContent.toLowerCase();
                    item.style.display = texto.includes(busqueda) ? 'flex' : 'none';
                });
            });
        }
    });
    
    // Cerrar selects al hacer clic fuera
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.contenedor-select').forEach(contenedor => {
            if (!contenedor.contains(e.target)) {
                cerrarSelect(contenedor);
            }
        });
    });
}

document.getElementById('btnCancelarEdicion').addEventListener('click', btnCancelarEdicion);
document.getElementById('btnGuardarEdicion').addEventListener('click', btnGuardarEdicion);

function btnCancelarEdicion() {
    modalEditarHorario.classList.remove('modal--show');
    document.body.style.overflow = '';
    horarioSeleccionado = {};
}

function btnGuardarEdicion() {
    console.log('Guardando edición de horario:', horarioSeleccionado);
    console.log('Datos del modal:', {
        grupo_modal, dia_modal, salon_modal, materia_modal, profesor_modal, horaInicio_modal
    });

    // Obtener la hora de inicio (usando el valor del modal o el original)
    const horaInicio = horaInicio_modal || horarioSeleccionado.hora_inicio;
    
    // Calcular la hora final sumando una hora
    const horaFinal = calcularHoraFinal(horaInicio);
    
    // Validar que todos los campos estén seleccionados
    if (!horarioSeleccionado.grupo || !horarioSeleccionado.dia || !horarioSeleccionado.salon || 
        !horarioSeleccionado.materia || !horarioSeleccionado.profesor || !horaInicio) {
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Por favor, complete todos los campos antes de guardar.');
        return;
    }
    
    const datosHorario = {
        id_horario: horarioSeleccionado.id,
        id_grupo: grupo_modal || horarioSeleccionado.grupo,
        dia_horario: dia_modal || horarioSeleccionado.dia,
        id_salon: salon_modal || horarioSeleccionado.salon,
        id_materia: materia_modal || horarioSeleccionado.materia,
        id_persona: profesor_modal || horarioSeleccionado.profesor,
        hora_inicio: horaInicio || horarioSeleccionado.hora_inicio,
        hora_final: horaFinal || horarioSeleccionado.hora_final, 
    };

    console.log('Datos a enviar:', datosHorario);
    
    // Resto de tu código para enviar al servidor...
    fetch('/editar-horario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosHorario)
    })
    .then(respuesta => respuesta.json())
    .then(data => {
        if (data.error) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', data.error);
        } else {
            createToast('success', 'fa-solid fa-check-circle', 'Éxito', 'Horario editado correctamente.');
            buscarHorarios();
            modalEditarHorario.classList.remove('modal--show');
            document.body.style.overflow = '';
        }
    })
    .catch(error => {
        console.error('Error al editar horario:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Hubo un error al editar el horario.');
    });
}

// Función para calcular la hora final sumando una hora
function calcularHoraFinal(horaInicio) {
    // Dividir la hora en componentes
    const [horas, minutos, segundos] = horaInicio.split(':').map(Number);
    
    // Crear fecha y sumar una hora
    const fecha = new Date();
    fecha.setHours(horas, minutos, segundos);
    fecha.setHours(fecha.getHours() + 1);  // Sumar una hora
    
    // Formatear a HH:MM:SS
    const horaFinal = fecha.toTimeString().substring(0, 8);
    return horaFinal;
}

// Función para mostrar notificaciones
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