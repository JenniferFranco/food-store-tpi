import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import EstadoVacio from './EstadoVacio'
import Paginacion from './Paginacion'

interface TablaDatosProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  filtro?: string
  mensajeVacio?: string
  tamanoPagina?: number
}

/** Tabla del panel de administración con TanStack Table: paginación y filtro del lado del cliente. */
export default function TablaDatos<T>({
  datos,
  columnas,
  filtro = '',
  mensajeVacio = 'No hay registros',
  tamanoPagina = 8,
}: TablaDatosProps<T>) {
  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { globalFilter: filtro },
    initialState: { pagination: { pageSize: tamanoPagina } },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (tabla.getRowModel().rows.length === 0) {
    return <EstadoVacio titulo={mensajeVacio} />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-600">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-stone-100 hover:bg-stone-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={tabla.getState().pagination.pageIndex}
        totalPaginas={tabla.getPageCount()}
        onCambiar={(pagina) => tabla.setPageIndex(pagina)}
      />
    </div>
  )
}
