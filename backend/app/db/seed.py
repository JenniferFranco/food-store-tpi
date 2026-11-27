"""Carga inicial idempotente: se puede ejecutar varias veces sin duplicar datos.

Uso: python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {"username": "admin", "password": "Admin1234!", "full_name": "Administrador", "email": "admin@foodstore.com"}

CATEGORIAS = [
    ("Pizzas", "Pizzas al horno con masa casera"),
    ("Hamburguesas", "Hamburguesas de carne y veggie"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Dulces para terminar la comida"),
]

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9200.0, 20),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 10500.0, 15),
    ("Pizzas", "Pizza fugazzeta", "Rellena de muzzarella con cebolla", 11000.0, 10),
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga, tomate y queso", 7800.0, 25),
    ("Hamburguesas", "Hamburguesa doble cheddar", "Doble medallón con cheddar y panceta", 9500.0, 12),
    ("Hamburguesas", "Hamburguesa veggie", "Medallón de lentejas con vegetales", 8200.0, 8),
    ("Bebidas", "Gaseosa 500 ml", "Cola, lima limón o naranja", 2000.0, 50),
    ("Bebidas", "Agua mineral 500 ml", "Con o sin gas", 1500.0, 40),
    ("Postres", "Flan casero", "Con dulce de leche o crema", 3500.0, 15),
    ("Postres", "Brownie con helado", "Brownie tibio con una bocha de helado", 4800.0, 10),
]

# Fotos guardadas en frontend/public/images/products: el frontend las sirve en /images/products/...
IMAGENES = {
    "Pizza muzzarella": "pizza-muzzarella.jpg",
    "Pizza napolitana": "pizza-napolitana.jpg",
    "Pizza fugazzeta": "pizza-fugazzeta.jpg",
    "Hamburguesa clásica": "hamburguesa-clasica.jpg",
    "Hamburguesa doble cheddar": "hamburguesa-doble-cheddar.jpg",
    "Hamburguesa veggie": "hamburguesa-veggie.jpg",
    "Gaseosa 500 ml": "gaseosa-500ml.jpg",
    "Agua mineral 500 ml": "agua-mineral-500ml.jpg",
    "Flan casero": "flan-casero.jpg",
    "Brownie con helado": "brownie-con-helado.jpg",
}


def _imagen(nombre: str) -> str:
    return f"/images/products/{IMAGENES[nombre]}"


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        # Usuario admin
        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print("Usuario admin creado")

        # Categorías
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                print(f"Categoría creada: {nombre}")
            categorias[nombre] = categoria

        # Productos
        for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
            producto = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if producto is None:
                session.add(
                    Producto(
                        categoria_id=categorias[nombre_categoria].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=_imagen(nombre),
                        stock=stock,
                    )
                )
                print(f"Producto creado: {nombre}")
            elif producto.imagen_url is None or "placehold.co" in producto.imagen_url:
                # Base cargada con las imágenes de ejemplo anteriores: se pasa a la foto real.
                producto.imagen_url = _imagen(nombre)
                session.add(producto)
                print(f"Imagen actualizada: {nombre}")

        session.commit()
    print("Seed terminado")


if __name__ == "__main__":
    seed()
