const API_URL = 'http://localhost:5000/api'

export const getTableRounds = async (tableNumber) => {
  try {
    const response = await fetch(`${API_URL}/rounds/table/${tableNumber}`)
    if (!response.ok) {
      throw new Error('Error al obtener las rondas')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export const createRound = async (tableNumber, products) => {
  try {
    const response = await fetch(`${API_URL}/rounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tableNumber, products }),
    })
    if (!response.ok) {
      throw new Error('Error al crear la ronda')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export const addProductsToRound = async (roundId, products) => {
  try {
    const response = await fetch(`${API_URL}/rounds/${roundId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products }),
    })
    if (!response.ok) {
      throw new Error('Error al añadir productos')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export const markRoundAsPaid = async (roundId) => {
  try {
    const response = await fetch(`${API_URL}/rounds/${roundId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al marcar la ronda como pagada')
    }

    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Error al obtener los productos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getProducts:', error);
    throw error;
  }
};

export const fetchTableStatuses = async () => {
  try {
    const response = await fetch(`${API_URL}/rounds/statuses`);
    if (!response.ok) {
      throw new Error('Error al obtener el estado de las mesas');
    }
    const occupiedTables = await response.json();
    console.log('Respuesta del backend:', occupiedTables); // Para debugging
    return occupiedTables; // Ya no convertimos a Set aquí, lo hacemos en el componente
  } catch (error) {
    console.error('Error en fetchTableStatuses:', error);
    throw error;
  }
};

export const markAllRoundsAsPaid = async (tableNumber) => {
  try {
    const response = await fetch(`${API_URL}/rounds/table/${tableNumber}/pay-all`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al marcar todas las rondas como pagadas')
    }

    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export const updateRoundProducts = async (roundId, products) => {
  try {
    const response = await fetch(`${API_URL}/rounds/${roundId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products })
    })

    if (!response.ok) {
      throw new Error('Error al actualizar la ronda')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al actualizar productos de la ronda:', error)
    throw error
  }
} 