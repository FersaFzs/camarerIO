import React, { useRef, useState, useEffect } from 'react';
import MesaBarra from '../components/MesaBarra';
import { fetchCustomTables, fetchTableStatuses, updateTablePosition, createCustomTable } from '../services/roundService';
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
  const [successMessage, setSuccessMessage] = useState(null);

  // Helper para guardar posición de cualquier mesa
  const saveTablePosition = async (table, x, y) => {
    try {
      // Si la mesa es numerada y no tiene _id real, NO guardar en backend
      if (table._id.startsWith('mesa-')) {
        // Solo actualizar en frontend
        setTables(prev => prev.map(t => t._id === table._id ? { ...t, x, y } : t));
        return;
      }
      // Para mesas personalizadas, guardar en backend
      await updateTablePosition(table._id, x, y);
      setTables(prev => prev.map(t => t._id === table._id ? { ...t, x, y } : t));
    } catch (err) {
      setError('Error al guardar la posición de la mesa');
    }
  };

  // Reiniciar posiciones: borra x/y de todas las mesas en backend y frontend
  const resetPositions = async () => {
    try {
      // Para cada mesa personalizada, poner x/y a null en backend
      for (const table of tables) {
        if (table._id && table.x !== undefined && !table._id.startsWith('mesa-')) {
          await updateTablePosition(table._id, null, null);
        }
      }
      // En frontend, quitar x/y de todas
      setTables(prev => prev.map(t => ({ ...t, x: undefined, y: undefined })));
    } catch (err) {
      setError('Error al reiniciar posiciones');
    }
  };

  // Guardar todas las posiciones actuales
  const saveAllPositions = async () => {
    try {
      for (const table of tables) {
        if (
          table._id &&
          typeof table.x === 'number' &&
          typeof table.y === 'number' &&
          !table._id.startsWith('mesa-')
        ) {
          await updateTablePosition(table._id, table.x, table.y);
        }
      }
      setSuccessMessage('Posiciones guardadas');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError('Error al guardar posiciones');
    }
  };

  // Drag & drop manual (ratón y táctil) para modo edición
  const getEventCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerDown = (e, table) => {
    if (!editLayout) return;
    const rect = areaRef.current.getBoundingClientRect();
    const { x, y } = getEventCoords(e);
    setDragInfo({
      id: table._id,
      offsetX: x - (table.x !== undefined ? table.x : 0) - rect.left,
      offsetY: y - (table.y !== undefined ? table.y : 0) - rect.top,
      tableNumber: table.number // Usar siempre el número como identificador de posición
    });
  };

  const handlePointerMove = (e) => {
    if (!editLayout || !dragInfo) return;
    const rect = areaRef.current.getBoundingClientRect();
    const { x, y } = getEventCoords(e);
    const newX = x - rect.left - dragInfo.offsetX;
    const newY = y - rect.top - dragInfo.offsetY;
    setTables(prev => prev.map(t => t.number === dragInfo.tableNumber ? { ...t, x: newX, y: newY } : t));
  };

  const handlePointerUp = async (e) => {
    if (!editLayout || !dragInfo) return;
    // Al soltar, guardar la posición usando el número como identificador
    const table = tables.find(t => t.number === dragInfo.tableNumber);
    if (table) {
      await saveTablePosition(table, table.x, table.y);
    }
    setDragInfo(null);
  };

  // Efecto para escuchar eventos de mouse
  useEffect(() => {
    if (!editLayout) return;
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [editLayout, dragInfo]); // Añadir dependencias

  // Función para cargar mesas, estados y comandas
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let customTables = await fetchCustomTables();
      // Asignar número único a cualquier mesa personalizada sin número
      const usedNumbers = new Set();
      customTables.forEach(t => { if (typeof t.number === 'number') usedNumbers.add(t.number); });
      let nextNumber = 11;
      customTables = customTables.map((t) => {
        if (typeof t.number !== 'number' || t.number === null) {
          // Buscar el siguiente número libre
          while (usedNumbers.has(nextNumber)) nextNumber++;
          usedNumbers.add(nextNumber);
          // Si el nombre es 'Mesa X', actualiza el nombre al nuevo número
          let newName = t.name;
          if (/^Mesa \d+$/.test(t.name)) {
            newName = `Mesa ${nextNumber}`;
          }
          return { ...t, number: nextNumber, isNumbered: false, name: newName };
        }
        return { ...t, isNumbered: false };
      });
      // Generar mesas numeradas (1-10)
      const numberedTables = Array.from({ length: 10 }, (_, i) => ({
        _id: `mesa-${i + 1}`,
        number: i + 1,
        name: `Mesa ${i + 1}`,
        isNumbered: true
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

  // Calcula posiciones grid para todas las mesas (5 columnas, tamaño 200x140, margen 32)
  const CARD_W = 200, CARD_H = 140, GAP = 32, COLS = 5;
  function getGridPosition(index) {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    return {
      x: col * (CARD_W + GAP),
      y: row * (CARD_H + GAP),
    };
  }
  // Al cargar mesas, asignar x/y si no tienen
  useEffect(() => {
    if (!tables.length) return;
    setTables(prev => prev.map((t, i) => {
      if (typeof t.number === 'undefined' || t.number === null) {
        console.warn('Mesa sin número:', t);
        return t;
      }
      if (typeof t.x === 'number' && typeof t.y === 'number') return t;
      const pos = getGridPosition(i);
      return { ...t, x: pos.x, y: pos.y };
    }));
    // eslint-disable-next-line
  }, [tables.length]);

  // Al crear una mesa personalizada, asigna un número único
  const createCustomTableWithNumber = async (name) => {
    // Buscar el siguiente número libre
    const usedNumbers = new Set(tables.map(t => t.number));
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) nextNumber++;
    const created = await createCustomTable(name);
    return { ...created, number: nextNumber };
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
      <div ref={areaRef} className="w-full max-w-7xl mx-auto px-4 py-10 relative min-h-[700px]" style={{ height: '700px' }}>
        {tables.filter(table => typeof table.number !== 'undefined' && table.number !== null).map((table, i) => {
          const { isOccupied, isServing } = getMesaStatus(table);
          const hasOrder = orders[table.number?.toString?.()] && orders[table.number?.toString?.()].length > 0;
          const isDragging = dragInfo && dragInfo.tableNumber === table.number;
          const style = {
            position: 'absolute',
            left: table.x,
            top: table.y,
            width: CARD_W,
            height: CARD_H,
            zIndex: isDragging ? 30 : 1,
            cursor: editLayout ? 'grab' : 'pointer',
            transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0.2s',
            opacity: isDragging ? 0.85 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          };
          return (
            <div
              key={table._id}
              style={style}
              onMouseDown={e => editLayout && handlePointerDown(e, table)}
              onTouchStart={e => editLayout && handlePointerDown(e, table)}
              onClick={e => {
                if (!editLayout) {
                  setSelectedTable(table);
                  setShowOrderModal(true);
                } else {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
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
        {/* Botones flotantes solo en modo edición */}
        {editLayout && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow hover:bg-green-700 transition-colors"
              onClick={saveAllPositions}
            >
              Guardar posición
            </button>
            <button
              className="px-6 py-3 bg-neutral-200 text-green-900 rounded-xl font-bold text-lg shadow hover:bg-neutral-300 transition-colors"
              onClick={resetPositions}
            >
              Reiniciar posiciones
            </button>
          </div>
        )}
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="fixed bottom-24 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium">
            {successMessage}
          </div>
        )}
      </div>
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
            {orders[selectedTable.number?.toString?.()] && orders[selectedTable.number?.toString?.()].length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {orders[selectedTable.number?.toString?.()].map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-green-50 rounded-lg p-3 text-lg font-semibold text-green-900 shadow-sm">
                      <span>{order.name}</span>
                      <span className="font-bold">x{order.qty}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-3 bg-neutral-200 text-green-900 rounded-xl font-bold text-lg shadow hover:bg-neutral-300 transition-colors mb-2"
                  onClick={() => { navigate(`/mesas/${selectedTable.number}`); }}
                >
                  Detalles
                </button>
              </>
            ) : (
              <>
                <div className="text-center text-green-700 text-lg mb-6">La mesa está vacía</div>
                <button
                  className="w-full py-3 bg-neutral-200 text-green-900 rounded-xl font-bold text-lg shadow hover:bg-neutral-300 transition-colors mb-2"
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