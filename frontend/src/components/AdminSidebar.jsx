import { NavLink, useNavigate } from 'react-router-dom'
import logoApalanque from '../assets/logo-apalanque.png'

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar el token y redirigir al login
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 h-screen bg-white text-green-900 w-64 flex flex-col shadow-lg border-r border-green-100 font-inter z-40">
      <div className="p-6 border-b border-green-100 flex flex-col items-center bg-green-50">
        <img src={logoApalanque} alt="Logo" className="h-32 object-contain" style={{ maxWidth: 220 }} />
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-white">
        <NavLink
          to="/admin/accounting"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-3 rounded-xl transition-colors font-semibold text-lg ${
              isActive
                ? 'bg-green-600 text-white border border-green-700 shadow'
                : 'text-green-800 hover:bg-green-100 hover:text-green-900'
            }`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>Accounting</span>
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-3 rounded-xl transition-colors font-semibold text-lg ${
              isActive
                ? 'bg-green-600 text-white border border-green-700 shadow'
                : 'text-green-800 hover:bg-green-100 hover:text-green-900'
            }`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          <span>Inventory</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-3 rounded-xl transition-colors font-semibold text-lg ${
              isActive
                ? 'bg-green-600 text-white border border-green-700 shadow'
                : 'text-green-800 hover:bg-green-100 hover:text-green-900'
            }`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span>Settings</span>
        </NavLink>

        <NavLink
          to="/admin/advanced"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-3 rounded-xl transition-colors font-semibold text-lg ${
              isActive
                ? 'bg-green-600 text-white border border-green-700 shadow'
                : 'text-green-800 hover:bg-green-100 hover:text-green-900'
            }`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.07c1.522-.927 3.225.776 2.298 2.298a1.724 1.724 0 001.07 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.07 2.573c.927 1.522-.776 3.225-2.298 2.298a1.724 1.724 0 00-2.573 1.07c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.07c-1.522.927-3.225-.776-2.298-2.298a1.724 1.724 0 00-1.07-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.07-2.573c-.927-1.522.776-3.225 2.298-2.298a1.724 1.724 0 002.573-1.07zM10 13a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          <span>Advanced</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-green-100 mt-auto bg-green-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 p-3 rounded-xl text-green-700 hover:bg-green-100 hover:text-green-900 transition-colors font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar 