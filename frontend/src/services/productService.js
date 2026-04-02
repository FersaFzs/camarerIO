import api from './api';

const API_URL = import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api') : 'https://camarerio.onrender.com/api';

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
  const res = await fetch(`${API_URL}/licores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Error al crear licor');
  return res.json();
};

export const deleteLiqueur = async (id) => {
  const res = await fetch(`${API_URL}/licores/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar licor');
  return res.json();
};

export const createSoftDrink = async (name) => {
  const res = await fetch(`${API_URL}/refrescos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Error al crear refresco');
  return res.json();
};

export const deleteSoftDrink = async (id) => {
  const res = await fetch(`${API_URL}/refrescos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar refresco');
  return res.json();
};

export const getLiqueurs = async () => {
  const res = await fetch(`${API_URL}/licores`);
  if (!res.ok) throw new Error('Error al obtener licores');
  return res.json();
};

export const getSoftDrinks = async () => {
  const res = await fetch(`${API_URL}/refrescos`);
  if (!res.ok) throw new Error('Error al obtener refrescos');
  return res.json();
};

export const getIceCreams = async () => {
  const res = await fetch(`${API_URL}/icecreams`);
  if (!res.ok) throw new Error('Error al obtener sabores de helado');
  return res.json();
};

export const createIceCream = async (name) => {
  const res = await fetch(`${API_URL}/icecreams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Error al crear sabor de helado');
  return res.json();
};

export const deleteIceCream = async (id) => {
  const res = await fetch(`${API_URL}/icecreams/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar sabor de helado');
  return res.json();
};

export async function getActiveRounds() {
  const res = await fetch(`${API_URL}/rounds/active`);
  if (!res.ok) throw new Error('Error al obtener las comandas activas');
  return await res.json();
} 