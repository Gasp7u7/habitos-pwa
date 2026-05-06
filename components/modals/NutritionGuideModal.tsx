'use client';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Droplets, Zap, Info, ArrowRight, Heart, Brain, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NutritionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NutritionGuideModal({ isOpen, onClose }: NutritionGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#f8f9fa] rounded-t-[32px] max-h-[90vh] overflow-y-auto z-[101] shadow-2xl scrollbar-hide"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#f8f9fa]/80 backdrop-blur-md p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Guía Nutricional</h2>
                <p className="text-sm text-gray-500">Aprende sobre tus metas</p>
              </div>
              <button 
                onClick={onClose}
                className="!w-10 !h-10 !min-w-0 !p-0 !bg-white !rounded-full !flex !items-center !justify-center shadow-sm border border-gray-100 active:scale-95 transition-all"
              >
                <X size={20} className="text-gray-900" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-6 pb-12">
              
              {/* De donde vienen los números */}
              <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Brain size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">¿De dónde vienen mis metas?</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Tus metas no son aleatorias. Utilizamos la fórmula científica de **Mifflin-St Jeor**, el estándar de oro en nutrición moderna.
                </p>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Scale size={14} /> Factores Clave
                  </div>
                  <ul className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <li className="flex items-center gap-2">🔹 Edad y Género</li>
                    <li className="flex items-center gap-2">🔹 Peso y Altura</li>
                    <li className="flex items-center gap-2">🔹 Nivel de Actividad</li>
                    <li className="flex items-center gap-2">🔹 Tu Objetivo</li>
                  </ul>
                </div>
              </section>

              {/* ¿Qué es un Macronutriente? */}
              <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Flame size={20} className="text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">¿Qué es un Macronutriente?</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Son los nutrientes que tu cuerpo necesita en grandes cantidades para funcionar y darte energía.
                </p>
                
                <div className="space-y-4">
                  {/* Proteínas */}
                  <div className="border-l-4 border-orange-400 pl-4 py-1">
                    <div className="font-bold text-gray-900 text-sm mb-1">Proteínas (Constructoras)</div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Construyen y reparan tus músculos y tejidos. <br/>
                      <span className="font-semibold text-gray-700">Ejemplos:</span> Pollo, pescado, huevos, legumbres y tofu.
                    </p>
                  </div>
                  
                  {/* Carbos */}
                  <div className="border-l-4 border-blue-400 pl-4 py-1">
                    <div className="font-bold text-gray-900 text-sm mb-1">Carbohidratos (Energía)</div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">
                      La gasolina de tu cerebro y músculos.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50/50 p-2 rounded-xl">
                        <div className="text-[10px] font-bold text-blue-600 uppercase">Complejos ✅</div>
                        <div className="text-[9px] text-gray-600">Avena, quinua, papa. Energía duradera.</div>
                      </div>
                      <div className="bg-red-50/50 p-2 rounded-xl">
                        <div className="text-[10px] font-bold text-red-600 uppercase">Simples ⚠️</div>
                        <div className="text-[9px] text-gray-600">Azúcar, pan blanco. Energía rápida.</div>
                      </div>
                    </div>
                  </div>

                  {/* Grasas */}
                  <div className="border-l-4 border-yellow-400 pl-4 py-1">
                    <div className="font-bold text-gray-900 text-sm mb-1">Grasas (Reserva y Hormonas)</div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">
                      Esenciales para tu sistema hormonal y cerebro.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-yellow-50/50 p-2 rounded-xl">
                        <div className="text-[10px] font-bold text-yellow-600 uppercase">Saludables 🥑</div>
                        <div className="text-[9px] text-gray-600">Palta, frutos secos, aceite de oliva.</div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-xl">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Saturadas 🍔</div>
                        <div className="text-[9px] text-gray-600">Fritos, embutidos. Consumir poco.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ¿Qué es el IMC? */}
              <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Scale size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">¿Qué es el IMC?</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  El **Índice de Masa Corporal** es una medida que relaciona tu peso con tu altura para estimar si tienes un peso saludable.
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">La Fórmula</div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center font-mono text-gray-900 font-bold">
                    Peso (kg) / Altura (m)²
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Interpretación</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                      <div className="text-[10px] font-bold text-blue-600 uppercase">Bajo Peso</div>
                      <div className="text-xs font-bold text-gray-900">Menos de 18.5</div>
                    </div>
                    <div className="bg-green-50/50 p-2 rounded-xl border border-green-100/50">
                      <div className="text-[10px] font-bold text-green-600 uppercase">Saludable ✅</div>
                      <div className="text-xs font-bold text-gray-900">18.5 - 24.9</div>
                    </div>
                    <div className="bg-yellow-50/50 p-2 rounded-xl border border-yellow-100/50">
                      <div className="text-[10px] font-bold text-yellow-600 uppercase">Sobrepeso</div>
                      <div className="text-xs font-bold text-gray-900">25.0 - 29.9</div>
                    </div>
                    <div className="bg-red-50/50 p-2 rounded-xl border border-red-100/50">
                      <div className="text-[10px] font-bold text-red-600 uppercase">Obesidad ⚠️</div>
                      <div className="text-xs font-bold text-gray-900">30.0 o más</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-400 italic mt-4 leading-tight">
                  * Nota: El IMC es una referencia general. No distingue entre masa muscular y grasa.
                </p>
              </section>

              {/* Tips Finales */}
              <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={64} fill="currentColor" />
                </div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                   <Heart size={16} className="text-[#D4F87A]" /> Consejo de oro
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  No te obsesiones con los números exactos. Lo más importante es la **constancia** y elegir alimentos reales sobre procesados.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-white border-2 border-gray-200 text-gray-900 font-bold py-4 rounded-2xl active:scale-95 transition-all"
              >
                Entendido
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
