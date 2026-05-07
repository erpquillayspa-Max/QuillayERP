import { createClient } from '@/lib/supabase/server';
import { formatearCLP, formatearFecha } from '@/lib/utils/format';
import Link from 'next/link';
import { Building2, Users, Briefcase, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { Usuario, Empresa, IndicadorDiario } from '@/types';

type CCRow = { id: string; codigo: string; nombre: string; nivel: string; estado: string };
type GastoRow = { centro_costo_id: string; monto_total: number };
type IngresoRow = { centro_costo_id: string | null; monto: number };

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: usuario } = await supabase.from('usuarios').select('*').eq('id', user!.id).single<Usuario>();
  const { data: empresa } = await supabase.from('empresas').select('*').eq('id', usuario!.empresa_id).single<Empresa>();

  // Conteos básicos
  const { count: totalCCs } = await supabase
    .from('centros_costo').select('*', { count: 'exact', head: true }).eq('estado', 'activo');
  const { count: totalUsuarios } = await supabase
    .from('usuarios').select('*', { count: 'exact', head: true }).eq('activo', true);

  // Centros de costo activos para el resumen por CC
  const { data: centrosCosto } = await supabase
    .from('centros_costo')
    .select('id, codigo, nombre, nivel, estado')
    .eq('estado', 'activo')
    .order('codigo')
    .returns<CCRow[]>();

  // Periodo: mes en curso
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).toISOString().split('T')[0];

  // Gastos e ingresos del mes
  const { data: gastosMes } = await supabase
    .from('gastos')
    .select('centro_costo_id, monto_total')
    .gte('fecha', inicioMes)
    .lte('fecha', finMes)
    .returns<GastoRow[]>();

  const { data: ingresosMes } = await supabase
    .from('ingresos')
    .select('centro_costo_id, monto')
    .gte('fecha', inicioMes)
    .lte('fecha', finMes)
    .returns<IngresoRow[]>();

  // Totales globales del mes
  const totalGastosMes = (gastosMes ?? []).reduce((s, g) => s + Number(g.monto_total), 0);
  const totalIngresosMes = (ingresosMes ?? []).reduce((s, i) => s + Number(i.monto), 0);
  const flujoNetoMes = totalIngresosMes - totalGastosMes;

  // Agregaciones por CC
  const gastosPorCC = new Map<string, number>();
  for (const g of gastosMes ?? []) {
    gastosPorCC.set(g.centro_costo_id, (gastosPorCC.get(g.centro_costo_id) ?? 0) + Number(g.monto_total));
  }
  const ingresosPorCC = new Map<string, number>();
  for (const i of ingresosMes ?? []) {
    if (!i.centro_costo_id) continue;
    ingresosPorCC.set(i.centro_costo_id, (ingresosPorCC.get(i.centro_costo_id) ?? 0) + Number(i.monto));
  }

  const resumenCC = (centrosCosto ?? [])
    .map((cc) => ({
      ...cc,
      gastos: gastosPorCC.get(cc.id) ?? 0,
      ingresos: ingresosPorCC.get(cc.id) ?? 0,
      neto: (ingresosPorCC.get(cc.id) ?? 0) - (gastosPorCC.get(cc.id) ?? 0),
    }))
    .filter((cc) => cc.gastos > 0 || cc.ingresos > 0)
    .sort((a, b) => b.gastos + b.ingresos - (a.gastos + a.ingresos));

  // Indicador más reciente
  const { data: ultimoIndicador } = await supabase
    .from('indicadores_diarios')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle<IndicadorDiario>();

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
  const nombreMes = ahora.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-quillay-tronco">
          {saludo}, {usuario!.nombre_completo.split(' ')[0]}
        </h1>
        <p className="text-neutral-600 mt-1">
          {empresa!.razon_social} · {formatearFecha(new Date())}
        </p>
      </div>

      {/* Resumen financiero del mes */}
      <div className="mb-8">
        <h2 className="text-sm uppercase tracking-wide text-neutral-500 mb-3">
          Resumen financiero — {nombreMes}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FinanceCard
            icon={<TrendingUp />}
            label="Ingresos del mes"
            value={formatearCLP(totalIngresosMes)}
            tone="green"
          />
          <FinanceCard
            icon={<TrendingDown />}
            label="Gastos del mes"
            value={formatearCLP(totalGastosMes)}
            tone="red"
          />
          <FinanceCard
            icon={<Wallet />}
            label="Flujo neto"
            value={formatearCLP(flujoNetoMes)}
            tone={flujoNetoMes >= 0 ? 'green' : 'red'}
          />
        </div>
      </div>

      {/* Tarjetas de conteo + UF */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Briefcase className="text-quillay-medio" />}
          label="Centros de costo activos"
          value={totalCCs ?? 0}
        />
        <StatCard
          icon={<Users className="text-quillay-medio" />}
          label="Usuarios activos"
          value={totalUsuarios ?? 0}
        />
        <StatCard
          icon={<Building2 className="text-quillay-medio" />}
          label="Empresa"
          value={empresa!.razon_social.split(' ')[0]}
          subtext={empresa!.rut}
        />
        <StatCard
          icon={<TrendingUp className="text-quillay-medio" />}
          label="UF hoy"
          value={ultimoIndicador?.uf ? formatearCLP(ultimoIndicador.uf) : 'Pendiente'}
          subtext={ultimoIndicador ? formatearFecha(ultimoIndicador.fecha) : 'Sin datos'}
        />
      </div>

      {/* Resumen por Centro de Costo */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-quillay-tronco">Movimiento por Centro de Costo</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Mes en curso</p>
          </div>
          <Link
            href="/admin/centros-costo"
            className="text-sm text-quillay-medio hover:text-quillay-oscuro"
          >
            Ver todos →
          </Link>
        </div>

        {resumenCC.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-sm">
            Sin movimientos registrados este mes.{' '}
            <Link href="/gastos/registro/nuevo" className="text-quillay-medio hover:underline">
              Registra un gasto
            </Link>{' '}
            o{' '}
            <Link href="/ingresos/nuevo" className="text-quillay-medio hover:underline">
              un ingreso
            </Link>.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">Código</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">Nombre</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-500 uppercase">Ingresos</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-500 uppercase">Gastos</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-500 uppercase">Neto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {resumenCC.map((cc) => (
                <tr key={cc.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5 text-sm font-mono text-neutral-700">{cc.codigo}</td>
                  <td className="px-4 py-2.5 text-sm text-quillay-tronco">
                    <Link href={`/admin/centros-costo/${cc.id}`} className="hover:text-quillay-medio">
                      {cc.nombre}
                    </Link>
                    <span className="ml-2 text-xs text-neutral-400">{cc.nivel}</span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right text-green-700">
                    {cc.ingresos > 0 ? formatearCLP(cc.ingresos) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right text-red-700">
                    {cc.gastos > 0 ? formatearCLP(cc.gastos) : '-'}
                  </td>
                  <td className={`px-4 py-2.5 text-sm text-right font-semibold ${
                    cc.neto >= 0 ? 'text-quillay-tronco' : 'text-red-700'
                  }`}>
                    {formatearCLP(cc.neto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Estado del sistema */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-quillay-tronco mb-4">Estado del sistema</h2>
        <div className="space-y-2 text-sm">
          <EstadoItem label="Fase actual" valor="Fase 2 — Gastos + Ingresos + Dashboard CC" ok />
          <EstadoItem label="Base de datos" valor="Tablas Fase 1+2 con RLS activo" ok />
          <EstadoItem label="Ley 40 hrs" valor="42 hrs vigentes (hasta abril 2028)" ok />
          <EstadoItem label="Compras con IA" valor="Disponible en Fase 3" />
          <EstadoItem label="RRHH completo" valor="Disponible en Fase 4-6" />
          <EstadoItem label="Integración SII" valor="Disponible en Fase 9" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-quillay-medio/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-quillay-tronco truncate">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
      {subtext && <div className="text-xs text-neutral-400 mt-0.5">{subtext}</div>}
    </div>
  );
}

function FinanceCard({
  icon, label, value, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'green' | 'red';
}) {
  const colors = tone === 'green'
    ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' }
    : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' };
  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={colors.icon}>{icon}</div>
        <span className="text-xs uppercase tracking-wide text-neutral-600">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
    </div>
  );
}

function EstadoItem({ label, valor, ok }: { label: string; valor: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0">
      <span className="text-neutral-600">{label}</span>
      <span className={`font-medium ${ok ? 'text-quillay-claro' : 'text-neutral-400'}`}>
        {ok && '✓ '}{valor}
      </span>
    </div>
  );
}
