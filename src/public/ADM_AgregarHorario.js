document.addEventListener('DOMContentLoaded', async () => {
    try {
        const respuesta = await fetch('/obtener-datos-horarios');
        const datos = await respuesta.json();

        // Inicializar selects de filtros
        inicializarSelectTurno();
        inicializarSelectDia(datos.dias);
        inicializarSelectGrupo();
        
        // Llenar selects de horarios (si aún los necesitas)
        llenarSelect('hora_inicio', datos.hora_inicio, 'hora_inicio', 'hora_inicio');
        llenarSelect('hora_final', datos.hora_final, 'hora_final', 'hora_final');
        
        // Llenar selects personalizados para salón, materia y persona
        llenarTodosLosSelectsPersonalizados('salon', datos.salones, 'id_salon', 'id_salon');
        llenarTodosLosSelectsPersonalizados('materia', datos.materias, 'id_materia', 'nom_materia');
        llenarTodosLosSelectsPersonalizados('persona', datos.profesores, 'id_persona', 'nombre_completo');

        // Guardar grupos originales
        todosLosGrupos = datos.grupos;

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        createToast('error', 'fa-solid fa-circle-exclamation', 'Error', 'No se pudieron cargar los datos iniciales.');
    }
});

// FUNCIONES PARA LOS FILTROS PERSONALIZADOS

function inicializarSelectTurno() {
    const contenedorSelect = document.getElementById('selectTurno');
    if (!contenedorSelect) return;

    const botonSelect = contenedorSelect.querySelector('.boton-select');
    const inputBusqueda = contenedorSelect.querySelector('input');
    const listaOpciones = contenedorSelect.querySelector('.opciones');
    const contenidoSelect = contenedorSelect.querySelector('.contenido-select');

    // Configurar opciones estáticas
    listaOpciones.innerHTML = `
        <li data-value="2">Vespertino</li>
        <li data-value="1">Matutino</li>
    `;

    function seleccionarOpcion(opcionSeleccionada) {
        inputBusqueda.value = "";
        
        // Animación de cierre
        contenidoSelect.style.opacity = '0';
        contenidoSelect.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            contenedorSelect.classList.remove("activo");
            contenidoSelect.style.opacity = '';
            contenidoSelect.style.transform = '';
        }, 300);
        
        botonSelect.firstElementChild.innerText = opcionSeleccionada.textContent;
        
        // Actualizar input oculto
        const inputOculto = document.querySelector(`input[name="turno"]`);
        if (!inputOculto) {
            const nuevoInput = document.createElement('input');
            nuevoInput.type = 'hidden';
            nuevoInput.name = "turno";
            nuevoInput.value = opcionSeleccionada.getAttribute('data-value');
            contenedorSelect.parentElement.appendChild(nuevoInput);
        } else {
            inputOculto.value = opcionSeleccionada.getAttribute('data-value');
        }

        // Habilitar y actualizar select de grupo
        const grupoSelect = document.getElementById('selectGrupo');
        if (grupoSelect) {
            grupoSelect.querySelector('.buscador input').disabled = false;
            grupoSelect.querySelector('.boton-select').firstElementChild.innerText = "Seleccione un grupo";
            filtrarGruposPorTurno(opcionSeleccionada.getAttribute('data-value'));
            actualizarHorasSegunTurno(opcionSeleccionada.getAttribute('data-value'));
        }
    }

    // Evento de búsqueda
    inputBusqueda.addEventListener("keyup", () => {
        let busqueda = inputBusqueda.value.toLowerCase();
        let opciones = listaOpciones.querySelectorAll('li');
        
        opciones.forEach(opcion => {
            opcion.style.display = opcion.textContent.toLowerCase().includes(busqueda) ? 'flex' : 'none';
        });
    });

    // Evento click en opciones
    listaOpciones.querySelectorAll('li').forEach(opcion => {
        opcion.addEventListener('click', () => seleccionarOpcion(opcion));
    });

    // Evento para abrir/cerrar
    botonSelect.addEventListener("click", () => {
        contenedorSelect.classList.toggle("activo");
        void contenedorSelect.offsetWidth;
    });
}

