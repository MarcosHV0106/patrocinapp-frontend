import { Injectable, computed, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiClient } from './api-client';
import { LoginRequest, LoginResponse, RegisterDeportistaRequest, RegisterNegocioRequest, RegisterResponse } from '../models/api.models';
import { inject } from '@angular/core';

const SESSION_KEY = 'patrocinapp_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly sessionSignal = signal<LoginResponse | null>(this.restoreSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly token = computed(() => this.sessionSignal()?.token ?? null);

  login(request: LoginRequest) {
    return this.api.post<LoginResponse>('/auth/login', request).pipe(
      tap((session) => this.saveSession(session))
    );
  }

  registerNegocio(request: RegisterNegocioRequest) {
    return this.api.post<RegisterResponse>('/usuarios/negocios', request);
  }

  registerDeportista(request: RegisterDeportistaRequest) {
    return this.api.post<RegisterResponse>('/usuarios/deportistas', request);
  }

  saveSession(session: LoginResponse): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }

  isAuthenticated(): boolean {
    return Boolean(this.sessionSignal()?.token);
  }

  private restoreSession(): LoginResponse | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
