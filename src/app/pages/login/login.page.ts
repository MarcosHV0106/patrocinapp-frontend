import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html'
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Se inicializan como strings vacíos para que TypeScript infiera el tipo correcto
  correo = '';
  password = '';
  
  readonly loading = signal(false);
  readonly error = signal('');

  submit(): void {
    this.error.set('');
    this.loading.set(true);

    // Al ser strings, se puede usar .trim() directamente sin el operador opcional (?.)
    this.auth.login({ 
      correo: this.correo.trim(), 
      password: this.password.trim() 
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo iniciar sesión. Verifica tu correo y contraseña.');
      }
    });
  }
}