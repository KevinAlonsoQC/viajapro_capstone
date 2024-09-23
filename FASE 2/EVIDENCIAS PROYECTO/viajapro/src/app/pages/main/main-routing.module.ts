import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage
  },
  {
    path: 'profile/:id', 
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'administrador',
    loadChildren: () => import('./administrador/administrador.module').then( m => m.AdministradorPageModule)
  },
  {
    path: 'chofer',
    loadChildren: () => import('./chofer/chofer.module').then( m => m.ChoferPageModule)
  },
  {
    path: 'pasajero',
    loadChildren: () => import('./pasajero/pasajero.module').then( m => m.PasajeroPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
