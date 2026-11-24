from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Expone los repositorios de pedidos y de productos sobre la misma sesión,
    así el pedido y el descuento de stock se confirman juntos o no se confirman."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self):
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
