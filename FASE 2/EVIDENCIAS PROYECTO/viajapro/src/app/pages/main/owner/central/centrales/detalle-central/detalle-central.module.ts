import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleCentralPageRoutingModule } from './detalle-central-routing.module';

import { DetalleCentralPage } from './detalle-central.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleCentralPageRoutingModule,
    SharedModule
  ],
  declarations: [DetalleCentralPage]
})
export class DetalleCentralPageModule {}
