'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { RolUsuario } from '@/types';
import { rolLabels } from '@/types';

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'trabajador' as RolUsuario,
    puede_comprar: false,
    telefono: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear usuario');
        setGuardando(false);
        return;
      }

      alert('Usuario creado correctamente');
      router.push('/admin/usuarios');
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setGuardando(false);
    }
  }

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
        <h1 className="text-3xl font-serif text-quillay-tronco">Nuevo usuario</h1>
        <p className="text-neutral-600 mt-1">Crear una nueva cuenta de acceso al sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
              minLength={6}
            />
            <p className="text-xs text-neutral-500 mt-1">Mínimo 6 caracteres</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nombre completo *
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
            Rol *
          </label>
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as RolUsuario })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none bg-white"
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
          />
          <label htmlFor="puede_comprar" className="text-sm text-neutral-700">
            Puede registrar compras y gastos
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-quillay-medio hover:bg-quillay-oscuro disabled:bg-neutral-400 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            {guardando ? 'Creando...' : 'Crear usuario'}
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