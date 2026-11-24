from app.core.exceptions import ErrorDominio
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# ---------------- Excepciones de dominio ----------------
class ProductoNoEncontrado(ErrorDominio):
    pass


class CategoriaNoEncontrada(ErrorDominio):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _obtener_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        """Un producto dado de baja se trata como inexistente."""
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in productos])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._obtener_activo(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = uow.productos.add(Producto.model_validate(datos))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            cambios = {campo: valor for campo, valor in datos.model_dump(exclude_unset=True).items()}
            # Los campos obligatorios no se pueden borrar enviando null.
            for obligatorio in ("nombre", "precio_base", "stock", "disponible", "categoria_id"):
                if obligatorio in cambios and cambios[obligatorio] is None:
                    cambios.pop(obligatorio)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            if datos.stock is not None:
                producto.stock = datos.stock
            if datos.disponible is not None:
                producto.disponible = datos.disponible
            uow.session.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: activo = false."""
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            producto.activo = False
            uow.session.add(producto)


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())
