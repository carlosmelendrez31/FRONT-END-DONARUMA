import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Agregarperfume } from './pages/Administrador/agregar-perfume/agregarperfume/agregarperfume';
import { AdminNovedadesComponent } from './pages/Administrador/admin-novedades/admin-novedades';
import { Aromas } from './pages/aromas/aromas/aromas';
import { Carrito } from './pages/carrito/carrito';
import { Login } from './pages/Login/login/login';
import { Registrar } from './pages/Registrar/registrar/registrar';
import { NovedadesDetalle } from './pages/novedades-detalle/novedades-detalle';
import { Ofertas } from './pages/oferta/oferta';
import { AgregarDescuentoComponent } from './pages/Administrador/agregar-descuento/agregardescuento/agregardescuento';
import { VerificarComponent } from './pages/verificar/verificar';
import { PerfilComponent } from './pages/perfil/perfil';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { NovedadesComponent } from './pages/novedades/novedades';
import { PagoExitosoComponent } from './pages/pago-exitoso/pago-exitoso';
import { VerificarCodigoComponent } from './pages/verificar-codigo/verificar-codigo';
import { LogsComponent } from './pages/Administrador/logs/logs';

export const routes: Routes = [
    { path: '', component: Login, canActivate: [noAuthGuard] },
    { path: 'login', redirectTo: '', pathMatch: 'full' },
    { path: 'registrar', component: Registrar, canActivate: [noAuthGuard] },
    { path: 'verificar-codigo', component: VerificarCodigoComponent, canActivate: [noAuthGuard] },
    { path: 'inicio', component: Inicio, canActivate: [authGuard] },
    { path: 'admin', component: Agregarperfume, canActivate: [authGuard], data: { role: 'admin' } },
    { path: 'novedades', component: NovedadesComponent, canActivate: [authGuard] },
    { path: 'novedades/:id', component: NovedadesDetalle, canActivate: [authGuard, roleGuard], data: { role: 'cliente' }},
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard, roleGuard], data: { role: 'cliente' }},
     { path: 'pago-exitoso', component: PagoExitosoComponent, canActivate: [authGuard, roleGuard], data: { role: 'cliente' } },
    
   { path: 'admin-novedades', component: AdminNovedadesComponent, canActivate: [authGuard, roleGuard], data: { role: 'admin' } },
    { path: 'carrito', component: Carrito, canActivate: [authGuard, roleGuard], data: { role: 'cliente' } },
    { path: 'fofativas', component: Aromas, canActivate: [authGuard, roleGuard], data: { role: 'cliente' } },
    {path: 'ofertas', component: Ofertas, canActivate: [authGuard, roleGuard], data: { role: 'cliente' }},

    {path: 'admin/venta-privada', component: AgregarDescuentoComponent, canActivate: [authGuard, roleGuard], data: { role: 'admin' }},
    { path: 'admin/logs', component: LogsComponent, canActivate: [authGuard, roleGuard], data: { role: 'admin' } },
    { path: 'verificar', component: VerificarComponent },
    { path: '**', redirectTo: '' }

];

//prueba1
