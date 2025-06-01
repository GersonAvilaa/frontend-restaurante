const API_BASE = "https://taller-ph1e.onrender.com";

function toggleLogin() {
  const loginForm = document.getElementById("loginForm");
  loginForm.style.display = (loginForm.style.display === "block") ? "none" : "block";
}

async function loginUsuario() {
  const correo = document.getElementById("loginEmail").value;
  const contrasena = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo_electronico: correo, contrasena })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      alert("Inicio de sesión exitoso");
      document.getElementById("loginForm").style.display = "none";
      location.reload();
    } else {
      alert(data.mensaje || "Error al iniciar sesión");
    }
  } catch (error) {
    console.error("Error en login:", error);
    alert("Error de conexión con el servidor");
  }
}

async function cargarProductos() {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    const productos = await response.json();

    const container = document.getElementById("menu-container");
    container.innerHTML = "";

    productos.forEach((prod, index) => {
      const div = document.createElement("div");
      div.className = "menu-comida";

      div.innerHTML = `
        <img src="img/${prod.imagen}" alt="${prod.nombre}" />
        <h2>${prod.nombre}</h2>
        <p>Precio: $${prod.precio.toLocaleString()}</p>
        <p>${prod.descripcion || ""}</p>
        <input type="number" min="1" value="1" id="cantidad${index}">
        <div class="button-group">
          <button onclick="addToCart(${prod.id}, ${prod.precio}, document.getElementById('cantidad${index}').value)">Agregar al Carrito</button>
          <button onclick="comprarAhora(${prod.id}, ${prod.precio}, document.getElementById('cantidad${index}').value)">Comprar Ahora</button>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

async function addToCart(id_producto, precio, cantidad) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para agregar al carrito.");
    return;
  }

  const usuarioId = parseJwt(token).id;

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        id_usuario: usuarioId,
        id_producto,
        cantidad,
        precio
      })
    });

    if (res.ok) {
      alert("Producto agregado al carrito.");
      const cartCount = document.querySelector('.cart-count');
      cartCount.textContent = parseInt(cartCount.textContent) + parseInt(cantidad);
    } else {
      const err = await res.json();
      alert(err.mensaje || "Error al agregar producto.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo conectar con el servidor.");
  }
}

// 🛒 Comprar Ahora sin pasar por el carrito
async function comprarAhora(id_producto, precio, cantidad) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para realizar una compra.");
    return;
  }

  const confirmado = confirm("¿Deseas comprar ahora este producto?");
  if (!confirmado) return;

  const usuarioId = parseJwt(token).id;

  try {
    // Agregar al carrito primero
    await fetch(`${API_BASE}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        id_usuario: usuarioId,
        id_producto,
        cantidad,
        precio
      })
    });

    // Realizar compra
    const res = await fetch(`${API_BASE}/api/compras`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Compra realizada exitosamente.");
      window.location.href = "confirmacion.html";
    } else {
      alert(data.mensaje || "Error al comprar.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo realizar la compra.");
  }
}

function logout() {
  localStorage.removeItem("token");
  alert("Sesión cerrada.");
  location.reload();
}

function verificarSesion() {
  const token = localStorage.getItem("token");
  const logoutBtn = document.getElementById("logoutButton");
  const historialBtn = document.getElementById("historialButton");
  const mensajeBienvenida = document.getElementById("mensajeBienvenida");

  if (token) {
    logoutBtn.style.display = "block";
    if (historialBtn) historialBtn.style.display = "block";

    try {
      const payload = parseJwt(token);
      const nombre = payload.nombre_completo || "Usuario";
      if (mensajeBienvenida) {
        mensajeBienvenida.style.display = "block";
        mensajeBienvenida.textContent = `Bienvenido, ${nombre}`;
      }
    } catch (err) {
      console.error("Token inválido al decodificar:", err);
    }
  } else {
    logoutBtn.style.display = "none";
    if (historialBtn) historialBtn.style.display = "none";
    if (mensajeBienvenida) mensajeBienvenida.style.display = "none";
  }
}


function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(atob(base64Url).split("").map(c =>
    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(""));
  return JSON.parse(base64);
}

window.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
  cargarProductos();
});
