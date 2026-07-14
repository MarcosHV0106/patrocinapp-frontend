import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MetaService } from '../../core/meta.service';
import { MetaContratoDetalle } from '../../models/api.models';
import { EvidenceReviewModalComponent } from './evidence-review-modal.component';

const evidence = {
  idEvidencia: 4, idMetaContrato: 8, numeroIntento: 1, nombreOriginal: 'foto.png', tipoMime: 'image/png',
  tamanioBytes: 8, hashSha256: 'hash', comentarioDeportista: null, estado: 'EN_REVISION' as const,
  motivoRechazo: null, fechaCarga: '2026-07-13T10:00:00', fechaRevision: null, urlArchivo: '/archivo'
};
const meta: MetaContratoDetalle = {
  idMeta: 8, idPlantilla: 1, descripcionAcordada: 'Publicar fotografía', montoDeportista: 100,
  montoNegocio: 110, comentarioDeportista: null, urlEvidencia: null, estado: 'EN_REVISION',
  evidenciaActual: evidence, evidencias: [evidence]
};

describe('EvidenceReviewModalComponent', () => {
  let fixture: ComponentFixture<EvidenceReviewModalComponent>;
  let component: EvidenceReviewModalComponent;
  const service = {
    descargar: vi.fn(() => of(new Blob(['foto'], { type: 'image/png' }))),
    rechazar: vi.fn(() => of({ ...evidence, estado: 'RECHAZADA' })),
    aprobar: vi.fn(() => of({ idEvidencia: 4, idMeta: 8, estadoMeta: 'PAGADA', montoNeto: 100,
      comisionPlataforma: 10, saldoRetenido: 0, estadoContrato: 'FINALIZADO' }))
  };

  beforeEach(async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    await TestBed.configureTestingModule({
      imports: [EvidenceReviewModalComponent], providers: [{ provide: MetaService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(EvidenceReviewModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('meta', meta);
    fixture.detectChanges();
    service.rechazar.mockClear();
    service.aprobar.mockClear();
  });

  it('no permite rechazar sin motivo', () => {
    component.rejectionMode.set(true);
    fixture.detectChanges();
    component.rejectionReason = '   ';
    component.reject();
    expect(service.rechazar).not.toHaveBeenCalled();
    expect(component.error()).toContain('motivo concreto');
  });

  it('rechaza con motivo y comunica el resultado', () => {
    const reviewed = vi.fn();
    component.reviewed.subscribe(reviewed);
    component.rejectionReason = 'El logotipo no se distingue';
    component.reject();
    expect(service.rechazar).toHaveBeenCalledWith(4, 'El logotipo no se distingue');
    expect(reviewed).toHaveBeenCalledWith('rejected');
  });

  it('aprueba la evidencia seleccionada y comunica el pago', () => {
    const reviewed = vi.fn();
    component.reviewed.subscribe(reviewed);
    component.approvalConfirmation.set(true);
    fixture.detectChanges();
    component.approve();
    expect(service.aprobar).toHaveBeenCalledWith(4);
    expect(reviewed).toHaveBeenCalledWith('approved');
  });

  it('descarga con el nombre original y reconoce los tipos de vista previa', () => {
    const anchor = document.createElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => undefined);
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    component.download();
    expect(anchor.download).toBe('foto.png');
    expect(click).toHaveBeenCalledOnce();
    createElement.mockRestore();
    expect(component.previewKind()).toBe('image');

    fixture.componentRef.setInput('meta', { ...meta, evidenciaActual: { ...evidence, tipoMime: 'video/mp4' } });
    expect(component.previewKind()).toBe('video');
    fixture.componentRef.setInput('meta', { ...meta, evidenciaActual: { ...evidence, tipoMime: 'application/pdf' } });
    expect(component.previewKind()).toBe('pdf');
  });

  it('no cierra durante una operación y libera la vista previa al cerrar', () => {
    const closed = vi.fn();
    component.close.subscribe(closed);
    component.busy.set(true);
    component.requestClose();
    expect(closed).not.toHaveBeenCalled();
    component.busy.set(false);
    component.requestClose();
    expect(closed).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
