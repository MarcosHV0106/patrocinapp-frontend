import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { ApiClient } from './api-client';
import { LoginRequest, LoginResponse, RegisterDeportistaRequest, RegisterNegocioRequest, RegisterResponse } from '../models/api.models';
import { inject } from '@angular/core';
import { SessionStore } from './session-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly store = inject(SessionStore);

  readonly session = this.store.session;
  readonly token = this.store.token;

  login(request: LoginRequest) {
    return this.api.post<LoginResponse>('/auth/login', request).pipe(
      tap((session) => this.store.save(session))
    );
  }

  registerNegocio(request: RegisterNegocioRequest) {
    return this.api.post<RegisterResponse>('/usuarios/negocios', request);
  }

  registerDeportista(request: RegisterDeportistaRequest) {
    return this.api.post<RegisterResponse>('/usuarios/deportistas', request);
  }

  saveSession(session: LoginResponse): void {
    this.store.save(session);
  }

  logout(): void {
    this.store.clear();
  }

  isAuthenticated(): boolean {
    return this.store.isAuthenticated();
  }
}
