import { create } from "zustand";

export const CountState = create((set) => ({
  count: 200,
  increase: () => set((state) => ({ count: state.count + 1 })),
  dicrease: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  update: (val) => set({ count: val }),
}));
