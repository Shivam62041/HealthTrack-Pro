import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute() {
  const { user, isAdmin, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
