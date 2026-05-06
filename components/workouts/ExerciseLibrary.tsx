'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Flame, X, Search, Plus, PlayCircle, Trash2, Pencil } from 'lucide-react';


import { MuscleGroup, Environment, Exercise, Routine, RoutineExercise } from '@/lib/types';

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export const DEFAULT_EXERCISES: Exercise[] = [
  // Pecho
  { id: '1', name: 'Press de Banca', muscleGroups: ['pecho', 'brazos'], environment: ['gym'], difficulty: 'medio', description: 'Ejercicio compuesto fundamental para el desarrollo del pecho.' },
  { id: '2', name: 'Flexiones (Push-ups)', muscleGroups: ['pecho', 'brazos', 'core'], environment: ['gym', 'home'], difficulty: 'fácil', description: 'Excelente ejercicio con peso corporal para pectorales y tríceps.' },
  { id: '3', name: 'Aperturas con Mancuernas', muscleGroups: ['pecho'], environment: ['gym'], difficulty: 'medio', description: 'Aisla el pecho y mejora la amplitud de movimiento.' },
  { id: '16', name: 'Fondos en Paralelas', muscleGroups: ['pecho', 'brazos'], environment: ['gym', 'home'], difficulty: 'difícil', description: 'Desarrolla la parte inferior del pecho y tríceps. Excelente para calistenia en el parque.' },
  { id: '17', name: 'Press Inclinado', muscleGroups: ['pecho', 'brazos'], environment: ['gym'], difficulty: 'medio', description: 'Enfocado en la porción superior del pectoral.' },
  
  // Espalda
  { id: '4', name: 'Dominadas (Pull-ups)', muscleGroups: ['espalda', 'brazos'], environment: ['gym', 'home'], difficulty: 'difícil', description: 'El mejor ejercicio de peso corporal para una espalda amplia. Usa una barra en el parque.' },
  { id: '5', name: 'Remo con Barra', muscleGroups: ['espalda'], environment: ['gym'], difficulty: 'medio', description: 'Construye grosor en la espalda y mejora la postura.' },
  { id: '6', name: 'Superman', muscleGroups: ['espalda', 'core'], environment: ['home'], difficulty: 'fácil', description: 'Ideal para aislar y fortalecer la espalda baja sin equipo.' },
  { id: '18', name: 'Jalón al Pecho', muscleGroups: ['espalda', 'brazos'], environment: ['gym'], difficulty: 'fácil', description: 'Alternativa en máquina para desarrollar la amplitud de la espalda.' },
  { id: '19', name: 'Remo Invertido', muscleGroups: ['espalda', 'brazos'], environment: ['gym', 'home'], difficulty: 'medio', description: 'Se puede hacer con barras bajas en un parque de calistenia.' },

  // Piernas
  { id: '7', name: 'Sentadillas (Squats)', muscleGroups: ['piernas', 'core'], environment: ['gym', 'home'], difficulty: 'medio', description: 'Construye fuerza general en cuádriceps, glúteos y core.' },
  { id: '8', name: 'Prensa de Piernas', muscleGroups: ['piernas'], environment: ['gym'], difficulty: 'fácil', description: 'Permite mover mucho peso aislando las piernas de forma segura.' },
  { id: '9', name: 'Zancadas (Lunges)', muscleGroups: ['piernas'], environment: ['gym', 'home'], difficulty: 'medio', description: 'Corrige desequilibrios musculares trabajando cada pierna individualmente.' },
  { id: '20', name: 'Sentadilla Búlgara', muscleGroups: ['piernas', 'core'], environment: ['gym', 'home'], difficulty: 'difícil', description: 'Gran trabajo unilateral para glúteos y cuádriceps que puedes hacer en el banco del parque.' },
  { id: '21', name: 'Peso Muerto', muscleGroups: ['piernas', 'espalda', 'core'], environment: ['gym'], difficulty: 'difícil', description: 'El rey de los ejercicios compuestos para la cadena posterior.' },

  // Brazos
  { id: '10', name: 'Curl de Bíceps', muscleGroups: ['brazos'], environment: ['gym'], difficulty: 'fácil', description: 'Aisla el bíceps para hipertrofia.' },
  { id: '11', name: 'Fondos de Tríceps (Dips)', muscleGroups: ['brazos', 'pecho'], environment: ['gym', 'home'], difficulty: 'medio', description: 'Gran constructor de masa para los tríceps. Se puede hacer en bancas de parque.' },
  { id: '22', name: 'Extensiones de Tríceps', muscleGroups: ['brazos'], environment: ['gym'], difficulty: 'fácil', description: 'Aislamiento de tríceps en polea o con mancuerna.' },
  
  // Core
  { id: '12', name: 'Plancha (Plank)', muscleGroups: ['core'], environment: ['gym', 'home'], difficulty: 'fácil', description: 'Estabiliza la zona media y mejora la postura.' },
  { id: '13', name: 'Crunch Abdominal', muscleGroups: ['core'], environment: ['gym', 'home'], difficulty: 'fácil', description: 'Enfocado en el recto abdominal.' },
  { id: '23', name: 'Elevación de Piernas', muscleGroups: ['core'], environment: ['gym', 'home'], difficulty: 'medio', description: 'Trabaja intensamente el abdomen inferior, ideal colgado de una barra en el parque.' },

  // Cardio
  { id: '14', name: 'Burpees', muscleGroups: ['cardio', 'piernas', 'pecho', 'core'], environment: ['gym', 'home'], difficulty: 'difícil', description: 'Ejercicio de cuerpo completo de alta intensidad (HIIT).' },
  { id: '15', name: 'Jumping Jacks', muscleGroups: ['cardio'], environment: ['home'], difficulty: 'fácil', description: 'Sirve para elevar el ritmo cardíaco rápidamente.' },
  { id: '24', name: 'Mountain Climbers', muscleGroups: ['cardio', 'core'], environment: ['home'], difficulty: 'medio', description: 'Acelera el metabolismo mientras estabilizas el tronco.' },
];

