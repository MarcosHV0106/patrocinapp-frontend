import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { PlantillaMeta } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PlantillaService {
  private readonly api = inject(ApiClient);

  listar() {
    return this.api.get<PlantillaMeta[]>('/plantillas');
  }
}
