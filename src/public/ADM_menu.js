document.addEventListener("DOMContentLoaded", async () => {
    const selectProfesor = document.getElementById("profesor");

    try {
        const response = await fetch('/api/profesores');
        const profesores = await response.json();


        profesores.forEach(profesor => {
            const option = document.createElement("option");
            option.value = profesor.id_persona;
            option.textContent = profesor.nombre;
            selectProfesor.appendChild(option);
        });

      

    } catch (error) {
        console.error("Error al obtener profesores:", error);
    }
});


document.addEventListener("DOMContentLoaded", () => {


    const selectProfesor = document.getElementById("profesor");
    const chartContainer = document.getElementById("chart-container");

    let chart, lineSeries;

    function crearGrafica() {
        chartContainer.innerHTML = "";  // Limpiar el contenedor antes de crear un nuevo gráfico
        chart = LightweightCharts.createChart(chartContainer, {
            width: 600,
            height: 300,
            layout: { backgroundColor: "#ffffff", textColor: "#333" },
            grid: { vertLines: { color: "#eeeeee" }, horzLines: { color: "#eeeeee" } },
        });
        lineSeries = chart.addLineSeries(); // Aquí es donde se agrega la serie de la línea
    }

    async function cargarDatos(id_persona) {
        if (!id_persona) return;

        try {
            const response = await fetch(`/api/profes/${id_persona}`);
            const data = await response.json();

            if (data.error) {
                console.warn("No hay datos para este profesor.");
                lineSeries.setData([]); // Limpiar la gráfica si no hay datos
                return;
            }

            const chartData = data.map(item => ({
                time: new Date(item.fecha_asistencia).getTime() / 1000, // Convierte la fecha a timestamp en segundos
                value: item.asistencia, // Asistencia (o lo que quieras mostrar)
            }));

            lineSeries.setData(chartData); // Actualizar los datos en la gráfica
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    }

    selectProfesor.addEventListener("change", (e) => {
        crearGrafica();
        cargarDatos(e.target.value);
    });

    // Inicializar la gráfica vacía
    crearGrafica();
});
