import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Usuario } from '@/types';
import { rolLabels } from '@/types';
import { formatearFecha } from '@/lib/utils/format';
import { CheckCircle2, XCircle, ShoppingCart } from 'lucide-react';

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: miUsuario } = await supabase.from('usuarios').select('*').eq('id', user!.id).single<Usuario>();

  if (!['super_admin', 'admin_contador', 'finanzas_rrhh'].includes(miUsuario!.rol)) redirect('/dashboard');

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*')
    .eq('empresa_id', miUsuario!.empresa_id)
    .order('creado_en', { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Usuarios</h1>
          <p className="text-neutral-600 mt-1">
            {usuarios?.length ?? 0} {usuarios?.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-center">Compras</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-left">Creado</th>
              </tr>
            </thead>
            <tbody>
              {(usuarios as Usuario[] | null)?.map((u) => (
                <tr key={u.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium text-quillay-tronco">{u.nombre_completo}</td>
                  <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs rounded bg-quillay-medio/10 text-quillay-oscuro">
                      {rolLabels[u.rol]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.puede_comprar && <ShoppingCart size={16} className="text-quillay-claro inline" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.activo ? (
                      <CheckCircle2 size={16} className="text-quillay-claro inline" />
                    ) : (
                      <XCircle size={16} className="text-red-400 inline" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{formatearFecha(u.creado_en)}</td>
                </tr>
              ))}
              {(!usuarios || usuarios.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">
                    No hay usuarios registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-quillay-medio/5 border border-quillay-medio/20 rounded-lg p-4 text-xs text-neutral-600">
        <p className="font-medium text-quillay-oscuro mb-1">Próximamente</p>
        <p>
          El formulario para crear usuarios nuevos desde el ERP se agregará en la siguiente iteración.
          Por ahora, para crear usuarios usa Supabase Dashboard → Authentication → Users (paso 1) y
          luego Table Editor → usuarios (paso 2).
        </p>
      </div>
    </div>
  );
}
