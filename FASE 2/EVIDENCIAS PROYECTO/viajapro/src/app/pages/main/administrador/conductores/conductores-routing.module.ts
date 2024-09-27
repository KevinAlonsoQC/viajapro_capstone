import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConductoresPage } from './conductores.page';

const routes: Routes = [
  {
    path: '',
    component: ConductoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConductoresPageRoutingModule {}
