// ADM_menu.js actualizado para reporte de asistencias con filtros dinámicos y descarga en PDF

document.addEventListener("DOMContentLoaded", async () => {
  const profesorSelect = document.getElementById("profesor");
  const materiaContainer = document.getElementById("materia-container");
  const materiaSelect = document.getElementById("materia");
  const periodoSelect = document.getElementById("periodo");
  const chartContainer = document.getElementById("chart-container");
  const btnPDF = document.getElementById("btnDescargarPDF");

  async function cargarProfesores() {
    try {
      const res = await fetch("/api/profesores");
      const profesores = await res.json();
      profesorSelect.innerHTML = `<option value="todos">Todos</option>`;
      profesores.forEach((prof) => {
        const option = document.createElement("option");
        option.value = prof.id_usuario;
        option.textContent = prof.nombre;
        profesorSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error al cargar profesores:", err);
    }
  }

  async function cargarMaterias(idProfesor) {
    if (idProfesor === "todos") {
      materiaContainer.style.display = "block";
      materiaSelect.innerHTML = `<option value="todas">Todas</option>`;
      try {
        const res = await fetch("/api/materias/todas");
        const materias = await res.json();
        materias.forEach((mat) => {
          const option = document.createElement("option");
          option.value = mat.id_materia;
          option.textContent = mat.nombre;
          materiaSelect.appendChild(option);
        });
      } catch (err) {
        console.error("Error al cargar materias:", err);
      }
    } else {
      materiaContainer.style.display = "block";
      materiaSelect.innerHTML = `<option value="todas">Todas</option>`;
      try {
        const res = await fetch(`/api/materias/${idProfesor}`);
        const materias = await res.json();
        materias.forEach((mat) => {
          const option = document.createElement("option");
          option.value = mat.id_materia;
          option.textContent = mat.nombre;
          materiaSelect.appendChild(option);
        });
      } catch (err) {
        console.error("Error al cargar materias del profesor:", err);
      }
    }
  }

  function generarGrafica(data) {
    chartContainer.innerHTML = "";
    const options = {
      chart: {
        type: "bar",
        height: 350,
      },
      series: [
        {
          name: "Asistencias",
          data: data.asistencias,
        },
        {
          name: "Faltas",
          data: data.faltas,
        },
        {
          name: "Retardos",
          data: data.retardos,
        },
      ],
      xaxis: {
        categories: data.fechas,
      },
    };
    const chart = new ApexCharts(chartContainer, options);
    chart.render();
  }

  async function obtenerDatos() {
    const idProfesor = profesorSelect.value;
    const idMateria = materiaSelect?.value || "todas";
    const periodo = periodoSelect.value;

    try {
      const res = await fetch(`/api/reportes?profesor=${idProfesor}&materia=${idMateria}&periodo=${periodo}`);
      const datos = await res.json();
      generarGrafica(datos);
    } catch (err) {
      console.error("Error al obtener datos del reporte:", err);
    }
  }

  btnPDF.addEventListener("click", async () => {
    const canvas = await html2canvas(chartContainer);
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString();
    doc.text("Reporte de Asistencias - " + fecha, 10, 10);
    doc.addImage(imgData, "PNG", 10, 20, 180, 100);
    doc.save(`Reporte_Asistencias_${fecha}.pdf`);
  });

  profesorSelect.addEventListener("change", (e) => {
    cargarMaterias(e.target.value);
  });

  periodoSelect.addEventListener("change", obtenerDatos);
  materiaSelect?.addEventListener("change", obtenerDatos);

  await cargarProfesores();
  await cargarMaterias("todos");
  await obtenerDatos();
});
