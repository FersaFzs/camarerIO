import { useState, useEffect, useRef } from 'react';
import { fetchCustomTables, createCustomTable, deleteCustomTable, updateCustomTable, updateTablePosition } from '../../services/roundService';

// Esqueleto de la vista de gestión de mesas default (admin)
export default function TableAdmin() {
  const [tables, setTables] = useState([]); // Mesas default
  const [editMode, setEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dragInfo, setDragInfo] = useState(null);
  const areaRef = useRef(null);

  // Añadir estado editName, editNumber, editError y lógica para inicializarlos al abrir el modal
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editError, setEditError] = useState(null);

  // Añadir estado createName, createError
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState(null);

  // Cargar mesas default desde el backend
  useEffect(() => {
    const loadTables = async () => {
      try {
        const allTables = await fetchCustomTables();
        // Filtrar solo mesas default (por ejemplo, número <= 100)
        setTables(allTables.filter(t => typeof t.number === 'number' && t.number <= 100));
      } catch (err) {
        // Manejo de error
        setTables([]);
      }
    };
    loadTables();
  }, []);

  // Handlers principales (placeholders)
  const handleEdit = (table) => {
    setSelectedTable(table);
    setEditName(table.name);
    setEditNumber(table.number);
    setShowEditModal(true);
  };
  // Eliminar mesa default en backend
  const handleDelete = async (table) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta mesa?')) return;
    try {
      await deleteCustomTable(table._id);
      setTables(prev => prev.filter(t => t._id !== table._id));
    } catch (err) {
      // Manejo de error
    }
  };
  const handleCreate = () => {
    setShowCreateModal(true);
  };
  // Guardar posiciones/layout en backend
  const handleSaveLayout = async () => {
    try {
      await Promise.all(tables.map(t => updateTablePosition(t._id, t.x, t.y)));
      alert('Cambios guardados');
      setEditMode(false);
    } catch (err) {
      alert('Error al guardar posiciones');
    }
  };
  // Drag & drop básico (solo esqueleto)
  const handlePointerDown = (e, table) => {
    if (!editMode) return;
    const rect = areaRef.current.getBoundingClientRect();
    setDragInfo({
      id: table._id,
      offsetX: e.clientX - (table.x || 0) - rect.left,
      offsetY: e.clientY - (table.y || 0) - rect.top,
    });
  };
  const handlePointerMove = (e) => {
    if (!editMode || !dragInfo) return;
    const rect = areaRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragInfo.offsetX;
    const newY = e.clientY - rect.top - dragInfo.offsetY;
    setTables(prev => prev.map(t => t._id === dragInfo.id ? { ...t, x: newX, y: newY } : t));
  };
  const handlePointerUp = () => {
    setDragInfo(null);
  };
  useEffect(() => {
    if (!editMode) return;
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [editMode, dragInfo]);

  // Crear mesa default en backend
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError('El nombre no puede estar vacío');
      return;
    }
    // Buscar el siguiente número libre
    const usedNumbers = new Set(tables.map(t => t.number));
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) nextNumber++;
    try {
      const newTable = await createCustomTable({ name: createName.trim(), number: nextNumber });
      setTables(prev => [...prev, newTable]);
      setShowCreateModal(false);
      setCreateName('');
      setCreateError(null);
    } catch (err) {
      setCreateError('Error al crear la mesa');
    }
  };

  // Editar mesa default en backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (tables.some(t => t.number === Number(editNumber) && t._id !== selectedTable._id)) {
      setEditError('Ya existe una mesa con ese número');
      return;
    }
    if (!editName.trim()) {
      setEditError('El nombre no puede estar vacío');
      return;
    }
    try {
      const updated = await updateCustomTable(selectedTable._id, { name: editName.trim(), number: Number(editNumber) });
      setTables(prev => prev.map(t => t._id === selectedTable._id ? updated : t));
      setShowEditModal(false);
      setEditError(null);
    } catch (err) {
      setEditError('Error al editar la mesa');
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 font-inter flex flex-col items-center justify-start">
      <div className="w-full pt-4 pb-2 sm:pt-8 sm:pb-2 md:pt-12 md:pb-4 flex flex-col items-center">
        <div className="w-full rounded-2xl bg-green-50 border border-green-100 shadow-sm flex flex-col md:flex-row items-center justify-between mb-4 md:mb-8 px-2 sm:px-6 py-3 sm:py-5 md:px-8 md:py-6 gap-2 md:gap-0">
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 tracking-tight text-center flex-1">
            Gestión de Mesas Default
          </span>
          <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
            <button
              className="px-4 md:px-5 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors"
              onClick={() => setEditMode(v => !v)}
            >
              {editMode ? 'Salir de edición' : 'Editar layout'}
            </button>
            {editMode && (
              <button
                className="px-4 md:px-5 py-2 bg-green-700 text-white rounded-lg font-semibold shadow hover:bg-green-800 transition-colors"
                onClick={handleCreate}
              >
                Crear mesa
              </button>
            )}
            {editMode && (
              <button
                className="px-4 md:px-5 py-2 bg-green-900 text-white rounded-lg font-semibold shadow hover:bg-green-800 transition-colors"
                onClick={handleSaveLayout}
              >
                Guardar cambios
              </button>
            )}
          </div>
        </div>
        {/* Layout visual tipo barra */}
        <div ref={areaRef} className="relative w-full h-[400px] sm:h-[500px] bg-white rounded-2xl border border-green-100 shadow-md mb-8" style={{ minHeight: 300 }}>
          {tables.map(table => (
            <div
              key={table._id}
              style={{
                position: 'absolute',
                left: table.x,
                top: table.y,
                width: 150,
                height: 150,
                zIndex: 1,
                cursor: editMode ? 'grab' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0fdf4',
                borderRadius: 20,
                border: '2px solid #22c55e',
                boxShadow: '0 2px 8px #0001',
              }}
              onMouseDown={e => editMode && handlePointerDown(e, table)}
              onClick={() => !editMode && handleEdit(table)}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-green-900">{table.name}</span>
                <span className="text-lg text-green-700">Nº {table.number}</span>
                {editMode && (
                  <button
                    className="mt-4 px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-red-700"
                    onClick={e => { e.stopPropagation(); handleDelete(table); }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Modales de crear/editar mesa (placeholders) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-green-900 mb-6">Crear nueva mesa</h2>
              <form
                className="space-y-6"
                onSubmit={handleCreateSubmit}
              >
                <div>
                  <label className="block text-green-900 font-medium mb-1">Nombre de la mesa</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    required
                  />
                </div>
                {createError && <div className="text-red-600 font-medium mb-2">{createError}</div>}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-neutral-200 hover:bg-neutral-300 text-green-900 px-4 py-2 rounded-lg font-semibold"
                    onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showEditModal && selectedTable && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-green-900 mb-6">Editar mesa</h2>
              <form
                className="space-y-6"
                onSubmit={handleEditSubmit}
              >
                <div>
                  <label className="block text-green-900 font-medium mb-1">Nombre de la mesa</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-green-900 font-medium mb-1">Número</label>
                  <input
                    type="number"
                    value={editNumber}
                    onChange={e => setEditNumber(e.target.value)}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    required
                  />
                </div>
                {editError && <div className="text-red-600 font-medium mb-2">{editError}</div>}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-neutral-200 hover:bg-neutral-300 text-green-900 px-4 py-2 rounded-lg font-semibold"
                    onClick={() => { setShowEditModal(false); setEditError(null); }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 