function inicializarSelectDia(dias) {
    const contenedorSelect = document.querySelector('.contenedor-select[data-name="dia"]');
    if (!contenedorSelect) return;

    const botonSelect = contenedorSelect.querySelector('.boton-select');
    const inputBusqueda = contenedorSelect.querySelector('input');
    const listaOpciones = contenedorSelect.querySelector('.opciones');
    const contenidoSelect = contenedorSelect.querySelector('.contenido-select');

    // Limpiar y llenar opciones de días
    listaOpciones.innerHTML = '';
    dias.forEach(dia => {
        const opcion = document.createElement('li');
        opcion.setAttribute('data-value', dia.dia);
        opcion.textContent = dia.dia;
        listaOpciones.appendChild(opcion);
    });

    function seleccionarOpcion(opcionSeleccionada) {
        inputBusqueda.value = "";
        
        // Animación de cierre
        contenidoSelect.style.opacity = '0';
        contenidoSelect.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            contenedorSelect.classList.remove("activo");
            contenidoSelect.style.opacity = '';
            contenidoSelect.style.transform = '';
        }, 300);
        
        botonSelect.firstElementChild.innerText = opcionSeleccionada.textContent;
        
        // Actualizar input oculto
        const inputOculto = document.querySelector(`input[name="dia"]`);
        if (!inputOculto) {
            const nuevoInput = document.createElement('input');
            nuevoInput.type = 'hidden';
            nuevoInput.name = "dia";
            nuevoInput.value = opcionSeleccionada.getAttribute('data-value');
            contenedorSelect.parentElement.appendChild(nuevoInput);
        } else {
            inputOculto.value = opcionSeleccionada.getAttribute('data-value');
        }
    }

    // Evento de búsqueda
    inputBusqueda.addEventListener("keyup", () => {
        let busqueda = inputBusqueda.value.toLowerCase();
        let opciones = listaOpciones.querySelectorAll('li');
        
        opciones.forEach(opcion => {
            opcion.style.display = opcion.textContent.toLowerCase().includes(busqueda) ? 'flex' : 'none';
        });
    });

    // Evento click en opciones
    listaOpciones.querySelectorAll('li').forEach(opcion => {
        opcion.addEventListener('click', () => seleccionarOpcion(opcion));
    });

    // Evento para abrir/cerrar
    botonSelect.addEventListener("click", () => {
        contenedorSelect.classList.toggle("activo");
        void contenedorSelect.offsetWidth;
    });
}

function inicializarSelectGrupo() {
    const grupoSelect = document.getElementById('selectGrupo');
    if (!grupoSelect) return;

    const botonSelect = grupoSelect.querySelector('.boton-select');
    const inputBusqueda = grupoSelect.querySelector('input');
    const listaOpciones = grupoSelect.querySelector('.opciones');
    const contenidoSelect = grupoSelect.querySelector('.contenido-select');

    // Deshabilitar inicialmente
    inputBusqueda.disabled = true;
}

// FUNCIÓN PARA FILTRAR GRUPOS POR TURNO (ACTUALIZADA)
function filtrarGruposPorTurno(turnoId) {
    const grupoSelect = document.getElementById('selectGrupo');
    if (!grupoSelect) return;

    const botonSelect = grupoSelect.querySelector('.boton-select');
    const inputBusqueda = grupoSelect.querySelector('input');
    const listaOpciones = grupoSelect.querySelector('.opciones');
    const contenidoSelect = grupoSelect.querySelector('.contenido-select');

    // Limpiar opciones anteriores
    listaOpciones.innerHTML = '';
    
    // Filtrar grupos por turno
    const gruposFiltrados = todosLosGrupos.filter(grupo => grupo.id_turno == turnoId);
    
    if(gruposFiltrados.length === 0) {
        listaOpciones.innerHTML = '<p>No hay grupos para este turno</p>';
        return;
    }
    
    // Agregar nuevas opciones
    gruposFiltrados.forEach(grupo => {
        const opcion = document.createElement('li');
        opcion.setAttribute('data-value', grupo.id_grupo);
        opcion.textContent = grupo.nom_grupo;
        listaOpciones.appendChild(opcion);
    });

    // Función para manejar la selección de una opción
    function seleccionarOpcion(opcionSeleccionada) {
        inputBusqueda.value = "";
        
        // Actualizar texto del botón
        botonSelect.firstElementChild.innerText = opcionSeleccionada.textContent;
        
        // Crear o actualizar input oculto
        let inputOculto = document.querySelector('input[name="grupo"]');
        if (!inputOculto) {
            inputOculto = document.createElement('input');
            inputOculto.type = 'hidden';
            inputOculto.name = "grupo";
            grupoSelect.parentElement.appendChild(inputOculto);
        }
        inputOculto.value = opcionSeleccionada.getAttribute('data-value');
        
        // Cerrar el dropdown con animación
        contenidoSelect.style.opacity = '0';
        contenidoSelect.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            grupoSelect.classList.remove("activo");
            contenidoSelect.style.opacity = '';
            contenidoSelect.style.transform = '';
        }, 300);
    }

    // Configurar evento de clic para las opciones
    listaOpciones.querySelectorAll('li').forEach(opcion => {
        opcion.addEventListener('click', function() {
            seleccionarOpcion(this);
        });
    });

    // Configurar evento de búsqueda
    inputBusqueda.addEventListener("keyup", () => {
        let busqueda = inputBusqueda.value.toLowerCase();
        let opciones = listaOpciones.querySelectorAll('li');
        
        opciones.forEach(opcion => {
            opcion.style.display = opcion.textContent.toLowerCase().includes(busqueda) ? 'flex' : 'none';
        });
    });

    // Evento para abrir/cerrar el dropdown
    botonSelect.addEventListener("click", () => {
        grupoSelect.classList.toggle("activo");
        void grupoSelect.offsetWidth; // Forzar reflow para la animación
    });
}

