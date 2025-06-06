import express from 'express';
import { getAllProducts, createProduct } from '../controllers/productController.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public (for now, could be protected later)
router.get('/', getAllProducts);

// @route   POST /api/products
// @desc    Create a new product
// @access  Public (for now)
router.post('/', createProduct);

export default router; 