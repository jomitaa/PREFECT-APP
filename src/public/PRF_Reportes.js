document.getElementById('form-reporte').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const tipo_reporte = document.getElementById('tipo-reporte').value;
  const detalle_reporte = document.getElementById('detalle-reporte').value;
  const inputImagen = document.getElementById('evidencia');
  const imagen = inputImagen.files[0];

  // Validación básica
  if (!tipo_reporte || !detalle_reporte) {
    const alertaError = document.querySelector('.alerta-error');
    alertaError.style.display = 'block';
    setTimeout(() => { alertaError.style.display = 'none'; }, 4000);
    return;
  }

  try {
    // Obtener datos del usuario desde la sesión
    const response = await fetch('/obtenerUsuario', {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    const id_usuario = data.ID_usuario;
    const nom_usuario = data.nom_usuario;
    const id_escuela = data.id_escuela;

    // Crear FormData para enviar la imagen
    const formData = new FormData();
    formData.append('id_tiporeporte', tipo_reporte);
    formData.append('descripcion', detalle_reporte);
    formData.append('ID_usuario', id_usuario);
    formData.append('nom_usuario', nom_usuario);
    formData.append('id_escuela', id_escuela);
    
    if (imagen) {
      formData.append('evidencia', imagen);
    }

    // Enviar el reporte
    const result = await fetch('/agregarReporte', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const resultData = await result.json();
    
    if (resultData.success) {
      const alertaExito = document.querySelector('.alerta-exito');
      alertaExito.style.display = 'block';
      setTimeout(() => { alertaExito.style.display = 'none'; }, 4000);
      document.getElementById('form-reporte').reset();
      document.getElementById('imagen-preview').innerHTML = '';

      
      // Opcional: Mostrar vista previa de la imagen subida
      if (resultData.imageUrl) {
        const previewDiv = document.getElementById('imagen-preview');
        previewDiv.innerHTML = `<img src="${resultData.imageUrl}" alt="Evidencia del reporte" style="max-width: 200px; margin-top: 10px;">`;
      }
    } else {
      alert('Hubo un error al agregar el reporte: ' + (resultData.message || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Hubo un error en la comunicación con el servidor');
  }
});
