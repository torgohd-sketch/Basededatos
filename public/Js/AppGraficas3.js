
async function init() {
  try {
    const res = await fetch('/api/empleados');
    const data = await res.json();

   const roleColors = {
  "Operario": "#3b82f6",
  "Master": "#22c55e",

};


const rolesSet = Array.from(new Set(data.map(d => d.rol)));
const roles = rolesSet.sort(); 

const distribucion = {};
data.forEach(e => {
  const r = e.rol || "Sin rol";
  distribucion[r] = (distribucion[r] || 0) + 1;
});
const labelsDistrib = Object.keys(distribucion);
const valoresDistrib = Object.values(distribucion);
const coloresDistrib = labelsDistrib.map(l => roleColors[l] || '#64748b');

new Chart(document.getElementById("graficoDistribucion"), {
  type: 'pie',
  data: {
    labels: labelsDistrib,
    datasets: [{
      data: valoresDistrib,
      backgroundColor: coloresDistrib,
      borderColor: '#0b1220',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#e2e8f0' } },
      title: { display: true, text: 'Distribución de Roles', color: '#e2e8f0', font: { size: 18 } },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.formattedValue} (${Math.round(ctx.raw / valoresDistrib.reduce((a,b)=>a+b,0)*100)}%)` } }
    }
  }
});


const rolMap = {};
roles.forEach((r, i) => rolMap[r] = i + 1); // 1..N

const Empleados = data.map(e => {
  const baseY = rolMap[e.rol] || 0;
 
  const jitter = (Math.random() - 0.5) * 0.18;
  return {
    x: Number(e.experiencia) || 0,
    y: baseY + jitter,
    label: e.nombre || '',
    rol: e.rol || ''
  };
});


const scatterDatasets = roles.map(r => ({
  label: r,
  data: Empleados.filter(p => p.rol === r),
  backgroundColor: roleColors[r] || '#60a5fa',
  pointRadius: 6,
  pointHoverRadius: 9
}));

new Chart(document.getElementById("graficoDispersion"), {
  type: 'scatter',
  data: { datasets: scatterDatasets },
  options: {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Experiencia (años)', color: '#cbd5e1' },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        title: { display: true, text: 'Rol', color: '#cbd5e1' },
        ticks: {
          color: '#e2e8f0',
          stepSize: 1,
          callback: v => roles[v - 1] || ''
        },
        min: 0.5,
        max: roles.length + 0.5,
        grid: { color: 'rgba(255,255,255,0.06)' }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.raw.label || '—'} — ${ctx.dataset.label} (${ctx.raw.x} años)`
        }
      },
      title: { display: true, text: 'Experiencia individual por Rol', color: '#e2e8f0', font: { size: 18 } },
      legend: { position: 'top', labels: { color: '#e2e8f0' } }
    }
  }
});


const gruposExp = {};
data.forEach(e => {
  const r = e.rol || "Sin rol";
  gruposExp[r] = gruposExp[r] || [];
  gruposExp[r].push(Number(e.experiencia) || 0);
});
const rolesProm = Object.keys(gruposExp);
const promedios = rolesProm.map(r => {
  const arr = gruposExp[r];
  const avg = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  return Number(avg.toFixed(1));
});
const coloresProm = rolesProm.map(r => roleColors[r] || '#818cf8');

new Chart(document.getElementById("graficoPorRol"), {
  type: 'bar',
  data: {
    labels: rolesProm,
    datasets: [{
      label: 'Promedio de experiencia (años)',
      data: promedios,
      backgroundColor: coloresProm,
      borderRadius: 8
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Años (promedio)', color: '#cbd5e1' },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        ticks: { color: '#e2e8f0' },
        grid: { display: false }
      }
    },
    plugins: {
      title: { display: true, text: 'Promedio de experiencia por Rol', color: '#e2e8f0', font: { size: 18 } },
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.formattedValue} años` } }
    }
  }
});

const resumenRol = {};
data.forEach(e => {
  if (!resumenRol[e.rol]) resumenRol[e.rol] = { total: 0, sumaExp: 0 };
  resumenRol[e.rol].total++;
  resumenRol[e.rol].sumaExp += e.experiencia;
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


  const gruposRol = {};
  data.forEach(e => {
    if (!gruposRol[e.rol]) gruposRol[e.rol] = [];
    gruposRol[e.rol].push(e);
  });


  if (ejeX === "calificacion") {
    const calificaciones = [1, 2, 3, 4, 5];
    const rolesUnicos = [...new Set(data.map(e => e.rol))];

    const datasets = rolesUnicos.map(rol => ({
      label: rol,
      data: calificaciones.map(c => data.filter(e => e.rol === rol && e.calificacion === c).length),
      backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));

    crearGrafico("bar", calificaciones.map(c => `Calificación ${c}`), datasets, "Cantidad de empleados por calificación y rol");
    return;
  }

  const etiquetas = Object.keys(gruposRol);

  if (operacion === "comparacion") {
   
    const promedios = etiquetas.map(rol => {
      const grupo = gruposRol[rol];
      const valores = grupo.map(e => e[ejeX]);
      return valores.reduce((a, b) => a + b, 0) / valores.length;
    });

    const maximos = etiquetas.map(rol =>
      Math.max(...gruposRol[rol].map(e => e[ejeX]))
    );

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

    crearGrafico(tipoGrafico, etiquetas, datasets, `Comparación de ${ejeX} por rol`);
    return;
  }


  const valores = etiquetas.map(rol => {
    const grupo = gruposRol[rol];
    if (operacion === "suma") {
      return grupo.reduce((sum, e) => sum + (e[ejeX] || 0), 0);
    } else if (operacion === "promedio") {
      return grupo.reduce((sum, e) => sum + (e[ejeX] || 0), 0) / grupo.length;
    }
  });

  const dataset = [{
    label: `${operacion.toUpperCase()} de ${ejeX} por rol`,
    data: valores,
    backgroundColor: '#42A5F5',
    borderColor: '#1E88E5',
    borderWidth: 2,
  }];

  crearGrafico(tipoGrafico, etiquetas, dataset, `${operacion} de ${ejeX} por rol`);
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