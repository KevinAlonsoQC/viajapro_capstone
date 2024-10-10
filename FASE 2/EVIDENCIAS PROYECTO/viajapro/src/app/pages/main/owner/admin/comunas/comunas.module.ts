import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComunasPageRoutingModule } from './comunas-routing.module';

import { ComunasPage } from './comunas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComunasPageRoutingModule,
    SharedModule
  ],
  declarations: [ComunasPage]
})
export class ComunasPageModule {}
