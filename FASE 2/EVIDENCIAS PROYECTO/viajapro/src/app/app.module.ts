import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';



// ======= Firebase ==========
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment.prod';

import {provideHttpClient} from '@angular/common/http';



@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({mode:'md'}), 
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy,},provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
