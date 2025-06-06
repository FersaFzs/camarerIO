import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTableRounds, createRound, addProductsToRound, markRoundAsPaid, markAllRoundsAsPaid, updateRoundProducts } from '../services/roundService'
import ProductList from '../components/ProductList'

function TableDetail() {
  const { tableNumber } = useParams()
  const navigate = useNavigate()
  const [currentRound, setCurrentRound] = useState(null)
  const [rounds, setRounds] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showProductList, setShowProductList] = useState(false)
  const [isNewRound, setIsNewRound] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedRoundForPayment, setSelectedRoundForPayment] = useState(null)
  const [showSelectivePayment, setShowSelectivePayment] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [error, setError] = useState(null)

  console.log('TableDetail - Número de mesa:', tableNumber)

  useEffect(() => {
    loadTableRounds()
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
      if (isNewRound || !currentRound) {
        // Crear nueva ronda
        const newRound = await createRound(tableNumber, products)
        await loadTableRounds() // Recargar todas las rondas y el total
      } else {
        // Añadir productos a la ronda existente
        await addProductsToRound(currentRound._id, products)
        await loadTableRounds() // Recargar todas las rondas y el total
      }
      setShowProductList(false)
      setIsNewRound(false)
    } catch (err) {
      console.error('Error al añadir productos:', err)
      setError('Error al añadir productos')
    }
  }

  const handlePayment = (round = null) => {
    setSelectedRoundForPayment(round)
    setShowPaymentModal(true)
  }

  const handleConfirmPayment = async () => {
    try {
      if (selectedRoundForPayment) {
        // Pagar una ronda específica
        await markRoundAsPaid(selectedRoundForPayment._id)
      } else {
        // Pagar todas las rondas
        await markAllRoundsAsPaid(tableNumber)
      }
      await loadTableRounds() // Recargar todas las rondas y el total
      setShowPaymentModal(false)
      setSelectedRoundForPayment(null)
    } catch (err) {
      console.error('Error al procesar el pago:', err)
      setError('Error al procesar el pago')
    }
  }

  const handleCancelPayment = () => {
    setShowPaymentModal(false)
    setSelectedRoundForPayment(null)
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

  const handleSelectivePayment = () => {
    setShowSelectivePayment(true)
    setSelectedProducts([])
  }

  const toggleProductSelection = (roundId, productIndex) => {
    setSelectedProducts(prev => {
      const productKey = `${roundId}-${productIndex}`
      const isSelected = prev.some(p => p.key === productKey)
      
      if (isSelected) {
        return prev.filter(p => p.key !== productKey)
      } else {
        const round = rounds.find(r => r._id === roundId)
        const product = round.products[productIndex]
        return [...prev, {
          key: productKey,
          roundId,
          productIndex,
          product: product.product,
          quantity: product.quantity,
          price: product.product.price
        }]
      }
    })
  }

  const calculateSelectedTotal = () => {
    return selectedProducts.reduce((acc, item) => {
      return acc + (item.price * item.quantity)
    }, 0)
  }

  const handleConfirmSelectivePayment = async () => {
    try {
      // Crear una nueva ronda con los productos seleccionados
      const products = selectedProducts.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }))

      // Crear la ronda y marcarla como pagada inmediatamente
      const newRound = await createRound(tableNumber, products)
      await markRoundAsPaid(newRound._id)

      // Eliminar los productos pagados de sus rondas originales
      for (const item of selectedProducts) {
        const round = rounds.find(r => r._id === item.roundId)
        if (round) {
          // Filtrar el producto específico de la ronda
          const updatedProducts = round.products.filter((_, index) => index !== item.productIndex)
          
          if (updatedProducts.length === 0) {
            // Si no quedan productos, marcar la ronda como pagada
            await markRoundAsPaid(round._id)
          } else {
            // Actualizar la ronda con los productos restantes
            await updateRoundProducts(round._id, updatedProducts.map(p => ({
              product: p.product._id,
              quantity: p.quantity
            })))
          }
        }
      }

      await loadTableRounds()
      setShowSelectivePayment(false)
      setSelectedProducts([])
    } catch (err) {
      console.error('Error al procesar el pago selectivo:', err)
      setError('Error al procesar el pago selectivo')
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
    <div className="fixed inset-0 bg-slate-50 flex flex-col">
      {/* Header fijo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Mesa {tableNumber}</h1>
            <button
              onClick={() => navigate('/mesas')}
              className="text-white hover:text-blue-100 transition-colors"
            >
              Volver a Mesas
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
          {rounds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">No hay pedidos activos para esta mesa</p>
              <button
                onClick={handleAddRound}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Nueva Ronda
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Área de rondas con scroll */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Rondas Activas</h2>
                <div className="space-y-6">
                  {rounds.map((round, roundIndex) => {
                    const roundTotal = calculateRoundTotal(round)
                    return (
                      <div key={round._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Ronda {roundIndex + 1}</h3>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-medium">
                              ${roundTotal.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handlePayment(round)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Pagar Ronda
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {round.products.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-700">
                                  {item.product?.name || 'Producto no disponible'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  x{item.quantity}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">
                                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer fijo con total y botones */}
        {rounds.length > 0 && (
          <div className="bg-slate-50 border-t border-gray-200">
            <div className="container mx-auto px-4 py-6">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Total de la cuenta:</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-blue-600">
                      ${total.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handlePayment()}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Pagar Todo
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleSelectivePayment}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Cobro Selectivo
                </button>
                <button
                  onClick={handleAddRound}
                  className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Nueva Ronda
                </button>
                <button
                  onClick={handleAddProducts}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <h2 className="text-2xl font-bold mb-4">Confirmar Pago</h2>
            <p className="text-gray-600 mb-6">
              {selectedRoundForPayment ? (
                <>
                  Total de la ronda {rounds.indexOf(selectedRoundForPayment) + 1}:{' '}
                  <span className="font-bold text-xl">
                    ${calculateRoundTotal(selectedRoundForPayment).toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  Total a pagar: <span className="font-bold text-xl">${total.toFixed(2)}</span>
                </>
              )}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelPayment}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cobro selectivo */}
      {showSelectivePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Cobro Selectivo</h2>
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="space-y-4">
                {rounds.map((round, roundIndex) => (
                  <div key={round._id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Ronda {roundIndex + 1}</h3>
                    <div className="space-y-2">
                      {round.products.map((item, index) => {
                        const productKey = `${round._id}-${index}`
                        const isSelected = selectedProducts.some(p => p.key === productKey)
                        return (
                          <div
                            key={index}
                            onClick={() => toggleProductSelection(round._id, index)}
                            className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-purple-100 border-2 border-purple-500' : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-700">
                                {item.product?.name || 'Producto no disponible'}
                              </span>
                              <span className="text-sm text-gray-500">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Total seleccionado:</span>
                <span className="text-2xl font-bold text-purple-600">
                  ${calculateSelectedTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowSelectivePayment(false)
                    setSelectedProducts([])
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSelectivePayment}
                  disabled={selectedProducts.length === 0}
                  className={`px-6 py-3 bg-purple-600 text-white rounded-lg transition-colors ${
                    selectedProducts.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-purple-700'
                  }`}
                >
                  Confirmar Cobro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableDetail 