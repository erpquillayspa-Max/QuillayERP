'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { tipoMedioPagoLabels } from '@/types';
import type { MedioPago, TipoMedioPago } from '@/types';

export default function EditarMedioPagoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [medio, setMedio] = useState<MedioPago | null>(null);
  const [form, setForm] = useState<{
    nombre: string;
    tipo: TipoMedioPago;
    banco: string;
    ultimos_4_digitos: string;
    activo: boolean;
  }>({
    nombre: '',
    tipo: 'efectivo',
    banco: '',
    ultimos_4_digitos: '',
    activo: true
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    cargarMedio();
  }, [id]);

  async function cargarMedio() {
    const { data, error } = await supabase
      .from('medios_pago')
      .select('*')
      .eq('id', id)
      .single<MedioPago>();

    if (error || !data) {
      setError('Medio de pago no encontrado');
      setCargando(false);
      return;
    }

    setMedio(data);
    setForm({
      nombre: data.nombre,
      tipo: data.tipo,
      banco: data.banco || '',
      ultimos_4_digitos: data.ultimos_4_digitos || '',
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
      .from('medios_pago')
      .update({
        nombre: form.nombre,
        tipo: form.tipo,
        banco: form.banco || null,
        ultimos_4_digitos: form.ultimos_4_digitos || null,
        activo: form.activo
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setGuardando(false);
      return;
    }

    setExito('Medio de pago actualizado correctamente');
    setGuardando(false);
    setTimeout(() => router.push('/gastos/medios-pago'), 1500);
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando medio de pago...</div>;
  }

  if (!medio) {
    return (
      <div>
        <Link
          href="/gastos/medios-pago"
          className="text-quillay-medio hover:text-quillay-oscuro inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver a medios de pago
        </Link>
        <p className="mt-4 text-red-600">Medio de pago no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/gastos/medios-pago"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-quillay-medio mb-4"
      >
        <ArrowLeft size={16} />
        Volver a medios de pago
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-serif text-quillay-tronco">Editar medio de pago</h1>
        <p className="text-neutral-600 mt-1">{medio.nombre}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Tipo *
          </label>
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoMedioPago })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            required
          >
            {Object.entries(tipoMedioPagoLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Banco
          </label>
          <input
            type="text"
            value={form.banco}
            onChange={(e) => setForm({ ...form, banco: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Últimos 4 dígitos
          </label>
          <input
            type="text"
            maxLength={4}
            value={form.ultimos_4_digitos}
            onChange={(e) => setForm({ ...form, ultimos_4_digitos: e.target.value.replace(/\D/g, '') })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
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
            Medio de pago activo
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
            href="/gastos/medios-pago"
            className="px-6 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}