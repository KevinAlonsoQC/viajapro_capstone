import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearVehiculoPage } from './crear-vehiculo.page';

const routes: Routes = [
  {
    path: '',
    component: CrearVehiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearVehiculoPageRoutingModule {}
