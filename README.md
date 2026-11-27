# Food Store · Sistema de pedidos de comida

Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación a Distancia, UTN).

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Autora:** Jennifer Franco
- **Repositorio:** https://github.com/JenniferFranco/food-store-tpi
- **Video de demostración:** https://drive.google.com/file/d/1iQ0bmXjPJfWGEAkKaTzvnn6aGsAnsEb8/view?usp=sharing

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 |
| PostgreSQL | 15 o superior (opcional: para desarrollo se puede usar SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## Estructura

```
.
├── backend/    API REST con FastAPI + SQLModel (Unit of Work, JWT en cookie HttpOnly)
├── frontend/   React + TypeScript + Vite + Tailwind (TanStack Query, Form y Table, Zustand)
└── README.md
```

---

## Backend

### 1. Instalación

Desde la carpeta `backend/`:

```bash
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Variables de entorno

Copiar `.env.example` como `.env`:

```bash
# Windows (PowerShell)
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (token y cookie) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

**Base de datos.** Con PostgreSQL, crear antes una base vacía (por ejemplo `foodstore_db`) y poner el usuario y la contraseña en `DATABASE_URL`. Para probar sin instalar PostgreSQL, cambiar la línea por:

```
DATABASE_URL=sqlite:///./foodstore.db
```

### 3. Carga inicial (seed)

```bash
python -m app.db.seed
```

Crea las tablas y carga el usuario administrador, 4 categorías y 10 productos con stock y foto (las fotos están en `frontend/public/images/products`). Es idempotente: se puede ejecutar varias veces sin duplicar datos.

**Usuario administrador del seed:**

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

Los clientes se crean desde la pantalla de registro (rol `user`).

### 4. Ejecución

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs y http://localhost:8000/redoc

---

## Frontend

### 1. Variables de entorno

Desde la carpeta `frontend/`, copiar `.env.example` como `.env`:

```bash
# Windows (PowerShell)
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### 2. Instalación y ejecución

Con el backend corriendo:

```bash
pnpm install
pnpm build   # compila y verifica los tipos
pnpm dev
```

La aplicación abre en http://localhost:5173. Es importante entrar por `localhost` (no por `127.0.0.1`), porque es el origen habilitado en `FRONTEND_ORIGIN` y la cookie de sesión depende de él.

---

## Funcionalidades

**Cliente (rol `user`)**
- Registro e inicio de sesión. La sesión viaja en una cookie HttpOnly: el frontend nunca lee ni guarda el token.
- Catálogo paginado en el servidor, con búsqueda por nombre, filtro por categoría, skeleton de carga y estado vacío.
- Carrito persistido en el navegador, que no deja superar el stock disponible.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas. Al entrar, el carrito se actualiza con el precio y el stock actuales y avisa si algo cambió.
- «Mis pedidos» con detalle y cancelación mientras el pedido está en `PENDIENTE` (devuelve el stock).

**Administrador (rol `admin`)**
- Resumen con los indicadores del negocio.
- ABM de categorías y productos, cambio de stock y disponibilidad (bajas lógicas).
- Gestión de pedidos con el nombre de cada cliente, según la máquina de estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`, con cancelación desde los estados no terminales.
- Gestión de usuarios: activar y desactivar (el admin no puede desactivarse a sí mismo).

## Arquitectura

**Backend.** Un paquete por dominio en `app/modules/` (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`) con la cadena Router → Service → Unit of Work → Repository → Model. El commit ocurre solo en el `__exit__` del Unit of Work: la creación de un pedido y el descuento de stock se confirman juntos o no se confirma nada. La infraestructura compartida está en `app/core/` (configuración, base de datos, seguridad, dependencias, `UnitOfWork` y `BaseRepository`).

**Frontend.** Organizado por features en `src/features/` (cada una con `pages`, `components`, `hooks`, `api` y `types`). TanStack Query maneja el estado del servidor; Zustand con `persist` maneja la sesión (`authStore`) y el carrito (`cartStore`). Axios usa `withCredentials` y un interceptor que limpia la sesión ante un 401. Las rutas de cliente y de administración se protegen con `ProtectedRoute`.
