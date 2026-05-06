'use client';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createGroup, joinGroup } from '@/lib/mutations/groups';
import NutritionSettings from '@/components/profile/NutritionSettings';
import HealthSyncModal from '@/components/modals/HealthSyncModal';
import NutritionGuideModal from '@/components/modals/NutritionGuideModal';
import { Users, Settings, Watch, ChevronRight, LogOut, User as UserIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile } = useAppStore();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Limpiar el store de Zustand
      useAppStore.setState({
        profile: {
          id: '',
          name: '',
          email: '',
          hasCompletedOnboarding: false,
          primaryGoal: 'active',
          dietType: 'omnivore',
          fastingSchedule: 'none',
          areasForImprovement: [],
          age: undefined,
          gender: undefined,
          dailyGoals: { waterMl: 2500, calories: 2200, activityMinutes: 45, proteinG: 0, carbsG: 0, fatG: 0 },
          glassSizeMl: 250,
          groupCode: undefined,
          groupId: undefined,
          goals: [],
        },
        meals: [],
        water: [],
        activities: [],
        fastingHistory: [],
        currentFast: null,
        currentActivity: null,
      });

      // Forzar recarga a login para asegurar limpieza total de cookies y estado
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/login';
    }
  };

  const handleCreateGroup = async () => {
    const name = window.prompt('Nombra tu nuevo grupo');
    if (!name) return;
    
    try {
      const code = await createGroup(name);
      if (code) {
        window.alert(`¡Grupo creado! Código: ${code}\n\nCompártelo con tus amigos.`);
      } else {
        window.alert('Hubo un error al crear el grupo. Intenta de nuevo.');
      }
    } catch {
      window.alert('Error inesperado. Intenta de nuevo.');
    }
  };

  const handleJoinGroup = async () => {
    const code = window.prompt('Ingresa el código del grupo');
    if (!code) return;
    
    try {
      const success = await joinGroup(code.trim().toUpperCase());
      if (success) {
        window.alert('Te has unido al grupo!');
      } else {
        window.alert('Código inválido o error al unirse.');
      }
    } catch {
      window.alert('Error inesperado. Intenta de nuevo.');
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Mi Perfil</h1>

      {profile.groupCode ? (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 mb-8 shadow-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Mi Grupo</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 tracking-widest">{profile.groupCode}</span>
            <button onClick={() => {
                navigator.clipboard.writeText(profile.groupCode || '');
                window.alert('Código copiado al portapapeles');
              }}
              className="bg-[#D4F87A] text-[#1a2e00] font-bold text-sm px-4 py-2 rounded-full active:scale-95 transition-transform">
              Copiar
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Comparte este código con tus amigos</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 mb-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Users size={24} />
          </div>
          <p className="font-bold text-gray-900 mb-4">No estás en un grupo</p>
          <div className="flex gap-2">
            <button 
              onClick={handleCreateGroup}
              className="flex-1 bg-gray-900 text-white font-bold text-sm py-3 rounded-full active:scale-95 transition-transform"
            >
              Crear grupo
            </button>
            <button 
              onClick={handleJoinGroup}
              className="flex-1 bg-gray-100 text-gray-600 font-bold text-sm py-3 rounded-full active:scale-95 transition-transform"
            >
              Tengo un código
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8 bg-white p-6 justify-between rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden relative border border-gray-100">
            <Image 
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${profile.name || 'default'}`} 
              alt="Avatar" 
              fill 
              referrerPolicy="no-referrer"
              unoptimized
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{profile.name}</h2>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Configuración general</p>
          </div>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 active:scale-95 transition-transform">
          <Settings size={20} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-8 px-2">
        <div className="text-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Edad</p>
          <p className="text-base font-bold text-gray-900">{profile.age || '--'}</p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Altura</p>
          <p className="text-base font-bold text-gray-900">{profile.heightCm || '--'}<span className="text-[10px] text-gray-400 ml-0.5">cm</span></p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Peso</p>
          <p className="text-base font-bold text-gray-900">{profile.weightKg || '--'}<span className="text-[10px] text-gray-400 ml-0.5">kg</span></p>
        </div>
        <div 
          onClick={() => setIsGuideOpen(true)}
          className="text-center border-l border-gray-100 cursor-pointer active:opacity-60 transition-opacity"
        >
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">IMC <Info size={10} /></p>
          <p className="text-base font-bold text-blue-500">{(profile.weightKg && profile.heightCm) ? (profile.weightKg / Math.pow(profile.heightCm/100, 2)).toFixed(1) : '--'}</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 mb-8 p-2">
        <GoalItem 
          title="Plan Nutricional" 
          value={
            { 'omnivore': 'Omnívora', 'vegetarian': 'Vegetariana', 'vegan': 'Vegana', 'keto': 'Keto', 'paleo': 'Paleo' }[profile.dietType || 'omnivore'] || 'Omnívora'
          } 
          onClick={() => setIsSettingsOpen(true)}
        />
        <div className="h-px w-full bg-gray-50 ml-4" />
        <GoalItem 
          title="Ayuno Intermitente" 
          value={profile.fastingSchedule === 'none' ? 'Sin ayuno' : profile.fastingSchedule || 'Sin ayuno'} 
          onClick={() => setIsSettingsOpen(true)}
        />
        <div className="h-px w-full bg-gray-50 ml-4" />
        <DeviceItem 
          icon={<Watch size={20} className="text-gray-400" />} 
          title="Dispositivos" 
          subtitle="Apple Health, Google Fit..." 
          status="Conectar" 
          onClick={() => setIsHealthOpen(true)}
        />
        <div className="h-px w-full bg-gray-50 ml-4" />
        <div className="flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 text-sm pl-2">Notificaciones</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 mt-4">
        <div className="bg-green-100 rounded-[24px] p-4 flex flex-col justify-between aspect-square">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-800/60 leading-tight">Actividad</span>
          <span className="text-lg font-bold text-green-900">{profile.dailyGoals.activityMinutes}<span className="text-xs ml-0.5">m</span></span>
        </div>
        <div className="bg-[#D4F87A] rounded-[24px] p-4 flex flex-col justify-between aspect-square">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a2e00]/60 leading-tight">Agua<br/>Objetivo</span>
          <span className="text-lg font-bold text-[#1a2e00]">
            {(profile.dailyGoals.waterMl / 1000).toFixed(1)}<span className="text-xs ml-0.5">L</span>
            <span className="text-[10px] opacity-70 flex items-center justify-start mt-0.5 whitespace-nowrap">
              ({Math.ceil(profile.dailyGoals.waterMl / (profile.glassSizeMl || 250))} vasos)
            </span>
          </span>
        </div>
        <div className="bg-orange-100 rounded-[24px] p-4 flex flex-col justify-between aspect-square">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800/60 leading-tight">Calorías<br/>Diarias</span>
          <span className="text-lg font-bold text-orange-900">{profile.dailyGoals.calories}<span className="text-xs ml-0.5">k</span></span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 mb-8 shadow-sm border border-gray-100">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 px-1">Objetivos de Macros</p>
        <div className="space-y-4">
          <MacroBar label="Proteína" current={0} target={profile.dailyGoals.proteinG} color="bg-orange-400" />
          <MacroBar label="Carbohidratos" current={0} target={profile.dailyGoals.carbsG} color="bg-blue-400" />
          <MacroBar label="Grasas" current={0} target={profile.dailyGoals.fatG} color="bg-yellow-400" />
        </div>
      </div>
      
      <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 font-bold rounded-3xl py-4 flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform">
        <LogOut size={20} />
        Cerrar sesión
      </button>
      
      <NutritionSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HealthSyncModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
      <NutritionGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      
    </div>
  );
}

function DeviceItem({ icon, title, subtitle, status, onClick }: { icon: React.ReactNode, title: string, subtitle: string, status: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </div>
  );
}

function GoalItem({ title, value, onClick }: { title: string, value: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors rounded-2xl">
      <span className="font-bold text-gray-900 text-sm pl-2">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{value}</span>
        <ChevronRight size={18} className="text-gray-300" />
      </div>
    </div>
  );
}

function MacroBar({ label, target, color }: { label: string, current: number, target: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-1.5 px-1">
        <span className="text-xs font-bold text-gray-700">{label}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">{target}g</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full opacity-30", color)} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
