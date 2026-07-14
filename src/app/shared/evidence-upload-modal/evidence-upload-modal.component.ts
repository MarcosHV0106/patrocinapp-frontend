import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CameraService } from '../../core/camera.service';
import { httpErrorMessage } from '../../core/http-error.util';
import { MetaService } from '../../core/meta.service';
import { EvidenciaDetalle, MetaContratoDetalle } from '../../models/api.models';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']);

@Component({
  selector: 'app-evidence-upload-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './evidence-upload-modal.component.html'
})
export class EvidenceUploadModalComponent implements OnDestroy {
  private readonly metaService = inject(MetaService);
  private readonly camera = inject(CameraService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly meta = input.required<MetaContratoDetalle>();
  readonly close = output<void>();
  readonly uploaded = output<EvidenciaDetalle>();
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly error = signal('');
  readonly progress = signal(0);
  readonly sending = signal(false);
  readonly cameraActive = signal(false);
  readonly cameraSupported = this.camera.isSupported();
  readonly safePdfUrl = computed(() => {
    const url = this.previewUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  @ViewChild('cameraVideo', { static: true }) cameraVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput', { static: true }) fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('captureInput', { static: true }) captureInput?: ElementRef<HTMLInputElement>;

  comment = '';
  private stream: MediaStream | null = null;

  chooseFile(): void { this.fileInput?.nativeElement.click(); }

  async useCamera(): Promise<void> {
    this.error.set('');
    if (!this.cameraSupported) {
      this.captureInput?.nativeElement.click();
      return;
    }
    try {
      this.cameraActive.set(true);
      this.stream = await this.camera.start(this.cameraVideo!.nativeElement);
    } catch (error) {
      this.cameraActive.set(false);
      this.error.set(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Se denegó el permiso de cámara. Puedes seleccionar un archivo como alternativa.'
        : 'No se pudo iniciar la cámara. Selecciona un archivo desde tu dispositivo.');
    }
  }

  async takePhoto(): Promise<void> {
    try {
      this.setFile(await this.camera.capture(this.cameraVideo!.nativeElement));
      this.stopCamera();
    } catch {
      this.error.set('La cámara aún no está lista para tomar la fotografía.');
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (file) this.setFile(file);
    inputElement.value = '';
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.revokePreview();
    this.progress.set(0);
  }

  submit(): void {
    const file = this.selectedFile();
    if (!file || this.sending()) {
      this.error.set('Selecciona o captura una evidencia antes de enviarla.');
      return;
    }
    this.error.set('');
    this.sending.set(true);
    this.metaService.enviarEvidencia(this.meta().idMeta, file, this.comment).subscribe({
      next: (state) => {
        this.progress.set(state.progress);
        if (state.completed && state.evidence) {
          this.sending.set(false);
          this.uploaded.emit(state.evidence);
          this.requestClose();
        }
      },
      error: (error) => {
        this.sending.set(false);
        this.error.set(httpErrorMessage(error, 'No se pudo enviar la evidencia. Intenta nuevamente.'));
      }
    });
  }

  previewKind(): 'image' | 'video' | 'pdf' | null {
    const type = this.selectedFile()?.type;
    if (!type) return null;
    if (type.startsWith('image/')) return 'image';
    if (type === 'video/mp4') return 'video';
    return type === 'application/pdf' ? 'pdf' : null;
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  requestClose(): void {
    if (this.sending()) return;
    this.cleanup();
    this.close.emit();
  }

  ngOnDestroy(): void { this.cleanup(); }

  private setFile(file: File): void {
    this.error.set('');
    if (!file.size) return this.error.set('El archivo seleccionado está vacío.');
    if (file.size > MAX_BYTES) return this.error.set('El archivo supera el máximo de 10 MB.');
    if (!ALLOWED_TYPES.has(file.type)) {
      return this.error.set('Formato no permitido. Usa JPEG, PNG, WebP, PDF o MP4.');
    }
    this.revokePreview();
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
    this.progress.set(0);
  }

  private stopCamera(): void {
    this.camera.stop(this.stream, this.cameraVideo?.nativeElement);
    this.stream = null;
    this.cameraActive.set(false);
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set(null);
  }

  private cleanup(): void {
    this.stopCamera();
    this.revokePreview();
  }
}
