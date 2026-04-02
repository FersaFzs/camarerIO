import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getTableRounds, createRound, addProductsToRound, markRoundAsPaid, updateRoundProducts, confirmTableService, generateTicket, fetchTableStatuses, fetchCustomTables } from '../services/roundService'
import { printPreTicket } from '../services/printerService'
import ProductList from '../components/ProductList'
import '../mesas-modern.css'
import TicketView from '../components/TicketView'
import io from 'socket.io-client'
import AdvancedMenu from '../components/AdvancedMenu'

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://camarerio.onrender.com';
const API_URL = import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api') : 'https://camarerio.onrender.com/api';

function TableDetail() {
  const { tableNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth();
  const [currentRound, setCurrentRound] = useState(null)
  const [rounds, setRounds] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showProductList, setShowProductList] = useState(false)
  const [isNewRound, setIsNewRound] = useState(false)
  
  // Checkout states (solo para barra/admin)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSelectivePayment, setShowSelectivePayment] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [isPrinting, setIsPrinting] = useState(false)

  const [error, setError] = useState(null)
  const [pendingProducts, setPendingProducts] = useState([])
  const [serviceConfirmationPending, setServiceConfirmationPending] = useState(false)

  const [showCleanConfirm, setShowCleanConfirm] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [cleanSuccess, setCleanSuccess] = useState(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveLoading, setMoveLoading] = useState(false)
  const [moveSuccess, setMoveSuccess] = useState(null)
  const [moveError, setMoveError] = useState(null)
  const [availableTables, setAvailableTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('')

  console.log('TableDetail - Número de mesa:', tableNumber)

  useEffect(() => {
    loadTableRounds()
    // Socket.IO para tiempo real
    const socket = io(SOCKET_URL, { transports: ['polling'] })
    socket.on('rounds:update', (data) => {
      // Solo recargar si es la mesa actual
      if (!data.tableNumber || data.tableNumber == tableNumber) {
        loadTableRounds()
      }
    })
    return () => {
      socket.disconnect()
    }
  }, [tableNumber])

  const loadTableRounds = async () => {
    try {
      setIsLoading(true)
      const response = await getTableRounds(tableNumber)
      setRounds(response.rounds)
      setTotal(response.total)
      setCurrentRound(response.rounds[0] || null)
      setError(null)
    } catch (err) {
      console.error('Error al cargar las rondas:', err)
      setError('Error al cargar las rondas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRound = () => {
    setIsNewRound(true)
    setShowProductList(true)
  }

  const handleAddProducts = () => {
    setIsNewRound(false)
    setShowProductList(true)
  }

  const handleProductsSelected = async (products) => {
    try {
      await createRound(tableNumber, products)
      await loadTableRounds()
      setShowProductList(false)
      setIsNewRound(false)
    } catch (err) {
      console.error('Error al añadir productos:', err)
      setError('Error al añadir productos')
    }
  }

  const handleConfirmService = async () => {
    try {
      // Confirmar el servicio (pasar a occupied)
      await confirmTableService(tableNumber)
      await loadTableRounds()
    } catch (err) {
      console.error('Error al confirmar servicio:', err)
      setError('Error al confirmar servicio')
    }
  }


  const handlePrintPreTicket = async () => {
    try {
      setIsPrinting(true)
      const items = []
      rounds.forEach(r => r.products.forEach(p => items.push({
        name: p.product?.name || p.name,
        quantity: p.quantity,
        total: p.quantity * (p.product?.price || p.price || 0)
      })))
      await printPreTicket(tableNumber, items, total)
    } catch(err) {
      setError('Error al imprimir')
    } finally {
      setIsPrinting(false)
    }
  }

  const handleConfirmPayment = async (roundIds, method = 'efectivo') => {
    try {
      const ticket = await generateTicket(tableNumber, roundIds, method)
      
      await loadTableRounds()
      setShowPaymentModal(false)
      setShowSelectivePayment(false)
    } catch (err) {
      setError('Error al cobrar la mesa')
    }
  }

  const handleCancelPayment = () => setShowPaymentModal(false)

  const toggleProductSelection = (roundId, productIndex) => {
    setSelectedProducts(prev => {
      const key = `${roundId}-${productIndex}`
      if (prev.some(p => p.key === key)) return prev.filter(p => p.key !== key)
      const prod = rounds.find(r => r._id === roundId).products[productIndex]
      return [...prev, { key, roundId, productIndex, product: prod.product, quantity: prod.quantity, price: prod.product.price }]
    })
  }

  const handleConfirmSelectivePayment = async (method = 'efectivo') => {
    try {
      const products = selectedProducts.map(item => ({ product: item.product._id, quantity: item.quantity }))
      const newRound = await createRound(tableNumber, products)
      
      // Eliminar de las rondas originales
      for (const item of selectedProducts) {
        const round = rounds.find(r => r._id === item.roundId)
        if (round) {
          const updatedProducts = round.products.filter((_, idx) => idx !== item.productIndex)
          if (updatedProducts.length === 0) {
            await markRoundAsPaid(round._id)
          } else {
            await updateRoundProducts(round._id, updatedProducts.map(p => ({ product: p.product._id, quantity: p.quantity })))
          }
        }
      }
      // Cobrar la nueva ronda
      await handleConfirmPayment([newRound._id], method)
    } catch(err) {
      setError('Error en cobro selectivo')
    }
  }

  const handleCancel = () => {
    setShowProductList(false)
    setIsNewRound(false)
  }

  const calculateRoundTotal = (round) => {
    return round.products.reduce((acc, item) => {
      return acc + (item.product?.price || 0) * item.quantity
    }, 0)
  }


  const handleCleanTable = async () => {
    setCleaning(true)
    try {
      const res = await fetch(`${API_URL}/rounds/table/${tableNumber}/clean`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (res.ok) {
        setCleanSuccess('Mesa limpiada correctamente')
        await loadTableRounds()
      } else {
        setError(data.message || 'Error al limpiar la mesa')
      }
    } catch (err) {
      setError('Error al limpiar la mesa')
    } finally {
      setCleaning(false)
      setShowCleanConfirm(false)
      setTimeout(() => setCleanSuccess(null), 2000)
    }
  }

  const openMoveModal = async () => {
    setMoveError(null)
    setSelectedTable('')
    setShowMoveModal(true)
    setMoveLoading(true)
    try {
      const statuses = await fetchTableStatuses()
      const customTables = await fetchCustomTables()
      const occupied = new Set(statuses.filter(s => s.status === 'occupied' || s.status === 'serving').map(s => s.tableNumber.toString())
      )
      // Mesas numeradas (1-10)
      const tables = []
      for (let i = 1; i <= 10; i++) {
        if (!occupied.has(i.toString()) && i.toString() !== tableNumber) {
          tables.push({ number: i, label: `Mesa ${i}` })
        }
      }
      // Mesas personalizadas
      customTables.forEach(t => {
        if (!occupied.has(t.number.toString()) && t.number.toString() !== tableNumber) {
          tables.push({ number: t.number, label: t.name || `Mesa ${t.number}` })
        }
      })
      setAvailableTables(tables)
    } catch (err) {
      setMoveError('Error al cargar mesas disponibles')
    } finally {
      setMoveLoading(false)
    }
  }

  const handleMoveTable = async () => {
    if (!selectedTable) return
    setMoveLoading(true)
    setMoveError(null)
    try {
      const res = await fetch(`${API_URL}/rounds/table/${tableNumber}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ toTableNumber: selectedTable })
      })
      const data = await res.json()
      if (res.ok) {
        setMoveSuccess('Mesa cambiada correctamente')
        setShowMoveModal(false)
        setTimeout(() => setMoveSuccess(null), 2000)
        navigate(`/mesas/${selectedTable}`)
      } else {
        setMoveError(data.message || 'Error al cambiar de mesa')
      }
    } catch (err) {
      setMoveError('Error al cambiar de mesa')
    } finally {
      setMoveLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/mesas')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Mesas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 font-inter flex flex-col items-center justify-start">
      {/* Cabecera minimalista */}
      <div className="w-full max-w-3xl mx-auto pt-8 pb-2 flex flex-col items-center">
        <div className="w-full rounded-2xl bg-green-50 border border-green-100 shadow-sm flex items-center justify-between mb-8 px-6 py-5">
            <button
            onClick={() => navigate(user?.role === 'barra' ? '/barra' : '/mesas')}
            className="text-green-700 hover:bg-green-100 hover:text-green-900 text-base font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
            >
            ← Volver
            </button>
          <span className="text-2xl font-bold text-green-900 tracking-tight text-center flex-1">
            Mesa {tableNumber}
          </span>
          <div className="flex items-center justify-end min-w-[48px]">
            <AdvancedMenu
              options={[{
                label: 'Limpiar mesa',
                onClick: () => setShowCleanConfirm(true),
                disabled: isLoading || rounds.length === 0
              }, {
                label: 'Cambiar de mesa',
                onClick: openMoveModal,
                disabled: isLoading || rounds.length === 0
              }]}
            />
          </div>
        </div>
      </div>
      {/* Contenido principal */}
      <div className="w-full max-w-3xl mx-auto px-2 pb-12 flex flex-col items-center">
        {isLoading ? (
          <div className="text-center text-neutral-400 py-12">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : rounds.length === 0 ? (
            <div className="text-center py-12">
            <p className="text-neutral-500 mb-6">No hay pedidos activos para esta mesa</p>
              <button
                onClick={handleAddRound}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-sm"
              >
                Nueva Ronda
              </button>
            </div>
          ) : (
          <div className="space-y-8 w-full">
            {/* Área de rondas */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-neutral-900">Rondas Activas</h2>
                <div className="space-y-6">
                  {rounds.map((round, roundIndex) => {
                    const roundTotal = calculateRoundTotal(round)
                    return (
                    <div key={round._id} className="border border-neutral-200 rounded-xl p-4 bg-neutral-50">
                        <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-green-700">Ronda {roundIndex + 1}</h3>
                          <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-neutral-900">
                              ${roundTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {round.products.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                              <div className="flex items-center space-x-2">
                              <span className="text-neutral-800">
                                  {item.product?.name || 'Producto no disponible'}
                                </span>
                              <span className="text-sm text-neutral-400">
                                  x{item.quantity}
                                </span>
                              </div>
                              <span className="font-medium text-neutral-900">
                                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {(user?.role === 'barra' || user?.role === 'admin') && (
                          <div className="mt-4 flex justify-end">
                            <button
                               onClick={() => handleConfirmPayment([round._id], 'efectivo')}
                               className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                            >
                               Cobrar Ronda M.
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            {/* Total y acciones */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-neutral-900">Total de la cuenta:</span>
                  <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-green-700">
                      ${total.toFixed(2)}
                    </span>
                    {(user?.role === 'barra' || user?.role === 'admin') && (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
                      >
                        Cerrar y Cobrar
                      </button>
                    )}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-4">
                {(user?.role === 'barra' || user?.role === 'admin') && (
                  <>
                    <button
                      onClick={handlePrintPreTicket}
                      disabled={isPrinting}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold shadow-sm border border-blue-200"
                    >
                      {isPrinting ? 'Imprimiendo...' : 'Imprimir Cuenta'}
                    </button>
                    <button
                      onClick={() => { setShowSelectivePayment(true); setSelectedProducts([]); }}
                      className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold shadow-sm border border-green-200"
                    >
                      Cobro Selectivo
                    </button>
                  </>
                )}
                <button
                  onClick={handleAddRound}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
                >
                  Nueva Ronda
                </button>
                <button
                  onClick={handleAddProducts}
                  className="px-6 py-3 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 transition-colors font-semibold shadow-sm"
                >
                  Añadir Productos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showProductList && (
        <ProductList
          onAddProducts={handleProductsSelected}
          onCancel={handleCancel}
        />
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirmar Cobro de Mesa</h2>
            <p className="text-gray-600 mb-6">Total a cobrar: <span className="font-bold text-xl">${total.toFixed(2)}</span></p>
            <div className="flex justify-end gap-4">
              <button onClick={handleCancelPayment} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              <button onClick={() => handleConfirmPayment(rounds.map(r=>r._id), 'tarjeta')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tarjeta</button>
              <button onClick={() => handleConfirmPayment(rounds.map(r=>r._id), 'efectivo')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Efectivo</button>
            </div>
          </div>
        </div>
      )}

      {showSelectivePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Cobro Selectivo (Parcial)</h2>
            <div className="flex-1 overflow-y-auto mb-4">
              {rounds.map((round) => (
                <div key={round._id} className="border rounded-lg p-4 mb-2">
                  <div className="space-y-2">
                    {round.products.map((item, index) => {
                      const key = `${round._id}-${index}`
                      const isSelected = selectedProducts.some(p => p.key === key)
                      return (
                        <div key={index} onClick={() => toggleProductSelection(round._id, index)} className={`flex justify-between items-center p-2 rounded cursor-pointer ${isSelected ? 'bg-purple-100 border-2' : 'bg-slate-50'}`}>
                          <span>{item.product?.name} x{item.quantity}</span>
                          <span>${(item.quantity * (item.product?.price || 0)).toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-xl">Total seleccionado: ${selectedProducts.reduce((a,b)=>a+(b.price*b.quantity),0).toFixed(2)}</span>
              <div className="flex gap-2">
                <button onClick={() => setShowSelectivePayment(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                <button onClick={() => handleConfirmSelectivePayment('tarjeta')} disabled={!selectedProducts.length} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Tarjeta</button>
                <button onClick={() => handleConfirmSelectivePayment('efectivo')} disabled={!selectedProducts.length} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">Efectivo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals de tickets por navegador eliminados por el uso de Print Bridge local */}


      {/* Modal de confirmación para limpiar mesa */}
      {showCleanConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-green-900 mb-4">¿Limpiar mesa?</h2>
            <p className="mb-6 text-green-800">Se eliminarán todas las rondas no pagadas de esta mesa. ¿Seguro que quieres continuar?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCleanConfirm(false)}
                className="px-4 py-2 text-green-700 hover:text-green-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleCleanTable}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                disabled={cleaning}
              >
                {cleaning ? 'Limpiando...' : 'Limpiar mesa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {cleanSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium">
          {cleanSuccess}
        </div>
      )}

      {/* Modal para cambiar de mesa */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-green-900 mb-4">Cambiar de mesa</h2>
            <p className="mb-4 text-green-800">Selecciona una mesa libre a la que mover todos los productos y rondas.</p>
            {moveLoading ? (
              <div className="text-center text-green-700">Cargando mesas disponibles...</div>
            ) : availableTables.length === 0 ? (
              <div className="text-center text-red-600">No hay mesas libres disponibles.</div>
            ) : (
              <select
                className="w-full border border-green-200 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-green-500 focus:border-green-500 capitalize"
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
              >
                <option value="">Selecciona una mesa</option>
                {availableTables.map(t => (
                  <option key={t.number} value={t.number}>{t.label}</option>
                ))}
              </select>
            )}
            {moveError && <div className="text-red-600 mb-2 text-sm">{moveError}</div>}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 text-green-700 hover:text-green-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleMoveTable}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                disabled={!selectedTable || moveLoading}
              >
                {moveLoading ? 'Cambiando...' : 'Cambiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito al cambiar mesa */}
      {moveSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium">
          {moveSuccess}
        </div>
      )}
    </div>
  )
}

export default TableDetail 