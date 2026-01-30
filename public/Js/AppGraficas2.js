
async function init() {
      try {
        const res = await fetch('/api/empleados');
        const data = await res.json();

   
        const distribucion = { 'Alta (+9M)': 0, 'Media (5M–9M)': 0, 'Baja (-5M)': 0 };
        data.forEach(e => {
          if (e.sueldo_actual >= 9000000) distribucion['Alta (+9M)']++;
          else if (e.sueldo_actual >= 5000000) distribucion['Media (5M–9M)']++;
          else distribucion['Baja (-5M)']++;
        });

        new Chart(document.getElementById("graficoDistribucion"), {
          type: 'pie',
          data: {
            labels: Object.keys(distribucion),
            datasets: [{ data: Object.values(distribucion), backgroundColor: ['#4CAF50','#FFC107','#F44336'] }]
          },
          options: { plugins: { legend: { position: 'top' } } }
        });

        new Chart(document.getElementById("graficoDispersion"), {
          type: 'scatter',
          data: {
            datasets: [{
              label: 'Sueldo actual vs Experiencia',
              data: data.map(e => ({ x: e.experiencia, y: e.sueldo_actual })),
              backgroundColor: '#2196F3'
            }]
          },
          options: {
            scales: {
              x: { title: { display: true, text: 'Experiencia (años)' } },
              y: { title: { display: true, text: 'Sueldo actual ($)' } }
            }
          }
        });

      
        const grupos = {};
        data.forEach(e => {
          if (!grupos[e.rol]) grupos[e.rol] = [];
          grupos[e.rol].push(e.sueldo_actual);
        });
        const roles = Object.keys(grupos);
        const promedios = roles.map(r => grupos[r].reduce((a,b)=>a+b,0)/grupos[r].length);
        new Chart(document.getElementById("graficoPorRol"), {
          type: 'bar',
          data: { labels: roles, datasets: [{ label: 'Promedio salario', data: promedios, backgroundColor: '#42A5F5' }] },
          options: { indexAxis: 'y' }
        });

        const conteo = { "2M–5M":0, "5M–8M":0, "8M–10M":0, "10M–15M":0 };
        data.forEach(e=>{
          const s = e.sueldo_actual;
          if(s>=2000000 && s<5000000) conteo["2M–5M"]++;
          else if(s<8000000) conteo["5M–8M"]++;
          else if(s<10000000) conteo["8M–10M"]++;
          else if(s<=15000000) conteo["10M–15M"]++;
        });
        new Chart(document.getElementById("graficoPorSueldo"), {
          type: 'bar',
          data: { labels: Object.keys(conteo), datasets: [{ data: Object.values(conteo), backgroundColor: '#10b981' }] }
        });

   
let chart;
const selectOperacion = document.getElementById("operacion");
const selectTipoGrafico = document.getElementById("tipoGrafico");


selectOperacion.addEventListener("change", () => {
  const op = selectOperacion.value;
  selectTipoGrafico.innerHTML = '<option selected disabled>Selecciona tipo de gráfico</option>';
  const tipos = op === "comparacion" ? ["bar", "line"] : ["bar", "line", "pie", "radar"];
  tipos.forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    selectTipoGrafico.appendChild(o);
  });
});

