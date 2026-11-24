from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita check_same_thread=False para usarse desde FastAPI.
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def importar_modelos() -> None:
    """Importa todos los modelos para que SQLModel conozca las tablas y sus relaciones."""
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401


def create_all_tables() -> None:
    importar_modelos()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea una sesión nueva. La usa el Unit of Work."""
    return Session(engine)


def get_session():
    """Sesión por petición para las dependencias de seguridad."""
    with Session(engine) as session:
        yield session
