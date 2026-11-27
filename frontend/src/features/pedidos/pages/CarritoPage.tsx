import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()
  const [aviso, setAviso] = useState<string | null>(null)

  const sumar = (productoId: number, nombre: string, cantidad: number, stock: number) => {
    const ok = cambiarCantidad(productoId, cantidad + 1)
    setAviso(ok ? null : `No hay stock suficiente: de ${nombre} ${stock === 1 ? 'queda 1 unidad' : `quedan ${stock} unidades`}.`)
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="font-medium text-orange-700 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-stone-900">Carrito</h1>
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card className="flex flex-col divide-y divide-stone-100 p-0">
          {aviso && (
            <p role="alert" className="bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">
              {aviso}
            </p>
          )}
          {items.map((item) => (
            <div key={item.producto_id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
                {item.cantidad >= item.stock && (
                  <p className="text-xs font-medium text-amber-700">Máximo disponible: {item.stock}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variante="secundario" tamano="sm" aria-label={`Restar ${item.nombre}`} onClick={() => {
                    setAviso(null)
                    cambiarCantidad(item.producto_id, item.cantidad - 1)
                  }}>
                  −
                </Button>
                <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                <Button variante="secundario" tamano="sm" aria-label={`Sumar ${item.nombre}`} onClick={() => sumar(item.producto_id, item.nombre, item.cantidad, item.stock)}>
                  +
                </Button>
              </div>
              <span className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              <Button variante="fantasma" tamano="sm" onClick={() => quitar(item.producto_id)}>
                Quitar
              </Button>
            </div>
          ))}
        </Card>
        <Card className="flex h-fit flex-col gap-3">
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-extrabold">{formatearPrecio(total)}</span>
          </div>
          <p className="text-xs text-stone-500">El stock se confirma al crear el pedido.</p>
          <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
          <Button variante="secundario" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </Card>
      </div>
    </section>
  )
}
