'use client';
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import OnboardingFlow from '../onboarding/OnboardingFlow';
import AddMealModal from '../modals/AddMealModal';
import AiMealModal from '../modals/AiMealModal';
import WeightModal from '../modals/WeightModal';
import { Home, Dumbbell, Utensils, User, Plus, Droplets, Sparkles, Scale, ClipboardList, Play } from 'lucide-react';


import { createClient } from '@/lib/supabase/client';
import { getProfile } from '@/lib/supabase/profile';
import { getTodayLogs, getRecentActivities } from '@/lib/supabase/logs';
import { notifyWaterReminder } from '@/lib/notifications/inapp';

// Framework7 is no longer used here

export default function MobileLayout({ children }: { children: ReactNode }) {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isAiMealOpen, setIsAiMealOpen] = useState(false);
  const [isWeightOpen, setIsWeightOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { profile, updateProfile, hydrateFromSupabase } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const loadData = async () => {
      const state = useAppStore.getState();
      const now = Date.now();
      const FIVE_MINUTES = 5 * 60 * 1000;

      // Skip sync if we have data and it's fresh
      if (state.lastSync && (now - state.lastSync < FIVE_MINUTES)) {
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      try {
        const [profileData, todayData, recentActivitiesData] = await Promise.all([
          getProfile(user.id).catch(() => null),
          getTodayLogs(user.id).catch(() => ({ water: [], meals: [], fasting: null })),
          getRecentActivities(user.id).catch(() => ({ data: [] }))
        ]);

        if (profileData) {
          const weightKg = profileData.weight_kg || 70;
          const waterGoal = Math.round(weightKg * 35);

          updateProfile({
            id: user.id,
            name: profileData.display_name,
            email: profileData.email,
            heightCm: profileData.height_cm || undefined,
            weightKg: profileData.weight_kg || undefined,
            age: profileData.age || undefined,
            gender: (profileData.gender as "male" | "female") || undefined,
            primaryGoal: profileData.primary_goal || undefined,
            goals: profileData.goals || [],
            dietType: profileData.diet_type || undefined,
            fastingSchedule: profileData.fasting_schedule || undefined,
            hasCompletedOnboarding: profileData.has_completed_onboarding || false,
            dailyGoals: {
              waterMl: profileData.daily_water_ml || waterGoal,
              calories: profileData.daily_calories || 2200,
              activityMinutes: profileData.daily_activity_minutes || 45,
              proteinG: profileData.target_protein_g || 0,
              carbsG: profileData.target_carbs_g || 0,
              fatG: profileData.target_fat_g || 0,
            },
            glassSizeMl: profileData.glass_size_ml || 250,
          });
        } else {
          // Si no hay perfil, al menos aseguramos el ID correcto para las peticiones
          updateProfile({ id: user.id, email: user.email ?? undefined });
          
          // Intentamos crear el perfil básico si no existe (fallback al trigger)
          await (supabase.from('profiles') as any).insert({
            id: user.id,
            email: user.email,
            display_name: user.email?.split('@')[0] || 'Usuario'
          }).select().single().catch(() => null);
        }

        try {
            const { data: membership } = await (supabase.from('group_members') as any)
              .select('group_id, groups(invite_code, name)')
              .eq('user_id', user.id)
              .maybeSingle();

            if (membership?.groups) {
              const group = membership.groups as any;
              updateProfile({
                groupId: membership.group_id,
                groupCode: group.invite_code,
              });
            }
          } catch { /* silencioso */ }

        if (todayData.water || todayData.meals || todayData.fasting) {
          const mappedWater = (todayData.water || []).map(w => ({
            id: w.id,
            userId: w.user_id,
            amountMl: w.amount_ml,
            loggedAt: w.logged_at || new Date().toISOString()
          }));

          const mappedMeals = (todayData.meals || []).map(m => ({
            id: m.id,
            userId: m.user_id,
            name: m.name,
            description: m.description || undefined,
            calories: m.calories,
            protein: m.protein_g || 0,
            carbs: m.carbs_g || 0,
            fat: m.fat_g || 0,
            loggedAt: m.logged_at || new Date().toISOString(),
            isAiGenerated: !!m.is_ai_generated
          }));

          const mappedFast = todayData.fasting ? {
            id: todayData.fasting.id,
            userId: todayData.fasting.user_id,
            startedAt: todayData.fasting.started_at,
            targetHours: todayData.fasting.target_hours,
            status: todayData.fasting.status as 'active' | 'completed' | 'early'
          } : null;

          const mappedActivities = (recentActivitiesData?.data || []).map(a => ({
            id: a.id,
            userId: a.user_id,
            type: a.type as any,
            source: a.source as any,
            status: a.status as any,
            startedAt: a.started_at,
            endedAt: a.ended_at || a.started_at,
            durationSeconds: a.duration_seconds || 0,
            movingTimeSeconds: a.duration_seconds || 0,
            distanceMeters: (a.distance_meters || 0),
            avgPaceSecondsPerKm: a.avg_pace_seconds_per_km || 0,
            avgSpeedKmh: a.avg_speed_kmh || 0,
            estimatedCalories: a.estimated_calories || 0,
            route: a.gps_routes && a.gps_routes.length > 0 ? a.gps_routes[0].route_geojson?.coordinates?.map((c: any) => ({
                longitude: c[0], latitude: c[1]
            })) || [] : [],
            createdAt: a.created_at || a.started_at,
            updatedAt: a.updated_at || a.started_at,
            mood: a.mood as any,
            perceivedEffort: a.perceived_effort as any,
            notes: a.notes || undefined
          }));

          hydrateFromSupabase(mappedWater, mappedMeals, mappedFast, mappedActivities);
        }

      } catch (e) {
        // Fallback a local
      }
    };
    loadData();
  }, [hydrateFromSupabase, updateProfile]);

  useEffect(() => {
    if (!mounted) return;

    const checkWater = () => {
      const hour = new Date().getHours();
      // Solo entre 8am y 10pm
      if (hour < 8 || hour >= 22) return;

      const state = useAppStore.getState();
      const todayStr = new Date().toISOString().split('T')[0];
      const todayWater = state.water.filter(w => w.loggedAt.startsWith(todayStr));
      const totalMl = todayWater.reduce((s, w) => s + w.amountMl, 0);
      const goalMl = state.profile.dailyGoals.waterMl;

      // Solo notificar si lleva menos del 80% del objetivo
      if (totalMl < goalMl * 0.8) {
        notifyWaterReminder(totalMl, goalMl);
      }
    };

    // Verificar cada 2 horas (7,200,000 ms)
    const interval = setInterval(checkWater, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return <div className="flex h-screen w-full bg-gray-100" />;
  }

  if (!profile.hasCompletedOnboarding) {
    return (
      <div className="flex h-[100dvh] w-full justify-center bg-gray-100 overflow-hidden font-sans">
        <div className="relative w-full h-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
          <OnboardingFlow />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-[100dvh] w-full justify-center bg-gray-100 overflow-hidden font-sans">
      <div className="relative w-full h-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-[calc(100px+env(safe-area-inset-bottom))] scrollbar-hide">
          {children}
        </div>

        {/* FAB Custom Menu */}
        <AnimatePresence>
          {isFabOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFabOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              {/* Menu Content */}
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-6 z-[70] shadow-2xl"
              >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-6 text-gray-900 px-2">Registrar</h3>
                <div className="grid grid-cols-2 gap-3 pb-8">
                  <FabAction 
                    icon={<Droplets size={24} />} 
                    label="+ 1 vaso agua" 
                    sublabel="Hidratación"
                    color="bg-blue-50 text-blue-600" 
                    onClick={() => { 
                      useAppStore.getState().addWater(); 
                      setIsFabOpen(false); 
                    }} 
                  />
                  <FabAction 
                    icon={<Sparkles size={24} />} 
                    label="Comida con IA" 
                    sublabel="Describe y listo"
                    color="bg-orange-50 text-orange-600" 
                    onClick={() => { 
                      setIsFabOpen(false); 
                      setIsAiMealOpen(true);
                    }} 
                  />
                  <FabAction 
                    icon={<Scale size={24} />} 
                    label="Mi peso" 
                    sublabel="Registro diario"
                    color="bg-indigo-50 text-indigo-600" 
                    onClick={() => { 
                      setIsFabOpen(false); 
                      setIsWeightOpen(true);
                    }} 
                  />
                  <FabAction 
                    icon={<ClipboardList size={24} />} 
                    label="Comida manual" 
                    sublabel="Con macros"
                    color="bg-green-50 text-green-600" 
                    onClick={() => { 
                      setIsFabOpen(false); 
                      setIsAddMealOpen(true);
                    }} 
                  />
                  <FabAction 
                    icon={<Play size={24} fill="currentColor" />} 
                    label="Entrenar" 
                    sublabel="Iniciar actividad"
                    color="bg-[#D4F87A] text-[#1a2e00]" 
                    onClick={() => { 
                      setIsFabOpen(false); 
                      router.push('/workout');
                    }} 
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AddMealModal isOpen={isAddMealOpen} onClose={() => setIsAddMealOpen(false)} />
        <AiMealModal isOpen={isAiMealOpen} onClose={() => setIsAiMealOpen(false)} />
        <WeightModal isOpen={isWeightOpen} onClose={() => setIsWeightOpen(false)} />

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center z-40 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))] min-h-[72px]">
          <TabItem href="/" icon={<Home size={22} />} label="Hoy" />
          <TabItem href="/workout" icon={<Dumbbell size={22} />} label="Entreno" />
          
          <div className="relative flex justify-center w-16">
            <button
              onClick={() => setIsFabOpen(!isFabOpen)}
              className={cn(
                "absolute -top-10 w-16 h-16 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all flex-shrink-0 z-[80]",
                isFabOpen ? "bg-gray-900 rotate-45" : "bg-[#D4F87A] shadow-[#D4F87A]/40"
              )}
            >
              <Plus size={32} className={cn(isFabOpen ? "text-white" : "text-gray-900", "transition-transform", isFabOpen ? "rotate-45" : "rotate-0")} />
            </button>
          </div>

          <TabItem href="/diary" icon={<Utensils size={22} />} label="Comer" />
          <TabItem href="/profile" icon={<User size={22} />} label="Yo" />
        </div>
      </div>
    </div>
  );
}

function TabItem({ href, icon, label, className }: { href: string; icon: ReactNode; label: string; className?: string }) {
  const pathname = usePathname();
  // check if active by base route
  const isActive = pathname.startsWith(href) && (href !== '/' || pathname === '/');
  return (
    <Link href={href} className={cn("flex flex-col items-center justify-center w-12 pt-1 relative", className)}>
      <div className={cn("mb-1 transition-colors", isActive ? "text-gray-900" : "text-gray-400")}>
        {icon}
      </div>
      <span className={cn("text-[10px] font-semibold tracking-tight transition-colors", isActive ? "text-gray-900" : "text-gray-400")}>{label}</span>
      {isActive && (
        <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-gray-900" />
      )}
    </Link>
  );
}

function FabAction({ icon, label, sublabel, color, onClick }: { icon: ReactNode, label: string, sublabel: string, color: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-start gap-2 rounded-2xl p-4 transition-transform active:scale-95 group", color)}>
      <div className="mb-1">{icon}</div>
      <div className="text-left w-full">
        <div className="text-sm font-bold leading-tight line-clamp-1">{label}</div>
        <div className="text-xs opacity-70 leading-tight mt-1 line-clamp-1">{sublabel}</div>
      </div>
    </button>
  );
}

