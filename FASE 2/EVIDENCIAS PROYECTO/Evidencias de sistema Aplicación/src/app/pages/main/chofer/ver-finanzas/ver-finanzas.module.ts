import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerFinanzasPageRoutingModule } from './ver-finanzas-routing.module';

import { VerFinanzasPage } from './ver-finanzas.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerFinanzasPageRoutingModule,
    SharedModule,
    NgxDatatableModule
  ],
  declarations: [VerFinanzasPage]
})
export class VerFinanzasPageModule {}
