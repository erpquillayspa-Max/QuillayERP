'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NuevoProveedorPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    rut: '',
    razon_social: '',
    nombre_fantasia: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    notas: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      // Obtener empresa_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No autenticado');
        setGuardando(false);
        return;
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!usuario) {
        setError('Usuario no encontrado');
        setGuardando(false);
        return;
      }

      // Crear proveedor
      const { error: insertError } = await supabase
        .from('proveedores')
        .insert({
          rut: form.rut || null,
          razon_social: form.razon_social,
          nombre_fantasia: form.nombre_fantasia || null,
          email: form.email || null,
          telefono: form.telefono || null,
          direccion: form.direccion || null,
          ciudad: form.ciudad || null,
          notas: form.notas || null,
          empresa_id: usuario.empresa_id
        });

      if (insertError) {
        setError(insertError.message);
        setGuardando(false);
        return;
      }

      alert('Proveedor creado correctamente');
      router.push('/gastos/proveedores');
    } catch (err: any) {
      setError(err.message || 'Error al crear proveedor');
      setGuardando(false);
    }
  }

  return (
    <div>
      <Link
        href="/gastos/proveedores"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-quillay-medio mb-4"
      >
        <ArrowLeft size={16} />
        Volver a proveedores
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-serif text-quillay-tronco">Nuevo proveedor</h1>
        <p className="text-neutral-600 mt-1">Registrar un nuevo proveedor</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              RUT
            </label>
            <input
              type="text"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              placeholder="12.345.678-9"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Razón Social *
            </label>
            <input
              type="text"
              value={form.razon_social}
              onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
              placeholder="Empresa S.A."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Nombre de Fantasía
          </label>
          <input
            type="text"
            value={form.nombre_fantasia}
            onChange={(e) => setForm({ ...form, nombre_fantasia: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            placeholder="Nombre comercial"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              placeholder="contacto@empresa.cl"
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
              placeholder="+56 9 1234 5678"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            placeholder="Calle 123, Depto 456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Ciudad
          </label>
          <input
            type="text"
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            placeholder="Santiago"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Notas
          </label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            rows={3}
            placeholder="Información adicional del proveedor"
          />
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
            {guardando ? 'Creando...' : 'Crear proveedor'}
          </button>
          <Link
            href="/gastos/proveedores"
            className="px-6 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}