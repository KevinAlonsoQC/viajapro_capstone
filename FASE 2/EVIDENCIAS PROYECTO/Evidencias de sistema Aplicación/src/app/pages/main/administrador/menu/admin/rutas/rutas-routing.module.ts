import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RutasPage } from './rutas.page';
import { MapPasajeroComponent } from 'src/app/maps/component/map-pasajero/map-pasajero.component';

const routes: Routes = [
  {
    path: '',
    component: RutasPage
  },
  {
    path: 'ver-rutas',
    loadChildren: () => import('./ver-rutas/ver-rutas.module').then( m => m.VerRutasPageModule)
  },
  {
    path: 'modificar-ruta/:id',
    loadChildren: () => import('./modificar-ruta/modificar-ruta.module').then( m => m.ModificarRutaPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],

})
export class RutasPageRoutingModule {}
