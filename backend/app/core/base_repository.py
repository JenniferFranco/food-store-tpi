from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones comunes a todos los repositorios. Sin reglas de negocio."""

    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        consulta = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(consulta).all())

    def add(self, entity: T) -> T:
        # flush: escribe en la transacción para obtener el id, sin hacer commit.
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
