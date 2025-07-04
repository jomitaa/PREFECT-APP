

const no_escuelas = document.getElementById('no_escuelas');

async function obtenerNumeroEscuelas() {
    try {
        const response = await fetch('/api/numero-escuelas');
        if (!response.ok) {
            throw new Error('Error al obtener el número de escuelas');
        }
        const data = await response.json();
        no_escuelas.textContent = `Hay ${data.totalEscuelas} escuelas registradas`;    } catch (error) {
        console.error('Error:', error);
        no_escuelas.textContent = 'Error al cargar';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    obtenerNumeroEscuelas();
});

