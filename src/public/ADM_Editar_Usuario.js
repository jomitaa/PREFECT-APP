const estadoValidacionCampos = {
    userName: false,
    userEmail: false,
    userPassword: false,
    userCargo: false,
  };
  
  document.addEventListener("DOMContentLoaded", () => {
  
    const formEdit = document.querySelector(".form-register");
    console.log("Formulario de edición:", formEdit);
  
    const inputUser = document.querySelector('.form-register input[name="userName"]');
    const inputEmail = document.querySelector('.form-register input[name="userEmail"]');
    const inputPass = document.querySelector('.form-register input[name="userPassword"]');
    const inputConfirmar_Contrasena = document.querySelector('.form-register input[name="confirmar_contrasena"]');
    const inputCargo = document.querySelector('.form-register select[name="userCargo"]');
    console.log("Campo usuario:", inputUser);
    console.log("Campo correo electrónico:", inputEmail);
    console.log("Campo contraseña:", inputPass);
    console.log("Campo confirmar contraseña:", inputConfirmar_Contrasena);
    console.log("Campo cargo:", inputCargo);
  
    const alertaErrorEdit = document.querySelector(".form-register .alerta-error");
    const alertaExitoEdit = document.querySelector(".form-register .alerta-exito");
    console.log("Alerta de error edición:", alertaErrorEdit);
    console.log("Alerta de éxito edición:", alertaExitoEdit);
  
    const userNameRegex = /^[a-zA-Z0-9\_\-]{4,16}$/;
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const passwordRegex = /^.{4,12}$/;
  
    const cargoValidos = ['prefecto', 'admin'];
  
    inputUser.addEventListener("input", () => {
      validarCampo(userNameRegex, inputUser, "El usuario tiene que ser de 4 a 16 dígitos y solo puede contener letras y guión bajo.");
    });
  
    inputEmail.addEventListener("input", () => {
      validarCampo(emailRegex, inputEmail, "El correo solo puede contener letras, números, puntos, guiones y guión bajo.");
    });
  
    inputPass.addEventListener("input", () => {
      validarCampo(passwordRegex, inputPass, "La contraseña tiene que ser de 4 a 12 dígitos");
    });
  
    inputConfirmar_Contrasena.addEventListener("input", () => {
      validarCampo(passwordRegex, inputConfirmar_Contrasena, "La contraseña tiene que ser de 4 a 12 dígitos");
    });
  
    inputCargo.addEventListener("change", () => {
      validarSelect(inputCargo, cargoValidos, "Selecciona un cargo válido.");
    });
  
    formEdit.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Estado de validación antes del envío:", estadoValidacionCampos);
    
        if (estadoValidacionCampos.userName && estadoValidacionCampos.userEmail && estadoValidacionCampos.userPassword && estadoValidacionCampos.userCargo) {
            const userName = inputUser.value;
            const userEmail = inputEmail.value;
            const userPassword = inputPass.value;
            const userCargo = inputCargo.value;
            const confirmar_contrasena = inputConfirmar_Contrasena.value;
    
            const idUsuario = formEdit.querySelector('.btnEditar').getAttribute('data-id'); 
    
            if (userPassword !== confirmar_contrasena) {
                mostrarMensajeError(alertaErrorEdit, 'Las contraseñas no coinciden');
                return;
            }
    
            try {
                const response = await fetch(`/api/editarsur/${idUsuario}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userName, userEmail, userPassword, userCargo, confirmar_contrasena })
                });
    
                const data = await response.json();
                console.log('Respuesta del servidor:', data);
    
                if (response.ok) {
                    mostrarMensajeExito(alertaExitoEdit, data.message);
                    formEdit.reset();
                    await actualizarTabla(); 
                } else {
                    mostrarMensajeError(alertaErrorEdit, data.error);
                }
            } catch (error) {
                console.error('Error al enviar los datos:', error);
                mostrarMensajeError(alertaErrorEdit, 'Error al procesar la solicitud.');
            }
        } else {
            mostrarMensajeError(alertaErrorEdit, 'Por favor, complete bien el formulario');
        }
    });
    
  
    console.log("Alerta de error después del envío:", alertaErrorEdit);
    console.log("Alerta de éxito después del envío:", alertaExitoEdit);
  
  function validarCampo(regularExpresion, campo, mensaje) {
    const esValido = regularExpresion.test(campo.value);
    const contenedor = campo.parentElement.parentElement;
    console.log(`Validación del campo ${campo.name}: ${esValido}`);
  
    if (esValido) {
      eliminarMensajeCampo(contenedor);
      estadoValidacionCampos[campo.name] = true;
      campo.parentElement.classList.remove("error");
    } else {
      estadoValidacionCampos[campo.name] = false;
      campo.parentElement.classList.add("error");
      mostrarMensajeCampo(contenedor, mensaje);
    }
  }
  
  function validarSelect(campo, valoresValidos, mensaje) {
    const esValido = valoresValidos.includes(campo.value);
    const contenedor = campo.parentElement.parentElement;
    console.log(`Validación del campo select ${campo.name}: ${esValido}`);
  
    if (esValido) {
      eliminarMensajeCampo(contenedor);
      estadoValidacionCampos[campo.name] = true;
      campo.parentElement.classList.remove("error");
    } else {
      estadoValidacionCampos[campo.name] = false;
      campo.parentElement.classList.add("error");
      mostrarMensajeCampo(contenedor, mensaje);
    }
  }
  
  function mostrarMensajeCampo(contenedor, mensaje) {
    eliminarMensajeCampo(contenedor);
    const alertaDiv = document.createElement("div");
    alertaDiv.classList.add("alerta");
    alertaDiv.textContent = mensaje;
    contenedor.appendChild(alertaDiv);
  }
  
  function eliminarMensajeCampo(contenedor) {
    const alerta = contenedor.querySelector(".alerta");
    if (alerta) alerta.remove();
  }
  
  function mostrarMensajeError(referencia, mensaje) {
    console.log('Mostrando mensaje de error:', mensaje);
    referencia.textContent = mensaje;
    referencia.classList.remove("alertaExito");
    referencia.classList.add("alertaError");
    referencia.style.display = 'block';
  
    setTimeout(() => {
      eliminarMensajeGeneral(referencia);
    }, 3000);
  }
  
  function mostrarMensajeExito(referencia, mensaje) {
    console.log('Mostrando mensaje de éxito:', mensaje);
    referencia.textContent = mensaje;
    referencia.classList.remove("alertaError");
    referencia.classList.add("alertaExito");
    referencia.style.display = 'block';
  
    setTimeout(() => {
      eliminarMensajeGeneral(referencia);
    }, 3000);
  }
  
  function eliminarMensajeGeneral(referencia) {
    referencia.textContent = '';
    referencia.classList.remove("alertaError", "alertaExito");
    referencia.style.display = 'none';
  }
  
    // ----------------------------------------------------- CODIGO EDITAR USUARIOS  --------------------------------------------------

    let currentIdUsuario = null;  // Variable global para almacenar el ID del usuario actual

    const editarUsuario = async (idUsuario, userName, userEmail, userCargo, userPassword, confirmar_contrasena) => {
        const userData = { userName, userEmail, userCargo, userPassword, confirmar_contrasena };
    
        try {
            const response = await fetch(`/api/editarsur/${idUsuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudo actualizar el usuario');
            }
    
            console.log(`Usuario con ID ${idUsuario} actualizado`);
    
            // Actualizar la tabla después de editar el usuario
            await actualizarTabla();
    
            // Resetear el ID del usuario actual después de editar
            currentIdUsuario = null;
    
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            mostrarMensajeError(alertaErrorEdit, 'Error al actualizar el usuario.');
        }
    };
    
    

    // ----------------------------------------------------- FIN CODIGO EDITAR USUARIOS -----------------------------------------


    // ----------------------------------------------------- CODIGO BORRAR USUARIOS  --------------------------------------------------

    let currentIdUsuarioBorrar = null;  // Variable global para almacenar el ID del usuario a borrar

    const borrarUsuario = async (idUsuario) => {
        try {
            const response = await fetch(`/api/editarsur/${idUsuario}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('No se pudo borrar el usuario');
            }
    
            console.log(`Usuario con ID ${idUsuario} borrado`);
    
            // Actualizar la tabla después de borrar el usuario
            await actualizarTabla();
    
            // Resetear el ID del usuario actual después de borrar
            currentIdUsuarioBorrar = null;
    
        } catch (error) {
            console.error('Error al borrar el usuario:', error);
        }
    };
    
    // Función para actualizar la tabla de usuarios
    const actualizarTabla = async () => {
        try {
            const response = await fetch('/api/editarsur');
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const data = await response.json();
            mostrarUsuarios(data);
        } catch (error) {
            console.error('Error al actualizar la tabla:', error);
            const contenedor = document.getElementById('tod');
            contenedor.innerHTML = '<p>Error al cargar los usuarios</p>';
        }
    };
    
    // ----------------------------------------------------- FIN CODIGO BORRAR USUARIOS  --------------------------------------------------



    // ----------------------------------------------------- CODIGO MOSTRAR USUARIOS  --------------------------------------------------

    const contenedor = document.getElementById('tod');

    // Función para obtener los usuarios de la API
    const fetchUsuarios = async () => {
        try {
            const response = await fetch('/api/editarsur');
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); //SERVIDOR
            mostrarUsuarios(data);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            contenedor.innerHTML = '<p>Error al cargar los usuarios</p>';
        }
    };

    // Función para mostrar los usuarios en el contenedor
    const mostrarUsuarios = (usuarios) => {
        console.log("Mostrando usuarios:", usuarios); // SERVIOR
        let resultados = '';

        usuarios.forEach(usuario => {
            resultados += `
                <div class="list">
                    <div class="user">
                        <div class="imgBx">
                            <span><i class="fa-solid fa-user"></i></span>
                        </div>
                        <div class="details">
                            <h3>${usuario.nom_usuario}</h3>
                            <p>Cargo: ${usuario.cargo}</p>
                            <p>Contraseña: ${usuario.contraseña}</p>
                        </div>
                    </div>
                    <div class="navigation">
                       <span class="edit-user" data-id="${usuario.ID_usuario}"><i class="fa-solid fa-user-pen"></i></span>
                        <span class="delete-user" data-id="${usuario.ID_usuario}"><i class="fa-solid fa-user-xmark"></i></span>
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = resultados;

        // ----------------------------------------------------- CODIGO OBTENER EL ID Y EDITAR  --------------------------------------------------
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', () => {
                currentIdUsuario = button.getAttribute('data-id');  // Almacenar el ID del usuario actual
                console.log("Intentando editar usuario con id: ", currentIdUsuario);
        
                const btnEditar = document.querySelector('.btnEditar');
        
               
                btnEditar.replaceWith(btnEditar.cloneNode(true));
                const newBtnEditar = document.querySelector('.btnEditar');
        
                newBtnEditar.addEventListener('click', () => {
                    if (!currentIdUsuario) return;  // Verificar
        
                    const userName = document.querySelector('input[name="userName"]').value;
                    const userEmail = document.querySelector('input[name="userEmail"]').value;
                    const userCargo = document.querySelector('select[name="userCargo"]').value;
                    const userPassword = document.querySelector('input[name="userPassword"]').value;
                    const confirmar_contrasena = document.querySelector('input[name="confirmar_contrasena"]').value;
        
                    console.log('Nombre:', userName);
                    console.log('Email:', userEmail);
                    console.log('Cargo:', userCargo);
                    console.log('Contraseña:', userPassword);
                    console.log('Confirmar Contraseña:', confirmar_contrasena);
        
                    editarUsuario(currentIdUsuario, userName, userEmail, userCargo, userPassword, confirmar_contrasena);
                }, { once: true });
            });
        });
        // ----------------------------------------------------- FIN CODIGO OBTENER EL ID Y EDITAR  --------------------------------------------------


        // ----------------------------------------------------- CODIGO OBTENER EL ID Y BORRAR  --------------------------------------------------
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', () => {
                currentIdUsuarioBorrar = button.getAttribute('data-id');  // Almacenar el ID del usuario a borrar
                console.log("Intentando borrar usuario con id: ", currentIdUsuarioBorrar);
        
                const btnBorrar = document.querySelector('.btnBorrar');
        
                
                btnBorrar.replaceWith(btnBorrar.cloneNode(true));
                const newBtnBorrar = document.querySelector('.btnBorrar');
        
                newBtnBorrar.addEventListener('click', () => {
                    if (!currentIdUsuarioBorrar) return;  // Verificar 
        
                    borrarUsuario(currentIdUsuarioBorrar);
                }, { once: true });
            });
        });
        // ----------------------------------------------------- FIN CODIGO OBTENER EL ID Y BORRAR  --------------------------------------------------


        // ----------------------------------------------------- CODIGO MOSTRAR OPCIONES  --------------------------------------------------

        let navigations = document.querySelectorAll('.navigation');
        navigations.forEach(navigation => {
            navigation.onclick = function () {
                navigation.classList.add('active')
            }

            let confirmUser = navigation.querySelector('.confirm-user');
            if (confirmUser) {
                confirmUser.onclick = function (event) {
                    event.stopPropagation(); //
                    navigation.classList.remove('active');
                };
            }
        });

        // ----------------------------------------------------- FIN CODIGO MOSTRAR OPCIONES  --------------------------------------------------

        // ----------------------------------------------------- CODIGO MOSTRAR / CERRAR MODAL BORRAR  --------------------------------------------------

        const openModals = document.querySelectorAll('.delete-user');
        const body = document.querySelector('.body')
        const modal = document.querySelector('.modal');
        const closeModal = document.querySelector('.modal__close');
        const closeM = document.querySelector('.btnBorrar');

        openModals.forEach(openModal => {
            openModal.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('modal--show');

            });
        });

        closeModal.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('modal--show');
        });

        closeM.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('modal--show');
        });

        const closeButton = document.querySelector('.modal__close2');

        const closeButtonBorrar = document.querySelector('.modal__close');

