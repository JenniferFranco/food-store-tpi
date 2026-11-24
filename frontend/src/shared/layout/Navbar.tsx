import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import Button from '../ui/Button'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-orange-100 text-orange-800' : 'text-stone-600 hover:bg-stone-100'}`

export default function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="text-xl font-extrabold text-orange-600">
          🍕 Food Store
        </NavLink>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito{cantidad > 0 && <span className="ml-1 rounded-full bg-orange-600 px-1.5 text-xs text-white">{cantidad}</span>}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin/resumen" className={claseLink}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <span className="text-sm text-stone-600">
                {usuario.full_name}{' '}
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold uppercase text-stone-500">{usuario.role}</span>
              </span>
              <Button variante="secundario" tamano="sm" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseLink}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
