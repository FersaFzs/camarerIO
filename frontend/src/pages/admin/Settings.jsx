import '../../mesas-modern.css'
import { useState, useEffect } from 'react'
import { createUser } from '../../services/authService'

// Simulación de API de usuarios (reemplazar por fetch real en backend)
// const mockUsers = [ ... ]

function Settings() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user', name: '' })
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    // Aquí iría la llamada real a la API para obtener usuarios
    // setUsers(mockUsers)
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

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-900">Gestión de Usuarios</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm"
        >
          Nuevo Usuario
        </button>
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 shadow-sm">
          <p className="font-medium">{success}</p>
        </div>
      )}
      {loading ? (
        <div className="text-center text-green-300 py-12">Cargando usuarios...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-50 text-green-900">
                <th className="py-3 px-4 text-left font-semibold">Usuario</th>
                <th className="py-3 px-4 text-left font-semibold">Nombre</th>
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">Rol</th>
                <th className="py-3 px-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-green-50 hover:bg-green-50">
                  <td className="py-2 px-4">{user.username}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4 capitalize">{user.role}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-green-700 hover:text-green-900 font-semibold px-3 py-1 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded-lg transition-colors ml-2"
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
                  required
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-green-700 hover:text-green-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings 