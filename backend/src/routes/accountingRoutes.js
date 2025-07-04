import express from 'express';
import { getDailyStats, getMonthlyStats, getPreviousMonths, resetDailyStats, resetTotalStats } from '../controllers/accountingController.js';

const router = express.Router();

// @route   GET /api/accounting/daily
// @desc    Get daily statistics
// @access  Public
router.get('/daily', getDailyStats);

// @route   POST /api/accounting/reset-daily
// @desc    Reset daily statistics
// @access  Public
router.post('/reset-daily', resetDailyStats);

// @route   GET /api/accounting/monthly
// @desc    Get monthly statistics
// @access  Public
router.get('/monthly', getMonthlyStats);

// @route   GET /api/accounting/previous-months
// @desc    Get statistics for previous months
// @access  Public
router.get('/previous-months', getPreviousMonths);

// @route   POST /api/accounting/reset-total
// @desc    Reset total statistics
// @access  Public
router.post('/reset-total', resetTotalStats);

export default router; 