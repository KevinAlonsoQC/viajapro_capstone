import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CiudadesPageRoutingModule } from './ciudades-routing.module';

import { CiudadesPage } from './ciudades.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CiudadesPageRoutingModule,
    SharedModule
  ],
  declarations: [CiudadesPage]
})
export class CiudadesPageModule {}
