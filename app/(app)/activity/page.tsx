'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { DEFAULT_EXERCISES } from '@/components/workouts/ExerciseLibrary';
import GpsPermissionState from '@/components/gps/GpsPermissionState';
import LiveActivityStats from '@/components/gps/LiveActivityStats';
import { GpsPoint } from '@/lib/gps/types';
import { isValidGpsPoint, haversineDistanceMeters } from '@/lib/gps/tracker';

import dynamic from 'next/dynamic';
import { MapPin, Dumbbell, Zap, Clock, Play, Square, Pause, Target, Circle, Activity, ChevronLeft } from 'lucide-react';


const RouteMap = dynamic(() => import('@/components/gps/RouteMap'), { ssr: false, loading: () => (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
    <span className="text-gray-400 font-medium text-sm">Cargando mapa...</span>
  </div>
) });

import { createActivityLog } from '@/lib/mutations/createActivityLog';

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentActivity, activeRoutine, customExercises, startActivity, pauseActivity, resumeActivity, endActivity, discardActivity, updateCurrentActivityMetrics, appendActivityRoute } = useAppStore();
  const initialType = (searchParams.get('type') as any) || 'walk';
  const [activityType, setActivityType] = useState<'walk' | 'run' | 'gym' | 'cycling'>(initialType);
  const [effort, setEffort] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [gymSets, setGymSets] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  const [isGpsReady, setIsGpsReady] = useState(typeof window !== 'undefined' && 'geolocation' in navigator);
  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<GpsPoint | null>(null);
  const wakeLockRef = useRef<any>(null);
  
  // Combine exercises for lookup
  const ALL_EXERCISES = [...DEFAULT_EXERCISES, ...customExercises];
  
  const startTimeRef = useRef<number | null>(null);
  const pausedDurationRef = useRef<number>(0);
  const currentActivityRef = useRef(currentActivity);

  useEffect(() => {
    currentActivityRef.current = currentActivity;
  }, [currentActivity]);

  // Keep track of GPS
  useEffect(() => {
    if (currentActivity?.status === 'active' && currentActivity.type !== 'gym' && 'geolocation' in navigator && !watchIdRef.current) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const current = currentActivityRef.current;
            if (current?.status !== 'active') return;
            
            const newPoint = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              speed: position.coords.speed,
              heading: position.coords.heading,
              timestamp: position.timestamp,
            };

            if (isValidGpsPoint(position.coords, lastPointRef.current, current.type as any)) {
              let addedDistance = 0;
              if (lastPointRef.current) {
                addedDistance = haversineDistanceMeters(
                  lastPointRef.current.latitude,
                  lastPointRef.current.longitude,
                  newPoint.latitude,
                  newPoint.longitude
                );
              }
              
              const newDistance = current.distanceMeters + addedDistance;
              const newPace = newDistance > 0 ? Math.floor(current.durationSeconds / (newDistance / 1000)) : 0;
              
              updateCurrentActivityMetrics(newDistance, current.durationSeconds, newPace);
              appendActivityRoute(newPoint);
              lastPointRef.current = newPoint;
            }
          },
          (error) => console.error("GPS Error:", error),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
    } else if (currentActivity?.status !== 'active' && watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
    }
    
    return () => {
      if (watchIdRef.current && currentActivity?.status !== 'active') {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [currentActivity?.status, currentActivity?.type, updateCurrentActivityMetrics, appendActivityRoute]);

  // Keep track of timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentActivity?.status === 'active') {
      if (!startTimeRef.current) {
         startTimeRef.current = Date.now();
         pausedDurationRef.current = currentActivity.durationSeconds || 0;
      }
      
      interval = setInterval(() => {
        if (startTimeRef.current && currentActivityRef.current) {
           const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
           const totalDuration = pausedDurationRef.current + elapsed;
           const currentPace = currentActivityRef.current.distanceMeters > 0 
              ? Math.floor(totalDuration / (currentActivityRef.current.distanceMeters / 1000))
              : 0;
              
           updateCurrentActivityMetrics(
             currentActivityRef.current.distanceMeters, 
             totalDuration, 
             currentPace
           );
        }
      }, 1000);
    } else {
      if (startTimeRef.current) {
        startTimeRef.current = null;
        pausedDurationRef.current = currentActivity?.durationSeconds || 0;
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentActivity?.status, currentActivity?.durationSeconds, updateCurrentActivityMetrics]);
  
  // Manage Wake Lock
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && currentActivity?.status === 'active') {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock activo');
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock liberado');
      }
    };

    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    if (currentActivity?.status === 'active') {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentActivity?.status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(r => r ? r - 1 : 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatPace = (seconds: number) => {
    if (seconds === 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'walk': return 'Caminata';
      case 'run': return 'Running';
      case 'cycling': return 'Ciclismo';
      case 'gym': return 'Gym';
      default: return 'Actividad';
    }
  };

  if (!currentActivity) {
    // STATE 1: BEFORE START
    const requiresGps = activityType !== 'gym';
    const canStart = !requiresGps || isGpsReady;

    return (
      <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
        <div className="flex items-center gap-2 mb-6 pt-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Actividad</h1>
        </div>
        
        <div className="bg-gray-100 p-1 rounded-2xl flex relative mb-8 overflow-x-auto snap-x hide-scrollbar">
          {(['walk', 'run', 'cycling', 'gym'] as const).map(type => (
            <button 
              key={type}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-semibold rounded-xl relative z-10 whitespace-nowrap min-w-fit transition-colors",
                activityType === type ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-500'
              )}
              onClick={() => setActivityType(type)}
            >
              {getLabel(type)}
            </button>
          ))}
        </div>

        {requiresGps && (
          <GpsPermissionState onReady={() => setIsGpsReady(true)} />
        )}

        <div className="bg-[#D4F87A] rounded-[32px] p-6 mb-8 text-center flex flex-col items-center shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/50">
            {activityType === 'gym' ? <Dumbbell size={32} className="text-gray-900" /> : <Target size={32} className="text-gray-900" />}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿Listo para moverte?</h2>
          <p className="text-sm font-medium text-gray-900/60 mb-6 relative z-10">
            {activityType === 'gym' ? (activeRoutine ? `Rutina: ${activeRoutine.name}` : 'Entrenamiento Libre') : 'El GPS está conectado y listo.'}
          </p>
          
          <button 
            disabled={!canStart}
            onClick={() => startActivity(activityType)}
            className={cn(
              "w-full rounded-2xl py-4 font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-md relative z-10",
              canStart ? "bg-gray-900 text-white hover:bg-black active:scale-95 shadow-lg shadow-black/10" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            <Play size={20} fill="currentColor" /> Iniciar {getLabel(activityType)}
          </button>
        </div>
      </div>
    );
  }

  const isGpsActive = currentActivity.type !== 'gym';

  // STATE 3: REVIEW BEFORE SAVE
  if (currentActivity.status === 'review') {
    return (
      <div className="p-6 pb-32 bg-[#f8f9fa] min-h-full overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4">Resumen de {getLabel(currentActivity.type)}</h1>
        
        {/* Map Preview */}
        {isGpsActive && (
          <div className="w-full h-48 bg-gray-200 rounded-[24px] mb-6 overflow-hidden relative border border-gray-100 flex items-center justify-center">
            {currentActivity.route && currentActivity.route.length >= 1 ? (
              <RouteMap geojson={{
                type: 'LineString',
                coordinates: currentActivity.route.map(p => [p.longitude, p.latitude])
              }} />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                <span className="text-gray-400 font-medium text-xs">Esperando señal GPS...</span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {isGpsActive && (
            <>
              <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-none flex flex-col justify-between h-28">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">DISTANCIA</span>
                <span className="text-3xl font-bold text-gray-900 tabular-nums">{(currentActivity.distanceMeters / 1000).toFixed(2)}<span className="text-sm text-gray-400 font-medium ml-1">km</span></span>
              </div>
              <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-none flex flex-col justify-between h-28">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">RITMO</span>
                <span className="text-3xl font-bold text-gray-900 tabular-nums">{formatPace(currentActivity.avgPaceSecondsPerKm)}<span className="text-sm text-gray-400 font-medium ml-1">/km</span></span>
              </div>
            </>
          )}
          <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-none flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">TIEMPO</span>
            <span className="text-3xl font-bold text-gray-900 tabular-nums">{Math.floor(currentActivity.durationSeconds / 60)}<span className="text-sm text-gray-400 font-medium mx-0.5">m</span>{currentActivity.durationSeconds % 60}<span className="text-sm text-gray-400 font-medium ml-0.5">s</span></span>
          </div>
          <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-none flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">CALORÍAS</span>
            <span className="text-3xl font-bold text-gray-900 tabular-nums">{currentActivity.estimatedCalories || Math.floor(currentActivity.durationSeconds * 0.1)}<span className="text-sm text-gray-400 font-medium ml-1">kcal</span></span>
          </div>
        </div>

        {/* Form elements */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">¿Cómo te sentiste?</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button 
                key={level}
                onClick={() => setEffort(level)}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold text-lg transition-colors border",
                  effort === level 
                    ? "bg-[#D4F87A] text-[#1a2e00] border-[#D4F87A] shadow-md" 
                    : "bg-white text-gray-400 border-gray-200"
                )}
              >
                {level === 1 && '🥱'}
                {level === 2 && '🙂'}
                {level === 3 && '😎'}
                {level === 4 && '🥵'}
                {level === 5 && '💀'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Notas</h3>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Cómo estuvo el clima? ¿Alguna molestia?"
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 min-h-[100px] text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#D4F87A] focus:border-transparent transition-shadow"
          />
        </div>

        <div className="flex gap-3 mt-auto">
          <button 
            onClick={() => {
              discardActivity();
              router.push('/workout');
            }}
            className="flex-1 py-4 font-bold text-red-600 bg-red-50 rounded-2xl active:scale-95 transition-transform"
          >
            Descartar
          </button>
          <button 
            onClick={async () => {
              endActivity(effort, 'normal', notes);
              
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const finished = useAppStore.getState().activities.slice(-1)[0];
              if (finished && finished.status === 'completed') {
                createActivityLog(finished).catch(console.error);
              }
              
              router.push('/workout');
            }}
            className="flex-[2] py-4 font-bold text-white bg-gray-900 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Guardar Actividad
          </button>
        </div>
      </div>
    );
  }

  // STATE 2: DURING ACTIVITY (active or paused)
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* Solid abstract background */}
      <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-b from-gray-800 to-black" />
      
      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="flex justify-between items-center pt-8 mb-6">
          {isGpsActive ? (
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex gap-2 items-center text-xs font-semibold text-[#D4F87A] border border-white/10">
              <MapPin size={12} /> GPS Activo
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex gap-2 items-center text-xs font-semibold text-[#D4F87A] border border-white/10">
              <Dumbbell size={12} /> Modo Indoor
            </div>
          )}
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex gap-2 items-center text-xs font-semibold text-white border border-white/10">
            <Zap size={12} className="text-[#D4F87A]" /> {getLabel(currentActivity.type)}
          </div>
        </div>

        {isGpsActive && (
          <div className="flex justify-center mb-4">
            <button 
              onClick={() => setShowMap(true)}
              className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full text-sm font-bold text-[#D4F87A] flex items-center gap-2 border border-white/10 active:scale-95 transition-all"
            >
              <MapPin size={16} /> Ver mapa en vivo
            </button>
          </div>
        )}

        {isGpsActive ? (
          <LiveActivityStats elapsedSeconds={currentActivity.durationSeconds} distanceMeters={currentActivity.distanceMeters} />
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center mb-8">
            <div className="text-[5rem] font-bold leading-none tracking-tighter mb-12 drop-shadow-lg tabular-nums">
              {formatTime(currentActivity.durationSeconds)}
            </div>
            
            <div className="bg-black/40 backdrop-blur-md rounded-[32px] p-6 grid grid-cols-2 w-full gap-8 border border-white/10 relative mt-4">
              {restTimer !== null && restTimer > 0 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
                  <Clock size={12} /> Descanso: {restTimer}s
                </div>
              )}
               <>
                  <div className="text-center">
                    <span className="block text-4xl font-bold mb-1">{gymSets}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Series</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-4xl font-bold mb-1">{Math.floor(currentActivity.durationSeconds * 0.1)}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kcal</span>
                  </div>
                </>
            </div>
          </div>
        )}

        {/* Action Buttons for Gym mode */}
        {!isGpsActive && currentActivity.status === 'active' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={() => {
                setGymSets(s => s + 1);
                setRestTimer(90); // 90 seconds default rest
              }}
              className="bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/20 active:bg-white/20 transition-colors"
            >
              <Zap size={18} /> +1 Serie
            </button>
            <button 
              onClick={() => setRestTimer(timer => timer ? null : 60)}
              className="bg-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:bg-indigo-600 transition-colors"
            >
              <Clock size={18} /> {restTimer ? 'Parar' : '+ Descanso'}
            </button>
          </div>
        )}

        {/* Guided Routine Display */}
        {!isGpsActive && activeRoutine && currentActivity.status === 'active' && (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[28px] p-5 mb-6 text-left relative overflow-hidden">
            <h3 className="font-bold text-white mb-4 text-lg">Guía: {activeRoutine.name}</h3>
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {activeRoutine.exercises.map((routEx, idx) => {
                const exercise = ALL_EXERCISES.find(e => e.id === routEx.exerciseId);
                if (!exercise) return null;
                return (
                  <div key={idx} className="flex flex-col gap-1 bg-white/5 p-3 rounded-[16px] border border-white/10">
                     <span className="font-bold text-white text-sm">{idx + 1}. {exercise.name}</span>
                     <span className="text-xs text-white/60 font-medium">
                        {routEx.sets} series x {routEx.reps ? `${routEx.reps} reps` : `${routEx.duration}s`} {routEx.rest ? `· ${routEx.rest}s desc.` : ''}
                     </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-6 pb-24 mt-auto">
          {currentActivity.status === 'paused' ? (
            <>
               <button 
                onClick={() => {
                  useAppStore.setState({ 
                    currentActivity: { ...currentActivity, status: 'review' as any } 
                  });
                }}
                className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Square size={32} fill="white" />
              </button>
              <button 
                onClick={resumeActivity}
                className="w-20 h-20 bg-[#D4F87A] rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Play size={32} fill="currentColor" className="ml-1 text-gray-900" />
              </button>
            </>
          ) : (
            <button 
              onClick={pauseActivity}
              className="w-20 h-20 bg-[#D4F87A] rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <Pause size={32} fill="currentColor" className="text-gray-900" />
            </button>
          )}
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowMap(false)} />
          <div className="bg-gray-900 w-full max-w-lg aspect-square rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setShowMap(false)}
                className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
              >
                <Square size={16} className="rotate-45" />
              </button>
            </div>
            <RouteMap 
               geojson={{
                 type: 'LineString',
                 coordinates: currentActivity.route.map(p => [p.longitude, p.latitude])
               }} 
               isLive
            />
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
               <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-end">
                     <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Distancia</span>
                        <span className="text-2xl font-bold text-white">{(currentActivity.distanceMeters / 1000).toFixed(2)} km</span>
                     </div>
                     <div className="text-right">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiempo</span>
                        <span className="text-2xl font-bold text-white">{formatTime(currentActivity.durationSeconds)}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="p-6 bg-[#f8f9fa] min-h-full pb-32"><div className="animate-pulse flex space-x-4"></div></div>}>
      <ActivityContent />
    </Suspense>
  );
}
