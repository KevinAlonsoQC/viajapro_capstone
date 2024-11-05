import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { Vehiculo } from 'src/app/models/vehiculo';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-asientos',
  templateUrl: './asientos.page.html',
  styleUrls: ['./asientos.page.scss'],
})
export class AsientosPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  asientos: boolean[] = [true, true, true, true];
  vehiculo: any;
  updateInterval: any; // ID del intervalo de actualización

  constructor() { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
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
    const urlPath2 = 'vehiculo';

    try {
      const [veh] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any>
      ]);

      this.vehiculo = veh.filter(veh => {
        return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
      });

      console.log('Vehículo Afiliado:', this.vehiculo[0].id);

      // Inicializar el arreglo de asientos
      this.asientos = [true, true, true, true]; // Puedes ajustar según la cantidad de asientos

      // Leer el estado de cada asiento desde el almacenamiento local
      for (let i = 0; i < this.asientos.length; i++) {
        const asientoKey = `asiento${i + 1}`;
        const asientoValue = this.utilsSvc.getFromLocalStorage(asientoKey);

        // Si existe en localStorage, usar el valor almacenado; si no, dejar el valor por defecto
        this.asientos[i] = asientoValue !== null ? asientoValue : true;
      }

      const disponibles = this.asientos.filter(asiento => asiento).length;
      this.firebaseSvc.updateDocument(`vehiculo/${this.vehiculo[0].id}`, { asientos_dispo_vehiculo: disponibles });

      if (this.vehiculo.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Visualizando Asientos',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No se pudo obtener el vehículo :(',
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

  async startTrackingUserLocation() {
    // Establece un intervalo que actualiza la ubicación cada 5 segundos
    this.updateInterval = setInterval(async () => {
      if (this.vehiculo[0].ruta_actual) {
        try {
          const coordinates = await Geolocation.getCurrentPosition();
          const { latitude, longitude } = coordinates.coords;

          this.firebaseSvc.updateDocument(`vehiculo/${this.vehiculo[0].id}`, { coordenadas_vehiculo: { lat: latitude, lng: longitude } })
          console.log('Coordenadas Vehículo Actualizadas', latitude, longitude)
        } catch (error) {
          console.error('Error obteniendo la ubicación [chofer', error);
        }
      }
    }, 15000); // Actualiza cada 15 segundos
  }

  async cambiarAsiento(asiento: number) {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      // Cambiar el estado del asiento y guardarlo en el almacenamiento local
      this.asientos[asiento - 1] = !this.asientos[asiento - 1];
      this.utilsSvc.saveInLocalStorage(`asiento${asiento}`, this.asientos[asiento - 1]);

      const disponibles = this.asientos.filter(asiento => asiento).length;
      console.log(`Asientos disponibles: ${disponibles}`);
      this.firebaseSvc.updateDocument(`vehiculo/${this.vehiculo[0].id}`, { asientos_dispo_vehiculo: disponibles });
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: '¡No se pudo modificar el asiento!',
        duration: 1500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      // Añadir un pequeño tiempo de espera antes de cerrar el loading
      setTimeout(() => {
        loading.dismiss();
      }, 1000);
    }
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  backRuta() {
    this.utilsSvc.routerLink(`/main/chofer/ver-ruta/${this.vehiculo[0].ruta_actual}`);
  }

  backAdmin() {
    this.utilsSvc.routerLink('/main/chofer/en-ruta');
  }
}
