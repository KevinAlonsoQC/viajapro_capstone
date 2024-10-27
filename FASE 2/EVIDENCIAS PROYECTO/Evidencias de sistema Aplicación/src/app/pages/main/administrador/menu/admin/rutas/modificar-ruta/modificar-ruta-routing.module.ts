import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarRutaPage } from './modificar-ruta.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarRutaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarRutaPageRoutingModule {}
