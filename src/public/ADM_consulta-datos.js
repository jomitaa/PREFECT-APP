let datoSeleccionado = null;
let Profesor_nombre = null;
let Materia_nombre = null;
let Carrera_nombre = null;
let Grupo_nombre = null;
let Salon_nombre = null;
let Profesor_correo = null;
let Materia_tipo = null;
let Grupo_semestre = null;
let Salon_piso = null;
let Grupo_carrera = null;
let Salon_numero = null;
let Grupo_turno = null;



const contenedorDato = document.querySelector('.contenedor-select');
const contenedorProfesor_nombre = document.querySelector('.contenedor-select[data-type="profe-nombre"]');
const contenedorMateria_nombre = document.querySelector('.contenedor-select[data-type="materia-nombre"]');
const contenedorCarrera_nombre = document.querySelector('.contenedor-select[data-type="carrera-nombre"]');
const contenedorGrupo_nombre = document.querySelector('.contenedor-select[data-type="grupo-nombre"]');
const contenedorSalon_nombre = document.querySelector('.contenedor-select[data-type="salon-nombre"]');
const contenedorProfesor_correo = document.querySelector('.contenedor-select[data-type="profe-correo"]');
const contenedorMateria_tipo = document.querySelector('.contenedor-select[data-type="materia-tipo"]');
const contenedorGrupo_semestre = document.querySelector('.contenedor-select[data-type="grupo-semestre"]');
const contenedorSalon_piso = document.querySelector('.contenedor-select[data-type="salon-piso"]');
const contenedorGrupo_carrera = document.querySelector('.contenedor-select[data-type="grupo-carrera"]');
const contenedorSalon_numero = document.querySelector('.contenedor-select[data-type="salon-numero"]');
const contenedorGrupo_turno = document.querySelector('.contenedor-select[data-type="grupo-turno"]');


document.addEventListener('DOMContentLoaded', function() {
    inicializarEventosDatos();
    
    // Ocultar todos los contenedores al inicio
    document.querySelectorAll('[class^="contenedor-consulta-"]').forEach(container => {
        container.style.display = 'none';
    });

       document.querySelectorAll('[class^="filtros-"]').forEach(container => {
        container.style.display = 'none';
    });
});

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

function seleccionarDato(opcion) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    
    // Actualizar variable y UI
    datoSeleccionado = opcion.dataset.value;
    contenedorDato.querySelector('.boton-select span').textContent = opcion.textContent;
    
    // Marcar como seleccionado
    contenedorDato.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    opcion.classList.add('seleccionado');
    
    // Cerrar select
    cerrarSelect(contenedorDato);
    
    // Mostrar el contenedor correspondiente y cargar datos
    mostrarContenedorConsulta(datoSeleccionado);
    
    // Cargar filtros para este tipo
    cargarFiltros(datoSeleccionado);
    
    // Cargar datos iniciales
    cargarDatos(datoSeleccionado);
}

function mostrarContenedorConsulta(tipo) {
    // Ocultar todos los contenedores primero
    document.querySelectorAll('[class^="contenedor-consulta-"]').forEach(container => {
        container.style.display = 'none';
    });
    document.querySelectorAll('[class^="filtros-"]').forEach(container => {
        container.style.display = 'none';
    });

    // Mostrar el contenedor seleccionado
    const contenedor = document.querySelector(`.contenedor-consulta-${tipo}`);
    const contenedorFiltro = document.querySelector(`.filtros-${tipo}`);
    
    if (contenedor) {
        contenedor.style.display = 'block';
        contenedor.style.animation = 'fadeIn 0.5s ease-in-out';
    }
    
    if (contenedorFiltro) {
        contenedorFiltro.style.display = 'grid';
        contenedorFiltro.style.animation = 'fadeIn 0.5s ease-in-out';
    }
}

function inicializarEventosDatos() {
    const botonSelect = contenedorDato.querySelector('.boton-select');
    const contenidoSelect = contenedorDato.querySelector('.contenido-select');
    
    // Evento para abrir/cerrar el select
    botonSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        contenedorDato.classList.toggle("activo");
    });
    
    // Asegúrate que las opciones tienen el evento onclick correcto
    const opcionesDato = contenedorDato.querySelectorAll('.opciones li');
    opcionesDato.forEach(opcion => {
        opcion.onclick = function() {
            seleccionarDato(this);
        };
    });
    
    // Cerrar select al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!contenedorDato.contains(e.target)) {
            cerrarSelect(contenedorDato);
        }
    });
}

