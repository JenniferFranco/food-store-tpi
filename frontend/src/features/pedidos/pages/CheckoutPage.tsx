import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Card from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import { obtenerProducto } from '../../productos/api/productos'
import CheckoutForm, { type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const sincronizar = useCartStore((s) => s.sincronizar)
  const [avisos, setAvisos] = useState<string[]>([])
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  // Al entrar al checkout se traen los productos de nuevo: si el admin cambió un precio
  // o el stock, el carrito se actualiza y el total coincide con lo que cobra el backend.
  useEffect(() => {
    let activo = true
    const ids = useCartStore.getState().items.map((i) => i.producto_id)
    Promise.allSettled(ids.map((id) => obtenerProducto(id))).then((resultados) => {
      if (!activo) return // el componente se desmontó: se ignora esta respuesta
      const productos = resultados.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
      setAvisos(sincronizar(productos))
    })
    return () => {
      activo = false
    }
  }, [sincronizar])

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay productos para confirmar"
        accion={
          <Link to="/" className="font-medium text-orange-700 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  const confirmar = (datos: DatosCheckout) => {
    crearPedido.mutate(
      {
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      },
      {
        onSuccess: () => {
          vaciar()
          navigate('/mis-pedidos')
        },
      },
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-stone-900">Confirmar pedido</h1>
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          {avisos.length > 0 && (
            <div role="status" className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {avisos.map((aviso) => (
                <p key={aviso}>{aviso}</p>
              ))}
            </div>
          )}
          {crearPedido.isError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {handleApiError(crearPedido.error)}
            </p>
          )}
          <CheckoutForm enviando={crearPedido.isPending} onConfirmar={confirmar} />
        </Card>
        <Card className="flex h-fit flex-col gap-2">
          <h2 className="font-semibold text-stone-900">Resumen</h2>
          {items.map((i) => (
            <div key={i.producto_id} className="flex justify-between text-sm">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
        </Card>
      </div>
    </section>
  )
}
