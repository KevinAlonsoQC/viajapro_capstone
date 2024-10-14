import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehiculosPage } from './vehiculos.page';

const routes: Routes = [
  {
    path: '',
    component: VehiculosPage
  },  {
    path: 'marcas-vehiculos',
    loadChildren: () => import('./marcas-vehiculos/marcas-vehiculos.module').then( m => m.MarcasVehiculosPageModule)
  },
  {
    path: 'modelos-vehiculos',
    loadChildren: () => import('./modelos-vehiculos/modelos-vehiculos.module').then( m => m.ModelosVehiculosPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiculosPageRoutingModule {}
