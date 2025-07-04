document.addEventListener('DOMContentLoaded', function() {
    // Obtener el selector y los contenedores
    const selector = document.getElementById('selector-contenedor');
    const contenedores = {
        profesor: document.querySelector('.contenedor-profesores'),
        materias: document.querySelector('.contenedor-materias'),
        carreras: document.querySelector('.contenedor-carreras'),
        grupos: document.querySelector('.contenedor-grupos'),
        salon: document.querySelector('.contenedor-salon'),
        piso: document.querySelector('.contenedor-piso')
    };

    // Escuchar cambios en el selector
    selector.addEventListener('change', function() {
        // Ocultar todos los contenedores
        Object.values(contenedores).forEach(contenedor => {
            contenedor.classList.remove('contenedor-activo');
        });

        // Mostrar el contenedor seleccionado
        if (this.value && contenedores[this.value]) {
            contenedores[this.value].classList.add('contenedor-activo');
        }
    });

    // Inicializar: asegurarse de que todo está oculto al inicio
    Object.values(contenedores).forEach(contenedor => {
        contenedor.style.display = 'none';
    });
});

// El resto de tu código JS actual permanece igual...


function eliminarCard(boton) {
    const card = boton.closest('[class$="-card"]'); // Encuentra la tarjeta padre
    const contenedor = card.parentElement;
    
    // Verificar que no sea la primera tarjeta
    if (!card.isSameNode(contenedor.firstElementChild)) {
        card.remove();
    } else {
        // Opcional: Mostrar mensaje si intenta eliminar la principal
        mostrarAlerta("No puedes eliminar la tarjeta principal", "advertencia");
    }
}

// Funciones de agregar actualizadas
document.getElementById('agregar-profesor').addEventListener('click', () => {
    const originalCard = document.querySelector('.profesor-card');
    const clone = originalCard.cloneNode(true);
    clone.querySelector('.btnEliminar').style.display = 'block'; // Mostrar botón en clones
    document.getElementById('profesores').appendChild(clone);
    clone.querySelectorAll('input').forEach(input => input.value = '');
});

document.getElementById('agregar-materia').addEventListener('click', () => {
    const originalCard = document.querySelector('.materia-card');
    const clone = originalCard.cloneNode(true);
    clone.querySelector('.btnEliminar').style.display = 'block';
    document.getElementById('materias').appendChild(clone);
    clone.querySelectorAll('input, select').forEach(input => input.value = '');
});

document.getElementById('agregar-carrera').addEventListener('click', () => {
    const originalCard = document.querySelector('.carrera-card');
    const clone = originalCard.cloneNode(true);
    clone.querySelector('.btnEliminar').style.display = 'block';
    document.getElementById('carreras').appendChild(clone);
    clone.querySelector('input').value = '';
});

document.getElementById('agregar-grupo').addEventListener('click', () => {
    const originalCard = document.querySelector('.grupo-card');
    const clone = originalCard.cloneNode(true);
    clone.querySelector('.btnEliminar').style.display = 'block';
    document.getElementById('grupos').appendChild(clone);
    clone.querySelectorAll('input, select').forEach(input => input.value = '');
});

document.getElementById('agregar-piso').addEventListener('click', () => {
    const originalCard = document.querySelector('.piso-card');
    const clone = originalCard.cloneNode(true);
    clone.querySelector('.btnEliminar').style.display = 'block';
    document.getElementById('pisos').appendChild(clone);
    clone.querySelector('input').value = '';
});

// Función para mostrar alertas (opcional)
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

// Agregar nuevo salón
document.getElementById('agregar-salon').addEventListener('click', () => {
    const salonCard = document.querySelector('.salon-card');
    const clone = salonCard.cloneNode(true);
    
    // Mostrar botón de eliminar en clones
    clone.querySelector('.btnEliminar').style.display = 'block';
    
    // Limpiar campos
    clone.querySelector('input').value = '';
    clone.querySelector('select').value = '';
    
    document.getElementById('salones').appendChild(clone);
});




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