// FUNCIONES PARA LOS SELECTS PERSONALIZADOS EN HORARIOS
function llenarTodosLosSelectsPersonalizados(name, datos, idColumna, nombreColumna) {
    const contenedores = document.querySelectorAll(`.contenedor-select[data-name="${name}"]`);
    
    contenedores.forEach(contenedorSelect => {
        const botonSelect = contenedorSelect.querySelector('.boton-select');
        const inputBusqueda = contenedorSelect.querySelector('input');
        const listaOpciones = contenedorSelect.querySelector('.opciones');
        const contenidoSelect = contenedorSelect.querySelector('.contenido-select');

        let opcionesData = datos;

        function mostrarOpciones(opcionSeleccionada = null) {
            listaOpciones.innerHTML = "";
            
            opcionesData.forEach(opcion => {
                let estaSeleccionado = opcionSeleccionada && opcion[idColumna] == opcionSeleccionada[idColumna] ? "seleccionado" : "";
                let item = `<li data-value="${opcion[idColumna]}" class="${estaSeleccionado}">${opcion[nombreColumna]}</li>`;
                listaOpciones.insertAdjacentHTML("beforeend", item);
            });

            listaOpciones.querySelectorAll('li').forEach(opcion => {
                opcion.addEventListener('click', function() {
                    seleccionarOpcion(this);
                });
            });
        }

        function seleccionarOpcion(opcionSeleccionada) {
            inputBusqueda.value = "";
            
            const opcionData = opcionesData.find(
                p => p[idColumna] == opcionSeleccionada.getAttribute('data-value')
            );
            
            mostrarOpciones(opcionData);
            
            // Animación de cierre
            contenidoSelect.style.opacity = '0';
            contenidoSelect.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                contenedorSelect.classList.remove("activo");
                contenidoSelect.style.opacity = '';
                contenidoSelect.style.transform = '';
            }, 300);
            
            botonSelect.firstElementChild.innerText = opcionSeleccionada.textContent;
            
            // Crear o actualizar input oculto
            const card = contenedorSelect.closest('.horario-card');
            let inputOculto = card.querySelector(`input[name="${name}"]`);
            
            if (!inputOculto) {
                inputOculto = document.createElement('input');
                inputOculto.type = 'hidden';
                inputOculto.name = name;
                card.querySelector('.horario-content').appendChild(inputOculto);
            }
            
            inputOculto.value = opcionSeleccionada.getAttribute('data-value');
        }

        inputBusqueda.addEventListener("keyup", () => {
            let busqueda = inputBusqueda.value.toLowerCase();
            
            // Mostrar todas las opciones primero
            listaOpciones.querySelectorAll('li').forEach(li => {
                li.style.display = 'flex';
            });
            
            // Si hay búsqueda, filtrar
            if (busqueda.trim() !== '') {
                listaOpciones.querySelectorAll('li').forEach(li => {
                    const textoOpcion = li.textContent.toLowerCase();
                    li.style.display = textoOpcion.includes(busqueda) ? 'flex' : 'none';
                });

            }
           
        });

        botonSelect.addEventListener("click", () => {
            contenedorSelect.classList.toggle("activo");
            void contenedorSelect.offsetWidth;
        });

        mostrarOpciones();
    });
}

