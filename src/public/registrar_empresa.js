document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const alertaExito = document.querySelector(".alerta-exito-register");
  const alertaError = document.querySelector(".alerta-error-register");
  const escuelaSelect = document.querySelector("select[name='idEscuela']");

  // Cargar escuelas al iniciar
  fetch("/api/escuelas")
    .then((res) => res.json())
    .then((escuelas) => {
      escuelas.forEach((escuela) => {
        if (escuela.ID_escuela !== 2) {
          const option = document.createElement("option");
          option.value = escuela.ID_escuela;
          option.textContent = escuela.nom_escuela;
          escuelaSelect.appendChild(option);
        }
      });
    })
    .catch((err) => {
      console.error("Error al cargar escuelas:", err);
    });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.userName.value.trim();
    const correo = form.userEmail.value.trim();
    const cargo = form.userCargo.value;
    const idEscuela = form.idEscuela.value;
    const password = form.userPassword.value;
    const confirmar = form.confirmar_contrasena.value;

    // Validación
    if (!nombre || !correo || !password || !confirmar || !idEscuela) {
      alertaError.textContent = "Todos los campos son obligatorios, incluyendo escuela.";
      alertaError.style.display = "block";
      alertaExito.style.display = "none";
      return;
    }

    if (password !== confirmar) {
      alertaError.textContent = "Las contraseñas no coinciden.";
      alertaError.style.display = "block";
      alertaExito.style.display = "none";
      return;
    }

    // Enviar datos
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: nombre,
          userEmail: correo,
          userCargo: cargo,
          idEscuela: idEscuela,
          userPassword: password,
        }),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        alertaExito.textContent = "¡Se envió el link de confirmación al correo!";
        alertaExito.style.display = "block";
        alertaError.style.display = "none";
        form.reset();
      } else {
        alertaError.textContent = data.message || "Error al registrar usuario.";
        alertaError.style.display = "block";
        alertaExito.style.display = "none";
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alertaError.textContent = "Error al registrar usuario.";
      alertaError.style.display = "block";
      alertaExito.style.display = "none";
    }
  });
});
