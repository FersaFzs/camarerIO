const API_URL = import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api') : 'https://camarerio.onrender.com/api';

export const printPreTicket = async (tableNumber, items, total) => {
  const response = await fetch(`${API_URL}/printer/pre-ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ tableNumber, items, total })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al imprimir cuenta');
  }
  return response.json();
};

export const printPaymentTicket = async (tableNumber, items, total, paymentMethod) => {
  const response = await fetch(`${API_URL}/printer/print-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ tableNumber, items, total, paymentMethod })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al imprimir ticket de pago');
  }
  return response.json();
};
