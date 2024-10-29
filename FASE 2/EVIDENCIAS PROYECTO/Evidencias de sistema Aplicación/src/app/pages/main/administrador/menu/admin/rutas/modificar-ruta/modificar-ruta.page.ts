import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

import { environment } from 'src/environments/environment';
import { GoogleMap } from '@capacitor/google-maps';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modificar-ruta',
  templateUrl: './modificar-ruta.page.html',
  styleUrls: ['./modificar-ruta.page.scss'],
})
export class ModificarRutaPage implements OnInit {
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
  currentPolyline: any;
  currentPolylineId: string | null = null; // ID de la polilínea actual

  ruta: any;
  constructor(private route: ActivatedRoute, private alertController: AlertController) { }

  async ngOnInit() {
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');

    // Obtener el ID de la URL
    await this.route.params.subscribe(async params => {
      const id = params['id'];
      console.log('ID recibido:', id);

      try {
        // Obtener el usuario con el ID desde Firebase
        const ruta_Obtenida = await this.firebaseSvc.getDocument(`ruta_central/${id}`);

        // Verificar si el usuario obtenido pertenece a la misma "central" y si es un chofer
        if (ruta_Obtenida && ruta_Obtenida['central'] === this.usuario.central) {
          this.ruta = ruta_Obtenida;
          await this.checkGeolocationPermission();
          if (!this.map) {
            await this.initMap();
          }
        } else {
          console.error('Error: El usuario no tiene los permisos necesarios o no pertenece a la misma central.');
          this.utilsSvc.presentToast({
            message: 'No tienes permiso para acceder a este usuario.',
            duration: 1500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        }
      } catch (error) {
        console.error('Error al obtener la central desde Firebase:', error);
        this.utilsSvc.presentToast({
          message: 'Error al obtener los datos del usuario.',
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      }
    });
  }
  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }
  backAdmin() {
    this.utilsSvc.routerLink('/main/administrador/admin/rutas/ver-rutas');
  }

  async ionViewDidLeave() {
    if (this.map) {
      await this.map.destroy();
      this.map = null;
    }
  }
  async initMap() {
    this.map = await GoogleMap.create({
      id: 'admin-modificar-map', // Identificador único para esta instancia del mapa
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
    await this.lineasRuta();

    this.map.setOnMapClickListener((event) => this.addPointToRoute(event));
  }
  
  async setMarkest() { // Configura otros marcadores

    const markers = [
      {
        coordinate: {
          lat: this.ruta.punto_inicio.lat,
          lng: this.ruta.punto_inicio.lng,
        },
        iconUrl: "../../../../assets/icon/icon_inicio.png",
      },
      {
        coordinate: {
          lat: this.ruta.punto_final.lat,
          lng: this.ruta.punto_final.lng,
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
  async addPointToRoute(event: any) {
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

  async lineasRuta() {
    console.log(this.ruta.coordenada_ruta);
    this.routePoints = []; // Limpia el array antes de llenarlo
    for (let linea in this.ruta.coordenada_ruta) {
      this.routePoints.push({ lat: this.ruta.coordenada_ruta[linea].lat, lng: this.ruta.coordenada_ruta[linea].lng });
    }
    await this.drawRoute(); // Dibuja la ruta al finalizar el bucle
  }

  removeLastPoint() {
    if (this.routePoints.length > 0) {
      this.routePoints.pop(); // Elimina el último punto
      this.drawRoute(); // Redibuja la ruta sin el último punto
    } else {
      console.log("No hay puntos para eliminar.");
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


  async guardarRuta() {
    const alert = await this.alertController.create({
      header: 'Guardar Modificaciones',
      message: '¿Seguro de guardar las modificaciones realizadas?.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: async (ruta) => {
            // Mostrar pantalla de carga
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {
              this.ruta.coordenada_ruta = this.routePoints;
              await this.firebaseSvc.updateDocument(`ruta_central/${this.ruta.id}`, { ...this.ruta });
              this.utilsSvc.routerLink('/main/administrador/admin/rutas/ver-rutas');

            } catch (error) {
              console.error('Error al crear la ruta:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear la ruta. Inténtalo de nuevo.',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline',
              });
            } finally {
              // Cerrar pantalla de carga
              loading.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }
}