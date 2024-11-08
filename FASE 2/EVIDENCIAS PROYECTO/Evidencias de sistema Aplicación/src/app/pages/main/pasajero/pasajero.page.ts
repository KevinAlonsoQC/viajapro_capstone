import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;
  routePoints: any = [];
  searchTerm: string = '';      // Término de búsqueda actual
  private updateInterval: any; // ID del intervalo de actualización
  rutasCercanadas: any;
  private isUpdatingNearbyRoutes: boolean = false; // Agrega esta variable

  constructor() { }

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
    await this.getInfoAndTipoCuenta();
  }

  ionViewDidEnter() {
    this.startUpdatingNearbyRoutes(); // Inicia el intervalo cuando la vista se presenta
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
      this.updateInterval = null; // Limpia la referencia
      this.isUpdatingNearbyRoutes = false; // Reinicia el flag    
    }
  }

  startUpdatingNearbyRoutes() {
    if (this.isUpdatingNearbyRoutes) return; // Evita múltiples invocaciones
    this.isUpdatingNearbyRoutes = true; // Establece el flag

    this.updateNearbyRoutes(); // Llama a la función una vez al inicio

    this.updateInterval = setInterval(() => {
      console.log('Actualizando Rutas!!');
      this.updateNearbyRoutes();
    }, 60000); // cada 60segundos se actualizarán las rutas cercanas!
  }


  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'ruta_central'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [ruta] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any>
      ]);

      this.routePoints = ruta.filter(callback => callback.estado == true);

      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;
      this.rutasCercanadas = [];
      for (let ruta of this.routePoints) {
        for (let coord of ruta.coordenada_ruta) {
          let distance = this.calculateDistance(
            latitude,
            longitude,
            coord.lat,
            coord.lng,
          );
          // Aproxima la distancia a un decimal
          distance = parseFloat(distance.toFixed(1));
          if (distance < 2000) { //2km a la redonda
            ruta.distance = `${distance} metros`
            this.rutasCercanadas.push(ruta);
            break;
          } else {
            ruta.distance = `${distance} metros`
            break;
          }
        }
      }

      if (this.rutasCercanadas.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Rutas Cercanas, Cargadas con Éxito',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No hay Rutas Cercanas disponibles',
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

  // Función para calcular la distancia entre dos coordenadas
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  async searchRoutes(event: any) {
    const searchTerm = event.target.value.toLowerCase(); // Convierte el término de búsqueda a minúsculas
    if (searchTerm && searchTerm.trim() !== '') {
      // Filtra las rutas según el término de búsqueda
      this.rutasCercanadas = this.routePoints.filter((ruta) =>
        ruta.nombre_ruta.toLowerCase().includes(searchTerm)
      );
    } else {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;
      this.rutasCercanadas = [];
      for (let ruta of this.routePoints) {
        for (let coord of ruta.coordenada_ruta) {
          let distance = this.calculateDistance(
            latitude,
            longitude,
            coord.lat,
            coord.lng,
          );
          // Aproxima la distancia a un decimal
          distance = parseFloat(distance.toFixed(1));
          if (distance < 2000) { //2km a la redonda
            this.rutasCercanadas.push({ ...ruta, distance: `${distance} metros` });
            break;
          } else {
            ruta.distance = `${distance} metros`
            break;
          }
        }
      }
    }
  }

  async updateNearbyRoutes() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;
      this.rutasCercanadas = []; // Limpia las rutas cercanas

      for (let ruta of this.routePoints) {
        for (let coord of ruta.coordenada_ruta) {
          let distance = this.calculateDistance(latitude, longitude, coord.lat, coord.lng);
          distance = parseFloat(distance.toFixed(1)); // Aproxima la distancia a un decimal

          if (distance < 3000) { // 3 km a la redonda
            ruta.distance = `${distance} metros`;
            this.rutasCercanadas.push(ruta);
            break; // Sale del bucle de coordenadas una vez que encuentra una cercana
          } else {
            ruta.distance = `${distance} metros`;
            break; // Sale del bucle de coordenadas si no está cerca
          }
        }
      }

      console.log('Rutas cercanas actualizadas:', this.rutasCercanadas);
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
    }
  }


  isNightTime(): boolean {
    const horaActual = new Date().getHours();
    return horaActual >= 20 || horaActual < 6;
  }

  async getInfoAndTipoCuenta() {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const tipo_cuenta = this.usuario.tipo_usuario;

      if (tipo_cuenta == "0") {
        this.utilsSvc.routerLink('/main/owner');
      } else if (tipo_cuenta == "1") {
        this.utilsSvc.routerLink('/main/administrador/admin');
      } else if (tipo_cuenta == "2") {
        this.utilsSvc.routerLink('/main/chofer');
      } else if (tipo_cuenta == "3") {
        this.utilsSvc.routerLink('/main/pasajero');
      } else {
        this.utilsSvc.presentToast({
          message: 'No se pudo reconocer los datos de tu cuenta. Informa a soporte por favor.',
          duration: 5000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo cargar el tipo de usuario',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }
}
