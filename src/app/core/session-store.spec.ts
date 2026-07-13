import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session-store';
import { LoginResponse } from '../models/api.models';

function token(exp: number): string {
  const payload = btoa(JSON.stringify({ sub: 'demo@patrocinapp.test', exp }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('SessionStore', () => {
  beforeEach(() => localStorage.clear());

  it('conserva una sesión vigente y la elimina al cerrar', () => {
    const store = TestBed.inject(SessionStore);
    const session: LoginResponse = {
      id: 1, correo: 'demo@patrocinapp.test', rol: 'NEGOCIO', nombreMostrar: 'Marca',
      token: token(Math.floor(Date.now() / 1000) + 3600)
    };
    store.save(session);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.session()?.correo).toBe(session.correo);
    store.clear();
    expect(store.session()).toBeNull();
    expect(localStorage.getItem('patrocinapp_session')).toBeNull();
  });

  it('descarta un JWT expirado restaurado desde almacenamiento', () => {
    localStorage.setItem('patrocinapp_session', JSON.stringify({
      id: 1, correo: 'demo@patrocinapp.test', rol: 'NEGOCIO', nombreMostrar: 'Marca',
      token: token(Math.floor(Date.now() / 1000) - 60)
    }));
    TestBed.resetTestingModule();
    const store = TestBed.inject(SessionStore);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.session()).toBeNull();
  });
});
