document.addEventListener("DOMContentLoaded", () => {
  // 🔷 Referencias del DOM
  const contenedor = document.getElementById("contenedor-escuelas");
  const modalBorrar = document.getElementById("modal-borrar");
  const modalEditar = document.getElementById("modal-editar");
  const btnConfirmarBorrar = document.getElementById("btnConfirmarBorrar");
  const formEditarEscuela = document.getElementById("formEditarEscuela");
  const alertaError = document.querySelector(".alerta-error");
  const alertaExito = document.querySelector(".alerta-exito");

  let currentIdEscuela = null;

  // 🔹 Cargar y mostrar escuelas
  async function cargarEscuelas() {
    try {
      const res = await fetch('/api/escuelas');
      const escuelas = await res.json();
      contenedor.innerHTML = '';

      escuelas.forEach(escuela => {
        console.log('Escuela:', escuela);
        const div = document.createElement('div');
        div.classList.add('list');
        div.innerHTML = `
          <div class="user">
            <div class="imgBx"><span><i class="bx bxs-school"></i></span></div>
            <div class="details">
              <h3>${escuela.nom_escuela}</h3>
              <p>CCT: ${escuela.CCT || 'Sin CCT'}</p>
              <p>Tel: ${escuela.telefono_escuela || 'No disponible'}</p>
            </div>
          </div>
          <div class="navigation">
            <span class="edit-escuela" data-id="${escuela.ID_escuela}"><i class="fa-solid fa-pen-to-square"></i></span>
            <span class="delete-escuela" data-id="${escuela.ID_escuela}"><i class="fa-solid fa-trash"></i></span>
          </div>
        `;
        contenedor.appendChild(div);
      });

      agregarEventos();
    } catch (error) {
      console.error('Error cargando escuelas:', error);
      contenedor.innerHTML = '<p>Error al cargar escuelas</p>';
    }
  }

  // 🔹 Agregar eventos a los botones
  function agregarEventos() {
    document.querySelectorAll('.edit-escuela').forEach(button => {
      button.addEventListener('click', () => {
        currentIdEscuela = button.getAttribute('data-id');
        abrirModalEditar(currentIdEscuela);
      });
    });

    document.querySelectorAll('.delete-escuela').forEach(button => {
      button.addEventListener('click', () => {
        currentIdEscuela = button.getAttribute('data-id');
        modalBorrar.classList.add('modal--show');
      });
    });

    document.querySelectorAll('.modal__close').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        modalBorrar.classList.remove('modal--show');
      });
    });

    document.querySelectorAll('.modal__close2').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        modalEditar.classList.remove('modal--show2');
      });
    });
  }

  // 🔹 Abrir modal de edición con datos cargados
  async function abrirModalEditar(id) {
    try {
      const res = await fetch(`/api/escuelas/${id}`);
      const escuela = await res.json();

      formEditarEscuela.nom_escuela.value = escuela.nom_escuela;
      formEditarEscuela.CCT.value = escuela.CCT;
      formEditarEscuela.telefono_escuela.value = escuela.telefono_escuela;

      modalEditar.classList.add('modal--show2');
    } catch (error) {
      console.error('Error cargando escuela para editar:', error);
    }
  }

  // 🔹 Enviar formulario de edición
  formEditarEscuela.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom_escuela = formEditarEscuela.nom_escuela.value.trim();
    const CCT = formEditarEscuela.CCT.value.trim();
    const telefono_escuela = formEditarEscuela.telefono_escuela.value.trim();

    try {
      const res = await fetch(`/api/escuelas/${currentIdEscuela}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_escuela, CCT, telefono_escuela })
      });

      if (res.ok) {
        alertaExito.textContent = "Escuela actualizada exitosamente.";
        alertaExito.classList.add('show');
        alertaError.classList.remove('show');
        modalEditar.classList.remove('modal--show2');
        await cargarEscuelas();

        setTimeout(() => {
          alertaExito.classList.remove('show');
        }, 3000);
      } else {
        alertaError.textContent = "Error actualizando escuela.";
        alertaError.classList.add('show');
        alertaExito.classList.remove('show');

        setTimeout(() => {
          alertaError.classList.remove('show');
        }, 3000);
      }

    } catch (error) {
      console.error('Error enviando actualización:', error);
      alertaError.textContent = "Error en la conexión.";
      alertaError.classList.add('show');
      alertaExito.classList.remove('show');

      setTimeout(() => {
        alertaError.classList.remove('show');
      }, 3000);
    }
  });

  // 🔹 Borrar escuela
  async function borrarEscuela(id) {
    try {
      const res = await fetch(`/api/escuelas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        modalBorrar.classList.remove('modal--show');
        await cargarEscuelas();
      } else {
        console.error('Error eliminando escuela');
      }
    } catch (error) {
      console.error('Error enviando eliminación:', error);
    }
  }

  // 🔹 Confirmación de eliminación
  btnConfirmarBorrar.addEventListener('click', async () => {
    if (currentIdEscuela) {
      await borrarEscuela(currentIdEscuela);
    }
  });

  // 🔹 Cargar escuelas al iniciar
  cargarEscuelas();
});
