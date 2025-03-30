document.addEventListener('DOMContentLoaded', async () => {

    try {
        const response = await fetch('/api/filtros');
        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                `No se encontraron datos para llenar los filtros.`
              );
            console.error("Los datos están vacíos o no tienen la estructura esperada.");
            return;
        }

        llenarSelect('dia', data.dias);
        llenarSelect('grupo', data.grupos);
        llenarSelect('profesor', data.profesores);
        llenarSelect('materia', data.materias);
        llenarSelect('horaInicio', data.horasInicio);
        llenarSelect('horaFin', data.horasFin);

    } catch (error) {
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            `Hubo un problema al cargar los filtros.`
          );
        console.error('Error al cargar los filtros:', error);
    }
});

// ✅ Función para llenar selects
function llenarSelect(id, datos) {
    const select = document.getElementById(id);
    if (!select) {
        console.error(`No se encontró el select con ID: ${id}`);
        return;
    }

    // Aquí cambiamos el texto que aparece en la opción por defecto
    let label = '';
    switch (id) {
        case 'dia':
            label = 'Seleccione un DIA';
            break;
        case 'grupo':
            label = 'Seleccione un GRUPO';
            break;
        case 'profesor':
            label = 'Seleccione un PROFESOR';
            break;
        case 'materia':
            label = 'Seleccione una MATERIA';
            break;
        case 'horaInicio':
            label = 'Seleccione la HORA INICIO';
            break;
        case 'horaFin':
            label = 'Seleccione la HORA FIN';
            break;
        default:
            label = 'Seleccione una opción';
    }

    // Agregamos la opción por defecto con el texto correcto
    select.innerHTML = `<option value="">${label}</option>`;

    // Llenamos el select con las opciones recibidas
    datos.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

let alerta = document.querySelector(".alerta");

function createToast(type, icon, title, text) {
    let newToast = document.createElement("div");
    newToast.innerHTML = `
        <div class="toast ${type}">
            <div class="icono">
                <i class="${icon}"></i>
            </div>
            <div class="content">
                <div class="title">${title}</div>
                <span>${text}</span>
            </div>
            <i style="cursor: pointer;" class="close fa-solid fa-xmark"
               onclick="(this.parentElement).remove()"></i>
        </div>`;

    alerta.appendChild(newToast);
    newToast.timeOut = setTimeout(() => newToast.remove(), 5000);
}



    //--------------------------------------------------------------- CODIGO CONSULTA --------------------------
    const contenedor = document.getElementById("horario");

    // Función para obtener los datos de la consulta
    async function fetchConsulta() {
        try {
            const response = await fetch('/api/consulta');
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const consulta = await response.json();
            mostrar(consulta);
        } catch (error) {
            console.error('Error al obtener los datos de la consulta:', error);
            contenedor.innerHTML = '<tr><td colspan="10">Error al cargar los datos</td></tr>';
        }
    }

    // Función para mostrar los datos de la consulta en la tabla
    function mostrar(consulta) {
        console.log("Mostrando usuarios:", consulta); // Verifica los datos recibidos del servidor
        let resultados = '';

        // Filtrar los datos según algún criterio si es necesario
        // const consultaFiltrada = consulta.filter(item => item.algunCriterio);

        consulta.forEach(item => {
            resultados += `
                
                <div class="horario-card">
						<div class="horario-header">
							<span><b>Grupo</b></span>
							<span><b>Profesor</b></span>
							<span><b>Materia</b></span>
							<span><b>Hora</b></span>
                            <span><b>Fecha</b></span>
							<span><b>Fecha</b></span>
							<span><b>Estado</b></span>
						</div>
						<div class="horario-content">
							<span>${item.grupo}</span>
							<span>${item.persona}</span>
							<span>${item.materia}</span>
							<span>${item.hora_inicio} - ${item.hora_final}</span>
                            <span>${item.dia_horario}</span>
							<span>${item.fecha_asistencia}</span>
						
                
            `;

             // Añadir la columna de asistencia solo si es 1
             if (item.asistencia === 1) {
                resultados += `<span class="asis">Asistencia</span>`;
            }

            // Añadir la columna de falta solo si es 1
            if (item.falta === 1) {
                resultados += `<span class="falta">Falta</span>`;
            }

            // Añadir la columna de retardo solo si es 1
            if (item.retardo === 1) {
                resultados += `<span class="ret">Retardo</span>`;
            }

            resultados += `</div>
					</div>`;

        });

        // Mostrar los resultados en el contenedor
        contenedor.innerHTML = resultados;


        document.getElementById("filterBtn").replaceWith(document.getElementById("filterBtn").cloneNode(true));
    document.getElementById("filterBtn").addEventListener("click", filtrarHorarios);
    
    async function filtrarHorarios() {
        const grupo = document.getElementById("grupo").value;
        const dia = document.getElementById("dia").value;
        const fecha = document.getElementById("fecha").value;
        const registro_asis = document.getElementById("asistencia").value;
        const profesor = document.getElementById("profesor").value;
        const materia = document.getElementById("materia").value;
        const horaInicio = document.getElementById("horaInicio").value;
        const horaFin = document.getElementById("horaFin").value;
    
        try {
            const response = await fetch("/api/consulta");
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const consulta = await response.json();
            
    
            const horariosFiltrados = consulta.filter(consulta => {

                const fechaAsistencia = consulta.fecha_asistencia; 

                const [year, month, day] = fecha.split("-"); // Separa la fecha en partes
                const fechaUsuario = `${day}/${month}/${year.slice(-2)}`;


                console.log("Fecha de asistencia:", fechaAsistencia);
                console.log("Fecha convertida:", fechaUsuario);

                const estadoAsistencia = consulta.asistencia; // 1 si tiene asistencia
                const estadoRetardo = consulta.retardo; // 1 si tiene retardo
                const estadoFalta = consulta.falta; // 1 si tiene falta

                const filtroAsistencia = registro_asis === "asis" ? estadoAsistencia === 1 :
                                     registro_asis === "ret" ? estadoRetardo === 1 :
                                     registro_asis === "falt" ? estadoFalta === 1 :
                                     true;

                return (
                    (!grupo || consulta.grupo === grupo) &&
                    (!dia || consulta.dia_horario === dia) &&
                    (!profesor || consulta.persona === profesor) &&
                    (!fecha || fechaAsistencia === fechaUsuario) && // Comparación de fechas sin la hora
                    (!materia || consulta.materia === materia) &&
                    (!horaInicio || consulta.hora_inicio === horaInicio) &&
                    (!horaFin || consulta.hora_final === horaFin) &&
                    filtroAsistencia
                );
            });
    
            if (horariosFiltrados.length === 0) {
                console.log("No se encontraron horarios que coincidan con los filtros.");
                createToast(
                    "advertencia",
                    "fa-solid fa-triangle-exclamation",
                    "Aguas",
                    "No se encontraron horarios que coincidan con los filtros seleccionados."
                );
                return; 
            }
    
            mostrar(horariosFiltrados);
        } catch (error) {
            console.error("Error al obtener los horarios:", error);
            createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                "Hubo un problema al cargar los horarios."
            );
            document.getElementById("horario").innerHTML =
                '<tr><td colspan="6">Error al cargar los horarios</td></tr>';
        }
    }

    document.getElementById("resetFiltersButton").addEventListener("click", function() {
        // Restablece todos los filtros a su estado inicial
        document.getElementById("grupo").value = "";
        document.getElementById("dia").value = "";
        document.getElementById("fecha").value = "";
        document.getElementById("asistencia").value = "";
        document.getElementById("profesor").value = "";
        document.getElementById("materia").value = "";
        document.getElementById("horaInicio").value = "";
        document.getElementById("horaFin").value = "";
    
        filtrarHorarios();
    });
    

    }
    
    

    fetchConsulta();

    //------------------------------------------------------------ FIN CODIGO CONSULTA -----------------------------------

