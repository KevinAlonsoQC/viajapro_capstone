import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChoferPageRoutingModule } from './chofer-routing.module';

import { ChoferPage } from './chofer.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SessionService } from '../../../services/session.service'; // Asegúrate de importar el servicio

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChoferPageRoutingModule,
    SharedModule
  ],
  providers:[SessionService],
  declarations: [ChoferPage]
})
export class ChoferPageModule {}
