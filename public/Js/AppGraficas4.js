
let chart;
let empleados = [];
let seleccionados = [];

async function init() {
  try {
    const res = await fetch('/api/empleados');
    empleados = await res.json();

    const input = document.getElementById("buscadorEmpleado");
    const sugerencias = document.getElementById("sugerencias");
    const contenedorSeleccionados = document.getElementById("empleadosSeleccionados");

    input.addEventListener("input", () => {
      const texto = input.value.toLowerCase();
      sugerencias.innerHTML = "";

      if (!texto) return;

      const coincidencias = empleados.filter(e =>
        `${e.nombre} ${e.apellido}`.toLowerCase().includes(texto)
      );

      coincidencias.slice(0, 5).forEach(emp => {
        const item = document.createElement("button");
        item.className = "list-group-item list-group-item-action";
        item.textContent = `${emp.nombre} ${emp.apellido}`;
        item.onclick = () => seleccionarEmpleado(emp, contenedorSeleccionados);
        sugerencias.appendChild(item);
      });
    });

  } catch (err) {
    console.error("Error al cargar empleados:", err);
  }
}

function seleccionarEmpleado(emp, contenedorSeleccionados) {
  const sugerencias = document.getElementById("sugerencias");
  sugerencias.innerHTML = "";

  if (seleccionados.some(e => e._id === emp._id)) return; // evitar duplicado

  if (seleccionados.length >= 5) {
    alert("⚠️ Solo puedes comparar hasta 5 empleados.");
    return;
  }

  seleccionados.push(emp);
  renderSeleccionados(contenedorSeleccionados);
  renderGrafico();
}

function eliminarEmpleado(id, contenedorSeleccionados) {
  seleccionados = seleccionados.filter(e => e._id !== id);
  renderSeleccionados(contenedorSeleccionados);
  renderGrafico();
}

function renderSeleccionados(contenedor) {
  contenedor.innerHTML = "";
  seleccionados.forEach(emp => {
    const chip = document.createElement("div");
    chip.className = "badge bg-primary p-2 d-flex align-items-center gap-2";
    chip.innerHTML = `
      ${emp.nombre} ${emp.apellido}
      <button class="btn-close btn-close-white btn-sm ms-1"></button>
    `;
    chip.querySelector("button").onclick = () =>
      eliminarEmpleado(emp._id, contenedor);
    contenedor.appendChild(chip);
  });
}

function renderGrafico() {
  const ctx = document.getElementById("graficoSalarios");
  if (chart) chart.destroy();

  const datasets = seleccionados.map(emp => ({
    label: `${emp.nombre} ${emp.apellido}`,
    data: [
      { x: new Date(emp.fecha_ingreso), y: emp.sueldo_inicial },
      { x: new Date(emp.fecha_actualizacion), y: emp.sueldo_actual }
    ],
    borderColor: getColor(emp._id),
    backgroundColor: getColor(emp._id),
    fill: false,
    tension: 0.3
  }));

  chart = new Chart(ctx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: seleccionados.length > 1
            ? "Comparativa de evolución salarial"
            : seleccionados.length === 1
            ? `Evolución salarial de ${seleccionados[0].nombre}`
            : "Selecciona empleados para mostrar el gráfico"
        },
        tooltip: { mode: "nearest", intersect: false },
        legend: {
          position: "bottom",
          labels: { color: "#e2e8f0" }
        }
      },
      scales: {
        x: {
          type: "time",
          time: { unit: "month", tooltipFormat: "yyyy-MM-dd" },
          title: { display: true, text: "Fecha" },
          ticks: { color: "#e2e8f0" }
        },
        y: {
          title: { display: true, text: "Salario (COP)" },
          beginAtZero: false,
          ticks: { color: "#e2e8f0" }
        }
      }
    }
  });
}

function getColor(id) {
  const num = parseInt(id.slice(-6), 16);
  return `hsl(${num % 360}, 70%, 55%)`;
}

document.getElementById('exportPdfBtn').addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  async function addChartToPDF(chartId, title, yPos) {
    const canvas = document.getElementById(chartId);
    if (!canvas || canvas.offsetParent === null) return; 
    const imgData = canvas.toDataURL('image/png', 1.0);
    doc.setFontSize(14);
    doc.text(title, 15, yPos - 8);
    doc.addImage(imgData, 'PNG', 15, yPos, 180, 90);
  }

  const graficosPrincipales = [
    'graficoDistribucion',
    'graficoDispersion',
    'graficoPorRol',
    'graficoPorCalificacion'
  ];

  const algunoVisible = graficosPrincipales.some(id => {
    const el = document.getElementById(id);
    return el && el.offsetParent !== null;
  });

  let y = 20;

  if (algunoVisible) {
   
    for (const id of graficosPrincipales) {
      const el = document.getElementById(id);
      if (el && el.offsetParent !== null) {
        const titulo = {
          graficoDistribucion: 'Distribución de Calificaciones',
          graficoDispersion: 'Relación Experiencia vs Calificación',
          graficoPorRol: 'Promedio de Calificación por Rol',
          graficoPorCalificacion: 'Cantidad de Empleados por Calificación'
        }[id];
        await addChartToPDF(id, titulo, y);
        y += 100;
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
      }
    }
  } else {

    const customCharts = ['graficoPersonalizado', 'graficoSalarios'];
    for (const id of customCharts) {
      const el = document.getElementById(id);
      if (el && el.offsetParent !== null) {
        await addChartToPDF(id, 'Gráfico Personalizado', y);
      }
    }
  }

  doc.save('graficas_calificacion.pdf');
});

init();