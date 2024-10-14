import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModelosVehiculosPageRoutingModule } from './modelos-vehiculos-routing.module';

import { ModelosVehiculosPage } from './modelos-vehiculos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModelosVehiculosPageRoutingModule,
    SharedModule
  ],
  declarations: [ModelosVehiculosPage]
})
export class ModelosVehiculosPageModule {}
