import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColectivosPage } from './colectivos.page';

const routes: Routes = [
  {
    path: '',
    component: ColectivosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColectivosPageRoutingModule {}
