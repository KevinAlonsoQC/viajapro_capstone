import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsientosPage } from './asientos.page';

const routes: Routes = [
  {
    path: '',
    component: AsientosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsientosPageRoutingModule {}
