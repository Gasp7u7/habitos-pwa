'use client';
import { useState } from 'react';

import { useAppStore } from '@/lib/store';
import { Sheet, PageContent, Block } from 'framework7-react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMealModal({ isOpen, onClose }: AddMealModalProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  
  const { addMeal } = useAppStore();

  const handleSave = () => {
    if (!name || !calories) return;
    
    addMeal({
      name,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      isAiGenerated: false
    });
    
    // Reset and close
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    onClose();
  };

  return (
    <Sheet
      opened={isOpen}
      onSheetClosed={onClose}
      swipeToClose
      backdrop
      style={{ height: '70vh', borderRadius: '28px 28px 0 0' }}
    >
      <PageContent>
        <Block>
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 mt-1" />
          <div className="flex justify-between items-center mb-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <i className="f7-icons text-xl text-green-600">plus_app_fill</i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Agregar Comida</h2>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Nombre del plato</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Ensalada de pollo"
                  className="w-full border border-gray-200 rounded-[24px] px-4 py-4 focus:outline-none focus:border-[#D4F87A] text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Calorías Totales</label>
                <input 
                  type="number" 
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="kcal"
                  className="w-full border border-gray-200 rounded-[24px] px-4 py-4 focus:outline-none focus:border-[#D4F87A] text-gray-900 font-bold text-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Proteínas</label>
                  <input 
                    type="number" 
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="g"
                    className="w-full border border-gray-200 rounded-[20px] px-3 py-3 focus:outline-none focus:border-[#D4F87A] text-gray-900 font-medium text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Carbos</label>
                  <input 
                    type="number" 
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full border border-gray-200 rounded-[20px] px-3 py-3 focus:outline-none focus:border-[#D4F87A] text-gray-900 font-medium text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Grasas</label>
                  <input 
                    type="number" 
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="g"
                    className="w-full border border-gray-200 rounded-[20px] px-3 py-3 focus:outline-none focus:border-[#D4F87A] text-gray-900 font-medium text-center"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={!name || !calories}
              className="w-full bg-gray-900 text-white rounded-[24px] py-4 font-bold text-lg disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 transition-transform pb-safe-bottom mb-4"
            >
              Guardar Comida
            </button>
        </Block>
      </PageContent>
    </Sheet>
  );
}