// ------------------------------------- PROFES -------------------------------------

// Función para guardar profesores usando tu sistema de toast
document.getElementById('guardar-profesores').addEventListener('click', async (e) => {
    e.preventDefault();

    const cards = document.querySelectorAll('.profesor-card');
    let totalGuardados = 0;
    let totalErrores = 0;

    // 1. Validar que haya al menos una tarjeta
    if (cards.length === 0) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Advertencia', 'Debe agregar al menos un profesor');
        return;
    }

    // 2. Validación previa unificada
    let faltaNombre = false;
    let faltaApellido = false;
    let faltaCorreo = false;
    let correoInvalido = false;

    for (const card of cards) {
        const inputs = card.querySelectorAll('input');
        const nombre = inputs[0].value.trim();
        const apellido = inputs[1].value.trim();
        const correo = inputs[3].value.trim();

        if (!nombre) faltaNombre = true;
        if (!apellido) faltaApellido = true;
        if (!correo) faltaCorreo = true;
        if (correo && !validarEmail(correo)) correoInvalido = true;
    }

    // Mostrar alertas unificadas
    if (faltaNombre) {
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'El nombre es obligatorio para todos los profesores');
        return;
    }
    if (faltaApellido) {
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'El apellido paterno es obligatorio para todos los profesores');
        return;
    }
    if (faltaCorreo) {
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'El correo es obligatorio para todos los profesores');
        return;
    }
    if (correoInvalido) {
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Uno o más correos tienen formato inválido');
        return;
    }

    // 3. Mostrar estado de carga
    const btnGuardar = document.getElementById('guardar-profesores');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    // 4. Procesar cada tarjeta individualmente (solo si pasó validación)
    for (const [index, card] of Array.from(cards).entries()) {
        const inputs = card.querySelectorAll('input');
        const profesor = {
            nom_persona: inputs[0].value.trim(),
            appat_persona: inputs[1].value.trim(),
            apmat_persona: inputs[2].value.trim(),
            correo: inputs[3].value.trim(),
            id_rol: 1
        };

        try {
            const respuesta = await fetch('/agregar-profe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profesor)
            });

            const resultado = await respuesta.json();

            if (respuesta.ok && resultado.success) {
                totalGuardados++;
                if (index > 0) card.remove();
                else card.querySelectorAll('input').forEach(input => input.value = '');
            } else {
                totalErrores++;
            }
        } catch (error) {
            console.error('Error:', error);
            totalErrores++;
        }
    }

    // 5. Mostrar resumen
    if (totalGuardados > 0) {
        createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', 
            `${totalGuardados} profesor(es) guardado(s) correctamente`);
    }
    if (totalErrores > 0) {
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 
            `${totalErrores} profesor(es) no se pudieron guardar`);
    }

    // 6. Restaurar botón
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
});

// Función para validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ------------------------------------- PROFES -------------------------------------



// ------------------------------------- MATERIAS -------------------------------------

