document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('userName');

    if (userName) {
        fetch(`/perfil/${userName}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error:', data.error);
                    alert('No se pudo cargar el perfil del usuario.');
                } else {
                    document.getElementById('userName').textContent = data.userName;
                    document.getElementById('userEmail').textContent = data.userEmail;
                    document.getElementById('userCargo').textContent = data.userCargo;
                }
            })
            .catch(error => {
                console.error('Error al obtener los datos del perfil:', error);
            });
    } else {
        alert('No se proporcionó un nombre de usuario.');
    }
});
