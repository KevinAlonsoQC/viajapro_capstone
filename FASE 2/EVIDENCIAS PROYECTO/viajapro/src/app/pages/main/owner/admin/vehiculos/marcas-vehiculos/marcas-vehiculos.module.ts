import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarcasVehiculosPageRoutingModule } from './marcas-vehiculos-routing.module';

import { MarcasVehiculosPage } from './marcas-vehiculos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarcasVehiculosPageRoutingModule,
    SharedModule
  ],
  declarations: [MarcasVehiculosPage]
})
export class MarcasVehiculosPageModule {}
