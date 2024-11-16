import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarChoferPage } from './modificar-chofer.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarChoferPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarChoferPageRoutingModule {}
