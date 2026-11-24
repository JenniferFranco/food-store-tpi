import Button from '../ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export default function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button variante="secundario" tamano="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
