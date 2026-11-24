import { Link } from 'react-router-dom'
import EstadoVacio from '../../../shared/components/EstadoVacio'

export default function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="No tenés permiso para ver esta página"
      mensaje="Esta sección es solo para administradores."
      accion={
        <Link to="/" className="font-medium text-orange-700 hover:underline">
          Volver al inicio
        </Link>
      }
    />
  )
}
