import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerVehiculosPageRoutingModule } from './ver-vehiculos-routing.module';

import { VerVehiculosPage } from './ver-vehiculos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerVehiculosPageRoutingModule,
    SharedModule
  ],
  declarations: [VerVehiculosPage]
})
export class VerVehiculosPageModule {}
