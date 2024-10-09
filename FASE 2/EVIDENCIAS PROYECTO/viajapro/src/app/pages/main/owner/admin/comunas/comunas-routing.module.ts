import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComunasPage } from './comunas.page';

const routes: Routes = [
  {
    path: '',
    component: ComunasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComunasPageRoutingModule {}
