import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarPresidentePageRoutingModule } from './modificar-presidente-routing.module';

import { ModificarPresidentePage } from './modificar-presidente.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarPresidentePageRoutingModule,
    SharedModule
  ],
  declarations: [ModificarPresidentePage]
})
export class ModificarPresidentePageModule {}
