'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NuevaCategoriaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      // Obtener empresa_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No autenticado');
        setGuardando(false);
        return;
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!usuario) {
        setError('Usuario no encontrado');
        setGuardando(false);
        return;
      }

      // Crear categoría
      const { error: insertError } = await supabase
        .from('categorias_gasto')
        .insert({
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          empresa_id: usuario.empresa_id
        });

      if (insertError) {
        setError(insertError.message);
        setGuardando(false);
        return;
      }

      alert('Categoría creada correctamente');
      router.push('/gastos/categorias');
    } catch (err: any) {
      setError(err.message || 'Error al crear categoría');
      setGuardando(false);
    }
  }

  return (
    <div>
      <Link
        href="/gastos/categorias"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-quillay-medio mb-4"
      >
        <ArrowLeft size={16} />
        Volver a categorías
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-serif text-quillay-tronco">Nueva categoría</h1>
        <p className="text-neutral-600 mt-1">Crear una nueva categoría de gasto</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            required
            placeholder="Ej: Materiales de construcción"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Descripción
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-quillay-medio focus:outline-none"
            rows={3}
            placeholder="Descripción opcional de la categoría"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-quillay-medio hover:bg-quillay-oscuro disabled:bg-neutral-400 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            {guardando ? 'Creando...' : 'Crear categoría'}
          </button>
          <Link
            href="/gastos/categorias"
            className="px-6 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}