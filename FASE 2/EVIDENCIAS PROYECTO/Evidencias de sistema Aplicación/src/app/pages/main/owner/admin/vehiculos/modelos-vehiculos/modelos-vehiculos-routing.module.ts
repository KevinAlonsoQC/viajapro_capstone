import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModelosVehiculosPage } from './modelos-vehiculos.page';

const routes: Routes = [
  {
    path: '',
    component: ModelosVehiculosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelosVehiculosPageRoutingModule {}
