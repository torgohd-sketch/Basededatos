   document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

const usuario = document.getElementById("usuario").value.trim();
  const contraseña = document.getElementById("password").value.trim();

  if (!usuario || !contraseña) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contraseña })
    });

    const data = await res.json();

    if (data.success) {

      localStorage.setItem("usuarioActivo", JSON.stringify(data.user));
      
      alert(data.message);
      
      window.location.href = "auditoria.html";
    } else {
      alert(data.message || "Error en las credenciales");
    }

  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
    alert("No se pudo conectar con el servidor.");
  }
});

    document.getElementById("btnInspector").addEventListener("click", () => {
      window.location.href = "index.html";
    });
    