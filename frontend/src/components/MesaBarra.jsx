import React from 'react';

function MesaBarra({ numero, name, isOccupied, isServing, hasOrder, isDragging }) {
  // Colores de estado
  const getStatusColor = () => {
    if (isOccupied) return 'bg-red-500';
    if (isServing) return 'bg-yellow-400';
    return 'bg-green-500';
  };
  const getBgColor = () => {
    if (isOccupied) return 'bg-red-100 border-red-300';
    if (isServing) return 'bg-yellow-50 border-yellow-300';
    return 'bg-white border-gray-200';
  };
  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 border rounded-2xl shadow-md transition-all duration-200 ${getBgColor()} select-none cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 ${isDragging ? 'ring-4 ring-green-300 scale-105 shadow-2xl z-30' : ''}`}
      style={{ minWidth: 120, minHeight: 120 }}
    >
      {/* Estado */}
      <span className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor()} border-2 border-white shadow`}></span>
      {/* Número grande */}
      <span className="text-2xl font-extrabold text-green-900 mb-1 drop-shadow-sm">{numero}</span>
      {/* Nombre */}
      {name && <span className="text-sm text-green-700 mb-1 text-center font-medium truncate max-w-[110px]">{name}</span>}
      {/* Badge de comanda pendiente */}
      {hasOrder && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse z-20 border-2 border-white">
          ¡Comanda!
        </span>
      )}
    </div>
  );
}

export default MesaBarra; 