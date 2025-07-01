import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   POST /api/products
// @desc    Create a new product
// @access  Public
router.post('/', upload.single('image'), createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Public
router.put('/:id', upload.single('image'), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Public
router.delete('/:id', deleteProduct);

export default router; 