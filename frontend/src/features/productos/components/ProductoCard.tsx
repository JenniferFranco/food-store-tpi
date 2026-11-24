import { useState } from 'react'
import Button from '../../../shared/ui/Button'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

interface ProductoCardProps {
  producto: Producto
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock <= 0
  const sePuedeComprar = producto.disponible && !sinStock && enCarrito < producto.stock

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-40 w-full object-cover"
          onError={() => setImagenRota(true)}
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-orange-50 text-4xl">🍽️</div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">{producto.categoria.nombre}</span>
        <h3 className="font-bold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="text-sm text-stone-500">{producto.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-lg font-extrabold text-stone-900">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs ${sinStock ? 'text-red-600' : 'text-stone-500'}`}>
            {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>
        <Button className="mt-2" disabled={!sePuedeComprar} onClick={() => agregar(producto)}>
          {enCarrito > 0 ? `Agregar otro (${enCarrito} en el carrito)` : 'Agregar al carrito'}
        </Button>
      </div>
    </article>
  )
}
