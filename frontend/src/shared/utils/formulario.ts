interface MetaCampo {
  isTouched: boolean
  errors: unknown[]
}

/** Devuelve el error de un campo de TanStack Form solo si el usuario ya lo tocó (o intentó enviar). */
export function mensajeError(meta: MetaCampo): string | undefined {
  if (!meta.isTouched) return undefined
  const errores = meta.errors.filter((e): e is string => typeof e === 'string')
  return errores.length > 0 ? errores.join('. ') : undefined
}
