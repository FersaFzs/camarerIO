import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  tableNumber: {
    type: Number,
    required: true
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo', 'tarjeta'],
    default: 'efectivo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  roundIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round'
  }]
});

// Middleware para generar número de ticket automáticamente
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Obtener el último ticket del día
    const lastTicket = await this.constructor.findOne({
      ticketNumber: new RegExp(`^${year}${month}${day}`)
    }).sort({ ticketNumber: -1 });
    
    let sequence = '001';
    if (lastTicket) {
      const lastSequence = parseInt(lastTicket.ticketNumber.slice(-3));
      sequence = (lastSequence + 1).toString().padStart(3, '0');
    }
    
    this.ticketNumber = `${year}${month}${day}${sequence}`;
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket; 