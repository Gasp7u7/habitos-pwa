'use client';
import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Sheet, PageContent, Block } from 'framework7-react';

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
      
      if (!res.ok) {
        throw new Error(data.error || "API error");
      }
      
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
      console.error(e);
      setErrorDesc("Hubo un error procesando tus macros. Revisa los detalles o intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet
      opened={isOpen}
      onSheetClosed={onClose}
      swipeToClose
      backdrop
      style={{ height: '75vh', borderRadius: '28px 28px 0 0' }}
    >
      <PageContent>
        <Block>
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 mt-1" />
          <div className="flex justify-between items-center mb-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Sparkles size={20} className="text-orange-500 box-content p-1" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Coach Nutricional IA</h2>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
                Describe lo que comiste o los ingredientes que tienes. La IA calculará tus macros automáticamente. (Dieta: <strong className="text-gray-900">{profile.dietType || 'omnivora'}</strong>)
              </p>
              
              <div className="relative">
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: Me comí dos huevos revueltos con una rebanada de pan..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-[24px] p-5 min-h-[140px] text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:bg-orange-50/30 transition-colors resize-none"
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

            <button 
              onClick={handleProcess}
              disabled={!query || isLoading}
              className={cn(
                "w-full rounded-[24px] py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all pb-safe-bottom",
                !query || isLoading 
                  ? "bg-gray-200 text-gray-400" 
                  : "bg-orange-500 text-white active:scale-95"
              )}
              style={{ marginBottom: 'env(safe-area-inset-bottom, 20px)' }}
            >
              <Send size={18} />
              Procesar con IA
            </button>
        </Block>
      </PageContent>
    </Sheet>
  );
}
