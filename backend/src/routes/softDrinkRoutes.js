import express from 'express';
import { getSoftDrinks, createSoftDrink, deleteSoftDrink } from '../controllers/softDrinkController.js';

const router = express.Router();

router.get('/', getSoftDrinks);
router.post('/', createSoftDrink);
router.delete('/:id', deleteSoftDrink);

export default router; 