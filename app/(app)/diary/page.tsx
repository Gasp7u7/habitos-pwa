'use client';
import { useAppStore } from '@/lib/store';
import { Utensils, Droplet, Flame, Trash2, Clock, Sparkles, Settings } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import NutritionSettings from '@/components/profile/NutritionSettings';
import { cn } from '@/lib/utils';

export default function DiaryPage() {
  const { meals, water, deleteMeal, deleteWater, profile, currentFast, startFast, endFast } = useAppStore();
  const [fastingProgress, setFastingProgress] = useState(0);
  const [fastingElapsedStr, setFastingElapsedStr] = useState('00:00');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Sort by latest
  const sortedMeals = [...meals].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  const sortedWater = [...water].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalWater = water.reduce((sum, w) => sum + w.amountMl, 0);
  
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  useEffect(() => {
    if (!currentFast) return;
    
    const updateFasting = () => {
      const start = new Date(currentFast.startedAt);
      const now = new Date();
      const elapsedMins = differenceInMinutes(now, start);
      const targetMins = currentFast.targetHours * 60;
      
      const pct = Math.min(100, Math.max(0, (elapsedMins / targetMins) * 100));
      setFastingProgress(pct);
      
      const hours = Math.floor(elapsedMins / 60);
      const mins = elapsedMins % 60;
      setFastingElapsedStr(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    };
    
    updateFasting();
    const interval = setInterval(updateFasting, 60000); // update every minute
    return () => clearInterval(interval);
  }, [currentFast]);

  const handleToggleFast = () => {
    if (currentFast) {
      endFast('completed'); // simple abstraction for now
    } else {
      let target = 16;
      if (profile.fastingSchedule === '12:12') target = 12;
      if (profile.fastingSchedule === '14:10') target = 14;
      if (profile.fastingSchedule === '16:8') target = 16;
      if (profile.fastingSchedule === 'omad') target = 23;
      startFast(target);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
      <div className="flex justify-between items-center mb-2 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Comidas</h1>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-transform shadow-sm"
        >
          <Settings size={20} />
        </button>
      </div>
      <p className="text-gray-500 font-medium text-sm mb-6 capitalize">{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</p>

      <NutritionSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Fasting Tracker */}
      {profile.fastingSchedule !== 'none' && (
        <div className="bg-gray-900 rounded-[32px] p-6 shadow-sm mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <Clock size={18} className={currentFast ? "text-[#D4F87A]" : "text-gray-400"} />
              </div>
              <div>
                <span className="font-bold text-white block">Ayuno {profile.fastingSchedule}</span>
                <span className="text-gray-400 text-xs font-semibold">{currentFast ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
            <button 
              onClick={handleToggleFast}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                currentFast 
                  ? "bg-[#D4F87A] text-gray-900" 
                  : "bg-white text-gray-900"
              }`}
            >
              {currentFast ? 'Detener' : 'Iniciar'}
            </button>
          </div>
          
          {currentFast ? (
            <div className="relative z-10 bg-gray-800 rounded-2xl p-4 mt-2">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-2xl font-bold text-white tracking-tight">{fastingElapsedStr}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Transcurrido</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#D4F87A]">{currentFast.targetHours}h</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Objetivo</div>
                </div>
              </div>
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-[#D4F87A] rounded-full transition-all duration-1000"
                  style={{ width: `${fastingProgress}%` }}
                />
              </div>
            </div>
          ) : (
             <div className="relative z-10 bg-gray-800 rounded-2xl p-4 mt-2">
                <p className="text-sm text-gray-400">Prepara tu próximo periodo de ayuno. ¡Tú puedes!</p>
             </div>
          )}
        </div>
      )}

      {/* Macros Overview */}
      <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proteína</div>
            <div className="font-bold text-2xl text-gray-900">{totalProtein}<span className="text-xs font-semibold text-gray-400 ml-0.5">g</span></div>
          </div>
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Carbos</div>
            <div className="font-bold text-2xl text-gray-900">{totalCarbs}<span className="text-xs font-semibold text-gray-400 ml-0.5">g</span></div>
          </div>
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grasas</div>
            <div className="font-bold text-2xl text-gray-900">{totalFat}<span className="text-xs font-semibold text-gray-400 ml-0.5">g</span></div>
          </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
         <div className="bg-[#D4F87A] rounded-[24px] p-5 shadow-none border border-transparent flex flex-col justify-between">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#1a2e00]/60 mb-4">CALORÍAS</div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-3xl font-bold text-[#1a2e00] leading-none tabular-nums mt-1 block">{totalCalories}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center">
                <Flame size={16} className="text-[#1a2e00]" />
              </div>
            </div>
            <div className="text-xs font-medium text-[#1a2e00]/60 mt-2">kcal / {profile.dailyGoals.calories}</div>
         </div>
         <div className="bg-white rounded-[24px] p-5 shadow-none border border-gray-100 flex flex-col justify-between">
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">HIDRATACIÓN</div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-3xl font-bold text-gray-900 leading-none tabular-nums mt-1 block">{totalWater}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Droplet size={16} className="text-blue-500" />
              </div>
            </div>
            <div className="text-xs font-medium text-gray-400 mt-2">ml / {profile.dailyGoals.waterMl}</div>
         </div>
      </div>

      {/* Meals Section */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Diario de Comidas</h2>
      {sortedMeals.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-[32px] border border-dashed border-gray-200 mb-8">No has registrado comidas hoy.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {sortedMeals.map(meal => (
            <div key={meal.id} className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm flex items-center group relative">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-4 relative overflow-hidden">
                <img src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80`} alt="Food" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0 pr-10">
                <h4 className="font-bold text-gray-900 text-base truncate">{meal.name}</h4>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                  <span>{format(new Date(meal.loggedAt), 'HH:mm')}</span>
                  <span>•</span>
                  <span>{meal.isAiGenerated ? 'IA' : 'Manual'}</span>
                  <span>•</span>
                  <span className="text-gray-500">{meal.protein}g P</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-bold text-gray-900 text-lg leading-none">{meal.calories}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">kcal</span>
              </div>
              <button 
                onClick={() => deleteMeal(meal.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity absolute right-4"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Water Section */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Hidratación</h2>
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">OBJETIVO</div>
            <div className="font-bold text-2xl text-gray-900">{totalWater}<span className="text-sm font-medium text-gray-400 ml-1">/ {profile.dailyGoals.waterMl} ml</span></div>
            <div className="text-xs font-semibold text-gray-500 mt-1">Vasos de {profile.glassSizeMl || 250}ml</div>
          </div>
          <button 
            onClick={() => useAppStore.getState().addWater()}
            className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <Droplet size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Glasses visualizer */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: Math.max(Math.ceil(profile.dailyGoals.waterMl / (profile.glassSizeMl || 250)), Math.floor(totalWater / (profile.glassSizeMl || 250))) }).map((_, i) => {
            const glassesDrunk = Math.floor(totalWater / (profile.glassSizeMl || 250));
            const isDrunk = i < glassesDrunk;
            return (
              <div 
                key={i} 
                className={cn(
                  "w-8 h-10 rounded-b-xl rounded-t-sm transition-all duration-300 relative overflow-hidden flex-shrink-0 cursor-pointer",
                  isDrunk ? "bg-blue-100" : "bg-gray-100"
                )}
                onClick={() => {
                  if (isDrunk) {
                    // removing the last glass
                    const recentWater = sortedWater[0];
                    if (recentWater) deleteWater(recentWater.id);
                  } else {
                    useAppStore.getState().addWater();
                  }
                }}
              >
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-500",
                    isDrunk ? "h-full opacity-100" : "h-0 opacity-0"
                  )} 
                />
              </div>
            );
          })}
        </div>

        {sortedWater.length === 0 ? (
          <p className="text-xs text-gray-400 text-center font-medium">No has registrado agua hoy.</p>
        ) : (
          <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
            {sortedWater.map(w => (
              <div key={w.id} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{format(new Date(w.loggedAt), 'HH:mm')}</div>
                  <div className="font-bold text-sm text-gray-900">+{w.amountMl}ml</div>
                </div>
                <button 
                  onClick={() => deleteWater(w.id)}
                  className="p-2 text-red-500 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
