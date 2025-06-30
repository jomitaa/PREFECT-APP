document.addEventListener("DOMContentLoaded", async () => {


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