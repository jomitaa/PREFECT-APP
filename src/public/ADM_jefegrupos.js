

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




let grupoSeleccionado = {    id: '',
    nombre: 'Seleccione el grupo al que pertenece:'
};
let grupofiltroSeleccionado = 'todos';
let jefeSeleccionado = 'todos';
let grupoJefeSeleccionado = {
    id: '',
    nombre: 'Selecciona un grupo'
};



const contenedorGrupo = document.querySelector('.contenedor-select[data-type="grupo"]');
const contenedorGrupoFiltro = document.querySelector('.contenedor-select[data-type="grupo_filtro"]');
const contenedorJefe = document.querySelector('.contenedor-select[data-type="jefes"]');
const contenedorGrupoJefe = document.querySelector('.contenedor-select[data-type="grupo_jefe"]');


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


function llenarSelect(tipo, datos, idValue, idText) {
            const contenedor = document.querySelector(`.contenedor-select[data-type="${tipo}"]`);
            if (!contenedor) {
                console.error(`No se encontró el select con tipo: ${tipo}`);
                return;
            }
        
            const opciones = contenedor.querySelector('.opciones');
            opciones.innerHTML = '';

             
        const limpiarLi = document.createElement('li');
        limpiarLi.className = 'limpiar-seleccion';
        limpiarLi.innerHTML = '<i class="fas fa-times-circle"></i> Limpiar selección';
        limpiarLi.onclick = function() {
            limpiarFiltro(tipo, contenedor);
        };
        opciones.appendChild(limpiarLi);
    
        
             datos.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item[idText];
                li.setAttribute('data-value', item[idValue]);
                li.onclick = function() {
                    seleccionarOpcionFiltro(this, tipo);
                };
                opciones.appendChild(li);
            });
        }

     


        function seleccionarOpcionFiltro(opcion, tipo) {
            // Animación
            opcion.style.transform = 'scale(0.98)';
            setTimeout(() => opcion.style.transform = '', 150);
            
            // Actualizar variable correspondiente
            switch(tipo) {
                case 'grupo_filtro': grupofiltroSeleccionado = opcion.dataset.value; break;
                case 'jefes': jefeSeleccionado = opcion.dataset.value; break;
              
            }
            
            // Actualizar UI
            const contenedor = opcion.closest('.contenedor-select');
            contenedor.querySelector('.boton-select span').textContent = opcion.textContent;
            
            // Marcar como seleccionado
            contenedor.querySelectorAll('.opciones li').forEach(li => {
                li.classList.remove('seleccionado');
            });
            opcion.classList.add('seleccionado');
            contenedor.classList.add('filtro-activo');
            
            // Cerrar select
            cerrarSelect(contenedor);
        }

        function limpiarFiltro(tipo, contenedor) {
    if (!contenedor) return;
    
    // Limpiar la variable correspondiente
    switch(tipo) {
        case 'grupo_filtro': grupofiltroSeleccionado = 'todos'; break;
        case 'jefes': jefeSeleccionado = 'todos'; break;
      
    }
    
    // Actualizar UI
    const defaultText = tipo === 'grupos' ? 'Todos los grupos' : 'Todos los jefes';
    const botonSelect = contenedor.querySelector('.boton-select');
    
    const span = contenedor.querySelector('.boton-select span');
    if (span) span.textContent = defaultText;
    
    // Limpiar selección visual
    contenedor.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    contenedor.classList.remove('filtro-activo');
    
    // Cerrar el select
    cerrarSelect(contenedor);
    
    // Volver a filtrar
}


function inicializarEventosFiltros() {
            const contenedores = [
                contenedorGrupoFiltro,
                contenedorJefe
            ];
        
            contenedores.forEach(contenedor => {
                if (!contenedor) return;
        
                const botonSelect = contenedor.querySelector('.boton-select');
                const inputBusqueda = contenedor.querySelector('.buscador input');
                const opciones = contenedor.querySelector('.opciones');
                const tipo = contenedor.dataset.type;
        
                // Abrir/cerrar select
                botonSelect.addEventListener('click', (e) => {
                    e.stopPropagation();
                    contenedor.classList.toggle('activo');
                    
                    if (contenedor.classList.contains('activo') && inputBusqueda) {
                        inputBusqueda.focus();
                    }
                });
        
                // Búsqueda
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
        
               
            });
        
            
            // Cerrar selects al hacer clic fuera
           document.addEventListener('click', (e) => {
    contenedores.forEach(contenedor => {
        if (contenedor && !contenedor.contains(e.target)) {
            cerrarSelect(contenedor);
        }
    });
});
            
                    }







