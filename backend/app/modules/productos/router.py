from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.core.exceptions import ErrorDominio
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
    get_producto_service,
)
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])

solo_admin = require_role(["admin"])

CODIGOS = {ProductoNoEncontrado: 404, CategoriaNoEncontrada: 404}


def _a_http(error: ErrorDominio) -> HTTPException:
    return HTTPException(status_code=CODIGOS.get(type(error), 400), detail=error.mensaje)


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Búsqueda por nombre, sin distinguir mayúsculas"),
    categoria_id: int | None = Query(None),
    disponible: bool | None = Query(None),
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.obtener(producto_id)
    except ErrorDominio as e:
        raise _a_http(e)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    datos: ProductoCreate,
    _: Usuario = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.crear(datos)
    except ErrorDominio as e:
        raise _a_http(e)


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    _: Usuario = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(producto_id, datos)
    except ErrorDominio as e:
        raise _a_http(e)


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    _: Usuario = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ErrorDominio as e:
        raise _a_http(e)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def eliminar_producto(
    producto_id: int,
    _: Usuario = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.eliminar(producto_id)
    except ErrorDominio as e:
        raise _a_http(e)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
