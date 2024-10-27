import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PaymentService } from '../../../services/payment.service';
//importaciones para Google Maps
import { environment } from 'src/environments/environment';
import { GoogleMap } from '@capacitor/google-maps';
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

  apiKey: string = environment.firebaseConfig.apiKey;
  map: GoogleMap;

  latitude: number;
  longitude: number;
  userMarker: any;
  userMarkerId: any;

  routePoints: { lat: number; lng: number }[] = [];

  markers = [
    {
      lat: -33.601034, lng: -70.673802

    },
    {
      lat: -33.594130, lng: -70.697319

    }
  ];


  constructor(private paymentService: PaymentService) {

  }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });

    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');
    await this.getInfoAndTipoCuenta();


  }

  async ionViewWillEnter() {
    await this.checkGeolocationPermission();
    if (!this.map) {
      await this.initMap();
    }
  }

  ionViewDidLeave() {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
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

  signOut() {
    this.firebaseSvc.signOut();
  }

  startKhipuPayment() {
    const amountt = 900; // Monto del pago
    const currency = 'CLP'; // Monto del pago
    const subject = 'Prueba'; // Monto del pago

    const api_key = "49c65a51-5874-4471-beaa-a2891b385026"

    this.paymentService.createPayment(amountt, currency, subject, api_key).subscribe(
      (response) => {
        this.openExternalLink(response.payment_url)

      }
    )

  }

  openExternalLink(url: string) {
    window.open(url, '_blank');
  }

  // Logica para mapa
  async initMap() {
    this.map = await GoogleMap.create({
      id: 'my-map', // Identificador único para esta instancia del mapa
      element: document.getElementById('map'), // Referencia al elemento del mapa
      apiKey: this.apiKey, // Tu clave de API de Google Maps
      config: {
        center: {
          lat: this.latitude,
          lng: this.longitude,
        },
        zoom: 15,
        styles: [ // Estilos para ocultar locales y etiquetas
          {
            "featureType": "all",
            "elementType": "labels",
            "stylers": [
              { "visibility": "on" }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              { "visibility": "off" }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              { "visibility": "off" }
            ]
          }
        ]
      },
    });

    // Inicializa los marcadores
    await this.setMarkest();
    await this.setUserMarker();  // Marcador inicial del usuario

    this.startTrackingUserLocation();  // Comienza a rastrear la ubicación del usuario

    this.map.setOnMapClickListener((event) => this.addPointToRoute(event));

  }

  async startTrackingUserLocation() {
    const updateLocation = async () => {
      try {
        const coordinates = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = coordinates.coords;

        // Verificar si el mapa está inicializado
        if (this.map) {
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
            iconSize: { width: 30, height: 30 }  // Ajusta el tamaño de la imagen acá tio cristian, se verá en el mapa.
          }]);

          this.userMarkerId = ids[0]; // Guarda el ID del nuevo marcador del usuario
        } else {
          console.error('El mapa no está disponible en este momento.');
        }

        // Llama a la función de actualización de nuevo después de un intervalo
        setTimeout(updateLocation, 5000); // Actualiza cada 5 segundos
      } catch (error) {
        console.error('Error obteniendo la ubicación', error);
      }
    };

    updateLocation(); // Inicia el seguimiento
  }

  async setUserMarker() {
    // Inicializa el marcador del usuario en una posición por defecto
    const ids = await this.map.addMarkers([{
      coordinate: {
        lat: this.latitude,
        lng: this.longitude,
      },
      iconUrl: "../../../../assets/icon/user_icon.png",
      iconSize: { width: 30, height: 30 }  // Ajusta el tamaño de la imagen acá tio cristian.

    }]);

    this.userMarkerId = ids[0]; // Guarda el ID del marcador para actualizarlo más tarde
  }

  async setMarkest() { // Configura otros marcadores

    const markers = [
      {
        coordinate: {
          lat: -33.601034,
          lng: -70.673802,
        },
        iconUrl: "../../../../assets/icon/icon_inicio.png",
      },
      {
        coordinate: {
          lat: -33.594130,
          lng: -70.697319,
        },
        iconUrl: "../../../../assets/icon/icono_fin.png",
      },
    ];

    await this.map.addMarkers(markers); // Agrega los marcadores al mapa
  }

  // Probar la localización en la web
  async checkGeolocationPermission() {
    return new Promise<void>((resolve, reject) => {
      // Comprueba si el navegador soporta geolocalización
      if ('geolocation' in navigator) {
        // Usa Permissions API para verificar el estado de la geolocalización
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            console.log('Permiso concedido');
            this.getLocation().then(() => resolve()); // Llama a getLocation y espera a que obtenga las coordenadas
          } else if (result.state === 'prompt') {
            console.log('El permiso debe solicitarse');
            this.getLocation().then(() => resolve()); // Pide la ubicación y espera las coordenadas
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

  async addPointToRoute(event: any) {
    const lat = event.latitude;
    const lng = event.longitude;

    // Agrega el punto al array de puntos de la ruta
    this.routePoints.push({ lat, lng });

    // Dibuja un marcador en el punto seleccionado
    await this.map.addMarker({
      coordinate: event,
      title: `Punto ${this.routePoints.length}`,
    });

    // Dibuja la línea de la ruta en el mapa
    this.drawRoute();
  }

  drawRoute() {

    let smoothRoutePoints: { lat: number, lng: number }[] = [];

    // Interpolación entre cada punto
    for (let i = 0; i < this.routePoints.length - 1; i++) {
      const interpolatedPoints = this.interpolatePoints(this.routePoints[i], this.routePoints[i + 1], 10); // Ajusta el número de pasos
      smoothRoutePoints = smoothRoutePoints.concat(interpolatedPoints);
    }

    console.log(this.routePoints)
    this.map.addPolylines([
      {
        path: this.routePoints,
        strokeColor: '#1A1528',
        strokeOpacity: 1.0,
        strokeWeight: 5,
        geodesic: true,
        clickable: false,
        tag: 'route',

      }

    ])


  }

  interpolatePoints(pointA: { lat: number, lng: number }, pointB: { lat: number, lng: number }, steps: number) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const lat = pointA.lat + (pointB.lat - pointA.lat) * (i / steps);
      const lng = pointA.lng + (pointB.lng - pointA.lng) * (i / steps);
      points.push({ lat, lng });
    }
    return points;
  }


}
