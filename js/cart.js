const API_BASE = "https://taller-ph1e.onrender.com";

async function cargarCarrito() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para ver el carrito.");
    window.location.href = "index.html";
    return;
  }

  const usuarioId = parseJwt(token).id;
  const tbody = document.querySelector("#cart-table tbody");
  const tabla = document.getElementById("cart-table");
  const totalDiv = document.getElementById("total");
  const mensaje = document.getElementById("mensaje-carrito");
  const boton = document.getElementById("confirm-btn");

  tbody.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await res.json();

    if (!data.productos || data.productos.length === 0) {
      mensaje.textContent = "Tu carrito está vacío.";
      tabla.style.display = "none";
      totalDiv.textContent = "Total: $0";
      boton.style.display = "none";
      return;
    }

    mensaje.textContent = "";
    tabla.style.display = "table";
    boton.style.display = "block";

    let total = 0;

    data.productos.forEach((prod) => {
      const subtotal = prod.precio * prod.cantidad;
      total += subtotal;

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${prod.nombre}</td>
        <td>$${prod.precio}</td>
        <td><input type="number" min="1" value="${prod.cantidad}" data-id="${prod.id_producto}" class="cantidad-input"></td>
        <td>$${subtotal}</td>
        <td><button class="eliminar-btn" data-id="${prod.id_producto}">Eliminar</button></td>
      `;

      tbody.appendChild(tr);
    });

    totalDiv.textContent = `Total: $${total}`;
    agregarEventosCarrito();
  } catch (error) {
    console.error("Error cargando carrito:", error);
    mensaje.textContent = "Error al cargar el carrito.";
  }
}

function agregarEventosCarrito() {
  document.querySelectorAll(".cantidad-input").forEach(input => {
    input.addEventListener("change", async (e) => {
      let nuevaCantidad = parseInt(e.target.value);
      if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        alert("Cantidad inválida");
        e.target.value = 1;
        nuevaCantidad = 1;
      }
      const id_producto = e.target.dataset.id;
      await actualizarCantidad(id_producto, nuevaCantidad);
      await cargarCarrito();
    });
  });

  document.querySelectorAll(".eliminar-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id_producto = e.target.dataset.id;
      if (confirm("¿Eliminar este producto del carrito?")) {
        await eliminarProducto(id_producto);
        await cargarCarrito();
      }
    });
  });
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
      alert("Compra realizada con éxito.");
      window.location.href = "confirmacion.html";
    } else {
      alert(data.mensaje || "Error al procesar la compra.");
    }
  } catch (error) {
    console.error("Error al confirmar compra:", error);
    alert("No se pudo procesar la compra.");
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
