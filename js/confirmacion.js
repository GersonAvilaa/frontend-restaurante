const API_BASE = "https://taller-ph1e.onrender.com";

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión");

  const usuarioId = parseJwt(token).id;

  try {
    const res = await fetch(`${API_BASE}/api/compras/historial/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const contenedor = document.getElementById("resumen-compra");

    if (!data.length) {
      contenedor.innerHTML = "<p>No hay compras registradas.</p>";
      return;
    }

    const ultimaCompra = data[0];

    contenedor.innerHTML = `
      <p><strong>Fecha:</strong> ${ultimaCompra.fecha}</p>
      <p><strong>ID Compra:</strong> ${ultimaCompra.id_compra}</p>
      <p><strong>Total Pagado:</strong> $${ultimaCompra.total}</p>
      <h3>Productos:</h3>
      <ul>
        ${data.filter(d => d.id_compra === ultimaCompra.id_compra)
              .map(item => `<li>${item.nombre_producto} x${item.cantidad} - $${item.subtotal}</li>`).join("")}
      </ul>
    `;
  } catch (err) {
    console.error("Error al obtener resumen:", err);
  }
});

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}
