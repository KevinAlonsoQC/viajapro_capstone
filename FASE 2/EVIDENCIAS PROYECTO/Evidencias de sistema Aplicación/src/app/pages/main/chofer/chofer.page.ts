import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-chofer',
  templateUrl: './chofer.page.html',
  styleUrls: ['./chofer.page.scss'],
})
export class ChoferPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  vehiculos: any;
  constructor(private alertController: AlertController) { }


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
        for(let item in veh.usuario){
          if (veh.central === this.usuario.central && this.usuario.uid === veh.usuario[item] && veh.chofer_actual == '' && veh.en_ruta == false) {
            return true;  // Si encuentra coincidencia, lo incluye en el resultado del filtro
          }
        }
        return false;  // Si no encuentra coincidencias, lo excluye
      });
  
      if (this.vehiculos.length <= 0) {
        this.utilsSvc.presentToast({
          message: '¡No hay Vehículos Asignados para ti!',
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
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

  async entrarEnServicio() {
    await this.getData();
    const alert = await this.alertController.create({
      header: '¿En qué vehículos Comenzarás tu Servicio?',
      message: 'Si el vehículo que utilizas lo maneja +2 conductores y está en uso, no podrás utilizarlo..',
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
            await this.firebaseSvc.updateDocument(`vehiculo/${vehId}`, {...{en_ruta:true,  chofer_actual:this.usuario.uid}});
            await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, {...{en_ruta:true,  vehiculo_actual:vehId}});

            this.utilsSvc.routerLink('/main/chofer/en-ruta');
          },
        },
      ],
    });

    await alert.present();
  }

  verAsientos(){
    this.utilsSvc.routerLink('/main/chofer/asientos');
  }

  verRutas(){
    this.utilsSvc.routerLink('/main/chofer/en-ruta');
  }
}
