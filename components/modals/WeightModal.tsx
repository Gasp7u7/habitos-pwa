'use client';
import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Sheet, PageContent, Block } from 'framework7-react';

import { createClient } from '@/lib/supabase/client';
import { notifyWeightSaved } from '@/lib/notifications/inapp';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightModal({ isOpen, onClose }: WeightModalProps) {
  const { profile, updateProfile } = useAppStore();
  const [weight, setWeight] = useState(profile.weightKg?.toString() || '');
  
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setWeight(profile.weightKg?.toString() || '');
    }
  }, [isOpen, profile]);

  const handleSave = async () => {
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum)) return;
    
    updateProfile({
      weightKg: weightNum
    });
    notifyWeightSaved(weightNum);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase.from('weight_logs') as any).insert({
        user_id: user.id,
        weight_kg: weightNum,
      });
      await (supabase.from('profiles') as any)
        .update({ weight_kg: weightNum })
        .eq('id', user.id);
    }
    
    onClose();
  };

  return (
    <Sheet
      opened={isOpen}
      onSheetClosed={onClose}
      swipeToClose
      backdrop
      style={{ height: 'auto', borderRadius: '32px 32px 0 0' }}
    >
      <PageContent>
        <Block>
            <div className="flex justify-between items-center mb-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Scale size={20} className="text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Registrar Peso</h2>
              </div>
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

            <button 
              onClick={handleSave}
              disabled={!weight}
              className="w-full bg-indigo-600 text-white rounded-[24px] py-4 font-bold text-lg disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 transition-transform pb-safe-bottom mb-4"
            >
              Guardar Peso
            </button>
        </Block>
      </PageContent>
    </Sheet>
  );
}
