import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PaymentService } from '../../../../services/payment.service';
// Importaciones para Google Maps
import { environment } from 'src/environments/environment';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  idRouter: string;
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  apiKey: string = environment.firebaseConfig.apiKey;
  map: GoogleMap;
  latitude: number;
  longitude: number;
  userMarkerId: any;
  routePoints: any = [];
  updateInterval: any; // ID del intervalo de actualización

  constructor(private paymentService: PaymentService, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idRouter = params.get('id');
    });

    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });

    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    await this.getData();
    await this.checkGeolocationPermission();
    if (!this.map) {
      await this.initMap();
    }
  }

  async ionViewDidLeave() {
    if (this.map) {
      await this.map.destroy();
      this.map = null;
    }
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

  startKhipuPayment() {
    const amountt = 900; // Monto del pago
    const currency = 'CLP'; // Monto del pago
    const subject = 'Prueba'; // Monto del pago
    const api_key = "49c65a51-5874-4471-beaa-a2891b385026";

    this.paymentService.createPayment(amountt, currency, subject, api_key).subscribe(
      (response) => {
        this.openExternalLink(response.payment_url);
      }
    );
  }

  openExternalLink(url: string) {
    window.open(url, '_blank');
  }

  // Lógica para mapa
  async initMap() {
    this.map = await GoogleMap.create({
      id: 'my-map',
      element: document.getElementById('map'),
      apiKey: this.apiKey,
      config: {
        center: {
          lat: this.latitude,
          lng: this.longitude,
        },
        zoom: 15,
        styles: [
          {
            "featureType": "all",
            "elementType": "labels",
            "stylers": [{ "visibility": "on" }]
          },
          {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "featureType": "transit",
            "stylers": [{ "visibility": "off" }]
          }
        ]
      },
    });

    await this.setMarkers();
    await this.setUserMarker();  // Marcador inicial del usuario
    this.startTrackingUserLocation();  // Comienza a rastrear la ubicación del usuario
    this.drawRoute();
  }

  async startTrackingUserLocation() {
    if (this.map) {
      // Establece un intervalo que actualiza la ubicación cada 5 segundos
      this.updateInterval = setInterval(async () => {
        try {
          const coordinates = await Geolocation.getCurrentPosition();
          const { latitude, longitude } = coordinates.coords;

          // Elimina solo el marcador del usuario antes de agregar uno nuevo
          if (this.userMarkerId) {
            await this.map.removeMarkers([this.userMarkerId]);
          }

          // Agrega un nuevo marcador en la nueva ubicación y guarda el ID del marcador
          const ids = await this.map.addMarkers([{
            coordinate: {
              lat: latitude,
              lng: longitude,
            },
            iconUrl: "../../../../assets/icon/user_icon.png",
            iconSize: { width: 30, height: 30 }
          }]);

          this.userMarkerId = ids[0]; // Guarda el ID del nuevo marcador del usuario
        } catch (error) {
          console.error('Error obteniendo la ubicación', error);
        }
      }, 5000); // Actualiza cada 5 segundos
    }
  }

  async setUserMarker() {
    const ids = await this.map.addMarkers([{
      coordinate: {
        lat: this.latitude,
        lng: this.longitude,
      },
      iconUrl: "../../../../assets/icon/user_icon.png",
      iconSize: { width: 30, height: 30 }
    }]);

    this.userMarkerId = ids[0]; // Guarda el ID del marcador para actualizarlo más tarde
  }

  async setMarkers() { // Configura otros marcadores
    const markers = [
      {
        coordinate: {
          lat: this.routePoints[0].punto_inicio.lat,
          lng: this.routePoints[0].punto_inicio.lng,
        },
        iconUrl: "../../../../assets/icon/icon_inicio.png",
      },
      {
        coordinate: {
          lat: this.routePoints[0].punto_final.lat,
          lng: this.routePoints[0].punto_final.lng,
        },
        iconUrl: "../../../../assets/icon/icono_fin.png",
      },
    ];

    await this.map.addMarkers(markers); // Agrega los marcadores al mapa
  }

  // Probar la localización en la web
  async checkGeolocationPermission() {
    return new Promise<void>((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            console.log('Permiso concedido');
            this.getLocation().then(() => resolve());
          } else if (result.state === 'prompt') {
            console.log('El permiso debe solicitarse');
            this.getLocation().then(() => resolve());
          } else if (result.state === 'denied') {
            console.log('Permiso denegado');
            reject('Permiso de geolocalización denegado');
          }

          result.onchange = () => {
            console.log(`El estado del permiso ha cambiado a: ${result.state}`);
          };
        });
      } else {
        console.log('Geolocalización no es soportada por este navegador');
        reject('Geolocalización no soportada');
      }
    });
  }

  getLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Ubicación obtenida:', position.coords.latitude, position.coords.longitude);
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          resolve();  // Resuelve la promesa cuando tienes las coordenadas
        },
        (error) => {
          console.error('Error obteniendo la ubicación', error);
          reject(error);
        }
      );
    });
  }

  drawRoute() {
    this.map.addPolylines([{
      path: this.routePoints[0].coordenada_ruta,
      strokeColor: '#1A1528',
      strokeOpacity: 1.0,
      strokeWeight: 5,
      geodesic: true,
      clickable: false,
      tag: 'route',
    }]);
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'ruta_central'; // Ruta de la colección de usuarios

    try {
      const [ruta] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>
      ]);

      this.routePoints = ruta.filter(ruta => ruta.id == this.idRouter);

      if (this.routePoints.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Visualizando Ruta',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No se pudo obtener la ruta :(',
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
}
