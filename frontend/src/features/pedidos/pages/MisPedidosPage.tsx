import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Paginacion from '../../../shared/components/Paginacion'
import Skeleton from '../../../shared/components/Skeleton'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import PedidoDetalle from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 5

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const totalPaginas = pedidos.data ? Math.ceil(pedidos.data.total / POR_PAGINA) : 0

  const confirmarCancelacion = () => {
    if (!aCancelar) return
    cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-stone-900">Mis pedidos</h1>

      {pedidos.isLoading ? (
        <Skeleton variante="fila" cantidad={POR_PAGINA} />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data && pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="font-medium text-orange-700 hover:underline">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pedidos.data?.items.map((pedido) => (
              <article key={pedido.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-stone-200 bg-white px-5 py-4">
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">Pedido #{pedido.id}</p>
                  <p className="text-sm text-stone-500">
                    {formatearFecha(pedido.created_at)} · {pedido.items.length} producto(s)
                  </p>
                </div>
                <BadgeEstado estado={pedido.estado} />
                <span className="w-28 text-right font-bold">{formatearPrecio(pedido.total)}</span>
                <div className="flex gap-2">
                  <Button variante="secundario" tamano="sm" onClick={() => setDetalleId(pedido.id)}>
                    Ver detalle
                  </Button>
                  {pedido.estado === 'PENDIENTE' && (
                    <Button variante="peligro" tamano="sm" onClick={() => setACancelar(pedido)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={detalleId !== null} titulo={`Pedido #${detalleId ?? ''}`} onClose={() => setDetalleId(null)}>
        {detalleId !== null && <PedidoDetalle pedidoId={detalleId} />}
      </Modal>

      <Modal abierto={aCancelar !== null} titulo="Cancelar pedido" onClose={() => setACancelar(null)}>
        <p className="mb-4 text-stone-600">
          ¿Querés cancelar el pedido #{aCancelar?.id}? El stock de los productos se devuelve al catálogo.
        </p>
        {cancelar.isError && <p role="alert" className="mb-3 text-sm text-red-700">{handleApiError(cancelar.error)}</p>}
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button variante="peligro" disabled={cancelar.isPending} onClick={confirmarCancelacion}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
