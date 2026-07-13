import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { ContratoDetalle, CrearContratoRequest, CrearContratoResponse, HistorialContrato } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ContratoService {
  private readonly api = inject(ApiClient);

  crear(request: CrearContratoRequest) {
    return this.api.post<CrearContratoResponse>('/contratos', request);
  }

  listarPorNegocio(idNegocio: number) {
    return this.api.get<ContratoDetalle[]>(`/contratos/negocio/${idNegocio}`);
  }

  listarPorDeportista(idDeportista: number) {
    return this.api.get<ContratoDetalle[]>(`/contratos/deportista/${idDeportista}`);
  }

  historial(idContrato: number) {
    return this.api.get<HistorialContrato>(`/contratos/${idContrato}/historial`);
  }
}
