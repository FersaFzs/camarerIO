import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logoApalanque from '../assets/logo-apalanque.png'
import '../mesas-modern.css'

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
      let redirectPath = '/mesas';
      if (userData.role === 'admin') redirectPath = '/admin';
      else if (userData.role === 'barra') redirectPath = '/barra';
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
    <div className="min-h-screen w-full bg-neutral-50 flex items-center justify-center font-inter p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <img src={logoApalanque} alt="Logo" className="h-32 mb-6 object-contain" style={{ maxWidth: 240 }} />
        <p className="text-green-700 mb-6 text-base">Inicia sesión para continuar</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm w-full text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-green-900 mb-1">Usuario o Email</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base bg-green-50"
              placeholder="Usuario o email"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-green-900 mb-1">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base bg-green-50"
              placeholder="Contraseña"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login 