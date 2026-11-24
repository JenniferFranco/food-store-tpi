from collections.abc import Callable
from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Abre la sesión en __enter__ y hace commit o rollback y close en __exit__.

    Es el único lugar donde se llama a commit: ni los Services ni los Routers lo hacen.
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self._session_factory = session_factory
        self.session: Session

    def __enter__(self):
        self.session = self._session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
