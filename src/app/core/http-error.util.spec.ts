import { HttpErrorResponse } from '@angular/common/http';
import { httpErrorMessage } from './http-error.util';

describe('httpErrorMessage', () => {
  it('prioriza el mensaje seguro del backend', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'La evidencia ya fue revisada.' } });
    expect(httpErrorMessage(error, 'fallback')).toBe('La evidencia ya fue revisada.');
  });

  it('traduce errores de red y estados HTTP conocidos', () => {
    expect(httpErrorMessage(new HttpErrorResponse({ status: 0 }), 'fallback')).toContain('conectar');
    expect(httpErrorMessage(new HttpErrorResponse({ status: 413 }), 'fallback')).toContain('tamaño');
    expect(httpErrorMessage(new Error('otro'), 'fallback')).toBe('fallback');
  });
});
