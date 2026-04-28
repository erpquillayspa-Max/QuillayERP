'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { tipoMedioPagoLabels } from '@/types';
import type { TipoMedioPago } from '@/types';

export default function NuevoMedioPagoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<{
    nombre: string;
    tipo: TipoMedioPago;
    banco: string;
    ultimos_4_digitos: string;
  }>({
    nombre: '',
    tipo: 'efectivo',
    banco: '',
    ultimos_4_digitos: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
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

      const { error: insertError } = await supabase
        .from('medios_pago')
        .insert({
          nombre: form.nombre,
          tipo: form.tipo,
          banco: form.banco || null,
          ultimos_4_digitos: form.ultimos_4_digitos || null,
          empresa_id: usuario.empresa_id
        });

      if (insertError) {
        setError(insertError.message);
        setGuardando(false);
        return;
      }

      alert('Medio de pago creado correctamente');
      router.push('/gastos/medios-pago');
    } catch (err: any) {
      setError(err.message || 'Error al crear medio de pago');
      setGuardando(false);
    }
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
        <h1 className="text-3xl font-serif text-quillay-tronco">Nuevo medio de pago</h1>
        <p className="text-neutral-600 mt-1">Registrar un nuevo medio de pago</p>
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
            placeholder="Ej: Tarjeta Falabella, Cuenta BancoEstado"
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
            placeholder="Ej: Banco Santander, BCI"
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
            placeholder="1234"
          />
          <p className="text-xs text-neutral-500 mt-1">Para tarjetas de crédito/débito</p>
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
            {guardando ? 'Creando...' : 'Crear medio de pago'}
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