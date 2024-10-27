import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasajeroPage } from './pasajero.page';

const routes: Routes = [
  {
    path: '',
    component: PasajeroPage
  },
  {
    path: 'pasajero-rutas',
    loadChildren: () => import('./pasajero-rutas/pasajero-rutas.module').then( m => m.PasajeroRutasPageModule)
  },
  {
    path: 'map/:id',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasajeroPageRoutingModule {}
