import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Agregarperfume } from './pages/Administrador/agregar-perfume/agregarperfume/agregarperfume';
import { Aromas } from './pages/aromas/aromas/aromas';

export const routes: Routes = [

    {path: '', component: Inicio},
    {path: 'admin', component: Agregarperfume},
    {path: 'fofativas', component: Aromas }
];


