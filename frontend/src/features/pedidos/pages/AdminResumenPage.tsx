import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import Skeleton from '../../../shared/components/Skeleton'
import { formatearPrecio } from '../../../shared/utils/formato'
import TarjetaResumen from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

export default function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-stone-900">Resumen del negocio</h1>
      {isLoading ? (
        <Skeleton variante="fila" cantidad={3} />
      ) : isError || !data ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} color="border-orange-500" />
          <TarjetaResumen titulo="Ingresos (pedidos entregados)" valor={formatearPrecio(data.ingresos_entregados)} color="border-green-600" />
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} color="border-amber-500" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} color="border-blue-500" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} color="border-green-500" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} color="border-stone-400" />
        </div>
      )}
    </section>
  )
}
