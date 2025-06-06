document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.querySelector('.todo');
  const modal = document.querySelector('.modal');
  const modal2 = document.querySelector('.modal2');
  const modalClose = document.querySelector('.modal__close');
  const modalClose2 = document.querySelector('.modal__close2');
  const btnEditar = document.querySelector('.btnEditar');
  const btnBorrar = document.querySelector('.btnBorrar');
  const inputNombre = document.querySelector('#nombreEditar');
  const inputCorreo = document.querySelector('#correoEditar');
  const selectEscuela = document.querySelector('#escuelaEditar');
  const alertaExito = document.querySelector('.alerta-exito');
  const alertaError = document.querySelector('.alerta-error');
  let usuarioSeleccionadoId = null;

  async function cargarEscuelas() {
    try {
      const res = await fetch('/api/escuelas');
      const escuelas = await res.json();

      selectEscuela.innerHTML = '<option value="">Selecciona una escuela</option>';
      escuelas.forEach(escuela => {
        const option = document.createElement('option');
        option.value = escuela.ID_escuela;
        option.textContent = escuela.nom_escuela;
        selectEscuela.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar escuelas:', error);
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch('/api/usuarios');
      const usuarios = await res.json();

      contenedor.innerHTML = '';

      usuarios.forEach(usuario => {
        const divList = document.createElement('div');
        divList.className = 'list';

        const divUser = document.createElement('div');
        divUser.className = 'user';

        const divImgBx = document.createElement('div');
        divImgBx.className = 'imgBx';
        divImgBx.innerHTML = '<i class="bx bx-user"></i>';

        const divDetails = document.createElement('div');
        divDetails.className = 'details';
        divDetails.innerHTML = `
          <h3>${usuario.nom_usuario}</h3>
          <p>Cargo: ${usuario.cargo}</p>
        `;

        divUser.appendChild(divImgBx);
        divUser.appendChild(divDetails);

        const divNavigation = document.createElement('div');
        divNavigation.className = 'navigation';
        divNavigation.innerHTML = `
          <span onclick="abrirModal('${usuario.ID_usuario}', '${usuario.nom_usuario}', '${usuario.correo}', '${usuario.id_escuela}')">
            <i class="bx bx-edit"></i>
          </span>
          <span onclick="abrirModalBorrar('${usuario.ID_usuario}')">
            <i class="bx bx-trash"></i>
          </span>
        `;

        divList.appendChild(divUser);
        divList.appendChild(divNavigation);
        contenedor.appendChild(divList);
      });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  window.abrirModal = (id, nombre, correo = '', escuela = '') => {
    usuarioSeleccionadoId = id;
    inputNombre.value = nombre;
    inputCorreo.value = correo;
    selectEscuela.value = escuela;
    modal.classList.add('modal--show');
  };

  window.abrirModalBorrar = (id) => {
    usuarioSeleccionadoId = id;
    modal2.classList.add('modal--show2');
  };

  modalClose.addEventListener('click', () => {
    modal.classList.remove('modal--show');
  });

  modalClose2.addEventListener('click', () => {
    modal2.classList.remove('modal--show2');
  });

  btnEditar.addEventListener('click', async () => {
    const nuevoNombre = inputNombre.value.trim();
    const nuevoCorreo = inputCorreo.value.trim();
    const nuevaEscuela = selectEscuela.value;

    if (!nuevoNombre || !nuevoCorreo || !nuevaEscuela) {
      alertaError.textContent = 'Todos los campos son obligatorios.';
      alertaError.classList.add('show');
      return;
    }

    try {
      const res = await fetch(`/api/editarsur/${usuarioSeleccionadoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_usuario: nuevoNombre,
          correo: nuevoCorreo,
          id_escuela: nuevaEscuela
        }),
      });

      if (res.ok) {
        alertaExito.textContent = 'Usuario editado exitosamente.';
        alertaExito.classList.add('show');
        modal.classList.remove('modal--show');
        cargarUsuarios();
      } else {
        throw new Error('Error al editar usuario');
      }
    } catch (error) {
      alertaError.textContent = 'Ocurrió un error al editar.';
      alertaError.classList.add('show');
    }
  });

  btnBorrar.addEventListener('click', async () => {
    try {
      const res = await fetch(`/api/editarsur/${usuarioSeleccionadoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alertaExito.textContent = 'Usuario eliminado.';
        alertaExito.classList.add('show');
        modal2.classList.remove('modal--show2');
        cargarUsuarios();
      } else {
        throw new Error('Error al borrar usuario');
      }
    } catch (error) {
      alertaError.textContent = 'No se pudo borrar el usuario.';
      alertaError.classList.add('show');
    }
  });

  // Función cerrar sesión desde JS
  window.cerrarSesion = async () => {
    try {
      const res = await fetch('/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/pages/login.html';
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  await cargarEscuelas();
  cargarUsuarios();
});
