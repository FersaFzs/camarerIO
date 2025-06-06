import { useState, useEffect } from 'react'
import Mesa from '../components/Mesa'
import { fetchTableStatuses } from '../services/roundService'

function Mesas() {
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [occupiedTables, setOccupiedTables] = useState(new Set())
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true)
  const [errorStatuses, setErrorStatuses] = useState(null)

  const handleMesaClick = (numero) => {
    setMesaSeleccionada(numero)
    console.log('Mesa seleccionada:', numero)
  }

  useEffect(() => {
    const loadTableStatuses = async () => {
      try {
        const statuses = await fetchTableStatuses()
        // Convertir los números a strings para mantener consistencia
        const statusSet = new Set(statuses.map(num => num.toString()))
        setOccupiedTables(statusSet)
        console.log('Mesas ocupadas:', statusSet) // Para debugging
      } catch (err) {
        console.error('Error al cargar estados de mesas:', err)
        setErrorStatuses('Error al cargar estados de mesas')
      } finally {
        setIsLoadingStatuses(false)
      }
    }

    loadTableStatuses()
  }, [])

  return (
    <div className="min-h-screen w-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Mesas</h1>
            <div className="flex justify-center items-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-lg bg-white shadow-sm mr-2"></div>
                <span className="text-sm text-white/90">Libre</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-lg bg-rose-50 shadow-sm mr-2"></div>
                <span className="text-sm text-white/90">Ocupada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoadingStatuses ? (
          <div className="text-center">Cargando estados de mesas...</div>
        ) : errorStatuses ? (
          <div className="text-center text-red-500">{errorStatuses}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {[...Array(10)].map((_, index) => {
              const numeroMesa = index + 1
              const isOccupied = occupiedTables.has(numeroMesa.toString())
              console.log(`Mesa ${numeroMesa} ocupada:`, isOccupied) // Para debugging

              return (
                <Mesa 
                  key={numeroMesa}
                  numero={numeroMesa}
                  isOccupied={isOccupied}
                />
              )
            })}
          </div>
        )}
      </div>

      {mesaSeleccionada && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-slate-100">
          <div className="container mx-auto flex justify-between items-center">
            <span className="text-base font-medium text-slate-800">
              Mesa {mesaSeleccionada} seleccionada
            </span>
            <button 
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm"
              onClick={() => setMesaSeleccionada(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Mesas 