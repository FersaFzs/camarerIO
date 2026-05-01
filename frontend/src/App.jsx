import { Routes, Route, Navigate } from 'react-router-dom'
import Mesas from './pages/Mesas'
import TableDetail from './pages/TableDetail'
import AdminLayout from './layouts/AdminLayout'
import Accounting from './pages/admin/Accounting'
import Inventory from './pages/admin/Inventory'
import Settings from './pages/admin/Settings'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import BarraView from './views/BarraView'
import TableAdmin from './pages/admin/TableAdmin'
import GlobalPrinter from './components/GlobalPrinter'

function App() {
  return (
    <>
      <GlobalPrinter />
      <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Rutas protegidas para camareros */}
      <Route path="/mesas" element={
        <PrivateRoute allowedRoles={['user']}>
          <Mesas />
        </PrivateRoute>
      } />
      <Route path="/mesas/:tableNumber" element={
        <PrivateRoute allowedRoles={['user', 'barra']}>
          <TableDetail />
        </PrivateRoute>
      } />
      
      {/* Rutas de administración */}
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="accounting" replace />} />
        <Route path="accounting" element={<Accounting />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tables" element={<TableAdmin />} />
      </Route>

      {/* Ruta para barra/comandas */}
      <Route path="/barra" element={
        <PrivateRoute allowedRoles={['barra']}>
          <BarraView />
        </PrivateRoute>
      } />
    </Routes>
    </>
  )
}

export default App 