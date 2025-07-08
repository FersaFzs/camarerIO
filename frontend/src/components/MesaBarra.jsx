import React from 'react';

function MesaBarra({ numero, name, isOccupied, isServing, hasOrder, onClick, draggable, onDragStart, onDrag, onDragEnd, style }) {
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
      className={`relative flex flex-col items-center justify-center p-3 border rounded-xl shadow-sm transition-transform ${getBgColor()} select-none`}
      style={style}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    >
      {/* Estado */}
      <span className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor()}`}></span>
      {/* Número grande */}
      <span className="text-2xl font-extrabold text-green-900 mb-1">{numero}</span>
      {/* Nombre */}
      {name && <span className="text-sm text-green-700 mb-1 text-center">{name}</span>}
      {/* Badge de comanda pendiente */}
      {hasOrder && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse z-20">
          ¡Comanda!
        </span>
      )}
    </div>
  );
}

export default MesaBarra; 