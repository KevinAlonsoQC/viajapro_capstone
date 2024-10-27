import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasajeroRutasPage } from './pasajero-rutas.page';

const routes: Routes = [
  {
    path: '',
    component: PasajeroRutasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasajeroRutasPageRoutingModule {}
