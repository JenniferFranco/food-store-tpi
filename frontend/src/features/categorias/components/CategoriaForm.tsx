import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import { Input, TextArea } from '../../../shared/ui/Input'
import { mensajeError } from '../../../shared/utils/formulario'
import type { Categoria, CategoriaCreate } from '../types/categoria'

interface CategoriaFormProps {
  inicial: Categoria | null
  enviando: boolean
  onGuardar: (datos: CategoriaCreate) => void
}

export default function CategoriaForm({ inicial, enviando, onGuardar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: ({ value }) => onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 2) return 'Mínimo 2 caracteres'
            if (largo > 100) return 'Máximo 100 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <TextArea label="Descripción" rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
        )}
      </form.Field>
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
