import { useState, useEffect } from 'react';
import Mesa from '../components/Mesa';
import { fetchCustomTables, fetchTableStatuses, updateTablePosition } from '../services/roundService';
import { getActiveRounds } from '../services/productService';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = 'https://camarerio.onrender.com';

export default function BarraView() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [occupiedTables, setOccupiedTables] = useState(new Set());
  const [servingTables, setServingTables] = useState(new Set());
  const [draggedTableId, setDraggedTableId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Función para cargar mesas, estados y comandas
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let customTables = await fetchCustomTables();
      // Generar mesas numeradas (1-10)
      const numberedTables = Array.from({ length: 10 }, (_, i) => ({
        _id: `mesa-${i + 1}`,
        number: i + 1,
        name: `Mesa ${i + 1}`,
        isNumbered: true
      }));
      customTables = customTables.map((t) => ({
        ...t,
        isNumbered: false
      }));
      const allTables = [...numberedTables, ...customTables];
      setTables(allTables);
      // Estados de mesas
      const statuses = await fetchTableStatuses();
      const occupiedSet = new Set();
      const servingSet = new Set();
      statuses.forEach(status => {
        if (status.status === 'occupied') {
          occupiedSet.add(status.tableNumber.toString());
        } else if (status.status === 'serving') {
          servingSet.add(status.tableNumber.toString());
        }
      });
      setOccupiedTables(occupiedSet);
      setServingTables(servingSet);
      // Comandas activas
      const rounds = await getActiveRounds();
      const ordersByTable = {};
      rounds.forEach(round => {
        const tnum = round.tableNumber;
        if (!ordersByTable[tnum]) ordersByTable[tnum] = [];
        round.products.forEach(item => {
          if (!item.product) return;
          const existing = ordersByTable[tnum].find(o => o.name === (item.product.name || item.name));
          if (existing) existing.qty += item.quantity;
          else ordersByTable[tnum].push({ name: item.product.name || item.name, qty: item.quantity });
        });
      });
      setOrders(ordersByTable);
    } catch (err) {
      setError('Error al cargar mesas o comandas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos y conectar socket
  useEffect(() => {
    loadData();
    const socket = io(SOCKET_URL);
    socket.on('rounds:update', () => {
      loadData();
    });
    socket.on('tables:update', () => {
      loadData();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-600 font-bold text-2xl">{error}</div>;
  }

  // Estado visual de la mesa (libre, sirviendo, ocupada) real
  const getMesaStatus = (table) => {
    const numStr = table.number.toString();
    return {
      isOccupied: occupiedTables.has(numStr),
      isServing: servingTables.has(numStr)
    };
  };

  // Handler para drag start
  const handleDragStart = (e, table) => {
    if (table.isNumbered) return;
    setDraggedTableId(table._id);
    setDragOffset({
      x: e.clientX - (table.x || 0),
      y: e.clientY - (table.y || 0)
    });
  };
  // Handler para drag
  const handleDrag = (e, table) => {
    if (table.isNumbered) return;
    if (draggedTableId !== table._id) return;
    if (e.clientX === 0 && e.clientY === 0) return; // Drag end
    setTables(prev => prev.map(t => t._id === table._id ? { ...t, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : t));
  };
  // Handler para drag end
  const handleDragEnd = async (e, table) => {
    if (table.isNumbered) return;
    setDraggedTableId(null);
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    try {
      await updateTablePosition(table._id, newX, newY);
      setTables(prev => prev.map(t => t._id === table._id ? { ...t, x: newX, y: newY } : t));
    } catch (err) {
      setError('Error al guardar la posición de la mesa');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      {/* Header */}
      <div className="w-full flex items-center justify-between h-20 px-10 bg-white border-b border-green-200 shadow-sm sticky top-0 left-0 z-50">
        <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Comandas</h1>
      </div>
      {/* Layout libre de mesas */}
      <div className="relative w-full max-w-7xl h-[700px] bg-white border border-green-100 rounded-2xl shadow-md overflow-hidden mx-auto px-4 py-10">
        {/* Mesas numeradas (no movibles, layout fijo) */}
        {tables.filter(t => t.isNumbered).map((table, index) => {
          // Distribuir en círculo
          const angle = (2 * Math.PI * index) / 10;
          const radius = 280;
          const centerX = 600;
          const centerY = 350;
          const x = centerX + radius * Math.cos(angle) - 60;
          const y = centerY + radius * Math.sin(angle) - 60;
          const { isOccupied, isServing } = getMesaStatus(table);
          const hasOrder = orders[table.number] && orders[table.number].length > 0;
          return (
            <div key={table._id} style={{ position: 'absolute', left: x, top: y }}>
              <div onClick={() => hasOrder && (setSelectedTable(table), setShowOrderModal(true))} className="cursor-pointer">
                <Mesa
                  numero={table.number}
                  name={table.name}
                  isOccupied={isOccupied}
                  isServing={isServing}
                />
                {hasOrder && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg animate-pulse z-20">
                    ¡Comanda pendiente!
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {/* Mesas personalizadas (movibles) */}
        {tables.filter(t => !t.isNumbered).map((table) => {
          const { isOccupied, isServing } = getMesaStatus(table);
          const hasOrder = orders[table.number] && orders[table.number].length > 0;
          return (
            <div
              key={table._id}
              style={{ position: 'absolute', left: table.x || 50, top: table.y || 50, zIndex: draggedTableId === table._id ? 10 : 1, cursor: 'grab' }}
              draggable
              onDragStart={e => handleDragStart(e, table)}
              onDrag={e => handleDrag(e, table)}
              onDragEnd={e => handleDragEnd(e, table)}
            >
              <div onClick={() => hasOrder && (setSelectedTable(table), setShowOrderModal(true))} className="cursor-pointer">
                <Mesa
                  numero={table.number}
                  name={table.name}
                  isOccupied={isOccupied}
                  isServing={isServing}
                />
                {hasOrder && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg animate-pulse z-20">
                    ¡Comanda pendiente!
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal de comanda */}
      {showOrderModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-green-100 relative">
            <button
              className="absolute top-4 right-4 text-green-700 hover:text-green-900 text-2xl font-bold"
              onClick={() => setShowOrderModal(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-extrabold mb-6 text-green-900 text-center tracking-tight">
              Comanda de {selectedTable.name || `Mesa ${selectedTable.number}`}
            </h2>
            <div className="space-y-3 mb-6">
              {(orders[selectedTable.number] || []).map((order, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-50 rounded-lg p-3 text-lg font-semibold text-green-900 shadow-sm">
                  <span>{order.name}</span>
                  <span className="font-bold">x{order.qty}</span>
                </div>
              ))}
            </div>
            <button
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow hover:bg-green-700 transition-colors mb-4"
              onClick={() => setShowOrderModal(false)}
            >
              Listo
            </button>
            <button
              className="w-full py-3 bg-neutral-200 text-green-900 rounded-xl font-bold text-lg shadow hover:bg-neutral-300 transition-colors"
              onClick={() => { window.open(`/mesas/${selectedTable.number}`, '_blank'); }}
            >
              Ver gestión avanzada
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 