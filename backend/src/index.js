import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import roundRoutes from './routes/roundRoutes.js'
import productRoutes from './routes/productRoutes.js'
import { createTestUser } from './controllers/authController.js'

dotenv.config()

const app = express()

// Configuración de CORS más específica
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

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

// Puerto
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`API disponible en http://localhost:${PORT}/api`)
}) 