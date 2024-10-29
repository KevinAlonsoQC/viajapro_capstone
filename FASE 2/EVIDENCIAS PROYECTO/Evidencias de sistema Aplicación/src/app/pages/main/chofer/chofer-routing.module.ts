import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoferPage } from './chofer.page';

const routes: Routes = [
  {
    path: '',
    component: ChoferPage
  },
  {
    path: 'en-ruta',
    loadChildren: () => import('./en-ruta/en-ruta.module').then( m => m.EnRutaPageModule)
  },
  {
    path: 'ver-ruta/:id',
    loadChildren: () => import('./ver-ruta/ver-ruta.module').then( m => m.VerRutaPageModule)
  },
  {
    path: 'asientos',
    loadChildren: () => import('./asientos/asientos.module').then( m => m.AsientosPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoferPageRoutingModule {}
