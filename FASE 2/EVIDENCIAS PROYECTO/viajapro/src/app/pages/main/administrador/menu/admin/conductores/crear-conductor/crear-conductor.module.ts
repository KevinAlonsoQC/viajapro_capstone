import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearConductorPageRoutingModule } from './crear-conductor-routing.module';

import { CrearConductorPage } from './crear-conductor.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearConductorPageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [CrearConductorPage]
})
export class CrearConductorPageModule {}
