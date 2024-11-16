import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarPasajeroPage } from './modificar-pasajero.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarPasajeroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarPasajeroPageRoutingModule {}
