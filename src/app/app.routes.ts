import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Agregarperfume } from './pages/Administrador/agregar-perfume/agregarperfume/agregarperfume';
import { Aromas } from './pages/aromas/aromas/aromas';
import { Carrito } from './pages/carrito/carrito';
import { Login } from './pages/Login/login/login';
import { Registrar } from './pages/Registrar/registrar/registrar';
import { PagoExitoso } from './pages/pago-exitoso/pago-exitoso';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
    { path: '', component: Login, canActivate: [noAuthGuard] },
    { path: 'login', redirectTo: '', pathMatch: 'full' },
    { path: 'registrar', component: Registrar, canActivate: [noAuthGuard] },
    { path: 'inicio', component: Inicio, canActivate: [authGuard] },
    { path: 'admin', component: Agregarperfume, canActivate: [authGuard, roleGuard], data: { role: 'admin' } },
    { path: 'carrito', component: Carrito, canActivate: [authGuard, roleGuard], data: { role: 'cliente' } },
    { path: 'fofativas', component: Aromas, canActivate: [authGuard, roleGuard], data: { role: 'cliente' } },
    { path: 'pago-exitoso', component: PagoExitoso, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];


