import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Intentando login con:', { username, password: '***' })
      const userData = await login({ username, password })
      console.log('Login exitoso - Datos completos:', userData)
      
      // Redirigir según el rol
      const redirectPath = userData.role === 'admin' ? '/admin' : '/mesas'
      console.log('Redirigiendo a:', redirectPath)
      navigate(redirectPath)
    } catch (error) {
      console.error('Error en login:', error)
      setError(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">WaiterApp</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Inicia sesión para continuar</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario o Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base"
                placeholder="Usuario o email"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base"
                placeholder="Contraseña"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login 