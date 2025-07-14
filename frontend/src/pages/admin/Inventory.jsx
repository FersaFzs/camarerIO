import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, updateProductAvailability, createLiqueur, deleteLiqueur, createSoftDrink, deleteSoftDrink, getLiqueurs, getSoftDrinks, getIceCreams, createIceCream, deleteIceCream } from '../../services/productService';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: null,
    category: 'Otros'
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCombinados, setShowCombinados] = useState(false);
  const [newLiqueur, setNewLiqueur] = useState('');
  const [liqueurMsg, setLiqueurMsg] = useState('');
  const [liqueurs, setLiqueurs] = useState([]);
  const [newSoftDrink, setNewSoftDrink] = useState('');
  const [softDrinkMsg, setSoftDrinkMsg] = useState('');
  const [softDrinks, setSoftDrinks] = useState([]);
  const [showIceCreams, setShowIceCreams] = useState(false);
  const [iceCreams, setIceCreams] = useState([]);
  const [newIceCream, setNewIceCream] = useState('');
  const [iceCreamMsg, setIceCreamMsg] = useState('');

  const categoryOptions = [
    'Cervezas',
    'Refrescos',
    'Copas',
    'Cafés',
    'Vinos',
    'Helados',
    'Tapas',
    'Otros'
  ];

  useEffect(() => {
    loadProducts();
    loadLiqueurs();
    loadSoftDrinks();
    loadIceCreams();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLiqueurs = async () => {
    try {
      const data = await getLiqueurs();
      setLiqueurs(data);
    } catch (err) {
      setLiqueurMsg('Error al cargar licores');
    }
  };

  const loadSoftDrinks = async () => {
    try {
      const data = await getSoftDrinks();
      setSoftDrinks(data);
    } catch (err) {
      setSoftDrinkMsg('Error al cargar refrescos');
    }
  };

  const loadIceCreams = async () => {
    try {
      const data = await getIceCreams();
      setIceCreams(data);
    } catch (err) {
      setIceCreamMsg('Error al cargar sabores de helado');
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        image: null,
        category: product.category || 'Otros'
      });
      setPreviewUrl(product.imageUrl);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        image: null,
        category: 'Otros'
      });
      setPreviewUrl(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      image: null,
      category: 'Otros'
    });
    setPreviewUrl(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingProduct) {
        await updateProduct(editingProduct._id, formDataToSend);
      } else {
        await createProduct(formDataToSend);
      }

      await loadProducts();
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar el producto');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError('Error al eliminar el producto');
      console.error(err);
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      await updateProductAvailability(product._id, !product.available);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, available: !p.available } : p));
    } catch (err) {
      setError('Error al cambiar la disponibilidad');
      console.error(err);
    }
  };

  const handleAddLiqueur = async (e) => {
    e.preventDefault();
    try {
      await createLiqueur(newLiqueur);
      setNewLiqueur('');
      setLiqueurMsg('Licor añadido correctamente');
      await loadLiqueurs();
    } catch (err) {
      setError('Error al añadir el licor');
      console.error(err);
    }
  };

  const handleDeleteLiqueur = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este licor?')) {
      return;
    }

    try {
      await deleteLiqueur(id);
      await loadLiqueurs();
    } catch (err) {
      setError('Error al eliminar el licor');
      console.error(err);
    }
  };

  const handleAddSoftDrink = async (e) => {
    e.preventDefault();
    try {
      await createSoftDrink(newSoftDrink);
      setNewSoftDrink('');
      setSoftDrinkMsg('Refresco añadido correctamente');
      await loadSoftDrinks();
    } catch (err) {
      setError('Error al añadir el refresco');
      console.error(err);
    }
  };

  const handleDeleteSoftDrink = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este refresco?')) {
      return;
    }

    try {
      await deleteSoftDrink(id);
      await loadSoftDrinks();
    } catch (err) {
      setError('Error al eliminar el refresco');
      console.error(err);
    }
  };

  const handleAddIceCream = async (e) => {
    e.preventDefault();
    try {
      await createIceCream(newIceCream);
      setNewIceCream('');
      setIceCreamMsg('Sabor de helado añadido correctamente');
      await loadIceCreams();
    } catch (err) {
      setIceCreamMsg('Error al añadir el sabor de helado');
    }
  };

  const handleDeleteIceCream = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este sabor de helado?')) return;
    try {
      await deleteIceCream(id);
      await loadIceCreams();
    } catch (err) {
      setIceCreamMsg('Error al eliminar el sabor de helado');
    }
  };

  // Agrupar productos por categoría
  const productsByCategory = categoryOptions.map(cat => ({
    category: cat,
    products: products.filter(p => p.category === cat)
  })).filter(group => group.products.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-2 sm:p-4 md:p-8 mt-2 md:mt-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8 gap-2 md:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold text-green-900">Inventario</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg font-semibold w-full md:w-auto"
        >
          Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Secciones por categoría */}
      {productsByCategory.map(group => (
        <div key={group.category} className="mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-bold text-green-800 mb-2 md:mb-3 pl-1">{group.category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-4">
            {group.products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden border border-green-100">
                <div className="aspect-w-1 aspect-h-1">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-28 md:h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-28 md:h-32 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs md:text-sm">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-3">
                  <h3 className="text-sm md:text-base font-semibold text-green-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-green-700 font-bold mb-1 md:mb-2 text-xs md:text-sm">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(product.price)}
                  </p>
                  <div className="flex justify-between items-center mb-1 md:mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {product.available ? 'Disponible' : 'No disponible'}
                    </span>
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      className={`ml-2 px-2 py-0.5 rounded-full font-bold text-xs transition-colors shadow ${product.available ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-400 text-white hover:bg-red-500'}`}
                    >
                      {product.available ? 'No disponible' : 'Disponible'}
                    </button>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-green-700 hover:text-green-900 font-semibold transition-colors text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-700 font-semibold transition-colors text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => setShowCombinados(v => !v)}
          className="px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold border border-green-200 shadow-sm"
        >
          {showCombinados ? 'Ocultar gestión de combinados' : 'Gestionar combinados (Licores y Refrescos)'}
        </button>
      </div>

      {showCombinados && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-900 mb-4">Licores para combinados</h2>
            <form onSubmit={handleAddLiqueur} className="flex gap-2 mb-4">
              <input type="text" value={newLiqueur} onChange={e => setNewLiqueur(e.target.value)} placeholder="Añadir licor..." className="flex-1 border border-green-200 rounded-lg px-4 py-2 bg-green-50" />
              <button type="submit" className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-700">Añadir</button>
            </form>
            {liqueurMsg && <div className="mb-2 text-sm text-green-700 font-semibold">{liqueurMsg}</div>}
            <ul className="space-y-2">
              {liqueurs.length === 0 && <li className="text-green-300">No hay licores añadidos.</li>}
              {liqueurs.map(l => (
                <li key={l._id} className="flex justify-between items-center bg-green-50 rounded-lg px-4 py-2">
                  <span>{l.name}</span>
                  <button onClick={() => handleDeleteLiqueur(l._id)} className="text-red-600 hover:text-red-800 font-bold">Eliminar</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-900 mb-4">Refrescos para combinados</h2>
            <form onSubmit={handleAddSoftDrink} className="flex gap-2 mb-4">
              <input type="text" value={newSoftDrink} onChange={e => setNewSoftDrink(e.target.value)} placeholder="Añadir refresco..." className="flex-1 border border-green-200 rounded-lg px-4 py-2 bg-green-50" />
              <button type="submit" className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-700">Añadir</button>
            </form>
            {softDrinkMsg && <div className="mb-2 text-sm text-green-700 font-semibold">{softDrinkMsg}</div>}
            <ul className="space-y-2">
              {softDrinks.length === 0 && <li className="text-green-300">No hay refrescos añadidos.</li>}
              {softDrinks.map(s => (
                <li key={s._id} className="flex justify-between items-center bg-green-50 rounded-lg px-4 py-2">
                  <span>{s.name}</span>
                  <button onClick={() => handleDeleteSoftDrink(s._id)} className="text-red-600 hover:text-red-800 font-bold">Eliminar</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setShowIceCreams(v => !v)}
          className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold border border-blue-200 shadow-sm"
        >
          {showIceCreams ? 'Ocultar gestión de sabores de helado' : 'Gestionar sabores de helado'}
        </button>
      </div>
      {showIceCreams && (
        <div className="mt-8 max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Sabores de helado</h2>
          <form onSubmit={handleAddIceCream} className="flex gap-2 mb-4">
            <input type="text" value={newIceCream} onChange={e => setNewIceCream(e.target.value)} placeholder="Añadir sabor..." className="flex-1 border border-blue-200 rounded-lg px-4 py-2 bg-blue-50" />
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700">Añadir</button>
          </form>
          {iceCreamMsg && <div className="mb-2 text-sm text-blue-700 font-semibold">{iceCreamMsg}</div>}
          <ul className="space-y-2">
            {iceCreams.length === 0 && <li className="text-blue-300">No hay sabores añadidos.</li>}
            {iceCreams.map(i => (
              <li key={i._id} className="flex justify-between items-center bg-blue-50 rounded-lg px-4 py-2">
                <span>{i.name}</span>
                <button onClick={() => handleDeleteIceCream(i._id)} className="text-red-600 hover:text-red-800 font-bold">Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-green-900 mb-6">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-green-900 font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-green-50"
                  required
                />
              </div>
              <div>
                <label className="block text-green-900 font-medium mb-2">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-green-50"
                  required
                />
              </div>
              <div>
                <label className="block text-green-900 font-medium mb-2">Categoría</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-green-50 text-green-900 font-semibold capitalize"
                  required
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-green-900 font-medium mb-2">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-green-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-green-700 hover:text-green-900 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  {editingProduct ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory; 