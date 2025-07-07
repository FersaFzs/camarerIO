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
    // Enriquecer productos con nombre y precio actuales
    const enrichedProducts = await Promise.all(products.map(async (item) => {
      const prod = await Product.findById(item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        combination: item.combination,
        name: prod ? prod.name : item.name || '',
        price: prod ? prod.price : item.price || 0
      };
    }));
    const round = new Round({ tableNumber, products: enrichedProducts })
    await round.save()
    await round.populate('products.product')
    // Emitir evento
    req.io.emit('rounds:update', { tableNumber })
    res.status(201).json(round)
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
    // Enriquecer productos con nombre y precio actuales
    const enrichedProducts = await Promise.all(products.map(async (item) => {
      const prod = await Product.findById(item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        combination: item.combination,
        name: prod ? prod.name : item.name || '',
        price: prod ? prod.price : item.price || 0
      };
    }));
    round.products.push(...enrichedProducts)
    await round.save()
    await round.populate('products.product')
    // Emitir evento
    req.io.emit('rounds:update', { tableNumber: round.tableNumber })
    res.json(round)
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
    round.paidAt = new Date()
    await round.save()
    
    const updatedRound = await Round.findById(roundId).populate('products.product')
    // Emitir evento
    req.io.emit('rounds:update', { tableNumber: round.tableNumber })
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
      { 
        $set: { 
          isPaid: true,
          paidAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No se encontraron rondas activas para esta mesa' })
    }

    // Emitir evento
    req.io.emit('rounds:update', { tableNumber })
    res.json({ message: 'Todas las rondas han sido marcadas como pagadas' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Obtener el estado de ocupación de las mesas
export const getTableStatuses = async (req, res) => {
  try {
    // Encontrar todas las rondas no pagadas
    const rounds = await Round.find({ isPaid: false });
    console.log('Rondas encontradas:', rounds);
    
    // Crear un mapa para almacenar el estado de cada mesa
    const tableStatuses = new Map();
    
    // Procesar cada ronda
    rounds.forEach(round => {
      const tableNumber = round.tableNumber;
      const tieneProductos = round.products && round.products.length > 0;
      const isServiceConfirmed = round.isServiceConfirmed;
      console.log(`Procesando mesa ${tableNumber}:`, {
        tieneProductos,
        productos: round.products,
        isServiceConfirmed
      });
      
      if (tieneProductos) {
        if (isServiceConfirmed) {
          tableStatuses.set(tableNumber, 'occupied');
        } else {
          tableStatuses.set(tableNumber, 'serving');
        }
      }
      // Si no tiene productos, no se añade (mesa libre)
    });

    // Convertir el mapa a un array de objetos
    const formattedStatuses = Array.from(tableStatuses.entries()).map(([tableNumber, status]) => ({
      tableNumber,
      status
    }));

    console.log('Estados finales:', formattedStatuses);
    res.status(200).json(formattedStatuses);
  } catch (error) {
    console.error('Error en getTableStatuses:', error);
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
    // Enriquecer productos con nombre y precio actuales
    const enrichedProducts = await Promise.all(products.map(async (item) => {
      const prod = await Product.findById(item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        combination: item.combination,
        name: prod ? prod.name : item.name || '',
        price: prod ? prod.price : item.price || 0
      };
    }));
    round.products = enrichedProducts
    await round.save()
    const populatedRound = await Round.findById(roundId)
      .populate('products.product')
    res.status(200).json(populatedRound)
  } catch (error) {
    console.error('Error al actualizar productos de la ronda:', error)
    res.status(500).json({ message: 'Error al actualizar productos de la ronda' })
  }
}

// Confirmar el servicio de una mesa
export const confirmTableService = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    // Marcar todas las rondas no pagadas de la mesa como confirmadas
    const result = await Round.updateMany(
      { tableNumber, isPaid: false },
      { $set: { isServiceConfirmed: true } }
    );
    // Emitir evento
    req.io.emit('rounds:update', { tableNumber });
    res.json({ message: 'Servicio confirmado correctamente', updatedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cleanTableRounds = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    // Eliminar todas las rondas no pagadas de la mesa
    const result = await Round.deleteMany({ tableNumber, isPaid: false });
    // Emitir evento para actualizar en tiempo real
    if (req.io) {
      req.io.emit('rounds:update', { tableNumber });
    }
    res.json({ message: 'Mesa limpiada correctamente', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error al limpiar la mesa', error: error.message });
  }
};

export const moveTableRounds = async (req, res) => {
  try {
    const { fromTableNumber } = req.params;
    const { toTableNumber } = req.body;
    if (!toTableNumber) {
      return res.status(400).json({ message: 'Debes indicar la mesa destino' });
    }
    // Buscar todas las rondas no pagadas de la mesa origen
    const rounds = await Round.find({ tableNumber: fromTableNumber, isPaid: false });
    if (rounds.length === 0) {
      return res.status(404).json({ message: 'No hay rondas activas para mover' });
    }
    // Actualizar el número de mesa en todas las rondas
    await Round.updateMany(
      { tableNumber: fromTableNumber, isPaid: false },
      { $set: { tableNumber: toTableNumber } }
    );
    // Emitir evento para ambas mesas
    if (req.io) {
      req.io.emit('rounds:update', { tableNumber: fromTableNumber });
      req.io.emit('rounds:update', { tableNumber: toTableNumber });
    }
    res.json({ message: 'Rondas movidas correctamente', movedCount: rounds.length });
  } catch (error) {
    res.status(500).json({ message: 'Error al mover las rondas', error: error.message });
  }
}; 