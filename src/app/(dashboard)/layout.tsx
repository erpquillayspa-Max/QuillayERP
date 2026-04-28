'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Briefcase, 
  Settings, 
  Receipt,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [usuario, setUsuario] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: datosUsuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (datosUsuario) {
      setUsuario(datosUsuario);
    }
    
    setCargando(false);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function obtenerSaludo() {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-quillay-medio">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-quillay-oscuro overflow-y-auto">
          <div className="flex items-center gap-3 px-6 py-6 border-b border-quillay-medio/30">
            <Image
              src="/logo/quillay-logo.png"
              alt="Quillay"
              width={40}
              height={40}
              className="rounded"
            />
            <div>
              <h1 className="text-white font-bold text-lg">QUILLAY</h1>
              <p className="text-quillay-claro text-xs">ERP</p>
            </div>
          </div>

          {usuario && (
            <div className="px-4 py-4 border-b border-quillay-medio/30">
              <p className="text-white font-medium text-sm">
                {usuario.nombre_completo}
              </p>
              <p className="text-quillay-claro text-xs">{usuario.email}</p>
              <p className="text-quillay-claro text-xs mt-1">
                {usuario.rol === 'super_admin' ? 'Super Administrador' : 
                 usuario.rol === 'admin_contador' ? 'Admin Contador' :
                 usuario.rol === 'finanzas_rrhh' ? 'Finanzas / RRHH' :
                 usuario.rol === 'supervisor' ? 'Supervisor' :
                 usuario.rol === 'trabajador' ? 'Trabajador' : 'Solo Lectura'}
              </p>
            </div>
          )}

          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-quillay-claro text-white'
                  : 'text-neutral-200 hover:bg-quillay-oscuro/50'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/empresa"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/admin/empresa'
                  ? 'bg-quillay-claro text-white'
                  : 'text-neutral-200 hover:bg-quillay-oscuro/50'
              }`}
            >
              <Building2 size={20} />
              <span>Empresa</span>
            </Link>

            {(usuario?.rol === 'super_admin' || usuario?.rol === 'admin_contador') && (
              <Link
                href="/admin/usuarios"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith('/admin/usuarios')
                    ? 'bg-quillay-claro text-white'
                    : 'text-neutral-200 hover:bg-quillay-oscuro/50'
                }`}
              >
                <Users size={20} />
                <span>Usuarios</span>
              </Link>
            )}

            <Link
              href="/admin/centros-costo"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/admin/centros-costo'
                  ? 'bg-quillay-claro text-white'
                  : 'text-neutral-200 hover:bg-quillay-oscuro/50'
              }`}
            >
              <Briefcase size={20} />
              <span>Centros de Costo</span>
            </Link>

            <Link
              href="/admin/parametros"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/admin/parametros'
                  ? 'bg-quillay-claro text-white'
                  : 'text-neutral-200 hover:bg-quillay-oscuro/50'
              }`}
            >
              <Settings size={20} />
              <span>Parámetros Legales</span>
            </Link>

            <Link
              href="/gastos"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith('/gastos')
                  ? 'bg-quillay-claro text-white'
                  : 'text-neutral-200 hover:bg-quillay-oscuro/50'
              }`}
            >
              <Receipt size={20} />
              <span>Gastos</span>
            </Link>
          </nav>

          <div className="px-4 py-4 border-t border-quillay-medio/30">
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200 hover:bg-quillay-oscuro/50 transition-colors w-full"
            >
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-quillay-oscuro z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/quillay-logo.png"
            alt="Quillay"
            width={32}
            height={32}
            className="rounded"
          />
          <div>
            <h1 className="text-white font-bold text-sm">QUILLAY ERP</h1>
          </div>
        </div>
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="text-white p-2"
        >
          {menuAbierto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuAbierto && (
        <div className="md:hidden fixed inset-0 bg-quillay-oscuro z-40 pt-16 overflow-y-auto">
          <nav className="px-4 py-4 space-y-1">
            <Link href="/dashboard" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/empresa" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200">
              <Building2 size={20} />
              <span>Empresa</span>
            </Link>
            {(usuario?.rol === 'super_admin' || usuario?.rol === 'admin_contador') && (
              <Link href="/admin/usuarios" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200">
                <Users size={20} />
                <span>Usuarios</span>
              </Link>
            )}
            <Link href="/admin/centros-costo" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200">
              <Briefcase size={20} />
              <span>Centros de Costo</span>
            </Link>
            <Link href="/admin/parametros" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200">
              <Settings size={20} />
              <span>Parámetros Legales</span>
            </Link>
            <Link href="/gastos" onClick={() => setMenuAbierto(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200">
              <Receipt size={20} />
              <span>Gastos</span>
            </Link>
            <button onClick={() => { setMenuAbierto(false); cerrarSesion(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-200 w-full mt-4">
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </div>
      )}

      <main className="md:pl-64 pt-16 md:pt-0">
        <div className="px-4 py-8 md:px-8">
          {usuario && pathname === '/dashboard' && (
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-quillay-tronco">
                {obtenerSaludo()}, {usuario.nombre_completo.split(' ')[0]}
              </h2>
              <p className="text-neutral-600 mt-1">
                Quillay SPA · {new Date().toLocaleDateString('es-CL')}
              </p>
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}