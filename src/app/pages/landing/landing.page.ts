import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeportistaService } from '../../core/deportista.service';
import { DeportistaCatalogo } from '../../models/api.models';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.page.html'
})
export class LandingPage implements OnInit {
  private readonly deportistaService = inject(DeportistaService);

  readonly featured = signal<DeportistaCatalogo[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  roiInvestment = 10000;

  ngOnInit(): void {
    this.deportistaService.listar().subscribe({
      next: (deportistas) => {
        this.featured.set(deportistas.slice(0, 3));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los deportistas destacados. Intenta nuevamente en unos momentos.');
        this.loading.set(false);
      }
    });
  }

  athleteImage(_disciplina?: string | null, _index = 0): string {
    return '/deportista.png';
  }

  progressFor(index: number): number {
    return [42, 68, 25][index % 3];
  }

  get estimatedImpressions(): number {
    return this.roiInvestment * 12;
  }

  get estimatedImpressionsLabel(): string {
    const value = this.estimatedImpressions;
    return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${Math.round(value / 1000)}K`;
  }

  get mediaValue(): number {
    return Math.round(this.roiInvestment * 1.85);
  }

  get followers(): number {
    return Math.round(this.roiInvestment * 0.45);
  }

  get followersLabel(): string {
    return this.followers >= 1000 ? `${(this.followers / 1000).toFixed(1)}K` : `${this.followers}`;
  }

  get engagement(): string {
    return (8.2 - (this.roiInvestment / 100000) * 1.8).toFixed(1);
  }
}
