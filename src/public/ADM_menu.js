let profesorSeleccc = { id: "todos", nombre: "Todos" };
let materiaSeleccc = { id: "todas", nombre: "Todas" };
let periodoSeleccc = "dia";

const contenedorPeriodo = document.querySelector('.contenedor-select');
const contenedorProfesor = document.querySelector('.contenedor-select[data-type="profesor"]');
const contenedorMateria = document.querySelector('.contenedor-select[data-type="materia"]');

function showLoading(show) {
  if (show) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    overlay.id = 'loading-overlay';
    document.body.appendChild(overlay);
  } else {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
  }
}


const style = document.createElement('style');
style.textContent = `
  .no-horarios-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #666;
    font-size: 1.2rem;
  }
  .no-horarios-message i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #aaa;
  }
`;
document.head.appendChild(style);

// --------------------------- selec periodos ---------------------------

function seleccionarPeriodo(opcion) {
            // Animación
            opcion.style.transform = 'scale(0.98)';
            setTimeout(() => opcion.style.transform = '', 150);
            
            // Actualizar variable y UI
            periodoSeleccc = opcion.dataset.value;
            contenedorPeriodo.querySelector('.boton-select span').textContent = opcion.textContent;
            
            // Marcar como seleccionado
            contenedorPeriodo.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            opcion.classList.add('seleccionado');
            
            // Cerrar select
            cerrarSelect(contenedorPeriodo);

             const event = new Event('change');
    contenedorPeriodo.dispatchEvent(event);
            
        }

        function inicializarEventosPeriodo() {
    const botonSelect = contenedorPeriodo.querySelector('.boton-select');
    const contenidoSelect = contenedorPeriodo.querySelector('.contenido-select');
    
    // Evento para abrir/cerrar el select
    botonSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        contenedorPeriodo.classList.toggle("activo");
    });
    
    // Asegúrate que las opciones tienen el evento onclick correcto
    const opcionesPeriodo = contenedorPeriodo.querySelectorAll('.opciones li');
    opcionesPeriodo.forEach(opcion => {
        opcion.onclick = function() {
            seleccionarPeriodo(this);
        };
    });
}
// --------------------------- fin selec periodo ---------------------------

// --------------------------- selec profesor ---------------------------
function seleccionarProfesor(opcion) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    
    // Actualizar variable y UI
     profesorSeleccc = {
        id: opcion.dataset.value,
        nombre: opcion.textContent
    };
    contenedorProfesor.querySelector('.boton-select span').textContent = opcion.textContent;
    
    // Marcar como seleccionado
    contenedorProfesor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    opcion.classList.add('seleccionado');
    
    // Cerrar select
    cerrarSelect(contenedorProfesor);
    
    // Cargar materias correspondientes al profesor seleccionado
    cargarMateriasPersonalizado(profesorSeleccc.id);
    
    // Disparar evento change
    const event = new Event('change');
    contenedorProfesor.dispatchEvent(event);
}

function inicializarEventosProfesor() {
    const botonSelect = contenedorProfesor.querySelector('.boton-select');
    const contenidoSelect = contenedorProfesor.querySelector('.contenido-select');
    const inputBusqueda = contenedorProfesor.querySelector('.buscador input');
                        const opciones = contenedorProfesor.querySelector('.opciones');


    
    // Evento para abrir/cerrar el select
    botonSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        contenedorProfesor.classList.toggle("activo");

         if (contenedorProfesor.classList.contains('activo') && inputBusqueda) {
                        inputBusqueda.focus();
                    }
    });

      if (inputBusqueda) {
                    inputBusqueda.addEventListener('input', () => {
                        const busqueda = inputBusqueda.value.toLowerCase();
                        const items = opciones.querySelectorAll('li');
                        
                        items.forEach(item => {
                            const texto = item.textContent.toLowerCase();
                            item.style.display = texto.includes(busqueda) ? 'flex' : 'none';
                        });
                    });
                }
    
    // Asignar evento a las opciones
    const opcionesProfesor = contenedorProfesor.querySelectorAll('.opciones li');
    opcionesProfesor.forEach(opcion => {
        opcion.onclick = function() {
            seleccionarProfesor(this);
        };
    });

    
}

