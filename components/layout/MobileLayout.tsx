'use client';
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Activity, BookHeart, BarChart3, User, Plus, Droplet, Utensils, AlignLeft, PersonStanding, Flame, Scale, Dumbbell, Bike, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import OnboardingFlow from '../onboarding/OnboardingFlow';
import AddMealModal from '../modals/AddMealModal';
import AiMealModal from '../modals/AiMealModal';
import WeightModal from '../modals/WeightModal';

export default function MobileLayout({ children }: { children: ReactNode }) {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isAiMealOpen, setIsAiMealOpen] = useState(false);
  const [isWeightOpen, setIsWeightOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { profile } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return <div className="flex h-screen w-full bg-gray-100" />;
  }

  if (!profile.hasCompletedOnboarding) {
    return (
      <div className="flex h-screen w-full justify-center bg-gray-100 overflow-hidden font-sans">
        <div className="relative w-full h-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
          <OnboardingFlow />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen w-full justify-center bg-gray-100 overflow-hidden font-sans">
      <div className="relative w-full h-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          {children}
        </div>

        {/* Global FAB Sheet Overlay */}
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFabOpen(false)}
              className="absolute inset-0 bg-black/40 z-40"
            />
          )}
        </AnimatePresence>

        {/* FAB Sheet Modal */}
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-6 text-gray-900">Acceso Rápido</h3>
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                <FabAction 
                  icon={<Droplet />} 
                  label="Agua" 
                  color="bg-blue-50 text-blue-600" 
                  onClick={() => { 
                    useAppStore.getState().addWater(); 
                    setIsFabOpen(false); 
                  }} 
                />
                <FabAction 
                  icon={<Flame />} 
                  label="Descifra IA" 
                  color="bg-orange-50 text-orange-600" 
                  onClick={() => { 
                    setIsFabOpen(false); 
                    setIsAiMealOpen(true);
                  }} 
                />
                <FabAction 
                  icon={<Utensils />} 
                  label="Comida" 
                  color="bg-green-50 text-green-600" 
                  onClick={() => { 
                    setIsFabOpen(false); 
                    setIsAddMealOpen(true);
                  }} 
                />
                <FabAction 
                  icon={<Scale />} 
                  label="Peso" 
                  color="bg-indigo-50 text-indigo-600" 
                  onClick={() => { 
                    setIsFabOpen(false); 
                    setIsWeightOpen(true);
                  }} 
                />
                <FabAction 
                  icon={<Dumbbell />} 
                  label="Gym Libre" 
                  color="bg-slate-100 text-slate-700" 
                  onClick={() => { 
                    setIsFabOpen(false); 
                    useAppStore.getState().setActiveRoutine(null);
                    router.push('/activity?type=gym');
                  }} 
                />
                <FabAction 
                  icon={<AlignLeft />} 
                  label="Rutinas" 
                  color="bg-purple-50 text-purple-600" 
                  onClick={() => { 
                    setIsFabOpen(false); 
                    router.push('/workouts');
                  }} 
                />
                <FabAction 
                  icon={<PersonStanding />} 
                  label="Ejercicios" 
                  color="bg-sky-50 text-sky-600" 
                  onClick={() => { 
                    setIsFabOpen(false); 
                    router.push('/workouts');
                  }} 
                />
                <FabAction 
                  icon={<MapIcon />} 
                  label="Actividad GPS" 
                  color="bg-red-50 text-red-600" 
                  onClick={() => { 
                    setIsFabOpen(false); 
                    router.push('/activity?type=walk');
                  }} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AddMealModal isOpen={isAddMealOpen} onClose={() => setIsAddMealOpen(false)} />
        <AiMealModal isOpen={isAiMealOpen} onClose={() => setIsAiMealOpen(false)} />
        <WeightModal isOpen={isWeightOpen} onClose={() => setIsWeightOpen(false)} />

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center z-40 pb-safe pt-2 h-[64px]">
          <TabItem href="/" icon={<Home size={24} strokeWidth={2} />} label="Inicio" />
          <TabItem href="/diary" icon={<Utensils size={24} strokeWidth={2} />} label="Comidas" />
          
          <div className="relative">
            <button
              onClick={() => setIsFabOpen(!isFabOpen)}
              className={cn(
                "w-16 h-16 rounded-full bg-[#D4F87A] shadow-[0_8px_24px_rgba(212,248,122,0.45)] flex items-center justify-center -translate-y-5 active:scale-95 transition-transform flex-shrink-0",
                isFabOpen && "rotate-45"
              )}
            >
              <Plus size={28} strokeWidth={2.5} className="text-[#1a2e00]" />
            </button>
          </div>

          <TabItem href="/workouts" icon={<BarChart3 size={24} strokeWidth={2} />} label="Ejercicio" />
          <TabItem href="/profile" icon={<User size={24} strokeWidth={2} />} label="Perfil" />
        </div>
      </div>
    </div>
  );
}

function TabItem({ href, icon, label, className }: { href: string; icon: ReactNode; label: string; className?: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className={cn("flex flex-col items-center justify-center w-12 pt-1", className)}>
      <div className={cn("mb-1 transition-colors", isActive ? "text-gray-900" : "text-gray-400")}>
        {icon}
      </div>
      <span className={cn("text-[10px] font-semibold tracking-tight transition-colors", isActive ? "text-gray-900" : "text-gray-400")}>{label}</span>
    </Link>
  );
}

function FabAction({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95", color)}>
        {icon}
      </div>
      <span className="text-[11px] font-medium text-gray-700">{label}</span>
    </button>
  );
}

