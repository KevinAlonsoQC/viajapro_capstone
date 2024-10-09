import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComunasPageRoutingModule } from './comunas-routing.module';

import { ComunasPage } from './comunas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComunasPageRoutingModule
  ],
  declarations: [ComunasPage]
})
export class ComunasPageModule {}
