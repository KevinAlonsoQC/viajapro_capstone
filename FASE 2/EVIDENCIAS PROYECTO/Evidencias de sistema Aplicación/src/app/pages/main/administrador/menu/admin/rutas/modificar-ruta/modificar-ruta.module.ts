import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarRutaPageRoutingModule } from './modificar-ruta-routing.module';

import { ModificarRutaPage } from './modificar-ruta.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarRutaPageRoutingModule,
    SharedModule
  ],
  declarations: [ModificarRutaPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añadir esto aquí también

})
export class ModificarRutaPageModule {}
