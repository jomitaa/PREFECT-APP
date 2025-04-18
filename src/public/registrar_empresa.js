const estadoValidacionEmpresa = {
    userName: false,
    userEmail: false,
    userPassword: false,
    userCargo: true, // siempre válido porque es admin fijo
    idEscuela: false
  };
  
  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector(".form-register");
  
    const inputUser = form.querySelector('input[name="userName"]');
    const inputEmail = form.querySelector('input[name="userEmail"]');
    const inputPass = form.querySelector('input[name="userPassword"]');
    const inputConfirm = form.querySelector('input[name="confirmar_contrasena"]');
    const inputCargo = form.querySelector('input[name="userCargo"]'); // 👈 nuevo
    const selectEscuela = form.querySelector('select[name="idEscuela"]');
  
    const alertaError = form.querySelector(".alerta-error");
    const alertaExito = form.querySelector(".alerta-exito");
  
    const userNameRegex = /^[a-zA-Z0-9_-]{4,16}$/;
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const passwordRegex = /^.{4,12}$/;
  
    // 1. Cargar escuelas dinámicamente (excepto PrefectApp)
    try {
      const response = await fetch("/api/escuelas");
      const escuelas = await response.json();
  
      escuelas.forEach(escuela => {
        if (escuela.nom_escuela === "PrefectApp") return;
  
        const option = document.createElement("option");
        option.value = escuela.id_escuela;
        option.textContent = escuela.nom_escuela;
        selectEscuela.appendChild(option);
      });
    } catch (err) {
      console.error("Error al cargar escuelas:", err);
    }
  
    // 2. Validaciones por campo
    inputUser.addEventListener("input", () =>
      validarCampo(userNameRegex, inputUser, "userName", "Usuario inválido")
    );
    inputEmail.addEventListener("input", () =>
      validarCampo(emailRegex, inputEmail, "userEmail", "Correo inválido")
    );
    inputPass.addEventListener("input", () =>
      validarCampo(passwordRegex, inputPass, "userPassword", "Contraseña inválida")
    );
    inputConfirm.addEventListener("input", () =>
      validarCampo(passwordRegex, inputConfirm, "confirmar_contrasena", "Contraseña inválida")
    );
    selectEscuela.addEventListener("change", () => {
      estadoValidacionEmpresa.idEscuela = !!selectEscuela.value;
    });
  
    // 3. Envío del formulario
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      if (Object.values(estadoValidacionEmpresa).every(v => v)) {
        const data = {
          userName: inputUser.value,
          userEmail: inputEmail.value,
          userCargo: inputCargo.value,
          userPassword: inputPass.value,
          confirmar_contrasena: inputConfirm.value,
          idEscuela: selectEscuela.value
        };
  
        try {
          const res = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
  
          const result = await res.json();
          if (result.success) {
            mostrarMensaje(alertaExito, result.message, true);
            form.reset();
          } else {
            mostrarMensaje(alertaError, result.message, false);
          }
        } catch (err) {
          console.error("Error enviando datos:", err);
          mostrarMensaje(alertaError, "Error en el servidor", false);
        }
      } else {
        mostrarMensaje(alertaError, "Por favor completa correctamente todos los campos.", false);
      }
    });
  });
  
  function validarCampo(regex, campo, clave, msg) {
    const valido = regex.test(campo.value);
    estadoValidacionEmpresa[clave] = valido;
    campo.parentElement.classList.toggle("error", !valido);
  }
  
  function mostrarMensaje(referencia, mensaje, exito = true) {
    referencia.textContent = mensaje;
    referencia.classList.toggle("alerta-exito", exito);
    referencia.classList.toggle("alerta-error", !exito);
    referencia.style.display = 'block';
    setTimeout(() => (referencia.style.display = 'none'), 3000);
  }
  