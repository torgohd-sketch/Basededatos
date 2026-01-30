
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) {
      alert("Debes iniciar sesión primero.");
      window.location.href = "login.html";
    } else {
      document.getElementById("nombreUsuario").textContent =
        `${usuarioActivo.nombre} ${usuarioActivo.apellido}`;
    }

    async function cargarEmpleados() {
      const res = await fetch("http://localhost:3000/api/empleados");
      const empleados = await res.json();
      const select = document.getElementById("empleadoSelect");

      empleados.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp._id;
        option.textContent = `${emp.nombre} ${emp.apellido}`;
        select.appendChild(option);
      });
    }

    cargarEmpleados();

    document.getElementById("btnGuardar").addEventListener("click", async () => {
      const id = document.getElementById("empleadoSelect").value;
      const nombre = document.getElementById("nombre").value;
      const apellido = document.getElementById("apellido").value;
      const edad = document.getElementById("edad").value;
      const aspiracion = document.getElementById("aspiracion").value;
      const Calificacion = document.getElementById("Calificacion").value;
      const sueldo_inicial = document.getElementById("sueldo_inicial").value;
      const Sueldo_actual = document.getElementById("Sueldo_actual").value;

      if (!id) return alert("Selecciona un empleado primero");

      const nuevosDatos = {
        nombre,
        apellido,
        edad: Number(edad),
        aspiracion_salarial: Number(aspiracion),
        editado_por: `${usuarioActivo.nombre} ${usuarioActivo.apellido}`,
        fecha_ultimo_cambio: new Date(),
        sueldo_inicial: Number(sueldo_inicial),
        sueldo_actual: Number(Sueldo_actual),
        calificacion: Number(Calificacion)
      };

      const res = await fetch(`http://localhost:3000/api/empleados/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevosDatos)
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert("❌ Error al guardar cambios");
      }
    });
