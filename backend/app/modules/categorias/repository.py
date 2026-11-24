from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca entre todas, incluidas las dadas de baja: la baja no libera el nombre."""
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(consulta).first()

    def list_activas(self) -> list[Categoria]:
        consulta = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return list(self.session.exec(consulta).all())
