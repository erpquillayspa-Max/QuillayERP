import { createClient } from '@/lib/supabase/server';
import type { CentroCosto, Usuario } from '@/types';
import { formatearCLP } from '@/lib/utils/format';
import { Package, PackageOpen } from 'lucide-react';

export default async function CentrosCostoPage() {
  const supabase = await createClient();

  // Gracias a RLS, la consulta se filtra automáticamente por rol
  const { data: ccs } = await supabase
    .from('centros_costo')
    .select('*')
    .order('nivel', { ascending: true })
    .order('codigo', { ascending: true });

  // Agrupar por tipo
  const internos = (ccs as CentroCosto[] | null)?.filter((c) => c.tipo === 'interno') ?? [];
  const clientes = (ccs as CentroCosto[] | null)?.filter((c) => c.tipo === 'cliente') ?? [];
  const postventas = (ccs as CentroCosto[] | null)?.filter((c) => c.tipo === 'postventa') ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-quillay-tronco">Centros de Costo</h1>
        <p className="text-neutral-600 mt-1">
          {ccs?.length ?? 0} centros en total
        </p>
      </div>

      <Section title="Clientes (N1)" items={clientes} empty="No hay centros de costo de clientes todavía. Se agregarán cuando lleguen los primeros proyectos." />
      <Section title="Internos" items={internos} />
      {postventas.length > 0 && (
        <Section title="Postventa" items={postventas} />
      )}

      <div className="mt-6 bg-quillay-medio/5 border border-quillay-medio/20 rounded-lg p-4 text-xs text-neutral-600">
        <p className="font-medium text-quillay-oscuro mb-1">Próximamente (Fase 2)</p>
        <p>
          Creación y edición de centros de costo desde el ERP, con asignación jerárquica (N1/N2/N3),
          presupuesto, fechas, responsable y supervisores. También: dashboard de gastos por CC,
          alertas de presupuesto y gestión de postventa automática al cierre.
        </p>
      </div>
    </div>
  );
}

function Section({
  title, items, empty,
}: {
  title: string;
  items: CentroCosto[];
  empty?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-quillay-oscuro uppercase tracking-wide mb-3">{title}</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {items.length === 0 ? (
          <div className="p-6 text-center text-neutral-400 text-sm">
            {empty ?? 'Sin registros'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Nivel</th>
                  <th className="px-4 py-3 text-center">Bodega</th>
                  <th className="px-4 py-3 text-right">Presupuesto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((cc) => (
                  <tr key={cc.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-mono text-xs text-quillay-tronco">{cc.codigo}</td>
                    <td className="px-4 py-3 font-medium text-quillay-tronco">{cc.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-neutral-100 text-neutral-700">
                        {cc.nivel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cc.lleva_bodega ? (
                        <Package size={16} className="text-quillay-claro inline" aria-label="Con bodega" />
                      ) : (
                        <PackageOpen size={16} className="text-neutral-300 inline" aria-label="Sin bodega" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">
                      {cc.presupuesto > 0 ? formatearCLP(cc.presupuesto) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                        cc.estado === 'activo' ? 'bg-quillay-claro/20 text-quillay-oscuro' :
                        cc.estado === 'cerrado' ? 'bg-neutral-200 text-neutral-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {cc.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
