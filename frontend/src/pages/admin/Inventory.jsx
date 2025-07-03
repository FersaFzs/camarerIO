import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import '../../mesas-modern.css'

// NUEVO: servicios para licores y refrescos
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchLiqueurs() {
  const res = await fetch(`${API_URL}/licores`);
  return await res.json();
}
async function addLiqueur(name) {
  const res = await fetch(`${API_URL}/licores`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
  return await res.json();
}
async function deleteLiqueur(id) {
  await fetch(`${API_URL}/licores/${id}`, { method: 'DELETE' });
}
async function fetchSoftDrinks() {
  const res = await fetch(`${API_URL}/refrescos`);
  return await res.json();
}
async function addSoftDrink(name) {
  const res = await fetch(`${API_URL}/refrescos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
  return await res.json();
}
async function deleteSoftDrink(id) {
  await fetch(`${API_URL}/refrescos/${id}`, { method: 'DELETE' });
}

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
  const [liqueurs, setLiqueurs] = useState([]);
  const [softDrinks, setSoftDrinks] = useState([]);
  const [newLiqueur, setNewLiqueur] = useState('');
  const [newSoftDrink, setNewSoftDrink] = useState('');
  const [liqueurMsg, setLiqueurMsg] = useState(null);
  const [softDrinkMsg, setSoftDrinkMsg] = useState(null);

  useEffect(() => {
    loadProducts();
    fetchLiqueurs().then(setLiqueurs);
    fetchSoftDrinks().then(setSoftDrinks);
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

  const handleAddLiqueur = async (e) => {
    e.preventDefault();
    setLiqueurMsg(null);
    if (!newLiqueur.trim()) return;
    if (liqueurs.some(l => l.name.toLowerCase() === newLiqueur.trim().toLowerCase())) {
      setLiqueurMsg('Ese licor ya existe.');
      return;
    }
    try {
      await addLiqueur(newLiqueur.trim());
      setLiqueurMsg('Licor añadido correctamente.');
      setLiqueurs(await fetchLiqueurs());
      setNewLiqueur('');
    } catch (err) {
      setLiqueurMsg('Error al añadir licor.');
    }
  };

  const handleDeleteLiqueur = async (id) => {
    setLiqueurMsg(null);
    try {
      await deleteLiqueur(id);
      setLiqueurMsg('Licor eliminado.');
      setLiqueurs(await fetchLiqueurs());
    } catch (err) {
      setLiqueurMsg('Error al eliminar licor.');
    }
  };

  const handleAddSoftDrink = async (e) => {
    e.preventDefault();
    setSoftDrinkMsg(null);
    if (!newSoftDrink.trim()) return;
    if (softDrinks.some(s => s.name.toLowerCase() === newSoftDrink.trim().toLowerCase())) {
      setSoftDrinkMsg('Ese refresco ya existe.');
      return;
    }
    try {
      await addSoftDrink(newSoftDrink.trim());
      setSoftDrinkMsg('Refresco añadido correctamente.');
      setSoftDrinks(await fetchSoftDrinks());
      setNewSoftDrink('');
    } catch (err) {
      setSoftDrinkMsg('Error al añadir refresco.');
    }
  };

  const handleDeleteSoftDrink = async (id) => {
    setSoftDrinkMsg(null);
    try {
      await deleteSoftDrink(id);
      setSoftDrinkMsg('Refresco eliminado.');
      setSoftDrinks(await fetchSoftDrinks());
    } catch (err) {
      setSoftDrinkMsg('Error al eliminar refresco.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-900">Inventario</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg font-semibold"
        >
          Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-green-100">
            <div className="aspect-w-1 aspect-h-1">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-green-50 flex items-center justify-center">
                  <span className="text-green-200">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-2">{product.name}</h3>
              <p className="text-green-700 font-bold mb-4">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(product.price)}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleOpenModal(product)}
                  className="text-green-700 hover:text-green-900 font-semibold transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
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
                  <option value="Cervezas">Cervezas</option>
                  <option value="Refrescos">Refrescos</option>
                  <option value="Copas">Copas</option>
                  <option value="Cafés">Cafés</option>
                  <option value="Otros">Otros</option>
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

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
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
    </div>
  );
};

export default Inventory; 