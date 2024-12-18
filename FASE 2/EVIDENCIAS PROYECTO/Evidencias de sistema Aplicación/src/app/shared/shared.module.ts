import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuMasterComponent } from './components/menu-master/menu-master.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { BotonLargeComponent } from './components/boton-large/boton-large.component';
import { RouterModule } from '@angular/router';
import { CampanaComponent } from './components/campana/campana.component';
import { LogoSmallComponent } from './components/logo-small/logo-small.component';
import { AvatarLargeComponent } from './components/avatar-large/avatar-large.component';
import { ProfileBotonEditComponent } from './components/profile-boton-edit/profile-boton-edit.component';
import { HeaderFuntionComponent } from './components/header-funtion/header-funtion.component';
import { FunctionItemComponent } from './components/function-item/function-item.component';
import { ConductorItemComponent } from './components/conductor-item/conductor-item.component';
import { MapPasajeroComponent } from '../maps/component/map-pasajero/map-pasajero.component';


@NgModule({
  declarations: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    MenuMasterComponent,
    AvatarComponent,
    MenuMasterComponent,
    BotonLargeComponent,
    CampanaComponent,
    LogoSmallComponent,
    AvatarLargeComponent,
    ProfileBotonEditComponent,
    HeaderFuntionComponent,
    FunctionItemComponent,
    ConductorItemComponent,
    MapPasajeroComponent
  ],
  exports: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    ReactiveFormsModule,
    FormsModule,
    MenuMasterComponent,
    AvatarComponent,
    BotonLargeComponent,
    CampanaComponent,
    LogoSmallComponent,
    AvatarLargeComponent,
    ProfileBotonEditComponent,
    HeaderFuntionComponent,
    FunctionItemComponent,
    ConductorItemComponent,
    MapPasajeroComponent

  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ]
})
export class SharedModule { }
