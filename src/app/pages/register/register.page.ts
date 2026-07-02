import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Rol } from '../../models/api.models';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.page.html'
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  role: 'negocio' | 'deportista' = 'negocio';
  razonSocial = '';
  ruc = '';
  nombreCompleto = '';
  dni = '';
  disciplina = '';
  biografia = '';
  correo = '';
  password = '';

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  setRole(role: 'negocio' | 'deportista'): void {
    this.role = role;
    this.error.set('');
    this.success.set('');
  }

  submit(): void {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    const request$ = this.role === 'negocio'
      ? this.auth.registerNegocio({
          razonSocial: this.razonSocial.trim(),
          ruc: this.ruc.trim(),
          correo: this.correo.trim(),
          password: this.password
        })
      : this.auth.registerDeportista({
          nombreCompleto: this.nombreCompleto.trim(),
          correo: this.correo.trim(),
          password: this.password,
          dni: this.dni.trim(),
          disciplina: this.disciplina.trim(),
          biografia: this.biografia.trim()
        });

    request$.subscribe({
      next: (response) => this.afterRegister(response.rol),
      error: (err) => {
        this.loading.set(false);
        const validation = err?.error && typeof err.error === 'object' ? Object.values(err.error).join(' ') : '';
        this.error.set(validation || err?.error?.message || 'No se pudo registrar. Revisa los datos ingresados.');
      }
    });
  }

  private afterRegister(_rol: Rol): void {
    this.success.set('Cuenta creada correctamente. Inicia sesión con el correo y contraseña registrados.');
    this.loading.set(false);
    setTimeout(() => this.router.navigateByUrl('/login'), 900);
  }
}
