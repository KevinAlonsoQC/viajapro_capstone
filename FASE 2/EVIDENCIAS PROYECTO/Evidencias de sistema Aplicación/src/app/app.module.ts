import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';



// ======= Firebase ==========
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment.prod';

import { provideHttpClient } from '@angular/common/http';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { SessionService } from './services/session.service'; // Asegúrate de importar el servicio

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    NgxDatatableModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables()), { provide: RouteReuseStrategy, useClass: IonicRouteStrategy, }, provideHttpClient(), SessionService],
  bootstrap: [AppComponent],
})
export class AppModule { }
