import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarConductorPage } from './modificar-conductor.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarConductorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarConductorPageRoutingModule {}
