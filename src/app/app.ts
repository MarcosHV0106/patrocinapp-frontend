import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html'
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly session = this.authService.session;
  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  readonly canExplore = computed(() => !this.session() || this.session()?.rol === 'NEGOCIO');

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
