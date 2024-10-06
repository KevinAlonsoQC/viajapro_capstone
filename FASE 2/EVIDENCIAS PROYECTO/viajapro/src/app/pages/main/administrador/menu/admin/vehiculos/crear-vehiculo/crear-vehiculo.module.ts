import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearVehiculoPageRoutingModule } from './crear-vehiculo-routing.module';

import { CrearVehiculoPage } from './crear-vehiculo.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearVehiculoPageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [CrearVehiculoPage]
})
export class CrearVehiculoPageModule {}
