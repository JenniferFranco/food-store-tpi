import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { mensajeError } from '../../../shared/utils/formulario'
import { useAuthStore } from '../../../store/authStore'

export default function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [errorApi, setErrorApi] = useState<string | null>(null)
  const destino = (location.state as { from?: string } | null)?.from

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        const logueado = await login(value)
        navigate(destino ?? (logueado.role === 'admin' ? '/admin/resumen' : '/'), { replace: true })
      } catch (error) {
        setErrorApi(handleApiError(error))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-1 text-2xl font-bold text-stone-900">Ingresar</h1>
        <p className="mb-5 text-sm text-stone-500">Ingresá con tu usuario para hacer pedidos.</p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim() === '' ? 'Ingresá tu usuario' : undefined) }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value === '' ? 'Ingresá tu contraseña' : undefined) }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>
          {errorApi && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorApi}</p>}
          <form.Subscribe selector={(estado) => estado.isSubmitting}>
            {(enviando) => (
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Ingresando...' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
