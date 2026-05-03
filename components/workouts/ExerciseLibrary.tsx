'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dumbbell, PersonStanding, Flame, Search, PlayCircle } from 'lucide-react';

import { MuscleGroup, Environment, Exercise, Routine, RoutineExercise } from '@/lib/types';
import { Plus, X, Settings2 } from 'lucide-react';
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

export default function ExerciseLibrary() {
  const router = useRouter();
  const { customExercises, customRoutines, addCustomExercise, addCustomRoutine } = useAppStore();

  const ALL_EXERCISES = [...DEFAULT_EXERCISES, ...customExercises];
  const ALL_ROUTINES = [...DEFAULT_ROUTINES, ...customRoutines];

  const [viewMode, setViewMode] = useState<'exercises' | 'routines'>('exercises');
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
  
  const handleSaveExercise = () => {
    if(!newExName || newExMuscleGroups.length === 0 || newExEnvironment.length === 0) return;
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
    setIsCreatingExercise(false);
    setNewExName('');
    setNewExMuscleGroups([]);
    setNewExEnvironment([]);
    setNewExDescription('');
  };

  const handleSaveRoutine = () => {
    if(!newRutName || newRutExercises.length === 0) return;
    addCustomRoutine({
      name: newRutName,
      level: newRutLevel,
      environment: newRutEnvironment,
      description: newRutDescription || 'Rutina personalizada.',
      exercises: newRutExercises
    });
    setIsCreatingRoutine(false);
    setNewRutName('');
    setNewRutExercises([]);
    setNewRutDescription('');
  };

  const filteredExercises = ALL_EXERCISES.filter(ex => {
    const matchesMuscle = activeMuscle === 'todo' || ex.muscleGroups.includes(activeMuscle);
    const matchesEnv = activeEnvironment === 'todo' || ex.environment.includes(activeEnvironment);
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesEnv && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-1 rounded-2xl flex">
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

      {viewMode === 'exercises' ? (
        <>
          {isCreatingExercise ? (
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xl text-gray-900">Nuevo Ejercicio</h3>
                <button onClick={() => setIsCreatingExercise(false)} className="text-gray-400 hover:text-gray-600">
                   <X size={24} />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Ejercicio</label>
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:outline-none focus:border-indigo-500"
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
                    <input type="number" value={newExSets} onChange={(e) => setNewExSets(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reps</label>
                    <input type="number" value={newExReps} onChange={(e) => setNewExReps(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiempo (s)</label>
                    <input type="number" value={newExDuration} onChange={(e) => setNewExDuration(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500" min="0" />
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
                Guardar Ejercicio
              </button>
            </div>
          ) : (
            <>
              {/* Search & Env Filter */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar ejercicios..."
                className="w-full bg-white border border-gray-200 rounded-[24px] py-3.5 pl-12 pr-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="bg-gray-100 p-1 rounded-2xl flex">
              <button
                className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-colors", activeEnvironment === 'todo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
                onClick={() => setActiveEnvironment('todo')}
              >
                Todo
              </button>
              <button
                className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-colors", activeEnvironment === 'gym' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
                onClick={() => setActiveEnvironment('gym')}
              >
                Gym
              </button>
              <button
                className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-colors", activeEnvironment === 'home' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
                onClick={() => setActiveEnvironment('home')}
              >
                Casa / Parque
              </button>
            </div>
          </div>

          {/* Muscle Filter */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {(['todo', 'pecho', 'espalda', 'piernas', 'brazos', 'core', 'cardio'] as const).map(muscle => (
              <button
                key={muscle}
                onClick={() => setActiveMuscle(muscle)}
                className={cn(
                  "px-5 py-2.5 rounded-[20px] text-sm font-bold whitespace-nowrap transition-transform active:scale-95",
                  activeMuscle === muscle
                    ? "bg-[#D4F87A] text-[#1a2e00] shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200"
                )}
              >
                {muscle === 'todo' ? 'Todos los grupos' : muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreatingExercise(true)}
            className="w-full bg-white border border-gray-200 text-gray-900 rounded-[20px] py-3.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus size={18} /> Añadir Ejercicio Personalizado
          </button>

          {/* Exercise List */}
          <div className="grid gap-4">
            {filteredExercises.length > 0 ? (
              filteredExercises.map(ex => (
                <div key={ex.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{ex.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ex.muscleGroups.map(mg => (
                          <span key={mg} className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
                            {mg}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                      ex.difficulty === 'fácil' ? 'bg-green-50 text-green-600' :
                      ex.difficulty === 'medio' ? 'bg-orange-50 text-orange-600' :
                      'bg-red-50 text-red-600'
                    )}>
                      {ex.difficulty}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {ex.description}
                  </p>
                  <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm mt-1">
                    <PlayCircle size={16} /> Ver tutorial
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-gray-500 font-medium">No se encontraron ejercicios con esos filtros.</p>
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
                <h3 className="font-bold text-xl text-gray-900">Nueva Rutina</h3>
                <button onClick={() => setIsCreatingRoutine(false)} className="text-gray-400 hover:text-gray-600">
                   <X size={24} />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Rutina</label>
                <input
                  type="text"
                  value={newRutName}
                  onChange={(e) => setNewRutName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:outline-none focus:border-indigo-500"
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
                              <input type="number" value={rutEx.sets} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, sets: Number(e.target.value) } : r))} className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-indigo-500" min="1" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Reps</label>
                              <input type="number" value={rutEx.reps} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, reps: Number(e.target.value) } : r))} className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-indigo-500" min="0" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">T.(s)</label>
                              <input type="number" value={rutEx.duration} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, duration: Number(e.target.value) } : r))} className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-indigo-500" min="0" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Desc(s)</label>
                              <input type="number" value={rutEx.rest} onChange={(e) => setNewRutExercises(newRutExercises.map(r => r.exerciseId === ex.id ? { ...r, rest: Number(e.target.value) } : r))} className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-indigo-500" min="0" />
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
                Guardar Rutina
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <button
                onClick={() => setIsCreatingRoutine(true)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-[20px] py-3.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform mb-2"
              >
                <Plus size={18} /> Crear Rutina Personalizada
              </button>

              {ALL_ROUTINES.map(routine => (
            <div key={routine.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {routine.environment === 'gym' ? 'Gimnasio' : 'Parque/Casa'}
                    </span>
                    <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {routine.level}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 leading-tight">{routine.name}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {routine.description}
              </p>
              <div className="mt-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Circuito de {routine.exercises.length} Ejercicios:</h4>
                <div className="space-y-2">
                  {routine.exercises.map((routEx, idx) => {
                    const exercise = ALL_EXERCISES.find(e => e.id === routEx.exerciseId);
                    if (!exercise) return null;
                    return (
                      <div key={`${routine.id}-${routEx.exerciseId}-${idx}`} className="flex items-center gap-3 bg-gray-50 p-3 rounded-[16px]">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-400 shadow-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm leading-tight">{exercise.name}</span>
                          <span className="text-xs text-gray-500 font-medium mt-0.5">
                            {routEx.sets} series x {routEx.reps ? `${routEx.reps} reps` : `${routEx.duration}s`} {routEx.rest ? `· ${routEx.rest}s desc.` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={() => {
                  useAppStore.getState().setActiveRoutine(routine);
                  router.push('/activity?type=gym');
                }}
                className="w-full mt-2 bg-gray-900 text-white rounded-[20px] py-3.5 font-bold text-sm active:scale-95 transition-transform"
              >
                Comenzar Rutina
              </button>
            </div>
          ))}
        </div>
          )}
        </>
      )}
    </div>
  );
}
