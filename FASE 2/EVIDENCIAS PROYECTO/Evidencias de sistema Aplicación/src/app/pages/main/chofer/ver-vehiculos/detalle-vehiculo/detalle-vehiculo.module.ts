import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleVehiculoPageRoutingModule } from './detalle-vehiculo-routing.module';

import { DetalleVehiculoPage } from './detalle-vehiculo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleVehiculoPageRoutingModule
  ],
  declarations: [DetalleVehiculoPage]
})
export class DetalleVehiculoPageModule {}
