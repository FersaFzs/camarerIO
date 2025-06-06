import { useState, useEffect } from 'react';
import { getProducts } from '../services/roundService'; // Usamos roundService por ahora

function ProductList({ onAddProducts, onCancel }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({}); // { productId: quantity, ... }

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
  }, []); // El array vacío asegura que se ejecuta solo una vez al montar el componente

  const handleQuantityChange = (productId, change) => {
    setSelectedProducts(prev => {
      const currentQuantity = prev[productId] || 0
      const newQuantity = Math.max(0, currentQuantity + change)
      
      if (newQuantity === 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      
      return {
        ...prev,
        [productId]: newQuantity
      }
    })
  }

  const handleAddToRound = () => {
    const productsToAdd = Object.entries(selectedProducts).map(([productId, quantity]) => ({
      product: productId,
      quantity
    }))
    
    if (productsToAdd.length > 0) {
      onAddProducts(productsToAdd)
      setSelectedProducts({}) // Resetear selección después de añadir
    }
  }

  const getTotalPrice = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p._id === productId)
      return total + (product ? product.price * quantity : 0)
    }, 0)
  }

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
    </div>
  );
}

export default ProductList; 