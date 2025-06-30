import express from 'express';
import { getDailyStats, getMonthlyStats, getPreviousMonths, resetDailyStats } from '../controllers/accountingController.js';

const router = express.Router();

// @route   GET /api/accounting/daily
// @desc    Get daily statistics
// @access  Private (admin only)
router.get('/daily', getDailyStats);

// @route   POST /api/accounting/reset-daily
// @desc    Reset daily statistics
// @access  Private (admin only)
router.post('/reset-daily', resetDailyStats);

// @route   GET /api/accounting/monthly
// @desc    Get monthly statistics
// @access  Private (admin only)
router.get('/monthly', getMonthlyStats);

// @route   GET /api/accounting/previous-months
// @desc    Get statistics for previous months
// @access  Private (admin only)
router.get('/previous-months', getPreviousMonths);

export default router; 