async function cargarFiltros(tipo) {
    try {
        // Usamos el mismo endpoint de consulta
        const response = await fetch(`/api/consulta-${tipo}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.warn(`No se encontraron datos para ${tipo}`);
            return;
        }
        
        // Procesamos los datos para extraer valores únicos para los filtros
        switch(tipo) {
            case 'profesor':
                const nombresProfesores = [...new Set(data.map(p => p.nom_persona + ' ' + p.appat_persona + (p.apmat_persona ? ' ' + p.apmat_persona : '')))];
                const correosProfesores = [...new Set(data.map(p => p.correo))];
                llenarSelect('profe-nombre', nombresProfesores);
                llenarSelect('profe-correo', correosProfesores);
                break;
                
            case 'materia':
                const nombresMaterias = [...new Set(data.map(m => m.nom_materia))];
                const tiposMaterias = [...new Set(data.map(m => m.nom_tipomateria))];
                llenarSelect('materia-nombre', nombresMaterias);
                llenarSelect('materia-tipo', tiposMaterias);
                break;
                
            case 'carrera':
                const nombresCarreras = [...new Set(data.map(c => c.nom_carrera))];
                llenarSelect('carrera-nombre', nombresCarreras);
                break;
                
            case 'grupo':
                const nombresGrupos = [...new Set(data.map(g => g.nom_grupo))];
                const semestresGrupos = [...new Set(data.map(g => g.sem_grupo))];
                const carrerasGrupos = [...new Set(data.map(g => g.nom_carrera))];
                const turnosGrupos = [...new Set(data.map(g => g.nom_turno))];
                llenarSelect('grupo-nombre', nombresGrupos);
                llenarSelect('grupo-semestre', semestresGrupos);
                llenarSelect('grupo-carrera', carrerasGrupos);
                llenarSelect('grupo-turno', turnosGrupos);
                break;
                
            case 'salon':
                const nombresSalones = [...new Set(data.map(s => s.nom_salon))];
                const pisosSalones = [...new Set(data.map(s => s.nom_piso))];
                llenarSelect('salon-nombre', nombresSalones);
                llenarSelect('salon-piso', pisosSalones);
                break;
        }
        
        // Inicializar eventos para los nuevos selects
        inicializarEventosFiltros(tipo);
        
    } catch (error) {
        console.error(`Error al cargar filtros para ${tipo}:`, error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', `Error al cargar filtros para ${tipo}`);
    }
}

function llenarSelect(tipo, datos) {
    const contenedor = document.querySelector(`.contenedor-select[data-type="${tipo}"]`);
    if (!contenedor) {
        console.error(`No se encontró el select con tipo: ${tipo}`);
        return;
    }

    const opciones = contenedor.querySelector('.opciones');
    opciones.innerHTML = '';

    // Agregar opción para limpiar filtro
    const limpiarLi = document.createElement('li');
    limpiarLi.className = 'limpiar-seleccion';
    limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
    limpiarLi.onclick = function() {
        limpiarFiltro(tipo, contenedor);
    };
    opciones.appendChild(limpiarLi);

    // Agregar opciones
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

function seleccionarOpcionFiltro(opcion, tipo) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    
    // Actualizar variable correspondiente
    switch(tipo) {
        case 'profe-nombre': Profesor_nombre = opcion.dataset.value; break;
        case 'materia-nombre': Materia_nombre = opcion.dataset.value; break;
        case 'carrera-nombre': Carrera_nombre = opcion.dataset.value; break;
        case 'grupo-nombre': Grupo_nombre = opcion.dataset.value; break;
        case 'salon-nombre': Salon_nombre = opcion.dataset.value; break;
        case 'profe-correo': Profesor_correo = opcion.dataset.value; break;
        case 'materia-tipo': Materia_tipo = opcion.dataset.value; break;
        case 'grupo-semestre': Grupo_semestre = opcion.dataset.value; break;
        case 'salon-piso': Salon_piso = opcion.dataset.value; break;
        case 'grupo-carrera': Grupo_carrera = opcion.dataset.value; break;
        case 'salon-numero': Salon_numero = opcion.dataset.value; break;
        case 'grupo-turno': Grupo_turno = opcion.dataset.value; break;
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
    
    // Filtrar datos
    filtrarDatosConsulta();
}

function limpiarFiltro(tipo, contenedor) {
    const defaultText = getDefaultTextForFilter(tipo);
    
    // Actualizar UI
    contenedor.querySelector('.boton-select span').textContent = defaultText;
    
    // Limpiar variable
    switch(tipo) {
        case 'profe-nombre': Profesor_nombre = null; break;
        case 'materia-nombre': Materia_nombre = null; break;
        case 'carrera-nombre': Carrera_nombre = null; break;
        case 'grupo-nombre': Grupo_nombre = null; break;
        case 'salon-nombre': Salon_nombre = null; break;
        case 'profe-correo': Profesor_correo = null; break;
        case 'materia-tipo': Materia_tipo = null; break;
        case 'grupo-semestre': Grupo_semestre = null; break;
        case 'salon-piso': Salon_piso = null; break;
        case 'grupo-carrera': Grupo_carrera = null; break;
        case 'salon-numero': Salon_numero = null; break;
        case 'grupo-turno': Grupo_turno = null; break;
    }

    // Limpiar selección visual
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    contenedor.classList.remove('filtro-activo');
    
    // Cerrar el select
    cerrarSelect(contenedor);
    
    // Volver a filtrar
    filtrarDatosConsulta();
}

function getDefaultTextForFilter(tipo) {
    const map = {
        'profe-nombre': 'Filtrar por Nombre',
        'materia-nombre': 'Filtrar por Nombre',
        'carrera-nombre': 'Filtrar por Nombre',
        'grupo-nombre': 'Filtrar por Nombre',
        'salon-nombre': 'Filtrar por Nombre',
        'profe-correo': 'Filtrar por Correo',
        'materia-tipo': 'Filtrar por Tipo',
        'grupo-semestre': 'Filtrar por Semestre',
        'salon-piso': 'Filtrar por Piso',
        'grupo-carrera': 'Filtrar por Carrera',
        'salon-numero': 'Filtrar por Número',
        'grupo-turno': 'Filtrar por Turno'
    };
    return map[tipo] || 'Seleccione una opción';
}

function inicializarEventosFiltros(tipo) {
    const contenedores = document.querySelectorAll(`.filtros-${tipo} .contenedor-select`);
    
    contenedores.forEach(contenedor => {
        if (!contenedor) return;

        const botonSelect = contenedor.querySelector('.boton-select');
        const inputBusqueda = contenedor.querySelector('.buscador input');
        const opciones = contenedor.querySelector('.opciones');
        const tipoFiltro = contenedor.dataset.type;

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
        contenedores.forEach(contenedor => {
            if (!contenedor.contains(e.target)) {
                cerrarSelect(contenedor);
            }
        });
    });
}

async function filtrarDatosConsulta() {
    if (!datoSeleccionado) return;
    
    try {
        // Obtenemos todos los datos primero
        const response = await fetch(`/api/consulta-${datoSeleccionado}`);
        const todosLosDatos = await response.json();
        
        if (!todosLosDatos || todosLosDatos.length === 0) {
            mostrarDatos(datoSeleccionado, []);
            return;
        }
        
        // Filtramos localmente según las selecciones
        const datosFiltrados = todosLosDatos.filter(item => {
            switch(datoSeleccionado) {
                case 'profesor':
                    return (
                        (!Profesor_nombre || item.nom_persona + ' ' + item.appat_persona + ' ' + item.apmat_persona === Profesor_nombre) &&
                        (!Profesor_correo || item.correo === Profesor_correo)
                    );
                case 'materia':
                    return (
                        (!Materia_nombre || item.nom_materia === Materia_nombre) &&
                        (!Materia_tipo || item.nom_tipomateria === Materia_tipo)
                    );
                case 'carrera':
                    return (!Carrera_nombre || item.nom_carrera === Carrera_nombre);
                case 'grupo':
                    return (
                        (!Grupo_nombre || item.nom_grupo === Grupo_nombre) &&
                        (!Grupo_semestre || item.sem_grupo == Grupo_semestre) &&
                        (!Grupo_carrera || item.nom_carrera === Grupo_carrera) &&
                        (!Grupo_turno || item.nom_turno === Grupo_turno)
                    );
                case 'salon':
                    return (
                        (!Salon_nombre || item.nom_salon === Salon_nombre) &&
                        (!Salon_piso || item.nom_piso === Salon_piso)
                    );
                default:
                    return true;
            }
        });
        
        mostrarDatos(datoSeleccionado, datosFiltrados);
        
    } catch (error) {
        console.error('Error al filtrar datos:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error al aplicar filtros');
    }
}





// Función para cargar datos según el tipo seleccionado
async function cargarDatos(tipo) {
    try {
        const response = await fetch(`/api/consulta-${tipo}`);
        
        // Verificar si la respuesta es OK
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        mostrarDatos(tipo, data);
    } catch (error) {
        console.error('Error al cargar datos:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error al cargar los datos. Verifica la consola para más detalles.');
    }
}

// Función para mostrar datos en la tabla correspondiente
function mostrarDatos(tipo, datos) {
    const contenedor = document.querySelector(`.contenedor-consulta-${tipo}`);

    if (!datos || datos.length === 0) {
        contenedor.innerHTML = `
            <div class="no-horarios-message">
                <i class="fas fa-info-circle"></i>
                <p>No se encontraron registros</p>
            </div>
        `;
        return;
    }

    const cardsHTML = datos.map(item => generarCard(tipo, item)).join('');
    contenedor.innerHTML = `
    <div class="blur-overlay top"></div>
        <div class="horarios-list">${cardsHTML}</div>
    <div class="blur-overlay bottom"></div>
    `;
}

function generarCard(tipo, item) {
    const cardClass = `card-${tipo}`;
    switch (tipo) {
        case 'profesor':
            return `
                <div class="horario-card ${cardClass}">
                    <div class="horario-header">
                        <span><b>ID</b></span>
                        <span><b>Nombre</b></span>
                        <span><b>Apellido P.</b></span>
                        <span><b>Apellido M.</b></span>
                        <span><b>Correo</b></span>
                        <span><b>Acciones</b></span>
                    </div>
                    <div class="horario-content">
                        <span>${item.id_persona}</span>
                        <span>${item.nom_persona}</span>
                        <span>${item.appat_persona}</span>
                        <span>${item.apmat_persona || ''}</span>
                        <span>${item.correo}</span>
                        <div class="acciones">
                            <button class="btn-editar" data-id="${item.id_persona}">
                                <i class="fa-solid fa-pencil"></i>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>`;
        case 'materia':
            return `
                <div class="horario-card ${cardClass}">
                    <div class="horario-header">
                        <span><b>ID</b></span>
                        <span><b>Nombre</b></span>
                        <span><b>Tipo</b></span>
                        <span><b>Acciones</b></span>
                    </div>
                    <div class="horario-content">
                        <span>${item.id_materia}</span>
                        <span>${item.nom_materia}</span>
                        <span>${item.nom_tipomateria || item.id_tipomateria}</span>
                        <div class="acciones">
                            <button class="btn-editar" data-id="${item.id_materia}">
                                <i class="fa-solid fa-pencil"></i>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>`;
        case 'carrera':
            return `
                <div class="horario-card ${cardClass}">
                    <div class="horario-header">
                        <span><b>ID</b></span>
                        <span><b>Nombre</b></span>
                        <span><b>Acciones</b></span>
                    </div>
                    <div class="horario-content">
                        <span>${item.id_carrera}</span>
                        <span>${item.nom_carrera}</span>
                        <div class="acciones">
                            <button class="btn-editar" data-id="${item.id_carrera}">
                                <i class="fa-solid fa-pencil"></i>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>`;
        case 'grupo':
            return `
                <div class="horario-card ${cardClass}">
                    <div class="horario-header">
                        <span><b>ID</b></span>
                        <span><b>Nombre</b></span>
                        <span><b>Semestre</b></span>
                        <span><b>Carrera</b></span>
                        <span><b>Turno</b></span>
                        <span><b>Acciones</b></span>
                    </div>
                    <div class="horario-content">
                        <span>${item.id_grupo}</span>
                        <span>${item.nom_grupo}</span>
                        <span>${item.sem_grupo}</span>
                        <span>${item.nom_carrera || item.id_carrera}</span>
                        <span>${item.nom_turno}</span>
                        <div class="acciones">
                            <button class="btn-editar" data-id="${item.id_grupo}">
                                <i class="fa-solid fa-pencil"></i>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>`;
        case 'salon':
            return `
                <div class="horario-card ${cardClass}">
                    <div class="horario-header">
                        <span><b>ID</b></span>
                        <span><b>Nombre / Número</b></span>
                        <span><b>Piso</b></span>
                        <span><b>Acciones</b></span>
                    </div>
                    <div class="horario-content">
                        <span>${item.id_salon}</span>
                        <span>${item.nom_salon}</span>
                        <span>${item.nom_piso}</span>
                        <div class="acciones">
                            <button class="btn-editar" data-id="${item.id_salon}">
                                <i class="fa-solid fa-pencil"></i>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>`;
        default:
            return '';
    }
}

function mostrarAlerta(mensaje, tipo) {
    const alerta = document.querySelector('.alerta');
    alerta.innerHTML = `
        <div class="toast ${tipo}">
            <div class="icono">
                <i class='bx ${tipo === "error" ? "bxs-error" : tipo === "advertencia" ? "bxs-error-circle" : "bxs-check-circle"}'></i>
            </div>
            <div class="content">
                <div class="title">${tipo === "error" ? "Error" : tipo === "advertencia" ? "Advertencia" : "Éxito"}</div>
                <span>${mensaje}</span>
            </div>
            <div class="close"><i class='bx bx-x'></i></div>
        </div>
    `;
    setTimeout(() => alerta.innerHTML = '', 5000);
}

// ------------------------------------- ALERTAS -------------------------------------

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

// ------------------------------------- ALERTAS -------------------------------------


// Variables globales
let tipoActual = '';
let idActual = '';

// Función para abrir el modal de edición
function abrirModalEdicion(tipo, id) {
    tipoActual = tipo;
    idActual = id;
    
    const modal = document.getElementById('modal-edicion');
    const formulario = document.getElementById('form-edicion');
    
    // Limpiar formulario
    formulario.innerHTML = '';
    
    // Configurar título
    document.querySelector('.modal-titulo').textContent = `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    
    // Cargar datos y mostrar formulario
    cargarDatosParaEdicion(tipo, id)
        .then(formularioHTML => {
            formulario.innerHTML = formularioHTML;
            modal.classList.add('mostrar');
        })
        .catch(error => {
            console.error('Error al cargar datos para edición:', error);
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No se pudieron cargar los datos para edición');
        });
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById('modal-edicion');
    modal.classList.remove('mostrar');
}

// Función para cargar datos y generar formulario
// Función para cargar datos y generar formulario (completa)
async function cargarDatosParaEdicion(tipo, id) {
    const response = await fetch(`/api/obtener-${tipo}/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener datos');
    }
    
    switch(tipo) {
        case 'profesor':
            return `
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nom_persona" class="input-group" value="${data.nom_persona}" required>
                </div>
                <div class="form-group">
                    <label>Apellido Paterno</label>
                    <input type="text" name="appat_persona" class="input-group" value="${data.appat_persona}" required>
                </div>
                <div class="form-group">
                    <label>Apellido Materno</label>
                    <input type="text" name="apmat_persona" class="input-group" value="${data.apmat_persona || ''}">
                </div>
                <div class="form-group">
                    <label>Correo</label>
                    <input type="email" name="correo" class="input-group" value="${data.correo}" required>
                </div>
            `;
            
        case 'materia':
            // Cargar tipos de materia para el select
            const tiposResponse = await fetch('/api/consulta-tipomateria');
            const tipos = await tiposResponse.json();
            
            let optionsMateria = tipos.map(tipo => 
                `<option value="${tipo.id_tipomateria}" ${tipo.id_tipomateria == data.id_tipomateria ? 'selected' : ''}>
                    ${tipo.nom_tipomateria}
                </option>`
            ).join('');
            
            return `
                <div class="form-group">
                    <label>Nombre de la Materia</label>
                    <input type="text" name="nom_materia" class="input-group" value="${data.nom_materia}" required>
                </div>
                <div class="form-group">
                    <label>Tipo de Materia</label>
                    <select name="id_tipomateria" class="select-group" required>
                        <option value="">Seleccionar tipo</option>
                        ${optionsMateria}
                    </select>
                </div>
            `;
            
        case 'carrera':
            return `
                <div class="form-group">
                    <label>Nombre de la Carrera</label>
                    <input type="text" name="nom_carrera" class="input-group" value="${data.nom_carrera}" required>
                </div>
            `;
            
        case 'grupo':
            // Cargar carreras para el select
            const carrerasResponse = await fetch('/api/consulta-carrera');
            const carreras = await carrerasResponse.json();
            
            let optionsCarrera = carreras.map(carrera => 
                `<option value="${carrera.id_carrera}" ${carrera.id_carrera == data.id_carrera ? 'selected' : ''}>
                    ${carrera.nom_carrera}
                </option>`
            ).join('');
            
            // Cargar turnos para el select
            const turnosResponse = await fetch('/api/consulta-turno');
            const turnos = await turnosResponse.json();
            
            let optionsTurno = turnos.map(turno => 
                `<option value="${turno.id_turno}" ${turno.id_turno == data.id_turno ? 'selected' : ''}>
                    ${turno.nom_turno}
                </option>`
            ).join('');
            
            return `
                <div class="form-group">
                    <label>Nombre del Grupo</label>
                    <input type="text" name="nom_grupo" class="input-group" value="${data.nom_grupo}" required>
                </div>
                <div class="form-group">
                    <label>Semestre</label>
                    <select name="sem_grupo" class="select-group" required>
                        <option value="">Seleccionar semestre</option>
                        ${Array.from({length: 12}, (_, i) => 
                            `<option value="${i+1}" ${(i+1) == data.sem_grupo ? 'selected' : ''}>${i+1}° Semestre</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Carrera</label>
                    <select name="id_carrera" class="select-group" required>
                        <option value="">Seleccionar carrera</option>
                        ${optionsCarrera}
                    </select>
                </div>
                <div class="form-group">
                    <label>Turno</label>
                    <select name="id_turno" class="select-group" required>
                        <option value="">Seleccionar turno</option>
                        ${optionsTurno}
                    </select>
                </div>
            `;
            
        case 'salon':
            // Cargar pisos para el select
            const pisosResponse = await fetch('/api/consulta-piso');
            const pisos = await pisosResponse.json();
            
            let optionsPiso = pisos.map(piso => 
                `<option value="${piso.piso_salon}" ${piso.piso_salon == data.piso_salon ? 'selected' : ''}>
                    ${piso.piso_salon}
                </option>`
            ).join('');
            
            return `
                <div class="form-group">
                    <label>Número de Salón</label>
                    <input type="text" name="nom_salon" class="input-group" value="${data.nom_salon}" required>
                </div>
                <div class="form-group">
                    <label>Piso</label>
                    <select name="piso_salon" class="select-group" required>
                        <option value="">Seleccionar piso</option>
                        ${optionsPiso}
                    </select>
                </div>
            `;
            
        default:
            return '';
    }
}

// Evento para enviar el formulario de edición
document.getElementById('form-edicion').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const datos = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`/api/actualizar-${tipoActual}/${idActual}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', 'Cambios guardados correctamente');
            cerrarModal();
            cargarDatos(tipoActual);
        } else {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', resultado.message || 'Error al guardar cambios');
        }
    } catch (error) {
        console.error('Error:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error de conexión con el servidor');
    }
});

// Eventos para cerrar el modal
document.querySelector('.modal-cerrar').addEventListener('click', cerrarModal);
document.querySelector('.btn-cancelar').addEventListener('click', cerrarModal);

// Delegación de eventos para los botones editar
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-editar')) {
        const boton = e.target.closest('.btn-editar');
        const tipo = datoSeleccionado
        const id = boton.dataset.id;
        abrirModalEdicion(tipo, id);
    }
});
