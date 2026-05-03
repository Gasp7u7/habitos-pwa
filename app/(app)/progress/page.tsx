'use client';
import { BarChart3, Activity, Droplet, Flame, Trophy, Scale } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeightLog {
  id: string;
  weight_kg: number;
  logged_at: string;
}

export default function ProgressPage() {
  const { activities, water, meals, profile } = useAppStore();
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);

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

  const totalDistance = activities.reduce((sum, a) => sum + a.distanceMeters, 0) / 1000;
  const totalWaterLiters = water.reduce((sum, w) => sum + w.amountMl, 0) / 1000;
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalActivityMin = Math.floor(activities.reduce((sum, a) => sum + a.durationSeconds, 0) / 60);

  const hours = Math.floor(totalActivityMin / 60);
  const mins = totalActivityMin % 60;

  // Process weight data for chart
  const hasWeightInfo = weightHistory.length > 0;
  const lastWeight = hasWeightInfo ? weightHistory[weightHistory.length - 1].weight_kg : (profile.weightKg || 0);
  const minWeight = hasWeightInfo ? Math.min(...weightHistory.map(w => w.weight_kg)) : 0;
  const maxWeight = hasWeightInfo ? Math.max(...weightHistory.map(w => w.weight_kg)) : 0;
  
  // Calculate heights (simple normalization between 20% and 100% of container)
  const range = maxWeight - minWeight || 1; 

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Estadísticas</h1>
      
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Peso</h2>
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-[40px] leading-none font-bold text-gray-900 flex items-baseline gap-1">{lastWeight} <span className="text-sm font-semibold text-gray-400 tracking-wider">Kg</span></h3>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
            <Scale size={18} className="text-indigo-600" />
          </div>
        </div>
        
        {hasWeightInfo ? (
          <>
            <div className="flex items-end justify-between h-40 mb-4 pb-2 border-b border-gray-100 w-full overflow-x-auto hide-scrollbar snap-x">
              {weightHistory.slice(-10).map((log, i) => {
                const percentage = minWeight === maxWeight ? 50 : 20 + ((log.weight_kg - minWeight) / range) * 80;
                return (
                  <div key={log.id} className="w-10 flex-shrink-0 flex flex-col justify-end items-center mx-1 group relative snap-center h-full">
                    <span className="absolute -top-6 text-[10px] text-gray-900 font-bold w-full text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {log.weight_kg}
                    </span>
                    <div 
                      className="w-full bg-[#D4F87A] rounded-t-xl transition-all" 
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
               {weightHistory.slice(-10).map((log, i) => (
                  <span key={i}>{format(new Date(log.logged_at), 'd MMM', { locale: es })}</span>
               ))}
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center border-t border-gray-100">
             <span className="text-sm text-gray-400 font-medium">Registra tu peso para ver la gráfica</span>
          </div>
        )}
      </div>
      
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

        <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-start gap-2">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">CALORÍAS</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900 tabular-nums">
              {totalCalories > 1000 ? (totalCalories / 1000).toFixed(1) : totalCalories}
              {totalCalories > 1000 && <span className="text-sm text-gray-400 font-medium mx-0.5">K</span>}
              <span className="text-sm text-gray-400 font-medium">kcal</span>
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

      {/* Streaks & Insights */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Logros e Insights</h2>
      
      <div className="bg-[#D4F87A] rounded-[24px] p-5 mb-3 shadow-[0_8px_24px_rgba(212,248,122,0.2)]">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#1a2e00]/60">
          RACHA
        </p>
        <p className="text-3xl font-bold tracking-tight text-[#1a2e00] mt-1">
          5 días 🔥
        </p>
      </div>

      <div className="bg-white rounded-[24px] p-5 border border-gray-100">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">
          INSIGHT DE RITMO
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Esta semana tu ritmo constante mejoró un <strong>5%</strong>.
        </p>
      </div>

    </div>
  );
}
