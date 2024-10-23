import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';
import { Pais } from 'src/app/models/pais';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.page.html',
  styleUrls: ['./paises.page.scss'],
})
export class PaisesPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  paises!: Pais[];
  private uniqueId = '';

  constructor(private router: Router, private alertController: AlertController) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    await this.getData();
  }


  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'pais'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [callback] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<Pais[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.paises = callback;

      if (this.paises.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Paises Creados',
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


  async crear() {
    const alert = await this.alertController.create({
      header: 'Agregar un Nuevo Dato',
      message: 'Rellena todos los campos para agregar el nuevo dato.',
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa el Nombre del País',
        },
        {
          name: 'nombre_nacionalidad',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa la Nacionalidad (EJ: Chilena)',
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
          handler: async (dato) => {
            if (dato.nombre_dato == "") {
              this.utilsSvc.presentToast({
                message: 'No puedes dejar datos vacíos',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            if (dato.nombre_nacionalidad == "") {
              this.utilsSvc.presentToast({
                message: 'No puedes dejar datos vacíos',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            const existe = await this.verificarExistente(dato.nombre_dato);
            const existe2 = await this.verificarExistente(dato.nombre_nacionalidad);

            if (existe) {
              this.utilsSvc.presentToast({
                message: 'Ya existe un País con ese nombre',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            if (existe2) {
              this.utilsSvc.presentToast({
                message: 'Ya existe un País con esa Nacionalidad',
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
                nombre_pais: dato.nombre_dato,
                nacionalidad_pais: dato.nombre_nacionalidad,
                estado: true,
              }

              // Capturar la imagen
              const dataUrl = (await this.utilsSvc.takePicture('Bandera del País')).dataUrl;

              if (dataUrl) {
                await this.firebaseSvc.addDocumentWithId('pais', datoNuevo, this.uniqueId);

                let path = `pais/${this.uniqueId}`;
                let imagePath = `pais/${this.uniqueId}/${Date.now()}`;
                let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                // Actualizar el documento en Firestore con la URL de la imagen
                await this.firebaseSvc.setDocument(path, { ...datoNuevo, bandera_pais: imageUrl });

                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'País creado con éxito',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                // Actualizar la lista de bancos
                await this.getData();
              }
            } catch (error) {
              console.error('Error al crear el país:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear el país. Inténtalo de nuevo.',
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


  async modificar(pais: any) {
    const alert = await this.alertController.create({
      header: 'Modificar País',
      message: `Rellena todos los campos para modificar ${pais.nombre_pais}.`,
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa el Nombre del País',
          value: pais.nombre_pais
        },
        {
          name: 'nombre_nacionalidad',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa la Nacionalidad (EJ: Chilena)',
          value: pais.nacionalidad_pais
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
          handler: async (dato) => {
            if (dato.nombre_dato == "") {
              this.utilsSvc.presentToast({
                message: 'No puedes dejar datos vacíos',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            if (dato.nombre_nacionalidad == "") {
              this.utilsSvc.presentToast({
                message: 'No puedes dejar datos vacíos',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            const existe = await this.verificarExistente(dato.nombre_dato);
            if (existe) {
              this.utilsSvc.presentToast({
                message: 'Ya existe un País con ese nombre',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            const existe2 = await this.verificarExistente(dato.nombre_nacionalidad);
            if (existe2) {
              this.utilsSvc.presentToast({
                message: 'Ya existe un País con esa Nacionalidad',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            // Si el usuario selecciona "No", solo se actualizan los datos sin cambiar la imagen
            const datoModificado = {
              nombre_pais: dato.nombre_dato,
              nacionalidad_pais: dato.nombre_nacionalidad,
              bandera_pais: pais.bandera_pais // Mantiene la imagen original
            };

            // Actualizar el documento en Firestore sin cambiar la imagen
            await this.firebaseSvc.updateDocument(`pais/${pais.id}`, { ...datoModificado });

            // Mostrar un mensaje de éxito
            this.utilsSvc.presentToast({
              message: 'País modificado con éxito',
              duration: 1500,
              color: 'primary',
              position: 'middle',
              icon: 'checkmark-circle-outline'
            });

            // Actualizar la lista de datos
            await this.getData();
          },
        },
      ],
    });

    await alert.present();
  }

  async cambiarFoto(pais: any) {
    // Preguntar si desea cambiar la imagen
    const confirmAlert = await this.alertController.create({
      header: 'Cambiar Imagen',
      message: '¿Deseas cambiar la imagen asociada?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: async () => {
            // Actualizar la lista de datos
            await this.getData();
          }
        },
        {
          text: 'Sí',
          role: 'confirm',
          handler: async () => {
            // Si el usuario selecciona "Sí", permite capturar la nueva imagen
            const dataUrl = (await this.utilsSvc.takePicture('Bandera del País')).dataUrl;

            if (dataUrl) {
              let imagePath = await this.firebaseSvc.getFilePath(pais.bandera_pais);
              let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

              const datoModificado = {
                bandera_pais: imageUrl // Se actualiza la imagen con la nueva URL
              };

              // Mostrar pantalla de carga
              const loading = await this.utilsSvc.loading();
              await loading.present();

              try {
                // Actualizar el documento en Firestore con la nueva URL de la imagen
                await this.firebaseSvc.updateDocument(`pais/${pais.id}`, { ...datoModificado });
                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'Imagen Asociada Actualizada',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                // Actualizar la lista de datos
                await this.getData();
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
            }
          }
        }]
    });

    await confirmAlert.present();
  }

  async cambiarEstado(pais: any) {
    let titulo = '';
    if (pais.estado) {
      titulo = 'Desactivar'
    } else {
      titulo = 'Activar'
    }
    const alert = await this.alertController.create({
      header: `¿Seguro de ${titulo} el pais?`,
      subHeader: `Se cambiará el estado al País con nombre: ${pais.nombre_pais}`,
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
              if (pais.estado) {
                await this.firebaseSvc.updateDocument(`pais/${pais.id}`, { ...pais, estado: false });
              } else {
                await this.firebaseSvc.updateDocument(`pais/${pais.id}`, { ...pais, estado: true });
              }
              this.utilsSvc.presentToast({
                message: `Cambio realizado para el País ${pais.nombre_pais}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getData();
            } catch (error) {
              console.error('Error al cambiar el estado País:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al realizar el cambio en el País con nombre ${pais.nombre_pais}. Inténtalo de nuevo.`,
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
      if (this.paises.some(callback => callback.nombre_pais.toLowerCase() === dato.toLowerCase())) {
        return true;
      }
      if (this.paises.some(callback => callback.nacionalidad_pais.toLowerCase() === dato.toLowerCase())) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al verificar si el dato ya existe:', error);
      return false;
    }
  }

}
