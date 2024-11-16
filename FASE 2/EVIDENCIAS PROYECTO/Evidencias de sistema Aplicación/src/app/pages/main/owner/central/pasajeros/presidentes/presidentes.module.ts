import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PresidentesPageRoutingModule } from './presidentes-routing.module';

import { PresidentesPage } from './presidentes.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PresidentesPageRoutingModule,
    SharedModule
  ],
  declarations: [PresidentesPage]
})
export class PresidentesPageModule {}
