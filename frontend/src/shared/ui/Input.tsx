import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const CLASE_CAMPO =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200'

interface CampoProps {
  label: string
  error?: string
  children: ReactNode
}

function Campo({ label, error, children }: CampoProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
      {label}
      {children}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <Campo label={label} error={error}>
      <input className={`${CLASE_CAMPO} font-normal ${className}`} {...props} />
    </Campo>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <Campo label={label} error={error}>
      <textarea className={`${CLASE_CAMPO} font-normal ${className}`} {...props} />
    </Campo>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <Campo label={label} error={error}>
      <select className={`${CLASE_CAMPO} font-normal ${className}`} {...props}>
        {children}
      </select>
    </Campo>
  )
}
