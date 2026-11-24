import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import { Input, Select, TextArea } from '../../../shared/ui/Input'
import { mensajeError } from '../../../shared/utils/formulario'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  enviando: boolean
  onConfirmar: (datos: DatosCheckout) => void
}

export default function CheckoutForm({ enviando, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as DatosCheckout,
    onSubmit: ({ value }) => onConfirmar(value),
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Calle, número, piso"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>
      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>
      <form.Field name="notas">
        {(field) => (
          <TextArea
            label="Notas (opcional)"
            rows={3}
            placeholder="Ej.: tocar timbre 2B"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Confirmando...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
