import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';
import { Banco } from 'src/app/models/banco';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.page.html',
  styleUrls: ['./bancos.page.scss'],
})
export class BancosPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  bancos!: Banco[];
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
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<Banco[]>
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
            const existe = await this.verificarExistente(bancoNuevo.nombre_banco);
            if (existe) {
              this.utilsSvc.presentToast({
                message: 'Ya existe un banco con ese nombre',
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
      message: `Rellena todos los campos para modificar ${banco.nombre_banco}.`,
      inputs: [
        {
          name: 'nombre_banco',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Nombre del Banco',
          value: banco.nombre_banco
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
          text: 'Modificar',
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
            const existe = await this.verificarExistente(bancoNuevo.nombre_banco);
            if (existe) {
              this.utilsSvc.presentToast({
                message: 'Ya existe un banco con ese nombre',
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
              // Preguntar si desea cambiar la imagen
              const confirmAlert = await this.alertController.create({
                header: 'Cambiar Imagen',
                message: '¿Deseas cambiar la imagen asociada?',
                buttons: [
                  {
                    text: 'No',
                    role: 'cancel',
                    handler: async () => {
                      // Si el usuario selecciona "No", solo se actualizan los datos sin cambiar la imagen
                      const datoModificado = {
                        nombre_banco: bancoNuevo.nombre_banco,
                      }

                      // Actualizar el documento en Firestore sin cambiar la imagen
                      await this.firebaseSvc.updateDocument(`banco/${banco.id}`, { ...datoModificado });

                      // Mostrar un mensaje de éxito
                      this.utilsSvc.presentToast({
                        message: 'Banco modificado con éxito',
                        duration: 1500,
                        color: 'primary',
                        position: 'middle',
                        icon: 'checkmark-circle-outline'
                      });

                      // Actualizar la lista de datos
                      await this.getBancos();
                    }
                  },
                  {
                    text: 'Sí',
                    role: 'confirm',
                    handler: async () => {
                      // Si el usuario selecciona "Sí", permite capturar la nueva imagen
                      const dataUrl = (await this.utilsSvc.takePicture('Logo del Banco')).dataUrl;

                      if (dataUrl) {
                        let imagePath = await this.firebaseSvc.getFilePath(banco.img_banco);
                        let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                        const datoModificado = {
                          nombre_banco: bancoNuevo.nombre_banco,
                          img_banco: imageUrl // Se actualiza la imagen con la nueva URL
                        };

                        // Actualizar el documento en Firestore con la nueva URL de la imagen
                        await this.firebaseSvc.updateDocument(`banco/${banco.id}`, { ...datoModificado });

                        // Mostrar un mensaje de éxito
                        this.utilsSvc.presentToast({
                          message: 'Banco modificado con éxito e Imagen actualizada',
                          duration: 1500,
                          color: 'primary',
                          position: 'middle',
                          icon: 'checkmark-circle-outline'
                        });

                        // Actualizar la lista de datos
                        await this.getBancos();
                      }
                    }
                  }
                ]
              });

              await confirmAlert.present();

            } catch (error) {
              console.error('Error al modificar el Banco:', error);
              this.utilsSvc.presentToast({
                message: 'Hubo un error al modificar el Banco. Inténtalo de nuevo.',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
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

  async estadoBanco(banco: any) {
    let titulo = '';
    if (banco.estado) {
      titulo = 'Desactivar'
    } else {
      titulo = 'Activar'
    }
    const alert = await this.alertController.create({
      header: `¿Seguro de ${titulo} el banco?`,
      subHeader: `Se cambiará el estado al banco con nombre: ${banco.nombre_banco}`,
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
          text: titulo,
          role: 'confirm',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {
              // Elimina el documento de Firebase
              //await this.firebaseSvc.deleteDocument(`banco/${banco.id}`);
              //En vez de eliminarlo se pone como estado 0, porque si lo eliminamos, y llegasen a existir datos con un banco, al eliminarlo causará
              //un error a escala!
              if (banco.estado) {
                await this.firebaseSvc.updateDocument(`banco/${banco.id}`, { ...banco, estado: false });
              } else {
                await this.firebaseSvc.updateDocument(`banco/${banco.id}`, { ...banco, estado: true });
              }
              this.utilsSvc.presentToast({
                message: `Cambio realizado para el banco ${banco.nombre_banco}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getBancos();
            } catch (error) {
              console.error('Error al cambiar el estado banco:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al realizar el cambio en el banco con nombre ${banco.nombre_banco}. Inténtalo de nuevo.`,
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

  async verificarExistente(dato: string): Promise<boolean> {
    try {
      return this.bancos.some(callback => callback.nombre_banco.toLowerCase() === dato.toLowerCase());
    } catch (error) {
      console.error('Error al verificar si el dato ya existe:', error);
      return false;
    }
  }

}
