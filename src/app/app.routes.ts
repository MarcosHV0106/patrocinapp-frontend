import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing/landing.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingPage },
  { path: 'marketplace', component: DashboardPage, data: { publicMarketplace: true } },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegisterPage },
  { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