document.getElementById("btnGenerar").addEventListener("click", () => {
  const ejeX = document.getElementById("ejeX").value;
  const operacion = document.getElementById("operacion").value;
  const tipo = document.getElementById("tipoGrafico").value;

  if (!ejeX || !operacion || !tipo) {
    alert("Completa todas las opciones antes de generar el gráfico");
    return;
  }

  const gruposSueldo = {};
  const TAM_RANGO = 2000000; 
  data.forEach(e => {
    const ri = Math.floor(e.sueldo_actual / TAM_RANGO) * TAM_RANGO;
    const rs = ri + TAM_RANGO;
    const etiqueta = `$${ri / 1000000}M–$${rs / 1000000}M`;
    if (!gruposSueldo[etiqueta]) gruposSueldo[etiqueta] = [];
    gruposSueldo[etiqueta].push(e);
  });
  const etiquetas = Object.keys(gruposSueldo);


  if (ejeX === "rol") {
    const roles = [...new Set(data.map(e => e.rol))];
    const datasets = roles.map(r => ({
      label: r,
      data: etiquetas.map(et => gruposSueldo[et].filter(e => e.rol === r).length),
      backgroundColor: `hsl(${Math.random() * 360},70%,60%)`
    }));
    crearGrafico("bar", etiquetas, datasets, "Empleados por rol y rango salarial");
    return;
  }

  
  if (ejeX === "fecha_ingreso") {
   
    const agruparPorMes = true;
    const gruposFecha = {};

    data.forEach(e => {
      if (!e.fecha_ingreso) return;
      const fecha = new Date(e.fecha_ingreso);
      if (isNaN(fecha)) return;
      const etiqueta = agruparPorMes
        ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
        : `${fecha.getFullYear()}`;

      if (!gruposFecha[etiqueta]) gruposFecha[etiqueta] = [];
      gruposFecha[etiqueta].push(e);
    });

    const etiquetasFecha = Object.keys(gruposFecha).sort();

    if (operacion === "comparacion") {
      const promedios = etiquetasFecha.map(et => {
        const grupo = gruposFecha[et];
        return grupo.reduce((s, e) => s + e.sueldo_actual, 0) / grupo.length;
      });
      const maximos = etiquetasFecha.map(et =>
        Math.max(...gruposFecha[et].map(e => e.sueldo_actual))
      );

      const datasets = [
        {
          label: "Promedio de sueldo actual",
          data: promedios,
          borderColor: "#42A5F5",
          backgroundColor: "#42A5F5",
          borderWidth: 2,
          fill: false
        },
        {
          label: "Máximo sueldo actual",
          data: maximos,
          borderColor: "#FB8C00",
          backgroundColor: "#FB8C00",
          borderWidth: 2,
          fill: false
        }
      ];

      crearGrafico(tipo, etiquetasFecha, datasets, "Sueldo promedio y máximo por fecha de ingreso");
      return;
    }

    const valores = etiquetasFecha.map(et => {
      const grupo = gruposFecha[et];
      return operacion === "suma"
        ? grupo.reduce((s, e) => s + e.sueldo_actual, 0)
        : grupo.reduce((s, e) => s + e.sueldo_actual, 0) / grupo.length;
    });

    const dataset = [{
      label: `${operacion.toUpperCase()} de sueldo_actual por fecha de ingreso`,
      data: valores,
      backgroundColor: "#42A5F5"
    }];

    crearGrafico(tipo, etiquetasFecha, dataset, `${operacion} de sueldo por fecha de ingreso`);
    return;
  }

  if (operacion === "comparacion") {
    const promedios = etiquetas.map(et => {
      const g = gruposSueldo[et];
      const v = g.map(e => e[ejeX]);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
    });
    const maximos = etiquetas.map(et =>
      Math.max(...gruposSueldo[et].map(e => e[ejeX]))
    );

    const datasets = [
      { label: `Promedio de ${ejeX}`, data: promedios, borderColor: "#42A5F5", borderWidth: 2 },
      { label: `Máximo de ${ejeX}`, data: maximos, borderColor: "#FB8C00", borderWidth: 2 }
    ];
    crearGrafico(tipo, etiquetas, datasets, `Comparación de ${ejeX}`);
  } else {
    const valores = etiquetas.map(et => {
      const g = gruposSueldo[et];
      if (!g.length) return 0;
      return operacion === "suma"
        ? g.reduce((s, e) => s + (e[ejeX] || 0), 0)
        : g.reduce((s, e) => s + (e[ejeX] || 0), 0) / g.length;
    });

    const dataset = [{
      label: `${operacion.toUpperCase()} de ${ejeX}`,
      data: valores,
      backgroundColor: "#42A5F5"
    }];
    crearGrafico(tipo, etiquetas, dataset, `${operacion} de ${ejeX}`);
  }
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
        title: { display: true, text: titulo, font: { size: 18 } },
        legend: { position: "top" }
      },
      scales: tipo !== "pie" && tipo !== "radar" ? { y: { beginAtZero: true } } : {}
    }
  });
}
  
      } catch(err) {
        console.error("Error al cargar empleados:", err);
      }
    }

    init();


    const btnMostrar=document.getElementById("mostrar");
    const btnVolver=document.getElementById("volver");
    const seccionGraficos=document.getElementById("graficos");
    const seccionCrear=document.querySelector(".creargrafico");

    btnMostrar.addEventListener("click",()=>{
      seccionGraficos.classList.add("fade-out");
      setTimeout(()=>{
        seccionGraficos.style.display="none";
        btnMostrar.style.display="none";
        btnVolver.style.display="inline-block";
        seccionCrear.style.display="block";
      },500);
    });

    btnVolver.addEventListener("click",()=>{
      seccionGraficos.style.display="flex";
      btnVolver.style.display="none";
      btnMostrar.style.display="inline-block";
      seccionCrear.style.display="none";
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