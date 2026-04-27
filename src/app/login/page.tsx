'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const REMEMBER_KEY = 'quillay_remember_email';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al montar, recuperar email guardado
  useEffect(() => {
    const guardado = localStorage.getItem(REMEMBER_KEY);
    if (guardado) {
      setEmail(guardado);
      setRecordar(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email o contrasena incorrectos'
          : authError.message
      );
      setLoading(false);
      return;
    }

    // Guardar email si marco recordar
    if (recordar) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-600 hover:text-quillay-medio">
          Volver al sitio
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo/quillay-logo.png" alt="Quillay" width={80} height={80} priority />
            <h1 className="font-serif text-2xl text-quillay-tronco mt-4">QUILLAY ERP</h1>
            <p className="text-sm text-neutral-500 mt-1">Ingresa a tu cuenta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded focus:border-quillay-medio"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">Contrasena</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded focus:border-quillay-medio"
                placeholder="********"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="recordar"
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
                className="h-4 w-4 text-quillay-medio border-neutral-300 rounded focus:ring-quillay-medio"
              />
              <label htmlFor="recordar" className="ml-2 text-sm text-neutral-700 cursor-pointer">
                Recordar usuario en este dispositivo
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-quillay-medio hover:bg-quillay-oscuro disabled:bg-neutral-400 text-white font-medium py-2.5 rounded transition"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-xs text-neutral-400 text-center mt-6">
            Si tienes problemas para ingresar, contacta al administrador.
          </p>
        </div>
      </div>
    </main>
  );
}
