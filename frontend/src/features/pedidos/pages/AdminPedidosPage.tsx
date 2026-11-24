import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import Skeleton from '../../../shared/components/Skeleton'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import PedidoDetalle from '../components/PedidoDetalle'
import TablaPedidos from '../components/TablaPedidos'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { NOMBRE_ESTADO, type EstadoPedido, type Pedido } from '../types/pedido'

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const pedidos = usePedidos({ skip: 0, limit: 100, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const onCambiarEstado = (pedido: Pedido, destino: EstadoPedido) => {
    if (destino === 'CANCELADO') {
      setACancelar(pedido) // la cancelación pide confirmación
      return
    }
    cambiarEstado.mutate({ id: pedido.id, estado: destino })
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-stone-900">Pedidos</h1>
        <select
          aria-label="Filtrar por estado"
          value={estado ?? ''}
          onChange={(e) => setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {NOMBRE_ESTADO[e]}
            </option>
          ))}
        </select>
      </div>

      {cambiarEstado.isError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(cambiarEstado.error)}
        </p>
      )}

      {pedidos.isLoading ? (
        <Skeleton variante="fila" />
      ) : pedidos.isError || !pedidos.data ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : (
        <TablaPedidos
          pedidos={pedidos.data.items}
          ocupado={cambiarEstado.isPending}
          onVerDetalle={(p) => setDetalleId(p.id)}
          onCambiarEstado={onCambiarEstado}
        />
      )}

      <Modal abierto={detalleId !== null} titulo={`Pedido #${detalleId ?? ''}`} onClose={() => setDetalleId(null)}>
        {detalleId !== null && <PedidoDetalle pedidoId={detalleId} />}
      </Modal>

      <Modal abierto={aCancelar !== null} titulo="Cancelar pedido" onClose={() => setACancelar(null)}>
        <p className="mb-4 text-stone-600">
          ¿Cancelar el pedido #{aCancelar?.id}? Se devuelve el stock de sus productos.
        </p>
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button
            variante="peligro"
            disabled={cambiarEstado.isPending}
            onClick={() =>
              aCancelar && cambiarEstado.mutate({ id: aCancelar.id, estado: 'CANCELADO' }, { onSuccess: () => setACancelar(null) })
            }
          >
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
