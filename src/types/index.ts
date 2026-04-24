// ============================================================
// Tipos TypeScript — ERP Quillay
// ============================================================

export type RolUsuario =
  | 'super_admin'
  | 'admin_contador'
  | 'finanzas_rrhh'
  | 'supervisor'
  | 'trabajador'
  | 'solo_lectura';

export type TipoCC = 'cliente' | 'interno' | 'postventa';
export type NivelCC = 'N1' | 'N2' | 'N3';
export type EstadoCC = 'activo' | 'cerrado' | 'pausado';

export interface Empresa {
  id: string;
  razon_social: string;
  rut: string;
  direccion: string | null;
  comuna: string | null;
  giro: string | null;
  representante_legal_nombre: string | null;
  representante_legal_rut: string | null;
  representante_legal_profesion: string | null;
  logo_url: string | null;
  color_primario: string;
  activa: boolean;
  creada_en: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: RolUsuario;
  empresa_id: string;
  trabajador_id: string | null;
  puede_comprar: boolean;
  activo: boolean;
  telefono: string | null;
  ultimo_acceso: string | null;
  creado_en: string;
}

export interface CentroCosto {
  id: string;
  empresa_id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCC;
  nivel: NivelCC;
  padre_id: string | null;
  cliente_id: string | null;
  responsable_usuario_id: string | null;
  presupuesto: number;
  fecha_inicio: string | null;
  fecha_termino: string | null;
  estado: EstadoCC;
  lleva_bodega: boolean;
  porcentaje_retencion_default: number;
  cc_padre_postventa_id: string | null;
  notas: string | null;
  creado_por: string | null;
  creado_en: string;
}

export interface ParametroLegal {
  id: string;
  clave: string;
  valor: number;
  unidad: string | null;
  descripcion: string | null;
  vigente_desde: string;
  vigente_hasta: string | null;
  creado_en: string;
}

export interface AfpTasa {
  id: string;
  afp: string;
  tasa_dependiente: number;
  comision: number;
  vigente_desde: string;
  vigente_hasta: string | null;
}

export interface BancoChile {
  id: string;
  nombre: string;
  codigo_santander: string | null;
  activo: boolean;
}

export interface IndicadorDiario {
  fecha: string;
  uf: number | null;
  utm: number | null;
  dolar_observado: number | null;
  euro: number | null;
  fuente: string;
  obtenido_en: string;
}

// Etiquetas de rol para mostrar en la UI
export const rolLabels: Record<RolUsuario, string> = {
  super_admin: 'Super Administrador',
  admin_contador: 'Administrador / Contador',
  finanzas_rrhh: 'Finanzas / RRHH',
  supervisor: 'Supervisor',
  trabajador: 'Trabajador',
  solo_lectura: 'Solo Lectura',
};
