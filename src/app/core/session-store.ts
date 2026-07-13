import { Injectable, computed, signal } from '@angular/core';
import { LoginResponse } from '../models/api.models';

const SESSION_KEY = 'patrocinapp_session';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly sessionSignal = signal<LoginResponse | null>(this.restore());
  readonly session = this.sessionSignal.asReadonly();
  readonly token = computed(() => this.sessionSignal()?.token ?? null);

  save(session: LoginResponse): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }

  isAuthenticated(): boolean {
    const token = this.token();
    if (!token || this.isExpired(token)) {
      if (token) this.clear();
      return false;
    }
    return true;
  }

  private restore(): LoginResponse | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as LoginResponse;
      if (!session?.token || this.isExpired(session.token)) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  private isExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) return true;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const claims = JSON.parse(atob(normalized)) as { exp?: number };
      return !claims.exp || claims.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
