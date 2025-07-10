import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import { useState } from 'react'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-neutral-50 font-inter">
      {/* Sidebar: visible fijo en desktop, off-canvas en móvil */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Botón hamburguesa sticky solo en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <main className="flex-1 min-h-screen bg-neutral-50 transition-all md:ml-64 p-2 sm:p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout 