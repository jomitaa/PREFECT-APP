const estadoValidacionCampos = {
    userName: false,
    userPassword: false,
  };
  let globalUserName = "";
  let globalRememberMe = false;

  document.addEventListener("DOMContentLoaded", () => {
    // Variables del formulario de login
    const formLogin = document.querySelector(".form-login");
    const inputPass = document.querySelector('.form-login input[type="password"]');
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const inputUser = document.querySelector('.form-login input[type="text"]');
    const alertaErrorLogin = document.querySelector(".form-login .alerta-error");
  
    // Expresiones regulares para validación
    const userNameRegex = /^[a-zA-Z0-9\_\-]{4,16}$/;
    const passwordRegex = /^.{4,12}$/;
  
    // Validación en tiempo real
    inputUser.addEventListener("input", () => {
      validarCampo(userNameRegex, inputUser, "El usuario debe tener de 4 a 16 caracteres y solo puede contener letras, números y guiones.");
    });
  
    inputPass.addEventListener("input", () => {
      validarCampo(passwordRegex, inputPass, "La contraseña debe tener de 4 a 12 caracteres.");
    });
  
    // Evento de envío del formulario de login
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      if (estadoValidacionCampos.userName && estadoValidacionCampos.userPassword) {
          const userName = inputUser.value;
          const userPassword = inputPass.value;

          globalUserName = userName;
          globalRememberMe = rememberMeCheckbox.checked;


  
          console.log("Enviando credenciales:", { userName, userPassword });
  
          try {
              const response = await fetch("/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userName, userPassword, rememberMe: globalRememberMe }),

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

  
  // Función para mostrar el formulario de OTP
  function mostrarFormularioOTP() {
    document.body.innerHTML = `
        <div class="otp-container">
            <h2>Verificación en dos pasos</h2>
            <p>Ingresa el código enviado a tu correo:</p>
            <input type="text" id="otp-input" placeholder="Código de Verificacion" required>
            <button onclick="verificarOTP()">Verificar</button>
            <div class="alerta-error"></div>
        </div>
    `;
  }
  
  // Función para verificar OTP

  async function verificarOTP() {
    const otpCode = document.getElementById("otp-input").value;
    const alertaErrorOTP = document.querySelector(".alerta-error");

    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userName: globalUserName,
          otpCode: otpCode,
          rememberMe: globalRememberMe
        })
      });

      const text = await response.text();
      console.log("Respuesta OTP recibida:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Error al parsear JSON:", error);
        mostrarMensaje(alertaErrorOTP, "Error en la verificación.");
        return;
      }

      if (data.success) {
        window.location.href = data.redirectUrl;
      } else {
        mostrarMensaje(alertaErrorOTP, data.message);
      }

    } catch (error) {
      console.error("Error verificando OTP:", error);
      mostrarMensaje(alertaErrorOTP, "Error en la verificación.");
    }
  }
  
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
  
