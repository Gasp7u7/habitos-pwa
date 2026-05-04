'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { format, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Page, PageContent, List, ListItem, SwipeoutActions, SwipeoutButton, f7 } from 'framework7-react';
import { useRouter } from 'next/navigation';

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

  // Stats calculation
  const thisWeekActivities = activities.filter(a => isThisWeek(new Date(a.startedAt)));
  const weeklyDistance = thisWeekActivities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000;
  const weeklyDuration = thisWeekActivities.reduce((sum, a) => sum + (a.durationSeconds || 0), 0);

  const isGpsRequired = selectedType !== 'gym';

  useEffect(() => {
    if (isGpsRequired && 'geolocation' in navigator) {
      setGpsReady(false);
      navigator.geolocation.getCurrentPosition(
        () => setGpsReady(true),
        () => setGpsReady(false),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else if (!isGpsRequired) {
      setGpsReady(true);
    }
  }, [selectedType, isGpsRequired]);

  const handleStartActivity = () => {
    setActiveRoutine(null);
    router.push(`/activity?type=${selectedType}`);
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
      case 'walk': return 'figure.walk';
      case 'run': return 'figure.run';
      case 'cycling': return 'bicycle';
      case 'gym': return 'dumbbell.fill';
      default: return 'figure.run';
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

  const deleteActivityUI = (id: string) => {
    // Ideally map deleteActivity from store
    useAppStore.setState(state => ({
      activities: state.activities.filter(a => a.id !== id)
    }));
  };

  return (
    <Page className="bg-[#f8f9fa]">
      <PageContent className="p-6 min-h-full pb-32">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Entreno</h1>

        {/* Sub-tab selector (pills horizontales) */}
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
              <p className="font-bold text-sm text-gray-900">{gpsReady ? "GPS listo" : "Buscando señal GPS..."}</p>
            </div>
          </div>
        )}

        {/* Card de inicio */}
        <div className="bg-[#D4F87A] rounded-[32px] p-6 mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#1a2e00] text-[#D4F87A] flex items-center justify-center mb-4 shadow-sm">
            <i className="f7-icons text-3xl">{getIcon(selectedType)}</i>
          </div>
          <h2 className="text-xl font-bold text-[#1a2e00] mb-6">¿Listo para {selectedType === 'walk' ? 'caminar' : selectedType === 'run' ? 'correr' : selectedType === 'gym' ? 'entrenar' : 'pedalear'}?</h2>
          
          <button 
            onClick={handleStartActivity}
            disabled={isGpsRequired && !gpsReady}
            className="bg-[#1a2e00] text-white font-bold w-full py-4 rounded-full active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
          >
            <i className="f7-icons text-lg">play.fill</i>
            Iniciar {selectedType === 'walk' ? 'caminata' : selectedType === 'run' ? 'carrera' : selectedType === 'gym' ? 'entrenamiento' : 'ruta'}
          </button>
        </div>

        {/* Stats Semanales */}
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-lg font-bold text-gray-900">Esta semana</h2>
        </div>
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sesiones</div>
              <div className="font-bold text-lg text-gray-900 tabular-nums">{thisWeekActivities.length}</div>
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

        {/* Historial */}
        <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Historial</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-3xl border border-dashed border-gray-200">No hay entrenamientos guardados.</p>
        ) : (
          <List mediaList className="mb-8">
            {activities.slice().reverse().map(activity => {
              const isGpsActivity = ['walk', 'run', 'cycling'].includes(activity.type);
              
              return (
                <ListItem
                  key={activity.id}
                  swipeout
                  onSwipeoutDeleted={() => deleteActivityUI(activity.id)}
                  className="bg-white rounded-3xl mb-4 border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div slot="content" className="w-full">
                    {/* Header */}
                    <div className="p-4 py-3 flex items-center justify-between border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getIconColor(activity.type))}>
                          <i className="f7-icons text-xl">{getIcon(activity.type)}</i>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{getLabel(activity.type)}</h3>
                          <p className="text-[10px] font-bold uppercase text-gray-400">
                            {format(new Date(activity.startedAt), "d MMM, HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
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

                    {/* Map/Image */}
                    {isGpsActivity && (
                      <div className="w-full h-32 bg-gray-100 flex relative overflow-hidden pointer-events-none mt-1">
                        {activity.route && activity.route.length >= 2 ? (
                            <RouteMap geojson={{
                              type: 'LineString',
                              coordinates: activity.route.map(p => [p.longitude, p.latitude])
                            }} />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-gray-400 font-medium text-xs">Sin mapa</span>
                            </div>
                        )}
                      </div>
                    )}
                  </div>

                  <SwipeoutActions right>
                    <SwipeoutButton
                      delete
                      confirmText="¿Eliminar esta actividad?"
                      color="red"
                    >
                      <i className="f7-icons text-white">trash.fill</i>
                    </SwipeoutButton>
                  </SwipeoutActions>
                </ListItem>
              );
            })}
          </List>
        )}
      </PageContent>
    </Page>
  );
}
