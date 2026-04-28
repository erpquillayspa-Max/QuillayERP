'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { tipoCCLabels, nivelCCLabels, estadoCCLabels } from '@/types';
import type { TipoCC, NivelCC, EstadoCC } from '@/types';

export default function NuevoCentroCostoPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [form, setForm] = useState<{
    codigo: string;
    nombre: string;
    tipo: TipoCC;
    nivel: NivelCC;
    padre_id: string;
    responsable_usuario_id: string;
    presupuesto: string;
    fecha_inicio: string;
    fecha_termino: string;
    estado: EstadoCC;
    lleva_bodega: boolean;
    notas: string;
  }>({
    codigo: '',
    nombre: '',
    tipo: 'interno',
    nivel: 'N1',
    padre_id: '',
    responsable_usuario_id: '',
    presupuesto: '',
    fecha_inicio: '',
    fecha_termino: '',
    estado: 'activo',
    lleva_bodega: false,
    notas: ''
  });

  const [posiblesPadres, setPosiblesPadres] = useState<{id: string, codigo: string, nombre: string, nivel: string}[]>([]);
  const [usuarios, setUsuarios] = useState<{id: string, nombre_completo: string}[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cuando cambia el nivel, recalcular posibles padres
  useEffect(() => {
    if (form.nivel === 'N1') {
      // N1 no tiene padre
      setForm(prev => ({ ...prev, padre_id: '' }));
    }
  }, [form.nivel]);

  async function cargarDatos() {
    const [ccs, usrs] = await Promise.all([
      supabase.from('centros_costo').select('id, codigo, nombre, nivel').order('codigo'),
      supabase.from('usuarios').select('id, nombre_completo').eq('activo', true).order('nombre_completo')
    ]);

    if (ccs.data) setPosiblesPadres(ccs.data);
    if (usrs.data) setUsuarios(usrs.data);
    setCargando(false);
  }

  // Filtrar padres según nivel seleccionado
  function getPadresFiltrados() {
    if (form.nivel === 'N1') return [];
    if (form.nivel === 'N2') return posiblesPadres.filter(p => p.nivel === 'N1');
    if (form.nivel === 'N3') return posiblesPadres.filter(p => p.nivel === 'N2');
    return [];
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

      // Validar padre según nivel
      if (form.nivel !== 'N1' && !form.padre_id) {
        setError(`Debe seleccionar un centro de costo padre para ${form.nivel}`);
        setGuardando(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('centros_costo')
        .insert({
          codigo: form.codigo.toUpperCase(),
          nombre: form.nombre,
          tipo: form.tipo,
          nivel: form.nivel,
          padre_id: form.padre_id || null,
          responsable_usuario_id: form.responsable_usuario_id || null,
          presupuesto: form.presupuesto ? parseFloat(form.presupuesto) : null,
          fecha_inicio: form.fecha_inicio || null,
          fecha_termino: form.fecha_termino || null,
          estado: form.estado,
          lleva_bodega: form.lleva_bodega,
          notas: form.notas || null,
          empresa_id: usuario.empresa_id,
          creado_por: user.id
        });

      if (insertError) {
        setError(insertError.message);
        setGuardando(false);
        return;
      }

      alert('Centro de costo creado correctamente');
      router.push('/admin/centros-costo');
    } catch (err: any) {
      setError(err.message || 'Error al crear centro de costo');
      setGuardando(false);
    }
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando...</div>;
  }

  const padresFiltrados = getPadresFiltrados();

  return (
    <div>
      <Link
        href="/admin/centros-costo"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-quillay-medio mb-4"
      >
        <ArrowLeft size={16} />
        Volver a centros de costo
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-serif text-quillay-tronco">Nuevo Centro de Costo</h1>
        <p className="text-neutral-600 mt-1">Registrar un nuevo centro de costo</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl space-y-5">
        {/* Código y Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Código *
            </label>
            <input
              type="text"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none font-mono"
              required
              placeholder="OBRA-001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
              placeholder="Construcción Casa Las Condes"
            />
          </div>
        </div>

        {/* Tipo, Nivel y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tipo *
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoCC })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            >
              {Object.entries(tipoCCLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nivel *
            </label>
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value as NivelCC })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            >
              {Object.entries(nivelCCLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Estado *
            </label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoCC })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            >
              {Object.entries(estadoCCLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Padre (solo si no es N1) */}
        {form.nivel !== 'N1' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Centro de Costo Padre *
              <span className="text-xs text-neutral-500 ml-2">
                (Debe ser {form.nivel === 'N2' ? 'N1' : 'N2'})
              </span>
            </label>
            <select
              value={form.padre_id}
              onChange={(e) => setForm({ ...form, padre_id: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
              required
            >
              <option value="">Seleccionar padre...</option>
              {padresFiltrados.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.codigo}] {p.nombre}
                </option>
              ))}
            </select>
            {padresFiltrados.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                No hay centros de costo {form.nivel === 'N2' ? 'N1' : 'N2'} disponibles. Cree uno primero.
              </p>
            )}
          </div>
        )}

        {/* Responsable */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Responsable
          </label>
          <select
            value={form.responsable_usuario_id}
            onChange={(e) => setForm({ ...form, responsable_usuario_id: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
          >
            <option value="">Sin responsable</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nombre_completo}</option>
            ))}
          </select>
        </div>

        {/* Presupuesto */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Presupuesto (CLP)
          </label>
          <input
            type="number"
            step="1"
            min="0"
            value={form.presupuesto}
            onChange={(e) => setForm({ ...form, presupuesto: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Fecha de Término
            </label>
            <input
              type="date"
              value={form.fecha_termino}
              onChange={(e) => setForm({ ...form, fecha_termino: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            />
          </div>
        </div>

        {/* Lleva Bodega */}
        <div className="flex items-center gap-2">
          <input
            id="lleva_bodega"
            type="checkbox"
            checked={form.lleva_bodega}
            onChange={(e) => setForm({ ...form, lleva_bodega: e.target.checked })}
            className="h-4 w-4 text-quillay-medio border-neutral-300 rounded"
          />
          <label htmlFor="lleva_bodega" className="text-sm text-neutral-700">
            Este centro de costo lleva bodega de materiales
          </label>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Notas
          </label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            rows={3}
            placeholder="Información adicional..."
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
            {guardando ? 'Creando...' : 'Crear centro de costo'}
          </button>
          <Link
            href="/admin/centros-costo"
            className="px-6 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}