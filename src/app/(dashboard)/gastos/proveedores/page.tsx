'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Proveedor } from '@/types';

export default function ProveedoresPage() {
  const router = useRouter();
  const supabase = createClient();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState<string | null>(null);

  useEffect(() => {
    cargarProveedores();
  }, []);

  async function cargarProveedores() {
    const { data } = await supabase
      .from('proveedores')
      .select('*')
      .order('razon_social');

    if (data) setProveedores(data);
    setCargando(false);
  }

  async function toggleActivo(proveedor: Proveedor) {
    setCambiandoEstado(proveedor.id);

    const { error } = await supabase
      .from('proveedores')
      .update({ activo: !proveedor.activo })
      .eq('id', proveedor.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      cargarProveedores();
    }

    setCambiandoEstado(null);
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando proveedores...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Proveedores</h1>
          <p className="text-neutral-600 mt-1">Administra el catálogo de proveedores</p>
        </div>
        <Link
          href="/gastos/proveedores/nuevo"
          className="inline-flex items-center gap-2 bg-quillay-medio hover:bg-quillay-oscuro text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo proveedor
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                RUT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Razón Social
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Ciudad
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
            {proveedores.map((proveedor) => (
              <tr key={proveedor.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">
                    {proveedor.rut || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-quillay-tronco">
                    {proveedor.razon_social}
                  </div>
                  {proveedor.nombre_fantasia && (
                    <div className="text-xs text-neutral-500">
                      {proveedor.nombre_fantasia}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-600">
                    {proveedor.email && <div>{proveedor.email}</div>}
                    {proveedor.telefono && <div>{proveedor.telefono}</div>}
                    {!proveedor.email && !proveedor.telefono && '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-600">
                    {proveedor.ciudad || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {proveedor.activo ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => router.push(`/gastos/proveedores/${proveedor.id}`)}
                      className="inline-flex items-center gap-1 text-quillay-medio hover:text-quillay-oscuro transition-colors"
                      title="Editar proveedor"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(proveedor)}
                      disabled={cambiandoEstado === proveedor.id}
                      className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-800 disabled:opacity-50 transition-colors"
                      title={proveedor.activo ? 'Desactivar' : 'Activar'}
                    >
                      {proveedor.activo ? (
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

        {proveedores.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No hay proveedores registrados
          </div>
        )}
      </div>
    </div>
  );
}