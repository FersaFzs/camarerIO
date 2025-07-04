import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

export const createProduct = async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    const { name, price, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!category) {
      return res.status(400).json({ message: 'La categoría es obligatoria' });
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      imageUrl,
      category
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(400).json({ 
      message: 'Error al crear el producto',
      error: error.message 
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const updateData = { 
      name, 
      price: parseFloat(price)
    };
    if (category) updateData.category = category;
    if (imageUrl) updateData.imageUrl = imageUrl;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(400).json({ 
      message: 'Error al actualizar el producto',
      error: error.message 
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el producto',
      error: error.message 
    });
  }
};

export const updateProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    if (typeof available !== 'boolean') {
      return res.status(400).json({ message: 'El campo available debe ser booleano' });
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { available },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    res.status(400).json({ message: 'Error al actualizar disponibilidad', error: error.message });
  }
}; 