// ---------------------------------------------------------------  CODIGO DE BUSCADOR  -------------------------------

const search = document.querySelector('.input-group input'),
            table_rows = document.getElementsByName('joma'),
            table_headings = document.querySelectorAll('thead th');

        // 1. BUSCAR EN LA TABLA
        search.addEventListener('input', searchTable);

        function searchTable() {
            table_rows.forEach((row, i) => {
                let table_data = row.textContent.toLowerCase(),
                    search_data = search.value.toLowerCase();

                row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
                row.style.setProperty('--delay', i / 25 + 's');
            })

            document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
                visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
            });
        }

        // 2. ORDENAR TABLA

        table_headings.forEach((head, i) => {
            let sort_asc = true;
            head.onclick = () => {
                table_headings.forEach(head => head.classList.remove('active'));
                head.classList.add('active');

                document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
                table_rows.forEach(row => {
                    row.querySelectorAll('td')[i].classList.add('active');
                })

                head.classList.toggle('asc', sort_asc);
                sort_asc = head.classList.contains('asc') ? false : true;

                sortTable(i, sort_asc);
            }
        })


        function sortTable(column, sort_asc) {
            [...table_rows].sort((a, b) => {
                let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
                    second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

                return sort_asc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
            })
                .map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
        }



// 3. PDF

const pdf_btn = document.querySelector('#toPDF');
const customers_table = document.querySelector('#customers_table');

const toPDF = function (customers_table) {
    const html_code = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" type="text/css" href="../public/css/PRF_1ER_PISO.css">
    </head>
    <body>
        <main class="table" id="customers_table">${customers_table.innerHTML}</main>
    </body>
    </html>`;

    const new_window = window.open();
    new_window.document.write(html_code);

    setTimeout(() => {
        new_window.print();
        new_window.close();
    }, 1000); 
}

pdf_btn.onclick = () => {
    toPDF(customers_table);
}

// 4. JSON

const json_btn = document.querySelector('#toJSON');

const toJSON = function (table) {
    let table_data = [],
        t_head = [],

        t_headings = table.querySelectorAll('th'),
        t_rows = table.querySelectorAll('tbody tr');

    for (let t_heading of t_headings) {
        let actual_head = t_heading.textContent.trim().split(' ');

        t_head.push(actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase());
    }

    t_rows.forEach(row => {
        const row_object = {},
            t_cells = row.querySelectorAll('td');

        t_cells.forEach((t_cell, cell_index) => {
            const img = t_cell.querySelector('img');
            if (img) {
                row_object['customer image'] = decodeURIComponent(img.src);
            }
            row_object[t_head[cell_index]] = t_cell.textContent.trim();
        })
        table_data.push(row_object);
    })

    return JSON.stringify(table_data, null, 4);
}

json_btn.onclick = () => {
    const json = toJSON(customers_table);
    downloadFile(json, 'json')
}

// --------------------------------------------------------------- FIN CODIGO DE BUSCADOR  -------------------------------

