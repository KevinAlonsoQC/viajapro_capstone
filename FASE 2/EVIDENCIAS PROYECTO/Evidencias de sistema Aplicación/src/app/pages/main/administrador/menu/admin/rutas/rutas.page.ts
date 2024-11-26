import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

import { environment } from 'src/environments/environment';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
})
export class RutasPage implements OnInit {
  private uniqueId = '';

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  latitude: number;
  longitude: number;
  userMarker: any;
  userMarkerId: any;

  routePoints: { lat: number; lng: number }[] = [];
  currentPolyline: any;
  currentPolylineId: string | null = null; // ID de la polilínea actual

  marcandoInicio = false; //esto manejará si el admin presiona el botón que dejé en el html, de lo contrario, trazará las líneas
  marcandoFinal = false; //lo mismo que la variable marcandoInicio, pero para el botón final.

  PuntoInicio = false; //esto marcará cuando ya exista el punto escogido
  PuntoFinal = false; //lo mismo que la variable puntoinicio

  coordenadaInicio: any;
  coordenadaFinal: any;

  @ViewChild('map')
  mapRef: ElementRef<HTMLElement>;
  map: GoogleMap;
  apiKey: string = environment.firebaseConfig.apiKey;
  constructor(private alertController: AlertController) { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  backAdmin() {
    this.utilsSvc.routerLink('/main/administrador/admin/rutas/ver-rutas');
  }

  async ionViewWillEnter() {
    await this.getLocation();
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
      id: 'admin-map', // Identificador único para esta instancia del mapa
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

    this.map.setOnMapClickListener((event) => this.addPointToRoute(event));
  }

  async marcarInicio() {
    if (!this.PuntoInicio) {
      if (!this.marcandoInicio) {
        this.marcandoInicio = true;
        this.marcandoFinal = false;
        this.utilsSvc.presentToast({
          message: '¡Presiona en el mapa el Punto de Inicio!',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } else {
        this.marcandoInicio = false;
        this.utilsSvc.presentToast({
          message: '¡Cancelaste la acción de escoger el Punto de Inicio!',
          duration: 3500,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }
    } else {
      const confirmAlert = await this.alertController.create({
        header: 'Ya tienes un Punto de Inicio, ¿quieres eliminarlo?',
        message: '¡Si lo eliminas, se borrará todo el trazado y los puntos en el mapa!',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Sí',
            role: 'confirm',
            handler: async () => {
              await this.clearAllRoute();
              this.utilsSvc.presentToast({
                message: '¡Has eliminado toda la ruta con éxito!',
                duration: 3500,
                color: 'warning',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              this.PuntoFinal = false;
              this.PuntoInicio = false;
              this.marcandoFinal = false;
              this.marcandoInicio = false;
            }
          }]
      });

      await confirmAlert.present();
    }
  }

  async marcarFinal() {
    if (!this.PuntoFinal) {
      if (!this.marcandoFinal) {
        this.marcandoFinal = true;
        this.marcandoInicio = false;
        this.utilsSvc.presentToast({
          message: '¡Presiona en el mapa el Punto Final!',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } else {
        this.marcandoFinal = false;
        this.utilsSvc.presentToast({
          message: '¡Cancelaste la acción de escoger el Punto Final!',
          duration: 3500,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }
    } else {
      const confirmAlert = await this.alertController.create({
        header: 'Ya tienes un Punto Final, ¿quieres eliminarlo?',
        message: '¡Si lo eliminas, se borrará todo el trazado y los puntos en el mapa!',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Sí',
            role: 'confirm',
            handler: async () => {
              await this.clearAllRoute();
              this.utilsSvc.presentToast({
                message: '¡Has eliminado toda la ruta con éxito!',
                duration: 3500,
                color: 'warning',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              this.PuntoFinal = false;
              this.PuntoInicio = false;
              this.marcandoFinal = false;
              this.marcandoInicio = false;
            }
          }]
      });

      await confirmAlert.present();
    }
  }

  async getLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = coordinates.coords;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  async addPointToRoute(event: any) {
    if (this.PuntoInicio && this.PuntoFinal) {
      const lat = event.latitude;
      const lng = event.longitude;

      // Agrega el punto al array de puntos de la ruta
      this.routePoints.push({ lat, lng });

      // Dibuja la línea de la ruta en el mapa
      this.drawRoute();
    } else {

      if (this.marcandoInicio && !this.marcandoFinal) {
        const lat = event.latitude;
        const lng = event.longitude;
        this.routePoints.push({ lat, lng });
        this.coordenadaInicio = { lat, lng };
        const markers = [
          {
            coordinate: {
              lat: event.latitude,
              lng: event.longitude,
            },
            iconUrl: "https://i.imgur.com/W7tYbxC.png",
            iconSize: { width: 25, height: 25 },
            iconAnchor: { x: 12.5, y: 12.5 } // Punto de anclaje en el centro inferior
          }
        ]
        await this.map.addMarkers(markers); // Agregará el punto de inicio
        this.marcandoInicio = false;
        this.PuntoInicio = true;
        return;
      }

      if (!this.marcandoInicio && this.marcandoFinal) {
        const lat = event.latitude;
        const lng = event.longitude;
        this.routePoints.push({ lat, lng });
        this.coordenadaFinal = { lat, lng };
        const markers = [
          {
            coordinate: {
              lat: event.latitude,
              lng: event.longitude,
            },
            iconUrl: "https://i.imgur.com/08sjVf4.png",
            iconSize: { width: 25, height: 25 },
            iconAnchor: { x: 12.5, y: 12.5 } // Punto de anclaje en el centro inferior
          }
        ]
        await this.map.addMarkers(markers); // Agregará el punto de inicio
        this.marcandoFinal = false;
        this.PuntoFinal = true;
        return;
      }

      this.utilsSvc.presentToast({
        message: 'Debes poner un punto de inicio y final para trazar líneas de la ruta',
        duration: 1500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }

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

  async clearAllRoute() { //esto eliminará todo el trazado y los puntos
    await this.clearRoute();
    await this.initMap();
    console.log('¡Eliminado TODO!')
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
    if (this.PuntoFinal && this.PuntoInicio && !this.marcandoFinal && !this.marcandoInicio && this.routePoints.length > 0) {
      const alert = await this.alertController.create({
        header: 'Agregando Nueva Ruta',
        message: 'Ingresa el Nombre de la Ruta.',
        inputs: [
          {
            name: 'nombre_ruta',
            type: 'text',
            min: 3,
            max: 50,
            placeholder: 'Nombre de la Ruta',
          },
          {
            name: 'tarifa_diurna',
            type: 'number',
            min: 1,
            max: 9999,
            placeholder: 'Tarifa Diurna de Ruta',
          },
          {
            name: 'tarifa_nocturna',
            type: 'number',
            min: 1,
            max: 9999,
            placeholder: 'Tarifa Nocturna de Ruta',
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Agregar',
            role: 'confirm',
            handler: async (ruta) => {
              if (ruta.nombre_ruta == "") {
                this.utilsSvc.presentToast({
                  message: 'Debes agregar un nombre a la Ruta',
                  duration: 1500,
                  color: 'danger',
                  position: 'middle',
                  icon: 'alert-circle-outline'
                });
                return;
              }
              // Mostrar pantalla de carga
              const loading = await this.utilsSvc.loading();
              await loading.present();

              try {
                // Generar un UID único
                this.uniqueId = uuidv4();

                const datoNuevo = {
                  id: this.uniqueId,
                  central: this.usuario.central,
                  nombre_ruta: ruta.nombre_ruta,
                  coordenada_ruta: this.routePoints,
                  punto_inicio: this.coordenadaInicio,
                  punto_final: this.coordenadaFinal,
                  tarifa_diurna: ruta.tarifa_diurna,
                  tarifa_nocturna: ruta.tarifa_nocturna,
                  estado: true,
                }
                await this.firebaseSvc.addDocumentWithId('ruta_central', datoNuevo, this.uniqueId);
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
    } else {
      this.utilsSvc.presentToast({
        message: '¡Añade un punto de inicio, final y traza líneas para guardar!.',
        duration: 3500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }
}