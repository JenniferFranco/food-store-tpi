from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.modules.auth.schemas import Mensaje, UserCreate, UserPublic
from app.modules.auth.service import AuthService, get_auth_service
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(datos: UserCreate, service: AuthService = Depends(get_auth_service)):
    return service.registrar(datos)


@router.post("/token", response_model=Mensaje)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    token = service.login(form.username, form.password)
    # El token viaja solo en la cookie HttpOnly: el frontend nunca lo lee.
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # en producción con HTTPS va en True
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: Usuario = Depends(get_current_active_user)):
    return usuario
