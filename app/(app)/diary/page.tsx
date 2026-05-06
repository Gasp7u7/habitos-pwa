'use client';
import { useAppStore } from '@/lib/store';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import NutritionSettings from '@/components/profile/NutritionSettings';
import AddMealModal from '@/components/modals/AddMealModal';
import { cn } from '@/lib/utils';
import { notifyFastingComplete } from '@/lib/notifications/inapp';
import { createClient } from '@/lib/supabase/client';
import { getTodayLogs } from '@/lib/supabase/logs';
import { Settings, Clock, Flame, Droplets, Trash2, Plus, Utensils, Pencil } from 'lucide-react';
import { MealEntry } from '@/lib/types';

export default function DiaryPage() {
  const { meals, water, deleteMeal, deleteWater, profile, currentFast, startFast, endFast, hydrateFromSupabase } = useAppStore();
  const [fastingProgress, setFastingProgress] = useState(0);
  const [fastingElapsedStr, setFastingElapsedStr] = useState('00:00');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [initialMealType, setInitialMealType] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack' | undefined>(undefined);
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'comidas' | 'agua'>('resumen');
  
  const todayStr = new Date().toISOString().split('T')[0];

  const todayMeals = meals.filter(m => m.loggedAt.startsWith(todayStr));
  const sortedWater = [...water]
    .filter(w => w.loggedAt.startsWith(todayStr))
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalWater = sortedWater.reduce((sum, w) => sum + w.amountMl, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

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
      if (elapsedMins >= targetMins && currentFast.status === 'active') {
        notifyFastingComplete(currentFast.targetHours);
        endFast('completed');
      }
    };
    updateFasting();
    const interval = setInterval(updateFasting, 60000);
    return () => clearInterval(interval);
  }, [currentFast, endFast]);

  const handleToggleFast = () => {
    if (currentFast) {
      endFast('early');
    } else {
      let target = 16;
      if (profile.fastingSchedule === '12:12') target = 12;
      if (profile.fastingSchedule === '14:10') target = 14;
      if (profile.fastingSchedule === '16:8') target = 16;
      if (profile.fastingSchedule === 'omad') target = 23;
      startFast(target);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsRefreshing(false); return; }
    try {
      const todayData = await getTodayLogs(user.id);
      const mappedWater = (todayData.water || []).map(w => ({
        id: w.id, userId: w.user_id, amountMl: w.amount_ml, loggedAt: w.logged_at || new Date().toISOString()
      }));
      const mappedMeals = (todayData.meals || []).map(m => ({
        id: m.id, userId: m.user_id, name: m.name, description: m.description || undefined,
        calories: m.calories, protein: m.protein_g || 0, carbs: m.carbs_g || 0, fat: m.fat_g || 0,
        loggedAt: m.logged_at || new Date().toISOString(), isAiGenerated: !!m.is_ai_generated,
        mealType: m.meal_type as any
      }));
      hydrateFromSupabase(mappedWater, mappedMeals, null, []);
    } catch (e) {
      console.error('Error refreshing data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32 overflow-y-auto">
      <div className="flex justify-between items-center mb-2 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Comidas</h1>
        <div className="flex gap-2">
          <button onClick={onRefresh} className={cn("w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-all shadow-sm", isRefreshing && "animate-spin opacity-50")}>
            <Clock size={18} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-transform shadow-sm">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 p-1.5 rounded-2xl flex mb-6 shadow-inner">
        <button
          className={cn("flex-1 py-2.5 text-xs font-bold rounded-xl transition-all", activeTab === 'resumen' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500')}
          onClick={() => setActiveTab('resumen')}
        >
          Resumen
        </button>
        <button
          className={cn("flex-1 py-2.5 text-xs font-bold rounded-xl transition-all", activeTab === 'comidas' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500')}
          onClick={() => setActiveTab('comidas')}
        >
          Comidas
        </button>
        <button
          className={cn("flex-1 py-2.5 text-xs font-bold rounded-xl transition-all", activeTab === 'agua' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500')}
          onClick={() => setActiveTab('agua')}
        >
          Agua
        </button>
      </div>

      <NutritionSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <p className="text-gray-500 font-medium text-sm mb-2 capitalize">{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</p>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-10">
              {/* Calorie Section */}
              <div className="flex-1 flex flex-col items-center border-r border-gray-100 pr-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform">
                    <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                    <circle 
                      cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" 
                      className="text-[#D4F87A] transition-all duration-1000 ease-out"
                      strokeDasharray={2 * Math.PI * 74}
                      strokeDashoffset={2 * Math.PI * 74 * (1 - Math.min(1, totalCalories / profile.dailyGoals.calories))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-gray-900 leading-none">
                      {Math.max(0, profile.dailyGoals.calories - totalCalories)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Restantes</span>
                  </div>
                </div>
                <div className="flex gap-6 mt-5 text-xs font-bold">
                  <div className="text-gray-900">{totalCalories} <span className="text-gray-400 font-medium">Cons.</span></div>
                  <div className="text-gray-200">|</div>
                  <div className="text-gray-900">{profile.dailyGoals.calories} <span className="text-gray-400 font-medium">Obj.</span></div>
                </div>
              </div>

              {/* Integrated Vertical Water Bar with Controls */}
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={() => useAppStore.getState().addWater()}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <Plus size={20} />
                </button>

                <div className="relative w-14 h-40 bg-blue-50 rounded-[24px] border border-blue-100 overflow-hidden flex flex-col justify-end shadow-inner">
                   <div 
                     className="bg-blue-400 w-full transition-all duration-1000 ease-out flex items-center justify-center"
                     style={{ height: `${Math.min(100, (totalWater / profile.dailyGoals.waterMl) * 100)}%` }}
                   >
                     {totalWater > 0 && <Droplets size={16} className="text-white opacity-80 mb-4" />}
                   </div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-sm font-black text-blue-700">
                        {totalWater}
                      </span>
                      <span className="text-[8px] font-bold text-blue-400 opacity-60">ml</span>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    if (sortedWater.length > 0) deleteWater(sortedWater[0].id);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center active:scale-90 transition-transform border border-gray-100"
                >
                  <div className="w-3 h-0.5 bg-gray-300 rounded-full" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Prot.', current: totalProtein, target: profile.dailyGoals.proteinG, color: 'bg-orange-500' },
              { label: 'Carb.', current: totalCarbs, target: profile.dailyGoals.carbsG, color: 'bg-blue-500' },
              { label: 'Gras.', current: totalFat, target: profile.dailyGoals.fatG, color: 'bg-yellow-500' },
            ].map((macro) => (
              <div key={macro.label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">{macro.label}</div>
                <div className="font-bold text-sm text-gray-900 mb-2 whitespace-nowrap">
                  {macro.current}<span className="text-[8px] text-gray-400 font-medium">/{macro.target}g</span>
                </div>
                <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", macro.color)} style={{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 mb-4">Registro de Comidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['desayuno', 'almuerzo', 'cena', 'snack'] as const).map(type => {
                const hasLogged = todayMeals.some(m => m.mealType === type || (!m.mealType && type === 'snack' && todayMeals.length > 0));
                return (
                  <div key={type} onClick={() => { setInitialMealType(type); setIsAddMealOpen(true); }} className={cn("flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95", hasLogged ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100")}>
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", hasLogged ? "bg-green-500 text-white" : "bg-white text-gray-300")}>
                      {hasLogged ? <Plus size={12} className="rotate-45" /> : <Plus size={12} />}
                    </div>
                    <span className={cn("text-[10px] font-bold capitalize", hasLogged ? "text-green-700" : "text-gray-500")}>{type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {profile.fastingSchedule !== 'none' && (
            <div className="bg-gray-900 rounded-[28px] p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <Clock size={16} className={currentFast ? "text-[#D4F87A]" : "text-gray-400"} />
                  <span className="font-bold text-white text-xs">Ayuno {profile.fastingSchedule}</span>
                </div>
                <button onClick={handleToggleFast} className={cn("px-4 py-2 rounded-full text-[9px] font-bold transition-all", currentFast ? "bg-[#D4F87A] text-gray-900" : "bg-white text-gray-900")}>
                  {currentFast ? 'Activo' : 'Iniciar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comidas' && (
        <div className="space-y-8 mb-12">
          {(['desayuno', 'almuerzo', 'cena', 'snack'] as const).map((type) => {
            const typeMeals = todayMeals.filter(m => m.mealType === type || (!m.mealType && type === 'snack'));
            const typeCals = typeMeals.reduce((sum, m) => sum + m.calories, 0);
            return (
              <div key={type} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 capitalize">{type}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{typeCals} kcal</p>
                  </div>
                  <button onClick={() => { setInitialMealType(type); setIsAddMealOpen(true); }} className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center active:scale-90 transition-transform">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  {typeMeals.length > 0 ? (
                    typeMeals.map(meal => (
                      <div key={meal.id} className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <Utensils size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900">{meal.name}</h4>
                            <div className="flex gap-2">
                               <button onClick={() => { setEditingMeal(meal); setIsAddMealOpen(true); }} className="text-gray-300 hover:text-indigo-500 p-1">
                                 <Pencil size={14} />
                               </button>
                               <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400 p-1">
                                 <Trash2 size={14} />
                               </button>
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g G
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-2">No hay registros</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'comidas' && (
        <AddMealModal 
          isOpen={isAddMealOpen} 
          onClose={() => { setIsAddMealOpen(false); setInitialMealType(undefined); setEditingMeal(null); }} 
          initialMealType={initialMealType}
          editingMeal={editingMeal}
        />
      )}

      {activeTab === 'agua' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Hidratación</h2>
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">OBJETIVO</div>
                <div className="font-bold text-2xl text-gray-900">{totalWater}<span className="text-sm font-medium text-gray-400 ml-1">/ {profile.dailyGoals.waterMl} ml</span></div>
              </div>
              <button onClick={() => useAppStore.getState().addWater()} className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center active:scale-95 transition-transform">
                <Plus size={24} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: Math.max(Math.ceil(profile.dailyGoals.waterMl / (profile.glassSizeMl || 250)), Math.floor(totalWater / (profile.glassSizeMl || 250))) }).map((_, i) => {
                 const glassesDrunk = Math.floor(totalWater / (profile.glassSizeMl || 250));
                 const isDrunk = i < glassesDrunk;
                 return (
                   <div 
                     key={i} 
                     className={cn("w-8 h-10 rounded-b-xl rounded-t-sm transition-all duration-300 relative overflow-hidden flex-shrink-0 cursor-pointer", isDrunk ? "bg-blue-100" : "bg-gray-100")}
                     onClick={() => {
                        if (isDrunk) {
                          const waterToDelete = sortedWater[glassesDrunk - 1 - i]; // Correct index is needed
                          // Actually, the easiest is to delete the latest water entry when clicking a full glass
                          if (sortedWater.length > 0) deleteWater(sortedWater[0].id);
                        } else {
                          useAppStore.getState().addWater();
                        }
                     }}
                   >
                     <div className={cn("absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-500", isDrunk ? "h-full opacity-100" : "h-0 opacity-0")} />
                   </div>
                 );
              })}
            </div>
            
            {/* List of water logs to be sure user can delete specific ones */}
            <div className="space-y-3 mt-8">
               <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registros de hoy</h3>
               {sortedWater.map(w => (
                 <div key={w.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                   <span className="text-xs font-bold text-gray-700">{format(new Date(w.loggedAt), 'HH:mm')} - {w.amountMl}ml</span>
                   <button onClick={() => deleteWater(w.id)} className="text-red-400 p-1">
                     <Trash2 size={14} />
                   </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
