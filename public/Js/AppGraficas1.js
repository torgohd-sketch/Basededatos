
async function init() {
  try {
    const res = await fetch('/api/empleados');
    const data = await res.json();

    let distribucion = { 'Alta (4-5)': 0, 'Media (3)': 0, 'Baja (1-2)': 0 };
    data.forEach(e => {
      if (e.calificacion >= 4) distribucion['Alta (4-5)']++;
      else if (e.calificacion === 3) distribucion['Media (3)']++;
      else distribucion['Baja (1-2)']++;
    });

    new Chart(document.getElementById("graficoDistribucion"), {
      type: 'pie',
      data: {
        labels: Object.keys(distribucion),
        datasets: [{
          label: 'Distribución de Calificaciones',
          data: Object.values(distribucion),
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { color: '#e2e8f0' } },
          title: { display: true, text: 'Distribución de Calificaciones', color: '#e2e8f0', font: { size: 20 } }
        }
      }
    });

    const Empleados = data.map(e => ({
      x: e.experiencia,
      y: e.calificacion,
      label: e.nombre
    }));

    new Chart(document.getElementById("graficoDispersion"), {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Calificación vs Experiencia',
          data: Empleados,
          backgroundColor: '#2196F3'
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Experiencia (años)' } },
          y: { title: { display: true, text: 'Calificación' }, min: 0, max: 5.1 }
        },
        plugins: {
          title: { display: true, text: 'Calificación vs Experiencia', color: '#e2e8f0', font: { size: 20 } }
        }
      }
    });

    const grupos = {};
    data.forEach(e => {
      if (!grupos[e.rol]) grupos[e.rol] = [];
      grupos[e.rol].push(e.calificacion);
    });

    const roles = Object.keys(grupos);
    const promedios = roles.map(r => 
      (grupos[r].reduce((a,b)=>a+b,0)/grupos[r].length).toFixed(2)
    );

    new Chart(document.getElementById("graficoPorRol"), {
      type: 'bar',
      data: {
        labels: roles,
        datasets: [{
          label: 'Promedio de calificación por rol',
          data: promedios,
          backgroundColor: '#42A5F5'
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: 5, title: { display: true, text: 'Calificación promedio' } }
        }
      }
    });
    const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(e => {
      const c = e.calificacion;
      if (c >= 1 && c <= 5) conteo[c]++;
    });

    const labels = Object.keys(conteo);
    const valores = Object.values(conteo);

 
    new Chart(document.getElementById("graficoPorCalificacion"), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de empleados',
          data: valores,
          backgroundColor: ['#F44336','#FF9800','#FFC107','#4CAF50','#2196F3']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Cantidad de empleados por calificación (1 a 5)'
          },
          tooltip: {
            callbacks: {
              label: ctx => `Empleados: ${ctx.formattedValue}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de empleados' },
            ticks: { stepSize: 1 }
          },
          x: {
            title: { display: true, text: 'Calificación' }
          }
        }
      }
    });
let chart;

const selectOperacion = document.getElementById("operacion");
const selectTipoGrafico = document.getElementById("tipoGrafico");

selectOperacion.addEventListener("change", () => {
  const operacion = selectOperacion.value;

  selectTipoGrafico.innerHTML = '<option selected disabled>Selecciona tipo de gráfico</option>';

  let tiposDisponibles;
  if (operacion === "comparacion") {
    tiposDisponibles = ["bar", "line"]; 
  } else {
    tiposDisponibles = ["bar", "line", "pie", "radar"];
  }

  tiposDisponibles.forEach(tipo => {
    const option = document.createElement("option");
    option.value = tipo;
    option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    selectTipoGrafico.appendChild(option);
  });
});

document.getElementById("btnGenerar").addEventListener("click", () => {
  const ejeX = document.getElementById("ejeX").value;
  const operacion = document.getElementById("operacion").value;
  const tipoGrafico = document.getElementById("tipoGrafico").value;

  if (!ejeX || !operacion || !tipoGrafico) {
    alert("Selecciona todas las opciones antes de generar el gráfico");
    return;
  }

  const gruposCalif = {};
  data.forEach(e => {
    if (!gruposCalif[e.calificacion]) gruposCalif[e.calificacion] = [];
    gruposCalif[e.calificacion].push(e);
  });


  if (ejeX === "rol") {
    const rolesUnicos = [...new Set(data.map(e => e.rol))];
    const etiquetas = Object.keys(gruposCalif).sort();

    const datasets = rolesUnicos.map(rol => ({
      label: rol,
      data: etiquetas.map(c => gruposCalif[c].filter(e => e.rol === rol).length),
      backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }));

    crearGrafico("bar", etiquetas.map(c => `Calificación ${c}`), datasets, "Cantidad de empleados por rol y calificación");
    return;
  }

  const etiquetas = Object.keys(gruposCalif).sort();

  if (operacion === "comparacion") {
  
    const promedios = etiquetas.map(c => {
      const grupo = gruposCalif[c];
      const valores = grupo.map(e => e[ejeX]);
      return valores.reduce((a, b) => a + b, 0) / valores.length;
    });
    const maximos = etiquetas.map(c => Math.max(...gruposCalif[c].map(e => e[ejeX])));

    const datasets = [
      {
        label: `Promedio de ${ejeX}`,
        data: promedios,
        backgroundColor: tipoGrafico === "bar" ? "#42A5F5" : undefined,
        borderColor: "#42A5F5",
        borderWidth: 2,
        fill: false,
      },
      {
        label: `Máximo de ${ejeX}`,
        data: maximos,
        backgroundColor: tipoGrafico === "bar" ? "#FFA726" : undefined,
        borderColor: "#FB8C00",
        borderWidth: 2,
        fill: false,
      },
    ];

    crearGrafico(tipoGrafico, etiquetas.map(e => `Calificación ${e}`), datasets, `Comparación de ${ejeX} (Promedio vs Máximo)`);
    return;
  }


  const valores = etiquetas.map(c => {
    const grupo = gruposCalif[c];
    if (operacion === "suma") {
      return grupo.reduce((sum, e) => sum + (e[ejeX] || 0), 0);
    } else if (operacion === "promedio") {
      return grupo.reduce((sum, e) => sum + (e[ejeX] || 0), 0) / grupo.length;
    }
  });

  const dataset = [{
    label: `${operacion.toUpperCase()} de ${ejeX} por calificación`,
    data: valores,
    backgroundColor: '#42A5F5',
    borderColor: '#1E88E5',
    borderWidth: 2,
  }];

  crearGrafico(tipoGrafico, etiquetas.map(e => `Calificación ${e}`), dataset);
});

function crearGrafico(tipo, etiquetas, datasets, titulo = "") {
  const ctx = document.getElementById("graficoPersonalizado").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: tipo,
    data: { labels: etiquetas, datasets: datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: titulo || "Gráfico generado",
          font: { size: 18 }
        }
      },
      scales: tipo !== "pie" && tipo !== "radar" ? {
        y: { beginAtZero: true }
      } : {}
    }
  });
}

  } catch (err) {
    console.error('Error al cargar empleados:', err);
  }
}

init();

const btnMostrar = document.getElementById('mostrar');
const btnVolver = document.getElementById('volver');
const seccionGraficos = document.getElementById('graficos');
const seccionCrear = document.querySelector('.creargrafico');
seccionGraficos.style.display = 'flex';

btnMostrar.addEventListener('click', () => {

  seccionGraficos.classList.remove('fade-in');
  seccionGraficos.classList.add('fade-out');
  setTimeout(() => {
    seccionGraficos.style.display = 'none';
    btnMostrar.style.display = 'none';
    btnVolver.style.display = 'inline-block';
    seccionCrear.style.display = 'block';
  }, 500);
});

btnVolver.addEventListener('click', () => {
  seccionGraficos.classList.remove('fade-out');
  seccionGraficos.style.display = 'flex';
  seccionGraficos.classList.add('fade-in');
  btnVolver.style.display = 'none';
  btnMostrar.style.display = 'inline-block';
    seccionCrear.style.display = 'none';
});

  
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