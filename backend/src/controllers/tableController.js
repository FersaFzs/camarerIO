import Table from '../models/Table.js'

// Crear una nueva mesa personalizada
export const createCustomTable = async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre de la mesa es obligatorio' })
    }
    // Comprobar si ya existe una mesa con ese nombre
    const existing = await Table.findOne({ name: name.trim() })
    if (existing) {
      return res.status(409).json({ message: 'Ya existe una mesa con ese nombre' })
    }
    // Buscar el número más alto entre mesas personalizadas y numeradas
    const maxCustom = await Table.findOne().sort({ number: -1 })
    // El número más alto de las mesas numeradas (1-10)
    const maxNumber = Math.max(10, maxCustom ? maxCustom.number : 10)
    const nextNumber = maxNumber + 1
    const table = new Table({ name: name.trim(), number: nextNumber })
    await table.save()
    res.status(201).json(table)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener todas las mesas personalizadas
export const getCustomTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ createdAt: 1 })
    res.status(200).json(tables)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteCustomTable = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Table.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Mesa personalizada no encontrada' })
    }
    res.status(200).json({ message: 'Mesa personalizada eliminada' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
} 