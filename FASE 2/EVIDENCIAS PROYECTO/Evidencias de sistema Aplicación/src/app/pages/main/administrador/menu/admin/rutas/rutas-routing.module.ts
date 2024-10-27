import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RutasPage } from './rutas.page';
import { MapPasajeroComponent } from 'src/app/maps/component/map-pasajero/map-pasajero.component';

const routes: Routes = [
  {
    path: '',
    component: RutasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],

})
export class RutasPageRoutingModule {}
