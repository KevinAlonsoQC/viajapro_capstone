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
import { Vehiculo } from 'src/app/models/vehiculo';

@Component({
  selector: 'app-ver-ruta',
  templateUrl: './ver-ruta.page.html',
  styleUrls: ['./ver-ruta.page.scss'],
})
export class VerRutaPage implements OnInit {
  idRouter: string;
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  apiKey: 'AIzaSyC9L5m9leV5N2oY6gG2P075FJdMw5akOlk';
  map: GoogleMap;
  latitude: number;
  longitude: number;
  userMarkerId: any;
  routePoints: any = [];
  updateInterval: any; // ID del intervalo de actualización

  vehiculo: any;
  constructor(private paymentService: PaymentService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idRouter = params.get('id');
    });

    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });

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
    this.clearUpdateInterval();
    if (this.map) {
      await this.map.destroy();
      this.map = null;
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

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  backAdmin() {
    this.utilsSvc.routerLink('/main/chofer/en-ruta');
  }

  // Lógica para mapa
  async initMap() {
    this.map = await GoogleMap.create({
      id: 'chofer-map',
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
            iconUrl: "../../../../assets/icon/icono_vp.png",
            iconSize: { width: 25, height: 25 },
            iconAnchor: { x: 12.5, y: 12.5 } // Punto de anclaje en el centro inferior
          }]);

          this.userMarkerId = ids[0]; // Guarda el ID del nuevo marcador del usuario
          this.firebaseSvc.updateDocument(`vehiculo/${this.vehiculo[0].id}`, { coordenadas_vehiculo: { lat: latitude, lng: longitude } })
          console.log('Coordenadas Vehículo Actualizadas', latitude, longitude)
        } catch (error) {
          console.error('Error obteniendo la ubicación', error);
        }
      }, 5000); // Actualiza cada 15 segundos
    }
  }

  async setUserMarker() {
    const ids = await this.map.addMarkers([{
      coordinate: {
        lat: this.latitude,
        lng: this.longitude,
      },
      iconUrl: "../../../../assets/icon/icono_vp.png",
      iconSize: { width: 25, height: 25 },
      iconAnchor: { x: 12.5, y: 12.5 } // Punto de anclaje en el centro inferior
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
        iconSize: { width: 25, height: 25 },
        iconAnchor: { x: 12.5, y: 12.5 } // Punto de anclaje en el centro inferior
      },
      {
        coordinate: {
          lat: this.routePoints[0].punto_final.lat,
          lng: this.routePoints[0].punto_final.lng,
        },
        iconUrl: "../../../../assets/icon/icono_fin.png",
        iconSize: { width: 25, height: 25 },
        iconAnchor: { x: 12.5, y: 12.5 } // Punto de anclaje en el centro inferior
      },
    ];

    await this.map.addMarkers(markers); // Agrega los marcadores al mapa
    await this.centerMap(this.routePoints[0].punto_inicio.lat, this.routePoints[0].punto_inicio.lng); // Usa las coordenadas que prefieras

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
    const urlPath2 = 'vehiculo';

    try {
      const [ruta, veh] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any>
      ]);

      this.routePoints = ruta.filter(ruta => ruta.id == this.idRouter);
      this.vehiculo = veh.filter(veh => {
        return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
      });

      console.log('Vehículo Afiliado:', this.vehiculo[0].id);

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

  backRuta() {
    this.utilsSvc.routerLink(`/main/chofer/ver-ruta/${this.vehiculo[0].ruta_actual}`);
  }

  async centerMap(lat: number, lng: number) {
    if (this.map) {
      await this.map.setCamera({
        coordinate: {
          lat: lat,
          lng: lng
        },
        zoom: 15, // Puedes ajustar el nivel de zoom según lo que necesites
        animate: true // Opción para que la transición sea suave
      });
    }
  }
}
