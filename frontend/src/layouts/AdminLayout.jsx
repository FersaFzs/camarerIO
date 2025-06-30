import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-neutral-50 font-inter">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen bg-neutral-50">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout 