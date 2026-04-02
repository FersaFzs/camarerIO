import express from 'express';
import { createExpense, getExpenses } from '../controllers/expenseController.js';
// Asumiendo que existe un middleware de admin, si no, se deja publico
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createExpense); // En el futuro incluir: protect, admin
router.get('/', getExpenses);

export default router;
