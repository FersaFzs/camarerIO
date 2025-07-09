import mongoose from 'mongoose';
import Table from '../src/models/Table.js';

// URI de Atlas proporcionada por el usuario
const uri = 'mongodb+srv://camarero:camarero123@clusterwaiterapp.xrmohqw.mongodb.net/?retryWrites=true&w=majority&appName=clusterWaiterApp';

console.warn('⚠️  ATENCIÓN: Este script actúa sobre la base de datos de producción en Atlas.');
console.warn('URI utilizada:', uri);

async function crearMesasNumeradas() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB Atlas');

    let creadas = 0;
    for (let i = 1; i <= 10; i++) {
      const existe = await Table.findOne({ number: i });
      if (!existe) {
        await Table.create({
          name: `Mesa ${i}`,
          number: i,
          x: 0,
          y: 0
        });
        console.log(`🆕 Mesa ${i} creada`);
        creadas++;
      } else {
        console.log(`✔️ Mesa ${i} ya existe`);
      }
    }
    if (creadas === 0) {
      console.log('✅ Todas las mesas numeradas (1-10) ya existen.');
    } else {
      console.log(`✅ Mesas creadas: ${creadas}`);
    }
  } catch (err) {
    console.error('❌ Error al crear mesas numeradas:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB Atlas');
  }
}

crearMesasNumeradas(); 