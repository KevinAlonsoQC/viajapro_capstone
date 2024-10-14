import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarcasVehiculosPage } from './marcas-vehiculos.page';

const routes: Routes = [
  {
    path: '',
    component: MarcasVehiculosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarcasVehiculosPageRoutingModule {}
