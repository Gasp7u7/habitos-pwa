'use client';
import { BarChart3, Activity, Droplet, Flame, Trophy } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function ProgressPage() {
  const { activities, water, meals, profile } = useAppStore();

  const totalDistance = activities.reduce((sum, a) => sum + a.distanceMeters, 0) / 1000;
  const totalWaterLiters = water.reduce((sum, w) => sum + w.amountMl, 0) / 1000;
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalActivityMin = Math.floor(activities.reduce((sum, a) => sum + a.durationSeconds, 0) / 60);

  const hours = Math.floor(totalActivityMin / 60);
  const mins = totalActivityMin % 60;

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Estadísticas</h1>
      
      {/* Visual Chart Placeholder like Image 1 */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Calorías</h2>
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-[40px] leading-none font-bold text-gray-900 flex items-baseline gap-1">{totalCalories} <span className="text-sm font-semibold text-gray-400 tracking-wider">Kcal</span></h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">Objetivo: {profile.dailyGoals.calories} Kcal</span>
        </div>
        
        {/* Fake chart matching Image 1 */}
        <div className="flex items-end justify-between h-40 mb-4 pb-2 border-b border-gray-100">
          <div className="w-10 h-12 bg-gray-100 rounded-t-xl group relative"><span className="absolute -top-6 text-[10px] text-gray-400 font-bold w-full text-center">44%</span></div>
          <div className="w-10 h-8 bg-gray-100 rounded-t-xl group relative"><span className="absolute -top-6 text-[10px] text-gray-400 font-bold w-full text-center">34%</span></div>
          <div className="w-10 h-32 bg-[#D4F87A] rounded-t-xl group relative"><span className="absolute -top-6 text-[10px] text-gray-900 font-bold w-full text-center">110%</span></div>
          <div className="w-10 h-16 bg-gray-100 rounded-t-xl group relative"><span className="absolute -top-6 text-[10px] text-gray-400 font-bold w-full text-center">47%</span></div>
          <div className="w-10 h-10 bg-gray-100 rounded-t-xl group relative"><span className="absolute -top-6 text-[10px] text-gray-400 font-bold w-full text-center">32%</span></div>
          <div className="w-10 h-24 bg-[#D4F87A] opacity-60 rounded-t-xl group relative"><span className="absolute -top-6 text-[10px] text-gray-900 font-bold w-full text-center">79%</span></div>
          <div className="w-10 h-6 bg-gray-100 rounded-t-xl group relative"><span className="absolute -top-6 text-[10px] text-gray-400 font-bold w-full text-center">24%</span></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
          <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
        </div>
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
