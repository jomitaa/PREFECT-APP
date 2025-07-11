const estadoValidacionCampos = {
  userName: false,
  userEmail: false,
  userPassword: false,
  userCargo: false,
};

document.addEventListener("DOMContentLoaded", () => {

  const formRegister = document.querySelector(".form-register");
  console.log("Formulario de registro:", formRegister);

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

  const alertaErrorRegister = document.querySelector(".form-register .alerta-error");
  const alertaExitoRegister = document.querySelector(".form-register .alerta-exito");
  console.log("Alerta de error registro:", alertaErrorRegister);
  console.log("Alerta de éxito registro:", alertaExitoRegister);

  const userNameRegex = /^[a-zA-Z0-9\_\-]{4,16}$/;
const emailRegexIPN = /^[a-zA-Z0-9_.+-]+@(alumno\.)?ipn\.mx$/i;
  const passwordRegex = /^.{4,12}$/;

  const cargoValidos = ['prefecto', 'admin'];

  inputUser.addEventListener("input", () => {
    validarCampo(userNameRegex, inputUser, "El usuario tiene que ser de 4 a 16 dígitos y solo puede contener letras y guión bajo.");
  });

  inputEmail.addEventListener("input", () => {
    validarCampo(
        emailRegexIPN, 
        inputEmail, 
        "Solo se permiten correos institucionales del IPN (ejemplo: usuario@ipn.mx o usuario@alumno.ipn.mx)"
    );
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

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Estado de validación antes del envío:", estadoValidacionCampos);

    if (estadoValidacionCampos.userName && estadoValidacionCampos.userEmail && estadoValidacionCampos.userPassword && estadoValidacionCampos.userCargo) {
      const userName = inputUser.value;
      const userEmail = inputEmail.value;
      const userPassword = inputPass.value;
      const userCargo = inputCargo.value;
      const confirmar_contrasena = inputConfirmar_Contrasena.value; 

      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userName, userEmail, userPassword, userCargo, confirmar_contrasena })
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (data.success) {
          mostrarMensajeExito(alertaExitoRegister, data.message);
          formRegister.reset();
        } else {
          mostrarMensajeError(alertaErrorRegister, data.message);
        }
      } catch (error) {
        console.error('Error al enviar los datos:', error);
        mostrarMensajeError(alertaErrorRegister, 'Error al procesar la solicitud.');
      }
    } else {
      mostrarMensajeError(alertaErrorRegister, 'Por favor, complete bien el formulario');
    }
  });

  console.log("Alerta de error después del envío:", alertaErrorRegister);
  console.log("Alerta de éxito después del envío:", alertaExitoRegister);
});

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
