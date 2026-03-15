import { create } from "zustand";

export const useSessionStore = create((set, get) => ({
  // Session state
  sessionId: null,
  plan: null,
  status: "idle", // idle | active | paused | completed
  currentBlock: 0,
  completedBlocks: [],
  checkIns: [],
  elapsedSeconds: 0,
  report: null,
  completedSubjects: [], // subject names that were marked done
  checkInIntervalSec: 900, // default 15 minutes in seconds

  setCheckInInterval: (seconds) => set({ checkInIntervalSec: seconds }),

  // Actions
  startSession: (sessionId, plan) =>
    set((state) => ({
      sessionId,
      plan,
      status: "active",
      currentBlock: 0,
      completedBlocks: [],
      checkIns: [],
      elapsedSeconds: 0,
      checkInIntervalSec: state.checkInIntervalSec, // preserve user's chosen interval
    })),

  pauseSession: () => set({ status: "paused" }),
  resumeSession: () => set({ status: "active" }),

  addCheckIn: (checkIn) =>
    set((state) => ({
      checkIns: [...state.checkIns, checkIn],
    })),

  setCurrentBlock: (block) => set({ currentBlock: block }),

  completeBlock: (index) =>
    set((state) => {
      if (state.completedBlocks.includes(index)) return state;
      const subject = state.plan?.blocks?.[index]?.subject;
      const completedSubjects = subject && !state.completedSubjects.includes(subject)
        ? [...state.completedSubjects, subject]
        : state.completedSubjects;
      return { completedBlocks: [...state.completedBlocks, index], completedSubjects };
    }),

  reorderBlocks: (newOrder) =>
    set((state) => {
      if (!state.plan?.blocks) return state;
      const reordered = newOrder.map((i) => ({
        ...state.plan.blocks[i],
        order: newOrder.indexOf(i) + 1,
      }));
      return { plan: { ...state.plan, blocks: reordered } };
    }),

  tick: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  setElapsed: (seconds) => set({ elapsedSeconds: seconds }),

  endSession: (report = null) =>
    set({
      status: "completed",
      report,
    }),

  resetSession: () =>
    set({
      sessionId: null,
      plan: null,
      status: "idle",
      currentBlock: 0,
      completedBlocks: [],
      completedSubjects: [],
      checkIns: [],
      elapsedSeconds: 0,
      report: null,
      checkInIntervalSec: 900,
    }),
}));
