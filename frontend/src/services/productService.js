import api from './api';

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const updateProductAvailability = async (id, available) => {
  const response = await api.put(`/products/${id}/availability`, { available });
  return response.data;
};

export const createLiqueur = async (name) => {
  const res = await fetch('/api/licores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Error al crear licor');
  return res.json();
};

export const deleteLiqueur = async (id) => {
  const res = await fetch(`/api/licores/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar licor');
  return res.json();
};

export const createSoftDrink = async (name) => {
  const res = await fetch('/api/refrescos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Error al crear refresco');
  return res.json();
};

export const deleteSoftDrink = async (id) => {
  const res = await fetch(`/api/refrescos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar refresco');
  return res.json();
};

export const getLiqueurs = async () => {
  const res = await fetch('/api/licores');
  if (!res.ok) throw new Error('Error al obtener licores');
  return res.json();
};

export const getSoftDrinks = async () => {
  const res = await fetch('/api/refrescos');
  if (!res.ok) throw new Error('Error al obtener refrescos');
  return res.json();
}; 