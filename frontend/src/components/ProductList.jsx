import { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../services/roundService';

function ProductList({ onAddProducts, onCancel }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: '' });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleQuantityChange = (productId, change) => {
    setSelectedProducts(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      if (newQuantity === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [productId]: newQuantity
      };
    });
  };

  const handleAddToRound = () => {
    const productsToAdd = Object.entries(selectedProducts).map(([productId, quantity]) => ({
      product: productId,
      quantity
    }));
    
    if (productsToAdd.length > 0) {
      onAddProducts(productsToAdd);
      setSelectedProducts({});
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p._id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const handleCustomProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProduct = await createProduct({
        name: customProduct.name,
        price: parseFloat(customProduct.price)
      });
      
      setProducts(prev => [...prev, newProduct]);
      setShowCustomProductModal(false);
      setCustomProduct({ name: '', price: '' });
    } catch (err) {
      console.error('Error al crear producto personalizado:', err);
      setError('Error al crear el producto personalizado');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl">{error}</p>
          <button
            onClick={onCancel}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="container mx-auto flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Seleccionar Productos</h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-blue-100 transition-colors text-lg"
            >
              Volver
            </button>
          </div>
        </div>

        {/* Productos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map(product => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="flex h-32">
                    {/* Lado izquierdo - Quitar */}
                    <div
                      onClick={() => handleQuantityChange(product._id, -1)}
                      className="w-1/3 bg-red-50 flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <span className="text-4xl text-red-500 font-bold">-</span>
                    </div>

                    {/* Centro - Información */}
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-lg text-gray-600">${product.price.toFixed(2)}</p>
                      {selectedProducts[product._id] > 0 && (
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          {selectedProducts[product._id]}
                        </p>
                      )}
                    </div>

                    {/* Lado derecho - Añadir */}
                    <div
                      onClick={() => handleQuantityChange(product._id, 1)}
                      className="w-1/3 bg-green-50 flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors"
                    >
                      <span className="text-4xl text-green-500 font-bold">+</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón de Producto Comodín */}
              <div
                onClick={() => setShowCustomProductModal(true)}
                className="bg-white rounded-xl shadow-sm border-2 border-dashed border-blue-300 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="flex h-32 items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl text-blue-500">+</span>
                    <p className="mt-2 text-lg text-blue-600 font-medium">Producto Personalizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con total y botón de añadir */}
        <div className="bg-white border-t p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xl font-semibold text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-blue-600 ml-2">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleAddToRound}
                disabled={Object.keys(selectedProducts).length === 0}
                className="px-8 py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Añadir a ronda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Producto Personalizado */}
      {showCustomProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Crear Producto Personalizado</h2>
            <form onSubmit={handleCustomProductSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  id="name"
                  value={customProduct.name}
                  onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Precio
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={customProduct.price}
                  onChange={(e) => setCustomProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCustomProductModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList; 