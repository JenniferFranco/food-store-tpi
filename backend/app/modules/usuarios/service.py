from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Gestión de usuarios para el rol admin. Lanza HTTPException, como el proyecto de seguridad."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            usuario.disabled = False  # idempotente: responde 200 aunque ya estuviera activo
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            if usuario.id == admin_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puede desactivarse a sí mismo")
            usuario.disabled = True
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())
