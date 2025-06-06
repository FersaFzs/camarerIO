import Round from '../models/Round.js'
import Product from '../models/Product.js'

// Obtener todas las rondas de una mesa
export const getTableRounds = async (req, res) => {
  try {
    const { tableNumber } = req.params
    
    // Obtener todas las rondas no pagadas de la mesa
    const rounds = await Round.find({ tableNumber, isPaid: false })
      .populate('products.product')
    
    // Calcular el total de todas las rondas
    const total = rounds.reduce((acc, round) => {
      const roundTotal = round.products.reduce((roundAcc, item) => {
        return roundAcc + (item.product?.price || 0) * item.quantity
      }, 0)
      return acc + roundTotal
    }, 0)

    // Devolver las rondas y el total
    res.json({
      rounds,
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Crear una nueva ronda
export const createRound = async (req, res) => {
  try {
    const { tableNumber, products } = req.body
    const round = new Round({ tableNumber, products })
    await round.save()
    // Poblar los productos después de guardar
    const populatedRound = await Round.findById(round._id).populate('products.product')
    res.status(201).json(populatedRound)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Añadir productos a una ronda existente
export const addProductsToRound = async (req, res) => {
  try {
    const { roundId } = req.params
    const { products } = req.body
    const round = await Round.findById(roundId)
    
    if (!round) {
      return res.status(404).json({ message: 'Ronda no encontrada' })
    }

    round.products.push(...products)
    await round.save()
    // Poblar los productos después de actualizar
    const updatedRound = await Round.findById(roundId).populate('products.product')
    res.json(updatedRound)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Marcar una ronda como pagada
export const markRoundAsPaid = async (req, res) => {
  try {
    const { roundId } = req.params
    const round = await Round.findById(roundId)
    
    if (!round) {
      return res.status(404).json({ message: 'Ronda no encontrada' })
    }

    round.isPaid = true
    await round.save()
    
    // Poblar los productos después de actualizar
    const updatedRound = await Round.findById(roundId).populate('products.product')
    res.json(updatedRound)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Marcar todas las rondas de una mesa como pagadas
export const markAllRoundsAsPaid = async (req, res) => {
  try {
    const { tableNumber } = req.params
    
    // Encontrar y marcar como pagadas todas las rondas no pagadas de la mesa
    const result = await Round.updateMany(
      { tableNumber, isPaid: false },
      { $set: { isPaid: true } }
    )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No se encontraron rondas activas para esta mesa' })
    }

    res.json({ message: 'Todas las rondas han sido marcadas como pagadas' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Obtener el estado de ocupación de las mesas
export const getTableStatuses = async (req, res) => {
  try {
    // Encontrar todas las rondas no pagadas y agrupar por numero de mesa
    const occupiedTables = await Round.aggregate([
      { $match: { isPaid: false } },
      { $group: { _id: '$tableNumber' } }
    ]);

    // Extraer solo los numeros de mesa
    const occupiedTableNumbers = occupiedTables.map(item => item._id);

    res.status(200).json(occupiedTableNumbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar productos de una ronda
export const updateRoundProducts = async (req, res) => {
  try {
    const { roundId } = req.params
    const { products } = req.body

    const round = await Round.findById(roundId)
    if (!round) {
      return res.status(404).json({ message: 'Ronda no encontrada' })
    }

    round.products = products
    await round.save()

    const populatedRound = await Round.findById(roundId)
      .populate('products.product')

    res.status(200).json(populatedRound)
  } catch (error) {
    console.error('Error al actualizar productos de la ronda:', error)
    res.status(500).json({ message: 'Error al actualizar productos de la ronda' })
  }
} 