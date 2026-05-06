'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Check, X, Sparkles, ChevronDown } from 'lucide-react';
import { calculateDailyGoals, calculateMacros } from '@/lib/utils/calculations';

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
  const [heightCm, setHeightCm] = useState(profile.heightCm?.toString() || '');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [glassSizeMl, setGlassSizeMl] = useState(profile.glassSizeMl?.toString() || '250');

  useEffect(() => {
    if (isOpen) {
      setDietType(profile.dietType || 'omnivore');
      setFastingSchedule(profile.fastingSchedule || 'none');
      setCalories(profile.dailyGoals.calories.toString());
      setWater(profile.dailyGoals.waterMl.toString());
      setWeightKg(profile.weightKg?.toString() || '');
      setHeightCm(profile.heightCm?.toString() || '');
      setAge(profile.age?.toString() || '');
      setGender(profile.gender || 'male');
      setGlassSizeMl(profile.glassSizeMl?.toString() || '250');
    }
  }, [isOpen, profile]);

  const handleRecalculate = () => {
    if (!weightKg || !heightCm || !age) return;
    
    const goals = calculateDailyGoals({
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      age: parseInt(age),
      gender,
      primaryGoal: profile.primaryGoal || 'active'
    });

    setCalories(goals.calories.toString());
    setWater(goals.waterMl.toString());
  };

  const handleSave = async () => {
    const caloriesNum = parseInt(calories) || 2200;
    const waterNum = parseInt(water) || 2500;
    const weightNum = weightKg ? parseFloat(weightKg) : undefined;
    const heightNum = heightCm ? parseFloat(heightCm) : undefined;
    const ageNum = age ? parseInt(age) : undefined;
    const glassSizeNum = parseInt(glassSizeMl) || 250;

    const macros = calculateMacros(caloriesNum, dietType);

    updateProfile({
      dietType: dietType as any,
      fastingSchedule: fastingSchedule as any,
      weightKg: weightNum,
      heightCm: heightNum,
      age: ageNum,
      gender,
      glassSizeMl: glassSizeNum,
      dailyGoals: { 
        ...profile.dailyGoals, 
        calories: caloriesNum, 
        waterMl: waterNum,
        proteinG: macros.proteinG,
        carbsG: macros.carbsG,
        fatG: macros.fatG
      }
    });

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase.from('profiles') as any).update({
          diet_type: dietType,
          fasting_schedule: fastingSchedule,
          weight_kg: weightNum || null,
          height_cm: heightNum || null,
          age: ageNum || null,
          gender: gender,
          daily_calories: caloriesNum,
          daily_water_ml: waterNum,
          target_protein_g: macros.proteinG,
          target_carbs_g: macros.carbsG,
          target_fat_g: macros.fatG,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);

        if (weightNum && weightNum !== profile.weightKg) {
          await (supabase.from('weight_logs') as any).insert({ user_id: user.id, weight_kg: weightNum });
        }
      }
    } catch (e) {
      console.error('Error saving nutrition settings:', e);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] z-[70] shadow-2xl"
            style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header fijo */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Configuración Personal</h2>
                <button onClick={onClose} className="!w-8 !h-8 !min-w-0 !p-0 !rounded-full !bg-gray-100 !flex !items-center !justify-center !text-gray-500 active:scale-90 transition-transform">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              
              <h3 className="font-bold text-gray-900 mb-3 px-1 flex items-center justify-between">
                Datos Biométricos
                <button onClick={handleRecalculate} className="!w-auto !min-w-0 !px-4 !py-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 rounded-full active:scale-95 transition-all">
                  Recalcular Metas
                </button>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">GÉNERO</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-[24px] !px-5 !py-4 font-bold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="male">Hombre</option>
                    <option value="female">Mujer</option>
                  </select>
                  <div className="absolute right-5 bottom-5 pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">EDAD</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Años"
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-[24px] !px-5 !py-4 font-bold text-gray-900 focus:outline-none focus:!border-gray-900" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">PESO (kg)</label>
                  <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70"
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-[24px] !px-5 !py-4 font-bold text-gray-900 focus:outline-none focus:!border-gray-900" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">ALTURA (cm)</label>
                  <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175"
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-[24px] !px-5 !py-4 font-bold text-gray-900 focus:outline-none focus:!border-gray-900" />
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-3 px-1">Tipo de Dieta</h3>
              <div className="space-y-3 mb-8">
                {DIETS.map(diet => (
                  <button key={diet.id} onClick={() => setDietType(diet.id)}
                    className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-95",
                      dietType === diet.id ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    <div>
                      <div className="font-bold text-gray-900">{diet.title}</div>
                      <div className="text-sm text-gray-500">{diet.desc}</div>
                    </div>
                    {dietType === diet.id && <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center"><Check size={14} /></div>}
                  </button>
                ))}
              </div>

              <h3 className="font-bold text-gray-900 mb-3 px-1">Metas Personalizadas</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">CALORÍAS</label>
                  <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-[24px] !px-5 !py-4 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4F87A] transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">AGUA (ml)</label>
                  <input type="number" value={water} onChange={(e) => setWater(e.target.value)}
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-[24px] !px-5 !py-4 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4F87A] transition-colors" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-4 mb-8 flex items-start gap-3">
                 <Sparkles size={18} className="text-orange-500 mt-1 shrink-0" />
                 <p className="text-xs text-orange-800 leading-relaxed font-medium">
                   Al guardar, calcularemos automáticamente tus macros (proteínas, carbos y grasas) basados en la dieta elegida.
                 </p>
              </div>

              <button onClick={handleSave} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform mb-6">
                Guardar y Aplicar Plan
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
