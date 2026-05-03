'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Check, Activity, Target, Brain, Flame, Droplet, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const GOALS = [
  { id: 'lose_weight', title: 'Bajar de peso', icon: <Flame size={20} className="text-orange-500" /> },
  { id: 'build_muscle', title: 'Ganar masa muscular', icon: <Activity size={20} className="text-purple-500" /> },
  { id: 'active', title: 'Mantenerme activo', icon: <Target size={20} className="text-blue-500" /> },
  { id: 'endurance', title: 'Mejorar resistencia', icon: <Brain size={20} className="text-green-500" /> },
];

const AREAS = [
  { id: 'water', title: 'Tomar más agua', icon: <Droplet size={18} className="text-blue-500" /> },
  { id: 'sleep', title: 'Dormir mejor', icon: <Brain size={18} className="text-indigo-500" /> },
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
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [dietType, setDietType] = useState<string>('omnivore');
  const [fastingSchedule, setFastingSchedule] = useState<string>('none');
  const [areas, setAreas] = useState<string[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const finishOnboarding = async () => {
    setIsFinishing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const profileData = {
      display_name: name,
      height_cm: height ? parseFloat(height) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      primary_goal: primaryGoal,
      diet_type: dietType,
      fasting_schedule: fastingSchedule,
      has_completed_onboarding: true,
      daily_water_ml: 2500,
      daily_calories: 2200,
      daily_activity_minutes: 45,
    };

    // Guardar en Supabase
    if (user) {
      try {
        await updateSupabaseProfile(user.id, profileData);
        
        // Si tiene peso inicial, guardar en weight_logs
        if (weight) {
          await (supabase.from('weight_logs') as any).insert({
            user_id: user.id,
            weight_kg: parseFloat(weight),
          });
        }
      } catch (error) {
        console.error(error)
      }
    }

    // Actualizar store local
    updateProfile({
      name,
      weightKg: weight ? parseFloat(weight) : undefined,
      heightCm: height ? parseFloat(height) : undefined,
      primaryGoal,
      dietType,
      fastingSchedule,
      areasForImprovement: areas,
      hasCompletedOnboarding: true,
      dailyGoals: {
        waterMl: profileData.daily_water_ml,
        calories: profileData.daily_calories,
        activityMinutes: profileData.daily_activity_minutes,
      }
    });
  };

  const toggleArea = (id: string) => {
    if (areas.includes(id)) {
      setAreas(areas.filter(a => a !== id));
    } else {
      setAreas([...areas, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans overflow-hidden">
      
      {/* Dynamic progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-10">
        <motion.div 
          className="h-full bg-gray-900"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 4) * 100}%` }}
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
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow mb-8"
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
                Esto ayuda a la IA a calcular mejor tus calorías y necesidades de agua.
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ej. 70"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ej. 175"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Atrás
                </button>
                <button 
                  disabled={!weight || !height}
                  onClick={nextStep}
                  className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all"
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
            className="flex-1 flex flex-col p-6 pt-16 overflow-y-auto"
          >
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Tipo de Alimentación</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                ¿Sigues alguna dieta en particular?
              </p>
              
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
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Atrás
                </button>
                <button 
                  onClick={nextStep}
                  className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
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
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Ayuno Intermitente</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                ¿Haces algún protocolo de ayuno?
              </p>
              
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
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Atrás
                </button>
                <button 
                  onClick={nextStep}
                  className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  Continuar <ArrowRight size={20} />
                </button>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Tu objetivo principal</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                ¿Qué buscas lograr usando esta app? Elige uno.
              </p>
              
              <div className="space-y-3 mb-8">
                {GOALS.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setPrimaryGoal(goal.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-95",
                      primaryGoal === goal.id 
                        ? "border-gray-900 bg-gray-50" 
                        : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-50">
                        {goal.icon}
                      </div>
                      <span className="font-bold text-gray-900">{goal.title}</span>
                    </div>
                    {primaryGoal === goal.id && (
                      <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Atrás
                </button>
                <button 
                  disabled={!primaryGoal}
                  onClick={nextStep}
                  className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all"
                >
                  Continuar <ArrowRight size={20} />
                </button>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Áreas a mejorar</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Selecciona hábitos que te cuestan trabajo para darles más seguimiento.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {AREAS.map(area => {
                  const isSelected = areas.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleArea(area.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 flex flex-col items-start gap-3 transition-all active:scale-95 text-left",
                        isSelected 
                          ? "border-gray-900 bg-gray-50" 
                          : "border-gray-100 bg-white hover:border-gray-200"
                      )}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-50">
                          {area.icon}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center mt-0.5">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 leading-snug">{area.title}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Atrás
                </button>
                <button 
                  disabled={areas.length === 0}
                  onClick={nextStep}
                  className="flex-1 bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all"
                >
                  Continuar <ArrowRight size={20} />
                </button>
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
            className="flex-1 flex flex-col p-6 pt-16 items-center justify-center text-center"
          >
            {isFinishing ? (
              <div className="flex flex-col items-center">
                 <Loader2 size={48} className="text-gray-900 animate-spin mb-6" />
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparando todo...</h2>
                 <p className="text-gray-500">La IA está configurando tu dashboard</p>
              </div>
            ) : (
              <div className="max-w-sm mx-auto w-full">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Check size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">¡Todo listo, {name}!</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Ya tenemos tu perfil. En el futuro, tu información se sincronizará automáticamente para darte los mejores insights.
                </p>
                <button 
                  onClick={finishOnboarding}
                  className="w-full bg-gray-900 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  Ir a la App <ArrowRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
