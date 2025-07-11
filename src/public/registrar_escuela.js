document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEscuela");
    const alertaError = document.querySelector(".alerta-error");
    const alertaExito = document.querySelector(".alerta-exito");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const nom_escuela = form.nom_escuela.value.trim();
      const CCT = form.CCT.value.trim();
      const telefono_escuela = form.telefono_escuela.value.trim();

      if (!/^\d{7,15}$/.test(telefono_escuela)) {
        mostrarMensaje(alertaError, "El teléfono debe contener solo números (7 a 15 dígitos).", false);
        return;
      }

  
      // Validaciones básicas
      if (!nom_escuela || !CCT || !telefono_escuela) {
        mostrarMensaje(alertaError, "Todos los campos son obligatorios.", false);
        return;
      }
  
      try {
        const res = await fetch("/api/escuelas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nom_escuela, CCT, telefono_escuela })
        });
  
        const result = await res.json();
  
        if (result.success) {
          mostrarMensaje(alertaExito, result.message, true);
          form.reset();
        } else {
          mostrarMensaje(alertaError, result.message, false);
        }
      } catch (err) {
        console.error("Error al registrar escuela:", err);
        mostrarMensaje(alertaError, "Error en el servidor.", false);
      }
    });
  
    function mostrarMensaje(ref, mensaje, exito = true) {
      ref.textContent = mensaje;
      ref.classList.toggle("alerta-exito", exito);
      ref.classList.toggle("alerta-error", !exito);
      ref.style.display = 'block';
      setTimeout(() => (ref.style.display = 'none'), 3000);
    }
  });
  