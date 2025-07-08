import React, { useRef, useState, useEffect } from 'react';
import MesaBarra from '../components/MesaBarra';
import { fetchCustomTables, fetchTableStatuses, updateTablePosition } from '../services/roundService';
import { getActiveRounds } from '../services/productService';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = 'https://camarerio.onrender.com';

export default function BarraView() {
  // Hooks siempre al inicio
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [occupiedTables, setOccupiedTables] = useState(new Set());
  const [servingTables, setServingTables] = useState(new Set());
  const [editLayout, setEditLayout] = useState(false);
  const [areaSize, setAreaSize] = useState({ width: 1200, height: 700 });
  const areaRef = useRef(null);
  const [dragInfo, setDragInfo] = useState(null); // { id, offsetX, offsetY }
  const navigate = useNavigate();

  // Helper para guardar posición de cualquier mesa
  const saveTablePosition = async (table, x, y) => {
    try {
      await updateTablePosition(table._id, x, y);
      setTables(prev => prev.map(t => t._id === table._id ? { ...t, x, y } : t));
    } catch (err) {
      setError('Error al guardar la posición de la mesa');
    }
  };

  // Drag & drop manual (no nativo)
  // Handler para mouse down
  const handleMouseDown = (e, table) => {
    if (!editLayout) return;
    const rect = areaRef.current.getBoundingClientRect();
    setDragInfo({
      id: table._id,
      offsetX: e.clientX - (table.x || (rect.left + 40)),
      offsetY: e.clientY - (table.y || (rect.top + 40)),
    });
  };

  // Handler para mouse move
  const handleMouseMove = (e) => {
    if (!editLayout || !dragInfo) return;
    const rect = areaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragInfo.offsetX;
    const y = e.clientY - rect.top - dragInfo.offsetY;
    setTables(prev => prev.map(t => t._id === dragInfo.id ? { ...t, x, y } : t));
  };

  // Handler para mouse up
  const handleMouseUp = async (e) => {
    if (!editLayout || !dragInfo) return;
    const table = tables.find(t => t._id === dragInfo.id);
    if (table) {
      await saveTablePosition(table, table.x, table.y);
    }
    setDragInfo(null);
  };

  // Efecto para escuchar eventos de mouse
  useEffect(() => {
    if (!editLayout) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editLayout, dragInfo]); // Añadir dependencias

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
    if (!editLayout || table.isNumbered) return;
    // setDraggedTableId(table._id); // This state is removed, so this line is removed.
    // setDragOffset({ // This state is removed, so this line is removed.
    //   x: e.clientX - (table.x || 0),
    //   y: e.clientY - (table.y || 0)
    // });
  };
  // Handler para drag
  const handleDrag = (e, table) => {
    if (!editLayout || table.isNumbered) return;
    // if (draggedTableId !== table._id) return; // This state is removed, so this line is removed.
    if (e.clientX === 0 && e.clientY === 0) return; // Drag end
    // setTables(prev => prev.map(t => t._id === table._id ? { ...t, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : t)); // This state is removed, so this line is removed.
  };
  // Handler para drag end
  const handleDragEnd = async (e, table) => {
    if (!editLayout || table.isNumbered) return;
    // setDraggedTableId(null); // This state is removed, so this line is removed.
    const newX = e.clientX - dragInfo.offsetX; // This state is removed, so this line is removed.
    const newY = e.clientY - dragInfo.offsetY; // This state is removed, so this line is removed.
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
        <button
          className={`px-4 py-2 rounded-lg font-semibold ml-4 ${editLayout ? 'bg-green-600 text-white' : 'bg-neutral-200 text-green-900'}`}
          onClick={() => setEditLayout(v => !v)}
        >
          {editLayout ? 'Desactivar edición de layout' : 'Editar layout'}
        </button>
      </div>
      {/* Layout de mesas */}
      {!editLayout ? (
        <div className="w-full max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full">
            {tables.map(table => {
              const { isOccupied, isServing } = getMesaStatus(table);
              const hasOrder = orders[table.number] && orders[table.number].length > 0;
              return (
                <div
                  key={table._id}
                  onClick={() => { setSelectedTable(table); setShowOrderModal(true); }}
                >
                  <MesaBarra
                    numero={table.number}
                    name={table.name}
                    isOccupied={isOccupied}
                    isServing={isServing}
                    hasOrder={hasOrder}
                    isDragging={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          ref={areaRef}
          className="relative mx-auto my-10 bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg"
          style={{ width: areaSize.width, height: areaSize.height, minWidth: 320, minHeight: 400 }}
        >
          {tables.map(table => {
            const { isOccupied, isServing } = getMesaStatus(table);
            const hasOrder = orders[table.number] && orders[table.number].length > 0;
            const isDragging = dragInfo && dragInfo.id === table._id;
            return (
              <div
                key={table._id}
                style={{
                  position: 'absolute',
                  left: table.x || 40,
                  top: table.y || 40,
                  zIndex: isDragging ? 30 : 1,
                  cursor: 'grab',
                  transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0.2s',
                  opacity: isDragging ? 0.85 : 1,
                }}
                onMouseDown={e => handleMouseDown(e, table)}
              >
                <MesaBarra
                  numero={table.number}
                  name={table.name}
                  isOccupied={isOccupied}
                  isServing={isServing}
                  hasOrder={hasOrder}
                  isDragging={isDragging}
                />
              </div>
            );
          })}
          <div className="absolute inset-0 pointer-events-none rounded-2xl border-4 border-dashed border-green-300 animate-pulse" style={{ zIndex: 0 }} />
          <div className="absolute top-2 left-2 text-green-700 font-semibold bg-white bg-opacity-80 px-4 py-2 rounded-xl shadow-md">Arrastra y suelta para mover cualquier mesa</div>
        </div>
      )}
      {/* Modal de comanda o mesa vacía */}
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
              Mesa {selectedTable.name || selectedTable.number}
            </h2>
            {orders[selectedTable.number] && orders[selectedTable.number].length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {orders[selectedTable.number].map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-green-50 rounded-lg p-3 text-lg font-semibold text-green-900 shadow-sm">
                      <span>{order.name}</span>
                      <span className="font-bold">x{order.qty}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-3 bg-neutral-200 text-green-900 rounded-xl font-bold text-lg shadow hover:bg-neutral-300 transition-colors"
                  onClick={() => { navigate(`/mesas/${selectedTable.number}`); }}
                >
                  Detalles
                </button>
              </>
            ) : (
              <>
                <div className="text-center text-green-700 text-lg mb-6">La mesa está vacía</div>
                <button
                  className="w-full py-3 bg-neutral-200 text-green-900 rounded-xl font-bold text-lg shadow hover:bg-neutral-300 transition-colors"
                  onClick={() => { navigate(`/mesas/${selectedTable.number}`); }}
                >
                  Detalles
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 