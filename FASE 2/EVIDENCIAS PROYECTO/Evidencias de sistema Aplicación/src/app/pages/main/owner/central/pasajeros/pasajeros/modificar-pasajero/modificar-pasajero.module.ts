import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarPasajeroPageRoutingModule } from './modificar-pasajero-routing.module';

import { ModificarPasajeroPage } from './modificar-pasajero.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarPasajeroPageRoutingModule,
    SharedModule
  ],
  declarations: [ModificarPasajeroPage]
})
export class ModificarPasajeroPageModule {}
