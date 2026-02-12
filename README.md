<div align="center">

# 📊 Employee Analytics Dashboard

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-latest-green?style=for-the-badge&logo=mongodb)
![Chart.js](https://img.shields.io/badge/Chart.js-4.x-ff6384?style=for-the-badge&logo=chart.js)

**Sistema completo de análisis y gestión de empleados con visualización de datos avanzada**

*Aplicación web full-stack para gestionar información de empleados, generar reportes interactivos y visualizar métricas clave con gráficos dinámicos.*

[![Live Demo](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)]()

[Características](#-características) • [Instalación](#-instalación) • [Estructura](#-estructura-del-proyecto) • [API](#-api-endpoints)

</div>

---

## 🎯 Descripción del Proyecto

Sistema web integral para la gestión y análisis de recursos humanos que permite:

- 📈 **Visualización de Datos** - Gráficos interactivos con Chart.js
- 👤 **Gestión de Empleados** - CRUD completo de información laboral
- 🔐 **Control de Acceso** - Sistema de autenticación con roles (Editor/Inspector)
- 📊 **Reportes Dinámicos** - Exportación de datos a PDF
- 🎨 **Dashboard Interactivo** - Interfaz moderna y responsive

---

## ✨ Características

### 📊 Sistema de Visualización

#### 1. **Gráficas por Calificación** (`graficas1.html`)
- Distribución de calificaciones (Alta, Media, Baja)
- Relación experiencia vs calificación
- Promedio por rol
- Cantidad de empleados por puntuación

#### 2. **Gráficas por Salario** (`graficas2.html`)
- Distribución salarial
- Relación experiencia vs salario
- Promedio salarial por rol

#### 3. **Gráficas por Rol** (`graficas3.html`)
- Distribución de roles en la empresa
- Relación experiencia vs rol
- Análisis de experiencia por cargo

#### 4. **Evolución Salarial** (`graficas4.html`)
- Comparación de salarios en el tiempo
- Selección de hasta 5 empleados
- Evolución desde fecha de ingreso hasta la actualidad

### 🎨 Generador de Gráficos Personalizado
Todas las páginas de gráficas incluyen un generador personalizado que permite:
- Seleccionar variable para eje X (Rol, Experiencia, Edad, Salario)
- Elegir operación (Suma, Promedio, Comparación)
- Tipo de gráfico (Barras, Líneas, Pastel, Radar)

### 👥 Sistema de Gestión

#### **Dashboard Principal** (`index.html`)
- Tabla interactiva con DataTables
- Visualización de métricas clave
- Exportación a PDF
- Gráficos de resumen

#### **Módulo de Auditoría** (`auditoria.html`)
- Actualización de datos de empleados
- Registro de cambios
- Control de quién edita qué

### 🔐 Sistema de Autenticación
- **Editor**: Puede modificar datos de empleados
- **Inspector**: Solo visualización (sin login requerido)
- Login seguro con validación

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno con gradientes y animaciones
- **Bootstrap 5.3** - Framework CSS responsive
- **JavaScript (Vanilla)** - Lógica del cliente
- **Chart.js** - Visualización de datos
- **DataTables** - Tablas interactivas
- **jsPDF** - Generación de PDFs

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **CORS** - Manejo de peticiones cross-origin
- **dotenv** - Variables de entorno

---

## 📁 Estructura del Proyecto
```
employee-analytics/
│
├── public/
│   ├── index.html              # Dashboard principal
│   ├── graficas1.html          # Gráficas por calificación
│   ├── graficas2.html          # Gráficas por salario
│   ├── graficas3.html          # Gráficas por rol
│   ├── graficas4.html          # Evolución temporal
│   ├── auditoria.html          # Módulo de edición
│   ├── login.html              # Autenticación
│   ├── resultado.html          # Vista de análisis
│   │
│   └── Js/
│       ├── App.js              # Lógica del dashboard
│       ├── AppGraficas1.js     # Gráficas calificación
│       ├── AppGraficas2.js     # Gráficas salario
│       ├── AppGraficas3.js     # Gráficas rol
│       ├── AppGraficas4.js     # Evolución temporal
│       ├── Appauditoria.js     # Lógica auditoría
│       └── Applogin.js         # Sistema login
│
├── server.js                   # Servidor Express
├── deep.env                    # Variables de entorno
├── package.json                # Dependencias
└── README.md
```

---

## 🚀 Instalación

### Prerrequisitos

- ✅ **Node.js** 18+ y npm instalados
- ✅ **MongoDB** corriendo localmente o en la nube
- ✅ Navegador web moderno

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/employee-analytics.git
cd employee-analytics
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `deep.env` en la raíz:
```env
MONGODB_URI=mongodb://localhost:27017/empleados_db
PORT=3000
```

4. **Iniciar el servidor**
```bash
node server.js
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

---

## 🔗 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/empleados` | Obtener todos los empleados |
| `POST` | `/api/login` | Autenticar usuario |
| `PUT` | `/api/empleados/:id` | Actualizar empleado |

### Estructura de Datos

#### Empleado
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 30,
  "experiencia": 5,
  "aspiracion_salarial": 50000,
  "rol": "Desarrollador",
  "calificacion": 4,
  "comentario": "Buen desempeño",
  "Gestor_convivencia": false,
  "sueldo_actual": 45000,
  "sueldo_inicial": 35000,
  "fecha_ingreso": "2020-01-15",
  "ultimocambio": "2026-02-02",
  "editado_por": "admin"
}
```

#### Usuario Auditoría
```json
{
  "nombre": "Admin",
  "apellido": "Sistema",
  "usuario": "admin",
  "contraseña": "password123"
}
```

---

## 🎨 Características de Diseño

### Paleta de Colores
```css
/* Fondo Principal */
background: linear-gradient(135deg, #0f172a, #1e293b);

/* Azul Primario */
--primary: #2563eb;
--primary-dark: #1d4ed8;

/* Texto */
--text-light: #e2e8f0;
--text-accent: #60a5fa;
```

### Animaciones
- ✨ Fade-in al cargar contenido
- 🎯 Hover effects en gráficos y tablas
- 🔄 Transiciones suaves entre vistas
- 📊 Animaciones de Chart.js

---

## 📊 Funcionalidades Detalladas

### Dashboard Principal
```javascript
// Funciones principales
- cargarEmpleados()      // Carga datos de la API
- mostrarGraficos()      // Renderiza visualizaciones
- exportarPDF()          // Genera reporte PDF
- iniciarDataTable()     // Tabla interactiva
```

### Sistema de Gráficos
- **4 tipos de gráficos**: Barras, Líneas, Pastel, Radar
- **Múltiples métricas**: Calificación, Salario, Rol, Experiencia
- **Operaciones**: Suma, Promedio, Comparación
- **Exportación**: PDF con gráficos incluidos

### Control de Acceso
```javascript
// Roles de usuario
Editor:    // Puede modificar datos
Inspector: // Solo lectura (sin login)
```

---

## 🔧 Uso del Sistema

### Como Inspector (Sin Login)
1. Acceder a `http://localhost:3000`
2. Click en "Entrar como Inspector"
3. Visualizar datos y gráficos
4. Exportar reportes

### Como Editor
1. Acceder a `http://localhost:3000/login.html`
2. Ingresar credenciales
3. Click en "Entrar como Editor"
4. Acceder al módulo de auditoría
5. Modificar información de empleados

### Generar Gráficos Personalizados
1. Click en "Crear Gráfico"
2. Seleccionar variable para eje X
3. Elegir operación matemática
4. Seleccionar tipo de gráfico
5. Click en "Generar Gráfico"

---

## 📱 Responsive Design

Compatible con:
- 📱 Móviles (< 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Desktop (> 1024px)

---

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
✅ Verificar que MongoDB esté corriendo
✅ Revisar variables de entorno en deep.env
✅ Confirmar que el puerto 3000 esté disponible
```

### No se muestran los datos
```bash
✅ Verificar conexión a MongoDB
✅ Comprobar que existan empleados en la BD
✅ Revisar console del navegador (F12)
```

### Error al exportar PDF
```bash
✅ Verificar que jsPDF esté cargado
✅ Comprobar que existan gráficos renderizados
```

---

## 👥 Autores

<div align="center">

| Developer | GitHub |
|-----------|--------|
| **Angel0zzx** | [@Angel0zzx](https://github.com/Angel0zzx) |
| **torgohd** | [@torgohd-sketch](https://github.com/torgohd-sketch) |
| **Julianzzx** | [@Julianzzx](https://github.com/Julianzzx) |

</div>

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

<div align="center">

**Hecho con 💙 usando JavaScript, Node.js y Chart.js**

⭐ **Si te gustó este proyecto, dale una estrella!** ⭐

[⬆ Volver arriba](#-employee-analytics-dashboard)

</div>
