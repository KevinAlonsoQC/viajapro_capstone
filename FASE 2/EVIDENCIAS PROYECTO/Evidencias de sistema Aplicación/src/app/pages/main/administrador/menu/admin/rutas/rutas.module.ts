import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RutasPageRoutingModule } from './rutas-routing.module';

import { RutasPage } from './rutas.page';
import { SharedModule } from 'src/app/shared/shared.module';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RutasPageRoutingModule,
    SharedModule
  ],
  declarations: [RutasPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añadir esto aquí también

})
export class RutasPageModule {}
