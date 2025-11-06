import { create } from "zustand";

const useTuristaStore = create((set) => ({
  turista: null,
  token: null,

  // 🔹 Cargar sesión guardada desde localStorage
  initSession: () => {
    const turistaData = localStorage.getItem("turista");
    const tokenData = localStorage.getItem("tokenTurista");
    if (turistaData && tokenData) {
      set({ turista: JSON.parse(turistaData), token: tokenData });
    }
  },

  // 🔹 Guardar sesión después del login
  setTurista: (turista, token) => {
    localStorage.setItem("turista", JSON.stringify(turista));
    localStorage.setItem("tokenTurista", token);
    set({ turista, token });
  },

  // 🔹 Cerrar sesión
  clearTurista: () => {
    localStorage.removeItem("turista");
    localStorage.removeItem("tokenTurista");
    set({ turista: null, token: null });
  },
}));

export default useTuristaStore;
