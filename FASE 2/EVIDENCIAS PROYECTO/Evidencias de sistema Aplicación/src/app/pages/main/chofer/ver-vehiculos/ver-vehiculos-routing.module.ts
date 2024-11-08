import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerVehiculosPage } from './ver-vehiculos.page';

const routes: Routes = [
  {
    path: '',
    component: VerVehiculosPage
  },  {
    path: 'detalle-vehiculo',
    loadChildren: () => import('./detalle-vehiculo/detalle-vehiculo.module').then( m => m.DetalleVehiculoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerVehiculosPageRoutingModule {}
