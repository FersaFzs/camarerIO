const API_URL = 'http://192.168.119.83:5000/api'

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
    const statuses = await response.json();
    console.log('Respuesta del backend en roundService:', statuses);
    return statuses;
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

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear el producto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en createProduct:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el producto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    throw error;
  }
};

export const createCustomTable = async (tableName) => {
  try {
    const response = await fetch(`${API_URL}/tables/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: tableName })
    });
    if (!response.ok) {
      let errorMsg = 'Error al crear la mesa personalizada';
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) errorMsg = errorData.message;
      } catch {}
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const confirmTableService = async (tableNumber) => {
  try {
    console.log('Enviando confirmación de servicio para mesa:', tableNumber);
    const response = await fetch(`${API_URL}/rounds/table/${tableNumber}/confirm-service`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al confirmar el servicio de la mesa');
    }

    const result = await response.json();
    console.log('Respuesta de confirmación de servicio:', result);
    return result;
  } catch (error) {
    console.error('Error en confirmTableService:', error);
    throw error;
  }
};

export const fetchCustomTables = async () => {
  try {
    const response = await fetch(`${API_URL}/tables`)
    if (!response.ok) {
      throw new Error('Error al obtener las mesas personalizadas')
    }
    return await response.json()
  } catch (error) {
    console.error('Error en fetchCustomTables:', error)
    throw error
  }
}

export const deleteCustomTable = async (tableId) => {
  try {
    const response = await fetch(`${API_URL}/tables/${tableId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error('Error al eliminar la mesa personalizada')
    }
    return await response.json()
  } catch (error) {
    console.error('Error en deleteCustomTable:', error)
    throw error
  }
}

export const generateTicket = async (tableNumber, roundIds, paymentMethod = 'efectivo') => {
  try {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        tableNumber,
        roundIds,
        paymentMethod
      })
    });

    if (!response.ok) {
      throw new Error('Error al generar el ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getTicket = async (ticketId) => {
  try {
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener el ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}; 