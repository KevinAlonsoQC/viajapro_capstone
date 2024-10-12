import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasajerosPageRoutingModule } from './pasajeros-routing.module';

import { PasajerosPage } from './pasajeros.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasajerosPageRoutingModule
  ],
  declarations: [PasajerosPage]
})
export class PasajerosPageModule {}
