import { create } from "zustand";

/**
 * musicStore — persistent audio state that survives route changes.
 * The SoothingEngine singleton lives at module scope so it's never
 * destroyed by React unmounts. Music keeps playing across pages.
 */

// Lazy-init: engine is created on first interaction, not on import
let _engine = null;

export function getEngine() {
  if (!_engine) {
    // Dynamic import of the engine class isn't needed since FocusMusic.jsx
    // defines it. We store the instance here once FocusMusic creates it.
    return null;
  }
  return _engine;
}

export function setEngine(engine) {
  _engine = engine;
}

export const useMusicStore = create((set) => ({
  channel: null,
  playing: false,
  volume: 55,
  amb: {},       // { [ambientId]: { v: number } }
  breathe: false,

  setChannel: (channel) => set({ channel }),
  setPlaying: (playing) => set({ playing }),
  setVolume: (volume) => set({ volume }),
  setAmb: (updater) =>
    set((state) => ({
      amb: typeof updater === "function" ? updater(state.amb) : updater,
    })),
  setBreathe: (breathe) => set({ breathe }),

  // Stop everything and reset state
  stopAll: () => {
    const eng = _engine;
    if (eng) {
      eng.stop();
      eng.stopBreathe();
      Object.keys(useMusicStore.getState().amb).forEach((id) => {
        try { eng.toggleAmb(id, 0); } catch { /* node already stopped */ }
      });
    }
    set({ channel: null, playing: false, amb: {}, breathe: false });
  },
}));
