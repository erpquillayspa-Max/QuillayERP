'use client';

import { useRouter } from 'next/navigation';
import { FolderTree, Users2, CreditCard, Receipt } from 'lucide-react';

export default function GastosPage() {
  const router = useRouter();

  const modulos = [
    {
      titulo: 'Registro de Gastos',
      descripcion: 'Registra y consulta todos los gastos de la empresa',
      icono: Receipt,
      href: '/gastos/registro',
      color: 'bg-quillay-medio',
      destacado: true
    },
    {
      titulo: 'Categorías de Gasto',
      descripcion: 'Administra las categorías para clasificar gastos',
      icono: FolderTree,
      href: '/gastos/categorias',
      color: 'bg-blue-500'
    },
    {
      titulo: 'Proveedores',
      descripcion: 'Catálogo de proveedores y prestadores de servicios',
      icono: Users2,
      href: '/gastos/proveedores',
      color: 'bg-green-500'
    },
    {
      titulo: 'Medios de Pago',
      descripcion: 'Tarjetas, cuentas bancarias y medios de pago',
      icono: CreditCard,
      href: '/gastos/medios-pago',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-quillay-tronco">Módulo de Gastos</h1>
        <p className="text-neutral-600 mt-1">Gestión completa de gastos, proveedores y categorías</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {modulos.map((modulo) => {
          const Icono = modulo.icono;
          return (
            <div
              key={modulo.href}
              onClick={() => router.push(modulo.href)}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border cursor-pointer ${
                modulo.destacado 
                  ? 'border-quillay-medio ring-2 ring-quillay-claro/30' 
                  : 'border-neutral-200 hover:border-quillay-medio'
              }`}
            >
              <div className={`${modulo.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icono size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-quillay-tronco mb-2">
                {modulo.titulo}
              </h3>
              <p className="text-sm text-neutral-600">
                {modulo.descripcion}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}