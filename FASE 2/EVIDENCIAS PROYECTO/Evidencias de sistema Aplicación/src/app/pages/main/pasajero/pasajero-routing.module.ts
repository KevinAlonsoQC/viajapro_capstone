import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasajeroPage } from './pasajero.page';

const routes: Routes = [
  {
    path: '',
    component: PasajeroPage
  },
  {
    path: 'map/:id',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
  },  {
    path: 'finanzas',
    loadChildren: () => import('./finanzas/finanzas.module').then( m => m.FinanzasPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasajeroPageRoutingModule {}
