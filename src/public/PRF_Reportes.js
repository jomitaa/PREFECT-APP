document.getElementById('form-reporte').addEventListener('submit', async function(event) {
  event.preventDefault(); 


  const usuario = document.getElementById('usuario').value;
  const tipo_reporte = document.getElementById('tipo-reporte').value;
  const detalle_reporte = document.getElementById('detalle-reporte').value;


  if (!usuario || !tipo_reporte || !detalle_reporte) {
      document.querySelector('.alerta-error').style.display = 'block';
      return;
  }

  try {
    
      const response = await fetch('/obtenerUsuario', {
        method: 'GET',
        credentials: 'include' 
    });
      const data = await response.json();

      /* no se porque marca error esto
      if (!data.success) {
          alert('No se pudo obtener el usuario. Inicia sesión nuevamente.');
          return;
      }*/

      const id_usuario = data.ID_usuario;
      const nom_usuario = data.nom_usuario;

     
      const result = await fetch('/agregarReporte', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              id_tiporeporte: tipo_reporte,
              descripcion: detalle_reporte,
              ID_usuario: id_usuario, 
              nom_usuario: nom_usuario,
             
          })
      });

      const resultData = await result.json();
      
      if (resultData.success) {
          document.querySelector('.alerta-exito').style.display = 'block'; 
          document.getElementById('form-reporte').reset(); 
      } else {
          alert('Hubo un error al agregar el reporte');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error en la comunicación con el servidor');
  }
});
