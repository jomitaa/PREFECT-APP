document.addEventListener("DOMContentLoaded", async () => {

    try {
        const response = await fetch('/api/filtros');
        const data = await response.json();
        
        console.log("Datos recibidos:", data);

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

        llenarSelect('salon', data.salones);
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
        case 'salon':
            label = 'Seleccione un SALÓN';
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


  function checkboxesHandler(event) {
    const checkbox = event.target;
    const id_horario = checkbox.dataset.id;
    const tipo = checkbox.dataset.tipo;

    console.log(
      `Checkbox con id_horario: ${id_horario} y tipo: ${tipo} ha sido activado.`
    );

    // Manejo de bloqueo de checkboxes
    if (checkbox.checked) {
      // Bloquear todos los checkboxes de la misma fila
      document
        .querySelectorAll(`input[data-id="${id_horario}"]`)
        .forEach((cb) => {
          if (cb !== checkbox) {
            cb.disabled = true;
          }
        });
    } else {
      // Desbloquear todos los checkboxes de la misma fila si ninguno está marcado
      const anyChecked = Array.from(
        document.querySelectorAll(`input[data-id="${id_horario}"]`)
      ).some((cb) => cb.checked);

      if (!anyChecked) {
        document
          .querySelectorAll(`input[data-id="${id_horario}"]`)
          .forEach((cb) => {
            cb.disabled = false;
          });
      }
    }
  }

  const limpiarCheckboxes = () => {
    const lastReset = localStorage.getItem("lastReset");
    const today = new Date().toLocaleDateString();
    if (lastReset !== today) {
      localStorage.clear();
      localStorage.setItem("lastReset", today);
    }
  };

  limpiarCheckboxes(); // Limpia las checkboxes al cargar la página

  function checkAndSubmit(event) {
    event.preventDefault(); // Evitar el envío del formulario

    const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach((checkbox) => {
      const id_horario = checkbox.dataset.id;
      if (checkbox.checked && !localStorage.getItem(`checkbox_${id_horario}`)) {
        // Guardar en localStorage para no enviarlo de nuevo
        localStorage.setItem(`checkbox_${id_horario}`, "true");
        checkbox.disabled = true; // Desactivar el checkbox después de enviar

        // Obtener valores de asistencia, retardo y falta
        const validacion_asistencia = document.getElementById(
          `validacion_asistencia_${id_horario}`
        ).checked;
        const validacion_retardo = document.getElementById(
          `validacion_retardo_${id_horario}`
        ).checked;
        const validacion_falta = document.getElementById(
          `validacion_falta_${id_horario}`
        ).checked;

        // Enviar datos al servidor
        fetch("/actualizarDatos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            validacion_asistencia,
            validacion_retardo,
            validacion_falta,
            id_horario,
          }),
        })
          .then((response) => {
            if (response.ok) {
              createToast(
                "Correcto",
                "fa-solid fa-circle-check",
                "Actualización exitosa",
                `Se actualizó correctamente el horario ID: ${id_horario}`
              );
            } else {
              createToast(
                "error",
                "fa-solid fa-circle-exclamation",
                "Error",
                `Hubo un problema al actualizar el horario ID: ${id_horario}`
              );
            }
          })
          .catch((error) => {
            console.error("Error al enviar los datos:", error);
          });
      }
    });
  }

  // Cargar estado de los checkboxes al iniciar la página
  function inicializarCheckboxes() {
    const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach((checkbox) => {
      const id_horario = checkbox.dataset.id;
      if (localStorage.getItem(`checkbox_${id_horario}`) === "true") {
        checkbox.checked = true;
        checkbox.disabled = true;
      }
    });

    const submitButton = document.getElementById("btnEnviar");
    submitButton.addEventListener("click", checkAndSubmit);
  }

  window.onload = function () {
    inicializarCheckboxes();
  };

  //--------------------------------------------------------------- FIN CODIGO CHECKBOX --------------------------



  //--------------------------------------------------------------- CODIGO HORARIO --------------------------

  const contenedor = document.getElementById("horario");

  async function fetchHorarios() {
    try {
      const response = await fetch("/api/horarios");
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      const horarios = await response.json();
      mostrar(horarios);
    } catch (error) {
      console.error("Error al obtener los horarios:", error);
      contenedor.innerHTML =
        '<tr><td colspan="6">Error al cargar los horarios</td></tr>';
    }
  }

  function mostrar(horarios) {
    let resultados = "";

    const horariosSemestre2 = horarios.filter(
      (horario) => horario.sem_grupo === 6
    );

    horariosSemestre2.forEach((horario) => {
      resultados += `
            <div class="horario-card">
                <div class="horario-header">
                        <span><b>Salón</b></span>
                        <span><b>Grupo</b></span>
                        <span><b>Profesor</b></span>
                        <span><b>Materia</b></span>
                        <span><b>Hora</b></span>
                        <span><b>Acciones</b></span>
                    </div>
                    <div class="horario-content">
                        <span>${horario.id_salon}</span>
                        <span>${horario.nom_grupo}</span>
                        <span>${horario.nombre_persona}</span>
                        <span>${horario.nom_materia}</span>
                        <span>${horario.hora_inicio} - ${horario.hora_final}</span>
                        <div class="acciones">
                         <form onsubmit="checkAndSubmit(event)" class="acciones">
                            <label class="container">
                                <input type="checkbox" class="checkbox" id="validacion_asistencia_${horario.id_horario}" data-tipo="asistencia" data-id="${horario.id_horario}">
                                <div class="checkmark"></div>
                                Asis.
                            </label>

                            <label class="container">
                                <input type="checkbox" class="checkbox" id="validacion_retardo_${horario.id_horario}" data-tipo="retardo" data-id="${horario.id_horario}">
                                <div class="checkmark"></div>
                                Retardo
                            </label>

                            <label class="container">
                                <input type="checkbox" class="checkbox" id="validacion_falta_${horario.id_horario}" data-tipo="falta" data-id="${horario.id_horario}">
                                <div class="checkmark"></div>
                                Falta
                            </label>
                            <input type="hidden" class="checkbox" id="id_horario_${horario.id_horario}" value="${horario.id_horario}">
                        </form>

                        </div>
                    </div>
                </div>

            `;
    });

    contenedor.innerHTML = resultados;

    document.getElementById("filterBtn").replaceWith(document.getElementById("filterBtn").cloneNode(true));
    document.getElementById("filterBtn").addEventListener("click", filtrarHorarios);
    
    async function filtrarHorarios() {
        const salon = document.getElementById("salon").value.trim();
        const grupo = document.getElementById("grupo").value;
        const profesor = document.getElementById("profesor").value;
        const materia = document.getElementById("materia").value;
        const horaInicio = document.getElementById("horaInicio").value;
        const horaFin = document.getElementById("horaFin").value;
    
        try {
            const response = await fetch("/api/horarios");
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const horarios = await response.json();
    
            const horariosSemestre2 = horarios.filter(
                (horario) => horario.sem_grupo === 6
            );
    
            const horariosFiltrados = horariosSemestre2.filter(horario => {
                return (
                    (!salon || String(horario.id_salon).trim() === String(salon).trim()) &&
                    (!grupo || horario.nom_grupo === grupo) &&
                    (!profesor || horario.nombre_persona === profesor) &&
                    (!materia || horario.nom_materia === materia) &&
                    (!horaInicio || horario.hora_inicio === horaInicio) &&
                    (!horaFin || horario.hora_final === horaFin)
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
                return;  // 👈 Evita ejecutar más código
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
    

    window.onload();

    

    const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach((checkbox, index) => {
      const id_horario = checkbox.dataset.id;
      if (localStorage.getItem(`checkbox_${id_horario}`) === "true") {
        checkbox.checked = true;
        checkbox.disabled = true;
      }

      // Agregar el manejador de eventos para los checkboxes
      checkbox.addEventListener("change", checkboxesHandler);
    });

    const submitButton = document.getElementById("btnEnviar");
    submitButton.addEventListener("click", checkAndSubmit);
  }

  fetchHorarios();

  //------------------------------------------------------------ FIN CODIGO HORARIO -----------------------------------

  // ---------------------------------------------------------------  CODIGO DE BUSCADOR  -------------------------------

  const search = document.querySelector(".input-group input"),
    table_rows = document.getElementsByName("joma"),
    table_headings = document.querySelectorAll("thead th");

  // 1. BUSCAR EN LA TABLA
  search.addEventListener("input", searchTable);

  function searchTable() {
    table_rows.forEach((row, i) => {
      let table_data = row.textContent.toLowerCase(),
        search_data = search.value.toLowerCase();

      row.classList.toggle("hide", table_data.indexOf(search_data) < 0);
      row.style.setProperty("--delay", i / 25 + "s");
    });

    document
      .querySelectorAll("tbody tr:not(.hide)")
      .forEach((visible_row, i) => {
        visible_row.style.backgroundColor =
          i % 2 == 0 ? "transparent" : "#0000000b";
      });
  }

  // 2. ORDENAR TABLA

  table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
      table_headings.forEach((head) => head.classList.remove("active"));
      head.classList.add("active");

      document
        .querySelectorAll("td")
        .forEach((td) => td.classList.remove("active"));
      table_rows.forEach((row) => {
        row.querySelectorAll("td")[i].classList.add("active");
      });

      head.classList.toggle("asc", sort_asc);
      sort_asc = head.classList.contains("asc") ? false : true;

      sortTable(i, sort_asc);
    };
  });

  function sortTable(column, sort_asc) {
    [...table_rows]
      .sort((a, b) => {
        let first_row = a
            .querySelectorAll("td")
            [column].textContent.toLowerCase(),
          second_row = b
            .querySelectorAll("td")
            [column].textContent.toLowerCase();

        return sort_asc
          ? first_row < second_row
            ? 1
            : -1
          : first_row < second_row
          ? -1
          : 1;
      })
      .map((sorted_row) =>
        document.querySelector("tbody").appendChild(sorted_row)
      );
  }

  // 3. PDF

  const pdf_btn = document.querySelector("#toPDF");
  const customers_table = document.querySelector("#customers_table");

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
  };

  pdf_btn.onclick = () => {
    toPDF(customers_table);
  };

  // 4. JSON

  const json_btn = document.querySelector("#toJSON");

  const toJSON = function (table) {
    let table_data = [],
      t_head = [],
      t_headings = table.querySelectorAll("th"),
      t_rows = table.querySelectorAll("tbody tr");

    for (let t_heading of t_headings) {
      let actual_head = t_heading.textContent.trim().split(" ");

      t_head.push(
        actual_head
          .splice(0, actual_head.length - 1)
          .join(" ")
          .toLowerCase()
      );
    }

    t_rows.forEach((row) => {
      const row_object = {},
        t_cells = row.querySelectorAll("td");

      t_cells.forEach((t_cell, cell_index) => {
        const img = t_cell.querySelector("img");
        if (img) {
          row_object["customer image"] = decodeURIComponent(img.src);
        }
        row_object[t_head[cell_index]] = t_cell.textContent.trim();
      });
      table_data.push(row_object);
    });

    return JSON.stringify(table_data, null, 4);
  };

  json_btn.onclick = () => {
    const json = toJSON(customers_table);
    downloadFile(json, "json");
  };

  // --------------------------------------------------------------- FIN CODIGO DE BUSCADOR  -------------------------------

