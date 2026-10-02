import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function PrivateRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
