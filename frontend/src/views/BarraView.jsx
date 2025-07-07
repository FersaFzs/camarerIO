import { useState, useEffect, useRef } from 'react';
import { fetchCustomTables, updateCustomTable } from '../services/roundService';
import { getActiveRounds } from '../services/productService';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const TABLE_SIZE = 100;
const DEFAULT_POSITIONS = [
  { x: 80, y: 80 },
  { x: 240, y: 80 },
  { x: 400, y: 80 },
  { x: 80, y: 240 },
  { x: 240, y: 240 },
  { x: 400, y: 240 },
  { x: 80, y: 400 },
  { x: 240, y: 400 },
  { x: 400, y: 400 },
];

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
        let mesas = await fetchCustomTables();
        // Si alguna mesa no tiene posX/posY, asignar posición por defecto
        mesas = mesas.map((t, i) => ({
          ...t,
          posX: typeof t.posX === 'number' ? t.posX : DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length].x,
          posY: typeof t.posY === 'number' ? t.posY : DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length].y,
        }));
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
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-600 font-bold text-2xl">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      {/* Header */}
      <div className="w-full flex items-center justify-between h-20 px-10 bg-white border-b border-green-200 shadow-sm sticky top-0 left-0 z-50">
        <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Comandas</h1>
        <button
          onClick={() => setEditing(e => !e)}
          className={`px-6 py-3 rounded-xl text-lg font-bold transition-colors shadow border-2 ${editing ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-400 hover:bg-green-100'}`}
        >
          {editing ? 'Salir de edición' : 'Editar disposición'}
        </button>
      </div>
      {/* Canvas de mesas */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          ref={canvasRef}
          className="relative bg-white rounded-3xl shadow-xl border border-green-100"
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
                boxShadow: draggedId === table._id ? '0 0 0 8px #34d39933' : '0 2px 12px 0 #0001',
                transition: draggedId === table._id ? 'none' : 'box-shadow 0.2s',
                cursor: editing ? 'grab' : 'default',
                userSelect: 'none',
              }}
              onMouseDown={e => handleMouseDown(e, table)}
            >
              <div className={`rounded-2xl w-full h-full flex flex-col items-center justify-center border border-green-200 bg-white shadow p-2`}> 
                <span className="text-xl font-bold text-green-800 mb-1 truncate w-full text-center">{table.name || `Mesa ${table.number}`}</span>
                <div className="w-full flex flex-col gap-2 items-center">
                  {(orders[table.number] || []).length === 0 ? (
                    <span className="text-green-300 text-base">Sin comandas</span>
                  ) : (
                    orders[table.number].map((order, idx) => (
                      <div key={idx} className="bg-green-100 text-green-900 rounded-lg px-2 py-1 text-base font-semibold flex items-center gap-2 shadow-sm w-full justify-between">
                        <span className="truncate max-w-[70px]">{order.name}</span>
                        <span className="font-bold">x{order.qty}</span>
                        {!editing && <button className="ml-2 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold shadow">Listo</button>}
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