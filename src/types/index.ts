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

// =====================================================
// CENTROS DE COSTO
// =====================================================

export type TipoCC = 'cliente' | 'interno' | 'postventa';
export type NivelCC = 'N1' | 'N2' | 'N3';
export type EstadoCC = 'activo' | 'cerrado' | 'pausado';

export const tipoCCLabels: Record<TipoCC, string> = {
  cliente: 'Cliente',
  interno: 'Interno',
  postventa: 'Postventa'
};

export const nivelCCLabels: Record<NivelCC, string> = {
  N1: 'Nivel 1 - División',
  N2: 'Nivel 2 - Proyecto',
  N3: 'Nivel 3 - Etapa'
};

export const estadoCCLabels: Record<EstadoCC, string> = {
  activo: 'Activo',
  cerrado: 'Cerrado',
  pausado: 'Pausado'
};

export type CentroCosto = {
  id: string;
  empresa_id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCC;
  nivel: NivelCC;
  padre_id: string | null;
  cliente_id: string | null;
  responsable_usuario_id: string | null;
  presupuesto: number | null;
  fecha_inicio: string | null;
  fecha_termino: string | null;
  estado: EstadoCC;
  lleva_bodega: boolean;
  porcentaje_retencion_default: number | null;
  cc_padre_postventa_id: string | null;
  notas: string | null;
  creado_por: string | null;
  creado_en: string;
};

// =====================================================
// PARÁMETROS LEGALES Y AFP
// =====================================================

export type ParametroLegal = {
  id: string;
  clave: string;
  valor: number;
  unidad: string | null;
  vigente_desde: string;
  vigente_hasta: string | null;
  descripcion: string | null;
  created_en: string;
};

export type AfpTasa = {
  id: string;
  afp: string;
  tasa_dependiente: number;
  comision: number;
  vigente_desde: string;
  vigente_hasta: string | null;
  created_en: string;
};

// Mantener AFP por compatibilidad con código viejo
export type AFP = AfpTasa;

export type Banco = {
  id: string;
  nombre: string;
  codigo_santander: string;
  activo: boolean;
};

export type IndicadorDiario = {
  id: string;
  fecha: string;
  uf: number | null;
  utm: number | null;
  dolar_observado: number | null;
  euro: number | null;
  ipc: number | null;
  created_en: string;
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