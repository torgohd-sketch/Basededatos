
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { fileURLToPath } from "url";

// Para usar __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: "./deep.env" });

const app = express();

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));

const empleadoSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  edad: Number,
  experiencia: Number,
  aspiracion_salarial: Number,
  rol: String,
  calificacion: Number,
  comentario: mongoose.Schema.Types.Mixed,
  Gestor_convivencia: Boolean,
  sueldo_actual: Number,
  sueldo_inicial: Number,
  fecha_ingreso: Date,
  ultimocambio: Date,
  editado_por: { type: String }

}, { strict: false });

const AuditoriaSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  usuario: String,
  contraseña: String
}, { strict: false
});

const Empleado = mongoose.model("Empleado", empleadoSchema);

const Auditoria = mongoose.model("Auditoria", AuditoriaSchema, "Auditoria");

app.get("/api/empleados", async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.json(empleados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    const user = await Auditoria.findOne({ usuario });

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    if (user.contraseña !== contraseña) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    res.json({
      success: true,
      message: `Bienvenido ${user.nombre} ${user.apellido}`,
      user: {
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
      }
    });

  } catch (error) {
    console.error("Error en /api/login:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

app.put("/api/empleados/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, edad, aspiracion_salarial, editado_por, fecha_ultimo_cambio, sueldo_actual, sueldo_inicial, calificacion } = req.body;

    const resultado = await Empleado.findByIdAndUpdate(
      id,
      {
        nombre,
        apellido,
        edad,
        aspiracion_salarial,
        editado_por,
        fecha_ultimo_cambio,
        sueldo_actual,
        sueldo_inicial,
        calificacion
      },
      { new: true }
    );

    res.json({ success: true, message: "Empleado actualizado", empleado: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al actualizar empleado" });
  }
});

app.post("/api/analizar-empleados", async (req, res) => {
  try {
    const empleados = await Empleado.find().limit(5);
    if (!empleados.length) {
      return res.status(400).json({ error: "No hay empleados para analizar" });
    }

    const datosResumen = empleados.map(emp => ({
      nombre: emp.nombre,
      edad: emp.edad,
      puntuacion: emp.calificacion,
      experiencia: emp.experiencia,
      aspiracion_salarial: emp.aspiracion_salarial,
      comentario: emp.comentario || "Sin comentarios",
    }));

    const prompt = `
Analiza la relación entre ASPIRACIÓN SALARIAL y EXPERIENCIA/PUNTUACIÓN de estos empleados:
${JSON.stringify(datosResumen, null, 2)}
Responde en español, máximo 250 palabras.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({
      success: true,
      analysis: completion.choices[0].message.content,
      empleadosAnalizados: datosResumen.length
    });

  } catch (error) {
    console.error("Error en OpenAI API:", error.message);
    res.status(500).json({ error: "Error en el análisis con IA", mensaje: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));

console.log("🔑 OPENAI_API_KEY cargada:", process.env.OPENAI_API_KEY ? "✅ OK" : "❌ FALTA");
