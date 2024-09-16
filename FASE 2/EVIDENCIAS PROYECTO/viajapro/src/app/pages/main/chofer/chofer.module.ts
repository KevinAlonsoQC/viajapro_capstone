import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChoferPageRoutingModule } from './chofer-routing.module';

import { ChoferPage } from './chofer.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChoferPageRoutingModule,
    SharedModule
  ],
  declarations: [ChoferPage]
})
export class ChoferPageModule {}
