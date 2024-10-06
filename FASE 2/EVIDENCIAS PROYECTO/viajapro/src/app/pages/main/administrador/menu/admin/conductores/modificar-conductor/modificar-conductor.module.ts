import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarConductorPageRoutingModule } from './modificar-conductor-routing.module';

import { ModificarConductorPage } from './modificar-conductor.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarConductorPageRoutingModule,
    SharedModule
  ],
  declarations: [ModificarConductorPage]
})
export class ModificarConductorPageModule {}
