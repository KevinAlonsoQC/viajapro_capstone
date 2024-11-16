import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasajerosPage } from './pasajeros.page';

const routes: Routes = [
  {
    path: '',
    component: PasajerosPage
  },
  {
    path: 'modificar-pasajero/:id',
    loadChildren: () => import('./modificar-pasajero/modificar-pasajero.module').then( m => m.ModificarPasajeroPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasajerosPageRoutingModule {}
