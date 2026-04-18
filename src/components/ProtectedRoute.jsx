import { Navigate } from 'react-router-dom'
import { getUser } from '../auth'

export function StudentRoute({ children }) {
  const user = getUser()
  if (!user) return <Navigate to="/" />
  if (user.role !== 'student') return <Navigate to="/rider-portal" />
  return children
}

export function RiderRoute({ children }) {
  const user = getUser()
  if (!user) return <Navigate to="/rider-portal" />
  if (user.role !== 'rider') return <Navigate to="/" />
  return children
}
