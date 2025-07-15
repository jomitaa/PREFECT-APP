const estadoValidacionCampos = {
    userName: true,  // Iniciar como true para permitir edición sin cambiar
    userEmail: true,
    userPassword: true,
    userCargo: true,
};

function cerrarModal(modalClass) {
    const modal = document.querySelector(modalClass);
    if (modal) {
        modal.classList.remove('modal--show', 'modal--show2');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const formEdit = document.querySelector(".form-register");
    const inputUser = document.querySelector('.form-register input[name="userName"]');
    const inputEmail = document.querySelector('.form-register input[name="userEmail"]');
    const inputPass = document.querySelector('.form-register input[name="userPassword"]');
    const inputConfirmar_Contrasena = document.querySelector('.form-register input[name="confirmar_contrasena"]');
    const inputCargo = document.querySelector('.form-register select[name="userCargo"]');
    
    // Elementos de alerta
    const alertaExito = document.querySelector('.alerta-exito');
    const alertaError = document.querySelector('.alerta-error');
    
    const userNameRegex = /^[a-zA-Z0-9\_\-]{4,16}$/;
    const emailRegexIPN = /^[a-zA-Z0-9_.+-]+@(alumno\.)?ipn\.mx$/i;
    const passwordRegex = /^.{4,12}$/;
    const cargoValidos = ['prefecto', 'admin'];

    // Variables globales
    let currentIdUsuario = null;
    let currentIdUsuarioBorrar = null;
    const contenedor = document.getElementById('tod');
    let currentUserPassword = '';

    // Función para validar contraseñas
    function validarContrasenas() {
        const pass1 = inputPass.value.trim();
        const pass2 = inputConfirmar_Contrasena.value.trim();
        
        if (!pass1 && !pass2) {
            estadoValidacionCampos.userPassword = true; // Válido si ambos están vacíos
            return;
        }
        
        estadoValidacionCampos.userPassword = passwordRegex.test(pass1) && pass1 === pass2;
    }

    // Event listeners para validación
    inputUser.addEventListener("input", () => {
        estadoValidacionCampos.userName = !inputUser.value.trim() || userNameRegex.test(inputUser.value);
    });

    inputEmail.addEventListener("input", () => {
        estadoValidacionCampos.userEmail = !inputEmail.value.trim() || emailRegexIPN.test(inputEmail.value);
    });

    inputPass.addEventListener("input", validarContrasenas);
    inputConfirmar_Contrasena.addEventListener("input", validarContrasenas);

    inputCargo.addEventListener("change", () => {
        estadoValidacionCampos.userCargo = cargoValidos.includes(inputCargo.value);
    });

    // Función para mostrar/ocultar alertas
    function mostrarAlerta(elemento, mensaje, esExito = false) {
        elemento.textContent = mensaje;
        elemento.classList.remove('alerta-error', 'alerta-exito');
        elemento.classList.add(esExito ? 'alerta-exito' : 'alerta-error');
        elemento.style.display = 'block';
        
        setTimeout(() => {
            elemento.style.display = 'none';
        }, 5000);
    }

    // Función para editar usuario
    const editarUsuario = async () => {
        // Ocultar alertas previas
        alertaError.style.display = 'none';
        alertaExito.style.display = 'none';
        
        // Validar campos
        const errors = [];
        
        // Validar nombre solo si fue modificado
        if (inputUser.value.trim() && !userNameRegex.test(inputUser.value)) {
            errors.push("El nombre de usuario debe tener entre 4 y 16 caracteres");
        }
        
        // Validar email solo si fue modificado
        if (inputEmail.value.trim() && !emailRegexIPN.test(inputEmail.value)) {
            errors.push("Debe ingresar un correo institucional del IPN válido");
        }
        
        // Validar cargo (siempre requerido)
        if (!inputCargo.value || !cargoValidos.includes(inputCargo.value)) {
            errors.push("Debe seleccionar un cargo válido");
        }
        
        const userPassword = inputPass.value.trim();
        const confirmar_contrasena = inputConfirmar_Contrasena.value.trim();
        
        // Solo validar contraseña si se proporcionó una nueva
        if (userPassword || confirmar_contrasena) {
            if (userPassword !== confirmar_contrasena) {
                errors.push("Las contraseñas no coinciden");
            }
            
            if (!passwordRegex.test(userPassword)) {
                errors.push("La contraseña debe tener entre 4 y 12 caracteres");
            }
        }

        if (errors.length > 0) {
            mostrarAlerta(alertaError, errors.join(" • "));
            return;
        }

        const userName = inputUser.value.trim();
        const userEmail = inputEmail.value.trim();
        const userCargo = inputCargo.value;
        
        try {
            // Preparar datos para enviar
            const userData = { 
                userName: userName || undefined,
                userEmail: userEmail || undefined,
                userCargo
            };
            
            // Solo incluir contraseña si se proporcionó una nueva
            if (userPassword) {
                userData.userPassword = userPassword;
                userData.confirmar_contrasena = confirmar_contrasena;
            }

            const response = await fetch(`/api/editarsur/${currentIdUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (response.ok) {
                mostrarAlerta(alertaExito, data.message || "Usuario actualizado correctamente", true);
                formEdit.reset();
                await actualizarTabla();
                cerrarModal('.modal2');
            } else {
                throw new Error(data.error || 'Error al actualizar el usuario');
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            mostrarAlerta(alertaError, error.message || 'Error al procesar la solicitud');
        }
    };

    // Función para borrar usuario
    const borrarUsuario = async () => {
        try {
            const response = await fetch(`/api/editarsur/${currentIdUsuarioBorrar}`, { 
                method: 'DELETE' 
            });
            
            if (!response.ok) {
                throw new Error('No se pudo borrar el usuario');
            }

            mostrarAlerta(alertaExito, "Usuario eliminado correctamente", true);
            await actualizarTabla();
            currentIdUsuarioBorrar = null;
            cerrarModal('.modal');
        } catch (error) {
            console.error('Error al borrar el usuario:', error);
            mostrarAlerta(alertaError, error.message || 'Error al borrar el usuario');
        }
    };

    // Función para actualizar tabla
    const actualizarTabla = async () => {
        try {
            const response = await fetch('/api/editarsur');
            if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);
            mostrarUsuarios(await response.json());
        } catch (error) {
            console.error('Error al actualizar la tabla:', error);
            contenedor.innerHTML = '<p>Error al cargar los usuarios</p>';
            mostrarAlerta(alertaError, "Error al cargar los usuarios");
        }
    };

    // Función para mostrar usuarios
    const mostrarUsuarios = (usuarios) => {
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
                            <p>Correo: ${usuario.correo}</p>
                            <p>Contraseña: *******</p>
                        </div>
                    </div>
                    <div class="navigation">
                        <span class="edit-user" 
                            data-id="${usuario.ID_usuario}" 
                            data-username="${usuario.nom_usuario}" 
                            data-email="${usuario.correo}" 
                            data-cargo="${usuario.cargo}"
                            data-password="${usuario.contraseña}">
                            <i class="fa-solid fa-user-pen"></i>
                        </span>
                        <span class="delete-user" data-id="${usuario.ID_usuario}">
                            <i class="fa-solid fa-user-xmark"></i>
                        </span>
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = resultados;

        // Evento para editar usuario
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', () => {
                currentIdUsuario = button.getAttribute('data-id');
                currentUserPassword = button.getAttribute('data-password');
                
                // Llenar formulario con datos del usuario
                inputUser.value = button.getAttribute('data-username');
                inputEmail.value = button.getAttribute('data-email');
                inputCargo.value = button.getAttribute('data-cargo');
                
                // Resetear estado de validación
                estadoValidacionCampos.userName = true;
                estadoValidacionCampos.userEmail = true;
                estadoValidacionCampos.userCargo = true;
                estadoValidacionCampos.userPassword = true;
                
                // Dejar campos de contraseña vacíos
                inputPass.value = '';
                inputConfirmar_Contrasena.value = '';
                
                // Abrir modal
                document.querySelector('.modal2').classList.add('modal--show2');
            });
        });

        // Evento para borrar usuario
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', () => {
                currentIdUsuarioBorrar = button.getAttribute('data-id');
                document.querySelector('.modal').classList.add('modal--show');
            });
        });
    };

    // Eventos para botones de acción
    document.querySelector('.btnEditar').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentIdUsuario) editarUsuario();
    });

    document.querySelector('.btnBorrar').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentIdUsuarioBorrar) borrarUsuario();
    });

    // Eventos para cerrar modales
    document.querySelector('.modal__close').addEventListener('click', (e) => {
        e.preventDefault();
        cerrarModal('.modal');
    });

    document.querySelector('.modal__close2').addEventListener('click', (e) => {
        e.preventDefault();
        cerrarModal('.modal2');
    });

    // Cerrar modales al hacer clic fuera
    document.querySelector('.modal').addEventListener('click', (e) => {
        if (e.target === document.querySelector('.modal')) {
            cerrarModal('.modal');
        }
    });

    document.querySelector('.modal2').addEventListener('click', (e) => {
        if (e.target === document.querySelector('.modal2')) {
            cerrarModal('.modal2');
        }
    });

    // Inicializar
    actualizarTabla();
});