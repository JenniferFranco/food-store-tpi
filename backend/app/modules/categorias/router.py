from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.core.exceptions import ErrorDominio
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
    get_categoria_service,
)
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorías"])

solo_admin = require_role(["admin"])

CODIGOS = {CategoriaNoEncontrada: 404, NombreDuplicado: 409}


def _a_http(error: ErrorDominio) -> HTTPException:
    """Traduce la excepción de dominio al código HTTP de la especificación."""
    return HTTPException(status_code=CODIGOS.get(type(error), 400), detail=error.mensaje)


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.obtener(categoria_id)
    except ErrorDominio as e:
        raise _a_http(e)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    datos: CategoriaCreate,
    _: Usuario = Depends(solo_admin),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.crear(datos)
    except ErrorDominio as e:
        raise _a_http(e)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    _: Usuario = Depends(solo_admin),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar(categoria_id, datos)
    except ErrorDominio as e:
        raise _a_http(e)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def eliminar_categoria(
    categoria_id: int,
    _: Usuario = Depends(solo_admin),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.eliminar(categoria_id)
    except ErrorDominio as e:
        raise _a_http(e)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
