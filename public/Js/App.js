
  async function init() {
    try {
      const res = await fetch('/api/empleados');
      const data = await res.json();

      

     $('#tablaEmpleados').DataTable( {
    ajax: {
        url: '/api/empleados',
        dataSrc: ''
    },
    columns: [
  { data: 'nombre' },
  { data: 'apellido' },
  { data: 'edad' },
  { data: 'experiencia' },
  { data: 'aspiracion_salarial', render: $.fn.dataTable.render.number(',', '.', 0, '$') },
  { data: 'rol' },
  { data: 'calificacion' },
  { data: 'comentario.texto', defaultContent: 'Sin comentario' },
  {
    data: 'gestor_convivencia',
    render: function (data, type, row) {
      if (row.calificacion === 5 && data === true) {
        return '<span style="color:green; font-weight:bold;">Sí</span>';
      } else {
        return '<span style="color:gray;">No</span>';
      }
    }
  },
  { data: 'sueldo_inicial', render: $.fn.dataTable.render.number(',', '.', 0, '$') },
  { data: 'sueldo_actual', render: $.fn.dataTable.render.number(',', '.', 0, '$') },
  { 
    data: 'fecha_ingreso', 
    render: function(data) {
      if (!data) return '';
      const date = new Date(data);
      return date.toLocaleDateString();
    } 
  },
  { 
    data: 'fecha_ultimo_cambio',
    render: function(data) {
      if (!data) return '—';
      const fecha = new Date(data);
      return fecha.toLocaleString(); // Muestra fecha y hora
    }
  },
  { 
    data: 'editado_por',
    defaultContent: '—'
  }
],
    responsive: true,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50]
} );


  
      const calificaciones = {};
      const roles = {};
      data.forEach(emp => {
        calificaciones[emp.calificacion] = (calificaciones[emp.calificacion] || 0) + 1;
        roles[emp.rol] = (roles[emp.rol] || 0) + 1;
      });

const promedioSalarial = {};
const contador = {};

data.forEach(emp => {
  const cal = emp.calificacion;
  promedioSalarial[cal] = (promedioSalarial[cal] || 0) + emp.aspiracion_salarial;
  contador[cal] = (contador[cal] || 0) + 1;
});

Object.keys(promedioSalarial).forEach(cal => {
  promedioSalarial[cal] = promedioSalarial[cal] / contador[cal];
});

new Chart(document.getElementById('chartCalificaciones').getContext('2d'), {
  type: 'polarArea', 
  data: {
    labels: Object.keys(calificaciones),
    datasets: [{
      label: 'Calificaciones',
      data: Object.values(calificaciones),
      backgroundColor: [
        'rgba(75, 123, 236, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: {
        display: true,
        text: 'Por Calificaciones',
        font: { size: 20, weight: 'bold' },
        padding: { bottom: 20 }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutElastic'
    }
  }
});

const ctxRoles = document.getElementById('chartRoles').getContext('2d');

const dataBubble = data.map(emp => ({
  x: emp.edad,              
  y: emp.experiencia,         
  r: emp.rol === 'Master' ? 12 : 8,
  rol: emp.rol
}));

new Chart(ctxRoles, {
  type: 'bubble',
  data: {
    datasets: [{
      label: 'Empleados',
      data: dataBubble,
      backgroundColor: dataBubble.map(emp => emp.rol === ' Master' ? 'rgba(54,162,235,0.6)' : 'rgba(255,206,86,0.6)'),
      borderColor: '#fff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `Edad: ${ctx.raw.x}, Exp: ${ctx.raw.y}, Rol: ${ctx.raw.rol}`
        }
      },
      title: {
        display: true,
        text: 'Por rol',
        font: { size: 20, weight: 'bold' }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Edad' } },
      y: { title: { display: true, text: 'Años de experiencia' } }
    }
  }
});

const ctxPromedio = document.getElementById('chartPromedioSalarial').getContext('2d');
const gradient = ctxPromedio.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(75, 123, 236, 0.6)');
gradient.addColorStop(1, 'rgba(75, 123, 236, 0)');

new Chart(ctxPromedio, {
  type: 'line',
  data: {
    labels: Object.keys(promedioSalarial),
    datasets: [{
      label: 'Promedio Aspiración Salarial',
      data: Object.values(promedioSalarial),
      fill: true,
      backgroundColor: gradient,
      borderColor: 'rgba(75, 123, 236, 1)',
      tension: 0.3, 
      pointRadius: 5,
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgba(75, 123, 236, 1)'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Por Salario',
        font: { size: 20, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.1)' },
        title: { display: true, text: 'Salario promedio' }
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        title: { display: true, text: 'Calificación' }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  }

});


const total_inicial = data.reduce((sum, e) => sum + (e.sueldo_inicial || 0), 0);
  const total_actual = data.reduce((sum, e) => sum + (e.sueldo_actual || 0), 0);

  const ctxx = document.getElementById("chartsueldos").getContext("2d");

  new Chart(ctxx, {
    type: "bar",
    data: {
      labels: ["Totales Sueldos"],
      datasets: [
        {
          label: "Sueldo Inicial Total",
          data: [total_inicial],
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        },
        {
          label: "Sueldo Actual Total",
          data: [total_actual],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Sueldo Total ($)" }
        }
      },
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: "Por fecha"
        }
      }
    }
  });


 } catch (err) {
      console.error('Error al cargar empleados:', err);
    }
  }


  init();

  document.getElementById('analizarBtn').addEventListener('click', async () => {
    try {
      const resIA = await fetch('/api/analizar-empleados', { method: 'POST' });
      const data = await resIA.json();

      if (data.success) {
        localStorage.setItem('analisisIA', data.analysis);
        window.location.href = '/analisis.html';
      } else {
        alert("Error en IA: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con la IA");
    }
  });

  


  document.getElementById('exportPdfBtn').addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  async function addChartToPDF(chartId, title, yPos) {
    const canvas = document.getElementById(chartId);
    const imgData = canvas.toDataURL('image/png');
    doc.setFontSize(14);
    doc.text(title, 15, yPos - 10);
    doc.addImage(imgData, 'PNG', 15, yPos, 180, 90);
  }

  let y = 20;
  await addChartToPDF('chartCalificaciones', 'Gráfico de Calificaciones', y);
  y += 100;
  await addChartToPDF('chartRoles', 'Gráfico de Roles', y);
  y += 100;
  await addChartToPDF('chartPromedioSalarial', 'Gráfico de Salarios', y);


  doc.addPage();

  const table = document.getElementById('tablaEmpleados');
  let headers = [];
  let rows = [];


  table.querySelectorAll('thead th').forEach(th => headers.push(th.textContent.trim()));


  table.querySelectorAll('tbody tr').forEach(tr => {
    let row = [];
    tr.querySelectorAll('td').forEach(td => row.push(td.textContent.trim()));
    rows.push(row);
  });

 
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185] }, 
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });

  doc.save("dashboard_empleados.pdf");
});


function mostrarConAnimacion(el) {
  el.classList.remove('fade-out');
  el.style.display = 'flex'; 
  el.classList.add('fade-in');
}

function ocultarConAnimacion(el) {
  el.classList.remove('fade-in');
  el.classList.add('fade-out');
  el.addEventListener('animationend', () => {
    el.style.display = 'none';
  }, { once: true });
}

document.getElementById('mostrar').addEventListener('click', () => {
  const tabla = document.getElementById('tabla');
  const charts = document.querySelector('.charts');
  const botonesxd = document.querySelector('.botonesxd');
  const Mostrartabla = document.getElementById('Mostrartabla');

  ocultarConAnimacion(tabla);
  mostrarConAnimacion(charts);
  mostrarConAnimacion(botonesxd);
  mostrarConAnimacion(Mostrartabla);
});

document.getElementById('Mostrartabla').addEventListener('click', () => {
  const tabla = document.getElementById('tabla');
  const charts = document.querySelector('.charts');
  const botonesxd = document.querySelector('.botonesxd');
  const Mostrartabla = document.getElementById('Mostrartabla');

  ocultarConAnimacion(charts);
  ocultarConAnimacion(botonesxd);
  ocultarConAnimacion(Mostrartabla);
  mostrarConAnimacion(tabla);
});

const canvas = document.getElementById("chartCalificaciones");
const canvas2 = document.getElementById("chartPromedioSalarial");
const canvas3 = document.getElementById("chartRoles");
const canvas4 = document.getElementById("chartsueldos");

  canvas.style.cursor = "pointer";
  canvas2.style.cursor = "pointer";
  canvas3.style.cursor = "pointer";
  canvas4.style.cursor = "pointer";

  canvas.addEventListener("click", () => {
   window.open("graficas1.html", "_blank");
  });

canvas2.addEventListener("click", () => {
   window.open("graficas2.html", "_blank");
  });

  canvas3.addEventListener("click", () => {
    window.open("graficas3.html", "_blank");
  });

  canvas4.addEventListener("click", () => {
    window.open("graficas4.html", "_blank");
  });

  document.getElementById('Iniciar_secion').addEventListener('click', () => {
    window.location.href = 'login.html';
  });