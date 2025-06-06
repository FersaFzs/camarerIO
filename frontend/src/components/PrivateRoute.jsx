import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PrivateRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Si el usuario no tiene el rol permitido, redirigir según su rol
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/mesas'} replace />
  }

  // Si tiene el rol permitido, mostrar el contenido
  return children
}

export default PrivateRoute 