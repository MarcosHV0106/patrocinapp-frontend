import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { httpErrorMessage } from '../../core/http-error.util';
import { MetaService } from '../../core/meta.service';
import { MetaContratoDetalle } from '../../models/api.models';

@Component({
  selector: 'app-evidence-review-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './evidence-review-modal.component.html'
})
export class EvidenceReviewModalComponent implements OnInit, OnDestroy {
  private readonly metaService = inject(MetaService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly meta = input.required<MetaContratoDetalle>();
  readonly close = output<void>();
  readonly reviewed = output<'approved' | 'rejected'>();
  readonly evidence = computed(() => this.meta().evidenciaActual
    ?? [...this.meta().evidencias].reverse().find((item) => item.estado === 'EN_REVISION')
    ?? null);
  readonly previewUrl = signal<string | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly rejectionMode = signal(false);
  readonly approvalConfirmation = signal(false);
  readonly safePdfUrl = computed(() => {
    const url = this.previewUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  rejectionReason = '';

  ngOnInit(): void { this.loadPreview(); }

  loadPreview(): void {
    const evidence = this.evidence();
    if (!evidence) return;
    this.metaService.descargar(evidence.idEvidencia).subscribe({
      next: (blob) => {
        this.revokePreview();
        this.previewUrl.set(URL.createObjectURL(blob));
      },
      error: (error) => this.error.set(httpErrorMessage(error, 'No se pudo cargar la vista previa.'))
    });
  }

  approve(): void {
    const evidence = this.evidence();
    if (!evidence || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.metaService.aprobar(evidence.idEvidencia).subscribe({
      next: () => { this.busy.set(false); this.reviewed.emit('approved'); this.requestClose(); },
      error: (error) => { this.busy.set(false); this.error.set(httpErrorMessage(error, 'No se pudo aprobar la evidencia.')); }
    });
  }

  reject(): void {
    const evidence = this.evidence();
    const reason = this.rejectionReason.trim();
    if (!evidence || this.busy()) return;
    if (!reason) {
      this.error.set('Escribe un motivo concreto para que el deportista pueda corregir la evidencia.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.metaService.rechazar(evidence.idEvidencia, reason).subscribe({
      next: () => { this.busy.set(false); this.reviewed.emit('rejected'); this.requestClose(); },
      error: (error) => { this.busy.set(false); this.error.set(httpErrorMessage(error, 'No se pudo rechazar la evidencia.')); }
    });
  }

  download(): void {
    const evidence = this.evidence();
    if (!evidence) return;
    this.metaService.descargar(evidence.idEvidencia).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = evidence.nombreOriginal;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => this.error.set(httpErrorMessage(error, 'No se pudo descargar la evidencia.'))
    });
  }

  previewKind(): 'image' | 'video' | 'pdf' | null {
    const type = this.evidence()?.tipoMime;
    if (!type) return null;
    if (type.startsWith('image/')) return 'image';
    if (type === 'video/mp4') return 'video';
    return type === 'application/pdf' ? 'pdf' : null;
  }

  requestClose(): void {
    if (this.busy()) return;
    this.revokePreview();
    this.close.emit();
  }

  ngOnDestroy(): void { this.revokePreview(); }
  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set(null);
  }
}
