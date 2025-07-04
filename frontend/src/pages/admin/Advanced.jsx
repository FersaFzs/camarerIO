import { useState } from 'react';

const Advanced = () => {
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingTotal, setLoadingTotal] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResetDaily = async () => {
    if (!window.confirm('¿Estás seguro de que quieres poner las cuentas a 0? Esta acción no se puede deshacer.')) return;
    setLoadingDaily(true);
    setMessage(null);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://camarerio.onrender.com/api/accounting/reset-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al poner cuentas a 0');
      setMessage('Cuentas puestas a 0 correctamente.');
    } catch (err) {
      setError('Error al poner cuentas a 0');
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleResetTotal = async () => {
    if (!window.confirm('¿Estás seguro de que quieres restaurar todo? Esta acción eliminará TODOS los productos, tickets y rondas. No se puede deshacer.')) return;
    setLoadingTotal(true);
    setMessage(null);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://camarerio.onrender.com/api/accounting/reset-total', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al restaurar todo');
      setMessage('Restauración total realizada correctamente.');
    } catch (err) {
      setError('Error al restaurar todo');
    } finally {
      setLoadingTotal(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-green-900 mb-8 text-center">Opciones Avanzadas</h1>
      {message && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 shadow-sm">{message}</div>}
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">{error}</div>}
      <div className="flex flex-col gap-6">
        <button
          onClick={handleResetDaily}
          disabled={loadingDaily || loadingTotal}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          {loadingDaily ? 'Procesando...' : 'Poner cuentas a 0'}
        </button>
        <button
          onClick={handleResetTotal}
          disabled={loadingDaily || loadingTotal}
          className="bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          {loadingTotal ? 'Procesando...' : 'Restaurar Todo'}
        </button>
      </div>
      <p className="text-gray-500 text-sm mt-8 text-center">Estas acciones son irreversibles. Úsalas con precaución.</p>
    </div>
  );
};

export default Advanced; 