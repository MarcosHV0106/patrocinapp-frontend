import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { DeportistaCatalogo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DeportistaService {
  private readonly api = inject(ApiClient);

  listar(busqueda = '', disciplina = '') {
    return this.api.get<DeportistaCatalogo[]>('/deportistas', { busqueda, disciplina });
  }
}
