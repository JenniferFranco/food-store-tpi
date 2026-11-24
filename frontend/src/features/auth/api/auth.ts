import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../usuarios/types/usuario'
import type { LoginData, Mensaje, RegistroData } from '../types/auth'

export async function registrar(datos: RegistroData): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', datos)
  return data
}

export async function login(datos: LoginData): Promise<Mensaje> {
  // El login es un formulario OAuth2: se envía como application/x-www-form-urlencoded.
  const formulario = new URLSearchParams({ username: datos.username, password: datos.password })
  const { data } = await axiosInstance.post<Mensaje>('/auth/token', formulario)
  return data
}

export async function logout(): Promise<Mensaje> {
  const { data } = await axiosInstance.post<Mensaje>('/auth/logout')
  return data
}

export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>('/auth/me')
  return data
}
