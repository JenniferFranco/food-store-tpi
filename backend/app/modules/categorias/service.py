from app.core.exceptions import ErrorDominio
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# ---------------- Excepciones de dominio ----------------
class CategoriaNoEncontrada(ErrorDominio):
    pass


class NombreDuplicado(ErrorDominio):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    @staticmethod
    def _obtener_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        """Una categoría dada de baja se trata como inexistente."""
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._obtener_activa(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = datos.nombre.strip()
            if uow.categorias.get_by_nombre(nombre):
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nombre}'")
            categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=datos.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)
            if cambios.get("nombre") is not None:
                nombre = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nombre}'")
                cambios["nombre"] = nombre
            elif "nombre" in cambios:
                cambios.pop("nombre")  # el nombre es obligatorio: un null no lo borra
            categoria.sqlmodel_update(cambios)
            uow.session.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: no borra la fila ni oculta sus productos."""
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            categoria.activo = False
            uow.session.add(categoria)


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())
