import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export default function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
      <input type="checkbox" className="h-4 w-4 accent-orange-600" {...props} />
      {label}
    </label>
  )
}
