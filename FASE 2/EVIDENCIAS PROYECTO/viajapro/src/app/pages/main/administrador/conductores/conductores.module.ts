import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConductoresPageRoutingModule } from './conductores-routing.module';

import { ConductoresPage } from './conductores.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConductoresPageRoutingModule,
    SharedModule
  ],
  declarations: [ConductoresPage]
})
export class ConductoresPageModule {}
