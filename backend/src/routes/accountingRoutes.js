import express from 'express';
import { getDailyStats, getMonthlyStats, getPreviousMonths, resetDailyStats } from '../controllers/accountingController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/accounting/daily
// @desc    Get daily statistics
// @access  Private (admin only)
router.get('/daily', requireAuth, requireAdmin, getDailyStats);

// @route   POST /api/accounting/reset-daily
// @desc    Reset daily statistics
// @access  Private (admin only)
router.post('/reset-daily', requireAuth, requireAdmin, resetDailyStats);

// @route   GET /api/accounting/monthly
// @desc    Get monthly statistics
// @access  Private (admin only)
router.get('/monthly', requireAuth, requireAdmin, getMonthlyStats);

// @route   GET /api/accounting/previous-months
// @desc    Get statistics for previous months
// @access  Private (admin only)
router.get('/previous-months', requireAuth, requireAdmin, getPreviousMonths);

export default router; 