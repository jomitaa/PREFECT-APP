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
  const inputContrasena = document.querySelector('#contrasenaEditar');
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
    } catch (err) {
      console.error('Error al cargar escuelas:', err);
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
          <p>Escuela: ${usuario.nom_escuela || 'No asignada'}</p>
        `;

        divUser.appendChild(divImgBx);
        divUser.appendChild(divDetails);

        const divNavigation = document.createElement('div');
        divNavigation.className = 'navigation';
        divNavigation.innerHTML = `
          <span onclick="abrirModal('${usuario.ID_usuario}', '${usuario.nom_usuario}', '${usuario.correo || ''}', '${usuario.id_escuela || ''}')">
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
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  }

  window.abrirModal = (id, nombre, correo = '', escuela = '') => {
    usuarioSeleccionadoId = id;
    inputNombre.value = nombre;
    inputCorreo.value = correo;
    inputContrasena.value = '';

    cargarEscuelas().then(() => {
      selectEscuela.value = escuela;
      modal.classList.add('modal--show');
    });
  };

  window.abrirModalBorrar = (id) => {
    usuarioSeleccionadoId = id;
    modal2.classList.add('modal--show2');
  };

  modalClose.addEventListener('click', () => {
    modal2.classList.remove('modal--show2');
  });

  modalClose2.addEventListener('click', () => {
    modal.classList.remove('modal--show');
  });

  btnEditar.addEventListener('click', async () => {
    const nuevoNombre = inputNombre.value.trim();
    const nuevoCorreo = inputCorreo.value.trim();
    const nuevaEscuela = selectEscuela.value;
    const nuevaContrasena = inputContrasena.value.trim();

    const datos = {};
    if (nuevoNombre) datos.nom_usuario = nuevoNombre;
    if (nuevoCorreo) datos.correo = nuevoCorreo;
    if (nuevaEscuela) datos.id_escuela = nuevaEscuela;
    if (nuevaContrasena) datos.contrasena = nuevaContrasena;

    if (Object.keys(datos).length === 0) {
      alertaError.textContent = 'Debes modificar al menos un campo.';
      alertaError.classList.add('show');
      setTimeout(() => alertaError.classList.remove('show'), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/usuarios/${usuarioSeleccionadoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const data = await res.json();

      if (res.ok) {
        const alertaGlobal = document.getElementById('alertaGlobal');
        const mensajeToast = document.getElementById('mensajeToast');

        mensajeToast.textContent = data.message || 'Usuario editado exitosamente';
        alertaGlobal.style.display = 'grid';

        setTimeout(() => {
          alertaGlobal.style.display = 'none';
        }, 4000);

      } else {
        alertaError.textContent = data.error || 'Error inesperado.';
        alertaError.classList.add('show');
        setTimeout(() => alertaError.classList.remove('show'), 3000);
      }
    } catch (err) {
      alertaError.textContent = 'Error de conexión.';
      alertaError.classList.add('show');
    }
  });



  btnBorrar.addEventListener('click', async () => {
    const alertaGlobal = document.getElementById('alertaGlobal');
    const mensajeToast = document.getElementById('mensajeToast');

    try {
      const res = await fetch(`/api/usuarios/${usuarioSeleccionadoId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        mensajeToast.textContent = 'Usuario eliminado correctamente.';
        alertaGlobal.style.display = 'grid';

        modal2.classList.remove('modal--show2');
        cargarUsuarios();

        setTimeout(() => {
          alertaGlobal.style.display = 'none';
        }, 4000);
      } else {
        alertaError.textContent = 'No se pudo eliminar el usuario.';
        alertaError.classList.add('show');
        setTimeout(() => alertaError.classList.remove('show'), 3000);
      }
    } catch (err) {
      alertaError.textContent = 'Error de conexión al borrar.';
      alertaError.classList.add('show');
      setTimeout(() => alertaError.classList.remove('show'), 3000);
    }
  });


  window.cerrarSesion = async () => {
    try {
      const res = await fetch('/logout', { method: 'POST' });
      if (res.ok) window.location.href = '/pages/login.html';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  await cargarEscuelas();
  cargarUsuarios();
});

document.getElementById('toggleSidebar').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  const body = document.body;

  sidebar.classList.toggle('collapsed');
  body.classList.toggle('menu-colapsado');
});