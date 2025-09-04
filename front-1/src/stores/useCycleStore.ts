// src/stores/useCycleStore.ts
import { create } from "zustand";

type CycleState = {
  soldCycles: number;
  decreaseCycle: () => void;
  reset: () => void;
};

export const useCycleStore = create<CycleState>((set) => ({
  soldCycles: Number(localStorage.getItem("soldCycles") || 0),

  decreaseCycle: () =>
    set((state) => {
      const next = state.soldCycles + 1;
      localStorage.setItem("soldCycles", String(next));
      return { soldCycles: next };
    }),

  reset: () => {
    localStorage.removeItem("soldCycles");
    set({ soldCycles: 0 });
  },
}));
