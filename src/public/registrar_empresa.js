document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("registerForm");
  const alertaExito = document.querySelector(".alerta-exito-register");
  const alertaError = document.querySelector(".alerta-error-register");
  const escuelaSelect = document.querySelector("select[name='idEscuela']");

  // Cargar escuelas en el select
  try {
    const res = await fetch("/api/escuelas");
    const escuelas = await res.json();
    escuelas.forEach(escuela => {
      const option = document.createElement("option");
      option.value = escuela.ID_escuela;
      option.textContent = escuela.nom_escuela;
      escuelaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar escuelas:", error);
  }

  // Validación y envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.userName.value.trim();
    const correo = form.userEmail.value.trim();
    const contrasena = form.userPassword.value.trim();
    const confirmar = form.confirmar_contrasena.value.trim();
    const idEscuela = form.idEscuela.value;

    // Validaciones básicas
    if (!nombre || !correo || !contrasena || !confirmar || !idEscuela) {
      alertaError.textContent = "Por favor completa todos los campos.";
      alertaError.style.display = "block";
      alertaExito.style.display = "none";
      return;
    }

    if (contrasena !== confirmar) {
      alertaError.textContent = "Las contraseñas no coinciden.";
      alertaError.style.display = "block";
      alertaExito.style.display = "none";
      return;
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: nombre,
          userEmail: correo,
          userPassword: contrasena,
          userCargo: "admin",
          idEscuela: idEscuela,
        }),
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      if (res.ok && data.success) {
        alertaExito.textContent = data.message || "Registro exitoso.";
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
      alertaError.textContent = "Error en el servidor.";
      alertaError.style.display = "block";
      alertaExito.style.display = "none";
    }
  });
});
