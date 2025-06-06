import { Outlet, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Panel de Administración</h2>
              <button
                onClick={() => navigate('/mesas')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Volver a Mesas
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 