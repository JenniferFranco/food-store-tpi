import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import Skeleton from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import ProductoForm from '../components/ProductoForm'
import StockForm from '../components/StockForm'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto'

export default function AdminProductosPage() {
  // El panel pide hasta 100 productos y pagina del lado del cliente con TanStack Table.
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const cambiarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [filtro, setFiltro] = useState('')
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [enStock, setEnStock] = useState<Producto | null>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)

  const abrirNuevo = () => {
    crear.reset()
    setEditando(null)
    setFormAbierto(true)
  }
  const abrirEdicion = (producto: Producto) => {
    actualizar.reset()
    setEditando(producto)
    setFormAbierto(true)
  }
  const guardar = (datos: ProductoCreate) => {
    const cerrar = { onSuccess: () => setFormAbierto(false) }
    if (editando) actualizar.mutate({ id: editando.id, datos }, cerrar)
    else crear.mutate(datos, cerrar)
  }
  const guardarStock = (datos: ProductoStockUpdate) => {
    if (enStock) cambiarStock.mutate({ id: enStock.id, datos }, { onSuccess: () => setEnStock(null) })
  }

  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-semibold">{row.original.nombre}</span> },
    { id: 'categoria', accessorFn: (p) => p.categoria.nombre, header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => formatearPrecio(row.original.precio_base) },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : ''}>{row.original.stock}</span>,
    },
    {
      accessorKey: 'disponible',
      header: 'Disponible',
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Sí</span>
        ) : (
          <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-600">No</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variante="secundario" tamano="sm" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button
            variante="secundario"
            tamano="sm"
            onClick={() => {
              cambiarStock.reset()
              setEnStock(row.original)
            }}
          >
            Stock
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-stone-900">Productos</h1>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Filtrar..."
            aria-label="Filtrar productos"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
          <Button onClick={abrirNuevo}>+ Nuevo producto</Button>
        </div>
      </div>

      {productos.isLoading ? (
        <Skeleton variante="fila" />
      ) : productos.isError || !productos.data ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : (
        <TablaDatos datos={productos.data.items} columnas={columnas} filtro={filtro} mensajeVacio="No hay productos" />
      )}

      <Modal abierto={formAbierto} titulo={editando ? 'Editar producto' : 'Nuevo producto'} onClose={() => setFormAbierto(false)}>
        {errorForm && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{handleApiError(errorForm)}</p>}
        <ProductoForm
          key={editando?.id ?? 'nuevo'}
          inicial={editando}
          categorias={categorias.data ?? []}
          enviando={crear.isPending || actualizar.isPending}
          onGuardar={guardar}
        />
      </Modal>

      <Modal abierto={enStock !== null} titulo={`Stock de ${enStock?.nombre ?? ''}`} onClose={() => setEnStock(null)}>
        {cambiarStock.isError && <p role="alert" className="mb-3 text-sm text-red-700">{handleApiError(cambiarStock.error)}</p>}
        {enStock && <StockForm key={enStock.id} producto={enStock} enviando={cambiarStock.isPending} onGuardar={guardarStock} />}
      </Modal>

      <Modal abierto={aEliminar !== null} titulo="Eliminar producto" onClose={() => setAEliminar(null)}>
        <p className="mb-4 text-stone-600">
          ¿Dar de baja <strong>{aEliminar?.nombre}</strong>? Deja de aparecer en el catálogo; los pedidos anteriores no cambian.
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
