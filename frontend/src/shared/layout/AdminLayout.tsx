import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { ruta: '/admin/resumen', nombre: 'Resumen' },
  { ruta: '/admin/pedidos', nombre: 'Pedidos' },
  { ruta: '/admin/productos', nombre: 'Productos' },
  { ruta: '/admin/categorias', nombre: 'Categorías' },
  { ruta: '/admin/usuarios', nombre: 'Usuarios' },
]

/** Submenú del panel de administración. */
export default function AdminLayout() {
  return (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-white p-1">
        {SECCIONES.map((s) => (
          <NavLink
            key={s.ruta}
            to={s.ruta}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`
            }
          >
            {s.nombre}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
