'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, Lock, UserPlus, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';


export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Wait a bit then redirect or stay to let them see the message
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100"
    >
      <div className="flex justify-center mb-10">
        <div className="w-20 h-20 bg-[#D4F87A] rounded-[24px] flex items-center justify-center -rotate-3 shadow-xl shadow-[#D4F87A]/30">
          <UserPlus size={40} className="text-[#1a2e00]" />
        </div>
      </div>
      
      <h2 className="text-4xl font-extrabold text-gray-900 mb-3 text-center tracking-tight">Crea tu cuenta</h2>
      <p className="text-gray-400 text-center mb-12 text-base font-medium max-w-[280px] mx-auto leading-tight">Únete a la comunidad y mejora tus hábitos</p>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm mb-6 flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          {error}
        </motion.div>
      )}

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 space-y-4"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">¡Registro exitoso!</h3>
          <p className="text-gray-500 text-sm">
            Hemos enviado un correo de confirmación a tu bandeja de entrada. 
            <br />Por favor, confírmalo para poder iniciar sesión.
          </p>
          <Link 
            href="/login" 
            className="inline-block mt-4 text-[#1a2e00] font-bold hover:underline underline-offset-4"
          >
            Ir al inicio de sesión
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-7">
          <div className="space-y-2.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a2e00] transition-colors" size={20} />
              <input
                name="name"
                type="text"
                required
                placeholder="Tu nombre"
                className="w-full !pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-[#D4F87A]/20 focus:bg-white focus:border-[#D4F87A] transition-all text-gray-900 font-bold placeholder:text-gray-300 placeholder:font-medium"
              />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres"
                className="w-full !pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-[#D4F87A]/20 focus:bg-white focus:border-[#D4F87A] transition-all text-gray-900 font-bold placeholder:text-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-5 px-6 rounded-[24px] hover:bg-black active:scale-[0.98] transition-all text-lg shadow-xl shadow-gray-200 flex items-center justify-center gap-3 mt-10 group"
          >
            <Sparkles size={22} className="text-[#D4F87A] group-hover:rotate-12 transition-transform" />
            Registrarse
          </button>
        </form>
      )}

      {!success && (
        <div className="mt-8 text-center text-sm text-gray-500 font-medium">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-gray-900 font-bold hover:underline decoration-[#D4F87A] decoration-2 underline-offset-4">
            Inicia sesión
          </Link>
        </div>
      )}
    </motion.div>
  );
}
