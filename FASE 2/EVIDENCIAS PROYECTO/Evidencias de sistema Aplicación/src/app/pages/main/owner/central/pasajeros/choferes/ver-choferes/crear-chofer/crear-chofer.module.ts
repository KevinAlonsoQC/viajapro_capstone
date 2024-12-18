import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearChoferPageRoutingModule } from './crear-chofer-routing.module';

import { CrearChoferPage } from './crear-chofer.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearChoferPageRoutingModule,
    SharedModule
  ],
  declarations: [CrearChoferPage]
})
export class CrearChoferPageModule {}