async function cargarTipoM() {
    try {
        const response = await fetch('/api/tipomaterias');
        const tipom = await response.json();
        
        // Actualizar todos los selects de carrera
        document.querySelectorAll('select[name="id_tipom"]').forEach(select => {
            // Guardar la selección actual si existe
            const valorActual = select.value;
            
            // Limpiar y agregar nuevas opciones
            select.innerHTML = '<option value="" disabled selected>Seleccionar tipo de materia</option>';
            
            tipom.forEach(tipom => {
                const option = document.createElement('option');
                option.value = tipom.id_tipomateria;
                option.textContent = tipom.nom_tipomateria;
                select.appendChild(option);
            });
            
            // Restaurar la selección anterior si existe
            if (valorActual) {
                select.value = valorActual;
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error al cargar carreras:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No se pudieron cargar las carreras');
        return false;
    }
}

// Cargar carreras al iniciar y cuando se agregue nueva tarjeta
document.addEventListener('DOMContentLoaded', async () => {
    await cargarTipoM();
});


document.getElementById('guardar-materias').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const cards = document.querySelectorAll('.materia-card');
    let totalGuardados = 0;
    let totalErrores = 0;

    // Mostrar loading
    const btnGuardar = document.getElementById('guardar-materias');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    // Procesar cada materia individualmente
    for (const [index, card] of Array.from(cards).entries()) {
        const nombre = card.querySelector('input[name="nom_materia"]').value.trim();
        const tipo = card.querySelector('select[name="id_tipom"]').value;

        // Validación básica
        if (!nombre || !tipo) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Complete todos los campos obligatorios');
            totalErrores++;
            continue;
        }

        try {
            const response = await fetch('/agregar-materia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nom_materia: nombre, 
                    id_tipomateria: tipo 
                })
            });

            const resultado = await response.json();

            if (response.ok && resultado.success) {
                totalGuardados++;
                // Limpiar tarjeta si se guardó correctamente (excepto primera)
                if (index > 0) {
                    card.remove();
                } else {
                    card.querySelector('input[name="nom_materia"]').value = '';
                    card.querySelector('select[name="id_tipom"]').selectedIndex = 0;
                }
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', resultado.message || 'Error al guardar materia');
                totalErrores++;
            }
        } catch (error) {
            console.error('Error:', error);
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error de conexión');
            totalErrores++;
        }
    }

    // Mostrar resumen
    if (totalGuardados > 0) {
        createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', `${totalGuardados} materia(s) guardada(s) correctamente`);
    }

    // Restaurar botón
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
});

// ------------------------------------- MATERIAS -------------------------------------

// ------------------------------------- CARRERAS -------------------------------------

document.getElementById('guardar-carreras').addEventListener('click', async (e) => {    
    e.preventDefault();
    
    const cards = document.querySelectorAll('.carrera-card');
    let totalGuardados = 0;
    let totalErrores = 0;

    // Mostrar loading
    const btnGuardar = document.getElementById('guardar-carreras');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    // Procesar cada carrera individualmente
    for (const [index, card] of Array.from(cards).entries()) {
        const nombre = card.querySelector('input[name="nom_carrera"]').value.trim();

        // Validación básica
        if (!nombre) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'El nombre de la carrera es obligatorio');
            totalErrores++;
            continue;
        }

        try {
            const response = await fetch('/agregar-carrera', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom_carrera: nombre })
            });

            const resultado = await response.json();

            if (response.ok && resultado.success) {
                totalGuardados++;
                // Limpiar tarjeta si se guardó correctamente (excepto primera)
                if (index > 0) {
                    card.remove();
                } else {
                    card.querySelector('input[name="nom_carrera"]').value = '';
                }
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', resultado.message || 'Error al guardar carrera');
                totalErrores++;
            }
        } catch (error) {
            console.error('Error:', error);
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error de conexión');
            totalErrores++;
        }
    }

    // Mostrar resumen
    if (totalGuardados > 0) {
        createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', `${totalGuardados} carrera(s) guardada(s) correctamente`);
    }

    // Restaurar botón
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
});

// ------------------------------------- CARRERAS -------------------------------------

