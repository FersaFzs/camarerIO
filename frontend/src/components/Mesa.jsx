import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Mesa({ numero, isOccupied, isServing, onConfirmService, isCustom, name, onDelete }) {
  const navigate = useNavigate()

  const handleClick = () => {
    console.log('Navegando a mesa:', numero)
    navigate(`/mesas/${numero}`)
  }

  const handleConfirmService = (e) => {
    e.stopPropagation() // Evitar que se propague el click al contenedor
    onConfirmService(numero)
  }

  const getStatusColor = () => {
    if (isOccupied) return 'bg-red-500'
    if (isServing) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getBackgroundColor = () => {
    if (isOccupied) return 'bg-red-100 border-red-300'
    if (isServing) return 'bg-yellow-50 border-yellow-300'
    return 'bg-white border-gray-200'
  }

  return (
    <div 
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm cursor-pointer transition-transform transform hover:scale-105 ${getBackgroundColor()}`}
    >
      <span
        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor()}`}
      ></span>
      {/* Icono de mesa moderno */}
      <span className="w-16 h-16 mb-2 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="64" height="64">
          {/* Mesa redonda */}
          <circle cx="50" cy="50" r="20" fill="#166534" />
          {/* Sillas (cuatro alrededor de la mesa) */}
          <rect x="45" y="5" width="10" height="15" rx="2" fill="#111" />
          <rect x="45" y="80" width="10" height="15" rx="2" fill="#111" />
          <rect x="5" y="45" width="15" height="10" rx="2" fill="#111" />
          <rect x="80" y="45" width="15" height="10" rx="2" fill="#111" />
        </svg>
      </span>
      {/* Nombre principal de la mesa */}
      {name ? (
        <span className="text-lg font-bold text-black text-center">{name}</span>
      ) : (
        <span className="text-lg font-bold text-black text-center">Mesa {numero}</span>
      )}
      {isServing && (
        <button
          onClick={handleConfirmService}
          className="mt-4 w-full py-2 px-4 bg-yellow-400 text-yellow-900 font-bold rounded-b-lg shadow-md hover:bg-yellow-500 transition-colors absolute left-0 bottom-0 rounded-t-none rounded-b-lg"
          style={{borderTopLeftRadius: 0, borderTopRightRadius: 0}}
        >
          SERVIR
        </button>
      )}
      {isCustom && onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
          title="Eliminar mesa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Mesa 