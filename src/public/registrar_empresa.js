document.addEventListener("DOMContentLoaded", async function () {
  const formulario = document.getElementById("formularioRegistro");
  const inputNombre = document.getElementById("userName");
  const inputCorreo = document.getElementById("userEmail");
  const inputCargo = document.getElementById("userCargo");
  const inputContrasena = document.getElementById("userPassword");
  const inputConfirmarContrasena = document.getElementById("confirmar_contrasena");
  const selectEscuela = document.getElementById("idEscuela");

  const alertaExito = document.getElementById("alertaExito");
  const alertaError = document.getElementById("alertaError");

  // Cargar escuelas desde el backend
  try {
    const respuesta = await fetch("/api/escuelas");
    const escuelas = await respuesta.json();

    escuelas.forEach((escuela) => {
      const opcion = document.createElement("option");
      opcion.value = escuela.id_escuela;
      opcion.textContent = escuela.nombre;
      selectEscuela.appendChild(opcion);
    });

    selectEscuela.disabled = false;
  } catch (error) {
    console.error("Error al cargar escuelas:", error);
    mostrarMensaje(alertaError, "No se pudieron cargar las escuelas. Intenta más tarde.", false);
  }

  formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    limpiarErrores();

    const nombre = inputNombre.value.trim();
    const correo = inputCorreo.value.trim();
    const cargo = inputCargo.value;
    const contrasena = inputContrasena.value;
    const confirmarContrasena = inputConfirmarContrasena.value;
    const idEscuelaSeleccionada = selectEscuela.value;

    // Validaciones
    if (!nombre || !correo || !cargo || !contrasena || !confirmarContrasena || !idEscuelaSeleccionada) {
      mostrarMensaje(alertaError, "Todos los campos son obligatorios, incluyendo la escuela.", false);
      return;
    }

    if (contrasena !== confirmarContrasena) {
      mostrarMensaje(alertaError, "Las contraseñas no coinciden.", false);
      return;
    }

    const datos = {
      userName: nombre,
      userEmail: correo,
      userCargo: cargo,
      userPassword: contrasena,
      confirmar_contrasena: confirmarContrasena,
      idEscuela: idEscuelaSeleccionada
    };

    console.log("📨 Enviando datos al backend:", datos);

    try {
      const respuesta = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (resultado.success) {
        mostrarMensaje(alertaExito, resultado.message, true);
        formulario.reset();
      } else {
        mostrarMensaje(alertaError, resultado.message, false);
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      mostrarMensaje(alertaError, "Ocurrió un error al registrar el usuario.", false);
    }
  });

  function mostrarMensaje(elemento, mensaje, exito) {
    elemento.textContent = mensaje;
    elemento.style.display = "block";
    elemento.classList.toggle("alert-success", exito);
    elemento.classList.toggle("alert-danger", !exito);
  }

  function limpiarErrores() {
    alertaError.style.display = "none";
    alertaExito.style.display = "none";
    selectEscuela.classList.remove("is-invalid");
  }
});
