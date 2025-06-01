const API_BASE = "https://taller-ph1e.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión.");
    location.href = "index.html";
    return;
  }

  const usuarioId = parseJwt(token).id;

  try {
    const res = await fetch(`${API_BASE}/api/compras/historial/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    const tabla = document.getElementById("tablaHistorial");
    const cuerpo = tabla.querySelector("tbody");
    const mensaje = document.getElementById("mensaje");

    if (!data.length) {
      mensaje.textContent = "Aún no has realizado compras.";
      return;
    }

    tabla.style.display = "table";

    data.forEach(item => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${item.fecha}</td>
        <td>${item.nombre_producto}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio_unitario}</td>
        <td>$${item.subtotal}</td>
      `;
      cuerpo.appendChild(fila);
    });
  } catch (err) {
    console.error("Error al cargar historial:", err);
    document.getElementById("mensaje").textContent = "Error al cargar el historial.";
  }
});

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}
