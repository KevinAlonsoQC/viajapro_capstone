import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerRutasPage } from './ver-rutas.page';

const routes: Routes = [
  {
    path: '',
    component: VerRutasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerRutasPageRoutingModule {}
