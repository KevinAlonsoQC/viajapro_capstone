import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },  {
    path: 'paises',
    loadChildren: () => import('./paises/paises.module').then( m => m.PaisesPageModule)
  },
  {
    path: 'ciudades',
    loadChildren: () => import('./ciudades/ciudades.module').then( m => m.CiudadesPageModule)
  },
  {
    path: 'provincias',
    loadChildren: () => import('./provincias/provincias.module').then( m => m.ProvinciasPageModule)
  },
  {
    path: 'comunas',
    loadChildren: () => import('./comunas/comunas.module').then( m => m.ComunasPageModule)
  },
  {
    path: 'bancos',
    loadChildren: () => import('./bancos/bancos.module').then( m => m.BancosPageModule)
  },
  {
    path: 'vehiculos',
    loadChildren: () => import('./vehiculos/vehiculos.module').then( m => m.VehiculosPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
