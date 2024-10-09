import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehiculosPage } from './vehiculos.page';

const routes: Routes = [
  {
    path: '',
    component: VehiculosPage
  },
  {
    path: 'crear-vehiculo',
    loadChildren: () => import('./crear-vehiculo/crear-vehiculo.module').then( m => m.CrearVehiculoPageModule)
  },
  {
    path: 'modificar-vehiculo/:id',
    loadChildren: () => import('./modificar-vehiculo/modificar-vehiculo.module').then( m => m.ModificarVehiculoPageModule)
  },
  {
    path: 'detalle-vehiculo/:id',
    loadChildren: () => import('./detalle-vehiculo/detalle-vehiculo.module').then( m => m.DetalleVehiculoPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiculosPageRoutingModule {}