const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'r1',
    name: 'Día de Empuje (Push)',
    level: 'Intermedio',
    environment: 'gym',
    description: 'Enfocado en pecho, hombros y tríceps. Ideal para ganar volumen y fuerza de empuje.',
    exercises: [
      { exerciseId: '1', sets: 4, reps: 10, rest: 90 },
      { exerciseId: '17', sets: 3, reps: 10, rest: 90 },
      { exerciseId: '11', sets: 3, reps: 12, rest: 60 },
      { exerciseId: '22', sets: 3, reps: 15, rest: 60 },
      { exerciseId: '12', sets: 3, duration: 60, rest: 45 }
    ]
  },
  {
    id: 'r2',
    name: 'Calistenia en Parque',
    level: 'Todos los niveles',
    environment: 'home',
    description: 'Entrenamiento completo usando el mobiliario del parque y tu peso corporal.',
    exercises: [
      { exerciseId: '4', sets: 4, reps: 8, rest: 120 },
      { exerciseId: '16', sets: 4, reps: 10, rest: 90 },
      { exerciseId: '2', sets: 4, reps: 15, rest: 60 },
      { exerciseId: '20', sets: 3, reps: 12, rest: 60 },
      { exerciseId: '23', sets: 3, reps: 15, rest: 60 },
      { exerciseId: '14', sets: 3, reps: 10, rest: 60 }
    ]
  },
  {
    id: 'r3',
    name: 'Día de Tirón (Pull)',
    level: 'Intermedio',
    environment: 'gym',
    description: 'Desarrollo de espalda y bíceps. Fundamental para la amplitud de la espalda.',
    exercises: [
      { exerciseId: '21', sets: 4, reps: 5, rest: 120 },
      { exerciseId: '4', sets: 4, reps: 8, rest: 90 },
      { exerciseId: '5', sets: 3, reps: 10, rest: 90 },
      { exerciseId: '18', sets: 3, reps: 12, rest: 60 },
      { exerciseId: '10', sets: 3, reps: 15, rest: 60 }
    ]
  },
  {
    id: 'r4',
    name: 'Día de Piernas Asesino',
    level: 'Avanzado',
    environment: 'gym',
    description: 'Poder y fuerza para el tren inferior. Prepárate para sudar.',
    exercises: [
      { exerciseId: '7', sets: 4, reps: 8, rest: 120 },
      { exerciseId: '8', sets: 4, reps: 12, rest: 90 },
      { exerciseId: '20', sets: 3, reps: 10, rest: 90 },
      { exerciseId: '9', sets: 3, reps: 12, rest: 60 },
      { exerciseId: '12', sets: 3, duration: 60, rest: 45 }
    ]
  }
];

