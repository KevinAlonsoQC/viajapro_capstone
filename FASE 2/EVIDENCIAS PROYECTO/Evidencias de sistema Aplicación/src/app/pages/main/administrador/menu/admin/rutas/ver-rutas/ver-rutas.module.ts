import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerRutasPageRoutingModule } from './ver-rutas-routing.module';

import { VerRutasPage } from './ver-rutas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerRutasPageRoutingModule,
    SharedModule
  ],
  declarations: [VerRutasPage]
})
export class VerRutasPageModule {}
