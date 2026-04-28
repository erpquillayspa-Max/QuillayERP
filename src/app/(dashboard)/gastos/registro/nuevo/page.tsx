'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NuevoGastoPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0], // Hoy por defecto
    monto_neto: '',
    monto_iva: '',
    monto_total: '',
    descripcion: '',
    numero_documento: '',
    categoria_id: '',
    proveedor_id: '',
    medio_pago_id: '',
    centro_costo_id: '',
    incluye_iva: true
  });
  
  // Datos para los selectores
  const [categorias, setCategorias] = useState<{id: string, nombre: string}[]>([]);
  const [proveedores, setProveedores] = useState<{id: string, razon_social: string}[]>([]);
  const [mediosPago, setMediosPago] = useState<{id: string, nombre: string}[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<{id: string, nombre: string}[]>([]);
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Recalcular IVA y total cuando cambia el monto neto o si incluye IVA
  useEffect(() => {
    const neto = parseFloat(form.monto_neto) || 0;
    if (neto > 0) {
      const iva = form.incluye_iva ? Math.round(neto * 0.19) : 0;
      const total = neto + iva;
      setForm(prev => ({
        ...prev,
        monto_iva: iva.toString(),
        monto_total: total.toString()
      }));
    } else {
      setForm(prev => ({
        ...prev,
        monto_iva: '0',
        monto_total: '0'
      }));
    }
  }, [form.monto_neto, form.incluye_iva]);

  async function cargarDatos() {
    const [cats, provs, medios, ccs] = await Promise.all([
      supabase.from('categorias_gasto').select('id, nombre').eq('activa', true).order('nombre'),
      supabase.from('proveedores').select('id, razon_social').eq('activo', true).order('razon_social'),
      supabase.from('medios_pago').select('id, nombre').eq('activo', true).order('nombre'),
      supabase.from('centros_costo').select('id, nombre').eq('estado', 'activo').order('nombre')
    ]);

    if (cats.data) setCategorias(cats.data);
    if (provs.data) setProveedores(provs.data);
    if (medios.data) setMediosPago(medios.data);
    if (ccs.data) setCentrosCosto(ccs.data);
    
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
        .from('gastos')
        .insert({
          fecha: form.fecha,
          monto_neto: parseFloat(form.monto_neto),
          monto_iva: parseFloat(form.monto_iva),
          monto_total: parseFloat(form.monto_total),
          descripcion: form.descripcion,
          numero_documento: form.numero_documento || null,
          categoria_id: form.categoria_id,
          proveedor_id: form.proveedor_id || null,
          medio_pago_id: form.medio_pago_id || null,
          centro_costo_id: form.centro_costo_id,
          usuario_registro_id: user.id,
          empresa_id: usuario.empresa_id
        });

      if (insertError) {
        setError(insertError.message);
        setGuardando(false);
        return;
      }

      alert('Gasto registrado correctamente');
      router.push('/gastos/registro');
    } catch (err: any) {
      setError(err.message || 'Error al registrar gasto');
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

  if (cargando) {
    return <div className="text-neutral-500">Cargando...</div>;
  }

  return (
    <div>
      <Link
        href="/gastos/registro"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-quillay-medio mb-4"
      >
        <ArrowLeft size={16} />
        Volver a gastos
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-serif text-quillay-tronco">Nuevo gasto</h1>
        <p className="text-neutral-600 mt-1">Registrar un nuevo gasto</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl space-y-5">
        {/* Fecha y N° Documento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              N° Documento
            </label>
            <input
              type="text"
              value={form.numero_documento}
              onChange={(e) => setForm({ ...form, numero_documento: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              placeholder="N° de factura/boleta"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Descripción *
          </label>
          <input
            type="text"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            required
            placeholder="Ej: Compra de cemento y arena para fundación"
          />
        </div>

        {/* Categoría y Centro de Costo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Categoría *
            </label>
            <select
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            >
              <option value="">Seleccionar...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Centro de Costo *
            </label>
            <select
              value={form.centro_costo_id}
              onChange={(e) => setForm({ ...form, centro_costo_id: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            >
              <option value="">Seleccionar...</option>
              {centrosCosto.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Proveedor y Medio de Pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Proveedor
            </label>
            <select
              value={form.proveedor_id}
              onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            >
              <option value="">Sin proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.razon_social}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Medio de Pago
            </label>
            <select
              value={form.medio_pago_id}
              onChange={(e) => setForm({ ...form, medio_pago_id: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            >
              <option value="">Sin especificar</option>
              {mediosPago.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Montos */}
        <div className="bg-neutral-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="incluye_iva"
              type="checkbox"
              checked={form.incluye_iva}
              onChange={(e) => setForm({ ...form, incluye_iva: e.target.checked })}
              className="h-4 w-4 text-quillay-medio border-neutral-300 rounded"
            />
            <label htmlFor="incluye_iva" className="text-sm text-neutral-700">
              Aplicar IVA (19%)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Monto Neto *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={form.monto_neto}
                onChange={(e) => setForm({ ...form, monto_neto: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
                required
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                IVA (19%)
              </label>
              <input
                type="text"
                value={formatearMonto(form.monto_iva)}
                disabled
                className="w-full px-3 py-2 border border-neutral-300 rounded bg-neutral-100 text-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Total
              </label>
              <input
                type="text"
                value={formatearMonto(form.monto_total)}
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
            {guardando ? 'Registrando...' : 'Registrar gasto'}
          </button>
          <Link
            href="/gastos/registro"
            className="px-6 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}