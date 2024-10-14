import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarVehiculoPage } from './modificar-vehiculo.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarVehiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarVehiculoPageRoutingModule {}
