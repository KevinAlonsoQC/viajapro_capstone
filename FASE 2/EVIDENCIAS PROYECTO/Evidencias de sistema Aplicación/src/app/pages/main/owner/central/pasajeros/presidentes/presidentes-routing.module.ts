import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PresidentesPage } from './presidentes.page';

const routes: Routes = [
  {
    path: '',
    component: PresidentesPage
  },
  {
    path: 'crear-presidente',
    loadChildren: () => import('./crear-presidente/crear-presidente.module').then( m => m.CrearPresidentePageModule)
  },
  {
    path: 'modificar-presidente/:id',
    loadChildren: () => import('./modificar-presidente/modificar-presidente.module').then( m => m.ModificarPresidentePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PresidentesPageRoutingModule {}