function seleccionarGrupo(opcion) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    
    // Actualizar variable y UI
     grupoSeleccionado = {
        id: opcion.dataset.value,
        nombre: opcion.textContent
    };


    contenedorGrupo.querySelector('.boton-select span').textContent = opcion.textContent;
    
    // Marcar como seleccionado
    contenedorGrupo.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    opcion.classList.add('seleccionado');
    
    cerrarSelect(contenedorGrupo);
    
    
                 const event = new Event('change');

    contenedorGrupo.dispatchEvent(event);
}

function inicializarEventosGrupos() {
    const botonSelect = contenedorGrupo.querySelector('.boton-select');
    const contenidoSelect = contenedorGrupo.querySelector('.contenido-select');
    const inputBusqueda = contenedorGrupo.querySelector('.buscador input');
                        const opciones = contenedorGrupo.querySelector('.opciones');


    
    // Evento para abrir/cerrar el select
    botonSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        contenedorGrupo.classList.toggle("activo");

         if (contenedorGrupo.classList.contains('activo') && inputBusqueda) {
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
    const opcionesGrupo = contenedorGrupo.querySelectorAll('.opciones li');
    opcionesGrupo.forEach(opcion => {
        opcion.onclick = function() {
            seleccionarGrupo(this);
        };
    });

    
}


async function cargarGruposPersonalizado() {
    try {
        const res = await fetch("/obtener-datos-horarios");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        
        const data = await res.json();
        const opciones = contenedorGrupo.querySelector('.opciones');
        opciones.innerHTML = '';
        

        // Opciones de profesores
        data.grupos.forEach(grupo => {
            const li = document.createElement('li');
            li.textContent = grupo.nom_grupo
            li.setAttribute('data-value', grupo.id_grupo);
            li.onclick = function() {
                seleccionarGrupo(this);
            };
            opciones.appendChild(li);
        });
        
    } catch (err) {
        console.error("Error al cargar profesores:", err);
        mostrarError("Error al cargar la lista de profesores");
    }
}
  const contenedor = document.querySelector('.todo');



document.addEventListener('DOMContentLoaded', async () => {

    try {
        const response = await fetch('/jefes-filtro');
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

       
        llenarSelect('grupo_filtro', data.grupo_filtro, 'id_grupo', 'nom_grupo');
        llenarSelect('jefes', data.jefes, 'id_jefe', 'nombre_completo');

    } catch (error) {
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            `Hubo un problema al cargar los filtros.`
          );
        console.error('Error al cargar los filtros:', error);
    }
    inicializarEventosGrupos();
    await cargarGruposPersonalizado();
    inicializarEventosFiltros();

        document.getElementById("filterBtn").replaceWith(document.getElementById("filterBtn").cloneNode(true));
filterBtn.removeEventListener("click", filtrarJefes); 
    document.getElementById("filterBtn").addEventListener("click", filtrarJefes);

  const modal = document.querySelector('.modal');
  const modal2 = document.querySelector('.modal2');
    const modal3 = document.querySelector('.modal3');
  const modalClose = document.querySelector('.modal__close');
  const modalClose2 = document.querySelector('.modal__close2');
    const modalClose3 = document.querySelector('.modal__close3');
  const btnEditar = document.querySelector('.btnEditar');
  const btnBorrar = document.querySelector('.btnBorrar');
  const inputNombre = document.querySelector('#nombreEditar');
    const inputAppat = document.querySelector('#appatEditar');
    const inputApmat = document.querySelector('#apmatEditar');
    const inputBoleta = document.querySelector('#boletaEditar');
        const inputCorreo = document.querySelector('#correoEditar');

  const alertaExito = document.querySelector('.alerta-exito');
  const alertaError = document.querySelector('.alerta-error');

  const btnCrear = document.querySelector('.crearBtn');
  const correoJefe = document.querySelector('#correoJefe');
    const mandarCorreo = document.querySelector('#mandarCorreoJefe');


  let usuarioSeleccionadoId = null;


   



  async function cargarUsuarios() {
    try {
      const res = await fetch('/api/jefes');
      const usuarios = await res.json();
      contenedor.innerHTML = '';

      usuarios.forEach(usuario => {
        const divList = document.createElement('div');
        divList.className = 'list';

        const divUser = document.createElement('div');
        divUser.className = 'user';

        const divImgBx = document.createElement('div');
        divImgBx.className = 'imgBx';
        divImgBx.innerHTML = '<i class="bx bx-user"></i>';

        const divDetails = document.createElement('div');
        divDetails.className = 'details';
        divDetails.innerHTML = `
          <h3>${usuario.nom_grupo}</h3>
          <p>Cargo: ${usuario.nombre_completo}</p>
        `;

        divUser.appendChild(divImgBx);
        divUser.appendChild(divDetails);

        const divNavigation = document.createElement('div');
        divNavigation.className = 'navigation';
        divNavigation.innerHTML = `
          <span onclick="abrirModal('${usuario.id_jefe}', '${usuario.nom_jefe}','${usuario.appat_jefe}', '${usuario.apmat_jefe}', '${usuario.boleta}', '${usuario.correo || ''}', '${usuario.id_grupo || ''}', '${usuario.nom_grupo || ''}')">
            <i class="bx bx-edit"></i>
          </span>
          <span onclick="abrirModalBorrar('${usuario.id_jefe}')">
            <i class="bx bx-trash"></i>
          </span>
        `;

        divList.appendChild(divUser);
        divList.appendChild(divNavigation);
        contenedor.appendChild(divList);
      });
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }




  }

  window.abrirModal = (id, nombre, appat, apmat, boleta, correo, id_grupo, nom_grupo) => {
     inicializarEventosGruposJefe();
    cargarGruposPersonalizadoJefe();

    usuarioSeleccionadoId = id;
    inputNombre.value = nombre;
    inputAppat.value = appat; 
    inputApmat.value = apmat; 
    inputBoleta.value = boleta; // Asignar el ID como boleta
    inputCorreo.value = correo;

    grupoJefeSeleccionado.id = id_grupo || '';
    grupoJefeSeleccionado.nombre = nom_grupo || 'Selecciona un grupo';
    console.log('Grupo del jefe de grupo:', grupoJefeSeleccionado);

        contenedorGrupoJefe.querySelector('.boton-select span').textContent = grupoJefeSeleccionado.nombre;



function seleccionarGrupoJefe(opcion) {
    // Animación
    opcion.style.transform = 'scale(0.98)';
    setTimeout(() => opcion.style.transform = '', 150);
    
    // Actualizar variable y UI
     grupoJefeSeleccionado = {
        id: opcion.dataset.value,
        nombre: opcion.textContent
    };


    contenedorGrupoJefe.querySelector('.boton-select span').textContent = opcion.textContent;
    
    // Marcar como seleccionado
    contenedorGrupoJefe.querySelectorAll('.opciones li').forEach(li => {
        li.classList.remove('seleccionado');
    });
    opcion.classList.add('seleccionado');
    
    cerrarSelect(contenedorGrupoJefe);
    
    
                 const event = new Event('change');

    contenedorGrupoJefe.dispatchEvent(event);
}

function inicializarEventosGruposJefe() {
    const botonSelect = contenedorGrupoJefe.querySelector('.boton-select');
    const contenidoSelect = contenedorGrupoJefe.querySelector('.contenido-select');
    const inputBusqueda = contenedorGrupoJefe.querySelector('.buscador input');
                        const opciones = contenedorGrupoJefe.querySelector('.opciones');


    
    // Evento para abrir/cerrar el select
    botonSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        contenedorGrupoJefe.classList.toggle("activo");

         if (contenedorGrupoJefe.classList.contains('activo') && inputBusqueda) {
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
    const opcionesGrupoJefe = contenedorGrupoJefe.querySelectorAll('.opciones li');
    opcionesGrupoJefe.forEach(opcion => {
        opcion.onclick = function() {
            seleccionarGrupoJefe(this);
        };
    });

    
}


async function cargarGruposPersonalizadoJefe() {
    try {
        const res = await fetch("/obtener-datos-horarios");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        
        const data = await res.json();
        const opciones = contenedorGrupoJefe.querySelector('.opciones');
        opciones.innerHTML = '';
        

        // Opciones de profesores
        data.grupos.forEach(grupo => {
            const li = document.createElement('li');
            li.textContent = grupo.nom_grupo
            li.setAttribute('data-value', grupo.id_grupo);
            li.onclick = function() {
                seleccionarGrupoJefe(this);
            };
            opciones.appendChild(li);
        });
        
    } catch (err) {
        console.error("Error al cargar profesores:", err);
        mostrarError("Error al cargar la lista de profesores");
    }
}

        modal.classList.add('modal--show');

  };

  window.abrirModalBorrar = (id) => {
    usuarioSeleccionadoId = id;
    modal2.classList.add('modal--show2');
  };

btnCrear.addEventListener('click', () => {
    modal3.classList.add('modal--show3');
  });

  modalClose.addEventListener('click', () => {
    modal2.classList.remove('modal--show2');
  });

  modalClose2.addEventListener('click', () => {
    modal.classList.remove('modal--show');
  });

    modalClose3.addEventListener('click', () => {
    modal3.classList.remove('modal--show3');
  });

  const emailRegexIPN = /^[a-zA-Z0-9_.+-]+@(alumno\.)?ipn\.mx$/i;



  btnEditar.addEventListener('click', async () => {
    const nuevoNombre = inputNombre.value.trim();
    const nuevoAppat = inputAppat.value.trim();
    const nuevoApmat = inputApmat.value.trim();

    const nuevoCorreo = inputCorreo.value.trim();
    if ( nuevoCorreo && !emailRegexIPN.test(nuevoCorreo)) {
      alertaError.textContent = 'El correo debe ser institucional del IPN'
      alertaError.classList.add('show');
      setTimeout(() => alertaError.classList.remove('show'), 3000);
      return;
    }
    const nuevaBoleta = inputBoleta.value.trim();
    const nuevoGrupo = grupoJefeSeleccionado.id;

    console.log('Datos a enviar:', {
      nuevoNombre,
      nuevoAppat,
      nuevoApmat,
      nuevoCorreo,
      nuevaBoleta,
      nuevoGrupo
    });

    if (!nuevoNombre || !nuevoCorreo || !nuevaBoleta || !nuevoAppat || !nuevoApmat || !nuevoGrupo) {
      alertaError.textContent = 'Todos los campos son obligatorios.';
      alertaError.classList.add('show');
      return;
    }

    try {
      alertaError.classList.remove('show');
      alertaExito.classList.remove('show');

      const res = await fetch(`/api/editarjefe/${usuarioSeleccionadoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: nuevoNombre,
          userEmail: nuevoCorreo,
            userBoleta: nuevaBoleta,
            userAppat: nuevoAppat,
            userApmat: nuevoApmat,
          userGrupo: nuevoGrupo
        })
      });

      const data = await res.json();

      if (res.ok) {
        alertaExito.textContent = 'Usuario editado exitosamente.';
        alertaExito.classList.add('show');
        modal.classList.remove('modal--show');
        cargarUsuarios();
      } else {
        alertaError.textContent = data.error || 'Error inesperado al editar.';
        alertaError.classList.add('show');
      }
    } catch (error) {
      alertaError.textContent = 'Error de conexión al editar.';
      alertaError.classList.add('show');
    }
  });


  btnBorrar.addEventListener('click', async () => {
    try {
      const res = await fetch(`/api/editarjefe/${usuarioSeleccionadoId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alertaExito.textContent = 'Usuario eliminado.';
        alertaExito.classList.add('show');
        modal2.classList.remove('modal--show2');
        cargarUsuarios();
      } else {
        alertaError.textContent = 'No se pudo eliminar el usuario.';
        alertaError.classList.add('show');
      }
    } catch (err) {
      alertaError.textContent = 'Error de conexión al borrar.';
      alertaError.classList.add('show');
    }
  });

  window.cerrarSesion = async () => {
    try {
      const res = await fetch('/logout', { method: 'POST' });
      if (res.ok) window.location.href = '/pages/login.html';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  cargarUsuarios();




  // Evento para el botón "Mandar correo para crear"
document.getElementById('mandarCorreoJefe').addEventListener('click', async function() {
    const correo = document.getElementById('correoJefe').value.trim();
    const grupoId = grupoSeleccionado.id;
    const grupoNombre = grupoSeleccionado.nombre;
    const alertaError = document.querySelector('.modal3 .alerta-error');
    const alertaExito = document.querySelector('.modal3 .alerta-exito');

    // Validaciones
    if (!correo || !grupoId) {
        alertaError.textContent = 'Por favor, complete todos los campos.';
        alertaError.classList.add('show');
        alertaExito.classList.remove('show');
        return;
    }

   if ( correo && !emailRegexIPN.test(correo)) {
      alertaError.textContent = 'El correo debe ser institucional del IPN'
      alertaError.classList.add('show');
      setTimeout(() => alertaError.classList.remove('show'), 3000);
      return;
    }

    try {
        // Enviar datos al servidor
        const response = await fetch('/api/enviar-correo-jefe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo,
                grupoId,
                grupoNombre
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito
            alertaExito.textContent = 'Correo enviado exitosamente. El jefe podrá completar su registro mediante el enlace.';
            alertaExito.classList.add('show');
            alertaError.classList.remove('show');
            
            // Limpiar campos y cerrar modal después de 3 segundos
            setTimeout(() => {
                document.getElementById('correoJefe').value = '';
                grupoSeleccionado = {
                    id: '',
                    nombre: 'Seleccione el grupo al que pertenece:'
                };
                document.querySelector('.contenedor-select[data-type="grupo"] .boton-select span').textContent = grupoSeleccionado.nombre;
                modal3.classList.remove('modal--show3');
                alertaExito.classList.remove('show');
            }, 3000);
        } else {
            throw new Error(data.message || 'Error al enviar el correo');
        }
    } catch (error) {
        console.error('Error:', error);
        alertaError.textContent = error.message || 'Error al conectar con el servidor.';
        alertaError.classList.add('show');
        alertaExito.classList.remove('show');
    }
});


});

document.getElementById('toggleSidebar').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  const body = document.body;

  sidebar.classList.toggle('collapsed');
  body.classList.toggle('menu-colapsado');
});


async function fetchConsulta() {
        try {
            const response = await fetch('/api/jefes');
            const contentType = response.headers.get('content-type');
            
            // Verificar si la respuesta es JSON válido
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta no es JSON válido');
            }
    
            const result = await response.json();
            
            // Verificar estructura de respuesta
            if (!result || typeof result !== 'object') {
                throw new Error('Estructura de respuesta inválida');
            }
    
            // Manejar errores del servidor
            if (!result.success) {
                throw new Error(result.message || 'Error en el servidor');
            }
    
            // Caso sin datos
            if (result.count === 0 || !result.data || result.data.length === 0) {
                mostrarMensajeNoDatos(result.message || 'No hay registros disponibles');
                return;
            }
    
            // Caso con datos válidos
            mostrar(result.data);
            
        } catch (error) {
            console.error('Error en fetchConsulta:', error);
            mostrarMensajeError(error);
            
        }
    }

      // Nueva función para mostrar mensaje de "no hay datos"
    function mostrarMensajeNoDatos() {
        contenedor.innerHTML = `
            <div class="no-horarios-message">
                <i class="fas fa-database"></i>
                <p>No se encontraron registros de asistencia</p>
            </div>
        `;
        createToast(
            "advertencia",
            "fa-solid fa-triangle-exclamation",
            "Información",
            "No hay registros de asistencia para mostrar."
        );
    }
    
    // Nueva función para mostrar mensaje de error
    function mostrarMensajeError() {
        contenedor.innerHTML = `
            <div class="no-horarios-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los datos</p>
            </div>
        `;
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            "Hubo un problema al cargar los datos."
        );
    }

    function mostrar(consulta) {
        contenedor.innerHTML = ''; // Limpiar contenedor antes de mostrar nuevos datos

        
    // Si la respuesta tiene estructura {success, data}
    
    contenedor.innerHTML = '';

    if (!consulta || consulta.length === 0) {
        mostrarMensajeNoDatos();
        return;
    }


        consulta.forEach(usuario => {
            const divList = document.createElement('div');
            divList.className = 'list';

            const divUser = document.createElement('div');
            divUser.className = 'user';

            const divImgBx = document.createElement('div');
            divImgBx.className = 'imgBx';
            divImgBx.innerHTML = '<i class="bx bx-user"></i>';

            const divDetails = document.createElement('div');
            divDetails.className = 'details';
            divDetails.innerHTML = `
                <h3>${usuario.nom_grupo}</h3>
                <p>Alumno: ${usuario.nombre_completo}</p>
            `;

            divUser.appendChild(divImgBx);
            divUser.appendChild(divDetails);

            const divNavigation = document.createElement('div');
            divNavigation.className = 'navigation';
            divNavigation.innerHTML = `
                <span onclick="abrirModal('${usuario.id_jefe}', '${usuario.nom_jefe}','${usuario.appat_jefe}', '${usuario.apmat_jefe}', '${usuario.boleta}', '${usuario.correo || ''}', '${usuario.id_grupo || ''}', '${usuario.nom_grupo || ''}')">
                    <i class="bx bx-edit"></i>
                </span>
                <span onclick="abrirModalBorrar('${usuario.id_jefe}')">
                    <i class="bx bx-trash"></i>
                </span>
            `;
            divList.appendChild(divUser);
            divList.appendChild(divNavigation);
            contenedor.appendChild(divList);
        });

        
    

    }
