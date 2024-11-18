import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DatatableComponent, ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-finanzas',
  templateUrl: './finanzas.page.html',
  styleUrls: ['./finanzas.page.scss'],
})
export class FinanzasPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;

  finanzas: any;
  rows = [];
  temp = [];
  columns = [
    { prop: 'nombreChofer', name: 'Nombre Chofer' },
    { prop: 'patenteVeh', name: 'Patente' },
    { prop: 'fechaPago', name: 'Fecha Pago' },
  ];

  datatableMessages = {
    emptyMessage: 'No hay datos disponibles',
    totalMessage: 'Total',
    selectedMessage: 'seleccionado'
  };


  selected = [];
  SelectionType = SelectionType;

  seleccionado = false;


  @ViewChild(DatatableComponent) table: DatatableComponent;
  ColumnMode = ColumnMode;

  constructor() { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  async ionViewWillEnter() {
    await this.getData();
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'historial_pago'; // Ruta de la colección de usuarios

    try {
      const [finanzas] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>
      ]);

      this.finanzas = finanzas.filter(historial => {
        return historial.id_pasajero == this.usuario.uid
      });

      this.rows = this.finanzas.map(historial => ({
        //Datos que se mostrarán después que se seleccione
        id: historial.id, //ID de la transacción
        nombreChofer: historial.nombre_chofer, //nombre del chofer
        rutChofer: historial.rut_chofer, //rut del chofer
        modeloVeh: historial.vehiculo.modelo, //modelo del vehículo que usó
        patenteVeh: historial.vehiculo.patente, //patente del vehículo que usó

        nombrePago: historial.payer_name, //nombre del dueño de la cuenta bancaria que pagó
        correoPago: historial.payer_email, //email del dueño de la cuenta bancaria que pagó
        rutPago: historial.personal_identifier, //rut del dueño de la cuenta bancaria que pagío
        comprobante: historial.receipt_url, //url del comprobante

        metodo_pago: historial.payment_method, //el método de pago, exiten 3 métodos de khipu, pueden ser
        //regular_transfer(transferencia normal) 
        //simplified_transfer(transferencia simplificada).
        //not_available (sin contexto en la documentación de khipu)

        fuente_fondos: historial.funds_source, //Origen de fondos usado por el pagador, puede ser:
        //debit para pago con débito, 
        //prepaid para pago con prepago, 
        //credit para pago con crédito,
        //vacío en el caso de que se haya pagado mediante transferencia bancaria.

        monto: Math.trunc(historial.amount),  //monto del pago
        banco: historial.bank, //banco del cual pagó

        estado_pago: historial.status, //Estado del pago, puede ser 
        //'pending' (el pagador aún no comienza a pagar), 
        //'verifying' (se está verificando el pago) 
        //'done', cuando el pago ya está confirmado.

        //Datos que se mostrará en la pantalla!
        nombrePasajero: historial.nombre_pasajero, //nombre del pasajero que se subió
        rutPasajero: historial.rut_pasajero, //rut del pasajero que se subió
        fechaPago: historial.fecha_pago, //fecha de pago

        razon: historial.subject
      }));
      this.temp = [...this.rows];


      if (this.finanzas.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Visualizando Finanzas',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);
    this.seleccionado = true;
    
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // Filtrar los datos basados en las propiedades correctas
    const temp = this.temp.filter(d => {
      return (
        (d.nombreChofer && d.nombreChofer.toLowerCase().includes(val)) ||
        (d.patenteVeh && d.patenteVeh.toLowerCase().includes(val)) ||
        (d.fechaPago && d.fechaPago.toLowerCase().includes(val)) ||
        !val
      );
    });

    // Actualizar las filas
    this.rows = temp;
    // Regresar a la primera página si hay un filtro
    this.table.offset = 0;
  }

}
