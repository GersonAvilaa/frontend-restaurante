const API_BASE = "https://taller-ph1e.onrender.com";

document.addEventListener("DOMContentLoaded", cargarCarrito);

async function cargarCarrito() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión");
    location.href = "index.html";
    return;
  }

  const tbody = document.querySelector("#cart-table tbody");
  const mensaje = document.getElementById("mensaje-carrito");
  const totalDiv = document.getElementById("total");
  const confirmBtn = document.getElementById("confirm-btn");

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const productos = data.productos;

    tbody.innerHTML = "";
    mensaje.textContent = "";

    if (!productos || productos.length === 0) {
      mensaje.textContent = "Tu carrito está vacío.";
      confirmBtn.style.display = "none";
      document.getElementById("cart-table").style.display = "none";
      totalDiv.textContent = "Total: $0";
      return;
    }

    let subtotal = 0;
    productos.forEach(p => {
      subtotal += p.total;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.nombre}</td>
        <td>$${p.precio}</td>
        <td><input type="number" value="${p.cantidad}" min="1" data-id="${p.id_producto}" class="cantidad-input"></td>
        <td>$${p.total}</td>
        <td><button class="eliminar-btn" data-id="${p.id_producto}">❌</button></td>
      `;
      tbody.appendChild(row);
    });

    const descuento = data.descuento_aplicado || 0;
    const totalFinal = subtotal - descuento;

    totalDiv.innerHTML = `
      Subtotal: $${subtotal}<br>
      ${descuento > 0 ? `Descuento: -$${descuento}<br><strong>Total: $${totalFinal}</strong>` : `Total: $${subtotal}`}
    `;

    confirmBtn.style.display = "inline-block";
    document.getElementById("cart-table").style.display = "table";
    agregarEventos();

  } catch (e) {
    console.error("Error al cargar carrito:", e);
    mensaje.textContent = "Error al cargar el carrito.";
  }
}

function agregarEventos() {
  document.querySelectorAll(".cantidad-input").forEach(input => {
    input.addEventListener("change", async (e) => {
      const cantidad = parseInt(e.target.value);
      const id_producto = e.target.dataset.id;
      if (cantidad < 1) return alert("Cantidad inválida");

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

      cargarCarrito();
    });
  });

  document.querySelectorAll(".eliminar-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id_producto = e.target.dataset.id;
      const confirmar = confirm("¿Eliminar este producto?");
      if (!confirmar) return;

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

      cargarCarrito();
    });
  });

  document.getElementById("confirm-btn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/compras`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("ultimaCompra", JSON.stringify(data));
      alert("Compra realizada con éxito");
      window.location.href = "confirmacion.html";
    } else {
      alert(data.mensaje || "Error al realizar la compra.");
    }
  });
}

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}
