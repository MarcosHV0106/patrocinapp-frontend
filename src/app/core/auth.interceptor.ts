import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionStore } from './session-store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(SessionStore);
  const router = inject(Router);
  const token = store.token();

  const authorizedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorizedRequest).pipe(catchError((error) => {
    if (error?.status === 401 && !request.url.endsWith('/auth/login')) {
      store.clear();
      void router.navigate(['/login'], { queryParams: { sessionExpired: '1' } });
    }
    return throwError(() => error);
  }));
};
