interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  color: string
}

export default function TarjetaResumen({ titulo, valor, color }: TarjetaResumenProps) {
  return (
    <div className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${color}`}>
      <p className="text-sm font-medium text-stone-500">{titulo}</p>
      <p className="mt-1 text-3xl font-extrabold text-stone-900">{valor}</p>
    </div>
  )
}
