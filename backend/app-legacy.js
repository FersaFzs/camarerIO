import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import roundRoutes from './src/routes/roundRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import accountingRoutes from './src/routes/accountingRoutes.js';
import tableRoutes from './src/routes/tableRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';
import { createTestUser } from './src/controllers/authController.js';

dotenv.config();

const app = express();

// Configuración CORS correcta
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://camarerio-frontend.onrender.com'],
  credentials: true
}));

app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/products', productRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/tickets', ticketRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waiterapp')
  .then(() => {
    console.log('Conectado a MongoDB');
    // Crear usuario de prueba
    createTestUser();
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
  });

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Backend funcionando ✅'));

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

