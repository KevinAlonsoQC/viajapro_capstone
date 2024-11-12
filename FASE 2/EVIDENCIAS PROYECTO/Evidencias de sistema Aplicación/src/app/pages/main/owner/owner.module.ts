import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OwnerPageRoutingModule } from './owner-routing.module';

import { OwnerPage } from './owner.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { BaseChartDirective } from 'ng2-charts';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OwnerPageRoutingModule,
    SharedModule,
    BaseChartDirective
  ],
  declarations: [OwnerPage]
})
export class OwnerPageModule {}
