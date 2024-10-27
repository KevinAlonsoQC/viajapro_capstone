import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';
import { ConductoresPage } from './conductores/conductores.page'

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  {
    path: 'conductores',
    loadChildren: () => import('./conductores/conductores.module').then( m => m.ConductoresPageModule)
  },  {
    path: 'vehiculos',
    loadChildren: () => import('./vehiculos/vehiculos.module').then( m => m.VehiculosPageModule)
  },
  {
    path: 'rutas',
    loadChildren: () => import('./rutas/rutas.module').then( m => m.RutasPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
