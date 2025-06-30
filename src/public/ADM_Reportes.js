let alerta = document.querySelector(".alerta");

function createToast(type, icon, title, text) {
    let newToast = document.createElement("div");
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

let tipoSeleccionado = '';
let nomUsuarioSeleccionado = '';

const contenedortipoReporte = document.querySelector(".contenedor-select[data-type='tipo_reporte']");
const contenedorUsuario = document.querySelector(".contenedor-select[data-type='nom_usuario']");

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const response = await fetch('/api/filtrar-reportes');
        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                `No se encontraron datos para llenar los filtros.`
              );
            console.error("Los datos están vacíos o no tienen la estructura esperada.");
            return;
        }

        llenarSelect('tipo_reporte', data.tipo_reporte);
        llenarSelect('nom_usuario', data.nom_usuario);
      
                        inicializarEventosFiltros();


    } catch (error) {
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            `Hubo un problema al cargar los filtros.`
          );
        console.error('Error al cargar los filtros:', error);
    }
});




// ✅ Función para llenar selects
 function llenarSelect(tipo, datos) {
            const contenedor = document.querySelector(`.contenedor-select[data-type="${tipo}"]`);
            if (!contenedor) {
                console.error(`No se encontró el select con tipo: ${tipo}`);
                return;
            }
        
            const opciones = contenedor.querySelector('.opciones');
            opciones.innerHTML = '';

              if (tipo !== 'turno') {
        const limpiarLi = document.createElement('li');
        limpiarLi.className = 'limpiar-seleccion';
        limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
        limpiarLi.onclick = function() {
            limpiarFiltro(tipo, contenedor);
        };
        opciones.appendChild(limpiarLi);
    }
        
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
                case 'tipo_reporte': tipoSeleccionado = opcion.dataset.value; break;
                case 'nom_usuario': nomUsuarioSeleccionado = opcion.dataset.value; break;
               
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
        }

         function limpiarFiltro(tipo, contenedor) {
    const defaultText = `Seleccione ${tipo === 'tipo_reporte' ? 'Tipo de Reporte' : 
                      tipo === 'nom_usuario' ? 'Nombre de Usuario' : ''
                    
                      }`;
    
    // Actualizar UI
    contenedor.querySelector('.boton-select span').textContent = defaultText;
    
    // Limpiar variable
    switch(tipo) {
        case 'tipo_reporte': tipoSeleccionado = ''; break;
        case 'nom_usuario': nomUsuarioSeleccionado = ''; break;
       
    }

    // Limpiar selección visual
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    contenedor.classList.remove('filtro-activo');
    
    // Cerrar el select
    cerrarSelect(contenedor);
    
    // Opcional: volver a filtrar automáticamente
    if (turnoSeleccionado) {
        filtrarHorarios();
    }
}
        // Función para inicializar eventos de los filtros
        function inicializarEventosFiltros() {
            const contenedores = [
                contenedorUsuario, contenedortipoReporte
            ];
        
            contenedores.forEach(contenedor => {
                if (!contenedor) return;
        
                const botonSelect = contenedor.querySelector('.boton-select');
                const inputBusqueda = contenedor.querySelector('.buscador input');
                const opciones = contenedor.querySelector('.opciones');
                const tipo = contenedor.dataset.type;
        
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
                        const items = opciones.querySelectorAll('li');
                        
                        items.forEach(item => {
                            const texto = item.textContent.toLowerCase();
                            item.style.display = texto.includes(busqueda) ? 'flex' : 'none';
                        });
                    });
                }
        
                // Limpiar selección (doble clic)
               
            });
        
            // Cerrar selects al hacer clic fuera
            document.addEventListener('click', (e) => {
    contenedores.forEach(contenedor => {
        if (contenedor && !contenedor.contains(e.target)) {
            cerrarSelect(contenedor);
        }
    });
});
            
            // Evento para filtrar
        }
        
        // Función para cerrar select
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



    // Obtener referencias del modal y botón de cerrar
    const modal = document.getElementById('modal-reporte');
    const modalContent = document.querySelector('.modal-content');
    const closeModal = document.querySelector('.close');

    // Evento para cerrar el modal al hacer clic en la "X"
    closeModal.addEventListener('click', cerrarModal);

    // Evento para cerrar el modal al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            cerrarModal();
        }
    });



