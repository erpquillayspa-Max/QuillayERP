'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Proveedor } from '@/types';

export default function EditarProveedorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [form, setForm] = useState({
    rut: '',
    razon_social: '',
    nombre_fantasia: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    notas: '',
    activo: true
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    cargarProveedor();
  }, [id]);

  async function cargarProveedor() {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single<Proveedor>();

    if (error || !data) {
      setError('Proveedor no encontrado');
      setCargando(false);
      return;
    }

    setProveedor(data);
    setForm({
      rut: data.rut || '',
      razon_social: data.razon_social,
      nombre_fantasia: data.nombre_fantasia || '',
      email: data.email || '',
      telefono: data.telefono || '',
      direccion: data.direccion || '',
      ciudad: data.ciudad || '',
      notas: data.notas || '',
      activo: data.activo
    });
    setCargando(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(null);

    const { error: updateError } = await supabase
      .from('proveedores')
      .update({
        rut: form.rut || null,
        razon_social: form.razon_social,
        nombre_fantasia: form.nombre_fantasia || null,
        email: form.email || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        ciudad: form.ciudad || null,
        notas: form.notas || null,
        activo: form.activo
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setGuardando(false);
      return;
    }

    setExito('Proveedor actualizado correctamente');
    setGuardando(false);
    setTimeout(() => router.push('/gastos/proveedores'), 1500);
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando proveedor...</div>;
  }

  if (!proveedor) {
    return (
      <div>
        <Link
          href="/gastos/proveedores"
          className="text-quillay-medio hover:text-quillay-oscuro inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver a proveedores
        </Link>
        <p className="mt-4 text-red-600">Proveedor no encontrado</p>
      </div>
    );
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
        <h1 className="text-3xl font-serif text-quillay-tronco">Editar proveedor</h1>
        <p className="text-neutral-600 mt-1">{proveedor.razon_social}</p>
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
            Dirección
          </label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
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
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="activo"
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            className="h-4 w-4 text-quillay-medio border-neutral-300 rounded"
          />
          <label htmlFor="activo" className="text-sm text-neutral-700">
            Proveedor activo
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
            disabled={guardando}
            className="bg-quillay-medio hover:bg-quillay-oscuro disabled:bg-neutral-400 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
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