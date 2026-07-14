import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlantillaService } from '../../core/plantilla.service';
import { ContractModalComponent } from './contract-modal.component';

describe('ContractModalComponent', () => {
  let fixture: ComponentFixture<ContractModalComponent>;
  let component: ContractModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractModalComponent],
      providers: [{ provide: PlantillaService, useValue: { listar: () => of([
        { id: 1, nombreMeta: 'Publicación', descripcionSugerida: 'Publicar foto', tipoEntregable: 'FOTO', precioSugerido: 100 },
        { id: 2, nombreMeta: 'Video', descripcionSugerida: 'Publicar video', tipoEntregable: 'VIDEO', precioSugerido: 200 }
      ]) } }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContractModalComponent);
    component = fixture.componentInstance;
    component.idNegocio = 3;
    component.deportista = { idUsuario: 7, correo: 'atleta@test', nombreCompleto: 'Ana Atleta', dni: '12345678',
      disciplina: 'Atletismo', biografia: 'Atleta regional', montoObjetivo: 300, contratosActivos: 0 };
    fixture.detectChanges();
  });

  it('muestra comisión y exige una segunda confirmación antes de crear', () => {
    const create = vi.fn();
    component.createContract.subscribe(create);
    expect(component.totalDeportista()).toBe(300);
    expect(component.totalComision()).toBeCloseTo(30);
    expect(component.totalNegocio()).toBeCloseTo(330);
    component.submit();
    expect(component.confirmation()).toBe(true);
    expect(create).not.toHaveBeenCalled();
    component.submit();
    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0].metas).toHaveLength(2);
  });

  it('rechaza una propuesta sin metas seleccionadas', () => {
    component.selected = {};
    component.submit();
    expect(component.error()).toContain('al menos una meta');
    expect(component.confirmation()).toBe(false);
  });
});
