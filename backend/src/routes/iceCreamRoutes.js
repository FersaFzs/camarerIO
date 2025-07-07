import express from 'express';
import { getIceCreams, createIceCream, deleteIceCream } from '../controllers/iceCreamController.js';

const router = express.Router();

router.get('/', getIceCreams);
router.post('/', createIceCream);
router.delete('/:id', deleteIceCream);

export default router; 