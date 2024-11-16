import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarPresidentePage } from './modificar-presidente.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarPresidentePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarPresidentePageRoutingModule {}
