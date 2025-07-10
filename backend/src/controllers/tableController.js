import Table from '../models/Table.js'

// Crear una nueva mesa personalizada
export const createCustomTable = async (req, res) => {
  try {
    const { name, number } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre de la mesa es obligatorio' });
    }
    if (number === null || number === undefined || typeof number !== 'number' || isNaN(number)) {
      return res.status(400).json({ message: 'El número de mesa es obligatorio y debe ser un número válido.' });
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
    const table = new Table({ name: name.trim(), number })
    await table.save()
    // Emitir evento para que todos los clientes recarguen mesas
    req.io.emit('tables:update')
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
    // Emitir evento para que todos los clientes recarguen mesas
    req.io.emit('tables:update')
    res.status(200).json({ message: 'Mesa personalizada eliminada' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar la posición de una mesa personalizada
export const updateTablePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { x, y } = req.body;
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    if (typeof x === 'number') table.x = x;
    if (typeof y === 'number') table.y = y;
    await table.save();
    req.io.emit('tables:update');
    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Actualizar una mesa por su ID
export const updateCustomTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number } = req.body;
    const updated = await Table.findByIdAndUpdate(
      id,
      { name, number },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    if (req.io) req.io.emit('tables:update');
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 