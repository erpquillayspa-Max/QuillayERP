// =====================================================
// TIPOS BASE DEL SISTEMA
// =====================================================

export type RolUsuario = 
  | 'super_admin' 
  | 'admin_contador' 
  | 'finanzas_rrhh' 
  | 'supervisor' 
  | 'trabajador' 
  | 'solo_lectura';

export const rolLabels: Record<RolUsuario, string> = {
  super_admin: 'Super Administrador',
  admin_contador: 'Admin Contador',
  finanzas_rrhh: 'Finanzas / RRHH',
  supervisor: 'Supervisor',
  trabajador: 'Trabajador',
  solo_lectura: 'Solo Lectura'
};

export type Usuario = {
  id: string;
  email: string;
  nombre_completo: string;
  rol: RolUsuario;
  puede_comprar: boolean;
  activo: boolean;
  telefono: string | null;
  empresa_id: string;
  trabajador_id: string | null;
  ultimo_acceso: string | null;
  created_en: string;
  updated_en: string;
};

export type Empresa = {
  id: string;
  razon_social: string;
  rut: string;
  direccion: string;
  comuna: string;
  giro: string;
  representante_legal_nombre: string;
  representante_legal_rut: string;
  representante_legal_profesion: string;
  logo_url: string | null;
  color_primario: string | null;
  activa: boolean;
  creada_en: string;
};

export type CentroCosto = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  nivel: number;
  padre_id: string | null;
  es_bodega: boolean;
  activo: boolean;
  empresa_id: string;
  creado_en: string;
};

export type ParametroLegal = {
  id: string;
  nombre: string;
  codigo: string;
  valor_numerico: number | null;
  valor_texto: string | null;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  descripcion: string | null;
  created_en: string;
};

export type AFP = {
  id: string;
  nombre: string;
  tasa: number;
  tasa_independiente: number;
  activa: boolean;
  created_en: string;
};

export type Banco = {
  id: string;
  nombre: string;
  codigo_santander: string;
  activo: boolean;
};

// =====================================================
// TIPOS FASE 2: MÓDULO DE GASTOS
// =====================================================

export type CategoriaGasto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  empresa_id: string;
  created_en: string;
  updated_en: string;
};

export type Proveedor = {
  id: string;
  rut: string | null;
  razon_social: string;
  nombre_fantasia: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  activo: boolean;
  notas: string | null;
  empresa_id: string;
  created_en: string;
  updated_en: string;
};

export type TipoMedioPago = 
  | 'tarjeta_credito' 
  | 'tarjeta_debito' 
  | 'cuenta_corriente' 
  | 'efectivo' 
  | 'transferencia' 
  | 'cheque' 
  | 'otro';

export const tipoMedioPagoLabels: Record<TipoMedioPago, string> = {
  tarjeta_credito: 'Tarjeta de Crédito',
  tarjeta_debito: 'Tarjeta de Débito',
  cuenta_corriente: 'Cuenta Corriente',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  otro: 'Otro'
};

export type MedioPago = {
  id: string;
  nombre: string;
  tipo: TipoMedioPago;
  banco: string | null;
  ultimos_4_digitos: string | null;
  activo: boolean;
  empresa_id: string;
  created_en: string;
  updated_en: string;
};

export type Gasto = {
  id: string;
  fecha: string;
  monto_neto: number;
  monto_iva: number;
  monto_total: number;
  descripcion: string;
  numero_documento: string | null;
  categoria_id: string;
  proveedor_id: string | null;
  medio_pago_id: string | null;
  centro_costo_id: string;
  usuario_registro_id: string;
  empresa_id: string;
  created_en: string;
  updated_en: string;
};

export type TipoIngreso = 'estado_pago' | 'abono' | 'otro';

export const tipoIngresoLabels: Record<TipoIngreso, string> = {
  estado_pago: 'Estado de Pago',
  abono: 'Abono',
  otro: 'Otro'
};

export type Ingreso = {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string;
  tipo: TipoIngreso;
  numero_documento: string | null;
  centro_costo_id: string | null;
  usuario_registro_id: string;
  empresa_id: string;
  created_en: string;
  updated_en: string;
};