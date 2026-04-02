import Expense from '../models/Expense.js';

export const createExpense = async (req, res) => {
  try {
    const { supplierName, supplierNif, date, subtotal, taxAmount, total } = req.body;
    
    // Validaciones básicas
    if (!supplierName || !supplierNif || subtotal === undefined || taxAmount === undefined || total === undefined) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const expense = new Expense({
      supplierName,
      supplierNif,
      date: date || new Date(),
      subtotal,
      taxAmount,
      total
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error al registrar gasto:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
