import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinanzasPageRoutingModule } from './finanzas-routing.module';

import { FinanzasPage } from './finanzas.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinanzasPageRoutingModule,
    SharedModule,
    NgxDatatableModule
  ],
  declarations: [FinanzasPage]
})
export class FinanzasPageModule {}
