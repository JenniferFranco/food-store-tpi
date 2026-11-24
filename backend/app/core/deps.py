from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

COOKIE_NAME = "access_token"


def get_current_user(request: Request, session: Session = Depends(get_session)) -> Usuario:
    """Lee la cookie HttpOnly, valida el token y carga el usuario. 401 si no hay sesión válida."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o vencido")
    usuario = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Rechaza a los usuarios dados de baja (disabled = true) con 400."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    """Devuelve una dependencia que exige que el usuario tenga uno de los roles indicados."""

    def verificar_rol(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para esta acción")
        return usuario

    return verificar_rol
