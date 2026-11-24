import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { mensajeError } from '../../../shared/utils/formulario'
import { useAuthStore } from '../../../store/authStore'
import { registrar } from '../api/auth'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await registrar(value)
        // Después de registrarse, inicia sesión automáticamente.
        await login({ username: value.username, password: value.password })
        navigate('/', { replace: true })
      } catch (error) {
        setErrorApi(handleApiError(error))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-1 text-2xl font-bold text-stone-900">Crear cuenta</h1>
        <p className="mb-5 text-sm text-stone-500">Registrate para hacer pedidos.</p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined) }}
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
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined) }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (EMAIL_VALIDO.test(value) ? undefined : 'Ingresá un email válido') }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length < 8 ? 'Mínimo 8 caracteres' : undefined) }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
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
                {enviando ? 'Creando cuenta...' : 'Registrarme'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-700 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
