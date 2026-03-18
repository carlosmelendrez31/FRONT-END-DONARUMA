import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Agregarperfume } from './pages/Administrador/agregar-perfume/agregarperfume/agregarperfume';

export const routes: Routes = [

    {path: '', component: Inicio},
    {path: 'admin', component: Agregarperfume}

];


