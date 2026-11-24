from sqlmodel import SQLModel

# El registro usa los schemas del módulo usuarios.
from app.modules.usuarios.schemas import UserCreate, UserPublic  # noqa: F401


class Mensaje(SQLModel):
    message: str
