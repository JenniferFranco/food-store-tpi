import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../features/productos/types/producto'
import { formatearPrecio } from '../shared/utils/formato'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock: number // unidades disponibles al agregarlo: el carrito no deja pasarse
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Producto, cantidad?: number) => boolean
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => boolean
  vaciar: () => void
  sincronizar: (productos: Producto[]) => string[]
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Devuelve false si con esa cantidad se supera el stock disponible.
      agregar: (producto, cantidad = 1) => {
        const existente = get().items.find((i) => i.producto_id === producto.id)
        const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad
        if (nuevaCantidad > producto.stock) return false

        if (existente) {
          set((estado) => ({
            items: estado.items.map((i) =>
              i.producto_id === producto.id ? { ...i, cantidad: nuevaCantidad, stock: producto.stock } : i,
            ),
          }))
        } else {
          const nuevo: ItemCarrito = {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            cantidad,
            stock: producto.stock,
          }
          set((estado) => ({ items: [...estado.items, nuevo] }))
        }
        return true
      },

      quitar: (productoId) =>
        set((estado) => ({ items: estado.items.filter((i) => i.producto_id !== productoId) })),

      // Devuelve false si la cantidad pedida supera el stock disponible.
      cambiarCantidad: (productoId, cantidad) => {
        const item = get().items.find((i) => i.producto_id === productoId)
        if (item && cantidad > item.stock) return false
        set((estado) => ({
          items:
            cantidad <= 0
              ? estado.items.filter((i) => i.producto_id !== productoId)
              : estado.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        }))
        return true
      },

      vaciar: () => set({ items: [] }),

      // Pone el carrito al día con los datos actuales de los productos (precio y stock).
      // Devuelve los avisos para mostrarle al cliente qué cambió.
      sincronizar: (productos) => {
        const avisos: string[] = []
        const actualizados: ItemCarrito[] = []
        for (const item of get().items) {
          const producto = productos.find((p) => p.id === item.producto_id)
          if (!producto) {
            actualizados.push(item)
            continue
          }
          if (producto.precio_base !== item.precio_unitario) {
            avisos.push(`El precio de ${producto.nombre} cambió: ahora es ${formatearPrecio(producto.precio_base)}.`)
          }
          if (!producto.disponible) {
            avisos.push(`${producto.nombre} ya no está disponible y se quitó del carrito.`)
            continue
          }
          const cantidad = Math.min(item.cantidad, producto.stock)
          if (cantidad < item.cantidad) {
            avisos.push(
              cantidad === 0
                ? `${producto.nombre} se quedó sin stock y se quitó del carrito.`
                : `De ${producto.nombre} ${producto.stock === 1 ? 'queda 1 unidad' : `quedan ${producto.stock} unidades`}: se ajustó la cantidad.`,
            )
          }
          if (cantidad > 0) {
            actualizados.push({
              ...item,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
              stock: producto.stock,
              cantidad,
            })
          }
        }
        set({ items: actualizados })
        return avisos
      },

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((suma, i) => suma + i.cantidad, 0),
    }),
    { name: 'cart-storage' },
  ),
)
