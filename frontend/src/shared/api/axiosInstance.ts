import axios, { type AxiosError } from 'axios'

// Instancia única de Axios. withCredentials hace que el navegador envíe la cookie HttpOnly.
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

// El authStore registra acá qué hacer cuando se pierde la sesión (evita importarlo y crear un ciclo).
let alPerderSesion: () => void = () => {}

export function registrarAlPerderSesion(callback: () => void): void {
  alPerderSesion = callback
}

const RUTAS_EXCLUIDAS = ['/auth/token', '/auth/me']

axiosInstance.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail
    const excluida = RUTAS_EXCLUIDAS.some((ruta) => url.startsWith(ruta))

    if ((status === 401 && !excluida) || (status === 400 && detail === 'Cuenta de usuario desactivada')) {
      alPerderSesion()
    }
    return Promise.reject(error)
  },
)
