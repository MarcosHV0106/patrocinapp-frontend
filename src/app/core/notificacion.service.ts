import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { Notificacion } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly api = inject(ApiClient);

  listar() { return this.api.get<Notificacion[]>('/notificaciones'); }
  marcarLeida(id: number) { return this.api.patch<Notificacion>(`/notificaciones/${id}/leida`, {}); }
}
