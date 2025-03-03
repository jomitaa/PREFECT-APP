const estadoValidacionCampos = {
  userName: false,
  userPassword: false,
};

document.addEventListener("DOMContentLoaded", () => {
  // Variables específicas del formulario de login
  const formLogin = document.querySelector(".form-login");
  const inputPass = document.querySelector('.form-login input[type="password"]');
  const inputUser = document.querySelector('.form-login input[type="text"]');
  const alertaErrorLogin = document.querySelector(".form-login .alerta-error");

  const userNameRegex = /^[a-zA-Z0-9\_\-]{4,16}$/;
  const passwordRegex = /^.{4,12}$/;

  inputUser.addEventListener("input", () => {
    validarCampo(userNameRegex, inputUser, "El usuario tiene que ser de 4 a 16 dígitos y solo puede contener letras y guión bajo.");
  });

  inputPass.addEventListener("input", () => {
    validarCampo(passwordRegex, inputPass, "La contraseña tiene que ser de 4 a 12 dígitos");
  });

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (estadoValidacionCampos.userName && estadoValidacionCampos.userPassword) {
      const userName = inputUser.value;
      const userPassword = inputPass.value;

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userName, userPassword })
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (data.success) {
          // Redirige a la URL proporcionada por el servidor
          window.location.href = data.redirectUrl;
        } else {
          // Muestra el mensaje de error en el div de alerta general
          mostrarMensajeGeneral(alertaErrorLogin, data.message);
        }
      } catch (error) {
        console.error('Error al enviar los datos:', error);
        mostrarMensajeGeneral(alertaErrorLogin, 'Error al procesar la solicitud.');
      }
    } else {
      mostrarMensajeGeneral(alertaErrorLogin, 'Por favor, corrige los errores en el formulario.');
    }
  });
});

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

function mostrarMensajeGeneral(referencia, mensaje) {
  referencia.classList.add("alertaError"); // Añade clase para mostrar el div
  referencia.textContent = mensaje; 


  setTimeout(() => {
    eliminarMensajeGeneral(referencia);
  }, 3000);
}

function eliminarMensajeGeneral(referencia) {
  referencia.textContent = '';
  referencia.classList.remove("alertaError"); 
}
