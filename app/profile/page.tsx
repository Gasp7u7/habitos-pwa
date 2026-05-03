'use client';
import { useAppStore } from '@/lib/store';
import { User, Settings, Watch, Target, Shield, Bell, ChevronRight, Activity } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { profile } = useAppStore();

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-4 tracking-tight">Mi Perfil</h1>

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
        />
        <div className="h-px w-full bg-gray-50 ml-4" />
        <GoalItem 
          title="Ayuno Intermitente" 
          value={profile.fastingSchedule === 'none' ? 'Sin ayuno' : profile.fastingSchedule || 'Sin ayuno'} 
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
      
    </div>
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

function GoalItem({ title, value }: { title: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors rounded-2xl">
      <span className="font-bold text-gray-900 text-sm pl-2">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{value}</span>
        <ChevronRight size={18} className="text-gray-300" />
      </div>
    </div>
  );
}
