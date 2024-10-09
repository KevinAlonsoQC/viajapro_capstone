import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProvinciasPageRoutingModule } from './provincias-routing.module';

import { ProvinciasPage } from './provincias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProvinciasPageRoutingModule
  ],
  declarations: [ProvinciasPage]
})
export class ProvinciasPageModule {}
