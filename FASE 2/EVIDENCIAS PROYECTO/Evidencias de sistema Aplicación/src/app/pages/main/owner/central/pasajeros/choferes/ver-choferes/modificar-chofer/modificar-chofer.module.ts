import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarChoferPageRoutingModule } from './modificar-chofer-routing.module';

import { ModificarChoferPage } from './modificar-chofer.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarChoferPageRoutingModule,
    SharedModule
  ],
  declarations: [ModificarChoferPage]
})
export class ModificarChoferPageModule {}
