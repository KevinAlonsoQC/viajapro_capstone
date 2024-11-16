import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerChoferesPage } from './ver-choferes.page';

const routes: Routes = [
  {
    path: '',
    component: VerChoferesPage
  },
  {
    path: 'crear-chofer/:central',
    loadChildren: () => import('./crear-chofer/crear-chofer.module').then( m => m.CrearChoferPageModule)
  },
  {
    path: 'modificar-chofer/:id/:central',
    loadChildren: () => import('./modificar-chofer/modificar-chofer.module').then( m => m.ModificarChoferPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerChoferesPageRoutingModule {}
