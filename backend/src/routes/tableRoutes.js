import express from 'express'
import { createCustomTable, getCustomTables, deleteCustomTable } from '../controllers/tableController.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Obtener todas las mesas personalizadas
router.get('/', requireAuth, getCustomTables)
// Crear una nueva mesa personalizada
router.post('/custom', requireAuth, createCustomTable)
// Eliminar una mesa personalizada por su id
router.delete('/:id', requireAuth, requireAdmin, deleteCustomTable)

export default router 