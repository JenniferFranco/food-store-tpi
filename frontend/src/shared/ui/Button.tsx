import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'
type Tamano = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
}

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700',
  secundario: 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'text-stone-600 hover:bg-stone-100',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
}

export default function Button({ variante = 'primario', tamano = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    />
  )
}
