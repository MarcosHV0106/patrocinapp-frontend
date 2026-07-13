import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { HttpEventType } from '@angular/common/http';
import { filter, map, scan } from 'rxjs';
import { AprobarEvidenciaResponse, EvidenciaDetalle } from '../models/api.models';

export interface UploadState {
  progress: number;
  evidence: EvidenciaDetalle | null;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class MetaService {
  private readonly api = inject(ApiClient);

  enviarEvidencia(idMeta: number, archivo: File, comentario: string) {
    const body = new FormData();
    body.append('archivo', archivo, archivo.name);
    if (comentario.trim()) body.append('comentario', comentario.trim());
    return this.api.upload<EvidenciaDetalle>(`/metas/${idMeta}/evidencias`, body).pipe(
      filter((event) => event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response),
      map((event): UploadState => {
        if (event.type === HttpEventType.Response) {
          return { progress: 100, evidence: event.body?.data ?? null, completed: true };
        }
        const total = event.total || archivo.size;
        return { progress: total ? Math.round((event.loaded / total) * 100) : 0, evidence: null, completed: false };
      }),
      scan<UploadState, UploadState>((state, current) => ({ ...state, ...current }),
        { progress: 0, evidence: null, completed: false })
    );
  }

  listarEvidencias(idMeta: number) { return this.api.get<EvidenciaDetalle[]>(`/metas/${idMeta}/evidencias`); }
  aprobar(idEvidencia: number) { return this.api.post<AprobarEvidenciaResponse>(`/evidencias/${idEvidencia}/aprobar`, {}); }
  rechazar(idEvidencia: number, motivo: string) { return this.api.post<EvidenciaDetalle>(`/evidencias/${idEvidencia}/rechazar`, { motivo }); }
  descargar(idEvidencia: number) { return this.api.download(`/evidencias/${idEvidencia}/archivo`); }
}
