import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoferesPage } from './choferes.page';

const routes: Routes = [
  {
    path: '',
    component: ChoferesPage
  },
  {
    path: 'ver-choferes/:id',
    loadChildren: () => import('./ver-choferes/ver-choferes.module').then( m => m.VerChoferesPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoferesPageRoutingModule {}
