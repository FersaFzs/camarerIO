import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, price } = req.body;

  // Validación básica
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Nombre y precio son requeridos' });
  }

  try {
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 