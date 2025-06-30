import axios from 'axios'

const API_URL = 'https://camarerio.onrender.com/api'

// Configurar axios para incluir las credenciales
axios.defaults.withCredentials = true

// Función para probar la conexión con el backend
const testConnection = async () => {
  try {
    console.log('Probando conexión con:', `${API_URL}/test`)
    const response = await axios.get(`${API_URL}/test`)
    console.log('Test de conexión exitoso:', response.data)
    return true
  } catch (error) {
    console.error('Error en test de conexión:', error)
    return false
  }
}

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    // Guardar el token y el usuario en localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data.user
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión')
  }
}

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

// Nueva función para verificar la autenticación
export const checkAuth = () => {
  const token = localStorage.getItem('token')
  return !!token
}

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.data.user
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al crear usuario')
  }
} 