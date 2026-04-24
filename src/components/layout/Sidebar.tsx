'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Users, Building2, Settings, LogOut,
  Menu, X, FileText, Briefcase, DollarSign
} from 'lucide-react';
import type { Usuario, RolUsuario } from '@/types';
import { rolLabels } from '@/types';
import { cn } from '@/lib/utils/format';

interface SidebarProps {
  usuario: Usuario;
}

const menuItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: RolUsuario[];
}> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard,
    roles: ['super_admin', 'admin_contador', 'finanzas_rrhh', 'supervisor', 'trabajador', 'solo_lectura'] },
  { href: '/admin/empresa', label: 'Empresa', icon: Building2,
    roles: ['super_admin', 'admin_contador'] },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users,
    roles: ['super_admin', 'admin_contador', 'finanzas_rrhh'] },
  { href: '/admin/centros-costo', label: 'Centros de Costo', icon: Briefcase,
    roles: ['super_admin', 'admin_contador', 'finanzas_rrhh', 'supervisor', 'solo_lectura'] },
  { href: '/admin/parametros', label: 'Parámetros Legales', icon: Settings,
    roles: ['super_admin', 'admin_contador'] },
];

export default function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  const visibleItems = menuItems.filter((item) => item.roles.includes(usuario.rol));

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Top bar mobile */}
      <div className="md:hidden bg-quillay-oscuro text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Image src="/logo/quillay-logo.png" alt="Quillay" width={32} height={32} />
          <span className="font-serif text-lg">QUILLAY</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-quillay-oscuro text-white flex flex-col',
          'fixed md:static inset-y-0 left-0 z-50 w-64 transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header desktop */}
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-white/10">
          <Image src="/logo/quillay-logo.png" alt="Quillay" width={40} height={40} />
          <div>
            <div className="font-serif text-lg">QUILLAY</div>
            <div className="text-xs text-white/60">ERP</div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/10">
          <div className="text-sm font-medium">{usuario.nombre_completo}</div>
          <div className="text-xs text-white/60 mt-0.5">{usuario.email}</div>
          <div className="text-xs text-quillay-claro mt-1">{rolLabels[usuario.rol]}</div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition',
                  isActive
                    ? 'bg-quillay-medio text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
