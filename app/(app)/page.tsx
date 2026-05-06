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
import { 
  Users, 
  Activity, 
  Footprints, 
  Bike, 
  Dumbbell, 
  Flame, 
  Droplets, 
  Scale, 
  Timer,
  Zap,
  Moon,
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronRight,
  Bell,
  Sparkles,
  Info
} from 'lucide-react';
import NutritionGuideModal from '@/components/modals/NutritionGuideModal';


export default function HomePage() {
  const { profile, activities, meals, water, currentFast } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayActivities = useMemo(() => activities.filter(a => a.startedAt.startsWith(todayStr)), [activities, todayStr]);
  const todayMeals = useMemo(() => meals.filter(m => m.loggedAt.startsWith(todayStr)), [meals, todayStr]);
  const todayWater = useMemo(() => water.filter(w => w.loggedAt.startsWith(todayStr)), [water, todayStr]);
  
  const waterTotalMl = useMemo(() => todayWater.reduce((sum, w) => sum + w.amountMl, 0), [todayWater]);
  const caloriesEaten = useMemo(() => todayMeals.reduce((sum, m) => sum + m.calories, 0), [todayMeals]);

  const waterGoalMl = profile.dailyGoals.waterMl || 2500;
  const waterPct = useMemo(() => Math.min(100, (waterTotalMl / waterGoalMl) * 100), [waterTotalMl, waterGoalMl]);
  const calPct = useMemo(() => Math.min(100, (caloriesEaten / profile.dailyGoals.calories) * 100), [caloriesEaten, profile.dailyGoals.calories]);
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

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    return subDays(new Date(), 13 - i);
  }), []);

  const hasActivityOnDay = (d: Date) => {
    const dStr = d.toISOString().split('T')[0];
    return activities.some(a => a.startedAt.startsWith(dStr)) || meals.some(m => m.loggedAt.startsWith(dStr)) || water.some(w => w.loggedAt.startsWith(dStr));
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  return (
    <div className="p-4 bg-[#f8f9fa] min-h-full pb-32">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-white rounded-[32px] p-1 shadow-xl shadow-gray-200/50 mb-8 border border-gray-100 mt-4">
        <div className="bg-gray-900 rounded-[28px] p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4F87A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#D4F87A] animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{greeting}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-[1.1] tracking-tight">
                {heroMsg.text} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4F87A] to-[#a8ff78]">{heroMsg.accent}</span>
              </h2>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white"><Flame size={12} className="text-[#D4F87A]" /></div>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white"><Droplets size={12} className="text-blue-400" /></div>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white"><Dumbbell size={12} className="text-purple-400" /></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metas activas</span>
              </div>
            </div>
            
            <div className="relative w-[110px] h-[110px] flex-shrink-0 flex items-center justify-center">
              {/* Outer Ring - Water */}
              <ProgressRing radius={52} stroke={8} progress={waterPct} size={110} color="#3B8BF5" glow />
              {/* Middle Ring - Calories */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <ProgressRing radius={40} stroke={8} progress={calPct} size={110} color="#D4F87A" glow />
              </div>
              {/* Inner Ring - Activity */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <ProgressRing radius={28} stroke={8} progress={gymDone ? 100 : 0} size={110} color="#A78BFA" glow />
              </div>
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                  <Zap size={18} className="text-[#D4F87A]" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-[#D4F87A] rounded-[24px] p-5 shadow-none flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#1a2e00]/60">CALORÍAS</div>
            <Flame size={14} className="text-[#1a2e00]/40" />
          </div>
          <span className="text-3xl font-bold text-[#1a2e00] leading-none mb-1">{caloriesEaten}</span>
          <div className="w-full bg-[#1a2e00]/10 rounded-full h-1 mt-2 mb-1">
            <div className="bg-[#1a2e00] h-1 rounded-full" style={{ width: `${calPct}%` }}></div>
          </div>
          <span className="text-xs font-semibold text-[#1a2e00]/60">/ {profile.dailyGoals.calories} kcal</span>
        </div>
        
        <div className="bg-white rounded-[24px] p-5 shadow-none border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">AGUA</div>
            <Droplets size={14} className="text-blue-400" />
          </div>
          <span className="text-3xl font-bold text-gray-900 leading-none mb-1">{(waterTotalMl/1000).toFixed(1)}</span>
          <div className="w-full bg-gray-100 rounded-full h-1 mt-2 mb-1">
            <div className="bg-[#3B8BF5] h-1 rounded-full" style={{ width: `${waterPct}%` }}></div>
          </div>
          <span className="text-xs font-semibold text-gray-400">/ {(waterGoalMl/1000).toFixed(1)} L</span>
        </div>
        
        <div className="bg-gray-900 rounded-[24px] p-5 shadow-none flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">AYUNO</div>
            <Timer size={14} className="text-[#D4F87A]/60" />
          </div>
          {fastingElapsed ? (
            <>
              <span className="text-3xl font-bold text-white leading-none mb-1">{fastingElapsed.h}h {fastingElapsed.m}m</span>
              <span className="text-xs font-semibold text-gray-400">Activo ({currentFast?.targetHours}h)</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-white leading-none mb-1 mt-2">Inactivo</span>
              <Link href="/diary" className="text-xs font-bold !text-[#D4F87A] uppercase tracking-widest mt-auto hover:opacity-80 transition-opacity">Iniciar ayuno</Link>
            </>
          )}
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-none border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">PESO</div>
            <Scale size={14} className="text-indigo-400" />
          </div>
          <span className="text-3xl font-bold text-gray-900 leading-none mb-1">{profile.weightKg || '--'}</span>
          <span className="text-xs font-semibold text-gray-400">último registrado</span>
        </div>
      </div>

      {/* Macros Section */}
      <div className="bg-white rounded-[32px] p-6 mb-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={16} className="text-orange-400" /> Macronutrientes diarios
          </h3>
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="!w-8 !h-8 !min-w-0 !p-0 !rounded-full !bg-gray-50 !flex !items-center !justify-center !text-gray-400 active:scale-95 transition-all hover:bg-gray-100"
          >
            <Info size={16} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proteína</div>
            <div className="font-bold text-lg text-gray-900">{todayMeals.reduce((s, m) => s + (m.protein || 0), 0)}<span className="text-xs text-gray-400 ml-0.5">/{profile.dailyGoals.proteinG || 0}g</span></div>
            <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
               <div className="bg-orange-400 h-full rounded-full" style={{ width: `${Math.min(100, (todayMeals.reduce((s, m) => s + (m.protein || 0), 0) / (profile.dailyGoals.proteinG || 1)) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Carbos</div>
            <div className="font-bold text-lg text-gray-900">{todayMeals.reduce((s, m) => s + (m.carbs || 0), 0)}<span className="text-xs text-gray-400 ml-0.5">/{profile.dailyGoals.carbsG || 0}g</span></div>
            <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
               <div className="bg-blue-400 h-full rounded-full" style={{ width: `${Math.min(100, (todayMeals.reduce((s, m) => s + (m.carbs || 0), 0) / (profile.dailyGoals.carbsG || 1)) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grasas</div>
            <div className="font-bold text-lg text-gray-900">{todayMeals.reduce((s, m) => s + (m.fat || 0), 0)}<span className="text-xs text-gray-400 ml-0.5">/{profile.dailyGoals.fatG || 0}g</span></div>
            <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
               <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${Math.min(100, (todayMeals.reduce((s, m) => s + (m.fat || 0), 0) / (profile.dailyGoals.fatG || 1)) * 100)}%` }} />
            </div>
          </div>
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
            <Users size={24} />
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
                {a.type === 'walk' ? <Footprints size={20} className="text-blue-500" /> : 
                 a.type === 'run' ? <Activity size={20} className="text-orange-500" /> : 
                 a.type === 'cycling' ? <Bike size={20} className="text-green-500" /> : 
                 <Dumbbell size={20} className="text-purple-500" />}
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
              <Activity size={32} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Sin actividades</h3>
            <p className="text-xs text-gray-500 mb-4 px-2">Aún no has registrado ningún entrenamiento esta semana.</p>
            <Link href="/workout" className="inline-block bg-[#D4F87A] text-[#1a2e00] font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full">
              Iniciar entreno
            </Link>
          </div>
        )}
      </div>

      <NutritionGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

function ProgressRing({ radius, stroke, progress, size, color, glow }: any) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={size} width={size} className="rotate-[-90deg] overflow-visible">
      <defs>
        <filter id={`glow-${color.replace('#', '')}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Track */}
      <circle 
        stroke="rgba(255,255,255,0.05)" 
        fill="transparent" 
        strokeWidth={stroke} 
        r={normalizedRadius} 
        cx={size / 2} 
        cy={size / 2} 
      />
      {/* Progress */}
      <circle 
        stroke={color} 
        fill="transparent" 
        strokeWidth={stroke} 
        strokeDasharray={circumference + ' ' + circumference} 
        style={{ 
          strokeDashoffset, 
          filter: glow ? `url(#glow-${color.replace('#', '')})` : 'none',
          transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' 
        }} 
        strokeLinecap="round" 
        r={normalizedRadius} 
        cx={size / 2} 
        cy={size / 2} 
      />
    </svg>
  );
}
