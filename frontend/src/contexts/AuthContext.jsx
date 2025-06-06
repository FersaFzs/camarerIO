import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, logoutUser, getCurrentUser, isAuthenticated } from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario guardado
    const userData = getCurrentUser()
    if (userData) {
      setUser(userData)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const userData = await loginUser(credentials)
      setUser(userData)
      setIsAuthenticated(true)
      return userData
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    logoutUser()
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
} 