import { useState } from 'react'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Paginacion from '../../../shared/components/Paginacion'
import Skeleton from '../../../shared/components/Skeleton'
import { handleApiError } from '../../../shared/api/handleApiError'
import Button from '../../../shared/ui/Button'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  // Paginación en el servidor: skip = página × limit.
  const productos = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / POR_PAGINA) : 0

  const buscar = () => {
    setPagina(0)
    setBusqueda(textoBusqueda.trim())
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Catálogo</h1>
        <p className="text-sm text-stone-500">Elegí tus comidas y armá el pedido.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-end">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            buscar()
          }}
        >
          <input
            type="search"
            placeholder="Buscar por nombre..."
            aria-label="Buscar por nombre"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <Button type="submit">Buscar</Button>
        </form>
        <select
          aria-label="Filtrar por categoría"
          value={categoriaId ?? ''}
          onChange={(e) => {
            setPagina(0)
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
          }}
          className="rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {productos.isLoading ? (
        <Skeleton cantidad={POR_PAGINA} />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data && productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje="Probá con otra búsqueda o con otra categoría."
          accion={
            <Button
              variante="secundario"
              tamano="sm"
              onClick={() => {
                setTextoBusqueda('')
                setBusqueda('')
                setCategoriaId(undefined)
                setPagina(0)
              }}
            >
              Ver todo el catálogo
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data?.items.map((p) => <ProductoCard key={p.id} producto={p} />)}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}
