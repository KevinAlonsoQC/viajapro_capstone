import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerChoferesPageRoutingModule } from './ver-choferes-routing.module';

import { VerChoferesPage } from './ver-choferes.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerChoferesPageRoutingModule,
    SharedModule
  ],
  declarations: [VerChoferesPage]
})
export class VerChoferesPageModule {}
