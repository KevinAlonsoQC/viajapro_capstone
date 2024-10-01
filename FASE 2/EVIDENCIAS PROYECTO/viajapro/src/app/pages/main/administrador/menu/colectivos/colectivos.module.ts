import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColectivosPageRoutingModule } from './colectivos-routing.module';

import { ColectivosPage } from './colectivos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColectivosPageRoutingModule
  ],
  declarations: [ColectivosPage]
})
export class ColectivosPageModule {}
