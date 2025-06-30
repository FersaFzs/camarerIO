import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { connectDB } from './config/db.js'
import { createTestUser } from './controllers/authController.js'

const app = express()

// Configuración de CORS (comentada para evitar conflictos con index.js)
// app.use(cors({
//   origin: [
//     'http://localhost:5174', 
//     'http://127.0.0.1:5174',
//     'http://localhost:5173',
//     'https://camarerio-frontend.onrender.com'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// }))

// Middleware para parsear JSON
app.use(express.json())

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Rutas
app.use('/api', routes)

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' })
})

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Error en el servidor' })
})

// Conectar a la base de datos
connectDB()

// Crear usuario de prueba
createTestUser()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
}) 