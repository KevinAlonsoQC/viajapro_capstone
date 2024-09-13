import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

// === Modelos ===
import { User } from 'src/app/models/user';
import { CentralColectivo } from 'src/app/models/central-colectivo';
import { HistorialPago } from 'src/app/models/historial-pago';
import { TipoPago } from 'src/app/models/tipo-pago';
import { Vehiculo } from 'src/app/models/vehiculo';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  historial_pagos: any;

  constructor() { }
  ngOnInit() {
    this.getUserInfo();
  }

  async getUserInfo() {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    const path = 'historial_pago';

    try {
      const historialPagos: HistorialPago[] = await this.firebaseSvc.getCollectionDocuments(path) as HistorialPago[];
      const historialPagosConDatos = [];
      for (const pago of historialPagos) {
        const choferId = pago.chofer;
        const clienteId = pago.cliente;
        const centralId = pago.central;
        const vehiculoId = pago.vehiculo;
        const tipoPagoId = pago.tipo_pago;

        const [chofer, cliente, central, vehiculo, tipo_pago] = await Promise.all([
          this.firebaseSvc.getDocumentById('usuario', choferId),
          this.firebaseSvc.getDocumentById('usuario', clienteId),
          this.firebaseSvc.getDocumentById('central_colectivo', centralId) as Promise<CentralColectivo>,
          this.firebaseSvc.getDocumentById('vehiculo', vehiculoId) as Promise<Vehiculo>,
          this.firebaseSvc.getDocumentById('tipo_pago', tipoPagoId) as Promise<TipoPago>
        ]);

        historialPagosConDatos.push({
          ...pago,
          chofer,
          cliente,
          central,
          vehiculo,
          tipo_pago
        });
      }

      this.historial_pagos = historialPagosConDatos;
      console.log(this.historial_pagos);
      
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 3500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }


  signOut() {
    this.firebaseSvc.signOut();
  }
}

