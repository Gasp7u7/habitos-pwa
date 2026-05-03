'use client';
import { useState } from 'react';
import { Activity, Droplet, Flame, MapPin, Map, Share2, MapIcon, PersonStanding, Dumbbell, Bike, Clock, ChevronRight, Trophy, Target, BookOpen } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { format, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import ExerciseLibrary from '@/components/workouts/ExerciseLibrary';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/gps/RouteMap'), { ssr: false, loading: () => (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
    <span className="text-gray-400 font-medium text-sm">Cargando mapa...</span>
  </div>
) });

export default function WorkoutsPage() {
  const { activities } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'walk' | 'run' | 'gym' | 'cycling'>('all');
  const [activeTab, setActiveTab] = useState<'history' | 'library'>('history');

  // Stats calculation
  const filteredActivities = activities.filter(a => filter === 'all' || a.type === filter);
  
  const thisWeekActivities = activities.filter(a => isThisWeek(new Date(a.startedAt)));
  const weeklyDistance = thisWeekActivities.reduce((sum, a) => sum + a.distanceMeters, 0) / 1000;
  const weeklyDuration = thisWeekActivities.reduce((sum, a) => sum + a.durationSeconds, 0);
  const weeklyCalories = thisWeekActivities.reduce((sum, a) => sum + (a.estimatedCalories || Math.floor(a.durationSeconds * 0.1)), 0);

  const getIcon = (type: string) => {
    switch (type) {
      case 'walk': return <PersonStanding size={24} className="text-purple-600" />;
      case 'run': return <Activity size={24} className="text-red-600" />;
      case 'cycling': return <Bike size={24} className="text-sky-600" />;
      case 'gym': return <Dumbbell size={24} className="text-slate-700" />;
      default: return <Activity size={24} className="text-gray-600" />;
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
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Entrenamientos</h1>

      {/* Tabs */}
      <div className="bg-gray-100 p-1 rounded-2xl flex mb-6">
        <button
          className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors", activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </button>
        <button
          className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors", activeTab === 'library' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
          onClick={() => setActiveTab('library')}
        >
          <BookOpen size={16} /> Biblioteca
        </button>
      </div>

      {activeTab === 'history' ? (
        <>
          {/* Stats Summary */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
          <div>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Esta Semana</h3>
            <div className="text-3xl font-bold text-gray-900 mt-1 flex items-baseline gap-1">
              {thisWeekActivities.length} <span className="text-sm font-semibold text-gray-400">sesiones</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-[#D4F87A] rounded-full flex items-center justify-center text-[#1a2e00]">
            <Trophy size={20} />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiempo</div>
            <div className="font-bold text-lg text-gray-900 tabular-nums">{formatDuration(weeklyDuration)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Distancia</div>
            <div className="font-bold text-lg text-gray-900 tabular-nums">{weeklyDistance.toFixed(1)} <span className="text-xs text-gray-400">km</span></div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Calorías</div>
            <div className="font-bold text-lg text-gray-900 tabular-nums">{weeklyCalories} <span className="text-xs text-gray-400">kcal</span></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x mb-6 pb-1">
        {(['all', 'run', 'gym', 'cycling', 'walk'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-bold snap-start whitespace-nowrap transition-colors",
              filter === f 
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200"
            )}
          >
            {f === 'all' ? 'Todo' : getLabel(f)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredActivities.slice().reverse().map(activity => {
          const isGpsActivity = ['walk', 'run', 'cycling'].includes(activity.type);
          
          return (
            <div key={activity.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
              {/* Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    activity.type === 'walk' ? 'bg-purple-50' : 
                    activity.type === 'run' ? 'bg-red-50' :
                    activity.type === 'cycling' ? 'bg-sky-50' : 'bg-slate-100'
                  }`}>
                    {getIcon(activity.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{getLabel(activity.type)}</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                      {format(new Date(activity.startedAt), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-5 pb-4 grid grid-cols-3 gap-2 border-b border-gray-50">
                {isGpsActivity ? (
                  <>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Distancia</div>
                      <div className="font-bold text-xl text-gray-900 tabular-nums">{(activity.distanceMeters / 1000).toFixed(2)}<span className="text-xs text-gray-400 ml-0.5">km</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ritmo</div>
                      <div className="font-bold text-xl text-gray-900 tabular-nums">{formatPace(activity.avgPaceSecondsPerKm)}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Calorías</div>
                      <div className="font-bold text-xl text-gray-900 tabular-nums">{activity.estimatedCalories || Math.floor(activity.durationSeconds * 0.1)}<span className="text-xs text-gray-400 ml-0.5">kcal</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Intensidad</div>
                      <div className="font-bold text-xl text-gray-900 tabular-nums">{activity.perceivedEffort || 3}<span className="text-xs text-gray-400 ml-0.5">/5</span></div>
                    </div>
                  </>
                )}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiempo</div>
                  <div className="font-bold text-xl text-gray-900 tabular-nums">{formatDuration(activity.durationSeconds)}</div>
                </div>
              </div>

              {/* Map/Image */}
              {isGpsActivity && (
                <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                  {activity.route && activity.route.length >= 2 ? (
                     <div className="w-full h-full pointer-events-none">
                       <RouteMap geojson={{
                         type: 'LineString',
                         coordinates: activity.route.map(p => [p.longitude, p.latitude])
                       }} />
                     </div>
                  ) : (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-400 font-medium text-xs">Sin mapa</span>
                     </div>
                  )}
                </div>
              )}
              
              {/* Footer Notes */}
              {activity.notes && (
                <div className="p-5 bg-gray-50/50">
                  <p className="text-sm font-medium text-gray-600">{activity.notes}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="bg-white rounded-[32px] p-8 text-center border border-gray-100 text-gray-500 shadow-sm mt-8">
            <Target className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-bold text-gray-900 mb-1">No hay entrenamientos</p>
            <p className="text-sm">Aún no has registrado actividades de este tipo.</p>
          </div>
        )}
      </div>
        </>
      ) : (
        <ExerciseLibrary />
      )}
    </div>
  );
}
