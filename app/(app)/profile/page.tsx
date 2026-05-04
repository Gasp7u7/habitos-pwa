'use client';
import { Page, PageContent, f7 } from 'framework7-react';
import { useAppStore } from '@/lib/store';
import { User, Settings, Watch, Target, Shield, Bell, ChevronRight, Activity } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createGroup, joinGroup } from '@/lib/mutations/groups';
import NutritionSettings from '@/components/profile/NutritionSettings';

export default function ProfilePage() {
  const { profile } = useAppStore();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    if (!f7) return;
    f7.dialog.confirm('¿Estás seguro que quieres cerrar sesión?', 'Cerrar sesión', async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      useAppStore.setState({
        meals: [],
        water: [],
        activities: [],
        currentFast: null,
        currentActivity: null,
      });
      router.push('/login');
    });
  };

  const handleCreateGroup = () => {
    if (!f7) return;
    f7.dialog.prompt('Nombra tu nuevo grupo', 'Crear grupo', async (name) => {
      if (!name) return;
      f7.dialog.preloader('Creando...');
      const code = await createGroup(name);
      f7.dialog.close();
      if (code) {
        f7.dialog.alert(`Grupo creado! Código: ${code}`);
      } else {
        f7.dialog.alert('Hubo un error al crear el grupo.');
      }
    });
  };

  const handleJoinGroup = () => {
    if (!f7) return;
    f7.dialog.prompt('Ingresa el código del grupo', 'Unirse a grupo', async (code) => {
      if (!code) return;
      f7.dialog.preloader('Uniéndose...');
      const success = await joinGroup(code.trim().toUpperCase());
      f7.dialog.close();
      if (success) {
        f7.dialog.alert('Te has unido al grupo!');
      } else {
        f7.dialog.alert('Código inválido o error al unirse.');
      }
    });
  };

  return (
    <Page className="bg-[#f8f9fa]">
      <PageContent className="p-6 min-h-full pb-32">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Mi Perfil</h1>

        {profile.groupCode ? (
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 mb-8 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Mi Grupo</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 tracking-widest">{profile.groupCode}</span>
              <button onClick={() => {
                  navigator.clipboard.writeText(profile.groupCode || '');
                  if(f7) f7.toast.create({ text: 'Código copiado', closeTimeout: 2000, position: 'top', cssClass: 'bg-gray-900 text-white font-bold' }).open();
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
              <i className="f7-icons text-xl">person_3_fill</i>
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden relative">
            <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name}`} alt="Avatar" fill referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{profile.name}</h2>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Configuración general</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-transform">
          <Settings size={20} />
        </button>
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
          subtitle="Garmin, Polar, Strava..." 
          status="Conectar" 
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
            {(profile.dailyGoals.waterMl / 1000).toFixed(1)}<span className="text-xs ml-0.5 mr-1">L</span>
            <span className="text-[10px] opacity-70">({Math.ceil(profile.dailyGoals.waterMl / (profile.glassSizeMl || 250))}🥛)</span>
          </span>
        </div>
        <div className="bg-orange-100 rounded-[24px] p-4 flex flex-col justify-between aspect-square">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800/60 leading-tight">Calorías<br/>Diarias</span>
          <span className="text-lg font-bold text-orange-900">{profile.dailyGoals.calories}<span className="text-xs ml-0.5">k</span></span>
        </div>
      </div>
      
      <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 font-bold rounded-3xl py-4 flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform">
        <i className="f7-icons text-xl">rectangle_portrait_and_arrow_right</i>
        Cerrar sesión
      </button>
      
      <NutritionSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      </PageContent>
    </Page>
  );
}

function DeviceItem({ icon, title, subtitle, status }: { icon: React.ReactNode, title: string, subtitle: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors rounded-2xl">
      <div className="flex items-center gap-3">
        {icon}
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
