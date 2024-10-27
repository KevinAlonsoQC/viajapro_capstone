import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarRutaPageRoutingModule } from './modificar-ruta-routing.module';

import { ModificarRutaPage } from './modificar-ruta.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarRutaPageRoutingModule,
    SharedModule
  ],
  declarations: [ModificarRutaPage]
})
export class ModificarRutaPageModule {}
