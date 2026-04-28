import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Transfer from './pages/Transfer'
import Withdraw from './pages/Withdraw'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/transactions/:accountId"
        element={<ProtectedRoute><Transactions /></ProtectedRoute>}
      />
      <Route
        path="/transfer"
        element={<ProtectedRoute><Transfer /></ProtectedRoute>}
      />
      <Route
        path="/withdraw"
        element={<ProtectedRoute><Withdraw /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
