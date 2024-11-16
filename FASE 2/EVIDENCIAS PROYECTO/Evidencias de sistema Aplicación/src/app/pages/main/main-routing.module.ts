import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPage } from './main.page';
import { DeviceGuard } from '../../guards/device.guard';

const routes: Routes = [
  {
    path: '',
    component: MainPage,

  },
  {
    path: 'profile', 
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
    
  },
  {
    path: 'administrador',
    loadChildren: () => import('./administrador/administrador.module').then( m => m.AdministradorPageModule)
  },
  {
    path: 'chofer',
    loadChildren: () => import('./chofer/chofer.module').then( m => m.ChoferPageModule),
    canActivate: [DeviceGuard]  // Protege esta ruta con el guard

  },
  {
    path: 'pasajero',
    loadChildren: () => import('./pasajero/pasajero.module').then( m => m.PasajeroPageModule),
    canActivate: [DeviceGuard]  // Protege esta ruta con el guard
  },
  {
    path: 'owner',
    loadChildren: () => import('./owner/owner.module').then( m => m.OwnerPageModule)
  },
  {
    path: 'profile-menu',
    loadChildren: () => import('./profile-menu/profile-menu.module').then( m => m.ProfileMenuPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
