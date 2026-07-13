import { HttpErrorResponse } from '@angular/common/http';

const messages: Record<number, string> = {
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso solicitado ya no está disponible.',
  409: 'La operación entra en conflicto con el estado actual. Actualiza e inténtalo nuevamente.',
  413: 'El archivo supera el tamaño máximo permitido.'
};

export function httpErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.';
  return error.error?.message || messages[error.status] || fallback;
}
