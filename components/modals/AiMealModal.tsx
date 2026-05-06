'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Sparkles, Send, X } from 'lucide-react';

interface AiMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiMealModal({ isOpen, onClose }: AiMealModalProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorDesc, setErrorDesc] = useState('');
  const { addMeal, profile } = useAppStore();

  const handleProcess = async () => {
    if (!query) return;
    setIsLoading(true);
    setErrorDesc('');
    try {
      const res = await fetch('/api/ai/meal-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, mealType: 'other' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      addMeal({
        name: data.meal_name,
        calories: data.estimated_calories,
        protein: data.estimated_protein_g,
        carbs: data.estimated_carbs_g,
        fat: data.estimated_fat_g,
        isAiGenerated: true
      });
      setQuery('');
      onClose();
    } catch (e: any) {
      setErrorDesc('Hubo un error procesando tus macros. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
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
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Sparkles size={20} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Coach Nutricional IA</h2>
                </div>
              </div>
              <button onClick={onClose} className="!w-8 !h-8 !min-w-0 !p-0 !rounded-full !flex !items-center !justify-center !bg-gray-100 !text-gray-500 active:scale-90 transition-transform">
                <X size={16} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
                Describe lo que comiste. La IA calculará tus macros. (Dieta: <strong className="text-gray-900">{profile.dietType || 'omnívora'}</strong>)
              </p>
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: Me comí dos huevos revueltos con una rebanada de pan..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-[24px] p-5 min-h-[140px] text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-orange-50/30 transition-colors resize-none"
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mb-2" />
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest animate-pulse">Analizando...</span>
                  </div>
                )}
              </div>
              {errorDesc && (
                <div className="mt-3 text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl border border-red-100">
                  {errorDesc}
                </div>
              )}
            </div>

            <button onClick={handleProcess} disabled={!query || isLoading}
              className={cn(
                'w-full rounded-[24px] py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all mb-4',
                !query || isLoading ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white active:scale-95'
              )}
            >
              <Send size={18} />
              Procesar con IA
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
