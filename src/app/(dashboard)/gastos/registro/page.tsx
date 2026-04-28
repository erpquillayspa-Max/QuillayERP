'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type GastoConRelaciones = {
  id: string;
  fecha: string;
  monto_neto: number;
  monto_iva: number;
  monto_total: number;
  descripcion: string;
  numero_documento: string | null;
  categoria_id: string;
  proveedor_id: string | null;
  medio_pago_id: string | null;
  centro_costo_id: string;
  categorias_gasto: { nombre: string } | null;
  proveedores: { razon_social: string } | null;
  medios_pago: { nombre: string } | null;
  centros_costo: { nombre: string } | null;
};

export default function RegistroGastosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [gastos, setGastos] = useState<GastoConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);
  
  // Filtros
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroCentroCosto, setFiltroCentroCosto] = useState('');
  
  // Datos para los selectores de filtro
  const [categorias, setCategorias] = useState<{id: string, nombre: string}[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<{id: string, nombre: string}[]>([]);

  useEffect(() => {
    cargarDatosFiltros();
    cargarGastos();
  }, []);

  useEffect(() => {
    cargarGastos();
  }, [filtroFechaDesde, filtroFechaHasta, filtroCategoria, filtroCentroCosto]);

  async function cargarDatosFiltros() {
    const { data: cats } = await supabase
      .from('categorias_gasto')
      .select('id, nombre')
      .eq('activa', true)
      .order('nombre');

    const { data: ccs } = await supabase
      .from('centros_costo')
      .select('id, nombre')
      .eq('estado', 'activo')
      .order('nombre');

    if (cats) setCategorias(cats);
    if (ccs) setCentrosCosto(ccs);
  }

  async function cargarGastos() {
    let query = supabase
      .from('gastos')
      .select(`
        *,
        categorias_gasto(nombre),
        proveedores(razon_social),
        medios_pago(nombre),
        centros_costo(nombre)
      `)
      .order('fecha', { ascending: false });

    if (filtroFechaDesde) {
      query = query.gte('fecha', filtroFechaDesde);
    }
    if (filtroFechaHasta) {
      query = query.lte('fecha', filtroFechaHasta);
    }
    if (filtroCategoria) {
      query = query.eq('categoria_id', filtroCategoria);
    }
    if (filtroCentroCosto) {
      query = query.eq('centro_costo_id', filtroCentroCosto);
    }

    const { data } = await query;

    if (data) setGastos(data as GastoConRelaciones[]);
    setCargando(false);
  }

  async function eliminarGasto(id: string) {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

    setEliminando(id);

    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      cargarGastos();
    }

    setEliminando(null);
  }

  function limpiarFiltros() {
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroCategoria('');
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

  // Calcular total general
  const totalGeneral = gastos.reduce((sum, g) => sum + g.monto_total, 0);

  if (cargando) {
    return <div className="text-neutral-500">Cargando gastos...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Registro de Gastos</h1>
          <p className="text-neutral-600 mt-1">Listado de todos los gastos registrados</p>
        </div>
        <Link
          href="/gastos/registro/nuevo"
          className="inline-flex items-center gap-2 bg-quillay-medio hover:bg-quillay-oscuro text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo gasto
        </Link>
      </div>

      {/* Filtros */}
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
            <label className="block text-xs text-neutral-600 mb-1">Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-quillay-medio focus:outline-none"
            >
              <option value="">Todas</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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
        {(filtroFechaDesde || filtroFechaHasta || filtroCategoria || filtroCentroCosto) && (
          <button
            onClick={limpiarFiltros}
            className="mt-3 text-sm text-quillay-medio hover:text-quillay-oscuro"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-quillay-claro/10 border border-quillay-medio/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Total gastos mostrados</p>
            <p className="text-2xl font-bold text-quillay-tronco">{formatearMonto(totalGeneral)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600">Cantidad</p>
            <p className="text-2xl font-bold text-quillay-tronco">{gastos.length}</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">C. Costo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {gastos.map((gasto) => (
              <tr key={gasto.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                  {formatearFecha(gasto.fecha)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-quillay-tronco">{gasto.descripcion}</div>
                  {gasto.numero_documento && (
                    <div className="text-xs text-neutral-500">Doc: {gasto.numero_documento}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {gasto.categorias_gasto?.nombre || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {gasto.proveedores?.razon_social || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {gasto.centros_costo?.nombre || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-quillay-tronco">
                  {formatearMonto(gasto.monto_total)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/gastos/registro/${gasto.id}`)}
                      className="text-quillay-medio hover:text-quillay-oscuro"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => eliminarGasto(gasto.id)}
                      disabled={eliminando === gasto.id}
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

        {gastos.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No hay gastos registrados
          </div>
        )}
      </div>
    </div>
  );
}