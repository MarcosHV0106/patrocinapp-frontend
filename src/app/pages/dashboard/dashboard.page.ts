import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ContratoService } from '../../core/contrato.service';
import { DeportistaService } from '../../core/deportista.service';
import { DashboardService } from '../../core/dashboard.service';
import { NotificacionService } from '../../core/notificacion.service';
import { httpErrorMessage } from '../../core/http-error.util';
import { ContratoDetalle, CrearContratoRequest, DashboardResumen, DeportistaCatalogo, EstadoMeta, EvidenciaDetalle, HistorialContrato, MetaContratoDetalle, Notificacion } from '../../models/api.models';
import { ContractModalComponent } from '../../shared/contract-modal/contract-modal.component';
import { EvidenceUploadModalComponent } from '../../shared/evidence-upload-modal/evidence-upload-modal.component';
import { EvidenceReviewModalComponent } from '../../shared/evidence-review-modal/evidence-review-modal.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule, ContractModalComponent, EvidenceUploadModalComponent, EvidenceReviewModalComponent],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly deportistaService = inject(DeportistaService);
  private readonly contratoService = inject(ContratoService);
  private readonly dashboardService = inject(DashboardService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly session = this.auth.session;
  readonly isPublicMarketplace = signal(false);
  readonly tab = signal<'resumen' | 'explorar' | 'patrocinios'>('resumen');
  readonly deportistas = signal<DeportistaCatalogo[]>([]);
  readonly contratos = signal<ContratoDetalle[]>([]);
  readonly selectedDeportista = signal<DeportistaCatalogo | null>(null);
  readonly selectedEvidenceMeta = signal<MetaContratoDetalle | null>(null);
  readonly selectedApprovalMeta = signal<MetaContratoDetalle | null>(null);
  readonly summary = signal<DashboardResumen | null>(null);
  readonly notifications = signal<Notificacion[]>([]);
  readonly histories = signal<Record<number, HistorialContrato>>({});
  readonly expandedHistory = signal<number | null>(null);
  readonly loadingDeportistas = signal(true);
  readonly loadingContratos = signal(false);
  readonly creatingContract = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  busqueda = '';
  disciplina = 'Todos';

  readonly isNegocio = computed(() => this.session()?.rol === 'NEGOCIO');
  readonly isDeportista = computed(() => this.session()?.rol === 'DEPORTISTA');

  readonly disciplinas = computed(() => {
    const unique = new Set(this.deportistas().map((item) => item.disciplina).filter(Boolean));
    return ['Todos', ...Array.from(unique)];
  });

  readonly allMetas = computed(() => this.contratos().flatMap((contrato) => contrato.metas));
  readonly totalInvertido = computed(() => this.contratos().reduce((sum, contrato) => sum + Number(contrato.montoTotal || 0), 0));
  readonly totalMetas = computed(() => this.allMetas().length);
  readonly metasPagadas = computed(() => this.allMetas().filter((meta) => meta.estado === 'PAGADA').length);
  readonly evidenciasPendientes = computed(() => this.allMetas().filter((meta) => meta.estado === 'EN_REVISION').length);
  readonly metasPendientes = computed(() => this.allMetas().filter((meta) => meta.estado === 'PENDIENTE').length);
  readonly montoPagado = computed(() => this.allMetas()
    .filter((meta) => meta.estado === 'PAGADA')
    .reduce((sum, meta) => sum + Number(this.isNegocio() ? meta.montoNegocio : meta.montoDeportista), 0));
  readonly totalPatrocinados = computed(() => new Set(this.contratos().map((contrato) => contrato.idDeportista)).size);
  readonly totalPatrocinadores = computed(() => new Set(this.contratos().map((contrato) => contrato.idNegocio)).size);
  readonly unreadNotifications = computed(() => this.notifications().filter((item) => !item.leida).length);

  ngOnInit(): void {
    this.isPublicMarketplace.set(Boolean(this.route.snapshot.data['publicMarketplace']));

    if (this.isPublicMarketplace()) {
      if (this.isDeportista()) {
        this.router.navigateByUrl('/dashboard');
        return;
      }
      this.tab.set('explorar');
    }

    if (!this.isDeportista()) {
      this.loadDeportistas();
    } else {
      this.loadingDeportistas.set(false);
    }

    this.loadContratos();
    this.loadSummary();
    this.loadNotifications();
  }

  setTab(tab: 'resumen' | 'explorar' | 'patrocinios'): void {
    if (this.isPublicMarketplace() && tab !== 'explorar' && !this.session()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (tab === 'explorar' && this.isDeportista()) {
      this.tab.set('patrocinios');
      return;
    }

    this.tab.set(tab);
  }

  loadDeportistas(): void {
    if (this.isDeportista()) {
      this.loadingDeportistas.set(false);
      return;
    }

    this.loadingDeportistas.set(true);
    this.error.set('');

    const disciplina = this.disciplina === 'Todos' ? '' : this.disciplina;
    this.deportistaService.listar(this.busqueda, disciplina).subscribe({
      next: (items) => {
        this.deportistas.set(items);
        this.loadingDeportistas.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo de deportistas. Intenta nuevamente en unos momentos.');
        this.loadingDeportistas.set(false);
      }
    });
  }

  loadContratos(): void {
    const session = this.session();
    if (!session) return;

    this.loadingContratos.set(true);
    const source$ = session.rol === 'NEGOCIO'
      ? this.contratoService.listarPorNegocio(session.id)
      : this.contratoService.listarPorDeportista(session.id);

    source$.subscribe({
      next: (items) => {
        this.contratos.set(items);
        this.loadingContratos.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus patrocinios. Intenta nuevamente en unos momentos.');
        this.loadingContratos.set(false);
      }
    });
  }

  propose(deportista: DeportistaCatalogo): void {
    const session = this.session();
    if (!session) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (session.rol !== 'NEGOCIO') {
      this.error.set('Solo una cuenta patrocinadora puede crear propuestas de patrocinio.');
      return;
    }

    this.selectedDeportista.set(deportista);
  }

  createContract(request: CrearContratoRequest): void {
    if (this.creatingContract()) return;
    this.error.set('');
    this.success.set('');
    this.creatingContract.set(true);

    this.contratoService.crear(request).subscribe({
      next: () => {
        this.creatingContract.set(false);
        this.selectedDeportista.set(null);
        this.success.set('Propuesta de patrocinio registrada correctamente.');
        this.tab.set('patrocinios');
        this.loadContratos();
      },
      error: (err) => {
        this.creatingContract.set(false);
        this.error.set(httpErrorMessage(err, 'No se pudo registrar la propuesta de patrocinio.'));
      }
    });
  }

  openEvidenceModal(meta: MetaContratoDetalle): void {
    this.selectedEvidenceMeta.set(meta);
  }

  closeEvidenceModal(): void {
    this.selectedEvidenceMeta.set(null);
  }

  onEvidenceUploaded(_evidence: EvidenciaDetalle): void {
    this.success.set('Evidencia enviada correctamente. El patrocinador ya puede revisarla.');
    this.closeEvidenceModal();
    this.refreshDashboard();
  }

  openApprovalModal(meta: MetaContratoDetalle): void {
    this.selectedApprovalMeta.set(meta);
  }

  closeApprovalModal(): void {
    this.selectedApprovalMeta.set(null);
  }

  onEvidenceReviewed(result: 'approved' | 'rejected'): void {
    this.success.set(result === 'approved'
      ? 'Evidencia aprobada y pago liberado correctamente.'
      : 'Evidencia rechazada. El motivo quedó disponible para el deportista.');
    this.closeApprovalModal();
    this.refreshDashboard();
  }

  loadSummary(): void {
    const role = this.session()?.rol;
    if (!role) return;
    this.dashboardService.resumen(role).subscribe({
      next: (summary) => this.summary.set(summary),
      error: (error) => this.error.set(httpErrorMessage(error, 'No se pudo cargar el resumen financiero.'))
    });
  }

  loadNotifications(): void {
    if (!this.session()) return;
    this.notificacionService.listar().subscribe({
      next: (items) => this.notifications.set(items),
      error: (error) => this.error.set(httpErrorMessage(error, 'No se pudieron cargar las notificaciones.'))
    });
  }

  markNotificationRead(notification: Notificacion): void {
    if (notification.leida) return;
    this.notificacionService.marcarLeida(notification.id).subscribe({
      next: (updated) => this.notifications.update((items) => items.map((item) => item.id === updated.id ? updated : item)),
      error: (error) => this.error.set(httpErrorMessage(error, 'No se pudo actualizar la notificación.'))
    });
  }

  toggleHistory(contrato: ContratoDetalle): void {
    if (this.expandedHistory() === contrato.idContrato) {
      this.expandedHistory.set(null);
      return;
    }
    this.expandedHistory.set(contrato.idContrato);
    if (this.histories()[contrato.idContrato]) return;
    this.contratoService.historial(contrato.idContrato).subscribe({
      next: (history) => this.histories.update((items) => ({ ...items, [contrato.idContrato]: history })),
      error: (error) => this.error.set(httpErrorMessage(error, 'No se pudo cargar el historial del contrato.'))
    });
  }

  private refreshDashboard(): void {
    this.loadContratos();
    this.loadSummary();
    this.loadNotifications();
    this.histories.set({});
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  sessionRoleLabel(): string {
    if (this.isDeportista()) return 'Deportista patrocinado';
    return 'Cuenta patrocinadora';
  }

  sidebarPatrociniosLabel(): string {
    return this.isDeportista() ? 'Mis Patrocinadores' : 'Mis Patrocinados';
  }

  resumenTitle(): string {
    return this.isDeportista() ? 'Panel del Deportista' : 'Panel del Patrocinador';
  }

  resumenSubtitle(): string {
    return this.isDeportista()
      ? 'Seguimiento de patrocinadores, evidencias y pagos liberados.'
      : 'Seguimiento de deportistas patrocinados, evidencias y pagos realizados.';
  }

  patrociniosTitle(): string {
    return this.isDeportista() ? 'Mis Patrocinadores' : 'Mis Patrocinados';
  }

  patrociniosSubtitle(): string {
    return this.isDeportista()
      ? 'Gestiona tus evidencias y revisa el estado de pago de cada hito.'
      : 'Administra contratos, valida evidencias y libera pagos por cumplimiento.';
  }

  emptyTitle(): string {
    return this.isDeportista()
      ? 'Aún no tienes patrocinadores asignados.'
      : 'Aún no has patrocinado a ningún deportista.';
  }

  emptyMessage(): string {
    return this.isDeportista()
      ? 'Cuando una marca cree un contrato contigo, aparecerá en este panel.'
      : 'Explora el catálogo y selecciona un deportista para crear tu primer contrato.';
  }

  athleteImage(_disciplina?: string | null, _index = 0): string {
    return '/deportista.png';
  }

  counterpartName(contrato: ContratoDetalle): string {
    return this.isDeportista()
      ? contrato.razonSocialNegocio
      : contrato.nombreDeportista;
  }

  counterpartSubtitle(contrato: ContratoDetalle): string {
    return this.isDeportista()
      ? 'Patrocinador'
      : contrato.disciplinaDeportista || 'Disciplina deportiva';
  }

  counterpartInitials(contrato: ContratoDetalle): string {
    return this.counterpartName(contrato)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || 'PA';
  }

  contratoProgress(contrato: ContratoDetalle): number {
    const total = contrato.metas.length;
    if (total === 0) return 0;
    const completed = contrato.metas.filter((meta) => meta.estado === 'PAGADA').length;
    return Math.round((completed / total) * 100);
  }

  contratoStatusLabel(contrato: ContratoDetalle): string {
    if (contrato.metas.length === 0) return contrato.estado;
    if (contrato.metas.every((meta) => meta.estado === 'PAGADA')) return 'Pagado';
    if (contrato.metas.some((meta) => meta.estado === 'PAGADA')) return 'Pago parcial';
    if (contrato.metas.some((meta) => meta.estado === 'EN_REVISION')) return 'Por validar';
    return 'Pendiente';
  }

  contratoStatusClass(contrato: ContratoDetalle): string {
    const label = this.contratoStatusLabel(contrato);
    if (label === 'Pagado' || label === 'Pago parcial') return 'status-paid';
    if (label === 'Por validar') return 'status-review';
    return 'status-pending-soft';
  }

  metaStatusClass(status: EstadoMeta): string {
    if (status === 'PAGADA') return 'status-paid';
    if (status === 'EN_REVISION') return 'status-review';
    if (status === 'APROBADA') return 'status-active';
    if (status === 'RECHAZADA') return 'status-pending';
    return 'status-pending-soft';
  }

  metaStatusLabel(status: EstadoMeta): string {
    if (status === 'PAGADA') return 'Pagado';
    if (status === 'EN_REVISION') return 'Por validar';
    if (status === 'APROBADA') return 'Aprobado';
    if (status === 'RECHAZADA') return 'Rechazado';
    return 'Pendiente';
  }
}
