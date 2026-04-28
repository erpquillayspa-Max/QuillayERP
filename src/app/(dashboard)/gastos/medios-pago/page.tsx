'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { MedioPago } from '@/types';
import { tipoMedioPagoLabels } from '@/types';

export default function MediosPagoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [medios, setMedios] = useState<MedioPago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState<string | null>(null);

  useEffect(() => {
    cargarMedios();
  }, []);

  async function cargarMedios() {
    const { data } = await supabase
      .from('medios_pago')
      .select('*')
      .order('nombre');

    if (data) setMedios(data);
    setCargando(false);
  }

  async function toggleActivo(medio: MedioPago) {
    setCambiandoEstado(medio.id);

    const { error } = await supabase
      .from('medios_pago')
      .update({ activo: !medio.activo })
      .eq('id', medio.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      cargarMedios();
    }

    setCambiandoEstado(null);
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando medios de pago...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Medios de Pago</h1>
          <p className="text-neutral-600 mt-1">Administra los medios de pago de la empresa</p>
        </div>
        <Link
          href="/gastos/medios-pago/nuevo"
          className="inline-flex items-center gap-2 bg-quillay-medio hover:bg-quillay-oscuro text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo medio de pago
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
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Banco
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Últimos 4 dígitos
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
            {medios.map((medio) => (
              <tr key={medio.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-quillay-tronco">
                    {medio.nombre}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-600">
                    {tipoMedioPagoLabels[medio.tipo]}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-600">
                    {medio.banco || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-600">
                    {medio.ultimos_4_digitos ? `**** ${medio.ultimos_4_digitos}` : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {medio.activo ? (
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
                      onClick={() => router.push(`/gastos/medios-pago/${medio.id}`)}
                      className="inline-flex items-center gap-1 text-quillay-medio hover:text-quillay-oscuro transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(medio)}
                      disabled={cambiandoEstado === medio.id}
                      className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-800 disabled:opacity-50 transition-colors"
                      title={medio.activo ? 'Desactivar' : 'Activar'}
                    >
                      {medio.activo ? (
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

        {medios.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No hay medios de pago registrados
          </div>
        )}
      </div>
    </div>
  );
}