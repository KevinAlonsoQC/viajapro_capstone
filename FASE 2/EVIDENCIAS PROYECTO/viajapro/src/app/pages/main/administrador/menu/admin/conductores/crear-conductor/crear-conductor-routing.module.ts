import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearConductorPage } from './crear-conductor.page';

const routes: Routes = [
  {
    path: '',
    component: CrearConductorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearConductorPageRoutingModule {}
