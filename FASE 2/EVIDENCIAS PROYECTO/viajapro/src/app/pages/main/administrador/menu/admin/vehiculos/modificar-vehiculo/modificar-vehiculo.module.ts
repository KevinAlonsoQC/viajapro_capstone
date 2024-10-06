import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarVehiculoPageRoutingModule } from './modificar-vehiculo-routing.module';

import { ModificarVehiculoPage } from './modificar-vehiculo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarVehiculoPageRoutingModule
  ],
  declarations: [ModificarVehiculoPage]
})
export class ModificarVehiculoPageModule {}
