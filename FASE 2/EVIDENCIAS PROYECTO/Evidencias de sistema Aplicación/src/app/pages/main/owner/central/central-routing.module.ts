import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CentralPage } from './central.page';

const routes: Routes = [
  {
    path: '',
    component: CentralPage
  },  {
    path: 'centrales',
    loadChildren: () => import('./centrales/centrales.module').then( m => m.CentralesPageModule)
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
export class CentralPageRoutingModule {}
