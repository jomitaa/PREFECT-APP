document.addEventListener("DOMContentLoaded", () => {
  const formRegister = document.querySelector(".form-register");
  const inputUser = formRegister.querySelector('input[name="userName"]');
  const inputEmail = formRegister.querySelector('input[name="userEmail"]');
  const inputCargo = formRegister.querySelector('input[name="userCargo"]') || formRegister.querySelector('select[name="userCargo"]');
  const inputPass = formRegister.querySelector('input[name="userPassword"]');
  const inputConfirmar_Contrasena = formRegister.querySelector('input[name="confirmar_contrasena"]');
  const inputEscuela = formRegister.querySelector('select[name="idEscuela"]');
  const alertaErrorRegister = document.querySelector(".alerta-error-register");
  const alertaExitoRegister = document.querySelector(".alerta-exito-register");

  // Cargar escuelas excluyendo la de ID 2
  fetch("/api/escuelas")
    .then(res => res.json())
    .then(data => {
      inputEscuela.innerHTML = '<option value="">Selecciona una escuela</option>';
      data
        .filter(escuela => escuela.ID_escuela !== 2)
        .forEach(escuela => {
          const option = document.createElement("option");
          option.value = escuela.ID_escuela;
          option.textContent = escuela.nom_escuela;
          inputEscuela.appendChild(option);
        });
    })
    .catch(error => {
      console.error("❌ Error cargando escuelas:", error);
    });

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = inputUser.value;
    const userEmail = inputEmail.value;
    const userPassword = inputPass.value;
    const confirmar_contrasena = inputConfirmar_Contrasena.value;
    const userCargo = inputCargo.value || "admin";
    const idEscuela = inputEscuela.value;

    // Validaciones básicas
    if (!userName || !userEmail || !userPassword || !confirmar_contrasena || !userCargo || !idEscuela) {
      if (alertaErrorRegister) {
        alertaErrorRegister.textContent = "Todos los campos son obligatorios.";
        alertaErrorRegister.style.display = "block";
      }
      return;
    }

    if (userPassword !== confirmar_contrasena) {
      if (alertaErrorRegister) {
        alertaErrorRegister.textContent = "Las contraseñas no coinciden.";
        alertaErrorRegister.style.display = "block";
      }
      return;
    }

    if (idEscuela === "2") {
      if (alertaErrorRegister) {
        alertaErrorRegister.textContent = "No puedes seleccionar esa escuela.";
        alertaErrorRegister.style.display = "block";
      }
      return;
    }

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, userEmail, userPassword, confirmar_contrasena, userCargo, idEscuela }),
      });

      const result = await response.json();

      if (result.success) {
        if (alertaExitoRegister) {
          alertaExitoRegister.textContent = result.message || "Usuario registrado correctamente.";
          alertaExitoRegister.style.display = "block";
        }
        if (alertaErrorRegister) alertaErrorRegister.style.display = "none";
        formRegister.reset();
      } else {
        if (alertaErrorRegister) {
          alertaErrorRegister.textContent = result.message || "Ocurrió un error al registrar.";
          alertaErrorRegister.style.display = "block";
        }
      }
    } catch (err) {
      console.error("❌ Error al registrar:", err);
      if (alertaErrorRegister) {
        alertaErrorRegister.textContent = "Error de conexión o del servidor.";
        alertaErrorRegister.style.display = "block";
      }
    }
  });
});
