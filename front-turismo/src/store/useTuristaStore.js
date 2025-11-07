// src/store/useTuristaStore.js
import { create } from "zustand";

const useTuristaStore = create((set) => ({
  turista: null,
  token: null,

  // 🔹 Cargar sesión guardada desde localStorage (ahora asíncrona)
  initSession: async () => {
    return new Promise((resolve) => {
      const turistaData = localStorage.getItem("turista");
      const tokenData = localStorage.getItem("tokenTurista");

      if (turistaData && tokenData) {
        const parsedTurista = JSON.parse(turistaData);
        set({ turista: parsedTurista, token: tokenData });
        console.log("✅ Sesión cargada desde localStorage:", parsedTurista);
      } else {
        console.warn("⚠️ No se encontró sesión guardada.");
      }

      // pequeña pausa para asegurar que Zustand actualice el estado
      setTimeout(resolve, 100);
    });
  },

  // 🔹 Guardar sesión después del login
  setTurista: (turista, token) => {
    localStorage.setItem("turista", JSON.stringify(turista));
    localStorage.setItem("tokenTurista", token);
    set({ turista, token });
    console.log("🟢 Sesión guardada en localStorage:", turista);
  },

  // 🔹 Cerrar sesión
  clearTurista: () => {
    localStorage.removeItem("turista");
    localStorage.removeItem("tokenTurista");
    set({ turista: null, token: null });
    console.log("🔴 Sesión cerrada, turista limpiado.");
  },
}));

export default useTuristaStore;
