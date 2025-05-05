document.addEventListener('DOMContentLoaded', function() {
    const contenedorUsuarios = document.getElementById('contenedor-usuarios');
    const modalEditar = document.getElementById('modal-editar');
    const modalBorrar = document.getElementById('modal-borrar');
    const formEditarUsuario = document.getElementById('formEditarUsuario');
    const alertaError = formEditarUsuario.querySelector('.alerta-error');
    const alertaExito = formEditarUsuario.querySelector('.alerta-exito');
  
    let usuarioActualEditar = null;
    let usuarioActualBorrar = null;
  
    cargarUsuarios();
  
    async function cargarUsuarios() {
      try {
        const res = await fetch('/api/usuarios');
        const usuarios = await res.json();
  
        contenedorUsuarios.innerHTML = '';
  
        usuarios.forEach(usuario => {
          crearTarjetaUsuario(usuario);
        });
  
        agregarEventosBotones();
  
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        contenedorUsuarios.innerHTML = '<p>Error al cargar usuarios.</p>';
      }
    }
  
    function crearTarjetaUsuario(usuario) {
      const divList = document.createElement('div');
      divList.className = 'list';
  
      // Imagen
      const divImgBx = document.createElement('div');
      divImgBx.className = 'imgBx';
      divImgBx.innerHTML = '<i class="fa-solid fa-user"></i>';
  
      // Detalles
      const divDetails = document.createElement('div');
      divDetails.className = 'details';
      divDetails.innerHTML = `
        <h3>${usuario.nom_usuario}</h3>
        <p>Cargo: ${usuario.cargo}</p>
        <p>Contraseña: (No disponible)</p>
      `;
  
      // Botones
      const divNavigation = document.createElement('div');
      divNavigation.className = 'navigation';
      divNavigation.innerHTML = `
        <span class="edit-user" data-id="${usuario.ID_usuario}">
          <i class="fas fa-pen"></i>
        </span>
        <span class="delete-user" data-id="${usuario.ID_usuario}">
          <i class="fas fa-trash"></i>
        </span>
      `;
  
      divList.appendChild(divImgBx);
      divList.appendChild(divDetails);
      divList.appendChild(divNavigation);
  
      contenedorUsuarios.appendChild(divList);
    }
  
    function agregarEventosBotones() {
      document.querySelectorAll('.edit-user').forEach(boton => {
        boton.addEventListener('click', abrirModalEditar);
      });
  
      document.querySelectorAll('.delete-user').forEach(boton => {
        boton.addEventListener('click', abrirModalBorrar);
      });
    }
  
    async function abrirModalEditar(e) {
      const id = e.target.closest('span').dataset.id;
      try {
        const res = await fetch(`/api/usuarios/${id}`);
        const usuario = await res.json();
  
        usuarioActualEditar = usuario;
  
        formEditarUsuario.nom_usuario.value = usuario.nom_usuario;
        formEditarUsuario.contrasena.value = ''; // Dejar vacío para seguridad
  
        modalEditar.classList.add('modal--show2');
      } catch (error) {
        console.error('Error al cargar usuario para editar:', error);
      }
    }
  
    async function abrirModalBorrar(e) {
      const id = e.target.closest('span').dataset.id;
      usuarioActualBorrar = id;
      modalBorrar.classList.add('modal--show');
    }
  
    formEditarUsuario.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!usuarioActualEditar) return;
  
      const datos = {
        nom_usuario: formEditarUsuario.nom_usuario.value,
        contrasena: formEditarUsuario.contrasena.value // Puede ser vacío
      };
  
      try {
        const res = await fetch(`/api/usuarios/${usuarioActualEditar.ID_usuario}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
  
        const respuesta = await res.json();
  
        if (res.ok) {
          alertaExito.textContent = respuesta.message;
          alertaExito.classList.add('show');
          alertaError.classList.remove('show');
  
          setTimeout(() => {
            modalEditar.classList.remove('modal--show2');
            cargarUsuarios();
          }, 1500);
  
        } else {
          alertaError.textContent = respuesta.message || 'Error al actualizar';
          alertaError.classList.add('show');
          alertaExito.classList.remove('show');
        }
  
      } catch (error) {
        console.error('Error actualizando usuario:', error);
        alertaError.textContent = 'Error en el servidor.';
        alertaError.classList.add('show');
      }
    });
  
    document.querySelector('.modal__close2').addEventListener('click', () => {
      modalEditar.classList.remove('modal--show2');
    });
  
    document.getElementById('btnConfirmarBorrar').addEventListener('click', async () => {
      if (!usuarioActualBorrar) return;
  
      try {
        const res = await fetch(`/api/usuarios/${usuarioActualBorrar}`, { method: 'DELETE' });
  
        if (res.ok) {
          modalBorrar.classList.remove('modal--show');
          cargarUsuarios();
        } else {
          console.error('Error borrando usuario');
        }
      } catch (error) {
        console.error('Error al borrar usuario:', error);
      }
    });
  
    document.querySelector('.modal__close').addEventListener('click', () => {
      modalBorrar.classList.remove('modal--show');
    });
  
  });
   