import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProfileStore = create(
  persist(
    (set, get) => ({
      profile: null,
      isOnboarded: false,

      setProfile: (profile) =>
        set({ profile, isOnboarded: !!profile }),

      clearProfile: () =>
        set({ profile: null, isOnboarded: false }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
    }),
    {
      name: "focusflow-profile",
    }
  )
);
