import { useState, useEffect } from 'react';
import { getDailyStats, getMonthlyStats, getPreviousMonths } from '../../services/accountingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import '../../mesas-modern.css'

const Accounting = () => {
  const [dailyStats, setDailyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [previousMonths, setPreviousMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [daily, monthly, prev] = await Promise.all([
        getDailyStats(),
        getMonthlyStats(),
        getPreviousMonths()
      ]);
      setDailyStats(daily);
      setMonthlyStats(monthly);
      setPreviousMonths(prev);
      setSelectedMonth(null);
      setError(null);
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMonth = async (month, year) => {
    try {
      setLoading(true);
      const stats = await getMonthlyStats(month, year);
      setMonthlyStats(stats);
      setSelectedMonth({ month, year });
    } catch (err) {
      setError('Error al cargar el mes seleccionado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDaily = async () => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar las estadísticas del día? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsResetting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`$${import.meta.env.VITE_API_URL?.includes("/api") ? import.meta.env.VITE_API_URL : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + "/api" : "https://camarerio.onrender.com/api")}/accounting/reset-daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al reiniciar las estadísticas');
      }

      await loadStats();
    } catch (err) {
      setError('Error al reiniciar las estadísticas');
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const getProductStats = (rounds) => {
    if (!rounds) return [];
    const counts = {};
    rounds.forEach(r => {
      if (!r.products) return;
      r.products.forEach(p => {
        const name = p.product?.name || p.name || 'Desconocido';
        if (!counts[name]) counts[name] = { qty: 0, rev: 0 };
        counts[name].qty += p.quantity;
        counts[name].rev += p.quantity * (p.product?.price || p.price || 0);
      });
    });
    return Object.entries(counts).sort((a,b) => b[1].qty - a[1].qty);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 sm:p-4 md:p-8 mt-2 md:mt-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8 gap-2 md:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold text-green-900">Contabilidad</h1>
        <button
          onClick={handleResetDaily}
          disabled={isResetting}
          className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
        >
          {isResetting ? 'Reiniciando...' : 'Reiniciar Día'}
        </button>
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Tarjeta de Total del Día */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-green-900 mb-2">Total del Día</h2>
          <p className="text-3xl md:text-4xl font-bold text-green-700">
            {formatCurrency(dailyStats?.total || 0)}
          </p>
          <p className="text-green-400 mt-2">
            {format(new Date(dailyStats?.date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <div className="mt-4">
            <span className="text-green-700 font-semibold">Rondas pagadas: </span>
            <span className="text-green-900 font-bold">{dailyStats?.roundCount || 0}</span>
          </div>
        </div>
        {/* Tarjeta de Total del Mes */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-green-900 mb-2">
            {selectedMonth ? `Resumen de ${selectedMonth.month}/${selectedMonth.year}` : 'Total del Mes'}
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-green-700">
            {formatCurrency(monthlyStats?.total || 0)}
          </p>
          <div className="mt-4">
            <span className="text-green-700 font-semibold">Rondas pagadas: </span>
            <span className="text-green-900 font-bold">{monthlyStats?.roundCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Estadísticas de Productos */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-green-900 mb-4">
          Productos Vendidos ({selectedMonth ? `Mes: ${selectedMonth.month}/${selectedMonth.year}` : 'Hoy'})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm md:text-base border-collapse">
            <thead>
              <tr className="border-b-2 border-green-100 text-green-800">
                <th className="py-2 px-4">Producto</th>
                <th className="py-2 px-4 text-center">Cantidad</th>
                <th className="py-2 px-4 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {getProductStats(selectedMonth ? monthlyStats?.rounds : dailyStats?.rounds).map(([name, data]) => (
                <tr key={name} className="border-b border-green-50 hover:bg-green-50">
                  <td className="py-2 px-4 font-medium text-green-900">{name}</td>
                  <td className="py-2 px-4 text-center font-bold text-green-700">{data.qty}</td>
                  <td className="py-2 px-4 text-right text-green-800">{formatCurrency(data.rev)}</td>
                </tr>
              ))}
              {getProductStats(selectedMonth ? monthlyStats?.rounds : dailyStats?.rounds).length === 0 && (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-green-500">No hay ventas registradas en este periodo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de meses */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-bold text-green-900 mb-2 md:mb-4">Historial de meses</h2>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {previousMonths.map((m) => (
            <button
              key={`${m.month}-${m.year}`}
              onClick={() => handleSelectMonth(m.month, m.year)}
              className={`bg-white rounded-xl shadow p-3 md:p-4 min-w-[140px] md:min-w-[180px] text-left border-2 transition-colors ${selectedMonth && selectedMonth.month === m.month && selectedMonth.year === m.year ? 'border-green-600' : 'border-green-100 hover:border-green-400'}`}
            >
              <div className="text-green-900 font-semibold text-base md:text-lg mb-1">
                {m.month}/{m.year}
              </div>
              <div className="text-green-700 font-bold text-lg md:text-xl">
                {formatCurrency(m.total)}
              </div>
              <div className="text-green-400 text-xs md:text-sm mt-1">
                Rondas: <span className="text-green-900 font-bold">{m.roundCount}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Si hay un mes seleccionado, mostrar botón para volver al mes actual */}
      {selectedMonth && (
        <div className="mb-6 md:mb-8">
          <button
            onClick={loadStats}
            className="px-3 md:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold w-full md:w-auto"
          >
            Volver al mes actual
          </button>
        </div>
      )}
    </div>
  );
};

export default Accounting; 