import axios from 'axios'

interface ErrorDeValidacion {
  msg: string
}

/** Convierte el error de la API en un mensaje para mostrar en pantalla. */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.'
    }
    const datos = error.response.data as { detail?: unknown } | undefined
    const detail = datos?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((d) => (d as ErrorDeValidacion).msg).join('. ')
    }
    return `Error ${error.response.status}`
  }
  return 'Ocurrió un error inesperado'
}
