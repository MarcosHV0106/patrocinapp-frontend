import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { AprobarMetaResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MetaService {
  private readonly api = inject(ApiClient);

  registrarEvidencia(idMeta: number, urlEvidencia: string) {
    return this.api.put<void>(`/metas/${idMeta}/evidencia`, { urlEvidencia });
  }

  aprobar(idMeta: number) {
    return this.api.post<AprobarMetaResponse>(`/metas/${idMeta}/aprobar`, {});
  }
}
