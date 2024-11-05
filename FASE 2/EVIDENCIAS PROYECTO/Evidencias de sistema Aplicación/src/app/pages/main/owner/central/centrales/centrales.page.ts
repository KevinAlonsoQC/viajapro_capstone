import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';
import { CentralColectivo } from 'src/app/models/central-colectivo';
import { Comuna } from 'src/app/models/comuna';

@Component({
  selector: 'app-centrales',
  templateUrl: './centrales.page.html',
  styleUrls: ['./centrales.page.scss'],
})
export class CentralesPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  centrales!: CentralColectivo[];
  comunas!: Comuna[];
  presidentes!: User;


  private uniqueId = '';
  private comunaSeleccionada = '';

  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    await this.getCentrales();
  }


  async getCentrales() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'central_colectivo'; // Ruta de la colección de usuarios
    const urlPath2 = 'comuna'; // Ruta de la colección de usuarios
    const urlPath3 = 'usuario'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [callback, callback2, callback3] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<CentralColectivo[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<Comuna[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath3) as Promise<any>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.centrales = callback;
      this.comunas = callback2;
      this.presidentes = callback3.filter(usuario => usuario.tipo_usuario == '1'); //1, porque el tipo de usuario 1 es de los presidentes/administradores


      if (this.centrales.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Centrales Creadas',
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

  async presentSelectComuna() {
    const alert = await this.alertController.create({
      header: 'Selecciona Una Comuna',
      inputs: this.comunas.map(comuna => ({
        type: 'radio',
        label: comuna.nombre_comuna,
        value: comuna.id,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Seleccionar',
          handler: (comunaId) => {
            // Asigna el país seleccionado
            this.comunaSeleccionada = comunaId;
            console.log('Comuna seleccionado:', comunaId);
          }
        }
      ]
    });

    await alert.present();
  }

  async detalles(central: any) {
    this.router.navigate(['/main/owner/central/centrales/detalle-central', central.id]);
  }

  async crear() {
    const alert = await this.alertController.create({
      header: 'Agregar una nueva Central',
      message: 'Rellena todos los campos para agregar la nueva Central de Colectivos.',
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Nombre de la Central de Colectivos',
        },
        {
          name: 'tarifa_diurna',
          type: 'number',
          min: 1,
          max: 5000,
          placeholder: 'Tarifa Diurna de Central',
        },
        {
          name: 'tarifa_nocturna',
          type: 'number',
          min: 1,
          max: 5000,
          placeholder: 'Tarifa Nocturna de Central',
        },
      ],
      buttons: [
        {
          text: 'Seleccionar Comuna',
          handler: () => {
            // Abrir el ion-select para seleccionar el país
            this.presentSelectComuna();
            return false; // Evitar que el alert se cierre al presionar este botón
          }
        },
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
                message: 'Debes agregar un nombre a la Central',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }
            if (dato.tarifa_diurna == "" || dato.tarifa_diurna == undefined || dato.tarifa_diurna == null) {
              this.utilsSvc.presentToast({
                message: 'Debes agregar una tarifa diurna a la Central',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }
            if (dato.tarifa_nocturna == "" || dato.tarifa_nocturna == undefined || dato.tarifa_nocturna == null) {
              this.utilsSvc.presentToast({
                message: 'Debes agregar una tarifa nocturna a la Central',
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
                message: 'Ya existe una Central de Colectivos con ese nombre',
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
                nombre_central: dato.nombre_dato,
                tarifa_diurna_central: Number(dato.tarifa_diurna),
                tarifa_nocturna_central: Number(dato.tarifa_nocturna),
                comuna: this.comunaSeleccionada,
                estado: true,
              }

              // Capturar la imagen
              const dataUrl = (await this.utilsSvc.takePicture('Logo de Central')).dataUrl;

              if (dataUrl) {
                await this.firebaseSvc.addDocumentWithId('central_colectivo', datoNuevo, this.uniqueId);

                let path = `central_colectivo/${this.uniqueId}`;
                let imagePath = `central_colectivo/${this.uniqueId}/${Date.now()}`;
                let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                // Actualizar el documento en Firestore con la URL de la imagen
                await this.firebaseSvc.setDocument(path, { ...datoNuevo, img_central: imageUrl });

                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'Central de Colectivos creada con éxito',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                // Actualizar la lista de bancos
                await this.getCentrales();
              }
            } catch (error) {
              console.error('Error al crear la Central de Colectivos:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear la Central de Colectivos. Inténtalo de nuevo.',
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

  async modificar(central: any) {
    const alert = await this.alertController.create({
      header: 'Modificar Central de Colectivos',
      message: `Rellena todos los campos para modificar ${central.nombre_central}.`,
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Nombre del Banco',
          value: central.nombre_central
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
            if (dato.nombre_central == "") {
              this.utilsSvc.presentToast({
                message: 'Debes agregar un nombre a la Central de Colectivos',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }
            const existe = await this.verificarExistente(dato.nombre_central);
            if (existe) {
              this.utilsSvc.presentToast({
                message: 'Ya existe una Central de Colectivos con ese nombre',
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
                        nombre_central: dato.nombre_central,
                      }

                      // Actualizar el documento en Firestore sin cambiar la imagen
                      await this.firebaseSvc.updateDocument(`central_colectivo/${central.id}`, { ...datoModificado });

                      // Mostrar un mensaje de éxito
                      this.utilsSvc.presentToast({
                        message: 'Central de Colectivos modificada con éxito',
                        duration: 1500,
                        color: 'primary',
                        position: 'middle',
                        icon: 'checkmark-circle-outline'
                      });

                      // Actualizar la lista de datos
                      await this.getCentrales();
                    }
                  },
                  {
                    text: 'Sí',
                    role: 'confirm',
                    handler: async () => {
                      // Si el usuario selecciona "Sí", permite capturar la nueva imagen
                      const dataUrl = (await this.utilsSvc.takePicture('Logo de Central')).dataUrl;

                      if (dataUrl) {
                        let imagePath = await this.firebaseSvc.getFilePath(central.img_central);
                        let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                        const datoModificado = {
                          nombre_banco: dato.nombre_central,
                          img_banco: imageUrl // Se actualiza la imagen con la nueva URL
                        };

                        // Actualizar el documento en Firestore con la nueva URL de la imagen
                        await this.firebaseSvc.updateDocument(`central_colectivo/${central.id}`, { ...datoModificado });

                        // Mostrar un mensaje de éxito
                        this.utilsSvc.presentToast({
                          message: 'Central de Colectivos modificada con éxito e Imagen actualizada',
                          duration: 1500,
                          color: 'primary',
                          position: 'middle',
                          icon: 'checkmark-circle-outline'
                        });

                        // Actualizar la lista de datos
                        await this.getCentrales();
                      }
                    }
                  }
                ]
              });

              await confirmAlert.present();

            } catch (error) {
              console.error('Error al modificar la Central de Colectivos:', error);
              this.utilsSvc.presentToast({
                message: 'Hubo un error al modificar la Central de Colectivos. Inténtalo de nuevo.',
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

  async estado(central: any) {
    let titulo = '';
    if (central.estado) {
      titulo = 'Desactivar'
    } else {
      titulo = 'Activar'
    }
    const alert = await this.alertController.create({
      header: `¿Seguro de ${titulo} la central?`,
      subHeader: `Se cambiará el estado la central con nombre: ${central.nombre_central}`,
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
              if (central.estado) {
                await this.firebaseSvc.updateDocument(`central_colectivo/${central.id}`, { ...central, estado: false });
              } else {
                await this.firebaseSvc.updateDocument(`central_colectivo/${central.id}`, { ...central, estado: true });
              }
              this.utilsSvc.presentToast({
                message: `Cambio realizado para la Central de Colectivos ${central.nombre_central}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getCentrales();
            } catch (error) {
              console.error('Error al cambiar el estado de la central de colectivos:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al realizar el cambio a la Central de Colectivos con nombre ${central.nombre_central}. Inténtalo de nuevo.`,
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
      return this.centrales.some(callback => callback.nombre_central.toLowerCase() === dato.toLowerCase());
    } catch (error) {
      console.error('Error al verificar si el dato ya existe:', error);
      return false;
    }
  }

}
