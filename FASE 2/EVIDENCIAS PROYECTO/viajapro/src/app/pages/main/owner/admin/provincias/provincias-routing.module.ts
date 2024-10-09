import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProvinciasPage } from './provincias.page';

const routes: Routes = [
  {
    path: '',
    component: ProvinciasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProvinciasPageRoutingModule {}
