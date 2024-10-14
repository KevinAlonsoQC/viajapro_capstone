import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleCentralPage } from './detalle-central.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleCentralPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleCentralPageRoutingModule {}
