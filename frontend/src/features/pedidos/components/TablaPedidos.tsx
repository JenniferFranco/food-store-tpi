import type { ColumnDef } from '@tanstack/react-table'
import TablaDatos from '../../../shared/components/TablaDatos'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import Button from '../../../shared/ui/Button'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

interface TablaPedidosProps {
  pedidos: Pedido[]
  ocupado: boolean
  onVerDetalle: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
}

export default function TablaPedidos({ pedidos, ocupado, onVerDetalle, onCambiarEstado }: TablaPedidosProps) {
  const columnas: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => <span className="font-semibold">#{row.original.id}</span> },
    { accessorKey: 'usuario_id', header: 'Cliente', cell: ({ row }) => `Usuario #${row.original.usuario_id}` },
    { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => formatearFecha(row.original.created_at) },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => formatearPrecio(row.original.total) },
    {
      accessorKey: 'forma_pago',
      header: 'Pago',
      cell: ({ row }) => (row.original.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
    },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variante="secundario" tamano="sm" onClick={() => onVerDetalle(row.original)}>
            Detalle
          </Button>
          {/* Solo se muestran las transiciones válidas de la máquina de estados. */}
          {TRANSICIONES[row.original.estado].map((destino) => (
            <Button
              key={destino}
              tamano="sm"
              variante={destino === 'CANCELADO' ? 'peligro' : 'primario'}
              disabled={ocupado}
              onClick={() => onCambiarEstado(row.original, destino)}
            >
              {ETIQUETA_ACCION[destino]}
            </Button>
          ))}
        </div>
      ),
    },
  ]

  return <TablaDatos datos={pedidos} columnas={columnas} mensajeVacio="No hay pedidos con ese estado" />
}
