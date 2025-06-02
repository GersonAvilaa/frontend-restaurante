const API_BASE = "https://taller-ph1e.onrender.com";

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión");
    location.href = "index.html";
    return;
  }

  const usuarioId = parseJwt(token).id;
  const contenedor = document.getElementById("resumen-compra");

  try {
    const res = await fetch(`${API_BASE}/api/compras/historial/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("No se pudo obtener el historial");

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Historial vacío");
    }

    const ultimaCompra = data.reduce((a, b) =>
      new Date(a.fecha) > new Date(b.fecha) ? a : b
    );
    const detalles = data.filter(item => item.id_compra === ultimaCompra.id_compra);

    mostrarResumen(ultimaCompra, detalles, contenedor);

  } catch (error) {
    console.warn("Fallo al consultar el servidor. Intentando fallback local…", error);

    const ultimaCompra = JSON.parse(localStorage.getItem("ultimaCompra"));

    if (ultimaCompra && ultimaCompra.id_compra) {
      contenedor.innerHTML = `
        <p><strong>ID Compra:</strong> ${ultimaCompra.id_compra}</p>
        <p><strong>Total Pagado:</strong> $${ultimaCompra.total_pagado}</p>
        <p>Nota: Detalles de la compra no disponibles sin conexión al servidor.</p>
        <button onclick="location.href='index.html'">Volver al Menú</button>
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
  