import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.page.html',
  styleUrls: ['./profile-menu.page.scss'],
})
export class ProfileMenuPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;
  constructor(private alertController: AlertController) { }


  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
  }

  async signOut() {
    if (this.usuario.tipo_usuario == '2') {
      const asientos = [true, true, true, true];
      for (let i = 0; i < asientos.length; i++) {
        const asientoKey = `asiento${i + 1}`;
        this.utilsSvc.saveInLocalStorage(asientoKey, true);
      }

      await this.firebaseSvc.updateDocument(`vehiculo/${this.usuario.vehiculo_actual}`, { ...{ en_ruta: false, chofer_actual: '', nombre_chofer: '', asientos_dispo_vehiculo: 4, ruta_actual: false, token: '', rut_chofer: '' } });
      await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ en_ruta: false, vehiculo_actual: '', isLoggedIn: false, lastActive: Date.now() } });
      this.usuario.en_ruta = false;
      this.usuario.vehiculo_actual = '';
      this.utilsSvc.saveInLocalStorage('usuario', this.usuario);
    }else{
      await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ isLoggedIn: false, lastActive: Date.now()} });
    }

    this.firebaseSvc.signOut();
  }

  backAdmin() {
    this.utilsSvc.routerLink('/main');
  }

  async cambiarClave() {
    // Preguntar si desea cambiar la imagen
    const confirmAlert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      message: `¿Seguro que deseas cambiar las credenciales de tu cuenta? Se enviará un correo a ${this.usuario.email}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí',
          role: 'confirm',
          handler: async () => {
            // Mostrar pantalla de carga
            const loading = await this.utilsSvc.loading();
            await loading.present();
            this.firebaseSvc.sendRecoveryEmail(this.usuario.email).then(res => {
              try {
                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: `Se ha enviado un correo a ${this.usuario.email} para que puedas reestablecer tu contraseña`,
                  duration: 3500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

              } catch (error) {
                console.error('Error al modificar el dato:', error);
                this.utilsSvc.presentToast({
                  message: 'Hubo un error al modificar el dato. Inténtalo de nuevo.',
                  duration: 1500,
                  color: 'danger',
                  position: 'middle',
                  icon: 'alert-circle-outline'
                });
              } finally {
                // Cerrar pantalla de carga
                loading.dismiss();
              }
            })
          }
        }]
    });

    await confirmAlert.present();
  }

}
