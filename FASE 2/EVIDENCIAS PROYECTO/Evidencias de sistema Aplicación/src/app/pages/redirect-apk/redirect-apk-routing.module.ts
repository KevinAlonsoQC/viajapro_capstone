import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedirectApkPage } from './redirect-apk.page';

const routes: Routes = [
  {
    path: '',
    component: RedirectApkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RedirectApkPageRoutingModule {}
