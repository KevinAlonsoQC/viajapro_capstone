import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PaymentService } from '../../../../services/payment.service';
// Importaciones para Google Maps
import { environment } from 'src/environments/environment';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { ActivatedRoute } from '@angular/router';

//Kiphu 
import { Khipu, KhipuColors, KhipuOptions, KhipuResult, StartOperationOptions } from "capacitor-khipu"

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  isModalOpen = false;

  idRouter: string;
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;
  vehiculos: any;
  carDetail: any;

  apiKey: string = environment.firebaseConfig.apiKey;
  map: GoogleMap;
  latitude: number;
  longitude: number;
  userMarkerId: any;
  routePoints: any = [];
  updateInterval: any; // ID del intervalo de actualización
  updateData: any; //ID del intervalo de actualización de la data.

  tarifaDiurna: boolean;
  tarifaNocturna: boolean;

  mesajeKhipu: any;
  mesajeKhipuModal = false;
  mesajeKhipuModalError = false;

  tarifa: number;
  constructor(private paymentService: PaymentService, private route: ActivatedRoute, private alertController: AlertController) { }

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
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'ruta_central'; // Ruta de la colección de usuarios
    const urlPath2 = 'vehiculo'; // Ruta de la colección de usuarios

    try {
      const [ruta, veh] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any[]>
      ]);

      this.routePoints = ruta.filter(ruta => ruta.id == this.idRouter);
      this.vehiculos = veh.filter(veh => {
        return veh.ruta_actual == this.idRouter && veh.chofer_actual != '' && veh.en_ruta == true
      });

      // Obtén la hora actual
      const currentDate = new Date();
      const currentHours = currentDate.getHours();
      // Verifica si la hora actual es 21:00
      if (currentHours >= 21 || currentHours <= 6) {
        this.tarifaDiurna = false;
        this.tarifaNocturna = true;

        this.tarifa = this.routePoints[0].tarifa_nocturna;
      } else {
        this.tarifaDiurna = true;
        this.tarifaNocturna = false;

        this.tarifa = this.routePoints[0].tarifa_diurna;
      }

      if (this.vehiculos.length <= 0) {
        this.utilsSvc.presentToast({
          message: '¡No hay choferes en servicio en esta ruta!',
          duration: 4000,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

      if (this.routePoints.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Actualizando Ruta',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No se pudo obtener la ruta :(',
          duration: 1500,
          color: 'danger',
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

    if (this.updateData) {
      clearInterval(this.updateData);
    }
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  startKhipuPayment(token: string) { //Inicia el pago en Khipu
    console.log('Token de Pago del Vehículo: ', token)
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const amountt = Number(this.tarifa); // Monto del pago
    const currency = 'CLP'; // Monto del pago
    const subject = `Pasaje ViajaPro - ${currentHours}:${currentMinutes}`;

    //Dejé tu API de Pago porque aún no existen un token de pago para el chofer!
    //Para poner la api de pago del chofer solo usa el que obtiene la función.

    const api_key = "49c65a51-5874-4471-beaa-a2891b385026";
    this.paymentService.createPayment(amountt, currency, subject, api_key).subscribe(
      (response) => {
        this.iniciarOperacionKhipu(response.payment_id, api_key);
      }
    );
  }

  // Lógica para mapa
  async initMap() {
    this.map = await GoogleMap.create({
      id: 'pasajero-map',
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
    await this.setMarkersCars();
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
          this.latitude = latitude;
          this.longitude = longitude;

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
            iconSize: { width: 25, height: 25 },
            iconAnchor: { x: 12.5, y: 12.5 } // Punto de anclaje en el centro inferior
          }]);

          this.userMarkerId = ids[0]; // Guarda el ID del nuevo marcador del usuario
        } catch (error) {
          console.error('Error obteniendo la ubicación', error);
        }
      }, 15000); // Actualiza cada 5 segundos
    }
  }

  async setUserMarker() {
    const ids = await this.map.addMarkers([{
      coordinate: {
        lat: this.latitude,
        lng: this.longitude,
      },
      iconUrl: "../../../../assets/icon/user_icon.png",
      iconSize: { width: 30, height: 30 },
      iconAnchor: { x: 15, y: 15 }
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
        iconAnchor: { x: 12.5, y: 12.5 }, // Punto de anclaje en el centro inferior
        title: "Central",
      },
      {
        coordinate: {
          lat: this.routePoints[0].punto_final.lat,
          lng: this.routePoints[0].punto_final.lng,
        },
        iconUrl: "../../../../assets/icon/icono_fin.png",
        iconSize: { width: 30, height: 30 },
        iconAnchor: { x: 15, y: 15 }, // Punto de anclaje en el centro inferior
        title: "Retorno",
      },
    ];

    await this.map.addMarkers(markers); // Agrega los marcadores al mapa
    await this.centerMap(this.routePoints[0].punto_inicio.lat, this.routePoints[0].punto_inicio.lng); // Usa las coordenadas que prefieras

  }

  async setMarkersCars() { // Marcadores de los autos
    if (this.vehiculos.length > 0) {
      for (let veh of this.vehiculos) {
        // Verificar si el marcador ya existe
        if (!veh.markerId) {
          const id = await this.map.addMarker({
            coordinate: {
              lat: veh.coordenadas_vehiculo.lat,
              lng: veh.coordenadas_vehiculo.lng,
            },
            iconUrl: "../../../../assets/icon/icon_car.png",
            iconSize: { width: 30, height: 35 },
            iconAnchor: { x: 15, y: 35 } // Punto de anclaje en el centro inferior
          });
          veh.markerId = id;

          // Calcula la distancia a cada vehículo
          if (this.vehiculos && this.vehiculos.length > 0) {
            for (let veh of this.vehiculos) {
              const vehicleLat = veh.coordenadas_vehiculo.lat;
              const vehicleLng = veh.coordenadas_vehiculo.lng;
              veh.distance = Math.trunc(this.calculateDistance(this.latitude, this.longitude, vehicleLat, vehicleLng));
              console.log(`Distancia al vehículo ${veh.id}: ${veh.distance} metros`);

              // Velocidad en metros por segundo (30 km/h)
              const speed = 30 * 1000 / 3600; // 30 km/h a m/s
              const timeInSeconds = veh.distance / speed + 60; // Tiempo en segundos
              const arrivalTime = new Date(Date.now() + timeInSeconds * 1000); // Hora de llegada

              // Formato de la hora de llegada
              const options: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false, // Cambia a true si deseas el formato de 12 horas
              };

              veh.calculo = arrivalTime.toLocaleTimeString([], options); // Retorna la hora de llegada en formato "HH:MM"
            }
          }
        }
      }
    }

    this.map.setOnMarkerClickListener(marker => {
      // Identificar el marcador al que se hizo clic
      const exist = this.vehiculos.find(car => car.markerId === marker.markerId);
      if (exist) {
        this.showDetailCar(exist);
      }
    });
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
    this.updateData = setInterval(async () => {
      const loading = await this.utilsSvc.loading();
      await loading.present();
      const urlPath = 'ruta_central'; // Ruta de la colección de usuarios
      const urlPath2 = 'vehiculo'; // Ruta de la colección de usuarios

      try {
        this.isModalOpen = false;
        const markerIdsToRemove = this.vehiculos.map(veh => veh.markerId).filter(id => id != null);
        if (markerIdsToRemove.length > 0) {
          await this.map.removeMarkers(markerIdsToRemove); // Elimina los marcadores existentes
        }

        const [ruta, veh] = await Promise.all([
          this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>,
          this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any[]>
        ]);

        this.routePoints = ruta.filter(ruta => ruta.id == this.idRouter);
        this.vehiculos = veh.filter(veh => {
          return veh.ruta_actual == this.idRouter && veh.chofer_actual != '' && veh.en_ruta == true
        });
        await this.setMarkersCars();

        // Obtén la hora actual
        const currentDate = new Date();
        const currentHours = currentDate.getHours();
        // Verifica si la hora actual es 21:00
        if (currentHours >= 21 || currentHours <= 6) {
          this.tarifaDiurna = false;
          this.tarifaNocturna = true;

          this.tarifa = this.routePoints[0].tarifa_nocturna;
        } else {
          this.tarifaDiurna = true;
          this.tarifaNocturna = false;

          this.tarifa = this.routePoints[0].tarifa_diurna;
        }

        if (this.vehiculos.length <= 0) {
          this.utilsSvc.presentToast({
            message: '¡No hay choferes en servicio en esta ruta!',
            duration: 4000,
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
    }, 30000); // Actualiza cada 30 segundos
  }

  showDetailCar(car: any) {
    this.carDetail = {
      id: car.id,
      id_chofer: car.chofer_actual,
      nombreChofer: car.nombre_chofer,
      patente: car.patente_vehiculo,
      modelo: car.nombre_modelo,
      distancia: car.distance,
      calculo: car.calculo,
      asientos: car.asientos_dispo_vehiculo,
      token: car.token
    }
    this.isModalOpen = true;
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


  async iniciarOperacionKhipu(payment_id: string, api_key: string) {
    try {
      const result: KhipuResult = await Khipu.startOperation({
        operationId: payment_id,
        options: {
          title: '<Title to display in the payment process>', // Título para la barra superior durante el proceso de pago.
          titleImageUrl: '<Image to display centered in the topbar>', // URL de la imagen para mostrar en la barra superior.
          locale: 'es_CL', // Configuración regional para el idioma de la interfaz.
          theme: 'light', // El tema de la interfaz: 'dark', 'light' o 'system'.
          skipExitPage: true, // Omite la página de salida al final del proceso de pago si es verdadero.
          showFooter: true, // Muestra un mensaje en la parte inferior con el logo de Khipu.
          colors: {
            lightTopBarContainer: '<colorHex>',
            lightOnTopBarContainer: '<colorHex>',
            lightPrimary: '<colorHex>',
            lightOnPrimary: '<colorHex>',
            lightBackground: '<colorHex>',
            lightOnBackground: '<colorHex>',
            darkTopBarContainer: '<colorHex>',
            darkOnTopBarContainer: '<colorHex>',
            darkPrimary: '<colorHex>',
            darkOnPrimary: '<colorHex>',
            darkBackground: '<colorHex>',
            darkOnBackground: '<colorHex>',
          } as KhipuColors,
        } as KhipuOptions,
      } as StartOperationOptions);

      // Manejo de la respuesta de la operación
      if (result.result == 'OK') {
        console.log('ID DE PAGO: ', result.operationId);
        const loading = await this.utilsSvc.loading();
        await loading.present(); // Mostrar el loading

        try {
          // Llamar a getPayment cada 10 segundos para obtener el comprobante
          let attemptCount = 0;
          const maxAttempts = 6; // 1 minuto = 60 segundos / 10 segundos = 6 intentos
          const interval = setInterval(() => {
            this.paymentService.getPayment(api_key, result.operationId).subscribe(
              (response) => {
                console.log('Obteniendo URL de pago:', response);

                // Verificar si el comprobante fue obtenido
                if (response.receipt_url && response.receipt_url !== "") {
                  clearInterval(interval); // Detener el intervalo
                  const img = '../../../../../assets/comprobado.png';
                  this.mesajeKhipu = {
                    titulo: '¡Listo, Pago realizado!',
                    mensaje: 'Eviaremos el comprobante de pago a tu correo',
                    img: img,
                    comprobante: response.receipt_url
                  };
                  this.mesajeKhipuModal = true;
                  loading.dismiss(); // Ocultar el loading cuando se obtiene el comprobante
                }
              },
              (error) => {
                console.error('Error al obtener el comprobante del pago:', error);
              }
            );

            attemptCount++;
            if (attemptCount >= maxAttempts) {
              clearInterval(interval); // Detener el intervalo después de 1 minuto
              this.mesajeKhipu = {
                titulo: 'Error al obtener el comprobante',
                mensaje: 'No se pudo obtener el comprobante de pago. Intenta nuevamente.',
                img: '../../../../../assets/rechazado.png'
              };
              this.mesajeKhipuModalError = true;
              loading.dismiss(); // Ocultar el loading si los intentos se agotaron
            }
          }, 10000); // Intervalo de 10 segundos
        } catch (error) {
          console.error('Error en obtener los datos', error);
          loading.dismiss(); // Asegurarse de que el loading se cierre en caso de error
        }
      }

      if (result.result != 'OK') {
        console.log('Mensaje de Khipu: ', result.exitMessage);
        const img = '../../../../../assets/rechazado.png';
        this.mesajeKhipu = {
          titulo: `¡Upsi! Algo ocurrió [Trans. ${result.operationId}]`,
          mensaje: 'No se pudo realizar el pago. Vuelve a intentarlo.',
          img: img
        };
        this.mesajeKhipuModalError = true;
      }
    } catch (error) {
      console.error('¡¡Error al iniciar la operación de pago con Khipu!!:', error);
    }
  }

  cerrarModal() {
    this.mesajeKhipuModal = false;
  }
}