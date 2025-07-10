import React from 'react';

function MesaBarra({ numero, name, isOccupied, isServing, hasOrder, isDragging }) {
  // Colores de estado
  const getStatusColor = () => {
    if (isOccupied) return '#ef4444'; // rojo
    if (isServing) return '#facc15'; // amarillo
    return '#22c55e'; // verde
  };
  const getBgColor = () => {
    if (isOccupied) return 'bg-red-100 border-red-400';
    if (isServing) return 'bg-yellow-50 border-yellow-300';
    return 'bg-white border-green-200';
  };
  const getBorderColor = () => {
    if (isOccupied) return 'border-red-400';
    if (isServing) return 'border-yellow-300';
    return 'border-green-300';
  };
  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 border-4 rounded-full shadow-lg transition-all duration-200 ${getBgColor()} ${getBorderColor()} select-none cursor-pointer hover:shadow-2xl hover:scale-105 active:scale-95 ${isDragging ? 'ring-4 ring-green-300 scale-105 shadow-2xl z-30' : ''}`}
      style={{ minWidth: 160, minHeight: 160, width: 170, height: 170 }}
    >
      {/* Estado */}
      <span className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: getStatusColor() }}></span>
      {/* SVG de mesa redonda */}
      <svg width="120" height="120" viewBox="0 0 120 120" className="mb-2 drop-shadow-md">
        {/* Sombra */}
        <ellipse cx="60" cy="110" rx="38" ry="10" fill="#d1fae5" />
        {/* Mesa */}
        <circle cx="60" cy="60" r="45" fill="#22c55e" stroke="#166534" strokeWidth="6" />
        {/* Sillas */}
        <rect x="55" y="5" width="10" height="18" rx="3" fill="#111" />
        <rect x="55" y="97" width="10" height="18" rx="3" fill="#111" />
        <rect x="5" y="55" width="18" height="10" rx="3" fill="#111" />
        <rect x="97" y="55" width="18" height="10" rx="3" fill="#111" />
      </svg>
      {/* Número grande centrado sobre la mesa */}
      <span className="absolute top-1/2 left-1/2 text-5xl font-extrabold text-white drop-shadow-lg select-none" style={{ transform: 'translate(-50%, -60%)' }}>{numero}</span>
      {/* Nombre */}
      {name && <span className="text-base text-green-900 mt-2 text-center font-semibold truncate max-w-[120px]">{name}</span>}
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