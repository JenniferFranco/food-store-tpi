import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../features/auth/api/auth'
import type { LoginData } from '../features/auth/types/auth'
import type { Usuario } from '../features/usuarios/types/usuario'
import { registrarAlPerderSesion } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (datos: LoginData) => Promise<Usuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (datos) => {
        await authApi.login(datos) // el backend deja el token en la cookie HttpOnly
        const usuario = await authApi.obtenerPerfil()
        queryClient.clear() // no mostrar datos cacheados de otra sesión
        set({ usuario })
        return usuario
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          queryClient.clear()
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        // Si no quedó un usuario guardado, no hay sesión que confirmar: se evita un 401 innecesario.
        if (get().usuario === null) {
          set({ cargando: false })
          return
        }
        set({ cargando: true })
        try {
          const usuario = await authApi.obtenerPerfil()
          set({ usuario })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => {
        queryClient.clear()
        set({ usuario: null })
      },
    }),
    {
      name: 'auth-storage',
      // Solo se guarda el usuario, nunca el token (vive en la cookie HttpOnly).
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
)

// Cuando Axios detecta que la sesión se perdió (401 o cuenta desactivada), se limpia el store.
registrarAlPerderSesion(() => useAuthStore.getState().limpiarSesion())
