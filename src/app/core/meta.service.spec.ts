import { HttpEventType } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MetaService } from './meta.service';
import { EvidenciaDetalle } from '../models/api.models';

describe('MetaService', () => {
  let service: MetaService;
  let http: HttpTestingController;
  const evidence: EvidenciaDetalle = {
    idEvidencia: 4, idMetaContrato: 8, numeroIntento: 1, nombreOriginal: 'evidencia.png',
    tipoMime: 'image/png', tamanioBytes: 20, hashSha256: 'hash', comentarioDeportista: 'entrega',
    estado: 'EN_REVISION', motivoRechazo: null, fechaCarga: '2026-07-13T10:00:00',
    fechaRevision: null, urlArchivo: '/api/evidencias/4/archivo'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MetaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía multipart y publica progreso hasta completar', () => {
    const states: number[] = [];
    const file = new File([new Uint8Array([1, 2, 3])], 'evidencia.png', { type: 'image/png' });
    service.enviarEvidencia(8, file, 'entrega').subscribe((state) => states.push(state.progress));

    const request = http.expectOne('http://localhost:8080/api/metas/8/evidencias');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    const multipartFile = (request.request.body as FormData).get('archivo') as File;
    expect(multipartFile.name).toBe('evidencia.png');
    expect(multipartFile.type).toBe('image/png');
    request.event({ type: HttpEventType.UploadProgress, loaded: 1, total: 2 });
    request.flush({ success: true, message: 'ok', data: evidence }, { status: 201, statusText: 'Created' });

    expect(states).toEqual([50, 100]);
  });

  it('usa los endpoints físicos para aprobar y rechazar', () => {
    service.aprobar(4).subscribe();
    const approval = http.expectOne('http://localhost:8080/api/evidencias/4/aprobar');
    expect(approval.request.method).toBe('POST');
    approval.flush({ success: true, message: 'ok', data: {
      idEvidencia: 4, idMeta: 8, estadoMeta: 'PAGADA', montoNeto: 100,
      comisionPlataforma: 10, saldoRetenido: 0, estadoContrato: 'FINALIZADO'
    }});

    service.rechazar(5, 'No se ve el logotipo').subscribe();
    const rejection = http.expectOne('http://localhost:8080/api/evidencias/5/rechazar');
    expect(rejection.request.body).toEqual({ motivo: 'No se ve el logotipo' });
    rejection.flush({ success: true, message: 'ok', data: { ...evidence, idEvidencia: 5, estado: 'RECHAZADA' } });
  });

  it('descarga el binario como blob autenticable por interceptor', () => {
    let received: Blob | undefined;
    service.descargar(4).subscribe((blob) => received = blob);
    const request = http.expectOne('http://localhost:8080/api/evidencias/4/archivo');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['archivo'], { type: 'image/png' }));
    expect(received?.type).toBe('image/png');
  });

  it('lista el historial de intentos de una meta', () => {
    service.listarEvidencias(8).subscribe((items) => expect(items).toEqual([evidence]));
    const request = http.expectOne('http://localhost:8080/api/metas/8/evidencias');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'ok', data: [evidence] });
  });
});
