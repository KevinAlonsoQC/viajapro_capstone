import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DatatableComponent, ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.page.html',
  styleUrls: ['./personal.page.scss'],
})
export class PersonalPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  choferes: any;

  rows = [];
  temp = [];
  columns = [
    { prop: 'nombreChofer', name: 'Nombre Chofer' },
    { prop: 'rutChofer', name: 'R.U.T Chofer' },
    { prop: 'estado', name: 'Estado' },
  ];

  datatableMessages = {
    emptyMessage: 'No hay datos disponibles',
    totalMessage: 'Total',
    selectedMessage: 'seleccionado'
  };


  selected = [];
  SelectionType = SelectionType;
  updateInterval: any; // ID del intervalo de actualización

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
    const urlPath = 'usuario'; // Ruta de la colección de usuarios
    try {
      const [user] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any>
      ]);

      this.choferes = user.filter(user => {
        return user.central == this.usuario.central && user.tipo_usuario == '2'
      });

      this.rows = this.choferes.map(user => ({
        nombreChofer: user.name,
        rutChofer: user.rut_usuario,
        estado: user.en_ruta ? 'En ruta' : 'Desconectado'
      }));

      this.temp = [...this.rows];
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }
    await this.getData();
  }

  async ionViewDidLeave() {
    this.clearUpdateInterval();
  }

  ngOnDestroy() {
    this.clearUpdateInterval();
  }

  ionViewWillLeave() {
    this.clearUpdateInterval();
  }

  clearUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  async getData() {
    this.updateInterval = setInterval(async () => {
      const urlPath = 'usuario'; // Ruta de la colección de usuarios
      try {
        const [user] = await Promise.all([
          this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any>
        ]);

        this.choferes = user.filter(user => {
          return user.central == this.usuario.central && user.tipo_usuario == '2'
        });

        this.rows = this.choferes.map(user => ({
          nombreChofer: user.name,
          rutChofer: user.rut_usuario,
          estado: user.en_ruta ? 'En ruta' : 'Desconectado'
        }));

        this.temp = [...this.rows];
      } catch (error) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: 'No se pudo obtener los datos :(',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }
    }, 5000); // Actualiza cada 10 segundos
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // Filtrar los datos basados en las propiedades correctas
    const temp = this.temp.filter(d => {
      return (
        (d.nombreChofer && d.nombreChofer.toLowerCase().includes(val)) ||
        (d.rutChofer && d.rutChofer.toLowerCase().includes(val)) ||
        (d.estado && d.estado.toLowerCase().includes(val)) ||
        !val
      );
    });

    // Actualizar las filas
    this.rows = temp;
    // Regresar a la primera página si hay un filtro
    this.table.offset = 0;
  }

  getRowClass(row) {
    return {
      'en-servicio': row.estado === 'En ruta',
      'desconectado': row.estado === 'Desconectado'
    };
  }
  

}
