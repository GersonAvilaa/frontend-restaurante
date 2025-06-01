const API_BASE = "https://taller-ph1e.onrender.com";

document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const cedula = document.getElementById("cedula").value;
  const correo = document.getElementById("correo").value;
  const telefono = document.getElementById("telefono").value;
  const direccion = document.getElementById("direccion").value;
  const contrasena = document.getElementById("contrasena").value;

  try {
    const res = await fetch("https://taller-ph1e.onrender.com/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_completo: nombre,
        cedula,
        correo_electronico: correo,
        numero_telefono: telefono,
        direccion,
        contrasena
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Usuario registrado exitosamente. Ahora puedes iniciar sesión.");
      window.location.href = "index.html";
    } else {
      alert(data.mensaje || "Error al registrar usuario");
    }
  } catch (error) {
    console.error("Error al registrar:", error);
    alert("Error de conexión con el servidor");
  }
});
