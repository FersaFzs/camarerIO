import React from 'react';

function MesaBarra({ numero, name, isOccupied, isServing, hasOrder, isDragging }) {
  // Colores de estado
  const getStatusColor = () => {
    if (isOccupied) return '#ef4444'; // rojo
    if (isServing) return '#facc15'; // amarillo
    return '#22c55e'; // verde
  };
  const getBgColor = () => {
    if (isOccupied) return 'bg-red-50 border-red-300';
    if (isServing) return 'bg-yellow-50 border-yellow-300';
    return 'bg-white border-green-200';
  };
  const getBorderColor = () => {
    if (isOccupied) return 'border-red-300';
    if (isServing) return 'border-yellow-300';
    return 'border-green-300';
  };
  return (
    <div
      className={`relative flex flex-col items-center justify-center border-2 rounded-2xl shadow-md transition-all duration-200 ${getBgColor()} ${getBorderColor()} select-none cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 ${isDragging ? 'ring-4 ring-green-300 scale-105 shadow-2xl z-30' : ''}`}
      style={{ minWidth: 140, minHeight: 140, width: 150, height: 150, padding: 0 }}
    >
      {/* Estado */}
      <span className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full border-2 border-white shadow" style={{ background: getStatusColor() }}></span>
      {/* Icono de mesa */}
      <span className="w-20 h-20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="90" height="90">
          {/* Mesa redonda */}
          <circle cx="50" cy="50" r="32" fill="#166534" />
          {/* Número dentro de la mesa */}
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="2.2em" fontWeight="bold" fill="#fff">{numero}</text>
          {/* Sillas (cuatro alrededor de la mesa) */}
          <rect x="45" y="5" width="10" height="15" rx="2" fill="#111" />
          <rect x="45" y="80" width="10" height="15" rx="2" fill="#111" />
          <rect x="5" y="45" width="15" height="10" rx="2" fill="#111" />
          <rect x="80" y="45" width="15" height="10" rx="2" fill="#111" />
        </svg>
      </span>
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