const API_BASE = "https://taller-ph1e.onrender.com";

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión");

  const contenedor = document.getElementById("tablaHistorial").querySelector("tbody");
  const mensaje = document.getElementById("mensaje");

  try {
    const res = await fetch(`${API_BASE}/api/compras/historial`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("No se pudo obtener historial");

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      mensaje.textContent = "Aún no tienes compras registradas.";
      return;
    }

    document.getElementById("tablaHistorial").style.display = "table";
    mensaje.textContent = "";

    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.fecha}</td>
        <td>${item.nombre_producto}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio_unitario}</td>
        <td>$${item.subtotal}</td>
      `;
      contenedor.appendChild(row);
    });

  } catch (error) {
    console.error("Error historial:", error);
    mensaje.textContent = "Error al mostrar el historial";
  }
});
