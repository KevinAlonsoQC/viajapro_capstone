import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdministradorPage } from './administrador.page';

const routes: Routes = [
  {
    path: '',
    component: AdministradorPage
  },
  {
    path: 'conductores',
    loadChildren: () => import('./conductores/conductores.module').then( m => m.ConductoresPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministradorPageRoutingModule {}
