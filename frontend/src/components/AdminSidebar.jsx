import { NavLink, useNavigate } from 'react-router-dom'
import logoApalanque from '../assets/logo-apalanque.png'

function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Overlay y panel off-canvas en móvil
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white text-green-900 w-64 flex flex-col shadow-lg border-r border-green-100 font-inter z-50 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-40 md:block`}
        style={{ minWidth: 256 }}
      >
        {/* Botón cerrar solo en móvil */}
        <div className="md:hidden flex justify-end p-2">
          <button onClick={onClose} aria-label="Cerrar menú" className="text-green-700 hover:text-green-900 p-2 rounded-full focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
            to="/admin/tables"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-3 rounded-xl transition-colors font-semibold text-lg ${
                isActive
                  ? 'bg-green-600 text-white border border-green-700 shadow'
                  : 'text-green-800 hover:bg-green-100 hover:text-green-900'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
            </svg>
            <span>Mesas</span>
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
    </>
  )
}

export default AdminSidebar 