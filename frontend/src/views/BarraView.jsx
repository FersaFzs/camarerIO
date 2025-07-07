import { useState, useEffect, useRef } from 'react';
import { fetchCustomTables, updateCustomTable } from '../services/roundService';
import { getActiveRounds } from '../services/productService';

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;
const TABLE_SIZE = 160;

export default function BarraView() {
  const [tables, setTables] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef();

  // Cargar mesas y comandas reales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const mesas = await fetchCustomTables();
        setTables(mesas);
        const rounds = await getActiveRounds();
        // Agrupar productos por mesa
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
    loadData();
  }, []);

  // Drag & drop libre
  const handleMouseDown = (e, table) => {
    if (!editing) return;
    setDraggedId(table._id);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (table.posX || 100),
      y: e.clientY - (table.posY || 100)
    });
  };

  const handleMouseMove = (e) => {
    if (!editing || !draggedId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setTables(tables => tables.map(t => t._id === draggedId ? { ...t, posX: Math.max(0, Math.min(x, CANVAS_WIDTH - TABLE_SIZE)), posY: Math.max(0, Math.min(y, CANVAS_HEIGHT - TABLE_SIZE)) } : t));
  };

  const handleMouseUp = async () => {
    if (!editing || !draggedId) return;
    const table = tables.find(t => t._id === draggedId);
    setDraggedId(null);
    setDragOffset({ x: 0, y: 0 });
    // Guardar la nueva posición en el backend
    try {
      await updateCustomTable(table._id, { posX: table.posX, posY: table.posY });
    } catch (err) {
      setError('Error al guardar la posición de la mesa');
    }
  };

  useEffect(() => {
    if (!editing) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-600 font-bold text-3xl">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col font-inter">
      {/* Barra superior */}
      <div className="w-full flex items-center justify-between h-24 px-12 bg-green-100 border-b-4 border-green-300 shadow-md sticky top-0 left-0 z-50">
        <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">Vista de Comandas (Barra)</h1>
        <button
          onClick={() => setEditing(e => !e)}
          className={`px-8 py-4 rounded-2xl text-2xl font-bold transition-colors shadow-lg border-4 ${editing ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-400 hover:bg-green-100'}`}
        >
          {editing ? 'Salir de edición' : 'Editar disposición'}
        </button>
      </div>
      {/* Canvas de mesas */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          ref={canvasRef}
          className="relative bg-green-200 rounded-3xl shadow-2xl border-4 border-green-300"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, touchAction: 'none' }}
        >
          {tables.map(table => (
            <div
              key={table._id}
              style={{
                position: 'absolute',
                left: table.posX || 100,
                top: table.posY || 100,
                width: TABLE_SIZE,
                height: TABLE_SIZE,
                zIndex: draggedId === table._id ? 10 : 1,
                boxShadow: draggedId === table._id ? '0 0 0 8px #34d39955' : undefined,
                transition: draggedId === table._id ? 'none' : 'box-shadow 0.2s',
                cursor: editing ? 'grab' : 'default',
                userSelect: 'none',
              }}
              onMouseDown={e => handleMouseDown(e, table)}
            >
              <div className={`rounded-full w-full h-full flex flex-col items-center justify-center border-4 ${editing ? 'border-green-500 bg-green-100' : 'border-green-700 bg-white'} shadow-xl p-2`}>
                <span className="text-4xl font-extrabold text-green-800 mb-2 drop-shadow-lg">{table.name || `Mesa ${table.number}`}</span>
                <div className="w-full flex flex-col gap-3 items-center">
                  {(orders[table.number] || []).length === 0 ? (
                    <span className="text-green-400 text-2xl">Sin comandas</span>
                  ) : (
                    orders[table.number].map((order, idx) => (
                      <div key={idx} className="bg-green-300 text-green-900 rounded-2xl px-4 py-3 text-2xl font-bold flex items-center gap-4 shadow-md">
                        <span>{order.name}</span>
                        <span className="font-extrabold">x{order.qty}</span>
                        {!editing && <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-xl font-bold shadow">Listo</button>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 