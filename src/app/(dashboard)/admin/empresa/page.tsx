import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Empresa, Usuario } from '@/types';

export default async function EmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: usuario } = await supabase.from('usuarios').select('*').eq('id', user!.id).single<Usuario>();

  if (!['super_admin', 'admin_contador'].includes(usuario!.rol)) redirect('/dashboard');

  const { data: empresa } = await supabase.from('empresas').select('*').eq('id', usuario!.empresa_id).single<Empresa>();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-quillay-tronco">Empresa</h1>
        <p className="text-neutral-600 mt-1">Datos de la empresa activa</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          <Field label="Razón social" value={empresa!.razon_social} />
          <Field label="RUT" value={empresa!.rut} />
          <Field label="Dirección" value={empresa!.direccion ?? '—'} />
          <Field label="Comuna" value={empresa!.comuna ?? '—'} />
          <Field label="Giro" value={empresa!.giro ?? '—'} />
          <div className="border-t border-neutral-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-quillay-oscuro mb-3">Representante Legal</h3>
            <Field label="Nombre" value={empresa!.representante_legal_nombre ?? '—'} />
            <Field label="RUT" value={empresa!.representante_legal_rut ?? '—'} />
            <Field label="Profesión" value={empresa!.representante_legal_profesion ?? '—'} />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-xs text-neutral-400">
            La edición de estos datos estará disponible en una próxima iteración. Por ahora, si
            necesitas cambiar algún dato, editalo directamente en Supabase → Table Editor → empresas.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="col-span-2 text-sm text-quillay-tronco">{value}</div>
    </div>
  );
}
