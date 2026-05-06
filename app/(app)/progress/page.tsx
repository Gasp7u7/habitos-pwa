'use client';
import { calculateStreak, isThisWeek, isLastWeek, average } from '@/lib/metrics/streak';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Scale, Flame } from 'lucide-react';


interface WeightLog {
  id: string;
  weight_kg: number;
  logged_at: string;
}

export default function ProgressPage() {
  const { activities, water, meals, profile, fastingHistory } = useAppStore();
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [activeTab, setActiveTab] = useState<'peso'|'resumen'>('peso');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: true })
        .limit(30);
      if (data) setWeightHistory(data);
    };
    load();
  }, []);

  const completedActivities = activities.filter(a => a.status === 'completed');

  const totalDistance = completedActivities.reduce((sum, a) => sum + a.distanceMeters, 0) / 1000;
  const totalWaterLiters = water.reduce((sum, w) => sum + w.amountMl, 0) / 1000;
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalActivityMin = Math.floor(completedActivities.reduce((sum, a) => sum + a.durationSeconds, 0) / 60);

  const hours = Math.floor(totalActivityMin / 60);
  const mins = totalActivityMin % 60;

  const hasWeightInfo = weightHistory.length > 0;
  const lastWeight = hasWeightInfo ? weightHistory[weightHistory.length - 1].weight_kg : (profile.weightKg || 0);
  
  const prevWeight = weightHistory.length > 1
    ? weightHistory[weightHistory.length - 2].weight_kg
    : null;

  const weightDelta = prevWeight !== null
    ? parseFloat((lastWeight - prevWeight).toFixed(1))
    : null;
  
  const chartData = weightHistory.map(w => ({
    date: format(new Date(w.logged_at), 'd MMM', { locale: es }),
    peso: w.weight_kg
  }));

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Estadísticas</h1>
      
      {/* Custom Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-full mb-6 relative">
        <button 
          onClick={() => setActiveTab('peso')}
          className={`flex-1 flex justify-center py-2 text-xs font-bold rounded-full transition-all ${activeTab === 'peso' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          Peso
        </button>
        <button 
          onClick={() => setActiveTab('resumen')}
          className={`flex-1 flex justify-center py-2 text-xs font-bold rounded-full transition-all ${activeTab === 'resumen' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          Resumen
        </button>
      </div>
      
      {activeTab === 'peso' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-[40px] leading-none font-bold text-gray-900 flex items-baseline gap-1">{lastWeight} <span className="text-sm font-semibold text-gray-400 tracking-wider">Kg</span></h3>
                {weightDelta !== null && (
                  <span className={`text-sm font-bold ${
                    weightDelta < 0 ? 'text-green-500' :
                    weightDelta > 0 ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {weightDelta > 0 ? '+' : ''}{weightDelta} kg
                    {weightDelta < 0 ? ' ↓' : weightDelta > 0 ? ' ↑' : ' →'}
                  </span>
                )}
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <Scale size={20} className="text-indigo-600" />
              </div>
            </div>
            
            {hasWeightInfo ? (
              <div className="h-48 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      dy={10}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="peso" 
                      stroke="#4F46E5" 
                      strokeWidth={4} 
                      dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, fill: '#D4F87A', stroke: '#4F46E5' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border-t border-gray-100">
                 <span className="text-sm text-gray-400 font-medium">Registra tu peso para ver la gráfica</span>
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Logros e Insights</h2>
          
          <div className="bg-gray-900 rounded-[24px] p-5 mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
              RACHA DE ACTIVIDAD
            </p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-3xl font-bold tracking-tight text-[#D4F87A]">
                {calculateStreak(completedActivities)} días
              </p>
              <Flame size={28} className="text-orange-400" />
            </div>
            <p className="text-xs font-semibold text-gray-500 mt-2">
              {(() => {
                const streak = calculateStreak(completedActivities);
                return streak >= 30 ? '¡Un mes sin parar! Eres increíble.' :
                  streak >= 14 ? '¡Dos semanas consecutivas!' :
                  streak >= 7  ? '¡Una semana completa!' :
                  streak >= 3  ? '¡Buen arranque, no lo rompas!' :
                  streak > 0   ? 'Cada día cuenta.' :
                  'Registra una actividad para empezar tu racha.';
              })()}
            </p>
          </div>
    
          <div className="bg-white rounded-[24px] p-5 border border-gray-100">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">
              INSIGHT DE RITMO
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {(() => {
                const thisWeekActivities = completedActivities.filter(a => isThisWeek(new Date(a.startedAt)));
                const lastWeekActivities = completedActivities.filter(a => isLastWeek(new Date(a.startedAt)));
                
                const avgPaceThisWeek = average(thisWeekActivities.map(a => a.avgPaceSecondsPerKm).filter(Boolean));
                const avgPaceLastWeek = average(lastWeekActivities.map(a => a.avgPaceSecondsPerKm).filter(Boolean));
                
                const paceImprovement = avgPaceLastWeek > 0 
                  ? Math.round(((avgPaceLastWeek - avgPaceThisWeek) / avgPaceLastWeek) * 100) 
                  : null;
                  
                if (paceImprovement === null) return <span>Aún no hay suficientes datos para calcular tu mejora esta semana. ¡Sigue moviéndote!</span>;
                
                if (paceImprovement > 0) {
                  return <>Esta semana tu ritmo constante mejoró un <strong className="text-gray-900">{paceImprovement}%</strong>.</>;
                } else if (paceImprovement < 0) {
                  return <>Tu ritmo fue un <strong className="text-gray-900">{Math.abs(paceImprovement)}%</strong> más lento esta semana. ¡Tómalo con calma!</>;
                } else {
                  return <>Mantuviste tu ritmo exactamente igual que la semana pasada. ¡Qué consistencia!</>;
                }
              })()}
            </p>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex items-start gap-2">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">DISTANCIA</span>
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900 tabular-nums">{totalDistance.toFixed(1)}<span className="text-sm text-gray-400 font-medium ml-1">km</span></span>
              </div>
            </div>
    
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex items-start gap-2">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">HIDRATACIÓN</span>
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900 tabular-nums">{totalWaterLiters.toFixed(1)}<span className="text-sm text-gray-400 font-medium ml-1">L</span></span>
              </div>
            </div>
    
            <div className="bg-[#D4F87A] p-5 rounded-[24px] flex flex-col justify-between h-32">
              <div className="flex items-start gap-2">
                <div>
                  <span className="block text-[10px] font-bold text-[#1a2e00]/60 uppercase tracking-widest">CALORÍAS</span>
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-[#1a2e00] tabular-nums">
                  {totalCalories > 1000 ? (totalCalories / 1000).toFixed(1) : totalCalories}
                  {totalCalories > 1000 && <span className="text-sm text-[#1a2e00]/60 font-medium mx-0.5">K</span>}
                  <span className="text-sm text-[#1a2e00]/60 font-medium">kcal</span>
                </span>
              </div>
            </div>
    
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex items-start gap-2">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">ACTIVIDAD</span>
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900 tabular-nums">{hours > 0 ? `${hours}h ` : ''}{mins}m</span>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Totales Históricos</h2>
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-sm font-semibold text-gray-500">Actividades completadas</span>
                <span className="text-lg font-bold text-gray-900">{completedActivities.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-sm font-semibold text-gray-500">Distancia GPS</span>
                <span className="text-lg font-bold text-gray-900">{(completedActivities.filter(a => ['walk', 'run', 'cycling'].includes(a.type)).reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000).toFixed(1)} <span className="text-xs text-gray-400">km</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-sm font-semibold text-gray-500">Días con comidas</span>
                <span className="text-lg font-bold text-gray-900">{new Set(meals.map(m => format(new Date(m.loggedAt), 'yyyy-MM-dd'))).size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-500">Ayunos completados</span>
                <span className="text-lg font-bold text-gray-900">{fastingHistory?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
