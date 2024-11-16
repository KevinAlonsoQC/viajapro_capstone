import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasajerosPageRoutingModule } from './pasajeros-routing.module';

import { PasajerosPage } from './pasajeros.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasajerosPageRoutingModule,
    SharedModule
  ],
  declarations: [PasajerosPage]
})
export class PasajerosPageModule {}
