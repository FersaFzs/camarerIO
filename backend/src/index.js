import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import router from './routes/index.js'
import { createTestUser } from './controllers/authController.js'
import cron from 'node-cron'
import { resetDailyStats } from './controllers/accountingController.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const server = http.createServer(app)

// Configuración CORS simple y funcional
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://camarerio-frontend.onrender.com'],
  credentials: true
}))

const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://camarerio-frontend.onrender.com'],
    credentials: true
  }
})

// Middleware para exponer io en req
app.use((req, res, next) => {
  req.io = io
  next()
})

app.use(express.json())

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Content-Security-Policy segura y flexible
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https://camarerio.onrender.com; connect-src 'self' https://camarerio.onrender.com; style-src 'self' 'unsafe-inline'; script-src 'self';"
  );
  next();
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' })
})

// Rutas
app.use('/api', router)

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waiterapp')
  .then(() => {
    console.log('Conectado a MongoDB')
    // Crear usuario de prueba
    createTestUser()
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error)
  })

// Socket.IO eventos básicos
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id)
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})

// Programar el reseteo diario a las 5am
cron.schedule('0 5 * * *', async () => {
  try {
    await resetDailyStats({},{ status: () => ({ json: () => {} }) });
    console.log('Reseteo diario ejecutado automáticamente a las 5am');
  } catch (err) {
    console.error('Error en el reseteo diario automático:', err);
  }
});

// Puerto
const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`API disponible en http://localhost:${PORT}/api`)
}) 