// FUNCIONES AUXILIARES
function llenarSelect(idSelect, datos, idColumna, nombreColumna) {
    const selects = document.querySelectorAll(`select[name="${idSelect}"]`);
    
    if (selects.length === 0) return;

    selects.forEach(select => {
        select.innerHTML = `<option disabled selected>${formatearTexto(nombreColumna)}</option>`;

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

function obtenerHorasPorTurno(turnoId) {
    return {
        vespertino: { inicio: 13, fin: 21 },
        matutino: { inicio: 7, fin: 15 }
    }[turnoId === "2" ? "vespertino" : "matutino"];
}

function actualizarHorasSegunTurno(turnoId) {
    const { inicio, fin } = obtenerHorasPorTurno(turnoId);
    const cards = document.querySelectorAll('.horario-card');

    cards.forEach((card, index) => {
        const horaInicioSpan = card.querySelector('span[name="hora_inicio"]');
        const horaFinalSpan = card.querySelector('span[name="hora_final"]');
        const horaActual = inicio + index;
        
        if (horaActual >= fin) {
            card.style.display = 'none';
            return;
        }
        
        card.style.display = '';
        horaInicioSpan.textContent = `${horaActual}:00:00`;
        horaFinalSpan.textContent = `${horaActual + 1}:00:00`;
    });
}

// NOTIFICACIONES
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

// ENVÍO DEL FORMULARIO
document.getElementById('btnEnviar').addEventListener('click', async (e) => {
    e.preventDefault();

    const diaInput = document.querySelector('input[name="dia"]');
    const grupoInput = document.querySelector('input[name="grupo"]');
    const turnoInput = document.querySelector('input[name="turno"]');

    if (!diaInput?.value || !grupoInput?.value || !turnoInput?.value) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Advertencia', 'Completa todos los filtros antes de continuar.');
        return;
    }

    const datosHorario = {
        dia_horario: diaInput.value,
        id_grupo: grupoInput.value,
        id_turno: turnoInput.value,
        hora_inicio: [],
        hora_final: [],
        id_salon: [],
        id_materia: [],
        id_persona: []
    };

    let cardsValidas = 0;
    const cards = document.querySelectorAll('.horario-card');

    cards.forEach(card => {
        if (card.style.display === 'none') return;
        
        const salon = card.querySelector('input[name="salon"]')?.value;
        const materia = card.querySelector('input[name="materia"]')?.value;
        const profesor = card.querySelector('input[name="persona"]')?.value;
        const horaInicio = card.querySelector('span[name="hora_inicio"]').textContent.trim();
        const horaFinal = card.querySelector('span[name="hora_final"]').textContent.trim();

        const esValido = salon && materia && profesor;

        if (esValido) {
            datosHorario.hora_inicio.push(horaInicio);
            datosHorario.hora_final.push(horaFinal);
            datosHorario.id_salon.push(parseInt(salon));
            datosHorario.id_materia.push(parseInt(materia));
            datosHorario.id_persona.push(parseInt(profesor));
            cardsValidas++;
        }
    });

    if (cardsValidas === 0) {
        createToast('advertencia', 'fa-solid fa-triangle-exclamation', 'Advertencia', 'Completa al menos un bloque de horario con valores válidos.');
        return;
    }

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

// VARIABLE GLOBAL
let todosLosGrupos = [];
document.getElementById("btnCargarHorariosNombresCSV").addEventListener("click", async () => {
  const input = document.getElementById("csvHorariosNombres");
  const file = input.files[0];

  if (!file) {
    return createToast(
      "error",
      "fa-solid fa-circle-exclamation",
      "Error",
      "Selecciona un archivo CSV."
    );
  }

  const text = await file.text();

  const res = await fetch("/csv/horarios-nombres", {
    method: "POST",
    headers: {
      "Content-Type": "text/csv",
    },
    body: text,
  });

  const result = await res.json();

  if (result.success) {
    createToast(
      "success",
      "fa-solid fa-circle-check",
      "Éxito",
      result.message
    );
    setTimeout(() => location.reload(), 1500);
  } else {
    createToast(
      "error",
      "fa-solid fa-circle-exclamation",
      "Error",
      result.message
    );
  }
});

