interface SkeletonProps {
  cantidad?: number
  variante?: 'tarjeta' | 'fila'
}

export default function Skeleton({ cantidad = 4, variante = 'tarjeta' }: SkeletonProps) {
  const elementos = Array.from({ length: cantidad }, (_, i) => i)
  if (variante === 'fila') {
    return (
      <div className="flex flex-col gap-2" aria-label="Cargando">
        {elementos.map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-stone-200" />
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando">
      {elementos.map((i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="h-40 animate-pulse bg-stone-200" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
            <div className="h-3 w-full animate-pulse rounded bg-stone-200" />
            <div className="h-8 w-1/2 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
