import express from 'express'
import { createCustomTable, getCustomTables, deleteCustomTable, updateTablePosition, updateCustomTable } from '../controllers/tableController.js'

const router = express.Router()

// Obtener todas las mesas personalizadas
router.get('/', getCustomTables)
// Crear una nueva mesa personalizada
router.post('/custom', createCustomTable)
// Eliminar una mesa personalizada por su id
router.delete('/:id', deleteCustomTable)
router.put('/:id/position', updateTablePosition)
router.put('/:id', updateCustomTable)

export default router 