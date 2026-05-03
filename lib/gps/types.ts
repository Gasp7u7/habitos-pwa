export type GpsActivityType = 'walk' | 'run' | 'bike' | 'hike' | 'other';

export type GpsPoint = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
};

export type ActiveGpsSession = {
  id: string;
  type: GpsActivityType;
  status: 'idle' | 'active' | 'paused' | 'finished';
  startedAt: string;
  pausedAt?: string;
  elapsedSeconds: number;
  movingSeconds: number;
  rawPoints: GpsPoint[];
  filteredPoints: GpsPoint[];
  distanceMeters: number;
  lastPoint?: GpsPoint;
};
