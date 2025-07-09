import mongoose from 'mongoose';
import Table from '../src/models/Table.js';

// URI de Atlas proporcionada por el usuario
const uri = 'mongodb+srv://camarero:camarero123@clusterwaiterapp.xrmohqw.mongodb.net/?retryWrites=true&w=majority&appName=clusterWaiterApp';

console.warn('⚠️  ATENCIÓN: Este script actúa sobre la base de datos de producción en Atlas.');
console.warn('URI utilizada:', uri);

async function limpiarMesasCorruptas() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB Atlas');

    // Eliminar mesas corruptas
    const res = await Table.deleteMany({ $or: [ { number: null }, { number: { $exists: false } } ] });
    console.log(`🧹 Mesas corruptas eliminadas: ${res.deletedCount}`);

    // Eliminar índice único antiguo (si existe)
    try {
      await Table.collection.dropIndex('number_1');
      console.log('🗑️ Índice único sobre number eliminado');
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log('ℹ️ No existía índice único sobre number');
      } else {
        throw err;
      }
    }

    // Crear índice único de nuevo
    await Table.collection.createIndex({ number: 1 }, { unique: true });
    console.log('✅ Índice único sobre number recreado');
  } catch (err) {
    console.error('❌ Error durante la limpieza:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB Atlas');
  }
}

limpiarMesasCorruptas(); 