from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.core.exceptions import ErrorDominio
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    get_pedido_service,
)
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

solo_admin = require_role(["admin"])

# Las demás reglas de negocio (stock, disponible, repetido, transición) responden 400.
CODIGOS = {PedidoNoEncontrado: 404, ProductoNoEncontrado: 404, PedidoAjeno: 403}


def _a_http(error: ErrorDominio) -> HTTPException:
    return HTTPException(status_code=CODIGOS.get(type(error), 400), detail=error.mensaje)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    datos: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear(datos, usuario)
    except ErrorDominio as e:
        raise _a_http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = Query(None),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{pedido_id} para que "resumen" no se tome como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    _: Usuario = Depends(solo_admin),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener(pedido_id, usuario)
    except ErrorDominio as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    datos: CambioEstado,
    _: Usuario = Depends(solo_admin),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except ErrorDominio as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar(pedido_id, usuario)
    except ErrorDominio as e:
        raise _a_http(e)
