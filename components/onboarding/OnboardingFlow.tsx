'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ArrowRight, Check, Loader2, User, Flame, Zap, Target, Heart, Droplets, Moon, Info, Activity } from 'lucide-react';
import { calculateDailyGoals, calculateMacros } from '@/lib/utils/calculations';

const GOALS = [
  { id: 'lose_weight', title: 'Bajar de peso', icon: <Flame size={20} className="text-orange-500" /> },
  { id: 'build_muscle', title: 'Ganar masa muscular', icon: <Zap size={20} className="text-purple-500" /> },
  { id: 'active', title: 'Mantenerme activo', icon: <Target size={20} className="text-blue-500" /> },
  { id: 'endurance', title: 'Mejorar resistencia', icon: <Heart size={20} className="text-green-500" /> },
  { id: 'race_prep', title: 'Prepararme para una carrera', icon: <Activity size={20} className="text-teal-500" /> },
];

const AREAS = [
  { id: 'water', title: 'Tomar más agua', icon: <Droplets size={18} className="text-blue-500" /> },
  { id: 'sleep', title: 'Dormir mejor', icon: <Moon size={18} className="text-indigo-500" /> },
  { id: 'consistency', title: 'Constancia', icon: <Target size={18} className="text-orange-500" /> },
  { id: 'nutrition', title: 'Comer más sano', icon: <Flame size={18} className="text-green-500" /> },
];

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