async function filtrarJefes() {
    try {
        console.log("Filtrando jefes...");
        console.log("Grupo seleccionado:", grupofiltroSeleccionado);
        console.log("Jefe seleccionado:", jefeSeleccionado);

        const response = await fetch("/api/jefes");
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        
        const jefes = await response.json();
        
        // Validar que sea un array
        if (!Array.isArray(jefes)) {
            throw new Error('La respuesta no es un array válido');
        }

        const jefesFiltrados = jefes.filter(jefe => {
            // Convertir a string para comparación segura
            const grupoJefe = String(jefe.id_grupo);
            const idJefe = String(jefe.id_jefe);
            const grupoFiltro = String(grupofiltroSeleccionado);
            const jefeFiltro = String(jefeSeleccionado);

            const coincideGrupo = grupofiltroSeleccionado === 'todos' || 
                                grupoJefe === grupoFiltro;
            
            const coincideJefe = jefeSeleccionado === 'todos' || 
                               idJefe === jefeFiltro;
            
            return coincideGrupo && coincideJefe;
        });

        if (jefesFiltrados.length === 0) {
            createToast(
                "advertencia",
                "fa-solid fa-triangle-exclamation",
                "Aguas",
                "No se encontraron jefes que coincidan con los filtros seleccionados."
            );
            return;
        }
        
        mostrarJefes(jefesFiltrados); // Usar función específica para mostrar jefes
        
    } catch (error) {
        console.error("Error al filtrar jefes:", error);
        createToast(
            "error",
            "fa-solid fa-circle-exclamation",
            "Error",
            "Hubo un problema al filtrar los jefes."
        );
        mostrarMensajeError();
    }
}

