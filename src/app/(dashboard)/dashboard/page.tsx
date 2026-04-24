import { createClient } from '@/lib/supabase/server';
import { formatearCLP, formatearFecha } from '@/lib/utils/format';
import { Building2, Users, Briefcase, TrendingUp } from 'lucide-react';
import type { Usuario, Empresa, IndicadorDiario } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: usuario } = await supabase.from('usuarios').select('*').eq('id', user!.id).single<Usuario>();
  const { data: empresa } = await supabase.from('empresas').select('*').eq('id', usuario!.empresa_id).single<Empresa>();

  // Conteos básicos
  const { count: totalCCs } = await supabase.from('centros_costo').select('*', { count: 'exact', head: true }).eq('estado', 'activo');
  const { count: totalTrabajadores } = await supabase.from('trabajadores').select('*', { count: 'exact', head: true }).eq('activo', true);
  const { count: totalUsuarios } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('activo', true);

  // Indicador más reciente (si existe)
  const { data: ultimoIndicador } = await supabase
    .from('indicadores_diarios')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle<IndicadorDiario>();

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

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

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Briefcase className="text-quillay-medio" />}
          label="Centros de costo activos"
          value={totalCCs ?? 0}
        />
        <StatCard
          icon={<Users className="text-quillay-medio" />}
          label="Trabajadores activos"
          value={totalTrabajadores ?? 0}
        />
        <StatCard
          icon={<Building2 className="text-quillay-medio" />}
          label="Usuarios del sistema"
          value={totalUsuarios ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="text-quillay-medio" />}
          label="UF hoy"
          value={ultimoIndicador?.uf ? formatearCLP(ultimoIndicador.uf) : 'Pendiente'}
          subtext={ultimoIndicador ? formatearFecha(ultimoIndicador.fecha) : 'Se actualiza en Fase 1+'}
        />
      </div>

      {/* Estado del sistema */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-quillay-tronco mb-4">Estado del sistema</h2>
        <div className="space-y-2 text-sm">
          <EstadoItem label="Fase actual" valor="Fase 1 — Fundaciones" ok />
          <EstadoItem label="Base de datos" valor="12 tablas, RLS activo" ok />
          <EstadoItem label="Ley 40 hrs" valor="42 hrs vigentes (hasta abril 2028)" ok />
          <EstadoItem label="Dashboards de gastos" valor="Disponibles en Fase 2" />
          <EstadoItem label="RRHH completo" valor="Disponibles en Fase 4-6" />
          <EstadoItem label="Integración SII" valor="Disponible en Fase 9" />
        </div>
      </div>

      {/* Mensaje bienvenida */}
      <div className="bg-quillay-medio/5 border border-quillay-medio/20 rounded-lg p-6 text-sm text-neutral-700">
        <p className="font-medium text-quillay-oscuro mb-2">Bienvenido al ERP Quillay</p>
        <p>
          Este es el inicio de un sistema que crecerá por fases. En esta primera versión
          están listas la gestión de usuarios, empresa, centros de costo básicos y parámetros
          legales chilenos. En las próximas semanas se agregarán módulos de gastos, RRHH,
          liquidaciones, SII e inventario.
        </p>
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
      <div className="text-2xl font-semibold text-quillay-tronco">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
      {subtext && <div className="text-xs text-neutral-400 mt-0.5">{subtext}</div>}
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
