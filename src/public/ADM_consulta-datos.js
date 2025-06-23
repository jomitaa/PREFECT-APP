document.addEventListener('DOMContentLoaded', function() {
    const selector = document.getElementById('selector-consulta');
    
    // Ocultar todos los contenedores al inicio
    document.querySelectorAll('[class^="contenedor-consulta-"]').forEach(container => {
        container.style.display = 'none';
    });

    selector.addEventListener('change', function() {
        // Ocultar todos los contenedores primero
        document.querySelectorAll('[class^="contenedor-consulta-"]').forEach(container => {
            container.style.display = 'none';
        });

        // Mostrar el contenedor seleccionado y cargar datos
        if (this.value) {
            const contenedor = document.querySelector(`.contenedor-consulta-${this.value}`);
            if (contenedor) {
                contenedor.style.display = 'block';
                cargarDatos(this.value);
                contenedor.style.animation = 'fadeIn 0.5s ease-in-out';
            }
        }
    });
});

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
        const tipo = document.getElementById('selector-consulta').value;
        const id = boton.dataset.id;
        abrirModalEdicion(tipo, id);
    }
});
