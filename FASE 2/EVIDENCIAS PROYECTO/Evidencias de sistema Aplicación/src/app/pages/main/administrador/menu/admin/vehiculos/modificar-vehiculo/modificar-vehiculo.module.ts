import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarVehiculoPageRoutingModule } from './modificar-vehiculo-routing.module';

import { ModificarVehiculoPage } from './modificar-vehiculo.page';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarVehiculoPageRoutingModule,
    SharedModule
  ],
  declarations: [ModificarVehiculoPage]
})
export class ModificarVehiculoPageModule {}