// --------------------------- selec materia ---------------------------
function seleccionarMateria(opcion) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    
    // Actualizar variable y UI
     materiaSeleccc = {
        id: opcion.dataset.value,
        nombre: opcion.textContent
    };
    contenedorMateria.querySelector('.boton-select span').textContent = opcion.textContent;
    
    // Marcar como seleccionado
    contenedorMateria.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    opcion.classList.add('seleccionado');
    
    // Cerrar select
    cerrarSelect(contenedorMateria);
    
    // Disparar evento change
    const event = new Event('change');
    contenedorMateria.dispatchEvent(event);
}

function inicializarEventosMateria() {
    const botonSelect = contenedorMateria.querySelector('.boton-select');
    const contenidoSelect = contenedorMateria.querySelector('.contenido-select');
    const inputBusqueda = contenedorMateria.querySelector('.buscador input');
                    const opciones = contenedorMateria.querySelector('.opciones');


    
    // Evento para abrir/cerrar el select
    botonSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        contenedorMateria.classList.toggle("activo");

         if (contenedorMateria.classList.contains('activo') && inputBusqueda) {
                        inputBusqueda.focus();
                    }
    });

      if (inputBusqueda) {
                    inputBusqueda.addEventListener('input', () => {
                        const busqueda = inputBusqueda.value.toLowerCase();
                        const items = opciones.querySelectorAll('li');
                        
                        items.forEach(item => {
                            const texto = item.textContent.toLowerCase();
                            item.style.display = texto.includes(busqueda) ? 'flex' : 'none';
                        });
                    });
                }
    
    // Asignar evento a las opciones
    const opcionesMateria = contenedorMateria.querySelectorAll('.opciones li');
    opcionesMateria.forEach(opcion => {
        opcion.onclick = function() {
            seleccionarMateria(this);
        };
    });
}

// --------------------------- fin selec materia ---------------------------


function cerrarSelect(contenedor) {
            if (!contenedor) return;
            
            const contenidoSelect = contenedor.querySelector('.contenido-select');
            if (!contenidoSelect) return;
            
            contenidoSelect.style.opacity = '0';
            contenidoSelect.style.transform = 'translateY(-15px)';
            
            setTimeout(() => {
                contenedor.classList.remove("activo");
                contenidoSelect.style.opacity = '';
                contenidoSelect.style.transform = '';
            }, 300);
        }



         // ---------- llenar los select custom -----------------

  async function cargarProfesoresPersonalizado() {
    try {
        const res = await fetch("/api/profes");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        
        const profesores = await res.json();
        const opciones = contenedorProfesor.querySelector('.opciones');
        opciones.innerHTML = '';
        
        // Opción "Todos"
        const todosLi = document.createElement('li');
        todosLi.textContent = 'Todos';
        todosLi.setAttribute('data-value', 'todos');
        todosLi.onclick = function() {
            seleccionarProfesor(this);
        };
        opciones.appendChild(todosLi);
        
        // Opciones de profesores
        profesores.forEach(prof => {
            const li = document.createElement('li');
            li.textContent = prof.nombre_completo;
            li.setAttribute('data-value', prof.id_persona);
            li.onclick = function() {
                seleccionarProfesor(this);
            };
            opciones.appendChild(li);
        });
        
    } catch (err) {
        console.error("Error al cargar profesores:", err);
        mostrarError("Error al cargar la lista de profesores");
    }
}

async function cargarMateriasPersonalizado(idProfesor) {
    try {
        const endpoint = idProfesor === "todos" 
            ? "/api/materias/todas" 
            : `/api/materias/${idProfesor}`;
        
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        
        const materias = await res.json();
        const opciones = contenedorMateria.querySelector('.opciones');
        opciones.innerHTML = '';
        
        // Opción "Todas"
        const todasLi = document.createElement('li');
        todasLi.textContent = 'Todas';
        todasLi.setAttribute('data-value', 'todas');
        todasLi.onclick = function() {
            seleccionarMateria(this);
        };
        opciones.appendChild(todasLi);
        
        // Opciones de materias
        materias.forEach(mat => {
            const li = document.createElement('li');
            li.textContent = mat.nom_materia;
            li.setAttribute('data-value', mat.id_materia);
            li.onclick = function() {
                seleccionarMateria(this);
            };
            opciones.appendChild(li);
        });
        
    } catch (err) {
        console.error("Error al cargar materias:", err);
        mostrarError("Error al cargar la lista de materias");
    }
}

