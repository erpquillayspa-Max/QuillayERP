'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { tipoIngresoLabels, type TipoIngreso } from '@/types';

export default function NuevoIngresoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    descripcion: '',
    tipo: 'estado_pago' as TipoIngreso,
    numero_documento: '',
    centro_costo_id: ''
  });

  const [centrosCosto, setCentrosCosto] = useState<{ id: string; nombre: string }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const { data } = await supabase
      .from('centros_costo')
      .select('id, nombre')
      .eq('estado', 'activo')
      .order('nombre');
    if (data) setCentrosCosto(data);
    setCargando(false);
  }

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
        .from('ingresos')
        .insert({
          fecha: form.fecha,
          monto: parseFloat(form.monto),
          descripcion: form.descripcion,
          tipo: form.tipo,
          numero_documento: form.numero_documento || null,
          centro_costo_id: form.centro_costo_id || null,
          usuario_registro_id: user.id,
          empresa_id: usuario.empresa_id
        });

      if (insertError) {
        setError(insertError.message);
        setGuardando(false);
        return;
      }

      alert('Ingreso registrado correctamente');
      router.push('/ingresos');
    } catch (err: any) {
      setError(err.message || 'Error al registrar ingreso');
      setGuardando(false);
    }
  }

  function formatearMonto(monto: string) {
    const num = parseFloat(monto) || 0;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(num);
  }

  if (cargando) return <div className="text-neutral-500">Cargando...</div>;

  return (
    <div>
      <Link
        href="/ingresos"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-quillay-medio mb-4"
      >
        <ArrowLeft size={16} />
        Volver a ingresos
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-serif text-quillay-tronco">Nuevo ingreso</h1>
        <p className="text-neutral-600 mt-1">Registrar un nuevo ingreso (estado de pago, abono, otro)</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha *</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">N° Documento</label>
            <input
              type="text"
              value={form.numero_documento}
              onChange={(e) => setForm({ ...form, numero_documento: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              placeholder="EP N°, factura, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción *</label>
          <input
            type="text"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            required
            placeholder="Ej: Estado de pago N°3 obra Las Condes"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo *</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoIngreso })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            >
              {Object.entries(tipoIngresoLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Centro de Costo</label>
            <select
              value={form.centro_costo_id}
              onChange={(e) => setForm({ ...form, centro_costo_id: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            >
              <option value="">Sin asignar</option>
              {centrosCosto.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Monto *</label>
              <input
                type="number"
                step="1"
                min="0"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
                required
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Vista previa</label>
              <input
                type="text"
                value={formatearMonto(form.monto)}
                disabled
                className="w-full px-3 py-2 border border-neutral-300 rounded bg-quillay-claro/20 font-bold text-quillay-tronco"
              />
            </div>
          </div>
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
            {guardando ? 'Registrando...' : 'Registrar ingreso'}
          </button>
          <Link
            href="/ingresos"
            className="px-6 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
