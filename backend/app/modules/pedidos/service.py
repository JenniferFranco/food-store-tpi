from datetime import datetime

from app.core.exceptions import ErrorDominio
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


# ---------------- Excepciones de dominio ----------------
class PedidoNoEncontrado(ErrorDominio):
    pass


class ProductoNoEncontrado(ErrorDominio):
    pass


class PedidoAjeno(ErrorDominio):
    pass


class StockInsuficiente(ErrorDominio):
    pass


class ProductoNoDisponible(ErrorDominio):
    pass


class ProductoRepetido(ErrorDominio):
    pass


class TransicionInvalida(ErrorDominio):
    pass


# ---------------- Máquina de estados (RN-02) ----------------
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),  # terminal
    "CANCELADO": set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    # ---------- auxiliares ----------
    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock la cantidad de cada línea, en la misma transacción."""
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.session.add(producto)

    @staticmethod
    def _a_read(pedido: Pedido) -> PedidoRead:
        leido = PedidoRead.model_validate(pedido)
        leido.cliente = pedido.usuario.full_name or pedido.usuario.username
        return leido

    # ---------- RN-01: crear pedido ----------
    def crear(self, datos: PedidoCreate, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado="PENDIENTE",
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega.strip(),
                    notas=datos.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"El producto {item.producto_id} no existe")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': hay {producto.stock} y se pidieron {item.cantidad}"
                    )
                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                # Copia del nombre y del precio: la línea no cambia aunque cambie el producto (RN-05).
                uow.session.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return self._a_read(pedido)
            # Si cualquier validación falla, __exit__ hace rollback: no se guarda nada, ni el stock.

    # ---------- listados y detalle (RN-04) ----------
    def listar(self, usuario: Usuario, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_todos(skip, limit, estado)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[self._a_read(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return self._a_read(pedido)

    # ---------- RN-02 y RN-03: cambio de estado por el admin ----------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            return self._a_read(pedido)

    # ---------- RN-03 y RN-04: cancelación por el dueño ----------
    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            return self._a_read(pedido)

    # ---------- resumen del panel ----------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_del_dia = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado("ENTREGADO"), 2),
            )


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
