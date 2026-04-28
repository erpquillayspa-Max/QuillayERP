'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Usuario } from '@/types';
import { rolLabels } from '@/types';

export default function UsuariosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [miRol, setMiRol] = useState<string>('');
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    async function cargarUsuarios() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: miU } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();
        
        if (miU) setMiRol(miU.rol);
      }

      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('*')
        

      if (usuariosData) {
        setUsuarios(usuariosData);
      }
      
      setCargando(false);
    }
    
    cargarUsuarios();
  }, [supabase]);

  async function handleEliminar(usuario: Usuario) {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar a ${usuario.nombre_completo} (${usuario.email})?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    setEliminando(usuario.id);

    try {
      const res = await fetch(`/api/admin/usuarios?id=${usuario.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error}`);
        setEliminando(null);
        return;
      }

      setUsuarios(usuarios.filter(u => u.id !== usuario.id));
      setEliminando(null);
      alert(`Usuario ${data.email} eliminado correctamente`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setEliminando(null);
    }
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando usuarios...</div>;
  }

  const esSuperAdmin = miRol === 'super_admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-quillay-tronco">Usuarios</h1>
          <p className="text-neutral-600 mt-1">Gestiona los accesos al sistema</p>
        </div>
        {esSuperAdmin && (
          <Link
            href="/admin/usuarios/nuevo"
            className="inline-flex items-center gap-2 bg-quillay-medio hover:bg-quillay-oscuro text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Nuevo usuario
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Permisos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Estado
              </th>
              {esSuperAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-quillay-tronco">
                      {usuario.nombre_completo}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {usuario.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-quillay-claro text-white">
                    {rolLabels[usuario.rol]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {usuario.puede_comprar ? (
                    <span className="text-quillay-medio">✓ Puede comprar</span>
                  ) : (
                    <span className="text-neutral-400">Sin permisos compra</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {usuario.activo ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Inactivo
                    </span>
                  )}
                </td>
                {esSuperAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => router.push(`/admin/usuarios/${usuario.id}`)}
                        className="inline-flex items-center gap-1 text-quillay-medio hover:text-quillay-oscuro transition-colors"
                        title="Editar usuario"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(usuario)}
                        disabled={eliminando === usuario.id}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={16} />
                        {eliminando === usuario.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No hay usuarios registrados
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los usuarios desactivados no pueden ingresar al sistema pero su historial se conserva. 
          No se eliminan usuarios para mantener integridad de auditoría.
        </p>
      </div>
    </div>
  );
}