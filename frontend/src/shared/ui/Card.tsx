import type { HTMLAttributes } from 'react'

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`} {...props} />
}
