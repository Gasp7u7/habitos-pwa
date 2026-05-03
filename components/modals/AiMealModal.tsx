'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { GoogleGenAI, Type } from '@google/genai';

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
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this meal description and provide estimated macros and calories. Calculate the amount of protein, carbs and fat in grams. The response must be in Spanish. The user's diet is: ${profile.dietType || 'omnívora'}. Meal description: ${query}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "A concise name for this meal (e.g., Huevos Revueltos)" },
              calories: { type: Type.INTEGER, description: "Estimated total calories" },
              protein: { type: Type.INTEGER, description: "Estimated protein in grams" },
              carbs: { type: Type.INTEGER, description: "Estimated carbohydrates in grams" },
              fat: { type: Type.INTEGER, description: "Estimated fat in grams" },
            },
            required: ["name", "calories", "protein", "carbs", "fat"]
          }
        }
      });
      
      const textResponse = response.text;
      if (textResponse) {
        const result = JSON.parse(textResponse);
        addMeal({
          name: result.name,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          isAiGenerated: true
        });
        setQuery('');
        onClose();
      } else {
        throw new Error("No text response from Gemini");
      }
    } catch (e: any) {
      console.error(e);
      setErrorDesc("Hubo un error procesando tus macros. Revisa los detalles o intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] p-6 pb-auto max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Sparkles size={20} className="text-orange-500 box-content p-1" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Coach Nutricional IA</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 active:scale-95 transition-transform"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
                Describe lo que comiste o los ingredientes que tienes. La inteligencia artificial calculará tus macros automáticamente. (Dieta: <strong className="text-gray-900">{profile.dietType || 'omnivora'}</strong>)
              </p>
              
              <div className="relative">
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: Me comí dos huevos revueltos con una rebanada de pan integral y medio aguacate."
                  className="w-full bg-gray-50 border border-gray-200 rounded-[24px] p-5 min-h-[140px] text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:bg-orange-50/30 transition-colors resize-none"
                  disabled={isLoading}
                />
                
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mb-2" />
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest animate-pulse">Analizando Macros...</span>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