// ------------------------------------- GRUPOS -------------------------------------
async function cargarCarreras() {
    try {
        const response = await fetch('/api/carreras');
        const carreras = await response.json();
        
        // Actualizar todos los selects de carrera
        document.querySelectorAll('select[name="id_carrera"]').forEach(select => {
            // Guardar la selección actual si existe
            const valorActual = select.value;
            
            // Limpiar y agregar nuevas opciones
            select.innerHTML = '<option value="" disabled selected>Seleccionar la Carrera correspondiente</option>';
            
            carreras.forEach(carreras => {
                const option = document.createElement('option');
                option.value = carreras.id_carrera;
                option.textContent = carreras.nom_carrera;
                select.appendChild(option);
            });
            
            // Restaurar la selección anterior si existe
            if (valorActual) {
                select.value = valorActual;
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error al cargar carreras:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No se pudieron cargar las carreras');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCarreras();
});

document.getElementById('guardar-grupos').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const cards = document.querySelectorAll('.grupo-card');
    let totalGuardados = 0;
    let totalErrores = 0;

    // Mostrar loading
    const btnGuardar = document.getElementById('guardar-grupos');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    // Procesar cada grupo individualmente
    for (const [index, card] of Array.from(cards).entries()) {
        const semestre = card.querySelector('select[name="sem_grupo"]').value;
        const nombreGrupo = card.querySelector('input[name="nom_grupo"]').value.trim();
        const carrera = card.querySelector('select[name="id_carrera"]').value;
        const turno = card.querySelector('select[name="id_turno"]').value;

        // Validación básica
        if (!semestre || !nombreGrupo || !carrera || !turno) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Complete todos los campos obligatorios');
            totalErrores++;
            continue;
        }

        try {
            const response = await fetch('/agregar-grupo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sem_grupo: semestre, 
                    nom_grupo: nombreGrupo, 
                    id_carrera: carrera,
                    id_turno: turno
                })
            });

            const resultado = await response.json();

            if (response.ok && resultado.success) {
                totalGuardados++;
                // Limpiar tarjeta si se guardó correctamente (excepto primera)
                if (index > 0) {
                    card.remove();
                } else {
                    card.querySelector('select[name="sem_grupo"]').selectedIndex = 0;
                    card.querySelector('input[name="nom_grupo"]').value = '';
                    card.querySelector('select[name="id_carrera"]').selectedIndex = 0;
                    card.querySelector('select[name="id_turno"]').selectedIndex = 0;
                }
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', resultado.message || 'Error al guardar grupo');
                totalErrores++;
            }
        } catch (error) {
            console.error('Error:', error);
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error de conexión');
            totalErrores++;
        }
    }

    // Mostrar resumen
    if (totalGuardados > 0) {
        createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', `${totalGuardados} grupo(s) guardado(s) correctamente`);
    }
    // Restaurar botón
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
});

// ------------------------------------- GRUPOS -------------------------------------

// ------------------------------------- PISO -------------------------------------

document.getElementById('guardar-piso').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const cards = document.querySelectorAll('.piso-card');
    let totalGuardados = 0;
    let totalErrores = 0;

    // Mostrar loading
    const btnGuardar = document.getElementById('guardar-piso');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    // Procesar cada piso individualmente
    for (const [index, card] of Array.from(cards).entries()) {
        const nombrePiso = card.querySelector('input[name="nom_piso"]').value.trim();

        // Validación básica
        if (!nombrePiso) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'El nombre del piso es obligatorio');
            totalErrores++;
            continue;
        }

        try {
            const response = await fetch('/agregar-piso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom_piso: nombrePiso })
            });

            const resultado = await response.json();

            if (response.ok && resultado.success) {
                totalGuardados++;
                // Limpiar tarjeta si se guardó correctamente (excepto primera)
                if (index > 0) {
                    card.remove();
                } else {
                    card.querySelector('input[name="nom_piso"]').value = '';
                }
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', resultado.message || 'Error al guardar piso');
                totalErrores++;
            }
        } catch (error) {
            console.error('Error:', error);
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error de conexión');
            totalErrores++;
        }
    }

    // Mostrar resumen
    if (totalGuardados > 0) {
        createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', `${totalGuardados} piso(s) guardado(s) correctamente`);
    }

    // Restaurar botón
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
});
// ------------------------------------- PISO -------------------------------------

// ------------------------------------- SALONES -------------------------------------

