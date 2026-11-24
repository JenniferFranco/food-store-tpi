import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../features/productos/types/producto'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.producto_id === producto.id)
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.producto_id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            }
          }
          const nuevo: ItemCarrito = {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            cantidad,
          }
          return { items: [...estado.items, nuevo] }
        }),

      quitar: (productoId) =>
        set((estado) => ({ items: estado.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items:
            cantidad <= 0
              ? estado.items.filter((i) => i.producto_id !== productoId)
              : estado.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((suma, i) => suma + i.cantidad, 0),
    }),
    { name: 'cart-storage' },
  ),
)
