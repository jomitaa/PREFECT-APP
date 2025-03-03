document.addEventListener('DOMContentLoaded', () => {

    //--------------------------------------------------------------- CODIGO CONSULTA --------------------------
    const contenedor = document.querySelector('tbody');

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
            contenedor.innerhtml = '<tr><td colspan="10">Error al cargar los datos</td></tr>';
        }
    }

    // Función para mostrar los datos de la consulta en la tabla
    function mostrar(consulta) {
        console.log("Mostrando usuarios:", consulta); // Verifica los datos recibidos del servidor
        let resultados = '';

        // Filtrar los datos según algún criterio si es necesario
        // const consultaFiltrada = consulta.filter(item => item.algunCriterio);

        consulta.forEach(item => {
            const fechaAsistencia = item.fecha_asistencia ? new Date(item.fecha_asistencia).toLocaleDateString('es-ES') : '';

            resultados += `
                <tr name="joma">
                    <td>${item.persona}</td>
                    <td>${item.grupo}</td>
                    <td>${item.materia}</td>
                    <td>${item.dia_horario}</td>
                    <td>${item.hora_inicio} - ${item.hora_final}</td>
                    <td>${fechaAsistencia}</td>
                    
                
            `;

             // Añadir la columna de asistencia solo si es 1
             if (item.asistencia === 1) {
                resultados += `<td><p class="asis"> Asistencia ✓ </p></td>`;
            }

            // Añadir la columna de falta solo si es 1
            if (item.falta === 1) {
                resultados += `<td><p class="fal"> Falta ✓ </p></td>`;
            }

            // Añadir la columna de retardo solo si es 1
            if (item.retardo === 1) {
                resultados += `<td><p class="ret"> Retardo ✓ </p></td>`;
            }

            resultados += `</tr>`;

        });

        // Mostrar los resultados en el contenedor
        contenedor.innerhtml = resultados;

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
        <main class="table" id="customers_table">${customers_table.innerhtml}</main>
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

});
