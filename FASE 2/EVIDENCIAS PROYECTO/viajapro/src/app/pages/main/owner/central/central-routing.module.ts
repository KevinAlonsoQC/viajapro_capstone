import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CentralPage } from './central.page';

const routes: Routes = [
  {
    path: '',
    component: CentralPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CentralPageRoutingModule {}
