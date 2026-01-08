import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
export const profileStore = create()(
  persist(
    (set, get) => ({
      Profile: null,
      access_token: null,
      permission: null,

      setProfile: (param) =>
        set((pre) => ({ Profile: { ...pre.Profile, ...param } })),

      setPermisison: (param) => set(() => ({ permission: param })),
      setAccessToken: (param) => set(() => ({ access_token: param })),

      logout: () => {
        set({
          Profile: null,
          access_token: null,
        });
        localStorage.removeItem("Profile");
      },
    }),
    {
      name: "Profile",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
