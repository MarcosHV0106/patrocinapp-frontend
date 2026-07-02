import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const rawSession = localStorage.getItem('patrocinapp_session');
  const token = rawSession ? safelyReadToken(rawSession) : null;

  if (!token) return next(request);

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};

function safelyReadToken(rawSession: string): string | null {
  try {
    const session = JSON.parse(rawSession) as { token?: string };
    return session.token ?? null;
  } catch {
    return null;
  }
}
