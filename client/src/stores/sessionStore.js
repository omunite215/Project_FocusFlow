import { create } from "zustand";

export const useSessionStore = create((set, get) => ({
  // Session state
  sessionId: null,
  plan: null,
  status: "idle", // idle | active | paused | completed
  currentBlock: 0,
  checkIns: [],
  elapsedSeconds: 0,

  // Actions
  startSession: (sessionId, plan) =>
    set({
      sessionId,
      plan,
      status: "active",
      currentBlock: 0,
      checkIns: [],
      elapsedSeconds: 0,
    }),

  pauseSession: () => set({ status: "paused" }),
  resumeSession: () => set({ status: "active" }),

  addCheckIn: (checkIn) =>
    set((state) => ({
      checkIns: [...state.checkIns, checkIn],
    })),

  setCurrentBlock: (block) => set({ currentBlock: block }),
  tick: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  endSession: () =>
    set({
      status: "completed",
    }),

  resetSession: () =>
    set({
      sessionId: null,
      plan: null,
      status: "idle",
      currentBlock: 0,
      checkIns: [],
      elapsedSeconds: 0,
    }),
}));
