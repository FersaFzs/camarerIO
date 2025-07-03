import mongoose from 'mongoose';
import Product from './src/models/Product.js';

const MONGO_URI = 'mongodb+srv://camarero:camarero123@clusterwaiterapp.xrmohqw.mongodb.net/?retryWrites=true&w=majority&appName=clusterWaiterApp';

async function actualizarCategorias() {
  await mongoose.connect(MONGO_URI);

  const result = await Product.updateMany(
    { $or: [{ category: { $exists: false } }, { category: null }, { category: '' }] },
    { $set: { category: 'Otros' } }
  );

  console.log('Productos actualizados:', result.modifiedCount);
  await mongoose.disconnect();
}

actualizarCategorias(); 