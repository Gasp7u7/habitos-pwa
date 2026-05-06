'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100"
    >
      <div className="flex justify-center mb-10">
        <div className="w-20 h-20 bg-[#D4F87A] rounded-[24px] flex items-center justify-center rotate-3 shadow-xl shadow-[#D4F87A]/30">
          <Sparkles size={40} className="text-[#1a2e00]" />
        </div>
      </div>
      
      <h2 className="text-4xl font-extrabold text-gray-900 mb-3 text-center tracking-tight">¡Bienvenido!</h2>
      <p className="text-gray-400 text-center mb-12 text-base font-medium max-w-[240px] mx-auto leading-tight">Inicia sesión para continuar con tus hábitos</p>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm mb-6 flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          {error === 'Email not confirmed' ? 'Por favor, confirma tu email en tu bandeja de entrada.' : error}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-7">
        <div className="space-y-2.5">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Email</label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a2e00] transition-colors" size={20} />
            <input
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              className="w-full !pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-[#D4F87A]/20 focus:bg-white focus:border-[#D4F87A] transition-all text-gray-900 font-bold placeholder:text-gray-300 placeholder:font-medium"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Contraseña</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a2e00] transition-colors" size={20} />
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full !pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-[#D4F87A]/20 focus:bg-white focus:border-[#D4F87A] transition-all text-gray-900 font-bold placeholder:text-gray-300"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white font-bold py-5 px-6 rounded-[24px] hover:bg-black active:scale-[0.98] transition-all text-lg shadow-xl shadow-gray-200 flex items-center justify-center gap-3 mt-10 group"
        >
          <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />
          Entrar
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500 font-medium">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-gray-900 font-bold hover:underline decoration-[#D4F87A] decoration-2 underline-offset-4">
          Regístrate ahora
        </Link>
      </div>
    </motion.div>
  );
}
