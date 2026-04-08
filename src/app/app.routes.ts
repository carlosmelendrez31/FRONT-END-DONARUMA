import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Agregarperfume } from './pages/Administrador/agregar-perfume/agregarperfume/agregarperfume';
import { Aromas } from './pages/aromas/aromas/aromas';
import { Ofertas } from './pages/oferta/oferta';
import { AgregarDescuentoComponent } from './pages/Administrador/agregar-descuento/agregardescuento/agregardescuento';

export const routes: Routes = [

    {path: '', component: Inicio},
    {path: 'admin', component: Agregarperfume},
    {path: 'fofativas', component: Aromas },
    {path: 'ofertas', component: Ofertas},
    {path: 'admin/venta-privada', component: AgregarDescuentoComponent}
];


