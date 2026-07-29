import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 text-sm text-slate-200 shadow-2xl backdrop-blur">
        <LoaderCircle className="h-5 w-5 animate-spin text-cyan-400" />
        Checking your workspace access...
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <FullScreenLoader />
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
