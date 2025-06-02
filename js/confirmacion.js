const API_BASE = "https://taller-ph1e.onrender.com";

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión");

  const usuarioId = parseJwt(token).id;
  const contenedor = document.getElementById("resumen-compra");

  try {
    const res = await fetch(`${API_BASE}/api/compras/historial/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Error al obtener historial");

    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error("Historial vacío");

    const ultimaCompra = data.reduce((a, b) =>
      new Date(a.fecha) > new Date(b.fecha) ? a : b
    );

    const detalles = data.filter(d => d.id_compra === ultimaCompra.id_compra);
    mostrarResumen(ultimaCompra, detalles, contenedor);

  } catch (err) {
    console.warn("Error remoto, usando datos locales:", err);
    const ultima = JSON.parse(localStorage.getItem("ultimaCompra"));
    if (ultima?.id_compra) {
      contenedor.innerHTML = `
        <p><strong>ID Compra:</strong> ${ultima.id_compra}</p>
        <p><strong>Total Pagado:</strong> $${ultima.total_pagado}</p>
        <p><em>Los detalles no están disponibles sin conexión.</em></p>
        <button onclick="location.href='index.html'">Volver al menú</button>
      `;
    } else {
      contenedor.innerHTML = "<p>Error al mostrar el resumen de la compra.</p>";
    }
  }
});

function mostrarResumen(ultimaCompra, detalles, contenedor) {
  contenedor.innerHTML = `
    <p><strong>Fecha:</strong> ${ultimaCompra.fecha}</p>
    <p><strong>ID Compra:</strong> ${ultimaCompra.id_compra}</p>
    <p><strong>Subtotal:</strong> $${ultimaCompra.subtotal}</p>
    <p><strong>Descuento:</strong> -$${ultimaCompra.descuento_aplicado}</p>
    <p><strong>Total Pagado:</strong> $${ultimaCompra.total}</p>
    <h3>Productos:</h3>
    <ul>
      ${detalles.map(item => `
        <li>${item.nombre_producto} x${item.cantidad} - $${item.subtotal}</li>
      `).join("")}
    </ul>
    <button onclick="location.href='index.html'">Volver al Menú</button>
  `;
}

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}
