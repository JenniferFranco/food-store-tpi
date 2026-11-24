import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Checkbox from '../../../shared/ui/Checkbox'
import { Input, Select, TextArea } from '../../../shared/ui/Input'
import { mensajeError } from '../../../shared/utils/formulario'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoCreate } from '../types/producto'

interface ProductoFormProps {
  inicial: Producto | null
  categorias: Categoria[]
  enviando: boolean
  onGuardar: (datos: ProductoCreate) => void
}

interface ValoresProducto {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}

const valorNumero = (n: number) => (Number.isNaN(n) ? '' : n)

export default function ProductoForm({ inicial, categorias, enviando, onGuardar }: ProductoFormProps) {
  const valoresIniciales: ValoresProducto = {
    nombre: inicial?.nombre ?? '',
    descripcion: inicial?.descripcion ?? '',
    precio_base: inicial?.precio_base ?? Number.NaN,
    imagen_url: inicial?.imagen_url ?? '',
    stock: inicial?.stock ?? 0,
    disponible: inicial?.disponible ?? true,
    categoria_id: inicial?.categoria_id ?? 0,
  }

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: ({ value }) =>
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      }),
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
        validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
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
          <TextArea label="Descripción" rows={2} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => (Number.isNaN(value) ? 'Ingresá el precio' : value < 0 ? 'No puede ser negativo' : undefined),
          }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={valorNumero(field.state.value)}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta)}
            />
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value) ? 'Ingresá el stock' : value < 0 || !Number.isInteger(value) ? 'Entero mayor o igual a 0' : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={valorNumero(field.state.value)}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta)}
            />
          )}
        </form.Field>
      </div>
      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value === 0 ? 'Elegí una categoría' : undefined) }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          >
            <option value={0}>Elegí una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>
      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            type="url"
            placeholder="https://..."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <Checkbox label="Disponible para la venta" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
        )}
      </form.Field>
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
