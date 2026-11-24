import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import Skeleton from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import CategoriaForm from '../components/CategoriaForm'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaCreate } from '../types/categoria'

export default function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)

  const abrirNueva = () => {
    crear.reset()
    setEditando(null)
    setFormAbierto(true)
  }
  const abrirEdicion = (categoria: Categoria) => {
    actualizar.reset()
    setEditando(categoria)
    setFormAbierto(true)
  }
  const guardar = (datos: CategoriaCreate) => {
    const cerrar = { onSuccess: () => setFormAbierto(false) }
    if (editando) actualizar.mutate({ id: editando.id, datos }, cerrar)
    else crear.mutate(datos, cerrar)
  }

  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-semibold">{row.original.nombre}</span> },
    { accessorKey: 'descripcion', header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '—' },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variante="secundario" tamano="sm" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button variante="peligro" tamano="sm" onClick={() => setAEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const errorForm = editando ? actualizar.error : crear.error

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Categorías</h1>
        <Button onClick={abrirNueva}>+ Nueva categoría</Button>
      </div>

      {categorias.isLoading ? (
        <Skeleton variante="fila" />
      ) : categorias.isError || !categorias.data ? (
        <EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => void categorias.refetch()} />
      ) : (
        <TablaDatos datos={categorias.data} columnas={columnas} mensajeVacio="No hay categorías" />
      )}

      <Modal abierto={formAbierto} titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setFormAbierto(false)}>
        {errorForm && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{handleApiError(errorForm)}</p>}
        <CategoriaForm
          key={editando?.id ?? 'nueva'}
          inicial={editando}
          enviando={crear.isPending || actualizar.isPending}
          onGuardar={guardar}
        />
      </Modal>

      <Modal abierto={aEliminar !== null} titulo="Eliminar categoría" onClose={() => setAEliminar(null)}>
        <p className="mb-4 text-stone-600">
          ¿Dar de baja la categoría <strong>{aEliminar?.nombre}</strong>? Sus productos no se ocultan y el nombre no se puede volver a usar.
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setAEliminar(null)}>
            Volver
          </Button>
          <Button
            variante="peligro"
            disabled={eliminar.isPending}
            onClick={() => aEliminar && eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
