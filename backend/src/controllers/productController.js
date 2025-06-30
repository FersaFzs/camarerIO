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
    const { name, price } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    console.log('Datos recibidos:', { name, price, imageUrl });
    console.log('Archivo recibido:', req.file);

    const product = new Product({
      name,
      price: parseFloat(price),
      imageUrl
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
    const { name, price } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    console.log('Datos de actualización:', { name, price, imageUrl });
    console.log('Archivo recibido:', req.file);

    const updateData = { 
      name, 
      price: parseFloat(price)
    };
    
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

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