import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearChoferPage } from './crear-chofer.page';

const routes: Routes = [
  {
    path: '',
    component: CrearChoferPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearChoferPageRoutingModule {}
