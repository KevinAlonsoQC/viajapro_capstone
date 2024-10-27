import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdministradorPage } from './administrador.page';

const routes: Routes = [
  {
    path: '',
    component: AdministradorPage
  },
  {
    path: 'finanzas',
    loadChildren: () => import('./menu/finanzas/finanzas.module').then( m => m.FinanzasPageModule)
  },
  {
    path: 'personal',
    loadChildren: () => import('./menu/personal/personal.module').then( m => m.PersonalPageModule)
  },
  {
    path: 'colectivos',
    loadChildren: () => import('./menu/colectivos/colectivos.module').then( m => m.ColectivosPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./menu/admin/admin.module').then( m => m.AdminPageModule)
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministradorPageRoutingModule {}
