export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type Rol = 'NEGOCIO' | 'DEPORTISTA';
export type EstadoContrato = 'PENDIENTE' | 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';
export type EstadoMeta = 'PENDIENTE' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | 'PAGADA';
export type EstadoEvidencia = 'EN_REVISION' | 'APROBADA' | 'RECHAZADA';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  correo: string;
  rol: Rol;
  nombreMostrar: string;
  token: string;
}

export interface RegisterNegocioRequest {
  razonSocial: string;
  ruc: string;
  correo: string;
  password: string;
}

export interface RegisterDeportistaRequest {
  nombreCompleto: string;
  correo: string;
  password: string;
  dni: string;
  disciplina: string;
  biografia: string;
}

export interface RegisterResponse {
  id: number;
  correo: string;
  rol: Rol;
}

export interface DeportistaCatalogo {
  idUsuario: number;
  correo: string | null;
  nombreCompleto: string;
  dni: string;
  disciplina: string;
  biografia: string;
  montoObjetivo: number;
  contratosActivos: number;
}

export interface PlantillaMeta {
  id: number;
  nombreMeta: string;
  descripcionSugerida: string;
  tipoEntregable: string;
  precioSugerido: number;
}

export interface MetaSeleccionadaRequest {
  idPlantilla: number;
  descripcionAcordada: string;
  montoDeportista: number;
  comentarioDeportista?: string;
}

export interface CrearContratoRequest {
  idNegocio: number;
  idDeportista: number;
  metas: MetaSeleccionadaRequest[];
}

export interface CrearContratoResponse {
  idContrato: number;
  montoTotal: number;
  estado: EstadoContrato;
  metas: MetaContratoCreada[];
}

export interface MetaContratoCreada {
  idMeta: number;
  idPlantilla: number;
  descripcionAcordada: string;
  montoDeportista: number;
  estado: EstadoMeta;
}

export interface MetaContratoDetalle {
  idMeta: number;
  idPlantilla: number;
  descripcionAcordada: string;
  montoDeportista: number;
  montoNegocio: number;
  comentarioDeportista: string | null;
  urlEvidencia: string | null;
  estado: EstadoMeta;
  evidenciaActual: EvidenciaDetalle | null;
  evidencias: EvidenciaDetalle[];
}

export interface ContratoDetalle {
  idContrato: number;
  idNegocio: number;
  razonSocialNegocio: string;
  idDeportista: number;
  nombreDeportista: string;
  disciplinaDeportista: string | null;
  montoTotal: number;
  montoRetenido: number;
  montoLiberado: number;
  estado: EstadoContrato;
  fechaCreacion: string;
  metas: MetaContratoDetalle[];
}

export interface AprobarMetaResponse {
  idMeta: number;
  estado: string;
  montoLiberado: number;
}

export interface EvidenciaDetalle {
  idEvidencia: number;
  idMetaContrato: number;
  numeroIntento: number;
  nombreOriginal: string;
  tipoMime: string;
  tamanioBytes: number;
  hashSha256: string;
  comentarioDeportista: string | null;
  estado: EstadoEvidencia;
  motivoRechazo: string | null;
  fechaCarga: string;
  fechaRevision: string | null;
  urlArchivo: string;
}

export interface AprobarEvidenciaResponse {
  idEvidencia: number;
  idMeta: number;
  estadoMeta: EstadoMeta;
  montoNeto: number;
  comisionPlataforma: number;
  saldoRetenido: number;
  estadoContrato: EstadoContrato;
}

export interface TransaccionDetalle {
  id: number;
  idContrato: number;
  idMetaContrato: number;
  montoNeto: number;
  comisionPlataforma: number;
  fechaEjecucion: string;
}

export interface HistorialContrato {
  idContrato: number;
  evidencias: EvidenciaDetalle[];
  transacciones: TransaccionDetalle[];
}

export interface DashboardResumen {
  contratos: number;
  metas: number;
  metasPendientes: number;
  evidenciasEnRevision: number;
  metasPagadas: number;
  montoComprometido: number;
  montoRetenido: number;
  montoLiberado: number;
  comisionPlataforma: number;
}

export type TipoNotificacion =
  | 'CONTRATO_CREADO'
  | 'EVIDENCIA_ENVIADA'
  | 'EVIDENCIA_REENVIADA'
  | 'EVIDENCIA_RECHAZADA'
  | 'EVIDENCIA_APROBADA'
  | 'META_PAGADA'
  | 'CONTRATO_FINALIZADO';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  entidadRelacionada: string;
  idEntidad: string;
  fecha: string;
  leida: boolean;
  fechaLectura: string | null;
}
