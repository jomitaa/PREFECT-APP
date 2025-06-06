document.addEventListener("DOMContentLoaded", () => {
  const formRegister = document.getElementById("registerForm");

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;
    const confirmarContrasena = document.getElementById("confirmar_contrasena").value;
    const escuelaId = document.getElementById("escuela").value;

    const mensajeError = document.getElementById("mensaje-error");
    const mensajeExito = document.getElementById("mensaje-exito");

    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    if (contrasena !== confirmarContrasena) {
      mensajeError.textContent = "Las contraseñas no coinciden";
      return;
    }

    try {
      const response = await fetch("/api/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          contrasena,
          tipo_usuario: "administrador",
          ID_escuela: escuelaId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        mensajeExito.textContent = "Registro exitoso. Revisa tu correo para verificar la cuenta.";
        formRegister.reset();
      } else {
        mensajeError.textContent = data.message || "Error al registrar el usuario.";
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      mensajeError.textContent = "Error al registrar el usuario.";
    }
  });

  // Cargar escuelas al cargar la página
  const selectEscuela = document.getElementById("escuela");

  fetch("/api/escuelas")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((escuela) => {
        const option = document.createElement("option");
        option.value = escuela.ID_escuela;
        option.textContent = escuela.nom_escuela;
        selectEscuela.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error al cargar escuelas:", err);
    });
});

