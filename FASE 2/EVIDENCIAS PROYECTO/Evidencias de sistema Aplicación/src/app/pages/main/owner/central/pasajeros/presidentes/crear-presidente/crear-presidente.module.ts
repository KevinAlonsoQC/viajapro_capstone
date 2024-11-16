import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearPresidentePageRoutingModule } from './crear-presidente-routing.module';

import { CrearPresidentePage } from './crear-presidente.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearPresidentePageRoutingModule,
    SharedModule
  ],
  declarations: [CrearPresidentePage]
})
export class CrearPresidentePageModule {}
