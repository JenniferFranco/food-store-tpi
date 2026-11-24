import type { ColumnDef } from '@tanstack/react-table'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import Skeleton from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import Button from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

export default function AdminUsuariosPage() {
  const sesion = useAuthStore((s) => s.usuario)
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const ocupado = activar.isPending || desactivar.isPending
  const error = activar.error ?? desactivar.error

  const columnas: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Usuario', cell: ({ row }) => <span className="font-semibold">{row.original.username}</span> },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold uppercase">{row.original.role}</span>,
    },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Desactivado</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Activo</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original
        if (usuario.disabled) {
          return (
            <Button tamano="sm" disabled={ocupado} onClick={() => activar.mutate(usuario.id)}>
              Activar
            </Button>
          )
        }
        // El botón Desactivar no se muestra en la fila del usuario de la sesión.
        if (usuario.id === sesion?.id) return <span className="text-xs text-stone-400">Tu usuario</span>
        return (
          <Button variante="peligro" tamano="sm" disabled={ocupado} onClick={() => desactivar.mutate(usuario.id)}>
            Desactivar
          </Button>
        )
      },
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-stone-900">Usuarios</h1>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{handleApiError(error)}</p>}
      {usuarios.isLoading ? (
        <Skeleton variante="fila" />
      ) : usuarios.isError || !usuarios.data ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <TablaDatos datos={usuarios.data} columnas={columnas} mensajeVacio="No hay usuarios" />
      )}
    </section>
  )
}
