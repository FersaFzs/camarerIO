import express from 'express';
import { printPreTicket, printPaymentTicket } from '../controllers/printerController.js';

const router = express.Router();

router.post('/pre-ticket', printPreTicket);
router.post('/print-payment', printPaymentTicket);

export default router;
