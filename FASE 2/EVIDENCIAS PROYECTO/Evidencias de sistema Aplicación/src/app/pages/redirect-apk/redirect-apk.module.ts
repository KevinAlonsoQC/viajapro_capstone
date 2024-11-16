import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RedirectApkPageRoutingModule } from './redirect-apk-routing.module';

import { RedirectApkPage } from './redirect-apk.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RedirectApkPageRoutingModule,
    SharedModule
  ],
  declarations: [RedirectApkPage]
})
export class RedirectApkPageModule {}
