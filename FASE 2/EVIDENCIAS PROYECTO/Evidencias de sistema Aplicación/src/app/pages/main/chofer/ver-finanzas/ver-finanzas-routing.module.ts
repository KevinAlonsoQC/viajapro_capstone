import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerFinanzasPage } from './ver-finanzas.page';

const routes: Routes = [
  {
    path: '',
    component: VerFinanzasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerFinanzasPageRoutingModule {}
