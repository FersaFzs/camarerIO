import { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../services/roundService';
import '../mesas-modern.css'
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://camarerio.onrender.com';
const SOCKET_URL = 'https://camarerio.onrender.com';

async function fetchLiqueurs() {
  const res = await fetch(`${API_URL}/api/licores`);
  return await res.json();
}
async function fetchSoftDrinks() {
  const res = await fetch(`${API_URL}/api/refrescos`);
  return await res.json();
}
async function fetchIceCreams() {
  const res = await fetch(`${API_URL}/api/icecreams`);
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
  const [showSelectedProducts, setShowSelectedProducts] = useState(false);
  const [showIceCreamModal, setShowIceCreamModal] = useState(false);
  const [iceCreamProduct, setIceCreamProduct] = useState(null);
  const [iceCreamFlavors, setIceCreamFlavors] = useState([]);
  const [selectedFlavors, setSelectedFlavors] = useState([]);

  const categoryOptions = [
    'Cervezas',
    'Refrescos', 
    'Copas',
    'Cafés',
    'Vinos',
    'Helados',
    'Otros'
  ];

  // Sistema de colores por categoría
  const getCategoryStyle = (category) => {
    const styles = {
      'Cervezas': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', hover: 'hover:bg-green-100', icon: '🍺' },
      'Refrescos': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', hover: 'hover:bg-blue-100', icon: '🥤' },
      'Copas': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', hover: 'hover:bg-purple-100', icon: '🍷' },
      'Cafés': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', hover: 'hover:bg-amber-100', icon: '☕' },
      'Vinos': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', hover: 'hover:bg-red-100', icon: '🍷' },
      'Helados': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900', hover: 'hover:bg-pink-100', icon: '🍦' },
      'Otros': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', hover: 'hover:bg-gray-100', icon: '📦' }
    };
    return styles[category] || styles['Otros'];
  };

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
    fetchIceCreams().then(setIceCreamFlavors);

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

  // Iconos por defecto
  const DEFAULT_ICECREAM_IMAGE = 'https://cdn-icons-png.flaticon.com/512/685/685352.png'; // Icono helado
  const DEFAULT_CUBATA_IMAGE = 'https://cdn-icons-png.flaticon.com/512/2738/2738897.png'; // Icono copa

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
          imageUrl: cubataProduct.imageUrl || DEFAULT_CUBATA_IMAGE
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

  const handleIceCreamClick = (product) => {
    let bolas = 1;
    if (product.name.toLowerCase().includes('2 bolas')) bolas = 2;
    if (product.name.toLowerCase().includes('copa')) bolas = 3;
    setSelectedFlavors(Array(bolas).fill(''));
    setIceCreamProduct(product);
    setShowIceCreamModal(true);
  };

  const handleAddIceCream = async () => {
    if (!iceCreamProduct) return;
    const bolas = selectedFlavors.length;
    if (selectedFlavors.some(f => !f)) return;
    let name = '';
    if (bolas === 1) name = `Helado + ${selectedFlavors[0]}`;
    if (bolas === 2) name = `Helado + ${selectedFlavors[0]} + ${selectedFlavors[1]}`;
    if (bolas === 3) name = `Copa de helado + ${selectedFlavors[0]} + ${selectedFlavors[1]} + ${selectedFlavors[2]}`;
    // Buscar si ya existe un producto con ese nombre y categoría Helados
    let existing = products.find(p => p.name === name && p.category === 'Helados');
    let newProduct = existing;
    if (!existing) {
      // Crear el producto en la BD
      try {
        newProduct = await createProduct({
          name,
          price: iceCreamProduct.price,
          category: 'Helados',
          imageUrl: iceCreamProduct.imageUrl || DEFAULT_ICECREAM_IMAGE
        });
        setProducts(prev => [...prev, newProduct]);
      } catch (err) {
        setShowIceCreamModal(false);
        setIceCreamProduct(null);
        setSelectedFlavors([]);
        alert('Error al crear el helado personalizado');
        return;
      }
    }
    setSelectedProducts(prev => ({
      ...prev,
      [newProduct._id]: (prev[newProduct._id] || 0) + 1
    }));
    setShowIceCreamModal(false);
    setIceCreamProduct(null);
    setSelectedFlavors([]);
  };

  // Agrupar productos por categoría, excluyendo 'Tapas'
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Otros';
    if (cat === 'Tapas') return acc; // Omitir tapas
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

  const selectedCount = selectedList.length;
  const totalPrice = getTotalPrice();

  return (
    <div className="fixed inset-0 bg-neutral-50 flex flex-col font-inter z-50 overflow-y-auto md:overflow-hidden">
      {/* Barra superior con botón volver y selección de productos */}
      <div className="w-full flex items-center justify-between h-16 px-4 bg-green-50 border-b border-green-100 shadow-sm fixed top-0 left-0 z-50">
        <button
          onClick={onCancel}
          className="text-green-700 hover:bg-green-100 hover:text-green-900 text-base font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          ← Volver
        </button>
        
        {/* Botón desplegable de productos seleccionados */}
        {selectedCount > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSelectedProducts(!showSelectedProducts)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            >
              <span>🛒 {selectedCount} productos</span>
              <span className="text-sm">€{totalPrice.toFixed(2)}</span>
              <span className={`transition-transform ${showSelectedProducts ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showSelectedProducts && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-green-100 z-50 max-h-96 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-3 text-green-900">Productos Seleccionados</h3>
                  <div className="space-y-2">
                    {selectedList.map(product => (
                      <div key={product._id} className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-xs text-green-400">Sin</div>
                          )}
                          <span className="font-medium text-green-900 truncate max-w-[120px] text-sm">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-green-200"
                            onClick={() => handleQuantityChange(product._id, -1)}
                          >
                            -
                          </button>
                          <span className="font-bold text-green-700 text-sm">{product.quantity}</span>
                          <button
                            type="button"
                            className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-green-700"
                            onClick={() => handleQuantityChange(product._id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal con padding top para la barra */}
      <div className="flex-1 pt-20 min-h-0 overflow-y-auto pb-20">
        {/* Productos agrupados por categoría en modo acordeón */}
        <div className="p-4 space-y-3">
          {Object.entries(groupedProducts).map(([category, prods]) => {
            const isOpen = openCategories.includes(category);
            const categoryStyle = getCategoryStyle(category);
            return (
              <div key={category} className="mb-2">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl shadow-sm border font-bold text-lg capitalize transition-colors focus:outline-none ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text} ${isOpen ? categoryStyle.hover : ''}`}
                  onClick={() => setOpenCategories(prev =>
                    prev.includes(category)
                      ? prev.filter(c => c !== category)
                      : [...prev, category]
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{categoryStyle.icon}</span>
                    {category}
                  </span>
                  <span className={`ml-2 transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                </button>
                {isOpen && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {category === 'Copas' && cubataProduct && (
                      <div
                        className={`relative bg-white rounded-2xl shadow-md border-2 transition-all duration-150 cursor-pointer flex flex-col items-center p-2.5 border-neutral-200 hover:border-purple-500 hover:ring-2 hover:ring-purple-200`}
                        onClick={() => setShowCubataModal(true)}
                      >
                        {cubataProduct.imageUrl ? (
                          <img src={cubataProduct.imageUrl} alt="Cubata" className="w-20 h-20 object-cover rounded-xl mb-1" />
                        ) : (
                          <div className="w-20 h-20 bg-purple-50 flex items-center justify-center rounded-xl mb-1 text-purple-200">Sin imagen</div>
                        )}
                        <div className="text-center w-full">
                          <h3 className="text-sm font-semibold text-neutral-900 truncate">Cubata</h3>
                          <p className="text-purple-700 font-bold text-sm">{cubataProduct.price?.toFixed(2) || '5.00'} €</p>
                        </div>
                      </div>
                    )}
                    {prods.map(product => {
                      const isIceCream = product.category === 'Helados' && (
                        product.name.toLowerCase().includes('1 bola') ||
                        product.name.toLowerCase().includes('2 bolas') ||
                        product.name.toLowerCase().includes('copa')
                      );
                      return (
                        <div
                          key={product._id}
                          className={`relative bg-white rounded-2xl shadow-md border-2 transition-all duration-150 flex flex-col items-center p-2.5 ${selectedProducts[product._id] ? 'border-green-500 ring-2 ring-green-200' : 'border-neutral-200'} ${!product.available ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                          onClick={product.available ? (isIceCream ? () => handleIceCreamClick(product) : () => handleQuantityChange(product._id, 1)) : undefined}
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
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {/* Producto personalizado */}
          <div
            onClick={() => setShowCustomProductModal(true)}
            className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-green-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors p-4 min-h-[120px] mt-4"
          >
            <span className="text-4xl text-green-600">+</span>
            <p className="mt-2 text-base text-green-700 font-medium">Producto Personalizado</p>
          </div>
        </div>
      </div>

      {/* Barra fija inferior con total y botón de añadir */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 shadow-lg z-50 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-green-900">
                Total: <span className="text-2xl font-bold text-green-700">€{totalPrice.toFixed(2)}</span>
              </span>
              <span className="text-sm text-green-600 font-medium">
                {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={handleAddToRound}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Añadir a la Ronda
            </button>
          </div>
        </div>
      )}

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

      {/* Modal de selección de sabores de helado */}
      {showIceCreamModal && iceCreamProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4 text-pink-900">Selecciona tus sabores</h2>
            {selectedFlavors.map((flavor, idx) => (
              <div className="mb-4" key={idx}>
                <label className="block text-pink-900 font-medium mb-2">Sabor {idx + 1}</label>
                <select
                  value={flavor}
                  onChange={e => setSelectedFlavors(flavs => flavs.map((f, i) => i === idx ? e.target.value : f))}
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-pink-50"
                >
                  <option value="">Selecciona un sabor</option>
                  {iceCreamFlavors.map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => { setShowIceCreamModal(false); setIceCreamProduct(null); setSelectedFlavors([]); }}
                className="px-4 py-2 text-pink-700 hover:text-pink-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedFlavors.some(f => !f)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold disabled:opacity-50"
                onClick={handleAddIceCream}
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