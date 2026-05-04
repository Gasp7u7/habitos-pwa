import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityEntry, MealEntry, WaterEntry, UserProfile, DeviceConnection, FastingEntry, Exercise, Routine } from './types';
import { addDays, subDays } from 'date-fns';
import { insertWaterLog, deleteWaterLog, insertMealLog, deleteMealLog, insertFastingLog, endFastingLog } from './supabase/logs';
import { notifyWaterAdded, notifyMealAdded, notifyFastingComplete } from './notifications/inapp';

type AppState = {
  profile: UserProfile;
  activities: ActivityEntry[];
  meals: MealEntry[];
  water: WaterEntry[];
  deviceConnections: DeviceConnection[];
  fastingHistory: FastingEntry[];
  customExercises: Exercise[];
  customRoutines: Routine[];
  
  // Tracking State
  currentActivity: ActivityEntry | null;
  currentFast: FastingEntry | null;
  activeRoutine: Routine | null;
  
  // Actions
  hydrateFromSupabase: (water: WaterEntry[], meals: MealEntry[], fast: FastingEntry | null, activities: ActivityEntry[]) => void;
  setActiveRoutine: (routine: Routine | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addWater: (amount?: number) => void;
  addMeal: (meal: Omit<MealEntry, 'id' | 'userId' | 'loggedAt'>) => void;
  deleteMeal: (id: string) => void;
  deleteWater: (id: string) => void;

  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void;
  addCustomRoutine: (routine: Omit<Routine, 'id' | 'isCustom'>) => void;

  startFast: (targetHours: number) => void;
  endFast: (status: 'completed' | 'early') => void;
  
  startActivity: (type: 'walk' | 'run' | 'gym' | 'cycling') => void;
  pauseActivity: () => void;
  resumeActivity: () => void;
  endActivity: (perceivedEffort?: number, mood?: string, notes?: string) => void;
  discardActivity: () => void;
  updateCurrentActivityMetrics: (distance: number, duration: number, pace: number) => void;
  appendActivityRoute: (point: { latitude: number; longitude: number; timestamp: number; [key: string]: any }) => void;
};

// ... initial data removed for brevity in this replace string, just replacing the type block and methods
const initialProfile: UserProfile = {
  id: 'user_1',
  name: 'Paul',
  email: 'paul@example.com',
  goals: [],
  areasForImprovement: [],
  hasCompletedOnboarding: false,
  dailyGoals: {
    waterMl: 2500,
    calories: 2200,
    activityMinutes: 45,
  },
  glassSizeMl: 250
};

const initialActivities: ActivityEntry[] = [
  {
    id: 'act_1',
    userId: 'user_1',
    type: 'walk',
    source: 'phone_gps',
    startedAt: subDays(new Date(), 1).toISOString(),
    endedAt: subDays(new Date(), 1).toISOString(),
    status: 'completed',
    durationSeconds: 2460, // 41 mins
    movingTimeSeconds: 2400,
    distanceMeters: 3200,
    avgPaceSecondsPerKm: 768, // 12:48/km
    avgSpeedKmh: 4.6,
    estimatedCalories: 210,
    route: [],
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    mood: 'great',
    perceivedEffort: 3,
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      activities: initialActivities,
      meals: [],
      water: [],
      deviceConnections: [],
      fastingHistory: [],
      customExercises: [],
      customRoutines: [],
      
      currentActivity: null,
      currentFast: null,
      activeRoutine: null,

      hydrateFromSupabase: (water, meals, fast, activities) => set((state) => ({
        water,
        meals,
        currentFast: fast || state.currentFast,
        activities: activities.length > 0 ? activities : state.activities
      })),

      setActiveRoutine: (routine) => set({ activeRoutine: routine }),

      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),

      addCustomExercise: (exercise) => set((state) => ({
        customExercises: [...state.customExercises, { ...exercise, id: `cx_${Date.now()}`, isCustom: true }]
      })),

      addCustomRoutine: (routine) => set((state) => ({
        customRoutines: [...state.customRoutines, { ...routine, id: `cr_${Date.now()}`, isCustom: true }]
      })),

      startFast: (targetHours) => {
        const state = get();
        insertFastingLog(state.profile.id, targetHours).then(({ data, error }) => {
          if (data && !error) {
            set({
              currentFast: {
                id: data.id,
                userId: state.profile.id,
                startedAt: data.started_at,
                targetHours,
                status: 'active'
              }
            })
          }
        }).catch(console.error);
        
        // Optimistic
        set((s) => ({
          currentFast: {
            id: `temp_${Date.now()}`, // will be overwritten by response
            userId: s.profile.id,
            startedAt: new Date().toISOString(),
            targetHours,
            status: 'active'
          }
        }));
      },

      endFast: (status) => {
        const state = get();
        if (!state.currentFast) return;
        
        if (!state.currentFast.id.startsWith('temp_')) {
          endFastingLog(state.currentFast.id, status).catch(console.error);
        }

        const endedFast: FastingEntry = {
          ...state.currentFast,
          endedAt: new Date().toISOString(),
          status
        };
        
        set((s) => ({
          currentFast: null,
          fastingHistory: [...s.fastingHistory, endedFast]
        }));
      },

      addWater: (amount) => {
        const state = get();
        const amountMl = amount || state.profile.glassSizeMl || 250;
        
        insertWaterLog(state.profile.id, amountMl).catch(console.error);
        notifyWaterAdded(amountMl);
        
        set((s) => ({
          water: [...s.water, {
            id: `w_${Date.now()}`, // Would be better to use real UUID from Supabase but UI updates optimistically
            userId: s.profile.id,
            amountMl,
            loggedAt: new Date().toISOString()
          }]
        }));
      },

      addMeal: (meal) => {
        const state = get();
        insertMealLog(state.profile.id, meal).catch(console.error);
        notifyMealAdded(meal.name);
        
        set((s) => ({
          meals: [...s.meals, {
            ...meal,
            id: `m_${Date.now()}`,
            userId: s.profile.id,
            loggedAt: new Date().toISOString()
          }]
        }));
      },

      deleteMeal: (id) => {
        deleteMealLog(id).catch(console.error);
        set((state) => ({
          meals: state.meals.filter(m => m.id !== id)
        }));
      },

      deleteWater: (id) => {
        deleteWaterLog(id).catch(console.error);
        set((state) => ({
          water: state.water.filter(w => w.id !== id)
        }));
      },

      startActivity: (type) => set((state) => ({
        currentActivity: {
          id: `act_${Date.now()}`,
          userId: state.profile.id,
          type,
          source: 'phone_gps',
          startedAt: new Date().toISOString(),
          status: 'active',
          durationSeconds: 0,
          movingTimeSeconds: 0,
          distanceMeters: 0,
          avgPaceSecondsPerKm: 0,
          avgSpeedKmh: 0,
          route: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })),

      pauseActivity: () => set((state) => {
        if (!state.currentActivity) return state;
        return {
          currentActivity: { ...state.currentActivity, status: 'paused', updatedAt: new Date().toISOString() }
        };
      }),

      resumeActivity: () => set((state) => {
        if (!state.currentActivity) return state;
        return {
          currentActivity: { ...state.currentActivity, status: 'active', updatedAt: new Date().toISOString() }
        };
      }),

      endActivity: (perceivedEffort, mood, notes) => set((state) => {
        if (!state.currentActivity) return state;
        const completedActivity: ActivityEntry = {
          ...state.currentActivity,
          status: 'completed',
          endedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          perceivedEffort: perceivedEffort as any,
          mood: mood as any,
          notes,
        };
        return {
          activities: [...state.activities, completedActivity],
          currentActivity: null,
          activeRoutine: null
        };
      }),

      discardActivity: () => set({ currentActivity: null, activeRoutine: null }),

      updateCurrentActivityMetrics: (distance, duration, pace) => set((state) => {
        if (!state.currentActivity) return state;
        return {
          currentActivity: {
            ...state.currentActivity,
            distanceMeters: distance,
            durationSeconds: duration,
            avgPaceSecondsPerKm: pace,
            updatedAt: new Date().toISOString()
          }
        };
      }),

      appendActivityRoute: (point) => set((state) => {
        if (!state.currentActivity) return state;
        return {
          currentActivity: {
             ...state.currentActivity,
             route: [...(state.currentActivity.route || []), point],
             updatedAt: new Date().toISOString()
          }
        };
      }),
    }),
    {
      name: 'wellness-app-storage',
    }
  )
);
