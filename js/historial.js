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

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      mensaje.textContent = "Aún no tienes compras registradas.";
      return;
    }

    document.getElementById("tablaHistorial").style.display = "table";
    mensaje.textContent = "";

    // Agrupar por ID de compra
    const agrupadas = {};
    data.forEach(d => {
      if (!agrupadas[d.id_compra]) agrupadas[d.id_compra] = [];
      agrupadas[d.id_compra].push(d);
    });

    Object.values(agrupadas).forEach(compra => {
      compra.forEach(item => {
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

      // Línea de descuento si aplica
      const descuento = compra[0].descuento_aplicado;
      if (descuento > 0) {
        const descRow = document.createElement("tr");
        descRow.innerHTML = `
          <td colspan="4" style="text-align:right;"><strong>Descuento aplicado:</strong></td>
          <td>-$${descuento}</td>
        `;
        contenedor.appendChild(descRow);
      }

      const totalRow = document.createElement("tr");
      totalRow.innerHTML = `
        <td colspan="4" style="text-align:right;"><strong>Total pagado:</strong></td>
        <td>$${compra[0].total}</td>
      `;
      contenedor.appendChild(totalRow);
    });

  } catch (error) {
    console.error("Error historial:", error);
    mensaje.textContent = "Error al mostrar el historial";
  }
});
