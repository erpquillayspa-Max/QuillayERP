import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Usuario, ParametroLegal, AfpTasa } from '@/types';
import { formatearFecha } from '@/lib/utils/format';

export default async function ParametrosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: usuario } = await supabase.from('usuarios').select('*').eq('id', user!.id).single<Usuario>();

  if (!['super_admin', 'admin_contador'].includes(usuario!.rol)) redirect('/dashboard');

  const hoy = new Date().toISOString().split('T')[0];

  const { data: parametros } = await supabase
    .from('parametros_legales')
    .select('*')
    .order('clave', { ascending: true })
    .order('vigente_desde', { ascending: false });

  const { data: afps } = await supabase
    .from('afp_tasas')
    .select('*')
    .order('afp', { ascending: true });

  // Agrupar parámetros por clave, marcar el vigente
  const parametrosAgrupados = new Map<string, ParametroLegal[]>();
  (parametros as ParametroLegal[] | null)?.forEach((p) => {
    if (!parametrosAgrupados.has(p.clave)) parametrosAgrupados.set(p.clave, []);
    parametrosAgrupados.get(p.clave)!.push(p);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-quillay-tronco">Parámetros Legales</h1>
        <p className="text-neutral-600 mt-1">
          Valores editables: UF, UTM, topes, tasas, jornada laboral
        </p>
      </div>

      {/* Parámetros generales */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-quillay-oscuro uppercase tracking-wide mb-3">
          Parámetros generales
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Parámetro</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-left">Unidad</th>
                  <th className="px-4 py-3 text-left">Vigente desde</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(parametrosAgrupados.entries()).map(([clave, versiones]) => (
                  versiones.map((p, idx) => {
                    const esVigente = p.vigente_desde <= hoy && (!p.vigente_hasta || p.vigente_hasta >= hoy);
                    const esFuturo = p.vigente_desde > hoy;
                    return (
                      <tr key={p.id} className={`border-t border-neutral-100 ${idx > 0 ? 'bg-neutral-50/50' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-quillay-tronco">
                          {idx === 0 ? clave : <span className="text-neutral-400">└ {clave}</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {p.valor.toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{p.unidad ?? '—'}</td>
                        <td className="px-4 py-3 text-neutral-600 text-xs">{formatearFecha(p.vigente_desde)}</td>
                        <td className="px-4 py-3">
                          {esVigente ? (
                            <span className="inline-block px-2 py-0.5 text-xs rounded bg-quillay-claro/20 text-quillay-oscuro">
                              Vigente
                            </span>
                          ) : esFuturo ? (
                            <span className="inline-block px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">
                              Futuro
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-xs rounded bg-neutral-200 text-neutral-500">
                              Histórico
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tasas AFP */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-quillay-oscuro uppercase tracking-wide mb-3">
          Tasas AFP vigentes
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">AFP</th>
                <th className="px-4 py-3 text-right">Tasa dependiente</th>
                <th className="px-4 py-3 text-right">Comisión</th>
                <th className="px-4 py-3 text-left">Vigente desde</th>
              </tr>
            </thead>
            <tbody>
              {(afps as AfpTasa[] | null)?.map((afp) => (
                <tr key={afp.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium text-quillay-tronco">{afp.afp}</td>
                  <td className="px-4 py-3 text-right">{afp.tasa_dependiente.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right text-neutral-600">{afp.comision.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-neutral-600 text-xs">{formatearFecha(afp.vigente_desde)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-quillay-medio/5 border border-quillay-medio/20 rounded-lg p-4 text-xs text-neutral-600">
        <p className="font-medium text-quillay-oscuro mb-1">Actualizaciones automáticas (próximamente)</p>
        <p>
          La UF, UTM y dólar observado se actualizarán cada noche a las 3am desde la API del Banco
          Central de Chile. Las tasas AFP e Isapre requieren actualización manual semestral. Los
          topes imponibles (UF 87,8) cambian cada 1 de febrero.
        </p>
      </div>
    </div>
  );
}
