'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CategoriaGasto } from '@/types';

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [categoria, setCategoria] = useState<CategoriaGasto | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    activa: true
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    cargarCategoria();
  }, [id]);

  async function cargarCategoria() {
    const { data, error } = await supabase
      .from('categorias_gasto')
      .select('*')
      .eq('id', id)
      .single<CategoriaGasto>();

    if (error || !data) {
      setError('Categoría no encontrada');
      setCargando(false);
      return;
    }

    setCategoria(data);
    setForm({
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      activa: data.activa
    });
    setCargando(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(null);

    const { error: updateError } = await supabase
      .from('categorias_gasto')
      .update({
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        activa: form.activa
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setGuardando(false);
      return;
    }

    setExito('Categoría actualizada correctamente');
    setGuardando(false);
    setTimeout(() => router.push('/gastos/categorias'), 1500);
  }

  if (cargando) {
    return <div className="text-neutral-500">Cargando categoría...</div>;
  }

  if (!categoria) {
    return (
      <div>
        <Link
          href="/gastos/categorias"
          className="text-quillay-medio hover:text-quillay-oscuro inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver a categorías
        </Link>
        <p className="mt-4 text-red-600">Categoría no encontrada</p>
      </div>
    );
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
        <h1 className="text-3xl font-serif text-quillay-tronco">Editar categoría</h1>
        <p className="text-neutral-600 mt-1">{categoria.nombre}</p>
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
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="activa"
            type="checkbox"
            checked={form.activa}
            onChange={(e) => setForm({ ...form, activa: e.target.checked })}
            className="h-4 w-4 text-quillay-medio border-neutral-300 rounded"
          />
          <label htmlFor="activa" className="text-sm text-neutral-700">
            Categoría activa
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {exito && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
            {exito}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-quillay-medio hover:bg-quillay-oscuro disabled:bg-neutral-400 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
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