import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasajeroPageRoutingModule } from './pasajero-routing.module';

import { PasajeroPage } from './pasajero.page';
import { SharedModule } from 'src/app/shared/shared.module';

import { MapPasajeroComponent } from 'src/app/maps/component/map-pasajero/map-pasajero.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasajeroPageRoutingModule,
    SharedModule
  ],
  declarations: [PasajeroPage,MapPasajeroComponent]
})
export class PasajeroPageModule {}
