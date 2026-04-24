import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear RUT chileno: 12.345.678-9
export function formatearRut(rut: string): string {
  const clean = rut.replace(/\D/g, '');
  if (clean.length < 2) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const cuerpoFormat = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormat}-${dv}`;
}

// Formatear CLP: $1.234.567
export function formatearCLP(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto);
}

// Formatear UF
export function formatearUF(monto: number): string {
  return `UF ${monto.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Formatear fecha corta: 24-04-2026
export function formatearFecha(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
