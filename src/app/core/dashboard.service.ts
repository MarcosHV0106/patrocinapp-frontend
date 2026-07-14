import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { DashboardResumen, Rol } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  resumen(rol: Rol) {
    const path = rol === 'NEGOCIO' ? '/dashboard/negocio/resumen' : '/dashboard/deportista/resumen';
    return this.api.get<DashboardResumen>(path);
  }
}
