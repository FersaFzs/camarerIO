import Ticket from '../models/Ticket.js';
import Round from '../models/Round.js';

export const generateTicket = async (req, res) => {
  try {
    const { tableNumber, roundIds, paymentMethod } = req.body;
    
    // Obtener las rondas
    const rounds = await Round.find({
      _id: { $in: roundIds }
    }).populate('products.product');
    
    // Preparar los items para el ticket
    const items = [];
    let total = 0;
    
    rounds.forEach(round => {
      round.products.forEach(item => {
        const itemTotal = item.quantity * (item.product?.price || 0);
        items.push({
          name: item.product?.name || 'Producto desconocido',
          quantity: item.quantity,
          price: item.product?.price || 0,
          total: itemTotal
        });
        total += itemTotal;
      });
    });
    
    // Crear el ticket
    const ticket = new Ticket({
      tableNumber,
      items,
      total,
      paymentMethod,
      roundIds
    });
    
    await ticket.save();
    
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error al generar ticket:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyTickets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tickets = await Ticket.find({
      createdAt: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 