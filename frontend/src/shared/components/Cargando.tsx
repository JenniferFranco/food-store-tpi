export default function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-stone-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
      {texto}
    </div>
  )
}
