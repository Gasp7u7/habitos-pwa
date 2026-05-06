'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { PlusCircle, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Ingredient, MealEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMealType?: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  editingMeal?: MealEntry | null;
}

export default function AddMealModal({ isOpen, onClose, initialMealType, editingMeal }: AddMealModalProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mealType, setMealType] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('snack');
  const [showIngredients, setShowIngredients] = useState(false);
  
  // Local ingredient form
  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('');
  const [ingUnit, setIngUnit] = useState('g');
  const [ingCals, setIngCals] = useState('');

  const { addMeal, updateMeal } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      if (editingMeal) {
        setName(editingMeal.name);
        setCalories(editingMeal.calories.toString());
        setProtein(editingMeal.protein.toString());
        setCarbs(editingMeal.carbs.toString());
        setFat(editingMeal.fat.toString());
        setIngredients(editingMeal.ingredients || []);
        setMealType(editingMeal.mealType || 'snack');
      } else {
        setName('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
        setIngredients([]);
        setMealType(initialMealType || 'snack');
      }
    }
  }, [isOpen, editingMeal, initialMealType]);

  const addIngredient = () => {
    if (!ingName || !ingAmount) return;
    const newIng: Ingredient = {
      name: ingName,
      amount: Number(ingAmount),
      unit: ingUnit,
      calories: Number(ingCals) || 0
    };
    setIngredients([...ingredients, newIng]);
    setIngName(''); setIngAmount(''); setIngCals('');
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Auto-calculate macros from ingredients
  useEffect(() => {
    if (ingredients.length > 0) {
      const totalCals = ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0);
      if (totalCals > 0) setCalories(totalCals.toString());
    }
  }, [ingredients]);

  const handleSave = () => {
    if (!name || (!calories && ingredients.length === 0)) return;
    
    const mealData = {
      name,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      isAiGenerated: false,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      mealType: mealType
    };

    if (editingMeal) {
      updateMeal(editingMeal.id, mealData);
    } else {
      addMeal(mealData);
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
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-6 z-[70] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <PlusCircle size={22} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Agregar Comida</h2>
              </div>
              <button onClick={onClose} className="!w-8 !h-8 !min-w-0 !p-0 !rounded-full !flex !items-center !justify-center !bg-gray-100 !text-gray-500 active:scale-90 transition-transform">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Ensalada de pollo"
                  className="w-full !border !border-gray-200 rounded-[24px] !px-5 !py-4 focus:outline-none focus:ring-2 focus:ring-[#D4F87A] text-gray-900 font-bold !bg-gray-50"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Momento del día</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['desayuno', 'almuerzo', 'cena', 'snack'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMealType(type)}
                      className={cn(
                        "py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all border",
                        mealType === type 
                          ? "bg-gray-900 border-gray-900 text-white shadow-md" 
                          : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients Toggle */}
              <button 
                onClick={() => setShowIngredients(!showIngredients)}
                className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700"
              >
                <div className="flex items-center gap-2">
                   <span>Ingredientes ({ingredients.length})</span>
                   {ingredients.length > 0 && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                </div>
                {showIngredients ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showIngredients && (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
                  <div className="space-y-3">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div>
                          <div className="font-bold text-sm text-gray-900">{ing.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{ing.amount}{ing.unit} • {ing.calories} kcal</div>
                        </div>
                        <button onClick={() => removeIngredient(i)} className="text-red-400 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={ingName} onChange={(e) => setIngName(e.target.value)} placeholder="Nombre" className="col-span-2 !bg-white !border !border-gray-200 rounded-xl !px-3 !py-2 text-sm focus:outline-none" />
                    <input type="number" value={ingAmount} onChange={(e) => setIngAmount(e.target.value)} placeholder="Cant." className="!bg-white !border !border-gray-200 rounded-xl !px-3 !py-2 text-sm focus:outline-none" />
                    <select value={ingUnit} onChange={(e) => setIngUnit(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                      <option value="g">gramos</option>
                      <option value="ml">ml</option>
                      <option value="pz">piezas</option>
                      <option value="tz">tazas</option>
                    </select>
                    <input type="number" value={ingCals} onChange={(e) => setIngCals(e.target.value)} placeholder="Kcal" className="col-span-2 !bg-white !border !border-gray-200 rounded-xl !px-3 !py-2 text-sm focus:outline-none" />
                  </div>
                  <button onClick={addIngredient} className="w-full bg-[#D4F87A] text-[#1a2e00] py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                    + Añadir ingrediente
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Información Nutricional Total</label>
                <div className="mb-4">
                  <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
                    placeholder="Calorías totales"
                    className="w-full !border !border-gray-200 rounded-[24px] !px-5 !py-4 focus:outline-none focus:ring-2 focus:ring-[#D4F87A] text-gray-900 font-extrabold text-2xl !bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Proteínas', val: protein, set: setProtein, color: 'text-orange-500' },
                    { label: 'Carbos', val: carbs, set: setCarbs, color: 'text-blue-500' },
                    { label: 'Grasas', val: fat, set: setFat, color: 'text-yellow-500' },
                  ].map(({ label, val, set, color }) => (
                    <div key={label}>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">{label}</label>
                      <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder="g"
                        className={cn("w-full !border !border-gray-200 rounded-[20px] !px-3 !py-3 focus:outline-none focus:ring-2 focus:ring-[#D4F87A] font-bold text-center !bg-gray-50", color)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={!name || (!calories && ingredients.length === 0)}
              className="w-full bg-gray-900 text-white rounded-[24px] py-4 font-bold text-lg disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 transition-transform mb-4"
            >
              Guardar Comida
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
