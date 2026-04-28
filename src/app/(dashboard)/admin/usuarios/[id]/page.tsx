'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Usuario, RolUsuario } from '@/types';
import { rolLabels } from '@/types';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [miRol, setMiRol] = useState<RolUsuario | null>(null);
  const [form, setForm] = useState({
    nombre_completo: '',
    rol: 'trabajador' as RolUsuario,
    puede_comprar: false,
    activo: true,
    telefono: ''
  });
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: miU } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();
        if (miU) setMiRol(miU.rol as RolUsuario);
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single<Usuario>();

      if (error || !data) {
        setError('Usuario no encontrado');
        setCargando(false);
        return;
      }

      setUsuario(data);
      setForm({
        nombre_completo: data.nombre_completo,
        rol: data.rol,
        puede_comprar: data.puede_comprar,
        activo: data.activo,
        telefono: data.telefono ?? ''
      });
      setCargando(false);
    }
    cargar();
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(null);

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...form })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar');
        setGuardando(false);
        return;
      }

      setExito('Cambios guardados correctamente');
      setGuardando(false);
      setTimeout(() => router.push('/admin/usuarios'), 1500);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setGuardando(false);
    }
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando usuario...</div>;
  }

  if (!usuario) {
    return (
      <div>
        <Link
          href="/admin/usuarios"
          className="text-quillay-medio hover:text-quillay-oscuro inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver a usuarios
        </Link>
        <p className="mt-4 text-red-600">Usuario no encontrado</p>
      </div>
    );
  }

  const puedeModificarAdmins = miRol === 'super_admin';
  const esAdmin = ['super_admin', 'admin_contador'].includes(usuario.rol);

  return (
    <div>
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-quillay-medio mb-4"
      >
        <ArrowLeft size={16} />
        Volver a usuarios
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-serif text-quillay-tronco">Editar usuario</h1>
        <p className="text-neutral-600 mt-1">{usuario.email}</p>
      </div>

      {esAdmin && !puedeModificarAdmins && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded max-w-2xl">
          Solo Super Admin puede modificar administradores.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={usuario.email}
            disabled
            className="w-full px-3 py-2 border border-neutral-200 rounded bg-neutral-50 text-neutral-500"
          />
          <p className="text-xs text-neutral-500 mt-1">El email no se puede cambiar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Rol
          </label>
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as RolUsuario })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none bg-white"
            disabled={esAdmin && !puedeModificarAdmins}
          >
            <option value="trabajador">{rolLabels.trabajador}</option>
            <option value="supervisor">{rolLabels.supervisor}</option>
            <option value="finanzas_rrhh">{rolLabels.finanzas_rrhh}</option>
            <option value="solo_lectura">{rolLabels.solo_lectura}</option>
            <option value="admin_contador">{rolLabels.admin_contador}</option>
            <option value="super_admin">{rolLabels.super_admin}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="puede_comprar"
            type="checkbox"
            checked={form.puede_comprar}
            onChange={(e) => setForm({ ...form, puede_comprar: e.target.checked })}
            className="h-4 w-4 text-quillay-medio border-neutral-300 rounded"
            disabled={esAdmin && !puedeModificarAdmins}
          />
          <label htmlFor="puede_comprar" className="text-sm text-neutral-700">
            Puede registrar compras y gastos
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="activo"
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            className="h-4 w-4 text-quillay-medio border-neutral-300 rounded"
            disabled={esAdmin && !puedeModificarAdmins}
          />
          <label htmlFor="activo" className="text-sm text-neutral-700">
            Cuenta activa
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {exito && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
            {exito}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando || (esAdmin && !puedeModificarAdmins)}
            className="bg-quillay-medio hover:bg-quillay-oscuro disabled:bg-neutral-400 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link
            href="/admin/usuarios"
            className="px-6 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}