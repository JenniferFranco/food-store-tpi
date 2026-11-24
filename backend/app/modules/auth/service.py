from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El nombre de usuario ya existe")
            if uow.usuarios.get_by_email(datos.email):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya está registrado")
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=datos.email,
                hashed_password=hash_password(datos.password),
                role="user",  # el registro público siempre crea usuarios con rol user
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el token. El Router lo guarda en la cookie."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos")
            if usuario.disabled:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
            return create_access_token(usuario.username)


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())
