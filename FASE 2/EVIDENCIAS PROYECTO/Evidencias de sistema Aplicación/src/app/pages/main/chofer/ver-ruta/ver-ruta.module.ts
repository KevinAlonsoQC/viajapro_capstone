import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerRutaPageRoutingModule } from './ver-ruta-routing.module';

import { VerRutaPage } from './ver-ruta.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerRutaPageRoutingModule,
    SharedModule
  ],
  declarations: [VerRutaPage]
})
export class VerRutaPageModule {}
