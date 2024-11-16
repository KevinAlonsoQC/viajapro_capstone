import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasajerosPage } from './pasajeros.page';

const routes: Routes = [
  {
    path: '',
    component: PasajerosPage
  },  {
    path: 'presidentes',
    loadChildren: () => import('./presidentes/presidentes.module').then( m => m.PresidentesPageModule)
  },
  {
    path: 'choferes',
    loadChildren: () => import('./choferes/choferes.module').then( m => m.ChoferesPageModule)
  },
  {
    path: 'pasajeros',
    loadChildren: () => import('./pasajeros/pasajeros.module').then( m => m.PasajerosPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasajerosPageRoutingModule {}
