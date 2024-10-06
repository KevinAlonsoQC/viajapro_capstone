import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CentralColectivo } from 'src/app/models/central-colectivo';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.page.html',
  styleUrls: ['./conductores.page.scss'],
})
export class ConductoresPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  choferes!: any;
  central!: CentralColectivo;

  constructor(private router: Router, private alertController: AlertController) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    await this.getChoferes();
  }

  async getChoferes() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const usuarioPath = 'usuario'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [usuarios] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(usuarioPath) as Promise<any[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.choferes = usuarios.filter(usuario =>
        usuario.central == this.usuario.central && usuario.tipo_usuario == '2'
      );

      if (this.choferes.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Conductores Cargados con Éxito',
          duration: 3500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No hay choferes disponibles',
          duration: 3500,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 3500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  modificarConductor(id: string) {
    this.router.navigate(['/main/administrador/admin/conductores/modificar-conductor', id]);
  }

  crearConductor() {
    this.utilsSvc.routerLink('/main/administrador/admin/conductores/crear-conductor');
  }

  async eliminarConductor(id: string, rut: string) {
    const alert = await this.alertController.create({
      header: '¿Seguro de Eliminar al Conductor?',
      subHeader: `Se eliminará al Conductor con RUT: ${rut}`,
      message: 'Recuerda que si aceptas, esta opción es irreversible.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.utilsSvc.presentToast({
              message: 'Cancelaste la acción',
              duration: 3500,
              color: 'primary',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
          },
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {
              // Elimina el documento de Firebase
              await this.firebaseSvc.deleteDocument(`usuario/${id}`);

              this.utilsSvc.presentToast({
                message: `Has eliminado al Conductor con RUT ${rut}`,
                duration: 3500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });
              
              await this.getChoferes();
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al eliminar al Conductor con RUT ${rut}. Inténtalo de nuevo.`,
                duration: 3500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline',
              });
            } finally {
              loading.dismiss();
            }
          }
        },
      ],
    });

    await alert.present();
  }
}