import { updateProfile as updateSupabaseProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingFlow() {
  const { profile, updateProfile } = useAppStore();
  
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name || '');
  const [weight, setWeight] = useState(profile.weightKg?.toString() || '');
  const [height, setHeight] = useState(profile.heightCm?.toString() || '');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile.goals || []);
  const [dietType, setDietType] = useState<string>('omnivore');
  const [fastingSchedule, setFastingSchedule] = useState<string>('none');
  const [areas, setAreas] = useState<string[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const nextStep = () => {
    if (step < 7) setStep(step + 1);
  };

  const finishOnboarding = async () => {
    setIsFinishing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Cálculo científico de metas
    const goals = calculateDailyGoals({
      weightKg: parseFloat(weight),
      heightCm: parseFloat(height),
      age: parseInt(age),
      gender: gender,
      primaryGoal: selectedGoals.length > 0 ? selectedGoals[0] : 'active',
      activityMinutes: 45 // Valor base
    });

    const macros = calculateMacros(goals.calories, dietType);

    const profileData = {
      display_name: name,
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      age: parseInt(age),
      gender: gender,
      primary_goal: selectedGoals.length > 0 ? selectedGoals[0] : 'active',
      goals: selectedGoals,
      diet_type: dietType,
      fasting_schedule: fastingSchedule,
      has_completed_onboarding: true,
      daily_water_ml: goals.waterMl,
      daily_calories: goals.calories,
      daily_activity_minutes: 45,
      target_protein_g: macros.proteinG,
      target_carbs_g: macros.carbsG,
      target_fat_g: macros.fatG,
    };

    if (user) {
      try {
        await updateSupabaseProfile(user.id, profileData);
        if (weight) {
          await (supabase.from('weight_logs') as any).insert({
            user_id: user.id,
            weight_kg: parseFloat(weight),
          });
        }
      } catch (error: any) {
        console.error('Error al guardar perfil:', error?.message || error);
      }
    }

    updateProfile({
      name,
      weightKg: parseFloat(weight),
      heightCm: parseFloat(height),
      age: parseInt(age),
      gender: gender,
      primaryGoal: selectedGoals.length > 0 ? selectedGoals[0] : 'active',
      goals: selectedGoals,
      dietType,
      fastingSchedule,
      areasForImprovement: areas,
      hasCompletedOnboarding: true,
      dailyGoals: {
        waterMl: goals.waterMl,
        calories: goals.calories,
        activityMinutes: 45,
        proteinG: macros.proteinG,
        carbsG: macros.carbsG,
        fatG: macros.fatG,
      }
    });
  };

  const togglePrimaryGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const toggleArea = (id: string) => {
    if (areas.includes(id)) {
      setAreas(areas.filter(a => a !== id));
    } else {
      setAreas([...areas, id]);
    }
  };

  const totalSteps = 6; // Pasos navegables (0 a 6)

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans overflow-hidden">
      
      {/* Barra de progreso dinámica */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-10">
        <motion.div 
          className="h-full bg-gray-900"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <User size={32} className="text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">¡Hola! Empecemos.</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Vamos a personalizar tu experiencia. ¿Cómo te gustaría que te llamemos?
              </p>
              
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre o apodo"
                className="w-full !bg-white !border-2 !border-gray-200 !rounded-2xl !px-6 !py-4 text-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:!border-gray-900 transition-all shadow-sm !mb-8 !mt-2"
              />
              
              <button 
                disabled={!name.trim()}
                onClick={nextStep}
                className="w-full bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all"
              >
                Continuar <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Tus medidas</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Esto ayuda a calcular mejor tus necesidades de agua y calorías.
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ej. 70"
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-2xl !px-6 !py-4 text-xl font-semibold text-gray-900 focus:outline-none focus:!border-gray-900 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ej. 175"
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-2xl !px-6 !py-4 text-xl font-semibold text-gray-900 focus:outline-none focus:!border-gray-900 transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setStep(step - 1)} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl">Atrás</button>
                <button 
                  disabled={!weight || !height}
                  onClick={nextStep}
                  className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Más detalles</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Usamos la fórmula de Mifflin-St Jeor para máxima precisión.
              </p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-3">Género biológico</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setGender('male')}
                      className={cn("p-4 rounded-2xl border-2 font-bold transition-all", gender === 'male' ? "border-gray-900 bg-gray-50 text-gray-900" : "border-gray-100 text-gray-400")}
                    >
                      Hombre
                    </button>
                    <button 
                      onClick={() => setGender('female')}
                      className={cn("p-4 rounded-2xl border-2 font-bold transition-all", gender === 'female' ? "border-gray-900 bg-gray-50 text-gray-900" : "border-gray-100 text-gray-400")}
                    >
                      Mujer
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Edad</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ej. 25"
                    className="w-full !bg-white !border-2 !border-gray-200 !rounded-2xl !px-6 !py-4 text-xl font-semibold text-gray-900 focus:outline-none focus:!border-gray-900 transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setStep(step - 1)} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl">Atrás</button>
                <button 
                  disabled={!age}
                  onClick={nextStep}
                  className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16 overflow-y-auto"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Tipo de Alimentación</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">¿Sigues alguna dieta en particular?</p>
              <div className="space-y-3 mb-8">
                {DIETS.map(diet => (
                  <button
                    key={diet.id}
                    onClick={() => setDietType(diet.id)}
                    className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all", dietType === diet.id ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white")}
                  >
                    <div>
                      <div className="font-bold text-gray-900">{diet.title}</div>
                      <div className="text-sm text-gray-500">{diet.desc}</div>
                    </div>
                    {dietType === diet.id && <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center"><Check size={14} /></div>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(step - 1)} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl">Atrás</button>
                <button onClick={nextStep} className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2">Continuar <ArrowRight size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16 overflow-y-auto"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Ayuno Intermitente</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">¿Haces algún protocolo de ayuno?</p>
              <div className="space-y-3 mb-8">
                {FASTING.map(fast => (
                  <button
                    key={fast.id}
                    onClick={() => setFastingSchedule(fast.id)}
                    className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all", fastingSchedule === fast.id ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white")}
                  >
                    <div>
                      <div className="font-bold text-gray-900">{fast.title}</div>
                      <div className="text-sm text-gray-500">{fast.desc}</div>
                    </div>
                    {fastingSchedule === fast.id && <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center"><Check size={14} /></div>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(step - 1)} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl">Atrás</button>
                <button onClick={nextStep} className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2">Continuar <ArrowRight size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16 overflow-y-auto"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Tu objetivo</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">¿Qué buscas lograr usando esta app?</p>
              <div className="space-y-3 mb-8">
                {GOALS.map(goal => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                  <button
                    key={goal.id}
                    onClick={() => togglePrimaryGoal(goal.id)}
                    className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all", isSelected ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-50">{goal.icon}</div>
                      <span className="font-bold text-gray-900">{goal.title}</span>
                    </div>
                    {isSelected && <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center"><Check size={14} /></div>}
                  </button>
                )})}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(step - 1)} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl">Atrás</button>
                <button disabled={selectedGoals.length === 0} onClick={nextStep} className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2">Continuar <ArrowRight size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16 overflow-y-auto"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Áreas a mejorar</h1>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {AREAS.map(area => {
                  const isSelected = areas.includes(area.id);
                  return (
                    <button key={area.id} onClick={() => toggleArea(area.id)} className={cn("p-4 rounded-2xl border-2 flex flex-col items-start gap-3 transition-all text-left", isSelected ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white")}>
                      <div className="flex justify-between items-start w-full">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-50">{area.icon}</div>
                        {isSelected && <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center mt-0.5"><Check size={12} /></div>}
                      </div>
                      <span className="font-bold text-gray-900 leading-snug">{area.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(step - 1)} className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl">Atrás</button>
                <button disabled={areas.length === 0} onClick={nextStep} className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2">Continuar <ArrowRight size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div 
            key="step7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-16 items-center justify-center text-center"
          >
            {isFinishing ? (
              <div className="flex flex-col items-center">
                 <Loader2 size={48} className="text-gray-900 animate-spin mb-6" />
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculando tus metas...</h2>
                 <p className="text-gray-500">Usando la fórmula de Mifflin-St Jeor</p>
              </div>
            ) : (
              <div className="max-w-sm mx-auto w-full">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Check size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">¡Todo listo!</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">Ya hemos calculado tu plan personalizado basándonos en tu biometría.</p>
                <button onClick={finishOnboarding} className="w-full bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2">Ir a la App <ArrowRight size={20} /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
