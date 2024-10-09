import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CentralColectivo } from 'src/app/models/central-colectivo';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.page.html',
  styleUrls: ['./bancos.page.scss'],
})
export class BancosPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  bancos!: any;
  public imgDefault: 'data:image/png;base64,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';
  private uniqueId = '';

  constructor(private router: Router, private alertController: AlertController) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    await this.getBancos();
  }


  async getBancos() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'banco'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [callback] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.bancos = callback;

      if (this.bancos.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Bancos Creados',
          duration: 1500,
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
  }


  async crearBanco() {
    const alert = await this.alertController.create({
      header: 'Agregar un Nuevo Banco',
      message: 'Rellena todos los campos para agregar el nuevo banco.',
      inputs: [
        {
          name: 'nombre_banco',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Nombre del Banco',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            this.utilsSvc.presentToast({
              message: 'Cancelaste la acción',
              duration: 1500,
              color: 'primary',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
          },
        },
        {
          text: 'Agregar',
          role: 'confirm',
          handler: async (bancoNuevo) => {
            if (bancoNuevo.nombre_banco == "") {
              this.utilsSvc.presentToast({
                message: 'Debes agregar un nombre al banco',
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
                nombre_banco: bancoNuevo.nombre_banco,
                estado: true,
              }

              // Capturar la imagen
              const dataUrl = (await this.utilsSvc.takePicture('Logo del Banco')).dataUrl;

              if (dataUrl) {
                await this.firebaseSvc.addDocumentWithId('banco', datoNuevo, this.uniqueId);

                let path = `banco/${this.uniqueId}`;
                let imagePath = `banco/${this.uniqueId}/${Date.now()}`;
                let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                // Actualizar el documento en Firestore con la URL de la imagen
                await this.firebaseSvc.setDocument(path, { ...datoNuevo, img_banco: imageUrl });

                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'Banco creado con éxito',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                // Actualizar la lista de bancos
                await this.getBancos();
              }
            } catch (error) {
              console.error('Error al crear banco:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear el banco. Inténtalo de nuevo.',
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


  async modificarBanco(banco: any) {
    const alert = await this.alertController.create({
      header: 'Modificar Banco',
      message:`Rellena todos los campos para modificar ${banco.nombre_banco}.`,
      inputs: [
        {
          name: 'nombre_banco',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Nombre del Banco',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            this.utilsSvc.presentToast({
              message: 'Cancelaste la acción',
              duration: 1500,
              color: 'primary',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
          },
        },
        {
          text: 'Agregar',
          role: 'confirm',
          handler: async (bancoNuevo) => {
            if (bancoNuevo.nombre_banco == "") {
              this.utilsSvc.presentToast({
                message: 'Debes agregar un nombre al banco',
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
              // Capturar la imagen
              const dataUrl = (await this.utilsSvc.takePicture('Logo del Banco')).dataUrl;
              if (dataUrl) {
                let imagePath = await this.firebaseSvc.getFilePath(banco.img_usuario);
                let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                const datoModificado = {
                  nombre_banco: bancoNuevo.nombre_banco,
                  img_banco: imageUrl
                }  
                // Actualizar el documento en Firestore con la URL de la imagen
                await this.firebaseSvc.updateDocument(`banco/${banco.id}`, {...banco, datoModificado});

                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'Banco creado con éxito',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                // Actualizar la lista de bancos
                await this.getBancos();
              }
            } catch (error) {
              console.error('Error al crear banco:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear el banco. Inténtalo de nuevo.',
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

  async eliminarBanco(banco: any) {
    const alert = await this.alertController.create({
      header: '¿Seguro de eliminar el banco?',
      subHeader: `Se eliminará al banco con nombre: ${banco.nombre_banco}`,
      message: 'Recuerda que si aceptas, esta opción es irreversible.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.utilsSvc.presentToast({
              message: 'Cancelaste la acción',
              duration: 1500,
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
              //await this.firebaseSvc.deleteDocument(`banco/${banco.id}`);
              //En vez de eliminarlo se pone como estado 0, porque si lo eliminamos, y llegasen a existir datos con un banco, al eliminarlo causará
              //un error a escala!
              await this.firebaseSvc.updateDocument(`banco/${banco.id}`, {...banco, estado: false});
              this.utilsSvc.presentToast({
                message: `Has eliminado el banco ${banco.nombre_banco}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getBancos();
            } catch (error) {
              console.error('Error al eliminar banco:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al eliminar el banco con nombre ${banco.nombre_banco}. Inténtalo de nuevo.`,
                duration: 1500,
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