async function cargarPisos() {
    try {
        const response = await fetch('/api/pisos');
        const pisos = await response.json();
        
        // Actualizar todos los selects de carrera
        document.querySelectorAll('select[name="piso_salon"]').forEach(select => {
            // Guardar la selección actual si existe
            const valorActual = select.value;
            
            // Limpiar y agregar nuevas opciones
            select.innerHTML = '<option value="" disabled selected>Seleccionar el piso correspondiente</option>';
            
            pisos.forEach(pisos => {
                const option = document.createElement('option');
                option.value = pisos.piso_salon;
                option.textContent = pisos.nom_piso;
                select.appendChild(option);
            });
            
            // Restaurar la selección anterior si existe
            if (valorActual) {
                select.value = valorActual;
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error al cargar pisos:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No se pudieron cargar los pisos');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPisos();
});

document.getElementById('guardar-salones').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const cards = document.querySelectorAll('.salon-card');
    let totalGuardados = 0;
    let totalErrores = 0;

    // Mostrar loading
    const btnGuardar = document.getElementById('guardar-salones');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    // Procesar cada salón individualmente
    for (const [index, card] of Array.from(cards).entries()) {
        const nombreSalon = card.querySelector('input[name="nom_salon"]').value.trim();
        const pisoSalon = card.querySelector('select[name="piso_salon"]').value;

        // Validación básica
        if (!nombreSalon || !pisoSalon) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Complete todos los campos obligatorios');
            totalErrores++;
            continue;
        }

        try {
            const response = await fetch('/agregar-salon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nom_salon: nombreSalon, 
                    piso_salon: pisoSalon 
                })
            });

            const resultado = await response.json();

            if (response.ok && resultado.success) {
                totalGuardados++;
                // Limpiar tarjeta si se guardó correctamente (excepto primera)
                if (index > 0) {
                    card.remove();
                } else {
                    card.querySelector('input[name="nom_salon"]').value = '';
                    card.querySelector('select[name="piso_salon"]').selectedIndex = 0;
                }
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', resultado.message || 'Error al guardar salón');
                totalErrores++;
            }
        } catch (error) {
            console.error('Error:', error);
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'Error de conexión');
            totalErrores++;
        }
    }

    // Mostrar resumen
    if (totalGuardados > 0) {
        createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', `${totalGuardados} salón(es) guardado(s) correctamente`);
    }   
    // Restaurar botón
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
});
// ------------------------------------- SALONES -------------------------------------


function procesarCSV(event, tipo) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = async function(e) {
        const texto = e.target.result;
        const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);

        // Ignorar la primera línea (encabezado)
        lineas.shift();

        const datos = [];

        for (const linea of lineas) {
            const campos = linea.split(',');

            if (tipo === 'profesores') {
                const [nombre, appat, apmat, correo] = campos;
                datos.push({ nom_persona: nombre, appat_persona: appat, apmat_persona: apmat, correo });
            }
            else if (tipo === 'materias') {
                const [nombre, id_tipomateria] = campos;
                datos.push({ nom_materia: nombre, id_tipomateria });
            }
            else if (tipo === 'carreras') {
                const [nombre, clave] = campos;
                datos.push({ nom_carrera: nombre, clave_carrera: clave });
            }
            else if (tipo === 'grupos') {
                const [nombre, id_carrera, sem_grupo, id_turno] = campos;
                datos.push({ nom_grupo: nombre, id_carrera, sem_grupo, id_turno });
            }

            else if (tipo === 'salones') {
                const [nombre, id_piso] = campos;
                datos.push({ nom_salon: nombre, id_piso });
            }
        }

        try {
            const res = await fetch(`/csv/${tipo}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const resultado = await res.json();
            if (resultado.success) {
                createToast('Correcto', 'fa-solid fa-circle-check', 'Éxito', `Datos de ${tipo} agregados exitosamente.`);
            } else {
                createToast('error', 'fa-solid fa-circle-exclamation', 'Error', `Error al insertar ${tipo}`);
            }
        } catch (err) {
            createToast('error', 'fa-solid fa-circle-exclamation', 'Error', `Error en la solicitud: ${err.message}`);
        }

    };

    lector.readAsText(archivo);
}

