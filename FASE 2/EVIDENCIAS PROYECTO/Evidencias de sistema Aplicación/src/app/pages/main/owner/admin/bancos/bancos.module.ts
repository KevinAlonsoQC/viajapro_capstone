import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BancosPageRoutingModule } from './bancos-routing.module';

import { BancosPage } from './bancos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BancosPageRoutingModule,
    SharedModule
  ],
  declarations: [BancosPage]
})
export class BancosPageModule {}
