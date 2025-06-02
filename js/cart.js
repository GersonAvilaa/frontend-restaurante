const API_BASE = "https://taller-ph1e.onrender.com";

async function cargarCarrito() {
  const token = localStorage.getItem("token");
  if (!token) return location.href = "index.html";

  const tbody = document.querySelector("#cart-table tbody");
  const mensaje = document.getElementById("mensaje-carrito");
  const tabla = document.getElementById("cart-table");
  const botonConfirmar = document.getElementById("confirm-btn");
  let total = 0;

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const productos = data.productos;

    if (!productos || productos.length === 0) {
      mensaje.textContent = "Tu carrito está vacío.";
      tabla.style.display = "none";
      botonConfirmar.style.display = "none";
      document.getElementById("total").textContent = "Total: $0";
      return;
    }

    tabla.style.display = "table";
    botonConfirmar.style.display = "block";
    mensaje.textContent = "";
    tbody.innerHTML = "";

    productos.forEach(prod => {
      const subtotal = prod.precio * prod.cantidad;
      total += subtotal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.nombre}</td>
        <td>$${prod.precio}</td>
        <td><input type="number" min="1" value="${prod.cantidad}" data-id="${prod.id}" class="cantidad-input" /></td>
        <td>$${subtotal}</td>
        <td><button class="eliminar-btn" data-id="${prod.id}">Eliminar</button></td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("total").textContent = `Total: $${total.toLocaleString()}`;

    // Eventos
    document.querySelectorAll(".cantidad-input").forEach(input => {
      input.addEventListener("change", async (e) => {
        const nuevaCantidad = parseInt(e.target.value);
        const id_producto = e.target.dataset.id;
        if (nuevaCantidad >= 1) {
          await actualizarCantidad(id_producto, nuevaCantidad);
          await cargarCarrito();
        }
      });
    });

    document.querySelectorAll(".eliminar-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id_producto = e.target.dataset.id;
        await eliminarProducto(id_producto);
        await cargarCarrito();
      });
    });

  } catch (err) {
    console.error("Error al cargar el carrito:", err);
    mensaje.textContent = "Error al cargar el carrito.";
  }
}

async function actualizarCantidad(id_producto, cantidad) {
  const token = localStorage.getItem("token");
  const usuarioId = parseJwt(token).id;

  await fetch(`${API_BASE}/api/cart`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id_usuario: usuarioId, id_producto, cantidad })
  });
}

async function eliminarProducto(id_producto) {
  const token = localStorage.getItem("token");
  const usuarioId = parseJwt(token).id;

  await fetch(`${API_BASE}/api/cart`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id_usuario: usuarioId, id_producto })
  });
}

document.getElementById("confirm-btn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/api/compras`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("ultimaCompra", JSON.stringify(data));
      alert("Compra realizada con éxito.");
      window.location.href = "confirmacion.html";
    } else {
      alert(data.mensaje || "Error al confirmar la compra.");
    }
  } catch (error) {
    console.error("Error al confirmar compra:", error);
  }
});

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}

window.addEventListener("DOMContentLoaded", cargarCarrito);
