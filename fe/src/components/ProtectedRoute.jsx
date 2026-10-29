import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ user, children }) {
  const token = localStorage.getItem('vi-nho-token')

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}