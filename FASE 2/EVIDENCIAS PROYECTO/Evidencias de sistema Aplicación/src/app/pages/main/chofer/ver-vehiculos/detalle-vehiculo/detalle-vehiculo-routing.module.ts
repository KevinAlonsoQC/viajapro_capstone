import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleVehiculoPage } from './detalle-vehiculo.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleVehiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleVehiculoPageRoutingModule {}
