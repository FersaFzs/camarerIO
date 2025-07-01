import express from 'express';
import { generateTicket, getTicket, getDailyTickets } from '../controllers/ticketController.js';

const router = express.Router();

router.post('/', generateTicket);
router.get('/:ticketId', getTicket);
router.get('/daily/all', getDailyTickets);

export default router; 