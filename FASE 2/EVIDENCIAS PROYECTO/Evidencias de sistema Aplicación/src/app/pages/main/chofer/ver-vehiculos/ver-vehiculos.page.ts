import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CentralColectivo } from 'src/app/models/central-colectivo';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-ver-vehiculos',
  templateUrl: './ver-vehiculos.page.html',
  styleUrls: ['./ver-vehiculos.page.scss'],
})
export class VerVehiculosPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  vehiculos!: any;
  central!: CentralColectivo;

  elementosFiltrados: any[] = [];  // Lista filtrada
  searchText: string = '';  // Texto de búsqueda

  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    await this.getVehiculos();
  }

  async getVehiculos() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const vehPath = 'vehiculo'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [vehiculos] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(vehPath) as Promise<any[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.vehiculos = vehiculos.filter(vehiculo => {
        for (let item of vehiculo.usuario) {
          if (item == this.usuario.uid) {
            return vehiculo
          }
        }
      });

      this.elementosFiltrados = this.vehiculos; //Copiamos desde la variable


      if (this.vehiculos.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Vehículos Cargados con Éxito',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No hay vehículos disponibles',
          duration: 1500,
          color: 'warning',
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

  detalleVehiculo(id: string) {
    this.router.navigate(['/main/chofer/ver-vehiculos/detalle-vehiculo', id]);
  }

  // Función para filtrar
  filtrar(event: any) {
    const textoBusqueda = event.target.value.toLowerCase();  // Captura el valor ingresado y lo convierte a minúsculas

    // Filtrar los choferes por nombre o rut
    if (textoBusqueda.trim() === '') {
      // Si no hay texto de búsqueda, mostrar todos los choferes
      this.elementosFiltrados = this.vehiculos;
    } else {
      this.elementosFiltrados = this.vehiculos.filter(elemento =>
        elemento.patente_vehiculo.toLowerCase().includes(textoBusqueda) ||
        elemento.nombre_modelo.toLowerCase().includes(textoBusqueda)
      );
    }
  }
}

