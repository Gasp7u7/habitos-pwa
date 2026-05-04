'use client';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { format, isSameDay, differenceInHours, differenceInMinutes, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function HomePage() {
  const { profile, activities, meals, water, currentFast } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const todayActivities = activities.filter(a => a.startedAt.startsWith(todayStr));
  const todayMeals = meals.filter(m => m.loggedAt.startsWith(todayStr));
  const todayWater = water.filter(w => w.loggedAt.startsWith(todayStr));
  
  const waterTotalMl = todayWater.reduce((sum, w) => sum + w.amountMl, 0);
  const caloriesEaten = todayMeals.reduce((sum, m) => sum + m.calories, 0);

  const waterGoalMl = Math.round((profile.weightKg || 70) * 35);
  const waterPct = Math.min(100, (waterTotalMl / waterGoalMl) * 100);
  const calPct = Math.min(100, (caloriesEaten / profile.dailyGoals.calories) * 100);
  const gymDone = todayActivities.length > 0;

  const [fastingElapsed, setFastingElapsed] = useState<{ h: number, m: number, pct: number } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const calculateFast = () => {
      if (!currentFast) {
        setFastingElapsed(null);
        return;
      }
      const start = new Date(currentFast.startedAt);
      const now = new Date();
      const h = differenceInHours(now, start);
      const m = differenceInMinutes(now, start) % 60;
      const pct = Math.min(100, (differenceInMinutes(now, start) / (currentFast.targetHours * 60)) * 100);
      setFastingElapsed({ h, m, pct });
    };

    calculateFast();
    interval = setInterval(calculateFast, 60000);
    return () => clearInterval(interval);
  }, [currentFast]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const getHeroMessage = () => {
    if (gymDone && waterPct >= 80 && calPct >= 60) return { text: "Día completo.", accent: "¡Excelente!" };
    if (!gymDone && waterPct < 40) return { text: "Te falta", accent: "agua y ejercicio." };
    if (!gymDone && waterPct >= 80) return { text: "Hidratado,", accent: "ahora a moverse." };
    if (!gymDone) return { text: "Sin actividad", accent: "hoy aún." };
    if (gymDone && waterPct < 40) return { text: "Entreno listo,", accent: "toma más agua." };
    return { text: "Vas", accent: "bien." };
  };

  const heroMsg = getHeroMessage();

  const days = Array.from({ length: 14 }, (_, i) => {
    return subDays(new Date(), 13 - i);
  });

  const hasActivityOnDay = (d: Date) => {
    const dStr = d.toISOString().split('T')[0];
    return activities.some(a => a.startedAt.startsWith(dStr)) || meals.some(m => m.loggedAt.startsWith(dStr)) || water.some(w => w.loggedAt.startsWith(dStr));
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full pb-32">
      <div className="flex justify-between items-center mb-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
            <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name}`} alt="Avatar" width={48} height={48} />
          </div>
          <div>
            <p className="text-gray-500 font-medium text-xs">{greeting},</p>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{profile.name}</h1>
          </div>
        </div>
      </div>

      {/* Hero Card dark */}
      <div className="bg-gray-900 rounded-[32px] p-6 mb-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight mb-1">{heroMsg.text} <br/><span className="text-[#D4F87A]">{heroMsg.accent}</span></h2>
        </div>
        <div className="relative w-[80px] h-[80px] flex-shrink-0">
          <ProgressRing radius={40} stroke={6} progress={waterPct} size={80} color="#3B8BF5" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ProgressRing radius={32} stroke={6} progress={calPct} size={80} color="#D4F87A" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ProgressRing radius={24} stroke={6} progress={gymDone ? 100 : 0} size={80} color="#A78BFA" />
          </div>
        </div>
      </div>

      {/* Bento 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-[#D4F87A] rounded-[24px] p-5 shadow-none flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#1a2e00]/60 mb-2">CALORÍAS</div>
          <span className="text-3xl font-bold text-[#1a2e00] leading-none mb-1">{caloriesEaten}</span>
          <div className="w-full bg-[#1a2e00]/10 rounded-full h-1 mt-2 mb-1">
            <div className="bg-[#1a2e00] h-1 rounded-full" style={{ width: `${calPct}%` }}></div>
          </div>
          <span className="text-xs font-semibold text-[#1a2e00]/60">/ {profile.dailyGoals.calories} kcal</span>
        </div>
        
        <div className="bg-white rounded-[24px] p-5 shadow-none border border-gray-100 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">AGUA</div>
          <span className="text-3xl font-bold text-gray-900 leading-none mb-1">{(waterTotalMl/1000).toFixed(1)}</span>
          <div className="w-full bg-gray-100 rounded-full h-1 mt-2 mb-1">
            <div className="bg-[#3B8BF5] h-1 rounded-full" style={{ width: `${waterPct}%` }}></div>
          </div>
          <span className="text-xs font-semibold text-gray-400">/ {(waterGoalMl/1000).toFixed(1)} L</span>
        </div>
        
        <div className="bg-gray-900 rounded-[24px] p-5 shadow-none flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">AYUNO</div>
          {fastingElapsed ? (
            <>
              <span className="text-3xl font-bold text-white leading-none mb-1">{fastingElapsed.h}h {fastingElapsed.m}m</span>
              <span className="text-xs font-semibold text-gray-400">Activo ({currentFast?.targetHours}h)</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-white leading-none mb-1 mt-2">Inactivo</span>
              <Link href="/diary" className="text-xs font-bold text-[#D4F87A] uppercase tracking-widest mt-auto">Iniciar ayuno</Link>
            </>
          )}
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-none border border-gray-100 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">PESO</div>
          <span className="text-3xl font-bold text-gray-900 leading-none mb-1">{profile.weightKg || '--'}</span>
          <span className="text-xs font-semibold text-gray-400">último registrado</span>
        </div>
      </div>

      {/* Swiper 14 days */}
      <Swiper slidesPerView={7} centeredSlides={false} className="mb-8" initialSlide={13}>
        {days.map((d, i) => (
          <SwiperSlide key={i} onClick={() => setSelectedDate(d)}>
            <div className={`flex flex-col items-center gap-2 py-2 transition-opacity ${isToday(d) ? 'opacity-100' : 'opacity-50'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isToday(d) ? 'text-gray-900' : 'text-gray-400'}`}>
                {format(d, 'eeeee', { locale: es }).substring(0, 1)}
              </span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isToday(d) ? 'bg-[#D4F87A] text-[#1a2e00] shadow-sm' : 'text-gray-900'}`}>
                {format(d, 'd')}
              </div>
              <div className={cn("w-1.5 h-1.5 rounded-full", hasActivityOnDay(d) ? "bg-gray-400" : "bg-transparent")} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Mini feed del grupo */}
      {profile.groupCode && (
        <div className="mb-8 p-6 rounded-[24px] border-2 border-dashed border-gray-200 text-center">
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="f7-icons text-2xl">person_3_fill</i>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">El grupo hoy</h3>
          <p className="text-xs text-gray-500 mb-4 px-4">Invita a tus amigos con el código <strong>{profile.groupCode}</strong></p>
          <Link href="/profile" className="inline-block bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            Invitar
          </Link>
        </div>
      )}

      {/* Esta semana */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-bold text-gray-900">Esta semana</h2>
        <Link href="/workout" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entrenamientos</Link>
      </div>
      
      <div className="space-y-3 mb-8">
        {activities.filter(a => a.status === 'completed').slice().reverse().slice(0, 3).map(a => (
          <div key={a.id} className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <i className={cn("f7-icons text-xl", a.type === 'walk' ? 'text-blue-500' : a.type === 'run' ? 'text-orange-500' : a.type === 'cycling' ? 'text-green-500' : 'text-purple-500')}>
                  {a.type === 'walk' ? 'figure.walk' : a.type === 'run' ? 'figure.run' : a.type === 'cycling' ? 'bicycle' : 'dumbbell.fill'}
                </i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">{a.type === 'walk' ? 'Caminata' : a.type === 'run' ? 'Running' : a.type === 'cycling' ? 'Ciclismo' : 'Gym'}</h4>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                  {format(new Date(a.startedAt), "d MMM 'a las' HH:mm", { locale: es })}
                </div>
              </div>
            </div>
            <div className="text-right">
              {a.type !== 'gym' ? (
                <>
                  <div className="font-bold text-lg text-gray-900 leading-none">{(a.distanceMeters / 1000).toFixed(2)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">KM</div>
                </>
              ) : (
                <>
                  <div className="font-bold text-lg text-gray-900 leading-none">{Math.floor(a.durationSeconds / 60)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">MIN</div>
                </>
              )}
            </div>
          </div>
        ))}
        {activities.filter(a => a.status === 'completed').length === 0 && (
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full mx-auto flex flex-col items-center justify-center mb-3 text-gray-300">
              <i className="f7-icons text-3xl">figure.run</i>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Sin actividades</h3>
            <p className="text-xs text-gray-500 mb-4 px-2">Aún no has registrado ningún entrenamiento esta semana.</p>
            <Link href="/workout" className="inline-block bg-[#D4F87A] text-[#1a2e00] font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full">
              Iniciar entreno
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressRing({ radius, stroke, progress, size, color }: any) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={size} width={size} className="rotate-[-90deg]">
      <circle stroke="rgba(255,255,255,0.1)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={size / 2} cy={size / 2} />
      <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={size / 2} cy={size / 2} />
    </svg>
  );
}
