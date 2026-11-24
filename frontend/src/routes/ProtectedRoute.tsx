import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../features/usuarios/types/usuario'
import Cargando from '../shared/components/Cargando'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  roles?: Rol[]
}

/** Sin sesión redirige a /login; sin el rol requerido, a /unauthorized.
 *  La protección real está en el backend (require_role): esto solo ordena la navegación. */
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) return <Cargando texto="Verificando sesión..." />
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
