import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnRutaPage } from './en-ruta.page';

const routes: Routes = [
  {
    path: '',
    component: EnRutaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnRutaPageRoutingModule {}
