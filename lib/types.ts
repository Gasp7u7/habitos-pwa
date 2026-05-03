export type MuscleGroup = 'pecho' | 'espalda' | 'piernas' | 'brazos' | 'core' | 'cardio';
export type Environment = 'gym' | 'home';

export type Equipment = 'ninguno' | 'mancuernas' | 'barra' | 'polea' | 'máquina' | 'peso_corporal' | 'bandas';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  environment: Environment[];
  difficulty: 'fácil' | 'medio' | 'difícil';
  description: string;
  equipment?: Equipment[];
  defaultSets?: number;
  defaultReps?: number;
  defaultDuration?: number;
  isCustom?: boolean;
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number;
  rest?: number;
}

export interface Routine {
  id: string;
  name: string;
  level: string;
  environment: Environment;
  description: string;
  exercises: RoutineExercise[];
  isCustom?: boolean;
}

export type ActivitySource =
  | "phone_gps"
  | "manual"
  | "strava_import"
  | "garmin"
  | "polar"
  | "suunto"
  | "google_health_connect"
  | "apple_health"
  | "open_wearables"
  | "zepp"
  | "samsung_health"
  | "huawei_health";

export type RoutePoint = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string | number;
};

export type ActivityEntry = {
  id: string;
  userId: string;
  type: "walk" | "run" | "gym" | "cycling";
  source: ActivitySource;

  startedAt: string;
  endedAt?: string;

  status: "active" | "paused" | "completed" | "discarded" | "review";

  durationSeconds: number;
  movingTimeSeconds: number;

  distanceMeters: number;
  avgPaceSecondsPerKm: number;
  avgSpeedKmh: number;

  estimatedCalories?: number;
  elevationGainMeters?: number;

  avgHeartRate?: number;
  maxHeartRate?: number;
  steps?: number;

  route: RoutePoint[];

  perceivedEffort?: 1 | 2 | 3 | 4 | 5;
  mood?: "great" | "normal" | "tired" | "bad";
  notes?: string;

  posterImageUrl?: string;

  externalProvider?: string;
  externalId?: string;

  createdAt: string;
  updatedAt: string;
};

export type MealEntry = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
  isAiGenerated: boolean;
};

export type WaterEntry = {
  id: string;
  userId: string;
  amountMl: number;
  loggedAt: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  heightCm?: number;
  weightKg?: number;
  primaryGoal?: string;
  goals: string[];
  areasForImprovement: string[];
  hasCompletedOnboarding: boolean;
  dietType?: string;
  fastingSchedule?: string;
  dailyGoals: {
    waterMl: number;
    calories: number;
    activityMinutes: number;
  };
  glassSizeMl?: number;
};

export type FastingEntry = {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  targetHours: number;
  status: "active" | "completed" | "early";
};

export type DeviceConnection = {
  id: string;
  userId: string;
  provider:
    | "strava"
    | "garmin"
    | "polar"
    | "suunto"
    | "google_health_connect"
    | "apple_health"
    | "samsung_health"
    | "huawei_health"
    | "zepp"
    | "open_wearables";
  deviceName?: string;
  status: "connected" | "disconnected" | "error";
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
};
