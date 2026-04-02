import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
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
  subtotal: {
    type: Number,
    required: true // Base imponible
  },
  taxRate: {
    type: Number,
    default: 21,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true // Cuota IVA
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo', 'tarjeta'],
    default: 'efectivo'
  },
  previousHash: {
    type: String,
    default: '' // El primer ticket del sistema no tendrá previous hash, o será vacío
  },
  hash: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
