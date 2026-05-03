'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

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
      router.push('/');
    }
  };

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crear Cuenta</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4F87A] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4F87A] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4F87A] focus:border-transparent transition-all"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#1a2e00] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#2a4a00] active:scale-95 transition-all text-sm"
        >
          Registrarse
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#1a2e00] font-bold hover:underline">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
