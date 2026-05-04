'use client';
import { useState, useEffect } from 'react';
import { Sheet, PageContent, Block } from 'framework7-react';
import { X, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const DIETS = [
  { id: 'omnivore', title: 'Omnívora', desc: 'Como de todo' },
  { id: 'vegetarian', title: 'Vegetariano', desc: 'Sin carne ni pescado' },
  { id: 'vegan', title: 'Vegano', desc: '100% plant-based' },
  { id: 'keto', title: 'Keto', desc: 'Muy bajo en carbohidratos' },
  { id: 'paleo', title: 'Paleo', desc: 'Comida real, sin procesados' },
];

const FASTING = [
  { id: 'none', title: 'Sin ayuno', desc: 'Como a lo largo del día' },
  { id: '12:12', title: '12:12', desc: 'Ayuno nocturno básico' },
  { id: '14:10', title: '14:10', desc: 'Buen punto de partida' },
  { id: '16:8', title: '16:8', desc: 'El más popular' },
  { id: 'omad', title: 'OMAD', desc: 'Una comida al día' },
];

export default function NutritionSettings({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { profile, updateProfile } = useAppStore();
  const [dietType, setDietType] = useState(profile.dietType || 'omnivore');
  const [fastingSchedule, setFastingSchedule] = useState(profile.fastingSchedule || 'none');
  const [calories, setCalories] = useState(profile.dailyGoals.calories.toString());
  const [water, setWater] = useState(profile.dailyGoals.waterMl.toString());
  const [weightKg, setWeightKg] = useState(profile.weightKg?.toString() || '');
  const [glassSizeMl, setGlassSizeMl] = useState(profile.glassSizeMl?.toString() || '250');
  
  useEffect(() => {
    if (isOpen) {
      setDietType(profile.dietType || 'omnivore');
      setFastingSchedule(profile.fastingSchedule || 'none');
      setCalories(profile.dailyGoals.calories.toString());
      setWater(profile.dailyGoals.waterMl.toString());
      setWeightKg(profile.weightKg?.toString() || '');
      setGlassSizeMl(profile.glassSizeMl?.toString() || '250');
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (weightKg && parseInt(weightKg) > 0) {
      const calculatedWaterMl = parseInt(weightKg) * 35;
      setWater(calculatedWaterMl.toString());
    }
  }, [weightKg]);

  const handleSave = () => {
    updateProfile({
      dietType,
      fastingSchedule,
      weightKg: weightKg ? parseInt(weightKg) : undefined,
      glassSizeMl: parseInt(glassSizeMl) || 250,
      dailyGoals: {
        ...profile.dailyGoals,
        calories: parseInt(calories) || 2000,
        waterMl: parseInt(water) || 2500,
      }
    });
    onClose();
  };

  return (
    <Sheet
      opened={isOpen}
      onSheetClosed={onClose}
      swipeToClose
      backdrop
      style={{ height: '80vh', borderRadius: '32px 32px 0 0' }}
    >
      <PageContent>
        <Block className="mt-0 pt-6">
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-900">Plan Nutricional</h2>
          </div>

          <div className="py-6">
            <h3 className="font-bold text-gray-900 mb-3 px-1">Tipo de Dieta</h3>
            <div className="space-y-3 mb-8">
              {DIETS.map(diet => (
                <button
                  key={diet.id}
                  onClick={() => setDietType(diet.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-95",
                    dietType === diet.id 
                      ? "border-gray-900 bg-gray-50" 
                      : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                  <div>
                    <div className="font-bold text-gray-900">{diet.title}</div>
                    <div className="text-sm text-gray-500">{diet.desc}</div>
                  </div>
                  {dietType === diet.id && (
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <h3 className="font-bold text-gray-900 mb-3 px-1">Protocolo de Ayuno</h3>
            <div className="space-y-3 mb-8">
              {FASTING.map(fast => (
                <button
                  key={fast.id}
                  onClick={() => setFastingSchedule(fast.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-95",
                    fastingSchedule === fast.id 
                      ? "border-gray-900 bg-gray-50" 
                      : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                  <div>
                    <div className="font-bold text-gray-900">{fast.title}</div>
                    <div className="text-sm text-gray-500">{fast.desc}</div>
                  </div>
                  {fastingSchedule === fast.id && (
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <h3 className="font-bold text-gray-900 mb-3 px-1">Tus Datos</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">PESO (kg)</label>
                <input 
                  type="number" 
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="Ej: 70"
                  className="w-full bg-gray-50 border border-gray-200 rounded-[24px] p-4 text-xl font-bold text-gray-900 focus:outline-none focus:border-[#D4F87A] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">TAMAÑO VASO (ml)</label>
                <input 
                  type="number" 
                  value={glassSizeMl}
                  onChange={(e) => setGlassSizeMl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[24px] p-4 text-xl font-bold text-gray-900 focus:outline-none focus:border-[#D4F87A] transition-colors"
                />
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-3 px-1">Metas Diarias</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">CALORÍAS</label>
                <input 
                  type="number" 
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[24px] p-4 text-xl font-bold text-gray-900 focus:outline-none focus:border-[#D4F87A] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">AGUA (ml)</label>
                <input 
                  type="number" 
                  value={water}
                  readOnly
                  className="w-full bg-gray-100 border border-transparent rounded-[24px] p-4 text-xl font-bold text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 font-medium px-2 mt-2">Calculado: 35ml x kg</p>
              </div>
            </div>
            
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform"
            >
              Guardar Cambios
            </button>
          </div>
        </Block>
      </PageContent>
    </Sheet>
  );
}
