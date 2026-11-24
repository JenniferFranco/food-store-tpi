import type { ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ abierto, titulo, onClose, children }: ModalProps) {
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">{titulo}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-stone-500 hover:bg-stone-100" aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
