import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import type { Usuario } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Obtener datos completos del usuario
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single<Usuario>();

  if (!usuario) {
    // Usuario autenticado pero sin registro en tabla usuarios
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
        <div className="max-w-md text-center bg-white p-8 rounded-lg shadow">
          <h1 className="text-xl font-medium text-quillay-tronco mb-3">
            Cuenta sin configurar
          </h1>
          <p className="text-neutral-600 mb-4">
            Tu cuenta autenticada ({user.email}) no tiene rol asignado. Un
            administrador debe completar la configuración.
          </p>
          <form action="/api/auth/logout" method="post">
            <button className="text-quillay-medio hover:text-quillay-oscuro text-sm">
              Cerrar sesión
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!usuario.activo) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
        <div className="max-w-md text-center bg-white p-8 rounded-lg shadow">
          <h1 className="text-xl font-medium text-quillay-tronco mb-3">
            Cuenta desactivada
          </h1>
          <p className="text-neutral-600">
            Tu cuenta está desactivada. Contacta al administrador.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50">
      <Sidebar usuario={usuario} />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