closeButtonBorrar.addEventListener('click', () => {
    // Limpiar el ID del usuario actual al cerrar el modal
    currentIdUsuarioBorrar = null;
    console.log("Borrado cancelado, ID de usuario restablecido.");
});


        // ----------------------------------------------------- FIN CODIGO MOSTRAR / CERRAR MODAL BORRAR  --------------------------------------------------

        // ----------------------------------------------------- CODIGO MOSTRAR / CERRAR MODAL EDITAR  --------------------------------------------------

        const openModals2 = document.querySelectorAll('.edit-user');
        const modal2 = document.querySelector('.modal2');
        const closeModal2 = document.querySelector('.modal__close2');
        const closeM2 = document.querySelector('.btnEditar');

        openModals2.forEach(openModal2 => {
            openModal2.addEventListener('click', (e) => {
                e.preventDefault();
                modal2.classList.add('modal--show2');
            });
        });

        closeModal2.addEventListener('click', (e) => {
            e.preventDefault();
            modal2.classList.remove('modal--show2');
        });

        closeM2.addEventListener('click', (e) => {
            e.preventDefault();
            modal2.classList.remove('modal--show2');
        });

        closeButton.addEventListener('click', () => {
            // Limpiar el ID del usuario actual al cerrar el modal
            currentIdUsuario = null;
            console.log("Edición cancelada, ID de usuario restablecido.");
            
            // Resetear los campos del formulario
            document.querySelector('input[name="userName"]').value = '';
            document.querySelector('input[name="userEmail"]').value = '';
            document.querySelector('select[name="userCargo"]').selectedIndex = 0;
            document.querySelector('input[name="userPassword"]').value = '';
            document.querySelector('input[name="confirmar_contrasena"]').value = '';
        });
        

        // ----------------------------------------------------- FIN CODIGO MOSTRAR / CERRAR MODAL EDITAR  --------------------------------------------------

    };

    // ----------------------------------------------------- FIN CODIGO MOSTRAR USUARIOS  --------------------------------------------------



    // FUNCION LLAMADA
    fetchUsuarios();


});