// ------------------- fin llenar selec custom ---------------------



document.addEventListener("DOMContentLoaded", async () => {
    
    inicializarEventosPeriodo();
    inicializarEventosProfesor();
    inicializarEventosMateria();
     await cargarProfesoresPersonalizado();
    await cargarMateriasPersonalizado('todos');


   
    

  const profesorSelect = document.getElementById("profesor");
  const materiaContainer = document.getElementById("materia-container");
  const materiaSelect = document.getElementById("materia");
  const chartContainer = document.getElementById("chart-container");
  const btnPDF = document.getElementById("btnDescargarPDF");
  const CambiarGrafica = document.getElementById("btnCambiarGrafica");

  CambiarGrafica.value = "barras";

 CambiarGrafica.addEventListener("click", () => {
    if (CambiarGrafica.value === "lineas") {
      CambiarGrafica.value = "barras";
      CambiarGrafica.textContent = "Cambiar a Gráfica de Líneas";
    } else {
      CambiarGrafica.value = "lineas";
      CambiarGrafica.textContent = "Cambiar a Gráfica de Barras";
    }
    obtenerDatos(); 
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
  const idProfesor = profesorSeleccc.id || "todos";
  const idMateria = materiaSeleccc.id || "todas";
  const periodo = periodoSeleccc;
  
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
    showLoading(true);

    try {
        // Obtener información del profesor/materia seleccionada con validaciones
        const profesorSeleccionado = (profesorSeleccc && profesorSeleccc.id === "todos") 
            ? "Todos los profesores" 
            : (profesorSeleccc && profesorSeleccc.nombre) ? profesorSeleccc.nombre : "Profesor no especificado";
        
        const materiaSeleccionada = (materiaSeleccc && materiaSeleccc.id === "todas") 
            ? "Todas las materias" 
            : (materiaSeleccc && materiaSeleccc.nombre) ? materiaSeleccc.nombre : "Materia no especificada";
        
        const periodoSeleccionado = periodoSeleccc || "Período no especificado";

        // Crear tabla oculta con los datos
        const tablaOculta = crearTablaOculta();
        document.body.appendChild(tablaOculta);
        
        // Obtener datos para la tabla
        const datosTabla = await obtenerDatosParaTabla();
        
        // Llenar la tabla con los datos
        llenarTablaOculta(tablaOculta, datosTabla);
        
        // Capturar ambos elementos (gráfico y tabla)
        const elementos = [
            { element: chartContainer, type: 'chart' },
            { element: tablaOculta, type: 'table' }
        ];
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Usar fecha actual con formato seguro
        const fechaActual = new Date();
        const fechaFormateada = fechaActual.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) || "fecha-no-disponible";
        
        // Función para calcular el rango de fechas
        function calcularRangoFechas(periodo, fechaInicio = new Date()) {
            const fechaInicioObj = new Date(fechaInicio);
            const fechaFinObj = new Date(fechaInicioObj);
            
            const periodoLower = (periodo || "").toLowerCase();
            
            switch(periodoLower) {
                case 'día':
                case 'dia':
                    fechaFinObj.setDate(fechaInicioObj.getDate());
                    break;
                case 'semana':
                    fechaFinObj.setDate(fechaInicioObj.getDate() + 6);
                    break;
                case 'mes':
                    fechaFinObj.setMonth(fechaInicioObj.getMonth() + 1);
                    fechaFinObj.setDate(0);
                    break;
                case 'semestral':
                    fechaFinObj.setMonth(fechaInicioObj.getMonth() + 6);
                    break;
                case 'año':
                case 'anio':
                    fechaFinObj.setFullYear(fechaInicioObj.getFullYear() + 1);
                    fechaFinObj.setMonth(0);
                    fechaFinObj.setDate(0);
                    break;
                default:
                    fechaFinObj.setDate(fechaInicioObj.getDate());
            }
            
            const formatoFecha = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            return {
                inicio: fechaInicioObj.toLocaleDateString('es-MX', formatoFecha) || "Fecha inicio no disponible",
                fin: fechaFinObj.toLocaleDateString('es-MX', formatoFecha) || "Fecha fin no disponible"
            };
        }

        // Generar título con validaciones
        let titulo = `Reporte de Asistencias - ${fechaFormateada}\n`;
        titulo += `Profesor: ${profesorSeleccionado}\n`;
        titulo += `Materia: ${materiaSeleccionada}\n`;
        
        // Calcular rango de fechas con validación
        const rangoFechas = calcularRangoFechas(periodoSeleccionado, fechaActual);
        titulo += `Período: ${periodoSeleccionado} (Del ${rangoFechas.inicio} al ${rangoFechas.fin})`;
        
        // Dividir el título en líneas
        const tituloLineas = doc.splitTextToSize(titulo, 180);
        let yPos = 10;
        
        // Agregar cada línea del título
        tituloLineas.forEach(linea => {
            doc.text(linea, 10, yPos);
            yPos += 7;
        });
        
        yPos += 5;
        
        // Procesar cada elemento
        for (const item of elementos) {
            const canvas = await html2canvas(item.element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#FFFFFF'
            });
            
            const imgData = canvas.toDataURL("image/png");
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth() - 20;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            if (yPos + pdfHeight > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.addImage(imgData, "PNG", 10, yPos, pdfWidth, pdfHeight);
            yPos += pdfHeight + 10;
        }
        
        // Generar nombre del archivo con validaciones
        const nombreArchivo = `Reporte_${
            (profesorSeleccionado || "sin_profesor").toString().replace(/\s+/g, '_')
        }_${
            (materiaSeleccionada || "sin_materia").toString().replace(/\s+/g, '_')
        }_${
            fechaFormateada.replace(/\//g, '-')
        }.pdf`;
        
        // Guardar y limpiar
        doc.save(nombreArchivo);
        document.body.removeChild(tablaOculta);
        
    } catch (err) {
        console.error("Error al generar PDF:", err);
        mostrarError("Error al generar el PDF");
    } finally {
        showLoading(false);
    }
});

// Función para crear la tabla oculta (mejorada)
function crearTablaOculta() {
    const div = document.createElement('div');
    div.id = 'tabla-oculta-pdf';
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.width = '900px'; // Aumenté el ancho para mejor visualización
    div.style.backgroundColor = '#FFFFFF';
    
    div.innerHTML = `
        <table border="0" style="width:100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background-color: #4a6baf;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Fecha</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Materia</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Horas</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Asistencias</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Faltas</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Retardos</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Detalles</th>
                </tr>
            </thead>
            <tbody id="tabla-oculta-body" style="font-size: 12px;">
                <!-- Datos se llenarán dinámicamente -->
            </tbody>
            <tfoot>
                <tr style="background-color: #f8f9fa;">
                    <td colspan="7" style="padding: 8px; font-size: 11px; text-align: center; border-top: 2px solid #ddd;">
                        Reporte generado el ${new Date().toLocaleDateString()}
                    </td>
                </tr>
            </tfoot>
        </table>
    `;
    
    return div;
}

function llenarTablaOculta(tablaOculta, datos) {
    const tbody = tablaOculta.querySelector('#tabla-oculta-body');
    tbody.innerHTML = '';
    
    // Verificar si hay datos
    if (datos.fechas.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">No hay datos disponibles para el período seleccionado</td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    // Agregar filas con datos
    datos.fechas.forEach((fecha, index) => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #eee';
        row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
        
        // Obtener datos formateados
        const nombreMateria = datos.materias && datos.materias[index] ? datos.materias[index] : materiaSeleccc.nombre || 'Todas las materias';
        const horarios = datos.horarios && datos.horarios[index] ? datos.horarios[index].replace(/;/g, ', ') : 'No especificado';
        const detalles = datos.detalles && datos.detalles[index] ? 
            datos.detalles[index]
                .replace(/;/g, ', ')
                .replace(/Asistencia/g, 'Asis.')
                .replace(/Falta/g, 'Falta.')
                .replace(/Retardo/g, 'Ret.') : '';
        
        row.innerHTML = `
            <td style="padding: 8px; border-bottom: 1px solid #ddd; vertical-align: middle;">${new Date(fecha).toLocaleDateString()}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; vertical-align: middle;">${nombreMateria}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; vertical-align: middle;">${horarios}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; vertical-align: middle; color: #28a745;">${datos.asistencias[index] || 0}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; vertical-align: middle; color: #dc3545;">${datos.faltas[index] || 0}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; vertical-align: middle; color: #ffc107;">${datos.retardos[index] || 0}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; vertical-align: middle; font-size: 11px;">${detalles}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Calcular totales correctamente
    const totalAsistencias = datos.asistencias.reduce((a, b) => Number(a) + Number(b), 0);
    const totalFaltas = datos.faltas.reduce((a, b) => Number(a) + Number(b), 0);
    const totalRetardos = datos.retardos.reduce((a, b) => Number(a) + Number(b), 0);
    const totalClases = totalAsistencias + totalFaltas + totalRetardos;
    const porcentajeAsistencia = totalClases > 0 ? Math.round((totalAsistencias / totalClases) * 100) : 0;
    const porcentajeFaltas = totalClases > 0 ? Math.round((totalFaltas / totalClases) * 100) : 0;
    const porcentajeRetardos = totalClases > 0 ? Math.round((totalRetardos / totalClases) * 100) : 0;
    
    // Agregar fila de totales con porcentaje
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.style.backgroundColor = '#e9ecef';
    totalRow.style.borderTop = '2px solid #dee2e6';
    totalRow.innerHTML = `
        <td colspan="3" style="padding: 10px; border-bottom: 1px solid #ddd;">
            Total General (${porcentajeAsistencia}% de asistencia), (${porcentajeFaltas}% de faltas), (${porcentajeRetardos}% de retardos)
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; color: #28a745;">${totalAsistencias}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; color: #dc3545;">${totalFaltas}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; color: #ffc107;">${totalRetardos}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"></td>
    `;
    tbody.appendChild(totalRow); 
}

async function obtenerDatosParaTabla() {
    const idProfesor = profesorSeleccc.id || "todos";
    const idMateria = materiaSeleccc.id || "todas";
    const periodo = periodoSeleccc;
    
    try {
        const res = await fetch(`/api/reporteGrafica?profesor=${idProfesor}&materia=${idMateria}&periodo=${periodo}&detallado=true`);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        
        const response = await res.json();
        
        if (!response || !response.fechas || !Array.isArray(response.fechas)) {
            throw new Error("Formato de datos incorrecto");
        }
        
        const maxLength = response.fechas.length;
        
        return {
            fechas: response.fechas,
            materias: response.materias || Array(maxLength).fill(materiaSeleccc.nombre || 'Todas las materias'),
            horarios: response.horarios || Array(maxLength).fill('No especificado'),
            detalles: response.detalles || Array(maxLength).fill(''),
            asistencias: response.asistencias ? response.asistencias.map(Number) : Array(maxLength).fill(0),
            faltas: response.faltas ? response.faltas.map(Number) : Array(maxLength).fill(0),
            retardos: response.retardos ? response.retardos.map(Number) : Array(maxLength).fill(0)
        };
        
    } catch (err) {
        console.error("Error al obtener datos para tabla:", err);
        return { 
            fechas: [], 
            materias: [],
            horarios: [],
            detalles: [],
            asistencias: [], 
            faltas: [], 
            retardos: [] 
        };
    }
}

  // Event listeners
contenedorProfesor.addEventListener("change", function() {
    console.log("profe seleccionado:", profesorSeleccc); 
    obtenerDatos();
});

contenedorPeriodo.addEventListener("change", function() {
    console.log("Periodo seleccionado:", periodoSeleccc); 
    obtenerDatos();
});
contenedorMateria.addEventListener("change", function() {
    console.log("materia seleccionado:", materiaSeleccc); 
    obtenerDatos();
});
  // Inicialización
  try {
    await cargarProfesores();
    await cargarMaterias("todos");
    await cargarProfesoresPersonalizado();
    await cargarMateriasPersonalizado('todos');
    await obtenerDatos();
  } catch (err) {
    console.error("Error en inicialización:", err);
    mostrarError("Error al cargar los datos iniciales");
  }


  try {
    response = await fetch("/datos-usuario");
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const usuario = await response.json();
    document.getElementById("usuario").textContent = `Usuario: ${usuario.nom_usuario}`;
    document.getElementById("cargo").textContent = `Cargo: ${usuario.cargo}`;
    document.getElementById("escuela").textContent = `${usuario.nom_escuela}`;
  } catch (err) {
    console.error("Error al obtener datos del usuario:", err);
    mostrarError("Error al cargar los datos del usuario");
  }

});