// Función para cargar los reportes desde el servidor
/*
function cargarReportes() {
    fetch('/obtenerReportes')
        .then(response => response.json())
        .then(data => {
            const listaReportes = document.getElementById('lista-reportes');
            listaReportes.innerHTML = ''; // Limpiar lista

            data.forEach(reporte => {
                const li = document.createElement('li');
                li.innerHTML = `<h3>Reporte ${reporte.id_reporte}</h3><p>${reporte.tipo_reporte}</p>`;
                li.addEventListener('click', () => abrirModal(reporte));
                listaReportes.appendChild(li);
            });
        })
        .catch(error => console.error('Error al cargar reportes:', error));
}
*/

 //--------------------------------------------------------------- CODIGO CONSULTA --------------------------
 const contenedor = document.getElementById("lista-reportes");

 // Función para obtener los datos de la consulta
 async function fetchReportes() {
     try {
         const response = await fetch('/obtenerReportes');
         if (!response.ok) {
             throw new Error(`Error en la solicitud: ${response.status}`);
         }
         const consulta = await response.json();
         mostrar(consulta);
     } catch (error) {
         console.error('Error al obtener los datos de la consulta:', error);
         contenedor.innerHTML = '<tr><td colspan="10">Error al cargar los datos</td></tr>';
     }
 }

 // Función para mostrar los datos de la consulta en la tabla
 function mostrar(consulta) {
     console.log("Mostrando usuarios:", consulta);
     resultados = '';
    /*
     const li = document.createElement('li');
        li.innerHTML = `<h3>Reporte ${reporte.id_reporte}</h3><p>${reporte.tipo_reporte}</p>`;
        li.addEventListener('click', () => abrirModal(reporte));
        listaReportes.appendChild(li);
        */

       
        window.reportesData = {};

     consulta.forEach(reporte => {
        window.reportesData[reporte.id_reporte] = reporte;

        resultados += `
                
        <li data-id="${reporte.id_reporte}" class="reporte-item" onclick="abrirModal(${reporte.id_reporte})">
            <h3>Reporte ${reporte.id_reporte}</h3>
            <p>${reporte.tipo_reporte}</p>
        </li>
      `;          
        
    });
    

     // Filtrar los datos según algún criterio si es necesario
     // const consultaFiltrada = consulta.filter(item => item.algunCriterio);

     

     // Mostrar los resultados en el contenedor
     contenedor.innerHTML = resultados;


     document.getElementById("filterBtn").replaceWith(document.getElementById("filterBtn").cloneNode(true));
 document.getElementById("filterBtn").addEventListener("click", filtrarHorarios);

 
 async function filtrarHorarios() {
    
     const fecha = document.getElementById("fecha_reporte").value;

     try {
         const response = await fetch("/obtenerReportes");
         if (!response.ok) {
             throw new Error(`Error en la solicitud: ${response.status}`);
         }
         const consulta = await response.json();
         
 
         const horariosFiltrados = consulta.filter(consulta => {

             const fechaReporte = consulta.fecha_reporte; 

             const [year, month, day] = fecha.split("-"); 
             const fechaUsuario = `${day}/${month}/${year.slice(-2)}`;


             console.log("Fecha de asistencia:", fechaReporte);
             console.log("Fecha convertida:", fechaUsuario);

             return (
                (nomUsuarioSeleccionado === '' || consulta.nom_usuario === nomUsuarioSeleccionado) &&
                (tipoSeleccionado === '' || consulta.tipo_reporte === tipoSeleccionado) &&
                 (!fecha || fechaReporte === fechaUsuario) 

             );
         });
 
         if (horariosFiltrados.length === 0) {
             console.log("No se encontraron horarios que coincidan con los filtros.");
             createToast(
                 "advertencia",
                 "fa-solid fa-triangle-exclamation",
                 "Aguas",
                 "No se encontraron horarios que coincidan con los filtros seleccionados."
             );
             return; 
         }
 
         mostrar(horariosFiltrados);
     } catch (error) {
         console.error("Error al obtener los horarios:", error);
         createToast(
             "error",
             "fa-solid fa-circle-exclamation",
             "Error",
             "Hubo un problema al cargar los horarios."
         );
         document.getElementById("horario").innerHTML =
             '<tr><td colspan="6">Error al cargar los horarios</td></tr>';
     }
 }

 document.getElementById("resetFiltersButton").addEventListener("click", function() {
   anioSeleccionado = '';
    periodoSeleccionado = '';
    grupoSeleccionado = '';
    profesorSeleccionado = '';
    materiaSeleccionada = '';
    horaInicioSeleccionada = '';
    horaFinSeleccionada = '';
    diaSeleccionado = '';
    registroAsistenciaSeleccionado = '';
    
    // Limpiar UI de todos los filtros
    const tipos = ['tipo_reporte', 'nom_usuario'];
    tipos.forEach(tipo => {
        const contenedor = document.querySelector(`.contenedor-select[data-type="${tipo}"]`);
        if (contenedor) {
            const defaultText = `Seleccione ${tipo === 'tipo_reporte' ? 'Tipo de Reporte' : 
                               tipo === 'nom_usuario' ? 'Nombre de Usuario' : ''
                               
                               
                              }`;
            
            const span = contenedor.querySelector('.boton-select span');
            if (span) span.textContent = defaultText;
            
            contenedor.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            contenedor.classList.remove('filtro-activo');
        }
    });
   
     filtrarHorarios();

 });
 

 }
 
 

 fetchReportes();


 function handleReporteClick(event) {
    const li = event.target.closest('.reporte-item');
    if (!li) return;
    
    const reporteId = li.dataset.id;
    const reporte = reportesMap.get(reporteId);
    
    if (reporte) {
        mostrarModal(reporte);
    } else {
        console.error('Reporte no encontrado con ID:', reporteId);
    }
}


