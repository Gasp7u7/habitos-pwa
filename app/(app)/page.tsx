'use client';
import { useAppStore } from '@/lib/store';
import { Activity, Droplet, Flame, ArrowRight, Utensils, HeartPulse, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { profile, activities, meals, water, currentFast } = useAppStore();
  
  const todayActivities = activities.filter(a => a.startedAt.startsWith(new Date().toISOString().split('T')[0]));
  const todayMeals = meals.filter(m => m.loggedAt.startsWith(new Date().toISOString().split('T')[0]));
  const todayWater = water.filter(w => w.loggedAt.startsWith(new Date().toISOString().split('T')[0]));
  
  const waterTotal = todayWater.reduce((sum, w) => sum + w.amountMl, 0);
  const caloriesEaten = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);

  // Generate quick days array for the swiper
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
      <div className="flex justify-between items-center mb-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
            <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name}`} alt="Avatar" width={48} height={48} />
          </div>
          <div>
            <p className="text-gray-500 font-medium text-xs">¡Buen día!</p>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{profile.name}</h1>
          </div>
        </div>
      </div>

      {/* Hero Card like Image 1 */}
      <div className="bg-[#D4F87A] rounded-[32px] p-6 mb-6 relative overflow-hidden">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-[#1a2e00]/60 font-bold text-[10px] uppercase tracking-widest mb-2">
              <Activity size={12} strokeWidth={3} /> INTAKE DIARIO
            </div>
            <h2 className="text-3xl font-bold text-[#1a2e00] leading-tight max-w-[150px] tracking-tight">
              Progreso Semanal
            </h2>
          </div>
          <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center relative bg-white/40 backdrop-blur-md">
             {/* Simple circular visual */}
             <div className="text-center">
               <span className="block text-2xl font-bold text-[#1a2e00] tabular-nums mt-1 leading-none">4</span>
               <span className="text-[10px] uppercase font-bold text-[#1a2e00]/60 tracking-widest mt-0.5 block">DÍAS</span>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white rounded-[24px] p-5 shadow-none border border-gray-100 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">PROTEÍNA</div>
          <div className="flex justify-between items-end">
            <div>
              <span className="text-3xl font-bold text-gray-900 leading-none tabular-nums mt-1 block">{totalProtein}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Flame size={16} className="text-orange-500" />
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 mt-2">Gramos</div>
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-none border border-gray-100 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">HIDRATACIÓN</div>
          <div className="flex justify-between items-end">
            <div>
              <span className="text-3xl font-bold text-gray-900 leading-none tabular-nums mt-1 block">{(waterTotal / 1000).toFixed(1)}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Droplet size={16} className="text-blue-500" />
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 mt-2">Litros</div>
        </div>
      </div>

      {/* Calendar Swiper Header */}
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-lg font-bold text-gray-900">{format(new Date(), "MMMM yyyy", { locale: es })}</h2>
        <div className="flex items-center gap-2">
           <button className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center"><ArrowRight size={14} className="rotate-180 text-gray-400"/></button>
           <button className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center"><ArrowRight size={14} className="text-gray-900"/></button>
        </div>
      </div>

      {/* Days Swiper */}
      <div className="flex gap-2 justify-between mb-8 px-1">
        {days.map((d, i) => {
          const isToday = i === 6;
          return (
            <div key={i} className={`flex-col items-center justify-center flex transition-transform ${isToday ? 'scale-110' : ''}`}>
              <span className="text-xs font-semibold text-gray-400 mb-3">{format(d, 'eeeee', { locale: es }).substring(0, 1)}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isToday ? 'bg-[#D4F87A] text-gray-900 shadow-sm' : 'text-gray-900'}`}>
                {format(d, 'dd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fasting Quick Status (Optional but good) */}
      {currentFast && (
        <div className="bg-gray-900 rounded-[32px] p-5 shadow-sm mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <Clock size={20} className="text-[#D4F87A]" />
              </div>
              <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Ayuno Activo</h4>
                <div className="text-white font-bold text-xl leading-none">{currentFast.targetHours}h {profile.fastingSchedule}</div>
              </div>
            </div>
            <Link href="/diary" className="bg-[#D4F87A] text-gray-900 text-xs font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform">Revisar</Link>
        </div>
      )}

      {/* Recent Activities */}
      <div className="flex justify-between items-center mb-4 mt-8 px-1">
        <h2 className="text-lg font-bold text-gray-900">Actividades Recientes</h2>
        <Link href="/progress" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ver Todo</Link>
      </div>
      
      <div className="space-y-3 mb-8">
        {activities.slice().reverse().slice(0, 3).map(a => (
          <div key={a.id} className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <Activity size={20} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">{a.type === 'walk' ? 'Caminata' : 'Running'}</h4>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                  {format(new Date(a.startedAt), "d MMM 'a las' HH:mm", { locale: es })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-gray-900 leading-none">{(a.distanceMeters / 1000).toFixed(2)}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">KM</div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No hay actividades recientes.</p>
        )}
      </div>

      {/* Meals - Diet Focus */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Diario de Comidas</h2>
      
      <div className="space-y-4 mb-4">
        {todayMeals.slice(0, 3).map(m => (
          <div key={m.id} className="relative flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-base">{m.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame size={12} className="text-orange-500" />
                <span className="text-sm font-semibold text-gray-500">{m.calories} kcal</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center relative shadow-sm border border-gray-200 overflow-hidden">
               {/* Cute placeholder for food */}
               <Image src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80`} alt="Food" fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        ))}
        {todayMeals.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No has registrado comidas todavía.</p>
        )}
      </div>
    </div>
  );
}
