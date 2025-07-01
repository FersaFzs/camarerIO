import express from 'express';
import { generateTicket, getTicket, getDailyTickets } from '../controllers/ticketController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, generateTicket);
router.get('/:ticketId', requireAuth, getTicket);
router.get('/daily/all', requireAuth, getDailyTickets);

export default router; 