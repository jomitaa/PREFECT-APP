document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("horario"); 
  let resultados = "";

  fetch("/api/predicciones")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || data.data.length === 0) {
        contenedor.innerHTML = "<p>No hay predicciones disponibles para hoy.</p>";
        return;
      }

      data.data.forEach((item) => {
        resultados += `
          <div class="horario-card">
            <div class="horario-header">
              <span><b>Grupo</b></span>
              <span><b>Profesor</b></span>
              <span><b>Materia</b></span>
              <span><b>Hora</b></span>
              <span><b>Día</b></span>
              <span><b>Fecha</b></span>
              <span><b>Estado</b></span>
            </div>
            <div class="horario-content">
              <span>${item.nom_grupo || "-"}</span>
              <span>${item.persona}</span>
              <span>${item.nom_materia || "-"}</span>
              <span>${item.hora_inicio} - ${item.hora_final}</span>
              <span>${item.dia_horario}</span>
              <span>${item.fecha_prediccion}</span>
        `;

        // Clasificar el resultado_prediccion
        if (item.resultado_prediccion === "FALTARÁ") {
          resultados += `<span class="falta">Faltara</span>`;
        } else if (item.resultado_prediccion === "NO FALTARÁ") {
          resultados += `<span class="asis">No faltara</span>`;
        } else if (item.resultado_prediccion.includes("RETARDO")) {
          resultados += `<span class="ret">Incierto / Retardo</span>`;
        } else {
          resultados += `<span class="estado">${item.resultado_prediccion}</span>`;
        }

        resultados += `
            </div>
          </div>
        `;
      });

      contenedor.innerHTML = resultados;
    })
    .catch((err) => {
      console.error("Error al obtener predicciones:", err);
      contenedor.innerHTML = "<p>Error al cargar las predicciones.</p>";
    });
});
