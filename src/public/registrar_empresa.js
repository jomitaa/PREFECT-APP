const estadoValidacionEmpresa = {
    userName: false,
    userEmail: false,
    userPassword: false,
    userCargo: true, // siempre válido porque es admin fijo
    idEscuela: false
  };
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    // Validar si hay valor en el select
    const idEscuelaSeleccionada = selectEscuela.value;
    console.log("📤 Escuela seleccionada:", idEscuelaSeleccionada);
  
    if (!idEscuelaSeleccionada || idEscuelaSeleccionada === "Selecciona la escuela") {
      mostrarMensaje(alertaError, "Selecciona una escuela válida.", false);
      return;
    }
  
    if (Object.values(estadoValidacionEmpresa).every(v => v)) {
      const data = {
        userName: inputUser.value,
        userEmail: inputEmail.value,
        userCargo: inputCargo.value,
        userPassword: inputPass.value,
        confirmar_contrasena: inputConfirm.value,
        idEscuela: idEscuelaSeleccionada
      };
  
      console.log("📨 Datos enviados al backend:", data);
  
      try {
        const res = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
  
        const result = await res.json();
        console.log("🧾 Respuesta del backend:", result);
  
        if (result.success) {
          mostrarMensaje(alertaExito, result.message, true);
          form.reset();
        } else {
          mostrarMensaje(alertaError, result.message, false);
        }
      } catch (err) {
        console.error("❌ Error enviando datos:", err);
        mostrarMensaje(alertaError, "Error en el servidor", false);
      }
    } else {
      mostrarMensaje(alertaError, "Por favor completa correctamente todos los campos.", false);
    }
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
  