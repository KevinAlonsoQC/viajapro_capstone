import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConductoresPage } from './conductores.page';

const routes: Routes = [
  {
    path: '',
    component: ConductoresPage
  },
  {
    path: 'crear-conductor',
    loadChildren: () => import('./crear-conductor/crear-conductor.module').then( m => m.CrearConductorPageModule)
  },
  {
    path: 'modificar-conductor/:id',
    loadChildren: () => import('./modificar-conductor/modificar-conductor.module').then( m => m.ModificarConductorPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConductoresPageRoutingModule {}
