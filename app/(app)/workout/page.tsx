'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { format, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Footprints, Activity, Bike, Dumbbell, Play, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


import { getRecentActivities } from '@/lib/supabase/logs';
import { createClient } from '@/lib/supabase/client';

const RouteMap = dynamic(() => import('@/components/gps/RouteMap'), { ssr: false, loading: () => (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
    <span className="text-gray-400 font-medium text-sm">Cargando mapa...</span>
  </div>
) });

export default function WorkoutPage() {
  const { activities, setActiveRoutine, currentActivity } = useAppStore();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'walk' | 'run' | 'gym' | 'cycling'>('walk');
  const [gpsReady, setGpsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats calculation
  const completedActivities = activities.filter(a => a.status === 'completed');
  const thisWeekActivities = completedActivities.filter(a => isThisWeek(new Date(a.startedAt)));
  const thisWeekCount = thisWeekActivities.length;
  const weeklyDistance = thisWeekActivities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000;
  const weeklyDuration = thisWeekActivities.reduce((sum, a) => sum + (a.durationSeconds || 0), 0);

  const isGpsRequired = selectedType !== 'gym';

  useEffect(() => {
    if (isGpsRequired && 'geolocation' in navigator) {
      // Simplemente verificamos si existe la API, no bloqueamos el botón por un timeout
      setGpsReady(true);
    } else if (!isGpsRequired) {
      setGpsReady(true);
    } else {
      setGpsReady(false);
    }
  }, [selectedType, isGpsRequired]);

  const handleStartActivity = () => {
    setActiveRoutine(null);
    router.push(`/activity?type=${selectedType}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await getRecentActivities(user.id, 30);
      if (data && data.length > 0) {
        const mapped = data.map(a => ({
          id: a.id,
          userId: a.user_id,
          type: a.type as any,
          source: (a.source || 'manual') as any,
          status: (a.status || 'completed') as any,
          startedAt: a.started_at,
          endedAt: a.ended_at || a.started_at,
          durationSeconds: a.duration_seconds || 0,
          movingTimeSeconds: a.duration_seconds || 0,
          distanceMeters: a.distance_meters || 0,
          avgPaceSecondsPerKm: a.avg_pace_seconds_per_km || 0,
          avgSpeedKmh: a.avg_speed_kmh || 0,
          estimatedCalories: a.estimated_calories || 0,
          elevationGainMeters: (a as any).elevation_gain_meters || 0,
          perceivedEffort: a.perceived_effort as any,
          mood: a.mood as any,
          notes: a.notes || undefined,
          route: (a as any).gps_routes?.[0]?.route_geojson?.coordinates?.map(
            (c: number[]) => ({ longitude: c[0], latitude: c[1] })
          ) || [],
          createdAt: a.created_at || a.started_at,
          updatedAt: a.updated_at || a.started_at,
        }));

        useAppStore.setState({ activities: mapped });
      }
    } catch { /* silencioso */ }
    finally { setIsRefreshing(false); }
  };

  const deleteActivity = (id: string) => {
    if (confirm('¿Eliminar esta actividad?')) {
        useAppStore.setState(state => ({
          activities: state.activities.filter(a => a.id !== id)
        }));
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'walk': return 'Caminata';
      case 'run': return 'Running';
      case 'cycling': return 'Ciclismo';
      case 'gym': return 'Entrenamiento Gym';
      default: return 'Actividad';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'walk': return <Footprints size={32} />;
      case 'run': return <Activity size={32} />;
      case 'cycling': return <Bike size={32} />;
      case 'gym': return <Dumbbell size={32} />;
      default: return <Activity size={32} />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'walk': return 'text-purple-600 bg-purple-50';
      case 'run': return 'text-orange-600 bg-orange-50';
      case 'cycling': return 'text-sky-600 bg-sky-50';
      case 'gym': return 'text-gray-900 bg-gray-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatPace = (seconds: number) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}/km`;
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-full flex flex-col">
        <div className="flex-1 p-6 pb-32">
            <div className="flex justify-between items-center mb-6 pt-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Entreno</h1>
                <button 
                  onClick={handleRefresh}
                  className={cn("p-2 text-gray-400 hover:text-gray-900 transition-all", isRefreshing && "animate-spin text-gray-900")}
                >
                    <Activity size={20} />
                </button>
            </div>

            {/* Sub-tab selector */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x mb-6 pb-1">
            {(['walk', 'run', 'gym', 'cycling'] as const).map(f => (
                <button
                key={f}
                onClick={() => setSelectedType(f)}
                className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-bold snap-start whitespace-nowrap transition-colors",
                    selectedType === f 
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200"
                )}
                >
                {f === 'walk' ? 'Caminar' : f === 'run' ? 'Correr' : f === 'gym' ? 'Gym' : 'Ciclismo'}
                </button>
            ))}
            </div>

            {/* Card de estado GPS */}
            {isGpsRequired && (
            <div className="bg-white rounded-3xl p-4 mb-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-50">
                {gpsReady ? (
                    <>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 absolute" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping absolute opacity-75" />
                    </>
                ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 absolute" />
                )}
                </div>
                <div>
                <p className="font-bold text-sm text-gray-900">{gpsReady ? "GPS Activado" : "Habilita el GPS para ver tu ruta"}</p>
                <p className="text-[10px] text-gray-400 font-medium">{gpsReady ? "Listo para capturar tu ruta al iniciar" : "Necesitamos tu ubicación"}</p>
                </div>
            </div>
            )}

            {/* Card de inicio */}
            <div className="bg-[#D4F87A] rounded-[32px] p-6 mb-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#1a2e00] text-[#D4F87A] flex items-center justify-center mb-4 shadow-sm">
                    {getIcon(selectedType)}
                </div>
                <h2 className="text-xl font-bold text-[#1a2e00] mb-6">¿Listo para {selectedType === 'walk' ? 'caminar' : selectedType === 'run' ? 'correr' : selectedType === 'gym' ? 'entrenar' : 'pedalear'}?</h2>
                
                <button 
                    onClick={handleStartActivity}
                    disabled={isGpsRequired && !gpsReady}
                    className="bg-[#1a2e00] text-white font-bold w-full py-4 rounded-full active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 shadow-lg shadow-[#1a2e00]/20"
                >
                    <Play size={18} fill="white" />
                    Iniciar {selectedType === 'walk' ? 'caminata' : selectedType === 'run' ? 'carrera' : selectedType === 'gym' ? 'entrenamiento' : 'ruta'}
                </button>
            </div>

            {/* Stats Semanales */}
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-lg font-bold text-gray-900">Esta semana</h2>
                <Link href="/workouts" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
                    Ver todo el historial
                </Link>
            </div>
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-3 gap-2">
                    <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sesiones</div>
                    <div className="font-bold text-lg text-gray-900 tabular-nums">{thisWeekCount}</div>
                    </div>
                    <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiempo</div>
                    <div className="font-bold text-lg text-gray-900 tabular-nums">{formatDuration(weeklyDuration)}</div>
                    </div>
                    <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Distancia</div>
                    <div className="font-bold text-lg text-gray-900 tabular-nums">{weeklyDistance.toFixed(1)} <span className="text-xs text-gray-400">km</span></div>
                    </div>
                </div>
            </div>

            {/* Historial Corto */}
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Historial reciente</h2>
            {completedActivities.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-8 text-center">
                    <Activity size={48} className="text-gray-200 block mx-auto mb-3" />
                    <p className="font-bold text-gray-500 mb-1">Sin actividades todavía</p>
                    <p className="text-sm text-gray-400 mb-4">Completa tu primera sesión para verla aquí</p>
                    <button
                        onClick={handleStartActivity}
                        className="bg-[#D4F87A] text-[#1a2e00] font-bold px-6 py-2.5 rounded-full text-sm active:scale-95 transition-transform"
                    >
                        Iniciar ahora
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {completedActivities.slice().reverse().slice(0, 5).map(activity => {
                        const isGpsActivity = ['walk', 'run', 'cycling'].includes(activity.type);
                        
                        return (
                            <motion.div
                                key={activity.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-4 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getIconColor(activity.type))}>
                                            {activity.type === 'walk' ? <Footprints size={20} /> : 
                                            activity.type === 'run' ? <Activity size={20} /> : 
                                            activity.type === 'cycling' ? <Bike size={20} /> : 
                                            <Dumbbell size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{getLabel(activity.type)}</h3>
                                            <p className="text-[10px] font-bold uppercase text-gray-400">
                                                {format(new Date(activity.startedAt), "d MMM, HH:mm", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => deleteActivity(activity.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="px-4 py-3 grid grid-cols-3 gap-2">
                                    {isGpsActivity ? (
                                        <>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dist.</div>
                                                <div className="font-bold text-base text-gray-900 tabular-nums">{(activity.distanceMeters / 1000).toFixed(2)}<span className="text-[10px] text-gray-400 ml-0.5">km</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ritmo</div>
                                                <div className="font-bold text-base text-gray-900 tabular-nums">{formatPace(activity.avgPaceSecondsPerKm)}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Calorías</div>
                                                <div className="font-bold text-base text-gray-900 tabular-nums">{activity.estimatedCalories || Math.floor(activity.durationSeconds * 0.1)}<span className="text-[10px] text-gray-400 ml-0.5">kcal</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Intens.</div>
                                                <div className="font-bold text-base text-gray-900 tabular-nums">{activity.perceivedEffort || 3}<span className="text-[10px] text-gray-400 ml-0.5">/5</span></div>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiempo</div>
                                        <div className="font-bold text-base text-gray-900 tabular-nums">{formatDuration(activity.durationSeconds)}</div>
                                    </div>
                                </div>

                                {isGpsActivity && activity.route && activity.route.length >= 2 && (
                                    <div className="w-full h-32 bg-gray-50 flex relative overflow-hidden pointer-events-none mt-1">
                                        <RouteMap geojson={{
                                            type: 'LineString',
                                            coordinates: activity.route.map(p => [p.longitude, p.latitude])
                                        }} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
}
