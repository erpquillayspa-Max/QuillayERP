'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderOpen, Folder } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CentroCosto } from '@/types';
import { tipoCCLabels, estadoCCLabels } from '@/types';

type CentroCostoConHijos = CentroCosto & {
  hijos: CentroCostoConHijos[];
};

export default function CentrosCostoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [centros, setCentros] = useState<CentroCosto[]>([]);
  const [arbol, setArbol] = useState<CentroCostoConHijos[]>([]);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('activo');
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [puedeEliminar, setPuedeEliminar] = useState(false);

  useEffect(() => {
    verificarPermisos();
  }, []);

  useEffect(() => {
    cargarCentros();
  }, [filtroEstado]);

  async function verificarPermisos() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (usuario && (usuario.rol === 'super_admin' || usuario.rol === 'admin_contador')) {
      setPuedeEliminar(true);
    }
  }

  async function cargarCentros() {
    let query = supabase
      .from('centros_costo')
      .select('*')
      .order('codigo');

    if (filtroEstado) {
      query = query.eq('estado', filtroEstado);
    }

    const { data } = await query;

    if (data) {
      setCentros(data);
      construirArbol(data);
    }
    setCargando(false);
  }

  function construirArbol(lista: CentroCosto[]) {
    const mapa = new Map<string, CentroCostoConHijos>();
    
    lista.forEach(cc => {
      mapa.set(cc.id, { ...cc, hijos: [] });
    });

    const raices: CentroCostoConHijos[] = [];

    lista.forEach(cc => {
      const nodo = mapa.get(cc.id)!;
      if (cc.padre_id && mapa.has(cc.padre_id)) {
        mapa.get(cc.padre_id)!.hijos.push(nodo);
      } else {
        raices.push(nodo);
      }
    });

    setArbol(raices);
    
    if (lista.length <= 15) {
      const todosIds = new Set(lista.map(cc => cc.id));
      setExpandidos(todosIds);
    }
  }

  function toggleExpandir(id: string) {
    const nuevos = new Set(expandidos);
    if (nuevos.has(id)) {
      nuevos.delete(id);
    } else {
      nuevos.add(id);
    }
    setExpandidos(nuevos);
  }

  async function eliminarCC(cc: CentroCostoConHijos) {
    if (cc.hijos.length > 0) {
      alert(`No se puede eliminar "${cc.nombre}" porque tiene ${cc.hijos.length} centro(s) de costo hijo(s). Elimine primero los hijos.`);
      return;
    }

    const { count: countGastos } = await supabase
      .from('gastos')
      .select('*', { count: 'exact', head: true })
      .eq('centro_costo_id', cc.id);

    if (countGastos && countGastos > 0) {
      alert(`No se puede eliminar "${cc.nombre}" porque tiene ${countGastos} gasto(s) asociado(s). Considere cambiar el estado a "Cerrado" en su lugar.`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el centro de costo "${cc.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setEliminando(cc.id);

    const { error } = await supabase
      .from('centros_costo')
      .delete()
      .eq('id', cc.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      cargarCentros();
    }

    setEliminando(null);
  }

  function formatearMonto(monto: number | null) {
    if (!monto) return '-';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(monto);
  }

  function renderNodo(nodo: CentroCostoConHijos, nivel: number = 0) {
    const tieneHijos = nodo.hijos.length > 0;
    const expandido = expandidos.has(nodo.id);
    const padding = nivel * 24;

    return (
      <div key={nodo.id}>
        <div
          className="flex items-center gap-2 px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100"
          style={{ paddingLeft: `${padding + 16}px` }}
        >
          {tieneHijos ? (
            <button
              onClick={() => toggleExpandir(nodo.id)}
              className="text-neutral-500 hover:text-quillay-medio"
            >
              {expandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {tieneHijos ? (
            expandido ? <FolderOpen size={18} className="text-quillay-medio" /> : <Folder size={18} className="text-quillay-medio" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-neutral-300" />
          )}

          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
            nodo.nivel === 'N1' ? 'bg-blue-100 text-blue-800' :
            nodo.nivel === 'N2' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {nodo.nivel}
          </span>

          <span className="text-sm font-mono text-neutral-500 min-w-[120px]">
            {nodo.codigo}
          </span>

          <span 
            className="flex-1 font-medium text-quillay-tronco cursor-pointer hover:text-quillay-medio"
            onClick={() => router.push(`/admin/centros-costo/${nodo.id}`)}
          >
            {nodo.nombre}
          </span>

          <span className="text-xs text-neutral-500 hidden md:inline">
            {tipoCCLabels[nodo.tipo]}
          </span>

          <span className="text-sm text-neutral-600 hidden lg:inline">
            {formatearMonto(nodo.presupuesto)}
          </span>

          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            nodo.estado === 'activo' ? 'bg-green-100 text-green-800' :
            nodo.estado === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {estadoCCLabels[nodo.estado]}
          </span>

          <button
            onClick={() => router.push(`/admin/centros-costo/${nodo.id}`)}
            className="text-quillay-medio hover:text-quillay-oscuro"
            title="Editar"
          >
            <Edit size={16} />
          </button>

          {puedeEliminar && (
            <button
              onClick={() => eliminarCC(nodo)}
              disabled={eliminando === nodo.id}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {tieneHijos && expandido && (
          <div>
            {nodo.hijos.map(hijo => renderNodo(hijo, nivel + 1))}
          </div>
        )}
      </div>
    );
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando centros de costo...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Centros de Costo</h1>
          <p className="text-neutral-600 mt-1">Estructura jerárquica de proyectos y obras</p>
        </div>
        <Link
          href="/admin/centros-costo/nuevo"
          className="inline-flex items-center gap-2 bg-quillay-medio hover:bg-quillay-oscuro text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo CC
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-neutral-700">Estado:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-quillay-medio focus:outline-none"
          >
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="pausado">Pausados</option>
            <option value="cerrado">Cerrados</option>
          </select>
          <span className="text-sm text-neutral-500 ml-auto">
            Total: {centros.length} centros de costo
          </span>
        </div>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-4 text-xs text-neutral-600">
        <span className="font-medium">Niveles:</span>
        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded">N1 División</span>
        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded">N2 Proyecto</span>
        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-800 rounded">N3 Etapa</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {arbol.length > 0 ? (
          <div>
            {arbol.map(nodo => renderNodo(nodo))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500">
            No hay centros de costo registrados
          </div>
        )}
      </div>

      {!puedeEliminar && (
        <p className="text-xs text-neutral-500 mt-4">
          ℹ️ Solo administradores pueden eliminar centros de costo.
        </p>
      )}
    </div>
  );
}