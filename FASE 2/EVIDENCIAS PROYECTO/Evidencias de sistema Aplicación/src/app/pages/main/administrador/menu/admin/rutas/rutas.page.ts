import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

import { environment } from 'src/environments/environment';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
})
export class RutasPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  apiKey:string = environment.firebaseConfig.apiKey;
  map:GoogleMap;

  latitude:number;
  longitude:number;
  userMarker: any;
  userMarkerId: any;

  routePoints: { lat: number; lng: number }[] = [];
  currentPolyline: any;
  currentPolylineId: string | null = null; // ID de la polilínea actual

  markers = [
    {
      lat: -33.601034, lng: -70.673802 
      
    },
    {
      lat: -33.594130, lng: -70.697319
      
    }
  ];


  constructor() { }

  ngOnInit() {
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  backAdmin() {
    this.utilsSvc.routerLink('/main/administrador/admin');
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
            iconUrl: "../../../../assets/icon/icon_user2.png",
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
      iconUrl: "../../../../assets/icon/icon_user2.png",
     
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

  async addPointToRoute(event:any) {
    const lat = event.latitude;
    const lng = event.longitude;

    // Agrega el punto al array de puntos de la ruta
    this.routePoints.push({ lat, lng });
    

    // Dibuja la línea de la ruta en el mapa
    this.drawRoute();
  }

  async drawRoute() {
    // Si ya hay una polilínea dibujada, la eliminamos
    if (this.currentPolylineId) {
      await this.map.removePolylines([this.currentPolylineId]); // Elimina la polilínea anterior
      this.currentPolylineId = null; // Reinicia el ID
    }

    // Dibuja la nueva polilínea usando los puntos
    const polyline = await this.map.addPolylines([
      { 
        path: this.routePoints,
        strokeColor: '#1A1528',
        strokeOpacity: 1.0,
        strokeWeight: 5,
        geodesic: true,
        clickable: false,
        tag: 'route',
      }
    ]);

    // Guarda el ID de la nueva polilínea
    this.currentPolylineId = polyline[0];
  }

  removeLastPoint() {
    if (this.routePoints.length > 0) {
      this.routePoints.pop(); // Elimina el último punto
      this.drawRoute(); // Redibuja la ruta sin el último punto
    }
  }

  async clearRoute() {
    if (this.currentPolylineId) {
      await this.map.removePolylines([this.currentPolylineId]); // Elimina la polilínea actual
      this.currentPolylineId = null; // Reinicia el ID
    }
    this.routePoints = []; // Limpia la lista de puntos
    await this.drawRoute(); // Dibuja la ruta nuevamente (vacía)
  }

  
 
}