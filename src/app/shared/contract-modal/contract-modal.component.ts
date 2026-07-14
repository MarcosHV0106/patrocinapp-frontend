import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlantillaService } from '../../core/plantilla.service';
import { CrearContratoRequest, DeportistaCatalogo, PlantillaMeta } from '../../models/api.models';

@Component({
  selector: 'app-contract-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-modal.component.html'
})
export class ContractModalComponent implements OnInit {
  private readonly plantillaService = inject(PlantillaService);

  @Input({ required: true }) deportista!: DeportistaCatalogo;
  @Input({ required: true }) idNegocio!: number;
  @Input() busy = false;
  @Output() close = new EventEmitter<void>();
  @Output() createContract = new EventEmitter<CrearContratoRequest>();

  readonly plantillas = signal<PlantillaMeta[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly confirmation = signal(false);

  selected: Record<number, boolean> = {};
  amounts: Record<number, number> = {};
  comment = 'Contrato estándar de patrocinio sujeto al cumplimiento de los hitos seleccionados.';

  ngOnInit(): void {
    this.plantillaService.listar().subscribe({
      next: (items) => {
        this.plantillas.set(items);
        items.slice(0, 2).forEach((item) => {
          this.selected[item.id] = true;
          this.amounts[item.id] = Number(item.precioSugerido ?? 1000);
        });
        items.slice(2).forEach((item) => {
          this.amounts[item.id] = Number(item.precioSugerido ?? 1000);
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los hitos disponibles.');
        this.loading.set(false);
      }
    });
  }

  athleteImage(_disciplina?: string | null): string {
    return '/deportista.png';
  }

  totalDeportista(): number {
    return this.plantillas()
      .filter((item) => this.selected[item.id])
      .reduce((sum, item) => sum + Number(this.amounts[item.id] || 0), 0);
  }

  totalNegocio(): number {
    return this.totalDeportista() * 1.10;
  }

  totalComision(): number {
    return this.totalNegocio() - this.totalDeportista();
  }

  submit(): void {
    const metas = this.plantillas()
      .filter((item) => this.selected[item.id])
      .map((item) => ({
        idPlantilla: item.id,
        descripcionAcordada: item.descripcionSugerida || item.nombreMeta,
        montoDeportista: Number(this.amounts[item.id] || item.precioSugerido || 0),
        comentarioDeportista: this.comment
      }))
      .filter((item) => item.montoDeportista > 0);

    if (metas.length === 0) {
      this.error.set('Selecciona al menos una meta con monto mayor a cero.');
      return;
    }

    if (!this.confirmation()) {
      this.confirmation.set(true);
      return;
    }

    this.createContract.emit({
      idNegocio: this.idNegocio,
      idDeportista: this.deportista.idUsuario,
      metas
    });
  }
}
