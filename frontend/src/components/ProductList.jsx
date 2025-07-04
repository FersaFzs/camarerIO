import { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../services/roundService';
import '../mesas-modern.css'
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://camarerio.onrender.com/api';
const SOCKET_URL = 'https://camarerio.onrender.com';

async function fetchLiqueurs() {
  const res = await fetch(`${API_URL}/licores`);
  return await res.json();
}
async function fetchSoftDrinks() {
  const res = await fetch(`${API_URL}/refrescos`);
  return await res.json();
}

function ProductList({ onAddProducts, onCancel }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: '', category: 'Otros' });
  const [openCategories, setOpenCategories] = useState([]);
  const [showCubataModal, setShowCubataModal] = useState(false);
  const [selectedLicor, setSelectedLicor] = useState('');
  const [selectedRefresco, setSelectedRefresco] = useState('');
  const [liqueurs, setLiqueurs] = useState([]);
  const [softDrinks, setSoftDrinks] = useState([]);
  const [cubataProduct, setCubataProduct] = useState(null);

  const categoryOptions = [
    'Cervezas',
    'Refrescos',
    'Copas',
    'Cafés',
    'Otros'
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        console.log('Productos recibidos:', productsData.map(p => ({ nombre: p.name, categoria: p.category })));
        setProducts(productsData);
        const cubata = productsData.find(p => p.name.toLowerCase() === 'cubata' && p.category === 'Copas');
        setCubataProduct(cubata || null);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
    fetchLiqueurs().then(setLiqueurs);
    fetchSoftDrinks().then(setSoftDrinks);

    // Socket para productos
    const socket = io(SOCKET_URL);
    socket.on('products:update', () => {
      loadProducts();
    });
    return () => {
      socket.disconnect();
    };
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
    const productsToAdd = Object.entries(selectedProducts).map(([productId, quantity]) => {
      // Detectar si es un cubata personalizado
      if (productId.startsWith('cubata-')) {
        // Buscar el producto Cubata real
        const cubata = products.find(p => p.name.toLowerCase() === 'cubata' && p.category === 'Copas');
        // Extraer la combinación del nombre
        const product = products.find(p => p._id === productId);
        return {
          product: cubata._id,
          quantity,
          combination: product ? product.name : ''
        };
      }
      return {
        product: productId,
        quantity
      };
    });
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
        price: parseFloat(customProduct.price),
        category: customProduct.category
      });
      setProducts(prev => [...prev, newProduct]);
      setShowCustomProductModal(false);
      setCustomProduct({ name: '', price: '', category: 'Otros' });
    } catch (err) {
      console.error('Error al crear producto personalizado:', err);
      setError('Error al crear el producto personalizado');
    }
  };

  const handleCubataAdd = async () => {
    if (!selectedLicor || !selectedRefresco || !cubataProduct) return;
    const name = `${selectedLicor} + ${selectedRefresco}`;
    // Buscar si ya existe un producto con ese nombre y categoría Copas
    let existing = products.find(p => p.name === name && p.category === 'Copas');
    let newProduct = existing;
    if (!existing) {
      // Crear el producto en la BD
      try {
        newProduct = await createProduct({
          name,
          price: cubataProduct.price,
          category: 'Copas',
          imageUrl: cubataProduct.imageUrl || ''
        });
        setProducts(prev => [...prev, newProduct]);
      } catch (err) {
        setShowCubataModal(false);
        setSelectedLicor('');
        setSelectedRefresco('');
        alert('Error al crear el cubata personalizado');
        return;
      }
    }
    setSelectedProducts(prev => ({
      ...prev,
      [newProduct._id]: (prev[newProduct._id] || 0) + 1
    }));
    setShowCubataModal(false);
    setSelectedLicor('');
    setSelectedRefresco('');
  };

  // Agrupar productos por categoría
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    if (!(cat === 'Copas' && product.name.toLowerCase() === 'cubata')) {
      acc[cat].push(product);
    }
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-50 flex items-center justify-center font-inter">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-xl text-neutral-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-neutral-50 flex items-center justify-center font-inter">
        <div className="text-center text-red-600">
          <p className="text-xl">{error}</p>
          <button
            onClick={onCancel}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Lista de productos seleccionados
  const selectedList = Object.entries(selectedProducts).map(([productId, quantity]) => {
    const product = products.find(p => p._id === productId);
    return product ? { ...product, quantity } : null;
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-neutral-50 flex flex-col font-inter z-50 overflow-y-auto md:overflow-hidden">
      {/* Barra superior con botón volver */}
      <div className="w-full flex items-center h-16 px-4 bg-green-50 border-b border-green-100 shadow-sm fixed top-0 left-0 z-50">
        <button
          onClick={onCancel}
          className="text-green-700 hover:bg-green-100 hover:text-green-900 text-base font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          ← Volver
        </button>
      </div>
      {/* Contenido principal con padding top para la barra */}
      <div className="flex-1 flex flex-col md:flex-row pt-20 min-h-0">
        {/* Productos agrupados por categoría en modo acordeón */}
        <div className="flex flex-col gap-2">
          {Object.entries(groupedProducts).map(([category, prods]) => {
            const isOpen = openCategories.includes(category);
            return (
              <div key={category} className="mb-1">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-3 bg-green-50 rounded-xl shadow-sm border border-green-100 text-green-900 font-bold text-lg capitalize transition-colors focus:outline-none ${isOpen ? 'bg-green-100' : ''}`}
                  onClick={() => setOpenCategories(prev =>
                    prev.includes(category)
                      ? prev.filter(c => c !== category)
                      : [...prev, category]
                  )}
                >
                  <span>{category}</span>
                  <span className={`ml-2 transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                </button>
                {isOpen && (
                  <div className="mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {category === 'Copas' && cubataProduct && (
                      <div
                        className={`relative bg-white rounded-2xl shadow-md border-2 transition-all duration-150 cursor-pointer flex flex-col items-center p-2.5 border-neutral-200 hover:border-green-500 hover:ring-2 hover:ring-green-200`}
                        onClick={() => setShowCubataModal(true)}
                      >
                        {cubataProduct.imageUrl ? (
                          <img src={cubataProduct.imageUrl} alt="Cubata" className="w-20 h-20 object-cover rounded-xl mb-1" />
                        ) : (
                          <div className="w-20 h-20 bg-green-50 flex items-center justify-center rounded-xl mb-1 text-green-200">Sin imagen</div>
                        )}
                        <div className="text-center w-full">
                          <h3 className="text-sm font-semibold text-neutral-900 truncate">Cubata</h3>
                          <p className="text-green-700 font-bold text-sm">{cubataProduct.price?.toFixed(2) || '5.00'} €</p>
                        </div>
                      </div>
                    )}
                    {prods.map(product => (
                      <div
                        key={product._id}
                        className={`relative bg-white rounded-2xl shadow-md border-2 transition-all duration-150 flex flex-col items-center p-2.5 ${selectedProducts[product._id] ? 'border-green-500 ring-2 ring-green-200' : 'border-neutral-200'} ${!product.available ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                        onClick={product.available ? () => handleQuantityChange(product._id, 1) : undefined}
                      >
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-xl mb-1" />
                        ) : (
                          <div className="w-20 h-20 bg-green-50 flex items-center justify-center rounded-xl mb-1 text-green-200">Sin imagen</div>
                        )}
                        <div className="text-center w-full">
                          <h3 className="text-sm font-semibold text-neutral-900 truncate">{product.name}</h3>
                          <p className="text-green-700 font-bold text-sm">{product.price.toFixed(2)} €</p>
                          {!product.available && (
                            <span className="absolute top-2 left-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full shadow">No disponible</span>
                          )}
                        </div>
                        {selectedProducts[product._id] > 0 && (
                          <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-base font-bold shadow">
                            {selectedProducts[product._id]}
                          </div>
                        )}
                        {selectedProducts[product._id] > 0 && (
                          <div className="flex w-full mt-1 gap-1 justify-center">
                            <button
                              type="button"
                              className="bg-green-100 text-green-700 rounded-lg w-full py-1.5 flex items-center justify-center text-base font-bold hover:bg-green-200 transition-colors"
                              onClick={e => { e.stopPropagation(); handleQuantityChange(product._id, -1); }}
                            >
                              -
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* Producto personalizado */}
          <div
            onClick={() => setShowCustomProductModal(true)}
            className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-green-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors p-2 min-h-[120px] mt-2"
          >
            <span className="text-4xl text-green-600">+</span>
            <p className="mt-1 text-base text-green-700 font-medium">Producto Personalizado</p>
          </div>
        </div>
        {/* Lateral o inferior: productos seleccionados */}
        <div className="w-full md:w-80 bg-green-50 border-t md:border-t-0 md:border-l border-green-100 p-4 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto max-h-[calc(4*3.5rem)]">
            <h3 className="text-lg font-bold mb-2 text-green-900">Seleccionados</h3>
            {selectedList.length === 0 ? (
              <p className="text-green-300">No hay productos añadidos.</p>
            ) : (
              <ul className="space-y-2">
                {selectedList.map(product => (
                  <li key={product._id} className="flex items-center justify-between bg-white rounded-xl shadow p-2">
                    <div className="flex items-center gap-2">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center text-xs text-green-200">Sin</div>
                      )}
                      <span className="font-medium text-green-900 truncate max-w-[120px] text-base">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-green-200"
                        onClick={() => handleQuantityChange(product._id, -1)}
                      >
                        -
                      </button>
                      <span className="font-bold text-green-700 text-base">{product.quantity}</span>
                      <button
                        type="button"
                        className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-green-700"
                        onClick={() => handleQuantityChange(product._id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Total y acciones */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-900">Total:</span>
              <span className="text-xl font-bold text-green-700">{getTotalPrice().toFixed(2)} €</span>
            </div>
            <button
              onClick={handleAddToRound}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedList.length === 0}
            >
              Añadir a la Ronda
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 bg-neutral-200 text-green-900 rounded-lg hover:bg-neutral-300 transition-colors font-semibold text-lg shadow-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
      {/* Modal de producto personalizado */}
      {showCustomProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh] border border-green-100">
            <h2 className="text-2xl font-extrabold mb-6 text-green-900 text-center tracking-tight">Nuevo Producto</h2>
            <form onSubmit={handleCustomProductSubmit} className="space-y-7">
              <div>
                <label htmlFor="customProductName" className="block text-base font-semibold text-green-800 mb-2 tracking-tight">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  id="customProductName"
                  value={customProduct.name}
                  onChange={e => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-green-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 text-green-900 placeholder-green-300 text-base font-medium shadow-sm"
                  placeholder="Ej: Café especial"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="customProductPrice" className="block text-base font-semibold text-green-800 mb-2 tracking-tight">
                  Precio (€)
                </label>
                <input
                  type="number"
                  id="customProductPrice"
                  value={customProduct.price}
                  onChange={e => setCustomProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border border-green-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 text-green-900 placeholder-green-300 text-base font-medium shadow-sm"
                  placeholder="Ej: 2.50"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label htmlFor="customProductCategory" className="block text-base font-semibold text-green-800 mb-2 tracking-tight">
                  Categoría
                </label>
                <div className="relative">
                  <select
                    id="customProductCategory"
                    value={customProduct.category}
                    onChange={e => setCustomProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-green-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 text-green-900 capitalize text-base font-medium shadow-sm appearance-none"
                    required
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt} value={opt} className="capitalize">{opt}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-lg">▼</span>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomProductModal(false)}
                  className="px-4 py-2 text-green-700 hover:text-green-900 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                >
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Cubata */}
      {showCubataModal && cubataProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4 text-green-900">Selecciona tu Cubata</h2>
            <div className="mb-4">
              <label className="block text-green-900 font-medium mb-2">Licor</label>
              <select
                value={selectedLicor}
                onChange={e => setSelectedLicor(e.target.value)}
                className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
              >
                <option value="">Selecciona un licor</option>
                {liqueurs.map(l => (
                  <option key={l._id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-green-900 font-medium mb-2">Refresco</label>
              <select
                value={selectedRefresco}
                onChange={e => setSelectedRefresco(e.target.value)}
                className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
              >
                <option value="">Selecciona un refresco</option>
                {softDrinks.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => { setShowCubataModal(false); setSelectedLicor(''); setSelectedRefresco(''); }}
                className="px-4 py-2 text-green-700 hover:text-green-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedLicor || !selectedRefresco}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                onClick={handleCubataAdd}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList; 