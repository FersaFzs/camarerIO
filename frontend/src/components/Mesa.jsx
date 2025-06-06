import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Mesa({ numero, isOccupied }) {
  const navigate = useNavigate()

  const handleClick = () => {
    console.log('Navegando a mesa:', numero)
    navigate(`/mesas/${numero}`)
  }

  return (
    <div 
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm cursor-pointer transition-transform transform hover:scale-105 ${
        isOccupied ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200'
      }`}
    >
      <span
        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
          isOccupied ? 'bg-red-500' : 'bg-green-500'
        }`}
      ></span>
      <img 
        src="/mesasIcon.png" 
        alt={`Mesa ${numero}`} 
        className="w-12 h-12 mb-2"
      />
      <span className="text-lg font-semibold text-slate-700">{numero}</span>
    </div>
  )
}

export default Mesa 