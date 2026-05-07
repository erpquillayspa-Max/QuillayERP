'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { tipoIngresoLabels, type TipoIngreso } from '@/types';

type IngresoConRelaciones = {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string;
  tipo: TipoIngreso;
  numero_documento: string | null;
  centro_costo_id: string | null;
  centros_costo: { nombre: string } | null;
};

export default function IngresosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ingresos, setIngresos] = useState<IngresoConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'' | TipoIngreso>('');
  const [filtroCentroCosto, setFiltroCentroCosto] = useState('');

  const [centrosCosto, setCentrosCosto] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    cargarCentrosCosto();
  }, []);

  useEffect(() => {
    cargarIngresos();
  }, [filtroFechaDesde, filtroFechaHasta, filtroTipo, filtroCentroCosto]);

  async function cargarCentrosCosto() {
    const { data } = await supabase
      .from('centros_costo')
      .select('id, nombre')
      .eq('estado', 'activo')
      .order('nombre');
    if (data) setCentrosCosto(data);
  }

  async function cargarIngresos() {
    let query = supabase
      .from('ingresos')
      .select(`
        id, fecha, monto, descripcion, tipo, numero_documento, centro_costo_id,
        centros_costo(nombre)
      `)
      .order('fecha', { ascending: false });

    if (filtroFechaDesde) query = query.gte('fecha', filtroFechaDesde);
    if (filtroFechaHasta) query = query.lte('fecha', filtroFechaHasta);
    if (filtroTipo) query = query.eq('tipo', filtroTipo);
    if (filtroCentroCosto) query = query.eq('centro_costo_id', filtroCentroCosto);

    const { data } = await query;
    if (data) setIngresos(data as unknown as IngresoConRelaciones[]);
    setCargando(false);
  }

  async function eliminarIngreso(id: string) {
    if (!confirm('¿Eliminar este ingreso?')) return;
    setEliminando(id);
    const { error } = await supabase.from('ingresos').delete().eq('id', id);
    if (error) alert(`Error: ${error.message}`);
    else cargarIngresos();
    setEliminando(null);
  }

  function limpiarFiltros() {
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroTipo('');
    setFiltroCentroCosto('');
  }

  function formatearMonto(monto: number) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(monto);
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-CL');
  }

  const totalGeneral = ingresos.reduce((sum, i) => sum + i.monto, 0);
  const filtrosActivos = filtroFechaDesde || filtroFechaHasta || filtroTipo || filtroCentroCosto;

  if (cargando) return <div className="text-neutral-500">Cargando ingresos...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Ingresos</h1>
          <p className="text-neutral-600 mt-1">Estados de pago, abonos y otros ingresos</p>
        </div>
        <Link
          href="/ingresos/nuevo"
          className="inline-flex items-center gap-2 bg-quillay-medio hover:bg-quillay-oscuro text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo ingreso
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-quillay-medio" />
          <h3 className="font-medium text-quillay-tronco">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Desde</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-quillay-medio focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-quillay-medio focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as '' | TipoIngreso)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-quillay-medio focus:outline-none"
            >
              <option value="">Todos</option>
              {Object.entries(tipoIngresoLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Centro de Costo</label>
            <select
              value={filtroCentroCosto}
              onChange={(e) => setFiltroCentroCosto(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-quillay-medio focus:outline-none"
            >
              <option value="">Todos</option>
              {centrosCosto.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        {filtrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="mt-3 text-sm text-quillay-medio hover:text-quillay-oscuro"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="bg-quillay-claro/10 border border-quillay-medio/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Total ingresos mostrados</p>
            <p className="text-2xl font-bold text-quillay-tronco">{formatearMonto(totalGeneral)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600">Cantidad</p>
            <p className="text-2xl font-bold text-quillay-tronco">{ingresos.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">C. Costo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Monto</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {ingresos.map((ingreso) => (
              <tr key={ingreso.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                  {formatearFecha(ingreso.fecha)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-quillay-tronco">{ingreso.descripcion}</div>
                  {ingreso.numero_documento && (
                    <div className="text-xs text-neutral-500">Doc: {ingreso.numero_documento}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  <span className="inline-block px-2 py-0.5 rounded text-xs bg-quillay-claro/30 text-quillay-tronco">
                    {tipoIngresoLabels[ingreso.tipo]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {ingreso.centros_costo?.nombre || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-quillay-tronco">
                  {formatearMonto(ingreso.monto)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/ingresos/${ingreso.id}`)}
                      className="text-quillay-medio hover:text-quillay-oscuro"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => eliminarIngreso(ingreso.id)}
                      disabled={eliminando === ingreso.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ingresos.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No hay ingresos registrados
          </div>
        )}
      </div>
    </div>
  );
}
