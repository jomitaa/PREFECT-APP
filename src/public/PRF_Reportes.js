document.getElementById('form-reporte').addEventListener('submit', async function(event) {
  event.preventDefault(); // Evita el envío del formulario por defecto

  // Recoger los valores del formulario
  const usuario = document.getElementById('usuario').value;
  const tipo_reporte = document.getElementById('tipo-reporte').value;
  const detalle_reporte = document.getElementById('detalle-reporte').value;

  // Validar que los campos no estén vacíos
  if (!usuario || !tipo_reporte || !detalle_reporte) {
      document.querySelector('.alerta-error').style.display = 'block';
      return;
  }

  try {
      // Obtener id_usuario desde la sesión del servidor
      const response = await fetch('/obtenerUsuario');
      const data = await response.json();

      if (!data.success) {
          alert('No se pudo obtener el usuario. Inicia sesión nuevamente.');
          return;
      }

      const id_usuario = data.id_usuario;
      const nom_usuario = data.nom_usuario;

      // Enviar la solicitud POST al servidor para registrar el reporte
      const result = await fetch('/agregarReporte', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              id_tiporeporte: tipo_reporte,
              descripcion: detalle_reporte,
              id_usuario: id_usuario,  // Se obtiene dinámicamente del backend
             
          })
      });

      const resultData = await result.json();
      
      if (resultData.success) {
          document.querySelector('.alerta-exito').style.display = 'block'; // Muestra el mensaje de éxito
          document.getElementById('form-reporte').reset(); // Limpiar el formulario
      } else {
          alert('Hubo un error al agregar el reporte');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error en la comunicación con el servidor');
  }
});
