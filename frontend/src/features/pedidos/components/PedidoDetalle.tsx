import { handleApiError } from '../../../shared/api/handleApiError'
import Cargando from '../../../shared/components/Cargando'
import EstadoError from '../../../shared/components/EstadoError'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { usePedido } from '../hooks/usePedidos'

/** Detalle de un pedido con sus líneas (GET /pedidos/{id}). */
export default function PedidoDetalle({ pedidoId }: { pedidoId: number }) {
  const { data: pedido, isLoading, isError, error } = usePedido(pedidoId)

  if (isLoading) return <Cargando />
  if (isError || !pedido) return <EstadoError mensaje={handleApiError(error)} />

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-stone-500">{formatearFecha(pedido.created_at)}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-stone-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="text-stone-500">Forma de pago</dt>
        <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        {pedido.notas && (
          <>
            <dt className="text-stone-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>
      <table className="w-full">
        <thead className="text-left text-stone-500">
          <tr>
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Precio</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.producto_id} className="border-t border-stone-100">
              <td className="py-1.5">{item.nombre_producto}</td>
              <td className="py-1.5 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-1.5 text-right">{item.cantidad}</td>
              <td className="py-1.5 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold">
        <span>Total</span>
        <span>{formatearPrecio(pedido.total)}</span>
      </div>
    </div>
  )
}
