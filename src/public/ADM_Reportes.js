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
function llenarSelect(id, datos) {
    const select = document.getElementById(id);
    if (!select) {
        console.error(`No se encontró el select con ID: ${id}`);
        return;
    }

    // Aquí cambiamos el texto que aparece en la opción por defecto
    let label = '';
    switch (id) {
        case 'tipo_reporte':
            label = 'Seleccione un TIPO DE REPORTE';
            break;
        case 'nom_usuario':
            label = 'Seleccione un USUARIO';
            break;
        default:
            label = 'Seleccione una opción';
            break;
    }

    // Agregamos la opción por defecto con el texto correcto
    select.innerHTML = `<option value="">${label}</option>`;

    // Llenamos el select con las opciones recibidas
    datos.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
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

 const filtros = [
     "nom_usuario",
     "tipo_reporte"
   ];
 
   filtros.forEach((id) => {
     const select = document.getElementById(id);
     select.addEventListener("change", () => {
       if (select.value !== "") {
         select.classList.add("filtro-activo");
       } else {
         select.classList.remove("filtro-activo");
       }
     });
   });
 
 async function filtrarHorarios() {
     const nom_usuario = document.getElementById("nom_usuario").value;
     const tipo_reporte = document.getElementById("tipo_reporte").value;
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
                (!nom_usuario || consulta.nom_usuario === nom_usuario) &&
                (!tipo_reporte || consulta.tipo_reporte === tipo_reporte) &&
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
     // Restablece todos los filtros a su estado inicial
     document.getElementById("nom_usuario").value = "";
     document.getElementById("tipo_reporte").value = "";
     document.getElementById("fecha_reporte").value = "";

     filtros.forEach((id) => {
         const select = document.getElementById(id);
         select.classList.remove("filtro-activo");
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
