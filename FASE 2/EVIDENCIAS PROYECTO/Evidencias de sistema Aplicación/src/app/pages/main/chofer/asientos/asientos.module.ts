import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsientosPageRoutingModule } from './asientos-routing.module';

import { AsientosPage } from './asientos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsientosPageRoutingModule,
    SharedModule
  ],
  declarations: [AsientosPage]
})
export class AsientosPageModule {}
