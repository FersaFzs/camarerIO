import { useState, useEffect } from 'react'
import Mesa from '../components/Mesa'
import { fetchTableStatuses, createCustomTable, confirmTableService, fetchCustomTables, deleteCustomTable, updateTablePosition } from '../services/roundService'
import { useNavigate } from 'react-router-dom'
import '../mesas-modern.css'
import logoApalanque from '../assets/logo-apalanque.png'
import io from 'socket.io-client'

const SOCKET_URL = 'https://camarerio.onrender.com'

function Mesas() {
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [occupiedTables, setOccupiedTables] = useState(new Set())
  const [servingTables, setServingTables] = useState(new Set())
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true)
  const [errorStatuses, setErrorStatuses] = useState(null)
  const [showCustomTableModal, setShowCustomTableModal] = useState(false)
  const [customTableName, setCustomTableName] = useState('')
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [customTables, setCustomTables] = useState([])
  // Estado para forzar re-render tras mover
  const [draggedTableId, setDraggedTableId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const navigate = useNavigate()

  const handleMesaClick = (numero) => {
    setMesaSeleccionada(numero)
    console.log('Mesa seleccionada:', numero)
  }

  useEffect(() => {
    const loadTableStatuses = async () => {
      try {
        const statuses = await fetchTableStatuses()
        console.log('Statuses recibidos del backend:', statuses)
        
        const occupiedSet = new Set()
        const servingSet = new Set()
        
        statuses.forEach(status => {
          console.log('Procesando status:', status)
          if (status.status === 'occupied') {
            occupiedSet.add(status.tableNumber.toString())
          } else if (status.status === 'serving') {
            servingSet.add(status.tableNumber.toString())
          }
        })
        
        console.log('Mesas ocupadas:', Array.from(occupiedSet))
        console.log('Mesas sirviendo:', Array.from(servingSet))
        
        setOccupiedTables(occupiedSet)
        setServingTables(servingSet)
      } catch (err) {
        console.error('Error al cargar estados de mesas:', err)
        setErrorStatuses('Error al cargar estados de mesas')
      } finally {
        setIsLoadingStatuses(false)
      }
    }

    const loadCustomTables = async () => {
      try {
        const tables = await fetchCustomTables()
        setCustomTables(tables)
      } catch (err) {
        console.error('Error al cargar mesas personalizadas:', err)
      }
    }

    loadTableStatuses()
    loadCustomTables()

    // Socket.IO para tiempo real
    const socket = io(SOCKET_URL)
    socket.on('rounds:update', () => {
      loadTableStatuses()
      loadCustomTables()
    })
    socket.on('tables:update', () => {
      loadCustomTables()
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  const handleConfirmService = async (tableNumber) => {
    try {
      console.log('Confirmando servicio para mesa:', tableNumber)
      await confirmTableService(tableNumber)
      
      // Actualizar estados
      setServingTables(prev => {
        const newSet = new Set(prev)
        newSet.delete(tableNumber.toString())
        console.log('Nuevo set de mesas sirviendo:', Array.from(newSet))
        return newSet
      })
      
      setOccupiedTables(prev => {
        const newSet = new Set(prev)
        newSet.add(tableNumber.toString())
        console.log('Nuevo set de mesas ocupadas:', Array.from(newSet))
        return newSet
      })
    } catch (err) {
      console.error('Error al confirmar servicio:', err)
      setError('Error al confirmar el servicio')
    }
  }

  const handleCreateCustomTable = async (e) => {
    e.preventDefault()
    if (!customTableName.trim()) return

    try {
      setIsCreatingTable(true)
      setError(null)
      const newTable = await createCustomTable(customTableName)
      setShowCustomTableModal(false)
      setCustomTableName('')
      setSuccessMessage('Mesa creada correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
      // Recargar el estado de las mesas
      const statuses = await fetchTableStatuses()
      const occupiedSet = new Set()
      const servingSet = new Set()
      
      statuses.forEach(status => {
        if (status.status === 'occupied') {
          occupiedSet.add(status.tableNumber.toString())
        } else if (status.status === 'serving') {
          servingSet.add(status.tableNumber.toString())
        }
      })
      
      setOccupiedTables(occupiedSet)
      setServingTables(servingSet)
    } catch (err) {
      console.error('Error al crear mesa personalizada:', err)
      setError('Error al crear la mesa personalizada')
    } finally {
      setIsCreatingTable(false)
    }
  }

  const handleCustomTableClick = (table) => {
    navigate(`/mesas/${table.number}`)
  }

  const handleDeleteCustomTable = async (tableId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta mesa personalizada?')) return
    try {
      await deleteCustomTable(tableId)
      setCustomTables(prev => prev.filter(t => t._id !== tableId))
      setSuccessMessage('Mesa personalizada eliminada')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Error al eliminar la mesa personalizada')
    }
  }

  // Handler para drag start
  const handleDragStart = (e, table) => {
    setDraggedTableId(table._id)
    setDragOffset({
      x: e.clientX - (table.x || 0),
      y: e.clientY - (table.y || 0)
    })
  }
  // Handler para drag
  const handleDrag = (e, table) => {
    if (draggedTableId !== table._id) return
    if (e.clientX === 0 && e.clientY === 0) return // Drag end
    // Actualizar posición visual temporalmente
    setCustomTables(prev => prev.map(t => t._id === table._id ? { ...t, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : t))
  }
  // Handler para drag end
  const handleDragEnd = async (e, table) => {
    setDraggedTableId(null)
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    try {
      await updateTablePosition(table._id, newX, newY)
      setCustomTables(prev => prev.map(t => t._id === table._id ? { ...t, x: newX, y: newY } : t))
    } catch (err) {
      setError('Error al guardar la posición de la mesa')
    }
  }

  // Filtrar mesas personalizadas sin número y avisar
  const filteredCustomTables = customTables.filter(t => {
    if (typeof t.number === 'undefined' || t.number === null) {
      console.warn('Mesa personalizada sin número:', t);
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-neutral-50 font-inter flex flex-col items-center justify-start">
      {/* Leyenda minimalista */}
      <div className="w-full max-w-4xl mx-auto pt-8 pb-2 flex flex-col items-center">
        <img
          src={logoApalanque}
          alt="EL APALANQUE"
          className="h-28 mb-4 object-contain"
          style={{ maxWidth: 300 }}
        />
        <div className="flex gap-6 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-200 border border-green-400"></span>
            <span className="text-xs text-neutral-600">Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></span>
            <span className="text-xs text-neutral-600">Sirviendo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-200 border border-red-400"></span>
            <span className="text-xs text-neutral-600">Ocupada</span>
          </div>
        </div>
      </div>
      {/* Layout libre de mesas */}
      <div className="relative w-full max-w-4xl h-[600px] bg-white border border-green-100 rounded-2xl shadow-md overflow-hidden mx-auto px-2 pb-12 flex flex-col items-center">
        {/* Mesas numeradas (no movibles, layout fijo) */}
        {[...Array(10)].map((_, index) => {
          const numeroMesa = index + 1
          const isOccupied = occupiedTables.has(numeroMesa.toString())
          const isServing = servingTables.has(numeroMesa.toString())
          // Distribuir en círculo o grid fijo
          const angle = (2 * Math.PI * index) / 10
          const radius = 220
          const centerX = 400
          const centerY = 300
          const x = centerX + radius * Math.cos(angle) - 60
          const y = centerY + radius * Math.sin(angle) - 60
          return (
            <div key={numeroMesa} style={{ position: 'absolute', left: x, top: y }}>
              <Mesa
                numero={numeroMesa}
                isOccupied={isOccupied}
                isServing={isServing}
                onConfirmService={handleConfirmService}
              />
            </div>
          )
        })}
        {/* Mesas personalizadas (movibles) */}
        {filteredCustomTables.map((table) => {
          const isOccupied = occupiedTables.has(table.number?.toString?.())
          const isServing = servingTables.has(table.number?.toString?.())
          return (
            <div
              key={table._id}
              style={{ position: 'absolute', left: table.x || 50, top: table.y || 50, zIndex: draggedTableId === table._id ? 10 : 1, cursor: 'grab' }}
              draggable
              onDragStart={e => handleDragStart(e, table)}
              onDrag={e => handleDrag(e, table)}
              onDragEnd={e => handleDragEnd(e, table)}
            >
              <Mesa
                numero={table.number}
                isOccupied={isOccupied}
                isServing={isServing}
                name={table.name}
                isCustom={true}
                onConfirmService={handleConfirmService}
                onDelete={() => handleDeleteCustomTable(table._id)}
              />
            </div>
          )
        })}
        {/* Botón de nueva mesa */}
        <div
          onClick={() => setShowCustomTableModal(true)}
          className="absolute bottom-8 right-8 flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-2xl bg-white cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 group min-h-[160px] shadow-sm"
          style={{ zIndex: 20 }}
        >
          <div className="w-14 h-14 mb-2 flex items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-green-700">Nueva Mesa</span>
        </div>
      </div>
      {/* Mensaje de éxito al crear mesa */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium">
          {successMessage}
        </div>
      )}
      {/* Modal para crear mesa personalizada */}
      {showCustomTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-neutral-900">Nueva Mesa</h2>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                <p className="font-medium">{error}</p>
              </div>
            )}
            <form onSubmit={handleCreateCustomTable} className="space-y-6">
              <div>
                <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la mesa
                </label>
                <input
                  type="text"
                  id="tableName"
                  value={customTableName}
                  onChange={(e) => setCustomTableName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: Terraza 1, Barra 2..."
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomTableModal(false)
                    setCustomTableName('')
                    setError(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTable}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTable ? 'Creando...' : 'Crear Mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Mesas 