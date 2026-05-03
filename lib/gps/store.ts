import { create } from 'zustand';
import { ActiveGpsSession, GpsPoint } from '@/lib/gps/types';

type GpsStore = {
  session: ActiveGpsSession | null;
  setSession: (session: ActiveGpsSession | null) => void;
  updateSession: (updates: Partial<ActiveGpsSession>) => void;
  startSession: (type: ActiveGpsSession['type']) => void;
  addPoint: (point: GpsPoint) => void;
};

export const useGpsStore = create<GpsStore>((set, get) => ({
  session: null,
  setSession: (session) => set({ session }),
  updateSession: (updates) => set((state) => ({ 
    session: state.session ? { ...state.session, ...updates } : null 
  })),
  startSession: (type) => set({
    session: {
      id: crypto.randomUUID(),
      type,
      status: 'idle',
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      movingSeconds: 0,
      rawPoints: [],
      filteredPoints: [],
      distanceMeters: 0,
    }
  }),
  addPoint: (point) => set((state) => {
    if (!state.session) return state;
    return {
      session: {
        ...state.session,
        rawPoints: [...state.session.rawPoints, point],
        filteredPoints: [...state.session.filteredPoints, point], // Real filter will be applied before
        lastPoint: point,
      }
    };
  })
}));
