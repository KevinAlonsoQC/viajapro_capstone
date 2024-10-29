import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnRutaPageRoutingModule } from './en-ruta-routing.module';

import { EnRutaPage } from './en-ruta.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnRutaPageRoutingModule,
    SharedModule
  ],
  declarations: [EnRutaPage]
})
export class EnRutaPageModule {}
