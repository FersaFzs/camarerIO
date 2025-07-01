import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import upload from '../middleware/uploadMiddleware.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (admin only)
router.post('/', requireAuth, requireAdmin, upload.single('image'), createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (admin only)
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (admin only)
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router; 