from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema de pedidos de comida. TPI de Programación 4.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: permite que el navegador envíe la cookie HttpOnly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
api.include_router(usuarios_router)
api.include_router(categorias_router)
api.include_router(productos_router)
api.include_router(pedidos_router)
app.include_router(api)


@app.get("/", include_in_schema=False)
def raiz():
    return {"message": "Food Store API. Documentación en /docs y /redoc"}
