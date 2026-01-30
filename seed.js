
import mongoose from "mongoose";
import fs from 'fs';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/miDB';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const empleadoSchema = new mongoose.Schema({}, { strict: false });
const Empleado = mongoose.model('Empleado', empleadoSchema);

async function seed() {
  try {
    const raw = fs.readFileSync('./empleados.LOL.json', 'utf8');
    let docs = JSON.parse(raw);

    docs = docs.map(doc => {
      if (doc._id && doc._id.$oid) {
        delete doc._id; 
      }
      return doc;
    });

    await Empleado.deleteMany({});
    await Empleado.insertMany(docs);
    console.log('Seed completado. Documentos insertados:', docs.length);
  } catch (err) {
    console.error('Error en seed:', err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