function abrirModal(reporteId) {
    const reporte = window.reportesData[reporteId];
    
    if (!reporte) {
        console.error("Reporte no encontrado:", reporteId);
        return;
    }


    const modal = document.getElementById('modal-reporte');
    const modalContent = document.querySelector('.modal-content');

    // Asignar valores al modal
    document.getElementById('modal-id-reporte').value = reporte.id_reporte;
    document.getElementById('modal-tipo-reporte').value = reporte.id_tiporeporte;
    document.getElementById('modal-nom-usuario').value = reporte.nom_usuario;
    document.getElementById('modal-descripcion').value = reporte.descripcion;

    // Restablecer la posición antes de mostrar el modal
    modalContent.style.top = "-100%"; // Inicialmente fuera de la pantalla
    modal.style.display = "block"; // Mostrar modal

    // Animación de bajada después de un pequeño retraso
    setTimeout(() => {
        modal.classList.add('show'); // Agregar clase para activar la animación
        modalContent.style.top = "50%"; // Baja hasta el centro de la pantalla
    }, 50);
}

// Función para cerrar el modal con animación
function cerrarModal() {
    const modal = document.getElementById('modal-reporte');
    const modalContent = document.querySelector('.modal-content');

    // Subir el modal antes de ocultarlo
    modalContent.style.top = "-100%"; 

    setTimeout(() => {
        modal.style.display = "none"; 
        modal.classList.remove('show'); 
    }, 500); // Esperar la animación antes de ocultar
}

// Manejar la actualización del reporte
document.getElementById('form-editar-reporte').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el envío del formulario

    const id_reporte = document.getElementById('modal-id-reporte').value;
    const id_tiporeporte = document.getElementById('modal-tipo-reporte').value;
    const descripcion = document.getElementById('modal-descripcion').value;

    fetch('/actualizarReporte', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_reporte, id_tiporeporte, descripcion })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        cerrarModal(); // Cerrar el modal después de la actualización
        cargarReportes(); // Recargar la lista de reportes
    })
    .catch(error => console.error('Error al actualizar el reporte:', error));
});