export default function ExerciseLibrary({ initialMode = 'exercises' }: { initialMode?: 'exercises' | 'routines' }) {
  const router = useRouter();
  const { customExercises, customRoutines, addCustomExercise, addCustomRoutine, deleteCustomExercise, deleteCustomRoutine } = useAppStore();

  const ALL_EXERCISES = [...DEFAULT_EXERCISES, ...customExercises];
  const ALL_ROUTINES = [...DEFAULT_ROUTINES, ...customRoutines];

  const [viewMode, setViewMode] = useState<'exercises' | 'routines'>(initialMode);
  const [activeMuscle, setActiveMuscle] = useState<MuscleGroup | 'todo'>('todo');
  const [activeEnvironment, setActiveEnvironment] = useState<Environment | 'todo'>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Creation State
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  
  // Form State - Exercise
  const [newExName, setNewExName] = useState('');
  const [newExMuscleGroups, setNewExMuscleGroups] = useState<MuscleGroup[]>([]);
  const [newExEnvironment, setNewExEnvironment] = useState<Environment[]>([]);
  const [newExDifficulty, setNewExDifficulty] = useState<'fácil'|'medio'|'difícil'>('fácil');
  const [newExDescription, setNewExDescription] = useState('');
  const [newExSets, setNewExSets] = useState<number>(3);
  const [newExReps, setNewExReps] = useState<number>(10);
  const [newExDuration, setNewExDuration] = useState<number>(0);

  // Form State - Routine
  const [newRutName, setNewRutName] = useState('');
  const [newRutLevel, setNewRutLevel] = useState('Intermedio');
  const [newRutEnvironment, setNewRutEnvironment] = useState<Environment>('gym');
  const [newRutDescription, setNewRutDescription] = useState('');
  const [newRutExercises, setNewRutExercises] = useState<RoutineExercise[]>([]);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEditExercise = (ex: Exercise) => {
    setNewExName(ex.name);
    setNewExMuscleGroups(ex.muscleGroups);
    setNewExEnvironment(ex.environment);
    setNewExDifficulty(ex.difficulty);
    setNewExDescription(ex.description || '');
    setNewExSets(ex.defaultSets || 3);
    setNewExReps(ex.defaultReps || 10);
    setNewExDuration(ex.defaultDuration || 0);
    setEditingId(ex.id);
    setIsCreatingExercise(true);
  };

  const startEditRoutine = (rut: Routine) => {
    setNewRutName(rut.name);
    setNewRutLevel(rut.level);
    setNewRutEnvironment(rut.environment);
    setNewRutDescription(rut.description || '');
    setNewRutExercises(rut.exercises);
    setEditingId(rut.id);
    setIsCreatingRoutine(true);
  };
  
  const handleSaveExercise = () => {
    if(!newExName || newExMuscleGroups.length === 0 || newExEnvironment.length === 0) return;
    
    if (editingId) {
      useAppStore.getState().updateCustomExercise(editingId, {
        name: newExName,
        muscleGroups: newExMuscleGroups,
        environment: newExEnvironment,
        difficulty: newExDifficulty,
        description: newExDescription,
        defaultSets: newExSets,
        defaultReps: newExReps,
        defaultDuration: newExDuration
      });
    } else {
      addCustomExercise({
        name: newExName,
        muscleGroups: newExMuscleGroups,
        environment: newExEnvironment,
        difficulty: newExDifficulty,
        description: newExDescription || 'Ejercicio personalizado.',
        defaultSets: newExSets,
        defaultReps: newExReps,
        defaultDuration: newExDuration
      });
    }
    setIsCreatingExercise(false);
    setEditingId(null);
    // ... rest of reset
  };

  const handleSaveRoutine = () => {
    if(!newRutName || newRutExercises.length === 0) return;

    if (editingId) {
      useAppStore.getState().updateCustomRoutine(editingId, {
        name: newRutName,
        level: newRutLevel,
        environment: newRutEnvironment,
        description: newRutDescription,
        exercises: newRutExercises
      });
    } else {
      addCustomRoutine({
        name: newRutName,
        level: newRutLevel,
        environment: newRutEnvironment,
        description: newRutDescription || 'Rutina personalizada.',
        exercises: newRutExercises
      });
    }
    setIsCreatingRoutine(false);
    setEditingId(null);
    // ... rest of reset
  };

  // Routine Filters
  const [activeLevel, setActiveLevel] = useState<string | 'todos'>('todos');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const filteredExercises = ALL_EXERCISES.filter(ex => {
    const matchesMuscle = activeMuscle === 'todo' || ex.muscleGroups.includes(activeMuscle);
    const matchesEnv = activeEnvironment === 'todo' || ex.environment.includes(activeEnvironment);
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesEnv && matchesSearch;
  });

  const filteredRoutines = ALL_ROUTINES.filter(rut => {
    const matchesLevel = activeLevel === 'todos' || rut.level === activeLevel;
    const matchesEnv = activeEnvironment === 'todo' || rut.environment === activeEnvironment;
    const matchesSearch = rut.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesEnv && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sub-navigation hidden as it's now managed by the parent page tabs */}
      <div className="hidden bg-gray-100 p-1 rounded-2xl flex">
        <button
          className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors", viewMode === 'exercises' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
          onClick={() => setViewMode('exercises')}
        >
          Lista de Ejercicios
        </button>
        <button
          className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors", viewMode === 'routines' ? 'bg-[#D4F87A] text-[#1a2e00] shadow-sm' : 'text-gray-500')}
          onClick={() => setViewMode('routines')}
        >
          <Flame size={16} /> Rutinas Armadas
        </button>
      </div>

      {/* Shared Search Bar for both modes */}
      <div className="px-1 pt-2 pb-4">
        <div className="flex items-center bg-white border border-gray-100 rounded-[32px] px-7 py-1 shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-400 transition-all group">
          <Search size={22} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors shrink-0" />
          <input
            type="text"
            placeholder={viewMode === 'exercises' ? "Buscar ejercicios..." : "Buscar rutinas..."}
            className="flex-1 !py-5 !px-5 !bg-transparent text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {viewMode === 'exercises' ? (
        <>
          {isCreatingExercise ? (
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xl text-gray-900">{editingId ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
                <button onClick={() => { setIsCreatingExercise(false); setEditingId(null); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90 transition-transform">
                   <X size={16} />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Ejercicio</label>
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full !bg-gray-50 !border !border-gray-200 rounded-xl !py-3 !px-4 text-gray-900 font-medium focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Curl Martillo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Grupo Muscular</label>
                <div className="flex flex-wrap gap-2">
                  {(['pecho', 'espalda', 'piernas', 'brazos', 'core', 'cardio'] as MuscleGroup[]).map(mg => (
                    <button
                      key={mg}
                      onClick={() => setNewExMuscleGroups(prev => prev.includes(mg) ? prev.filter(m => m !== mg) : [...prev, mg])}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors border",
                        newExMuscleGroups.includes(mg) ? "bg-[#D4F87A] border-[#D4F87A] text-[#1a2e00] shadow-sm" : "bg-white border-gray-200 text-gray-500"
                      )}
                    >
                      {mg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Entorno (Gym/Casa)</label>
                <div className="flex gap-2">
                  {(['gym', 'home'] as Environment[]).map(env => (
                    <button
                      key={env}
                      onClick={() => setNewExEnvironment(prev => prev.includes(env) ? prev.filter(e => e !== env) : [...prev, env])}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border",
                        newExEnvironment.includes(env) ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-500"
                      )}
                    >
                      {env === 'gym' ? 'Gimnasio' : 'Casa / Parque'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Dificultad</label>
                <div className="flex gap-2">
                  {(['fácil', 'medio', 'difícil'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setNewExDifficulty(diff)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-colors border",
                        newExDifficulty === diff ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-500"
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Valores por Defecto (Opcional)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Series</label>
                    <input type="number" value={newExSets} onChange={(e) => setNewExSets(Number(e.target.value))} className="w-full !bg-gray-50 !border !border-gray-200 rounded-xl !py-2 !px-3 text-sm focus:outline-none focus:border-indigo-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reps</label>
                    <input type="number" value={newExReps} onChange={(e) => setNewExReps(Number(e.target.value))} className="w-full !bg-gray-50 !border !border-gray-200 rounded-xl !py-2 !px-3 text-sm focus:outline-none focus:border-indigo-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiempo (s)</label>
                    <input type="number" value={newExDuration} onChange={(e) => setNewExDuration(Number(e.target.value))} className="w-full !bg-gray-50 !border !border-gray-200 rounded-xl !py-2 !px-3 text-sm focus:outline-none focus:border-indigo-500" min="0" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
                <textarea
                  value={newExDescription}
                  onChange={(e) => setNewExDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:outline-none focus:border-indigo-500 min-h-[80px]"
                  placeholder="Instrucciones o tips de ejecución..."
                />
              </div>

              <button
                onClick={handleSaveExercise}
                disabled={!newExName || newExMuscleGroups.length === 0 || newExEnvironment.length === 0}
                className="w-full mt-2 bg-[#D4F87A] text-[#1a2e00] rounded-[20px] py-4 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-sm"
              >
                {editingId ? 'Actualizar Ejercicio' : 'Guardar Ejercicio'}
              </button>
            </div>
          ) : (
            <>
              {/* Filters Container */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-100/50 p-1 rounded-2xl flex border border-gray-200/50">
              <button
                className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", activeEnvironment === 'todo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400')}
                onClick={() => setActiveEnvironment('todo')}
              >
                Todo
              </button>
              <button
                className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", activeEnvironment === 'gym' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400')}
                onClick={() => setActiveEnvironment('gym')}
              >
                Gimnasio
              </button>
              <button
                className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", activeEnvironment === 'home' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400')}
                onClick={() => setActiveEnvironment('home')}
              >
                Casa
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              {(['todo', 'pecho', 'espalda', 'piernas', 'brazos', 'core', 'cardio'] as const).map(muscle => (
                <button
                  key={muscle}
                  onClick={() => setActiveMuscle(muscle)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                    activeMuscle === muscle
                      ? "bg-gray-900 text-white shadow-md border-gray-900"
                      : "bg-white text-gray-400 border-gray-100 shadow-sm"
                  )}
                >
                  {muscle === 'todo' ? 'Todos' : muscle}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setIsCreatingExercise(true); setEditingId(null); }}
            className="w-full bg-[#D4F87A] text-[#1a2e00] rounded-[24px] py-4 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
          >
            <Plus size={18} /> Nuevo Ejercicio Personalizado
          </button>

          {/* Exercise List */}
          <div className="grid gap-3">
            {filteredExercises.length > 0 ? (
              filteredExercises.map(ex => (
                <div key={ex.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{ex.name}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ex.muscleGroups.map(mg => (
                          <span key={mg} className="bg-gray-50 text-gray-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-gray-100">
                            {mg}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className={cn(
                        "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap",
                        ex.difficulty === 'fácil' ? 'bg-green-50 text-green-600' :
                        ex.difficulty === 'medio' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                      )}>
                        {ex.difficulty}
                      </div>
                      {ex.isCustom && (
                        <div className="flex gap-2">
                           <button 
                             onClick={() => startEditExercise(ex)} 
                             className="p-2 bg-indigo-50 text-indigo-500 rounded-xl active:scale-90 transition-transform"
                           >
                             <Pencil size={14} />
                           </button>
                           <button onClick={() => deleteCustomExercise(ex.id)} className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-transform">
                             <Trash2 size={14} />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                    {ex.description}
                  </p>
                  <button className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mt-1">
                    <PlayCircle size={14} /> Tutorial
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4 bg-white rounded-[32px] border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold text-sm">No se encontraron resultados.</p>
              </div>
            )}
          </div>
            </>
          )}
        </>
      ) : (
        <>
          {isCreatingRoutine ? (
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xl text-gray-900">{editingId ? 'Editar Rutina' : 'Nueva Rutina'}</h3>
                <button onClick={() => { setIsCreatingRoutine(false); setEditingId(null); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90 transition-transform">
                   <X size={16} />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Rutina</label>
                <input
                  type="text"
                  value={newRutName}
                  onChange={(e) => setNewRutName(e.target.value)}
                  className="w-full !bg-gray-50 !border !border-gray-200 rounded-xl !py-3 !px-4 text-gray-900 font-medium focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Espalda Extrema"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Entorno</label>
                <div className="flex gap-2">
                  {(['gym', 'home'] as Environment[]).map(env => (
                    <button
                      key={env}
                      onClick={() => setNewRutEnvironment(env)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border",
                        newRutEnvironment === env ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-500"
                      )}
                    >
                      {env === 'gym' ? 'Gimnasio' : 'Casa / Parque'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nivel</label>
                <div className="flex gap-2">
                  {['Principiante', 'Intermedio', 'Avanzado'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setNewRutLevel(lvl)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold transition-colors border",
                        newRutLevel === lvl ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-500"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
                <textarea
                  value={newRutDescription}
                  onChange={(e) => setNewRutDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:outline-none focus:border-indigo-500 min-h-[80px]"
                  placeholder="Instrucciones generales de la rutina..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ejercicios ({newRutExercises.length})</label>
                <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1 pb-1">
                  {ALL_EXERCISES.map(ex => {
                    const isSelected = newRutExercises.some(re => re.exerciseId === ex.id);
                    const rutEx = newRutExercises.find(re => re.exerciseId === ex.id);

                    return (
                      <div key={ex.id} className={cn("bg-gray-50 rounded-xl p-3 border", isSelected ? 'border-indigo-200 bg-indigo-50/50' : 'border-transparent')}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <div className="flex items-center h-5 mt-0.5">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewRutExercises([...newRutExercises, { 
                                    exerciseId: ex.id, 
                                    sets: ex.defaultSets || 3, 
                                    reps: ex.defaultReps || 10, 
                                    duration: ex.defaultDuration || 0,
                                    rest: 60 
                                  }]);
                                } else {
                                  setNewRutExercises(newRutExercises.filter(re => re.exerciseId !== ex.id));
                                }
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{ex.name}</span>
                            <span className="text-xs text-gray-500">{ex.muscleGroups.join(', ')} - {ex.environment.join(', ')}</span>
                          </div>
                        </label>
                        
                        {isSelected && rutEx && (
                          <div className="mt-3 pl-8 grid grid-cols-4 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Series</label>
                              <input type="number" value={rutEx.sets} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, sets: Number(e.target.value) } : r))} className="w-full !bg-white !border !border-gray-200 rounded-lg !py-1.5 !px-2 text-xs focus:outline-none focus:border-indigo-500" min="1" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Reps</label>
                              <input type="number" value={rutEx.reps} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, reps: Number(e.target.value) } : r))} className="w-full !bg-white !border !border-gray-200 rounded-lg !py-1.5 !px-2 text-xs focus:outline-none focus:border-indigo-500" min="0" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">T.(s)</label>
                              <input type="number" value={rutEx.duration} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, duration: Number(e.target.value) } : r))} className="w-full !bg-white !border !border-gray-200 rounded-lg !py-1.5 !px-2 text-xs focus:outline-none focus:border-indigo-500" min="0" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Desc(s)</label>
                              <input type="number" value={rutEx.rest} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, rest: Number(e.target.value) } : r))} className="w-full !bg-white !border !border-gray-200 rounded-lg !py-1.5 !px-2 text-xs focus:outline-none focus:border-indigo-500" min="0" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveRoutine}
                disabled={!newRutName || newRutExercises.length === 0}
                className="w-full mt-2 bg-[#D4F87A] text-[#1a2e00] rounded-[20px] py-4 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-sm"
              >
                {editingId ? 'Actualizar Rutina' : 'Guardar Rutina'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Routine Level Filter */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                {(['todos', 'Principiante', 'Intermedio', 'Avanzado'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevel(lvl)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                      activeLevel === lvl
                        ? "bg-gray-900 text-white shadow-md border-gray-900"
                        : "bg-white text-gray-400 border-gray-100 shadow-sm"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setIsCreatingRoutine(true); setEditingId(null); }}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-[24px] py-4 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
              >
                <Plus size={18} /> Crear Rutina Personalizada
              </button>

              <div className="grid gap-4">
                {filteredRoutines.map(routine => (
                  <div 
                    key={routine.id} 
                    onClick={() => setSelectedRoutine(routine)}
                    className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between gap-4 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                        <Flame size={24} className={routine.level === 'Avanzado' ? 'text-orange-500' : 'text-gray-400'} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{routine.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{routine.level}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{routine.exercises.length} Ejercicios</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {routine.isCustom && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); startEditRoutine(routine); }} 
                          className="p-2 bg-indigo-50 text-indigo-500 rounded-xl active:scale-90 transition-transform"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                         <Plus size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Routine Detail Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             {/* Modal Header */}
             <div className="p-8 pb-4 relative">
                <button 
                  onClick={() => setSelectedRoutine(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90 transition-transform"
                >
                   <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                   <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                     {selectedRoutine.level}
                   </span>
                   <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                     {selectedRoutine.environment === 'gym' ? 'Gimnasio' : 'Casa/Parque'}
                   </span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">{selectedRoutine.name}</h2>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {selectedRoutine.description}
                </p>
             </div>

             {/* Modal Content - Exercise List */}
             <div className="flex-1 overflow-y-auto p-8 pt-2 space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Circuito de Entrenamiento</h4>
                {selectedRoutine.exercises.map((routEx, idx) => {
                  const exercise = ALL_EXERCISES.find(e => e.id === routEx.exerciseId);
                  if (!exercise) return null;
                  return (
                    <div key={`${selectedRoutine.id}-${routEx.exerciseId}-${idx}`} className="flex items-center gap-4 bg-gray-50 p-4 rounded-[24px] border border-gray-100/50">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs font-black text-gray-400 shadow-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-base leading-tight">{exercise.name}</span>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                          {routEx.sets} series x {routEx.reps ? `${routEx.reps} reps` : `${routEx.duration}s`} {routEx.rest ? `· ${routEx.rest}s desc.` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
             </div>

             {/* Modal Footer */}
             <div className="p-8 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => {
                    useAppStore.getState().setActiveRoutine(selectedRoutine);
                    router.push('/activity?type=gym');
                    setSelectedRoutine(null);
                  }}
                  className="w-full bg-gray-900 text-white rounded-[24px] py-4 font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                   <Flame size={18} className="text-[#D4F87A]" /> Comenzar Rutina Ahora
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
