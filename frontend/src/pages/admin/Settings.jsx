import '../../mesas-modern.css'
import { useState, useEffect } from 'react'
import { createUser } from '../../services/authService'

// Simulación de API de usuarios (reemplazar por fetch real en backend)
// const mockUsers = [ ... ]

function Settings() {
  // --- Estado para gestión de usuarios (igual que antes) ---
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user', name: '' })
  const [success, setSuccess] = useState(null)

  // --- Estado para configuración de la app ---
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingTotal, setLoadingTotal] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorApp, setErrorApp] = useState(null);

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://camarerio.onrender.com/api/auth/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (!res.ok) throw new Error('Error al obtener usuarios')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    setForm({ username: user.username, email: user.email, password: '', role: user.role, name: user.name })
    setShowEditModal(true)
  }
  const handleOpenCreate = () => {
    setForm({ username: '', email: '', password: '', role: 'user', name: '' })
    setShowCreateModal(true)
  }
  const handleCloseModal = () => {
    setShowEditModal(false)
    setShowCreateModal(false)
    setSelectedUser(null)
    setForm({ username: '', email: '', password: '', role: 'user', name: '' })
    setError(null)
    setSuccess(null)
  }
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    try {
      if (showEditModal) {
        // Aquí iría la lógica real de edición
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...form, password: undefined } : u))
        setSuccess('Usuario actualizado (simulado)')
      } else {
        // Crear usuario real
        const user = await createUser(form)
        setUsers([...users, user])
        setSuccess('Usuario creado correctamente')
      }
      handleCloseModal()
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }
  const handleDelete = (userId) => {
    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      setUsers(users.filter(u => u._id !== userId))
    }
  }

  // --- Funciones para configuración de la app ---
  const handleResetDaily = async () => {
    if (!window.confirm('¿Estás seguro de que quieres poner las cuentas a 0? Esta acción no se puede deshacer.')) return;
    setLoadingDaily(true);
    setMessage(null);
    setErrorApp(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://camarerio.onrender.com/api/accounting/reset-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al poner cuentas a 0');
      setMessage('Cuentas puestas a 0 correctamente.');
    } catch (err) {
      setErrorApp('Error al poner cuentas a 0');
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleResetTotal = async () => {
    if (!window.confirm('¿Estás seguro de que quieres restaurar todo? Esta acción eliminará TODOS los productos, tickets y rondas. No se puede deshacer.')) return;
    setLoadingTotal(true);
    setMessage(null);
    setErrorApp(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://camarerio.onrender.com/api/accounting/reset-total', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al restaurar todo');
      setMessage('Restauración total realizada correctamente.');
    } catch (err) {
      setErrorApp('Error al restaurar todo');
    } finally {
      setLoadingTotal(false);
    }
  };

  // --- Render ---
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-2 sm:p-4 md:p-8 mt-2 md:mt-8">
      {/* Sección Gestión de Usuarios */}
      <div className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-2 md:gap-0">
          <h1 className="text-xl md:text-2xl font-bold text-green-900">Gestión de Usuarios</h1>
          <button
            onClick={handleOpenCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-5 py-2 rounded-lg font-semibold shadow-sm w-full md:w-auto"
          >
            Nuevo Usuario
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 md:mb-6 shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 md:mb-6 shadow-sm">
            <p className="font-medium">{success}</p>
          </div>
        )}
        {loading ? (
          <div className="text-center text-green-300 py-8 md:py-12">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm md:text-base">
              <thead>
                <tr className="bg-green-50 text-green-900">
                  <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold">Usuario</th>
                  <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold">Nombre</th>
                  <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold">Email</th>
                  <th className="py-2 md:py-3 px-2 md:px-4 text-left font-semibold">Rol</th>
                  <th className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-green-50 hover:bg-green-50">
                    <td className="py-2 md:py-3 px-2 md:px-4">{user.username}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4">{user.name}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4">{user.email}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 capitalize">{user.role}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="text-green-700 hover:text-green-900 font-semibold px-2 md:px-3 py-1 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-700 font-semibold px-2 md:px-3 py-1 rounded-lg transition-colors ml-1 md:ml-2"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal de edición/creación */}
        {(showEditModal || showCreateModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-green-900 mb-6">
                {showEditModal ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div>
                  <label className="block text-green-900 font-medium mb-1">Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-green-900 font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-green-900 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-green-900 font-medium mb-1">Contraseña {showEditModal && <span className="text-green-400">(dejar en blanco para no cambiar)</span>}</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    placeholder={showEditModal ? 'Nueva contraseña' : 'Contraseña'}
                    autoComplete="new-password"
                    {...(showCreateModal ? { required: true } : {})}
                  />
                </div>
                <div>
                  <label className="block text-green-900 font-medium mb-1">Rol</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                  >
                    <option value="user">Camarero</option>
                    <option value="barra">Barra</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-neutral-200 hover:bg-neutral-300 text-green-900 px-4 py-2 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Sección Configuración de la app */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-lg font-bold text-green-900 mb-4">Configuración de la app</h2>
        {errorApp && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 md:mb-6 shadow-sm">
            <p className="font-medium">{errorApp}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 md:mb-6 shadow-sm">
            <p className="font-medium">{message}</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <button
            onClick={handleResetDaily}
            disabled={loadingDaily}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingDaily ? 'Reseteando...' : 'Poner cuentas a 0'}
          </button>
          <button
            onClick={handleResetTotal}
            disabled={loadingTotal}
            className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-sm w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingTotal ? 'Restaurando...' : 'Restaurar TODO'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings 