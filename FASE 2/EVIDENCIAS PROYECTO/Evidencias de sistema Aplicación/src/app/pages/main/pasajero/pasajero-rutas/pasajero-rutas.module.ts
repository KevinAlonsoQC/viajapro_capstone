import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasajeroRutasPageRoutingModule } from './pasajero-rutas-routing.module';

import { PasajeroRutasPage } from './pasajero-rutas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasajeroRutasPageRoutingModule,
    SharedModule

  ],
  declarations: [PasajeroRutasPage]
})
export class PasajeroRutasPageModule {}
