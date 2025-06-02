const API_BASE = "https://taller-ph1e.onrender.com";

async function cargarCarrito() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para ver el carrito.");
    location.href = "index.html";
    return;
  }

  const usuarioId = parseJwt(token).id;
  const tbody = document.querySelector("#cart-table tbody");
  const mensajeDiv = document.getElementById("mensaje-carrito");
  const tabla = document.getElementById("cart-table");
  const btnConfirmar = document.getElementById("confirm-btn");

  tbody.innerHTML = "";
  mensajeDiv.textContent = "";
  tabla.style.display = "none";
  btnConfirmar.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.productos || data.productos.length === 0) {
      mensajeDiv.textContent = "Tu carrito está vacío.";
      document.getElementById("total").textContent = "Total: $0";
      return;
    }

    tabla.style.display = "table";
    btnConfirmar.style.display = "inline-block";

    let total = 0;

    data.productos.forEach(prod => {
      const subtotal = prod.precio * prod.cantidad;
      total += subtotal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.nombre}</td>
        <td>$${prod.precio.toLocaleString()}</td>
        <td><input type="number" min="1" value="${prod.cantidad}" data-id="${prod.id}" class="cantidad-input"></td>
        <td>$${subtotal.toLocaleString()}</td>
        <td><button class="eliminar-btn" data-id="${prod.id}">Eliminar</button></td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("total").textContent = `Total: $${total.toLocaleString()}`;
    agregarEventosCarrito();

  } catch (err) {
    console.error("Error cargando carrito:", err);
    mensajeDiv.textContent = "Error al cargar el carrito.";
  }
}

function agregarEventosCarrito() {
  document.querySelectorAll(".cantidad-input").forEach(input => {
    input.addEventListener("change", async e => {
      let nuevaCantidad = parseInt(e.target.value);
      if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        nuevaCantidad = 1;
        e.target.value = 1;
      }

      const id_producto = e.target.dataset.id;
      await actualizarCantidad(id_producto, nuevaCantidad);
      await cargarCarrito();
    });
  });

  document.querySelectorAll(".eliminar-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
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

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id_usuario: usuarioId, id_producto, cantidad })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.mensaje || "Error al actualizar cantidad");
    }
  } catch (err) {
    console.error("Error actualizar cantidad:", err);
  }
}

async function eliminarProducto(id_producto) {
  const token = localStorage.getItem("token");
  const usuarioId = parseJwt(token).id;

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id_usuario: usuarioId, id_producto })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.mensaje || "Error al eliminar producto");
    }
  } catch (err) {
    console.error("Error eliminar producto:", err);
  }
}

// ✅ Confirmar compra
document.getElementById("confirm-btn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión");

  try {
    const res = await fetch(`${API_BASE}/api/compras`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Compra realizada con éxito");
      localStorage.setItem("ultimaCompra", JSON.stringify(data));
      await actualizarContadorReal();
      window.location.href = "confirmacion.html";
    } else {
      alert(data.mensaje || "Error al procesar compra");
    }
  } catch (err) {
    console.error("Error en compra:", err);
    alert("No se pudo realizar la compra");
  }
});

// ✅ Contador de carrito desde backend
async function actualizarContadorReal() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const count = data.productos?.reduce((acc, p) => acc + p.cantidad, 0) || 0;
    document.querySelector(".cart-count").textContent = count;
  } catch (e) {
    console.error("No se pudo actualizar contador:", e);
  }
}

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}

window.addEventListener("DOMContentLoaded", cargarCarrito);
