// src/store/useCarritoStore.js
import { create } from "zustand";
import axios from "axios";
import useTuristaStore from "./useTuristaStore";

const useCarritoStore = create((set, get) => ({
  carrito: null,
  items: [],

  // =============================
  // 🔹 Obtener carrito del turista
  // =============================
  fetchCarrito: async () => {
    const { turista, initSession } = useTuristaStore.getState();

    if (!turista) {
      await initSession();
    }

    const turistaActual = useTuristaStore.getState().turista;
    const idTurista =
      turistaActual?.id_turista ||
      turistaActual?.id ||
      turistaActual?.id_usuario;

    if (!idTurista) {
      console.warn("⚠️ No hay turista logueado o falta id_turista");
      return;
    }

    try {
      // 1️⃣ Traer o crear carrito activo
      const resCarrito = await axios.get(
        `http://localhost:8000/api/carrito/${idTurista}`
      );
      const carrito = resCarrito.data;

      // 2️⃣ Traer items del carrito
      const resItems = await axios.get(
        `http://localhost:8000/api/carrito/${carrito.id_carrito}/items`
      );

      set({ carrito, items: resItems.data || [] });
      console.log("🛒 Carrito cargado:", resItems.data);
    } catch (err) {
      console.error("Error al obtener carrito:", err);
    }
  },

  // =============================
  // 🔹 Agregar item al carrito
  // =============================
  addItem: async (id_fecha, cantidad_personas) => {
    const { turista } = useTuristaStore.getState();
    const { fetchCarrito } = get();

    if (!turista) {
      alert("Debes iniciar sesión para agregar al carrito");
      return;
    }

    const idTurista =
      turista.id_turista || turista.id || turista.id_usuario;

    try {
      await axios.post("http://localhost:8000/api/carrito/item", {
        id_turista: idTurista,
        id_fecha,
        cantidad_personas,
      });

      // ✅ Recargar carrito actualizado
      await fetchCarrito();
    } catch (err) {
      console.error("Error al agregar item:", err?.response?.data || err);
      alert("No se pudo agregar al carrito.");
    }
  },

  // =============================
  // 🔹 Eliminar item del carrito
  // =============================
  removeItem: async (id_item) => {
    try {
      await axios.delete(`http://localhost:8000/api/carrito/item/${id_item}`);
      set((state) => ({
        items: state.items.filter((i) => i.id_item !== id_item),
      }));
    } catch (err) {
      console.error("Error al eliminar item:", err);
    }
  },

  // =============================
  // 🔹 Actualizar cantidad de personas
  // =============================
  updateCantidad: (id_item, nuevaCantidad) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id_item === id_item
          ? {
              ...i,
              cantidad_personas: nuevaCantidad,
              subtotal: i.precio_unitario * nuevaCantidad,
            }
          : i
      ),
    }));
  },

  // =============================
  // 🔹 Calcular total del carrito
  // =============================
  calcularTotal: () => {
    const items = get().items;
    return items.reduce((acc, i) => acc + Number(i.subtotal || 0), 0);
  },

  // =============================
  // 🔹 Vaciar carrito completo
  // =============================
  clearCarrito: () => set({ carrito: null, items: [] }),
}));

export default useCarritoStore;
