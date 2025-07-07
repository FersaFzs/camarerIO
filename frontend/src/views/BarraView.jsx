import { useState } from 'react';

// Datos simulados de mesas y comandas
const initialTables = [
  { id: 1, name: 'Mesa 1', posX: 0, posY: 0 },
  { id: 2, name: 'Mesa 2', posX: 1, posY: 0 },
  { id: 3, name: 'Mesa 3', posX: 2, posY: 0 },
  { id: 4, name: 'Mesa 4', posX: 0, posY: 1 },
  { id: 5, name: 'Mesa 5', posX: 1, posY: 1 },
];

const mockOrders = {
  1: [ { name: 'Café solo', qty: 2 }, { name: 'Tostada', qty: 1 } ],
  2: [ { name: 'Cubata', qty: 1 } ],
  3: [ { name: 'Helado', qty: 3 } ],
  4: [],
  5: [ { name: 'Cerveza', qty: 2 } ],
};

const GRID_SIZE = 120;

export default function BarraView() {
  const [tables, setTables] = useState(initialTables);
  const [editing, setEditing] = useState(false);
  const [draggedId, setDraggedId] = useState(null);

  // Drag & drop handlers
  const handleDragStart = (id) => setDraggedId(id);
  const handleDrop = (x, y) => {
    if (draggedId == null) return;
    setTables(tables => tables.map(t => t.id === draggedId ? { ...t, posX: x, posY: y } : t));
    setDraggedId(null);
  };

  // Render grid cells
  const grid = [];
  const maxX = Math.max(...tables.map(t => t.posX));
  const maxY = Math.max(...tables.map(t => t.posY));
  for (let y = 0; y <= maxY + 1; y++) {
    for (let x = 0; x <= maxX + 1; x++) {
      const table = tables.find(t => t.posX === x && t.posY === y);
      grid.push(
        <div
          key={`cell-${x}-${y}`}
          className="relative w-[120px] h-[120px] border border-green-100 bg-green-50 flex items-center justify-center"
          onDragOver={e => editing && e.preventDefault()}
          onDrop={editing ? () => handleDrop(x, y) : undefined}
        >
          {table && (
            <div
              draggable={editing}
              onDragStart={() => handleDragStart(table.id)}
              className={`rounded-2xl shadow-lg border-2 ${editing ? 'border-green-400 bg-green-100 cursor-move' : 'border-green-200 bg-white'} flex flex-col items-center justify-center w-[90px] h-[90px] transition-all duration-150 select-none`}
            >
              <span className="text-2xl font-bold text-green-800 mb-1">{table.name}</span>
              <div className="w-full flex flex-col gap-1 items-center">
                {(mockOrders[table.id] || []).length === 0 ? (
                  <span className="text-green-400 text-sm">Sin comandas</span>
                ) : (
                  mockOrders[table.id].map((order, idx) => (
                    <div key={idx} className="bg-green-200 text-green-900 rounded px-2 py-1 text-sm font-semibold flex items-center gap-2">
                      <span>{order.name}</span>
                      <span className="font-bold">x{order.qty}</span>
                      {!editing && <button className="ml-2 px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Listo</button>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col font-inter">
      {/* Barra superior */}
      <div className="w-full flex items-center justify-between h-16 px-6 bg-green-100 border-b border-green-200 shadow-sm sticky top-0 left-0 z-50">
        <h1 className="text-2xl font-extrabold text-green-800 tracking-tight">Vista de Comandas (Barra)</h1>
        <button
          onClick={() => setEditing(e => !e)}
          className={`px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm border-2 ${editing ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-400 hover:bg-green-100'}`}
        >
          {editing ? 'Salir de edición' : 'Editar disposición'}
        </button>
      </div>
      {/* Grid de mesas */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${maxX + 2}, ${GRID_SIZE}px)`, gridTemplateRows: `repeat(${maxY + 2}, ${GRID_SIZE}px)` }}
        >
          {grid}
        </div>
      </div>
    </div>
  );
} 