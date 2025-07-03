import express from 'express';
import { getLiqueurs, createLiqueur, deleteLiqueur } from '../controllers/liquorController.js';

const router = express.Router();

router.get('/', getLiqueurs);
router.post('/', createLiqueur);
router.delete('/:id', deleteLiqueur);

export default router; 