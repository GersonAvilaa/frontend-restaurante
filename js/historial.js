const API_BASE = "https://taller-ph1e.onrender.com";

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión");
    return;
  }

  const usuarioId = parseJwt(token).id;
  const mensaje = document.getElementById("mensaje");
  const tabla = document.getElementById("tablaHistorial");
  const tbody = tabla.querySelector("tbody");

  try {
    const res = await fetch(`${API_BASE}/api/compras/historial/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!data.length) {
      mensaje.textContent = "Aún no tienes historial de compras.";
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
      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error("Error al mostrar historial:", err);
    mensaje.textContent = "Error al mostrar el historial.";
  }
});

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}
