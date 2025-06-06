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

  const estadoValidacionCampos = {
    userName: false,
    userEmail: false,
    userPassword: false,
    confirmar_contrasena: false,
    userCargo: false,
    idEscuela: false,
  };

  // Cargar escuelas en el select
  fetch("/api/escuelas")
    .then(res => res.json())
    .then(data => {
      console.log("📚 Escuelas recibidas:", data);
      inputEscuela.innerHTML = '<option value="">Selecciona una escuela</option>';
      data.forEach(escuela => {
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

    console.log("📤 Enviando datos:", { userName, userEmail, userPassword, confirmar_contrasena, userCargo, idEscuela });

    if (!userName || !userEmail || !userPassword || !confirmar_contrasena || !userCargo || !idEscuela) {
      alertaErrorRegister.textContent = "Todos los campos son obligatorios.";
      alertaErrorRegister.style.display = "block";
      return;
    }

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, userEmail, userPassword, confirmar_contrasena, userCargo, idEscuela }),
      });

      const result = await response.json();
      console.log("🟢 Respuesta del servidor:", result);

      if (result.success) {
        alertaExitoRegister.textContent = result.message;
        alertaExitoRegister.style.display = "block";
        alertaErrorRegister.style.display = "none";
        formRegister.reset();
      } else {
        alertaErrorRegister.textContent = result.message;
        alertaErrorRegister.style.display = "block";
      }
    } catch (err) {
      console.error("❌ Error al registrar:", err);
      alertaErrorRegister.textContent = "Error al registrar el usuario.";
      alertaErrorRegister.style.display = "block";
    }
  });
});
