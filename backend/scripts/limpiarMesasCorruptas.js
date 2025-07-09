import mongoose from 'mongoose';
import Table from '../src/models/Table.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('No se ha encontrado la variable MONGODB_URI en el entorno.');
  process.exit(1);
}

async function limpiar() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await Table.deleteMany({
      $or: [
        { number: null },
        { number: { $exists: false } }
      ]
    });
    console.log(`Mesas corruptas eliminadas: ${result.deletedCount}`);
  } catch (err) {
    console.error('Error limpiando mesas corruptas:', err);
  } finally {
    await mongoose.disconnect();
  }
}

limpiar(); 