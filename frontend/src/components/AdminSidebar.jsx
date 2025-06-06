import { NavLink } from 'react-router-dom'

function AdminSidebar() {
  return (
    <div className="bg-slate-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      
      <nav className="space-y-2">
        <NavLink
          to="/admin/accounting"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
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
            `flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
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
            `flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  )
}

export default AdminSidebar 