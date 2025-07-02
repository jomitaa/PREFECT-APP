/*const estadoValidacionCampos = {
    nombre: false,
    codigo_jefe: false,
    appat: false,
    apmat: false,
    boleta: false,
  };
  let globalnombre = "";
  let globalcodigo_jefe = false;
    let globalappat = "";
    let globalapmat = "";
    let globalboleta = "";

  document.addEventListener("DOMContentLoaded", () => {
    // Variables del formulario de login
    const formLogin = document.querySelector(".form-login");
    const inputPass = document.querySelector('.form-login input[name="codigo_jefe"]');
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const inputnombre = document.querySelector('.form-login input[name="nombre"]');
    const inputAppat = document.querySelector('.form-login input[name="appat"]');
    const inputApmat = document.querySelector('.form-login input[name="apmat"]');
    const inputBoleta = document.querySelector('.form-login input[name="boleta"]');
    const alertaErrorLogin = document.querySelector(".form-login .alerta-error");
  
    // Expresiones regulares para validación
    const userNameRegex = /^[a-zA-Z\_\-]{4,50}$/;
    const passwordRegex = /^.{0,6}$/;
    const boletaRegex = /^[0-20]$/; 
  
    inputnombre.addEventListener("input", () => {
      validarCampo(userNameRegex, inputnombre,  "El nombre debe tener minimo 4 caracteres y solo puede contener letras.");
    });

    inputAppat.addEventListener("input", () => {
      validarCampo(userNameRegex, inputAppat, "El apellido paterno debe tener minimo 4 caracteres y solo puede contener letras.");
    });

    inputApmat.addEventListener("input", () => {
      validarCampo(userNameRegex, inputApmat, "El apellido materno debe tener minimo 4 caracteres y solo puede contener letras.");
    }); 

    inputBoleta.addEventListener("input", () => {
      validarCampo(boletaRegex, inputBoleta, "La boleta debe ser un número entre 0 y 20.");
    });
  
    inputPass.addEventListener("input", () => {
      validarCampo(passwordRegex, inputPass, "La contraseña debe tener maximo 6 caracteres.");
    });
  
    // Evento de envío del formulario de login
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      if (estadoValidacionCampos.nombre && estadoValidacionCampos.codigo_jefe && estadoValidacionCampos.appat && estadoValidacionCampos.apmat && estadoValidacionCampos.boleta) {
          const nombre = inputnombre.value;
          const codigo_jefe = inputPass.value;
            const appat = inputAppat.value;
            const apmat = inputApmat.value;
            const boleta = inputBoleta.value;

          globalnombre = nombre;
          globalcodigo_jefe = codigo_jefe;
          globalappat = appat;
          globalapmat = apmat;
          globalboleta = boleta;


  
          console.log("Enviando credenciales:", { nombre, codigo_jefe, appat, apmat, boleta });
  
          try {
              const response = await fetch("/api/registrar-jefe", {
                  method: "POST",
                  credentials: 'include',
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nombre, codigo_jefe, appat, apmat, boleta }),

              });
  
              const text = await response.text();
              console.log("Respuesta del servidor:", text);
  
              let data;
              try {
                  data = JSON.parse(text);
              } catch (error) {
                  console.error("Error al parsear JSON:", error);
                  mostrarMensajeGeneral(alertaErrorLogin, "Error en el servidor.");
                  return;
              }
  
              if (data.success && data.requiresOTP) {
                  mostrarFormularioOTP();
              } else if (data.success) {
                  window.location.href = data.redirectUrl;
              } else {
                  mostrarMensajeGeneral(alertaErrorLogin, data.message);
              }
  
          } catch (error) {
              console.error("Error al enviar los datos:", error);
              mostrarMensajeGeneral(alertaErrorLogin, "Error al procesar la solicitud.");
          }
      } else {
          mostrarMensajeGeneral(alertaErrorLogin, "Corrige los errores en el formulario.");
      }
  });
  

  });

  // Función para validar los campos de usuario y contraseña
  function validarCampo(regularExpresion, campo, mensaje) {
    const esValido = regularExpresion.test(campo.value);
    const contenedor = campo.parentElement.parentElement;
    
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
  
  // Función para mostrar mensajes en los campos de entrada
  function mostrarMensajeCampo(contenedor, mensaje) {
    eliminarMensajeCampo(contenedor);
    const alertaDiv = document.createElement("div");
    alertaDiv.classList.add("alerta");
    alertaDiv.textContent = mensaje;
    contenedor.appendChild(alertaDiv);
  }
  
  // Función para eliminar mensajes de error de los campos de entrada
  function eliminarMensajeCampo(contenedor) {
    const alerta = contenedor.querySelector(".alerta");
    if (alerta) alerta.remove();
  }
  
  // Función para mostrar mensajes de error generales
  function mostrarMensajeGeneral(referencia, mensaje) {
    referencia.classList.add("alertaError"); 
    referencia.textContent = mensaje;
  
    setTimeout(() => {
      eliminarMensajeGeneral(referencia);
    }, 3000);
  }
  
  // Función para eliminar mensajes de error generales
  function eliminarMensajeGeneral(referencia) {
    referencia.textContent = "";
    referencia.classList.remove("alertaError"); 
  }
  
  // Función para mostrar mensajes en la verificación OTP
  function mostrarMensaje(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.classList.add("mostrar");
  
    setTimeout(() => {
      elemento.textContent = "";
      elemento.classList.remove("mostrar");
    }, 3000);
  }
  
*/







document.addEventListener("DOMContentLoaded", async () => {
    // Obtener el token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const tokenMessage = document.getElementById('token-message');
    const form = document.getElementById('formRegistroJefe');
    
    if (!token) {
        showMessage(tokenMessage, 'No se proporcionó token de registro', 'error');
        redirectToLogin();
        return;
    }

    try {
        // Verificar el token con el servidor
        const response = await fetch(`/api/verificar-token-jefe/${token}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Token inválido');
        }

        // Mostrar formulario y autocompletar datos
        form.style.display = 'block';
        document.getElementById('correo-display').value = data.correo;
        document.getElementById('correo').value = data.correo;
        document.getElementById('grupoId').value = data.grupoId;
        document.getElementById('token').value = token;
        document.getElementById('idEscuela').value = data.idEscuela;

        
        // Configurar validación de campos
        setupFormValidation();

    } catch (error) {
        showMessage(tokenMessage, error.message, 'error');
        redirectToLogin();
    }
});

function setupFormValidation() {
    const estadoValidacionCampos = {
        nombre: false,
        appat: false,
        apmat: false,
        boleta: false,
        codigo_jefe: false
    };

    // Expresiones regulares para validación
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    const boletaRegex = /^\d{6,20}$/;
    const codigoRegex = /^\d{6}$/; // Asumiendo que el código es de 6 dígitos

    // Elementos del formulario
    const form = document.getElementById('formRegistroJefe');
    const inputNombre = document.getElementById('nombre');
    const inputAppat = document.getElementById('appat');
    const inputApmat = document.getElementById('apmat');
    const inputBoleta = document.getElementById('boleta');
    const inputCodigo = document.getElementById('codigo_jefe');
    const errorMessage = document.getElementById('error-message');

    // Validación en tiempo real
    inputNombre.addEventListener('input', () => {
        estadoValidacionCampos.nombre = validateField(inputNombre, nameRegex, 'Nombre inválido (solo letras, 2-50 caracteres)');
    });

    inputAppat.addEventListener('input', () => {
        estadoValidacionCampos.appat = validateField(inputAppat, nameRegex, 'Apellido paterno inválido');
    });

    inputApmat.addEventListener('input', () => {
        estadoValidacionCampos.apmat = validateField(inputApmat, nameRegex, 'Apellido materno inválido');
    });

    inputBoleta.addEventListener('input', () => {
        estadoValidacionCampos.boleta = validateField(inputBoleta, boletaRegex, 'Boleta inválida (6-20 dígitos)');
    });

    inputCodigo.addEventListener('input', () => {
        estadoValidacionCampos.codigo_jefe = validateField(inputCodigo, codigoRegex, 'Código inválido (6 dígitos)');
    });

    // Envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validar todos los campos
        const allValid = Object.values(estadoValidacionCampos).every(Boolean);
        
        if (!allValid) {
            showMessage(errorMessage, 'Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        try {
            const formData = {
                token: document.getElementById('token').value,
                nombre: inputNombre.value.trim(),
                appat: inputAppat.value.trim(),
                apmat: inputApmat.value.trim(),
                boleta: inputBoleta.value.trim(),
                codigo_jefe: inputCodigo.value.trim(),
                correo: document.getElementById('correo').value.trim(),
                grupoId: document.getElementById('grupoId').value,
                idEscuela: document.getElementById('idEscuela').value
            };

            const response = await fetch('/api/registrar-jefe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro');
            }

            // Registro exitoso
            showMessage(document.getElementById('success-message'), 'Registro completado. Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = '/pages/login.html?registroExitoso=true';
            }, 2000);

        } catch (error) {
            showMessage(errorMessage, error.message, 'error');
        }
    });
}

// Funciones auxiliares (mantener las mismas del código anterior)
// ... validateField, showError, clearError, showMessage, redirectToLogin


// Funciones auxiliares
function validateField(input, regex, errorMsg) {
    const isValid = regex.test(input.value);
    if (isValid) {
        clearError(input);
        return true;
    } else {
        showError(input, errorMsg);
        return false;
    }
}

function showError(input, message) {
    const container = input.parentElement.parentElement;
    let errorDiv = container.querySelector('.field-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        container.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    input.parentElement.classList.add('error');
}

function clearError(input) {
    const container = input.parentElement.parentElement;
    const errorDiv = container.querySelector('.field-error');
    
    if (errorDiv) {
        container.removeChild(errorDiv);
    }
    
    input.parentElement.classList.remove('error');
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = `alerta ${type === 'error' ? 'alertaError' : type === 'success' ? 'alertaExito' : ''}`;
    
    if (type !== 'error') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

function redirectToLogin() {
    setTimeout(() => {
        window.location.href = '/pages/login.html';
    }, 3000);
}