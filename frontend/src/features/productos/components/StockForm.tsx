import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Checkbox from '../../../shared/ui/Checkbox'
import { Input } from '../../../shared/ui/Input'
import { mensajeError } from '../../../shared/utils/formulario'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  enviando: boolean
  onGuardar: (datos: ProductoStockUpdate) => void
}

/** Cambio de stock y disponibilidad (PATCH /productos/{id}/stock). */
export default function StockForm({ producto, enviando, onGuardar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onGuardar(value),
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
            value={Number.isNaN(field.state.value) ? '' : field.state.value}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <Checkbox label="Disponible para la venta" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
        )}
      </form.Field>
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Guardar stock'}
      </Button>
    </form>
  )
}
