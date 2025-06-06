document.addEventListener("DOMContentLoaded", () => {
  const formRegister = document.querySelector(".form-register");
  const inputUser = formRegister.querySelector('input[name="userName"]');
  const inputEmail = formRegister.querySelector('input[name="userEmail"]');
  const inputCargo = formRegister.querySelector('input[name="userCargo"]') || formRegister.querySelector('select[name="userCargo"]');
  const inputPass = formRegister.querySelector('input[name="userPassword"]');
  const inputConfirmar_Contrasena = formRegister.querySelector('input[name="confirmar_contrasena"]');
  const inputEscuela = formRegister.querySelector('select[name="idEscuela"]');

  const alertaErrorRegister = document.querySelector(".alerta-error");
  const alertaExitoRegister = document.querySelector(".alerta-exito");

  // 🔄 Cargar escuelas y excluir ID = 2
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

    const userName = inputUser.value.trim();
    const userEmail = inputEmail.value.trim();
    const userPassword = inputPass.value.trim();
    const confirmar_contrasena = inputConfirmar_Contrasena.value.trim();
    const userCargo = inputCargo.value || "admin";
    const idEscuela = inputEscuela.value;

    console.log("📤 Enviando datos:", { userName, userEmail, userPassword, confirmar_contrasena, userCargo, idEscuela });

    // Validaciones
    if (!userName || !userEmail || !userPassword || !confirmar_contrasena || !userCargo || !idEscuela) {
      alertaErrorRegister.textContent = "Todos los campos son obligatorios.";
      alertaErrorRegister.style.display = "block";
      alertaExitoRegister.style.display = "none";
      return;
    }

    if (userPassword !== confirmar_contrasena) {
      alertaErrorRegister.textContent = "Las contraseñas no coinciden.";
      alertaErrorRegister.style.display = "block";
      alertaExitoRegister.style.display = "none";
      return;
    }

    if (idEscuela === "2") {
      alertaErrorRegister.textContent = "No puedes seleccionar esa escuela.";
      alertaErrorRegister.style.display = "block";
      alertaExitoRegister.style.display = "none";
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
        alertaExitoRegister.style.display = "none";
      }
    } catch (err) {
      console.error("❌ Error al registrar:", err);
      alertaErrorRegister.textContent = "Error al registrar el usuario.";
      alertaErrorRegister.style.display = "block";
      alertaExitoRegister.style.display = "none";
    }
  });
});
