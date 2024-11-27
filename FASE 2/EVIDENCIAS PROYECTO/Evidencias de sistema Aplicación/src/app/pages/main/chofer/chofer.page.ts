import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-chofer',
  templateUrl: './chofer.page.html',
  styleUrls: ['./chofer.page.scss'],
})
export class ChoferPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario: User;
  vehiculos: any;
  vehRuta: any;
  asientos: boolean[];
  updateInterval: any; // ID del intervalo de actualización
  ruta_actual: any;

  isMobile: boolean;
  constructor(private alertController: AlertController, private sessionService: SessionService) { }


  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    await this.getInfoAndTipoCuenta();
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

    try {
      // Ejecutar ambas promesas en paralelo
      const [callback] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any>,
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.vehiculos = callback.filter(veh => {
        // Recorre la lista de usuarios asociados al vehículo
        for (let item in veh.usuario) {
          if (veh.central === this.usuario.central && this.usuario.uid === veh.usuario[item] && veh.chofer_actual == '' && veh.en_ruta == false) {
            return true;  // Si encuentra coincidencia, lo incluye en el resultado del filtro
          }
        }
        return false;  // Si no encuentra coincidencias, lo excluye
      });

      if (this.usuario.en_ruta) {
        this.vehRuta = callback.filter(veh => {
          return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
        });
        console.log(this.vehRuta)
        await this.startTrackingUserLocation();
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

  async getInfoAndTipoCuenta() {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const tipo_cuenta = this.usuario.tipo_usuario;

      if (tipo_cuenta == "0") {
        this.utilsSvc.routerLink('/main/owner');
      } else if (tipo_cuenta == "1") {
                this.utilsSvc.routerLink('/main/administrador');
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

  async entrarEnServicio() {
    await this.getData();
    const alert = await this.alertController.create({
      header: '¿En qué vehículos Comenzarás tu Servicio?',
      message: 'Si el vehículo que utilizas lo maneja +2 conductores y está en uso, no podrás utilizarlo. También, una vez estés en servicio, los pasajeros y otros choferes podrán ver tu ubicación actual.',
      inputs: this.vehiculos.map(veh => ({
        type: 'radio',
        label: `Patente: ${veh.patente_vehiculo} | Modelo: ${veh.nombre_modelo}`,
        value: veh.id,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: async (vehId) => {
            if (vehId == "") {
              this.utilsSvc.presentToast({
                message: 'Debes seleccionar una opción',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }
            await this.firebaseSvc.updateDocument(`vehiculo/${vehId}`, { ...{ en_ruta: true, chofer_actual: this.usuario.uid, nombre_chofer: this.usuario.name, token: this.usuario.token, rut_chofer: this.usuario.rut_usuario } });
            await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ en_ruta: true, vehiculo_actual: vehId} });
            this.usuario.en_ruta = true;
            this.usuario.vehiculo_actual = vehId;
            this.utilsSvc.saveInLocalStorage('usuario', this.usuario);
            const [veh] = await Promise.all([
              this.firebaseSvc.getCollectionDocuments('vehiculo') as Promise<any>
            ]);
            this.vehRuta = veh.filter(veh => {
              return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
            });
            this.ruta_actual = true;

            console.log('Vehículo Afiliado:', this.vehRuta[0].id);

            await this.startTrackingUserLocation();
            this.utilsSvc.routerLink('/main/chofer/en-ruta');
          },
        },
      ],
    });

    await alert.present();
  }

  async salirServicio() {
    const alert = await this.alertController.create({
      header: '¿Seguro de acabar tu ruta?',
      message: '¿Estás seguro de finalizar tu turno?, procura no tener clientes en tu vehículo',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();
            try {
              const [veh] = await Promise.all([
                this.firebaseSvc.getCollectionDocuments('vehiculo') as Promise<any>
              ]);

              this.vehRuta = veh.filter(veh => {
                return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
              });

              console.log('Vehículo Afiliado:', this.vehRuta[0].id);
              this.asientos = [true, true, true, true]; // Puedes ajustar según la cantidad de asientos
              for (let i = 0; i < this.asientos.length; i++) {
                const asientoKey = `asiento${i + 1}`;
                this.utilsSvc.saveInLocalStorage(asientoKey, true);
              }

              const disponibles = this.asientos.filter(asiento => asiento).length;
              await this.firebaseSvc.updateDocument(`vehiculo/${this.vehRuta[0].id}`, { ...{ en_ruta: false, chofer_actual: '',  nombre_chofer: '',asientos_dispo_vehiculo: disponibles, ruta_actual: false, token: '', rut_chofer: '' } });
              await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ en_ruta: false, vehiculo_actual: '' } });
              this.usuario.en_ruta = false;
              this.usuario.vehiculo_actual = '';
              this.utilsSvc.saveInLocalStorage('usuario', this.usuario);
              this.ruta_actual = false;
              this.clearUpdateInterval();
              this.utilsSvc.routerLink('/main/chofer');

            } catch (error) {
              console.error(error)
            } finally {
              loading.dismiss();
            }

          },
        },
      ],
    });

    await alert.present();
  }

  verAsientos() {
    this.utilsSvc.routerLink('/main/chofer/asientos');
  }

  verRutas() {
    this.utilsSvc.routerLink('/main/chofer/en-ruta');
  }

  async backRuta() {
    const [veh] = await Promise.all([
      this.firebaseSvc.getCollectionDocuments('vehiculo') as Promise<any>
    ]);

    this.vehRuta = veh.filter(veh => {
      return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
    });

    if (this.vehRuta[0].ruta_actual) {
      this.utilsSvc.routerLink(`/main/chofer/ver-ruta/${this.vehRuta[0].ruta_actual}`);
    } else {
      this.utilsSvc.routerLink('/main/chofer/en-ruta');
    }
  }

  verFinanzas(){
    this.utilsSvc.routerLink('/main/chofer/ver-finanzas');
  }

  verVehiculos(){
    this.utilsSvc.routerLink('/main/chofer/ver-vehiculos');
  }
}
