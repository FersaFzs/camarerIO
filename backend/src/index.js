import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import authRoutes from './routes/authRoutes.js'
import roundRoutes from './routes/roundRoutes.js'
import productRoutes from './routes/productRoutes.js'
import accountingRoutes from './routes/accountingRoutes.js'
import tableRoutes from './routes/tableRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js'
import { createTestUser } from './controllers/authController.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const server = http.createServer(app)

// Configuración de CORS unificada
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.119.83:5174',
    'https://camarerio-frontend.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}

const io = new SocketIOServer(server, {
  cors: corsOptions
})

// Middleware para exponer io en req
app.use((req, res, next) => {
  req.io = io
  next()
})

// Aplicar CORS
app.use(cors(corsOptions))

// Middleware específico para preflight requests
app.options('*', cors(corsOptions))

// Middleware de debug para CORS
app.use((req, res, next) => {
  console.log('CORS Debug - Origin:', req.headers.origin)
  console.log('CORS Debug - Method:', req.method)
  console.log('CORS Debug - Headers:', req.headers)
  next()
})

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

app.use(express.json())

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' })
})

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/rounds', roundRoutes)
app.use('/api/products', productRoutes)
app.use('/api/accounting', accountingRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/tickets', ticketRoutes)

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

// Puerto
const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`API disponible en http://localhost:${PORT}/api`)
}) 