


document.addEventListener("DOMContentLoaded", async () => {
  const profesorSelect = document.getElementById("profesor");
  const materiaContainer = document.getElementById("materia-container");
  const materiaSelect = document.getElementById("materia");
  const periodoSelect = document.getElementById("periodo");
  const chartContainer = document.getElementById("chart-container");
  const btnPDF = document.getElementById("btnDescargarPDF");
  const CambiarGrafica = document.getElementById("btnCambiarGrafica");

  CambiarGrafica.value = "barras"; // Valor por defecto

 CambiarGrafica.addEventListener("click", () => {
    if (CambiarGrafica.value === "lineas") {
      CambiarGrafica.value = "barras";
      CambiarGrafica.textContent = "Cambiar a Gráfica de Líneas";
    } else {
      CambiarGrafica.value = "lineas";
      CambiarGrafica.textContent = "Cambiar a Gráfica de Barras";
    }
    obtenerDatos(); // Actualizar los datos al cambiar el tipo de gráfica
  });



  // Función para cargar profesores
  async function cargarProfesores() {
    try {
      const res = await fetch("/api/profes");
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      
      const profesores = await res.json();
      profesorSelect.innerHTML = `<option value="todos">Todos</option>`;
      
      profesores.forEach((prof) => {
        const option = document.createElement("option");
        option.value = prof.id_persona;
        option.textContent = prof.nombre_completo;
        profesorSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error al cargar profesores:", err);
      mostrarError("Error al cargar la lista de profesores");
    }
  }

  // Función para cargar materias
  async function cargarMaterias(idProfesor) {
    materiaContainer.style.display = "block";
    materiaSelect.innerHTML = `<option value="todas">Todas</option>`;
    
    try {
      const endpoint = idProfesor === "todos" 
        ? "/api/materias/todas" 
        : `/api/materias/${idProfesor}`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      
      const materias = await res.json();
      
      materias.forEach((mat) => {
        const option = document.createElement("option");
        option.value = mat.id_materia;
        option.textContent = mat.nom_materia;
        materiaSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error al cargar materias:", err);
      mostrarError("Error al cargar la lista de materias");
    }
  }

  // Función para mostrar errores
  function mostrarError(mensaje) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = mensaje;
    chartContainer.appendChild(errorElement);
  }

  // Función principal para generar la gráfica
 // 1. Primero definimos la clase StackedBarSeries al inicio del archivo
class StackedBarSeriesPaneView {
    constructor(options) {
        this._options = options;
        this._data = [];
    }

    update(data) {
        this._data = data;
    }

    renderer() {
        return {
            draw: (ctx, pixelRatio, isHovered) => {
                ctx.scale(pixelRatio, pixelRatio);
                
                this._data.forEach(item => {
                    const x = this._timeToX(item.time);
                    const yTop = this._valueToY(0);
                    const yAsistencia = this._valueToY(item.asistencia);
                    const yFalta = this._valueToY(item.asistencia + item.falta);
                    const yRetardo = this._valueToY(item.asistencia + item.falta + item.retardo);
                    
                    // Dibujar retardo (naranja)
                    ctx.fillStyle = this._options.colors.retardo;
                    ctx.fillRect(x - 10, yTop, 20, yRetardo - yTop);
                    
                    // Dibujar falta (rojo)
                    ctx.fillStyle = this._options.colors.falta;
                    ctx.fillRect(x - 10, yRetardo, 20, yFalta - yRetardo);
                    
                    // Dibujar asistencia (verde)
                    ctx.fillStyle = this._options.colors.asistencia;
                    ctx.fillRect(x - 10, yFalta, 20, yAsistencia - yFalta);
                });
            }
        };
    }

    // Métodos auxiliares para conversión de coordenadas
    _timeToX(time) {
        return this._timeScale.timeToCoordinate(time) || 0;
    }

    _valueToY(value) {
        return this._priceScale.priceToCoordinate(value) || 0;
    }
}

class StackedBarSeries {
    constructor(options) {
        this._options = options;
        this._paneView = new StackedBarSeriesPaneView(this._options);
    }

    paneView() {
        return this._paneView;
    }

    priceAxisPaneView() {
        return null;
    }

    timeAxisPaneView() {
        return null;
    }
}

// 2. Luego tu función generarGrafica modificada
function generarGraficaLineas(data) {
    // Limpiar el contenedor
    chartContainer.innerHTML = '';
    
    // Crear elemento para el gráfico
    const chartElement = document.createElement("div");
    chartElement.id = "chart";
    chartElement.style.width = "100%";
    chartElement.style.height = "400px";
    chartContainer.appendChild(chartElement);

    // Verificar datos
    if (!data || !data.fechas || !Array.isArray(data.fechas) || data.fechas.length === 0) {
        chartElement.innerHTML = "<p class='no-data'>No hay datos disponibles para el período seleccionado</p>";
        return;
    }

    // Crear el gráfico
    const chart = LightweightCharts.createChart(chartElement, {
        layout: {
            backgroundColor: '#ffffff',
            textColor: '#333',
        },
        grid: {
            vertLines: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
            horzLines: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
        },
        rightPriceScale: {
            visible: true,
            scaleMargins: {
                top: 0.1,
                bottom: 0.2,
            },
        },
        timeScale: {
            barSpacing: 20,
        },
    });

    // Convertir fechas a timestamps (en segundos)
    const timestamps = data.fechas.map(f => {
        const date = new Date(f);
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 1000;
    });

    // Crear series para cada tipo de dato
    const asistenciaSeries = chart.addLineSeries({
        color: '#66BB6A',
        lineWidth: 2,
        title: 'Asistencias',
    });

    const faltaSeries = chart.addLineSeries({
        color: '#EF5350',
        lineWidth: 2,
        title: 'Faltas',
    });

    const retardoSeries = chart.addLineSeries({
        color: '#FFA726',
        lineWidth: 2,
        title: 'Retardos',
    });

    // Preparar datos para cada serie
    const asistenciaData = timestamps.map((t, i) => ({
        time: t,
        value: data.asistencias[i] || 0,
    }));

    const faltaData = timestamps.map((t, i) => ({
        time: t,
        value: data.faltas[i] || 0,
    }));

    const retardoData = timestamps.map((t, i) => ({
        time: t,
        value: data.retardos[i] || 0,
    }));

    // Agregar datos a las series
    asistenciaSeries.setData(asistenciaData);
    faltaSeries.setData(faltaData);
    retardoSeries.setData(retardoData);

    // Ajustar la escala de tiempo
    chart.timeScale().fitContent();

    // Agregar leyenda interactiva
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.innerHTML = `
        <div class="legend-item" data-series="asistencia">
            <span style="background-color:#66BB6A"></span>Asistencias
            <span class="legend-value">${data.asistencias.reduce((a, b) => a + b, 0)}</span>
        </div>
        <div class="legend-item" data-series="falta">
            <span style="background-color:#EF5350"></span>Faltas
            <span class="legend-value">${data.faltas.reduce((a, b) => a + b, 0)}</span>
        </div>
        <div class="legend-item" data-series="retardo">
            <span style="background-color:#FFA726"></span>Retardos
            <span class="legend-value">${data.retardos.reduce((a, b) => a + b, 0)}</span>
        </div>
    `;
    chartElement.appendChild(legend);

    // Actualizar leyenda al mover el mouse
    chart.subscribeCrosshairMove(param => {
        const values = [
            param.seriesData.get(asistenciaSeries),
            param.seriesData.get(faltaSeries),
            param.seriesData.get(retardoSeries)
        ];
        
        if (values.some(v => v !== undefined)) {
            values.forEach((value, i) => {
                const valElement = legend.querySelectorAll('.legend-value')[i];
                valElement.textContent = value ? value.value : '0';
            });
        } else {
            // Mostrar totales cuando no hay selección
            legend.querySelector('[data-series="asistencia"] .legend-value').textContent = 
                data.asistencias.reduce((a, b) => a + b, 0);
            legend.querySelector('[data-series="falta"] .legend-value').textContent = 
                data.faltas.reduce((a, b) => a + b, 0);
            legend.querySelector('[data-series="retardo"] .legend-value').textContent = 
                data.retardos.reduce((a, b) => a + b, 0);
        }
    });
}

  function generarGraficaBarras(data) {
    // Limpiar el contenedor
    chartContainer.innerHTML = '';
    
    // Crear elemento para el gráfico
    const chartElement = document.createElement("div");
    chartElement.id = "chart";
    chartContainer.appendChild(chartElement);

    // Verificar datos
    if (!data || !data.fechas || !Array.isArray(data.fechas) || data.fechas.length === 0) {
      chartElement.innerHTML = "<p class='no-data'>No hay datos disponibles para el período seleccionado</p>";
      return;
    }

    // Configuración del gráfico con colores personalizados
    const options = {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: true
        }
      },
      series: [
        { 
          name: 'Asistencias', 
          data: data.asistencias || Array(data.fechas.length).fill(0),
          color: '#66BB6A' // Verde claro
        },
        { 
          name: 'Faltas', 
          data: data.faltas || Array(data.fechas.length).fill(0),
          color: '#EF5350' // Rojo
        },
        { 
          name: 'Retardos', 
          data: data.retardos || Array(data.fechas.length).fill(0),
          color: '#FFA726' // Naranja
        }
      ],
      xaxis: {
        categories: data.fechas.map(f => new Date(f).toLocaleDateString()),
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Cantidad'
        },
        min: 0
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          // Opcional: colores para el borde de las barras
          colors: {
            ranges: [{
              from: 0,
              to: 1000,
              color: undefined // usa los colores definidos en series
            }]
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['transparent']
      },
      fill: {
        opacity: 1,
        // Opción alternativa para definir colores:
        // colors: ['#66BB6A', '#EF5350', '#FFA726']
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " registros";
          }
        }
      },
      // Opcional: leyenda personalizada
      legend: {
        position: 'top',
        markers: {
          fillColors: ['#66BB6A', '#EF5350', '#FFA726']
        }
      }
    };

    // Crear y renderizar el gráfico
    try {
      const chart = new ApexCharts(chartElement, options);
      chart.render();
    } catch (err) {
      console.error("Error al renderizar gráfica:", err);
      chartElement.innerHTML = `<p class="error">Error al mostrar los datos: ${err.message}</p>`;
    }
  }


  // Función para generar la gráfica según el tipo seleccionado


  generarGrafica = (data) => {
    if (CambiarGrafica.value === "lineas") {
      generarGraficaLineas(data);
    } else if (CambiarGrafica.value === "barras") {
      generarGraficaBarras(data);
    } else {
      console.error("Tipo de gráfica no soportado:", CambiarGrafica.value);
      chartContainer.innerHTML = "<p class='error'>Tipo de gráfica no soportado</p>";
    }
  };


  // Función para obtener datos del servidor
  async function obtenerDatos() {
  const idProfesor = profesorSelect.value;
  const idMateria = materiaSelect?.value || "todas";
  const periodo = periodoSelect.value;
  
  console.log(`Parámetros: profesor=${idProfesor}, materia=${idMateria}, periodo=${periodo}`);
  
  try {
    const res = await fetch(`/api/reporteGrafica?profesor=${idProfesor}&materia=${idMateria}&periodo=${periodo}`);
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
      const response = await res.json();
      
      // Validar estructura de datos
      if (!response || typeof response !== 'object') {
        throw new Error("Formato de datos incorrecto");
      }
      
      // Asegurar que todos los arrays existan
      const datosCompletos = {
        fechas: response.fechas || [],
        asistencias: response.asistencias || [],
        faltas: response.faltas || [],
        retardos: response.retardos || []
      };
      
      generarGrafica(datosCompletos);

    } catch (err) {
      console.error("Error al obtener datos del reporte:", err);
      mostrarError(`Error al cargar los datos: ${err.message}`);
    }
  }

  // Evento para descargar PDF
  btnPDF.addEventListener("click", async () => {
    try {
      const canvas = await html2canvas(chartContainer);
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString();
      
      doc.text("Reporte de Asistencias - " + fecha, 10, 10);
      doc.addImage(imgData, "PNG", 10, 20, 180, 100);
      doc.save(`Reporte_Asistencias_${fecha}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      mostrarError("Error al generar el PDF");
    }
  });

  // Event listeners
  profesorSelect.addEventListener("change", (e) => {
    cargarMaterias(e.target.value);
    obtenerDatos();
  });

  periodoSelect.addEventListener("change", obtenerDatos);
  materiaSelect?.addEventListener("change", obtenerDatos);

  // Inicialización
  try {
    await cargarProfesores();
    await cargarMaterias("todos");
    await obtenerDatos();
  } catch (err) {
    console.error("Error en inicialización:", err);
    mostrarError("Error al cargar los datos iniciales");
  }
});