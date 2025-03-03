document.addEventListener('DOMContentLoaded', function () {
    cargarReportes(); // Cargar los reportes al cargar la página

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
});

// Función para cargar los reportes desde el servidor
function cargarReportes() {
    fetch('/obtenerReportes')
        .then(response => response.json())
        .then(data => {
            const listaReportes = document.getElementById('lista-reportes');
            listaReportes.innerhtml = ''; // Limpiar lista

            data.forEach(reporte => {
                const li = document.createElement('li');
                li.innerhtml = `<h3>Reporte ${reporte.id_reporte}</h3><p>${reporte.tipo_reporte}</p>`;
                li.addEventListener('click', () => abrirModal(reporte));
                listaReportes.appendChild(li);
            });
        })
        .catch(error => console.error('Error al cargar reportes:', error));
}

// Función para abrir el modal con animación
function abrirModal(reporte) {
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
