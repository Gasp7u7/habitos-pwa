'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { notifyWeightSaved } from '@/lib/notifications/inapp';
import { Scale, X } from 'lucide-react';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightModal({ isOpen, onClose }: WeightModalProps) {
  const { profile, updateProfile } = useAppStore();
  const [weight, setWeight] = useState(profile.weightKg?.toString() || '');

  useEffect(() => {
    if (isOpen) setWeight(profile.weightKg?.toString() || '');
  }, [isOpen, profile]);

  const handleSave = async () => {
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum)) return;
    const newWaterGoal = Math.round(weightNum * 35);
    updateProfile({
      weightKg: weightNum,
      dailyGoals: { ...useAppStore.getState().profile.dailyGoals, waterMl: newWaterGoal },
    });
    notifyWeightSaved(weightNum);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase.from('weight_logs') as any).insert({ user_id: user.id, weight_kg: weightNum });
      await (supabase.from('profiles') as any).update({ weight_kg: weightNum, daily_water_ml: newWaterGoal }).eq('id', user.id);
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
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-6 z-[70] shadow-2xl"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Scale size={20} className="text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Registrar Peso</h2>
              </div>
              <button onClick={onClose} className="!w-8 !h-8 !min-w-0 !p-0 !rounded-full !flex !items-center !justify-center !bg-gray-100 !text-gray-500 active:scale-90 transition-transform">
                <X size={16} />
              </button>
            </div>

            <div className="mb-8 flex flex-col items-center">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 block">Peso Actual (Kg)</label>
              <div className="flex items-end justify-center gap-2 mb-2 w-full">
                <input
                  type="number"
                  autoFocus
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.0"
                  className="w-32 bg-transparent text-5xl font-bold text-gray-900 focus:outline-none text-center tabular-nums"
                />
                <span className="text-xl font-bold text-gray-400 mb-2">kg</span>
              </div>
              <div className="h-0.5 w-32 bg-gray-200 mt-2 rounded-full" />
            </div>

            <button onClick={handleSave} disabled={!weight}
              className="w-full bg-indigo-600 text-white rounded-[24px] py-4 font-bold text-lg disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 transition-transform mb-4"
            >
              Guardar Peso
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