// Función específica para mostrar jefes (similar a tu función 'mostrar' pero adaptada)
function mostrarJefes(jefes) {
    contenedor.innerHTML = '';


    jefes.forEach(usuario => {
        const divList = document.createElement('div');
        divList.className = 'list';

        const divUser = document.createElement('div');
        divUser.className = 'user';

        const divImgBx = document.createElement('div');
        divImgBx.className = 'imgBx';
        divImgBx.innerHTML = '<i class="bx bx-user"></i>';

        const divDetails = document.createElement('div');
        divDetails.className = 'details';
        divDetails.innerHTML = `
            <h3>${usuario.nom_grupo || 'Sin grupo'}</h3>
            <p>Jefe: ${usuario.nombre_completo || 'Sin nombre'}</p>
        `;

        divUser.appendChild(divImgBx);
        divUser.appendChild(divDetails);

        const divNavigation = document.createElement('div');
        divNavigation.className = 'navigation';
        divNavigation.innerHTML = `
            <span onclick="abrirModal('${usuario.id_jefe}', '${usuario.nom_jefe}','${usuario.appat_jefe}', '${usuario.apmat_jefe}', '${usuario.boleta}', '${usuario.correo || ''}', '${usuario.id_grupo || ''}', '${usuario.nom_grupo || ''}')">
                <i class="bx bx-edit"></i>
            </span>
            <span onclick="abrirModalBorrar('${usuario.id_jefe}')">
                <i class="bx bx-trash"></i>
            </span>
        `;

        divList.appendChild(divUser);
        divList.appendChild(divNavigation);
        contenedor.appendChild(divList);
    });
}

    fetchConsulta();



    