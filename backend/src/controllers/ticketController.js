import Ticket from '../models/Ticket.js';
import Round from '../models/Round.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';
import PrinterService from '../services/PrinterService.js';
import crypto from 'crypto';

export const generateTicket = async (req, res) => {
  try {
    const { tableNumber, roundIds, paymentMethod, skipPrint, amountGiven } = req.body;
    
    // Obtener las rondas no pagadas correspondientes a los roundIds dados
    const rounds = await Round.find({
      _id: { $in: roundIds },
      isPaid: false
    }).populate('products.product');

    if (rounds.length === 0) {
      return res.status(400).json({ message: 'No hay rondas pendientes para cobrar con los IDs proporcionados.' });
    }
    
    // Preparar los items para el ticket
    const items = [];
    let total = 0;
    const productIdsToDelete = [];
    
    for (const round of rounds) {
      for (const item of round.products) {
        // Deducir stock si está registrado
        if (item.product && item.product.isTracked) {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity }
          });
        }

        const itemTotal = item.quantity * (item.product?.price || item.price || 0);
        items.push({
          name: item.product?.name || item.name || 'Producto desconocido',
          quantity: item.quantity,
          price: item.product?.price || item.price || 0,
          total: itemTotal
        });
        total += itemTotal;

        // Limpiar productos personalizados basados en la categoría del producto poblado
        if (
          (item.name && item.product?.category === 'Helados' && (item.name.startsWith('Helado +') || item.name.startsWith('Copa de helado +'))) ||
          (item.name && item.product?.category === 'Copas' && item.name.includes(' + '))
        ) {
          productIdsToDelete.push(item.product._id);
        }
      }
      
      // Marcar ronda como pagada
      round.isPaid = true;
      round.paidAt = new Date();
      await round.save();
    }
    
    // Crear el ticket normal
    const ticket = new Ticket({
      tableNumber,
      items,
      total,
      paymentMethod,
      roundIds
    });
    
    await ticket.save();

    // Lógica VeriFactu (Facturacion legal)
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `F-${year}${month}-`;
    
    const lastInvoice = await Invoice.findOne({
      invoiceNumber: new RegExp(`^${prefix}`)
    }).sort({ invoiceNumber: -1 });

    let seq = 1;
    let previousHash = '';
    if (lastInvoice) {
      seq = parseInt(lastInvoice.invoiceNumber.split('-')[2]) + 1;
      previousHash = lastInvoice.hash;
    }
    const invoiceNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    const subtotal = total / 1.10; // Base Imponible (10% IVA global para hosteleria)
    const taxAmount = total - subtotal; // Cuota IVA

    // Generar Hash encadenado
    const hashData = `${previousHash}${invoiceNumber}${date.toISOString()}${total}`;
    const hash = crypto.createHash('sha256').update(hashData).digest('hex');

    const invoice = new Invoice({
      invoiceNumber,
      date,
      tableNumber,
      items,
      subtotal,
      taxRate: 10,
      taxAmount,
      total,
      paymentMethod,
      previousHash,
      hash,
      amountGiven
    });
    await invoice.save();

    // Eliminar productos temporales generados al aire libre
    if (productIdsToDelete.length > 0) {
      await Product.deleteMany({ _id: { $in: productIdsToDelete } });
    }

    // Emitir el Ticket Legal y abrir cajón a través del puente (si no es cobro manual sin caja)
    if (!skipPrint) {
      try {
        const invoiceDataWithGiven = { ...invoice.toObject(), amountGiven };
        const legalTicketText = PrinterService.generateLegalTicketString(invoiceDataWithGiven);
        await PrinterService.printTicket(req.io, legalTicketText);
        if (paymentMethod === 'efectivo') {
          await PrinterService.openDrawer(req.io);
        }
      } catch (printError) {
        // Registramos el error de impresión pero no rompemos el flujo.
        // La factura y las rondas ya están guardadas (no habrá duplicaciones).
        console.error('Error al imprimir o abrir cajón (Hardware). Factura guardada.', printError.message);
      }
    }

    // Emitir websocket actualizando la mesa
    if (req.io) {
      req.io.emit('rounds:update', { tableNumber });
    }
    
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