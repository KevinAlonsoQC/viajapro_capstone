import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerVehiculosPageRoutingModule } from './ver-vehiculos-routing.module';

import { VerVehiculosPage } from './ver-vehiculos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerVehiculosPageRoutingModule
  ],
  declarations: [VerVehiculosPage]
})
export class VerVehiculosPageModule {}
