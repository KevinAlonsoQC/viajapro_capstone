import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-en-ruta',
  templateUrl: './en-ruta.page.html',
  styleUrls: ['./en-ruta.page.scss'],
})
export class EnRutaPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  rutas: any;
  updateInterval: any; // ID del intervalo de actualización
  vehRuta: any;
  elementosFiltrados: any[] = [];  // Lista filtrada
  searchText: string = '';  // Texto de búsqueda
  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });

    this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
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
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'vehiculo'; // Ruta de la colección de usuarios
    const urlPath2 = 'ruta_central'; // Ruta de la colección de usuarios


    try {
      // Ejecutar ambas promesas en paralelo
      const [callback, callback2] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any[]>,

      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.rutas = callback2.filter(ruta =>
        ruta.central == this.usuario.central
      );
      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.vehRuta = callback.filter(veh => {
        return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
      });

      if (this.vehRuta[0].ruta_actual) {
        console.log('Vehículo en ruta!')
        await this.startTrackingUserLocation();
      }

      this.elementosFiltrados = this.rutas; //Copiamos desde la variable


      if (this.vehRuta.length <= 0) {
        this.utilsSvc.presentToast({
          message: '¡No hay Vehículos Asignados para ti!',
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ en_ruta: false, vehiculo_actual: '' } });
        this.utilsSvc.routerLink('/main/chofer');
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos  prometidos:(',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  async startTrackingUserLocation() {
    // Establece un intervalo que actualiza la ubicación cada 5 segundos
    this.updateInterval = setInterval(async () => {
      if (this.vehRuta[0].ruta_actual) {
        try {
          const coordinates = await Geolocation.getCurrentPosition();
          const { latitude, longitude } = coordinates.coords;

          this.firebaseSvc.updateDocument(`vehiculo/${this.vehRuta[0].id}`, { coordenadas_vehiculo: { lat: latitude, lng: longitude } })
          console.log('Coordenadas Vehículo Actualizadas', latitude, longitude)
        } catch (error) {
          console.error('Error obteniendo la ubicación [chofer', error);
        }
      }
    }, 5000); // Actualiza cada 15 segundos
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  async viewRuta(ruta: any) {
    const alert = await this.alertController.create({
      header: `¿Seguro de trabajar en la ruta ${ruta.nombre_ruta}?`,
      message: 'Si la seleccionas, puedes cambiarla si lo deseas más tarde. Recuerda que los pasajeros que seleccionen esta ruta podrán verte en el mapa.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: async () => {
            await this.firebaseSvc.updateDocument(`vehiculo/${this.vehRuta[0].id}`, { ...{ ruta_actual: ruta.id } });
            await this.startTrackingUserLocation();
            this.router.navigate(['/main/chofer/ver-ruta', ruta.id]);
          },
        },
      ],
    });

    await alert.present();
  }

  // Función para filtrar
	filtrar(event: any) {
		const textoBusqueda = event.target.value.toLowerCase();  // Captura el valor ingresado y lo convierte a minúsculas

		// Filtrar los choferes por nombre o rut
		if (textoBusqueda.trim() === '') {
			// Si no hay texto de búsqueda, mostrar todos los choferes
			this.elementosFiltrados = this.rutas;
		} else {
			this.elementosFiltrados = this.rutas.filter(elemento =>
				elemento.nombre_ruta.toLowerCase().includes(textoBusqueda)
			);
		}
	}
}
