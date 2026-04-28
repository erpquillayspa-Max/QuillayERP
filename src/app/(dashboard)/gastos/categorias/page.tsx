'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CategoriaGasto } from '@/types';

export default function CategoriasGastoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState<string | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    const { data } = await supabase
      .from('categorias_gasto')
      .select('*')
      .order('nombre');

    if (data) setCategorias(data);
    setCargando(false);
  }

  async function toggleActiva(categoria: CategoriaGasto) {
    setCambiandoEstado(categoria.id);

    const { error } = await supabase
      .from('categorias_gasto')
      .update({ activa: !categoria.activa })
      .eq('id', categoria.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      cargarCategorias();
    }

    setCambiandoEstado(null);
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando categorías...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Categorías de Gasto</h1>
          <p className="text-neutral-600 mt-1">Administra las categorías para clasificar gastos</p>
        </div>
        <Link
          href="/gastos/categorias/nueva"
          className="inline-flex items-center gap-2 bg-quillay-medio hover:bg-quillay-oscuro text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nueva categoría
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {categorias.map((categoria) => (
              <tr key={categoria.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-quillay-tronco">
                    {categoria.nombre}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-600">
                    {categoria.descripcion || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {categoria.activa ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Activa
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Inactiva
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => router.push(`/gastos/categorias/${categoria.id}`)}
                      className="inline-flex items-center gap-1 text-quillay-medio hover:text-quillay-oscuro transition-colors"
                      title="Editar categoría"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActiva(categoria)}
                      disabled={cambiandoEstado === categoria.id}
                      className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-800 disabled:opacity-50 transition-colors"
                      title={categoria.activa ? 'Desactivar' : 'Activar'}
                    >
                      {categoria.activa ? (
                        <>
                          <ToggleRight size={16} />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} />
                          Activar
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categorias.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No hay categorías registradas
          </div>
        )}
      </div>
    </div>
  );
}