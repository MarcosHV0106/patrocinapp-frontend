import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CameraService } from '../../core/camera.service';
import { MetaService } from '../../core/meta.service';
import { MetaContratoDetalle } from '../../models/api.models';
import { EvidenceUploadModalComponent } from './evidence-upload-modal.component';

const meta: MetaContratoDetalle = {
  idMeta: 8, idPlantilla: 1, descripcionAcordada: 'Publicar fotografía', montoDeportista: 100,
  montoNegocio: 110, comentarioDeportista: null, urlEvidencia: null, estado: 'PENDIENTE',
  evidenciaActual: null, evidencias: []
};

describe('EvidenceUploadModalComponent', () => {
  let fixture: ComponentFixture<EvidenceUploadModalComponent>;
  let component: EvidenceUploadModalComponent;
  const evidence = {
    idEvidencia: 4, idMetaContrato: 8, numeroIntento: 1, nombreOriginal: 'foto.png', tipoMime: 'image/png',
    tamanioBytes: 8, hashSha256: 'hash', comentarioDeportista: null, estado: 'EN_REVISION' as const,
    motivoRechazo: null, fechaCarga: '2026-07-13T10:00:00', fechaRevision: null, urlArchivo: '/archivo'
  };
  const metaService = { enviarEvidencia: vi.fn(() => of({ progress: 100, evidence, completed: true })) };

  beforeEach(async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    await TestBed.configureTestingModule({
      imports: [EvidenceUploadModalComponent],
      providers: [
        { provide: MetaService, useValue: metaService },
        { provide: CameraService, useValue: { isSupported: () => false, stop: vi.fn() } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(EvidenceUploadModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('meta', meta);
    fixture.detectChanges();
    metaService.enviarEvidencia.mockClear();
  });

  it('rechaza formato no permitido antes de llamar al backend', () => {
    const file = new File(['texto'], 'prueba.txt', { type: 'text/plain' });
    component.onFileSelected({ target: { files: [file], value: 'x' } } as unknown as Event);
    expect(component.error()).toContain('Formato no permitido');
    expect(component.selectedFile()).toBeNull();
    fixture.detectChanges();
  });

  it('valida archivo vacío, tamaño máximo y ausencia de selección', () => {
    component.submit();
    expect(component.error()).toContain('Selecciona o captura');
    const empty = new File([], 'vacio.png', { type: 'image/png' });
    component.onFileSelected({ target: { files: [empty], value: 'x' } } as unknown as Event);
    expect(component.error()).toContain('vacío');
    const oversized = new File(['x'], 'grande.mp4', { type: 'video/mp4' });
    Object.defineProperty(oversized, 'size', { value: 11 * 1024 * 1024 });
    component.onFileSelected({ target: { files: [oversized], value: 'x' } } as unknown as Event);
    expect(component.error()).toContain('10 MB');
  });

  it('envía un archivo válido una sola vez y emite la evidencia creada', () => {
    const uploaded = vi.fn();
    component.uploaded.subscribe(uploaded);
    const file = new File([new Uint8Array([1, 2, 3])], 'foto.png', { type: 'image/png' });
    component.onFileSelected({ target: { files: [file], value: 'x' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.previewKind()).toBe('image');
    expect(component.formatBytes(file.size)).toContain('KB');
    component.comment = 'Entrega corregida';
    component.submit();
    expect(metaService.enviarEvidencia).toHaveBeenCalledWith(8, file, 'Entrega corregida');
    expect(uploaded).toHaveBeenCalledWith(evidence);
  });

  it('previsualiza PDF y video, permite quitar el archivo y usa el fallback móvil de cámara', async () => {
    const pdf = new File(['pdf'], 'prueba.pdf', { type: 'application/pdf' });
    component.onFileSelected({ target: { files: [pdf], value: 'x' } } as unknown as Event);
    expect(component.previewKind()).toBe('pdf');
    fixture.detectChanges();
    const video = new File(['video'], 'prueba.mp4', { type: 'video/mp4' });
    Object.defineProperty(video, 'size', { value: 2 * 1024 * 1024 });
    component.onFileSelected({ target: { files: [video], value: 'x' } } as unknown as Event);
    expect(component.previewKind()).toBe('video');
    expect(component.formatBytes(video.size)).toBe('2.0 MB');
    component.removeFile();
    expect(component.selectedFile()).toBeNull();
    const click = vi.spyOn(component.captureInput!.nativeElement, 'click');
    await component.useCamera();
    expect(click).toHaveBeenCalledOnce();
    component.ngOnDestroy();
  });
});
