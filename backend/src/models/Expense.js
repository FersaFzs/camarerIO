import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true
  },
  supplierNif: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  subtotal: {
    type: Number,
    required: true // Base
  },
  taxAmount: {
    type: Number,
    required: true // IVA
  },
  total: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
