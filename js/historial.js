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

    // Agrupar por id_compra
    const comprasAgrupadas = {};
    data.forEach(item => {
      if (!comprasAgrupadas[item.id_compra]) {
        comprasAgrupadas[item.id_compra] = {
          fecha: item.fecha,
          total: item.total,
          productos: []
        };
      }
      comprasAgrupadas[item.id_compra].productos.push(item);
    });

    mensaje.textContent = "";
    document.getElementById("tablaHistorial").style.display = "table";

    for (const [id, compra] of Object.entries(comprasAgrupadas)) {
      const filaCompra = document.createElement("tr");
      filaCompra.innerHTML = `
        <td colspan="5" style="background:#e0f0ff;"><strong>Compra ID ${id}</strong> - Fecha: ${compra.fecha}</td>
      `;
      contenedor.appendChild(filaCompra);

      compra.productos.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td></td>
          <td>${p.nombre_producto}</td>
          <td>${p.cantidad}</td>
          <td>$${p.precio_unitario}</td>
          <td>$${p.subtotal}</td>
        `;
        contenedor.appendChild(fila);
      });

      // Mostrar totales
      const subtotal = compra.productos.reduce((acc, p) => acc + p.subtotal, 0);
      const descuento = subtotal - compra.total;
      const filaTotal = document.createElement("tr");
      filaTotal.innerHTML = `
        <td colspan="5" style="text-align:right;">
          Subtotal: $${subtotal} <br>
          ${descuento > 0 ? `Descuento: -$${descuento}<br>` : ""}
          <strong>Total pagado: $${compra.total}</strong>
        </td>
      `;
      contenedor.appendChild(filaTotal);

      // Línea separadora
      const separador = document.createElement("tr");
      separador.innerHTML = `<td colspan="5"><hr></td>`;
      contenedor.appendChild(separador);
    }

  } catch (error) {
    console.error("Error historial:", error);
    mensaje.textContent = "Error al mostrar el historial";
  }
});
